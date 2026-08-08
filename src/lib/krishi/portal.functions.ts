import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

/* ------------------------------------------------------------------ */
/* Session + roles                                                      */
/* ------------------------------------------------------------------ */

export const getMySession = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [profile, roles] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);
    return {
      userId,
      profile: profile.data,
      roles: (roles.data ?? []).map((r) => r.role as string),
    };
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        full_name: z.string().min(1).max(120),
        phone: z.string().max(20).nullable().default(null),
        language: z.enum(["mr", "hi", "en"]),
        village: z.string().max(120).nullable().default(null),
        dpdp_consent: z.boolean(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .update(data)
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    await context.supabase.from("consents").insert({
      user_id: context.userId,
      purpose: "dpdp_data_processing",
      granted: data.dpdp_consent,
    });
    return { ok: true };
  });

/* ------------------------------------------------------------------ */
/* STEP 2 — Confirm. The only place a shipment is written.              */
/* ------------------------------------------------------------------ */

const confirmSchema = z.object({
  cropId: z.string().uuid(),
  mandiId: z.string().uuid(),
  villageName: z.string().min(1).max(120),
  lat: z.number(),
  lng: z.number(),
  weightKg: z.number().min(1).max(20000),
  distanceKm: z.number().min(0),
  mode: z.enum(["POOLED", "SOLO"]),
  grossPayout: z.number(),
  freightShare: z.number(),
  platformFee: z.number(),
  netPayout: z.number(),
  emergency: z.boolean().default(false),
  spoilageDeadlineIso: z.string(),
});

export const confirmShipment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => confirmSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    let poolId: string | null = null;
    if (data.mode === "POOLED") {
      const { data: existing } = await supabase
        .from("pools")
        .select("id, total_weight_kg")
        .eq("crop_id", data.cropId)
        .eq("mandi_id", data.mandiId)
        .eq("status", "OPEN")
        .limit(1)
        .maybeSingle();

      if (existing) {
        poolId = existing.id;
        await supabase
          .from("pools")
          .update({ total_weight_kg: Number(existing.total_weight_kg) + data.weightKg })
          .eq("id", existing.id);
      } else {
        const { data: created, error } = await supabase
          .from("pools")
          .insert({
            crop_id: data.cropId,
            mandi_id: data.mandiId,
            center_lat: data.lat,
            center_lng: data.lng,
            total_weight_kg: data.weightKg,
            total_freight: data.freightShare,
            status: "OPEN",
            closes_at: new Date(Date.now() + 3 * 3_600_000).toISOString(),
          })
          .select("id")
          .single();
        if (error) throw new Error(error.message);
        poolId = created.id;
      }
    }

    const { data: shipment, error } = await supabase
      .from("shipment_requests")
      .insert({
        farmer_id: userId,
        crop_id: data.cropId,
        mandi_id: data.mandiId,
        pool_id: poolId,
        village_name: data.villageName,
        pickup_lat: data.lat,
        pickup_lng: data.lng,
        weight_kg: data.weightKg,
        distance_km: data.distanceKm,
        mode: data.mode,
        gross_payout: data.grossPayout,
        freight_share: data.freightShare,
        platform_fee: data.platformFee,
        net_payout: data.netPayout,
        emergency: data.emergency,
        status: data.mode === "POOLED" ? "POOLED" : "SOLO_CONFIRMED",
        spoilage_deadline: data.spoilageDeadlineIso,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);

    const token = `KY-${shipment.id.slice(0, 8).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    await supabase.from("handover_tokens").insert({ shipment_id: shipment.id, token });

    await supabase.from("audit_log").insert({
      actor_id: userId,
      action: "shipment.confirmed",
      entity: "shipment_requests",
      entity_id: shipment.id,
      detail: { mode: data.mode, weight_kg: data.weightKg, net_payout: data.netPayout },
      lat: data.lat,
      lng: data.lng,
    });

    return { shipment, handoverToken: token, poolId };
  });

export const listMyShipments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("shipment_requests")
      .select("*, crops(name_en, name_mr, name_hi), mandis(name, code)")
      .eq("farmer_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const cancelShipment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("shipment_requests")
      .update({ status: "CANCELLED" })
      .eq("id", data.id)
      .eq("farmer_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });