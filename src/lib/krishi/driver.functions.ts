import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

/** Driver profile + KYC state for the driver cockpit. */
export const getDriverProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: driver } = await supabase
      .from("drivers")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (!driver) return { driver: null, kyc: [], vehicles: [] };
    const [kyc, vehicles] = await Promise.all([
      supabase.from("driver_kyc").select("*").eq("driver_id", driver.id),
      supabase.from("vehicles").select("*, vehicle_types(*)").eq("driver_id", driver.id),
    ]);
    return { driver, kyc: kyc.data ?? [], vehicles: vehicles.data ?? [] };
  });

export const upsertDriverProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        full_name: z.string().min(2).max(120),
        phone: z.string().min(6).max(20),
        license_number: z.string().min(4).max(40),
        home_lat: z.number(),
        home_lng: z.number(),
        radius_km: z.number().min(1).max(200),
        night_mode: z.boolean(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: existing } = await supabase
      .from("drivers")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase.from("drivers").update(data).eq("id", existing.id);
      if (error) throw new Error(error.message);
      return { id: existing.id };
    }
    const { data: created, error } = await supabase
      .from("drivers")
      .insert({ ...data, user_id: userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: created.id };
  });

/** Loads available to a KYC-approved driver, inside their service radius. */
export const listAvailableLoads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: driver } = await supabase
      .from("drivers")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (!driver || driver.kyc_status !== "approved") {
      return { blocked: true, reason: driver ? driver.kyc_status : "missing", loads: [] };
    }
    const { data } = await supabase
      .from("shipment_requests")
      .select("*, crops(name_en, spoilage_hours), mandis(name, code, lat, lng)")
      .in("status", ["POOLED", "SOLO_CONFIRMED"])
      .order("emergency", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(40);

    const { haversineKm } = await import("./geo");
    const loads = (data ?? []).filter(
      (row) =>
        haversineKm(
          { lat: driver.home_lat ?? 0, lng: driver.home_lng ?? 0 },
          { lat: row.pickup_lat, lng: row.pickup_lng },
        ) <= (driver.radius_km ?? 40),
    );
    return { blocked: false, reason: null, loads };
  });

export const acceptLoad = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        shipmentId: z.string().uuid(),
        vehicleId: z.string().uuid().nullable().default(null),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: driver } = await supabase
      .from("drivers")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (!driver || driver.kyc_status !== "approved") throw new Error("KYC approval required");

    const { data: shipment, error: shipErr } = await supabase
      .from("shipment_requests")
      .select("*")
      .eq("id", data.shipmentId)
      .maybeSingle();
    if (shipErr || !shipment) throw new Error("Load no longer available");

    const { data: trip, error } = await supabase
      .from("trips")
      .insert({
        driver_id: driver.id,
        vehicle_id: data.vehicleId,
        company_id: driver.company_id,
        pool_id: shipment.pool_id,
        mandi_id: shipment.mandi_id,
        status: "PLANNED",
        total_distance_km: shipment.distance_km,
        total_weight_kg: shipment.weight_kg,
        gross_freight: shipment.freight_share,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);

    await supabase
      .from("shipment_requests")
      .update({ status: "ASSIGNED" })
      .eq("id", data.shipmentId);
    await supabase.from("trip_stops").insert([
      {
        trip_id: trip.id,
        shipment_id: shipment.id,
        sequence: 1,
        label: `Pickup — ${shipment.village_name}`,
        lat: shipment.pickup_lat,
        lng: shipment.pickup_lng,
        leg_km: 0,
      },
    ]);
    await supabase.from("audit_log").insert({
      actor_id: userId,
      action: "trip.accepted",
      entity: "trips",
      entity_id: trip.id,
      detail: { shipment_id: shipment.id },
    });
    return trip;
  });

export const listMyTrips = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: driver } = await supabase
      .from("drivers")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    if (!driver) return [];
    const { data } = await supabase
      .from("trips")
      .select("*, mandis(name, code), trip_stops(*)")
      .eq("driver_id", driver.id)
      .order("created_at", { ascending: false })
      .limit(30);
    return data ?? [];
  });

export const updateTripStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        tripId: z.string().uuid(),
        status: z.enum(["PLANNED", "ACTIVE", "COMPLETED", "CANCELLED"]),
        proofLat: z.number().nullable().default(null),
        proofLng: z.number().nullable().default(null),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const patch = {
      status: data.status,
      ...(data.status === "ACTIVE" ? { started_at: new Date().toISOString() } : {}),
      ...(data.status === "COMPLETED"
        ? {
            completed_at: new Date().toISOString(),
            proof_lat: data.proofLat,
            proof_lng: data.proofLng,
          }
        : {}),
    };
    const { error } = await supabase.from("trips").update(patch).eq("id", data.tripId);
    if (error) throw new Error(error.message);
    await supabase.from("audit_log").insert({
      actor_id: userId,
      action: `trip.${data.status.toLowerCase()}`,
      entity: "trips",
      entity_id: data.tripId,
      detail: {},
      lat: data.proofLat,
      lng: data.proofLng,
    });
    return { ok: true };
  });

/** Scan a farmer handover QR token and mark custody transfer. */
export const redeemHandoverToken = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ token: z.string().min(6).max(64) }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row } = await supabase
      .from("handover_tokens")
      .select("*")
      .eq("token", data.token.trim().toUpperCase())
      .maybeSingle();
    if (!row) throw new Error("Invalid handover code");
    if (row.scanned_at) throw new Error("This handover code was already used");
    await supabase
      .from("handover_tokens")
      .update({ scanned_at: new Date().toISOString(), scanned_by: userId })
      .eq("id", row.id);
    await supabase
      .from("shipment_requests")
      .update({ status: "IN_TRANSIT" })
      .eq("id", row.shipment_id);
    return { ok: true, shipmentId: row.shipment_id };
  });