import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const getMyFleet = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: company } = await supabase
      .from("fleet_companies")
      .select("*")
      .eq("owner_id", userId)
      .maybeSingle();
    if (!company) return { company: null, vehicles: [], drivers: [], trips: [], payouts: [] };

    const [vehicles, drivers, trips, payouts] = await Promise.all([
      supabase.from("vehicles").select("*, vehicle_types(*)").eq("company_id", company.id),
      supabase.from("drivers").select("*").eq("company_id", company.id),
      supabase
        .from("trips")
        .select("*, mandis(name)")
        .eq("company_id", company.id)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("payouts")
        .select("*")
        .eq("company_id", company.id)
        .order("created_at", { ascending: false })
        .limit(50),
    ]);
    return {
      company,
      vehicles: vehicles.data ?? [],
      drivers: drivers.data ?? [],
      trips: trips.data ?? [],
      payouts: payouts.data ?? [],
    };
  });

export const registerFleet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        name: z.string().min(2).max(120),
        tax_id: z.string().min(1).max(40),
        contact_phone: z.string().max(20).nullable().default(null),
        base_taluka: z.string().max(80).nullable().default(null),
        geofence_radius_km: z.number().min(1).max(500),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: created, error } = await context.supabase
      .from("fleet_companies")
      .insert({ ...data, owner_id: context.userId })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return created;
  });

export const addVehicle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        companyId: z.string().uuid().nullable().default(null),
        vehicleTypeId: z.string().uuid(),
        registration: z.string().min(4).max(20),
        odometerKm: z.number().min(0),
        observedKmpl: z.number().min(1).max(60),
        axleHealth: z.enum(["good", "watch", "service_due"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: created, error } = await context.supabase
      .from("vehicles")
      .insert({
        owner_id: context.userId,
        company_id: data.companyId,
        vehicle_type_id: data.vehicleTypeId,
        registration: data.registration.toUpperCase(),
        odometer_km: data.odometerKm,
        observed_kmpl: data.observedKmpl,
        axle_health: data.axleHealth,
        active: true,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return created;
  });

export const logMaintenance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        vehicleId: z.string().uuid(),
        note: z.string().min(2).max(400),
        odometerKm: z.number().min(0),
        cost: z.number().min(0),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("maintenance_logs").insert({
      vehicle_id: data.vehicleId,
      note: data.note,
      odometer_km: data.odometerKm,
      cost: data.cost,
    });
    if (error) throw new Error(error.message);
    await context.supabase
      .from("vehicles")
      .update({ last_service_at: new Date().toISOString(), odometer_km: data.odometerKm })
      .eq("id", data.vehicleId);
    return { ok: true };
  });