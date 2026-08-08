import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!data) throw new Error("Forbidden — administrator role required");
}

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabase } = context;
    const [shipments, trips, kyc, fallback, audit, config, prices] = await Promise.all([
      supabase
        .from("shipment_requests")
        .select("*, crops(name_en), mandis(name)")
        .order("created_at", { ascending: false })
        .limit(100),
      supabase.from("trips").select("*").order("created_at", { ascending: false }).limit(100),
      supabase
        .from("driver_kyc")
        .select("*, drivers(full_name, phone, kyc_status)")
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("api_fallback_stats")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50),
      supabase.from("audit_log").select("*").order("created_at", { ascending: false }).limit(80),
      supabase.from("commission_config").select("*").eq("id", 1).maybeSingle(),
      supabase.from("mandi_prices").select("*, mandis(name), crops(name_en)").limit(200),
    ]);
    return {
      shipments: shipments.data ?? [],
      trips: trips.data ?? [],
      kyc: kyc.data ?? [],
      fallback: fallback.data ?? [],
      audit: audit.data ?? [],
      config: config.data,
      prices: prices.data ?? [],
    };
  });

export const reviewKyc = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        driverId: z.string().uuid(),
        decision: z.enum(["approved", "rejected"]),
        reason: z.string().max(300).nullable().default(null),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabase, userId } = context;
    await supabase
      .from("drivers")
      .update({ kyc_status: data.decision, rejection_reason: data.reason })
      .eq("id", data.driverId);
    await supabase
      .from("driver_kyc")
      .update({ status: data.decision, reviewed_by: userId, reviewed_at: new Date().toISOString() })
      .eq("driver_id", data.driverId);
    await supabase.from("audit_log").insert({
      actor_id: userId,
      action: `kyc.${data.decision}`,
      entity: "drivers",
      entity_id: data.driverId,
      detail: { reason: data.reason },
    });
    return { ok: true };
  });

export const updateCommission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        ratePercent: z.number().min(3).max(5),
        dieselPrice: z.number().min(40).max(250),
        petrolPrice: z.number().min(40).max(300),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("commission_config")
      .update({
        rate_percent: data.ratePercent,
        diesel_price: data.dieselPrice,
        petrol_price: data.petrolPrice,
        updated_by: context.userId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);
    if (error) throw new Error(error.message);
    await context.supabase.from("audit_log").insert({
      actor_id: context.userId,
      action: "config.updated",
      entity: "commission_config",
      entity_id: "1",
      detail: data,
    });
    return { ok: true };
  });

export const overrideMandiPrice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), pricePerKg: z.number().min(0.5).max(1000) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("mandi_prices")
      .update({
        price_per_kg: data.pricePerKg,
        source: "admin_override",
        overridden_by: context.userId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });