import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type { CalculationResult, ReferenceData } from "./types";

const calcSchema = z.object({
  cropId: z.string().uuid(),
  weightKg: z.number().min(1).max(20000),
  villageName: z.string().min(1).max(120),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  demoMode: z.boolean().default(true),
  emergency: z.boolean().default(false),
});

export type CalcInput = z.infer<typeof calcSchema>;

/** Public reference data for the farmer calculator (villages, mandis, crops, prices). */
export const getReferenceData = createServerFn({ method: "GET" }).handler(
  async (): Promise<ReferenceData> => {
    const { publicSupabase } = await import("./supabase-public.server");
    const supabase = publicSupabase();

    const [villages, mandis, crops, prices, vehicleTypes, config] = await Promise.all([
      supabase.from("villages").select("*").order("name"),
      supabase.from("mandis").select("*").order("name"),
      supabase.from("crops").select("*").order("name_en"),
      supabase.from("mandi_prices").select("*"),
      supabase.from("vehicle_types").select("*").order("payload_kg"),
      supabase.from("commission_config").select("*").eq("id", 1).maybeSingle(),
    ]);

    return {
      villages: (villages.data ?? []) as ReferenceData["villages"],
      mandis: (mandis.data ?? []) as ReferenceData["mandis"],
      crops: (crops.data ?? []) as ReferenceData["crops"],
      prices: (prices.data ?? []).map((p) => ({ ...p, price_per_kg: Number(p.price_per_kg) })) as ReferenceData["prices"],
      vehicleTypes: (vehicleTypes.data ?? []) as ReferenceData["vehicleTypes"],
      commissionPercent: Number(config.data?.rate_percent ?? 3),
      fuel: {
        diesel: Number(config.data?.diesel_price ?? 99.07),
        petrol: Number(config.data?.petrol_price ?? 112.44),
      },
      demoMode: true,
    };
  },
);

/**
 * STEP 1 of the Calculate -> Confirm workflow.
 * Read-only: produces a quotation with zero database side effects.
 */
export const calculateOptions = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => calcSchema.parse(input))
  .handler(async ({ data }): Promise<CalculationResult> => {
    const { publicSupabase } = await import("./supabase-public.server");
    const { computeOptions } = await import("./pooling.server");
    const { toVehicleProfile, PLATFORM } = await import("./vehicle-select");
    const { DEMO_LOADS } = await import("./demo-data");
    const { haversineKm } = await import("./geo");
    const supabase = publicSupabase();

    const [cropRes, mandiRes, priceRes, vehicleRes, configRes] = await Promise.all([
      supabase.from("crops").select("*").eq("id", data.cropId).maybeSingle(),
      supabase.from("mandis").select("*"),
      supabase.from("mandi_prices").select("*").eq("crop_id", data.cropId),
      supabase.from("vehicle_types").select("*"),
      supabase.from("commission_config").select("*").eq("id", 1).maybeSingle(),
    ]);

    const crop = cropRes.data;
    if (!crop) throw new Error("Unknown crop selected");

    const priceByMandi = new Map<string, number>();
    for (const row of priceRes.data ?? []) {
      priceByMandi.set(row.mandi_id, Number(row.price_per_kg));
    }

    const mandis = (mandiRes.data ?? [])
      .filter((m) => priceByMandi.has(m.id))
      .map((m) => ({
        id: m.id,
        name: m.name,
        code: m.code,
        lat: m.lat,
        lng: m.lng,
        queueMinutes: m.avg_gate_queue_minutes ?? 30,
        pricePerKg: priceByMandi.get(m.id) ?? 0,
      }));

    if (mandis.length === 0) throw new Error("No mandi is currently quoting this crop");

    // Pool partners: live open shipments nearby, plus deterministic demo loads.
    const pickup = { lat: data.lat, lng: data.lng };
    const live = await supabase
      .from("shipment_requests")
      .select("id, village_name, weight_kg, pickup_lat, pickup_lng")
      .eq("crop_id", data.cropId)
      .eq("status", "PENDING_POOL");

    let partners = [
      ...(live.data ?? []).map((row) => ({
        id: row.id,
        village: row.village_name,
        weightKg: Number(row.weight_kg),
        lat: row.pickup_lat,
        lng: row.pickup_lng,
      })),
      ...(data.demoMode
        ? DEMO_LOADS.filter((l) => l.cropSlug === crop.slug).map((l) => ({
            id: l.id,
            village: l.village,
            weightKg: l.weightKg,
            lat: l.lat,
            lng: l.lng,
          }))
        : []),
    ]
      .filter((p) => haversineKm(pickup, { lat: p.lat, lng: p.lng }) <= PLATFORM.poolRadiusKm)
      .slice(0, 5);

    // A pool of one is not a pool: without partners the pooled and solo columns
    // are numerically identical and the comparison is meaningless. In demo mode
    // we synthesise deterministic neighbouring loads of the same crop so the
    // shared-truck economics are always demonstrable.
    if (data.demoMode && partners.length === 0) {
      const spread = [
        { village: `${data.villageName} Wasti`, dLat: 0.011, dLng: 0.009, factor: 0.9 },
        { village: `${data.villageName} Phata`, dLat: -0.009, dLng: 0.013, factor: 1.35 },
        { village: `${data.villageName} Mala`, dLat: 0.007, dLng: -0.014, factor: 0.8 },
      ];
      partners = spread.map((s, index) => ({
        id: `demo-neighbour-${index + 1}`,
        village: s.village,
        weightKg: Math.max(120, Math.round((data.weightKg * s.factor) / 10) * 10),
        lat: data.lat + s.dLat,
        lng: data.lng + s.dLng,
      }));
    }

    const vehicles = (vehicleRes.data ?? []).map(toVehicleProfile);

    return computeOptions({
      requestId: "self",
      cropId: crop.id,
      cropName: crop.name_en,
      spoilageHours: crop.spoilage_hours,
      weightKg: data.weightKg,
      village: data.villageName,
      pickup,
      partners,
      mandis,
      vehicles,
      commissionPercent: Number(configRes.data?.rate_percent ?? 3),
      fuel: {
        diesel: Number(configRes.data?.diesel_price ?? 99.07),
        petrol: Number(configRes.data?.petrol_price ?? 112.44),
      },
      demoMode: data.demoMode,
    });
  });