import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { demoReader, publicClient, safe } from "./db.server";
import {
  allocateVehicles,
  etaMinutes,
  nextTripStatus,
  poolSavings,
  costPlan,
  roadDistanceKm,
  spoilageRisk,
  validateAllocation,
  vehicleCost,
} from "./logistics";

import { FALLBACK_CROPS, FALLBACK_MANDIS } from "./constants";

/* ---------------- reads ---------------- */

export const getReference = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const db = publicClient();
    const [crops, mandis, weather, state] = await Promise.all([
      db.from("crops").select("*").order("name"),
      db.from("mandis").select("*").order("name"),
      db.from("weather_snapshots").select("*").eq("recorded_on", new Date().toISOString().slice(0, 10)),
      db.from("system_state").select("*").eq("id", 1).maybeSingle(),
    ]);
    const cropRows = crops.data && crops.data.length > 0 ? crops.data : FALLBACK_CROPS;
    const mandiRows = mandis.data && mandis.data.length > 0 ? mandis.data : FALLBACK_MANDIS;
    const weatherRows = weather.data?.length
      ? weather.data
      : (await db.from("weather_snapshots").select("*")).data ?? [];
    return {
      crops: cropRows,
      mandis: mandiRows,
      weather: weatherRows,
      system: state.data ?? { mode: "real", demo_status: "stopped", demo_tick: 0 },
    };
  } catch (err) {
    console.error("getReference fallback activated:", err);
    return {
      crops: FALLBACK_CROPS,
      mandis: FALLBACK_MANDIS,
      weather: [],
      system: { mode: "real", demo_status: "stopped", demo_tick: 0 },
    };
  }
});

export const getPrices = createServerFn({ method: "GET" })
  .inputValidator((d: { cropId?: string; mandiId?: string }) => d)
  .handler(async ({ data }) => {
    const db = publicClient();
    let q = db.from("market_prices").select("*").order("recorded_on", { ascending: false });
    if (data.cropId) q = q.eq("crop_id", data.cropId);
    if (data.mandiId) q = q.eq("mandi_id", data.mandiId);
    const { data: rows, error } = await q.limit(400);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

/**
 * The demo dashboards below are public (no sign-in). Sensitive operational
 * tables are no longer readable by the anon role, so they are served through
 * the server-only demo reader, always scoped to `dataset = "demo"` and stripped
 * of personal fields before leaving the server.
 */
const DEMO = "demo" as const;

export const getFarmerBoard = createServerFn({ method: "GET" }).handler(async () => {
  const pub = publicClient();
  const db = await demoReader();
  const [farms, shipments, trips, notifications, transactions, prices] = await Promise.all([
    db.from("farms").select("*").eq("dataset", DEMO),
    db.from("shipments").select("*").eq("dataset", DEMO).order("created_at", { ascending: false }),
    db.from("trips").select("*, vehicles(*), drivers(*)").eq("dataset", DEMO),
    db
      .from("notifications")
      .select("*")
      .eq("dataset", DEMO)
      .eq("role", "farmer")
      .order("created_at", { ascending: false }),
    db
      .from("transactions")
      .select("*")
      .eq("dataset", DEMO)
      .eq("role", "farmer")
      .order("created_at", { ascending: false }),
    pub
      .from("market_prices")
      .select("*")
      .eq("recorded_on", new Date().toISOString().slice(0, 10))
      .limit(400),
  ]);
  return {
    farms: safe.farms(farms.data),
    shipments: shipments.data ?? [],
    trips: (trips.data ?? []).map((t: any) => ({
      ...t,
      drivers: t.drivers ? safe.driver(t.drivers) : t.drivers,
    })),
    notifications: safe.userScoped(notifications.data),
    transactions: safe.userScoped(transactions.data),
    prices: prices.data ?? [],
  };
});

export const getDriverBoard = createServerFn({ method: "GET" }).handler(async () => {
  const db = await demoReader();
  const [trips, drivers, vehicles, shipments, events, incidents] = await Promise.all([
    db.from("trips").select("*").eq("dataset", DEMO).order("created_at", { ascending: false }),
    db.from("drivers").select("*").eq("dataset", DEMO).order("name"),
    db.from("vehicles").select("*").eq("dataset", DEMO),
    db.from("shipments").select("*, crops(*), mandis(*), farms(*)").eq("dataset", DEMO),
    db
      .from("trip_events")
      .select("*")
      .eq("dataset", DEMO)
      .order("created_at", { ascending: false })
      .limit(60),
    db
      .from("incidents")
      .select("*")
      .eq("dataset", DEMO)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);
  return {
    trips: trips.data ?? [],
    drivers: safe.drivers(drivers.data),
    vehicles: vehicles.data ?? [],
    shipments: (shipments.data ?? []).map((s: any) => ({
      ...s,
      farms: s.farms ? safe.farms([s.farms])[0] : s.farms,
    })),
    events: events.data ?? [],
    incidents: safe.incidents(incidents.data),
  };
});

export const getFleetBoard = createServerFn({ method: "GET" }).handler(async () => {
  const db = await demoReader();
  const [fleets, vehicles, drivers, maintenance, trips, gps] = await Promise.all([
    db.from("fleets").select("*").eq("dataset", DEMO),
    db.from("vehicles").select("*").eq("dataset", DEMO).order("reg_no"),
    db.from("drivers").select("*").eq("dataset", DEMO).order("name"),
    db.from("maintenance").select("*").eq("dataset", DEMO).order("created_at", { ascending: false }),
    db.from("trips").select("*").eq("dataset", DEMO),
    db
      .from("gps_pings")
      .select("*")
      .eq("dataset", DEMO)
      .order("recorded_at", { ascending: false })
      .limit(200),
  ]);
  return {
    fleets: safe.fleets(fleets.data),
    vehicles: vehicles.data ?? [],
    drivers: safe.drivers(drivers.data),
    maintenance: maintenance.data ?? [],
    trips: trips.data ?? [],
    gps: gps.data ?? [],
  };
});

export const getBuyerBoard = createServerFn({ method: "GET" }).handler(async () => {
  const pub = publicClient();
  const db = await demoReader();
  const [listings, orders, prices] = await Promise.all([
    db
      .from("listings")
      .select("*, crops(*), mandis(*), farms(village,district), shipments(status,quality_grade,harvest_date)")
      .eq("dataset", DEMO)
      .order("created_at", { ascending: false }),
    db
      .from("orders")
      .select("*, crops(*), listings(*)")
      .eq("dataset", DEMO)
      .order("created_at", { ascending: false }),
    pub
      .from("market_prices")
      .select("*")
      .eq("recorded_on", new Date().toISOString().slice(0, 10))
      .limit(400),
  ]);
  return { listings: listings.data ?? [], orders: safe.orders(orders.data), prices: prices.data ?? [] };
});

export const getAdminBoard = createServerFn({ method: "GET" }).handler(async () => {
  const pub = publicClient();
  const db = await demoReader();
  const [
    shipments,
    trips,
    vehicles,
    drivers,
    farms,
    fleets,
    orders,
    listings,
    incidents,
    tickets,
    audit,
    gps,
    state,
    notifications,
  ] = await Promise.all([
    db
      .from("shipments")
      .select("*, crops(name,emoji), mandis(name)")
      .eq("dataset", DEMO)
      .order("created_at", { ascending: false }),
    db.from("trips").select("*").eq("dataset", DEMO),
    db.from("vehicles").select("*").eq("dataset", DEMO),
    db.from("drivers").select("*").eq("dataset", DEMO),
    db.from("farms").select("*").eq("dataset", DEMO),
    db.from("fleets").select("*").eq("dataset", DEMO),
    db.from("orders").select("*").eq("dataset", DEMO).order("created_at", { ascending: false }),
    db.from("listings").select("*").eq("dataset", DEMO),
    db.from("incidents").select("*").eq("dataset", DEMO).order("created_at", { ascending: false }),
    db.from("support_tickets").select("*").eq("dataset", DEMO).order("created_at", { ascending: false }),
    db
      .from("audit_logs")
      .select("*")
      .eq("dataset", DEMO)
      .order("created_at", { ascending: false })
      .limit(50),
    db
      .from("gps_pings")
      .select("*")
      .eq("dataset", DEMO)
      .order("recorded_at", { ascending: false })
      .limit(120),
    pub.from("system_state").select("*").eq("id", 1).maybeSingle(),
    db
      .from("notifications")
      .select("*")
      .eq("dataset", DEMO)
      .order("created_at", { ascending: false })
      .limit(30),
  ]);
  return {
    shipments: shipments.data ?? [],
    trips: trips.data ?? [],
    vehicles: vehicles.data ?? [],
    drivers: safe.drivers(drivers.data),
    farms: safe.farms(farms.data),
    fleets: safe.fleets(fleets.data),
    orders: safe.orders(orders.data),
    listings: listings.data ?? [],
    incidents: safe.incidents(incidents.data),
    tickets: safe.userScoped(tickets.data),
    audit: safe.audit(audit.data),
    gps: gps.data ?? [],
    notifications: safe.userScoped(notifications.data),
    system: state.data ?? { mode: "real", demo_status: "stopped", demo_tick: 0 },
    health: {
      database: "ok" as const,
      api: "ok" as const,
      checkedAt: new Date().toISOString(),
    },
  };
});

/* ---------------- planning (pure compute over live data) ---------------- */

export type ShipmentPlan = Awaited<ReturnType<typeof planShipmentImpl>>;

async function planShipmentImpl(input: {
  cropId: string;
  mandiId: string;
  farmId: string | null;
  origin?: { lat: number; lng: number; district?: string };
  tons: number;
  priority: string;
  pooled: boolean;
}) {
  const pub = publicClient();
  const db = await demoReader();
  const [{ data: crop }, { data: mandi }, { data: farm }, { data: vehicles }, { data: price }] =
    await Promise.all([
      pub.from("crops").select("*").eq("id", input.cropId).maybeSingle(),
      pub.from("mandis").select("*").eq("id", input.mandiId).maybeSingle(),
      input.farmId
        ? db.from("farms").select("lat,lng,district").eq("id", input.farmId).maybeSingle()
        : Promise.resolve({ data: null }),
      db.from("vehicles").select("*").eq("status", "available").eq("dataset", DEMO),
      pub
        .from("market_prices")
        .select("*")
        .eq("crop_id", input.cropId)
        .eq("mandi_id", input.mandiId)
        .order("recorded_on", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  if (!crop || !mandi) throw new Error("Crop or mandi not found");

  const origin = input.origin ??
    (farm ? { lat: farm.lat, lng: farm.lng, district: farm.district } : { lat: 18.52, lng: 73.86, district: "Pune" });
  const km = roadDistanceKm(origin, { lat: mandi.lat, lng: mandi.lng });
  const eta = etaMinutes(km, input.priority);
  const needsCooling = crop.perishability === "high" && km > 250;

  const { allocations, unassignedTons } = allocateVehicles(input.tons, km, vehicles ?? [], {
    needsCooling,
  });
  const soloCost = Math.round(
    vehicleCost(input.tons, km, needsCooling) + 900 * Math.max(0, allocations.length - 1),
  );
  const allocatedCost = allocations.reduce((s, a) => s + a.cost, 0);
  const savings = input.pooled ? poolSavings(allocations) : 0;
  const transportCost = Math.max(0, allocatedCost - savings);

  const { data: weather } = await db
    .from("weather_snapshots")
    .select("*")
    .eq("district", origin.district ?? "Pune")
    .order("recorded_on", { ascending: false })
    .limit(1)
    .maybeSingle();

  const risk = spoilageRisk(
    crop.perishability,
    eta,
    weather?.humidity ?? 55,
    Number(weather?.temp_c ?? 30),
  );

  const pricePerQuintal = Number(price?.price_per_quintal ?? crop.base_price);
  const gross = Math.round(pricePerQuintal * input.tons * 10);

  return {
    crop,
    mandi,
    weather: weather ?? null,
    distanceKm: km,
    routeSource: "haversine-road-factor" as const,
    etaMinutes: eta,
    needsCooling,
    allocations: allocations.map((a) => ({
      vehicleId: a.vehicle.id,
      regNo: a.vehicle.reg_no,
      type: a.vehicle.vehicle_type,
      capacity: Number(a.vehicle.capacity_tons),
      refrigerated: a.vehicle.refrigerated,
      tons: a.tons,
      utilization: a.utilization,
      cost: a.cost,
    })),
    unassignedTons,
    availableVehicles: (vehicles ?? []).map((v) => ({
      vehicleId: v.id,
      regNo: v.reg_no,
      type: v.vehicle_type,
      capacity: Number(v.capacity_tons),
      refrigerated: v.refrigerated,
    })),
    soloCost,
    transportCost,
    poolSavings: savings,
    pricePerQuintal,
    grossAmount: gross,
    netAmount: gross - transportCost,
    risk,
  };
}

export const planShipment = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      cropId: string;
      mandiId: string;
      farmId: string | null;
      tons: number;
      priority: string;
      pooled: boolean;
    }) => d,
  )
  .handler(({ data }) => planShipmentImpl(data));

/* ---------------- writes ---------------- */

export const createShipment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      cropId: string;
      mandiId: string;
      farmId: string | null;
      tons: number;
      priority: string;
      pooled: boolean;
      harvestDate: string;
      grade: string;
      qualityNotes: string;
      farmName?: string;
      village?: string;
      district?: string;
      allocations?: { vehicleId: string; tons: number }[];
    }) => d,
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const db = publicClient();
    const { data: state } = await db.from("system_state").select("*").eq("id", 1).maybeSingle();
    const dataset = state?.mode === "demo" ? ("demo" as const) : ("real" as const);

    let farmId = data.farmId;
    if (dataset === "real") {
      const { data: myFarms } = await supabase.from("farms").select("*").eq("owner_id", userId);
      if (myFarms && myFarms.length > 0) {
        farmId = myFarms[0]!.id;
      } else {
        const { data: newFarm, error } = await supabase
          .from("farms")
          .insert({
            owner_id: userId,
            farmer_name: data.farmName ?? "Farmer",
            name: data.farmName ?? "My farm",
            village: data.village ?? "Shirur",
            district: data.district ?? "Pune",
            lat: 18.827,
            lng: 74.373,
            dataset,
          })
          .select()
          .single();
        if (error) throw new Error(error.message);
        farmId = newFarm.id;
      }
    }

    const plan = await planShipmentImpl({
      cropId: data.cropId,
      mandiId: data.mandiId,
      farmId,
      tons: data.tons,
      priority: data.priority,
      pooled: data.pooled,
    });

    // Farmer may hand-edit the allocation in the UI; re-validate and re-price it here.
    let chosen = plan.allocations;
    let transportCost = plan.transportCost;
    let savings = plan.poolSavings;
    if (data.allocations?.length) {
      const byId = new Map(
        [...plan.allocations, ...plan.availableVehicles.map((v) => ({ ...v, tons: 0, utilization: 0, cost: 0 }))].map(
          (v) => [v.vehicleId, v],
        ),
      );
      const rows = data.allocations.map((a) => {
        const v = byId.get(a.vehicleId);
        if (!v) throw new Error("Unknown vehicle in allocation");
        return { ...v, tons: a.tons };
      });
      const invalid = validateAllocation(rows);
      if (invalid) throw new Error(invalid);
      const priced = costPlan(rows, plan.distanceKm, data.pooled, data.tons);
      if (priced.unassignedTons > 0.01)
        throw new Error(`${priced.unassignedTons} t is still unallocated`);
      chosen = priced.rows;
      transportCost = priced.transportCost;
      savings = priced.poolSavings;
    }

    const { data: shipment, error: shipErr } = await supabase
      .from("shipments")
      .insert({
        owner_id: dataset === "real" ? userId : null,
        farm_id: farmId,
        crop_id: data.cropId,
        mandi_id: data.mandiId,
        quantity_tons: data.tons,
        harvest_date: data.harvestDate,
        quality_grade: data.grade,
        priority: data.priority,
        pooled: data.pooled,
        status: chosen.length ? "allocated" : "created",
        distance_km: plan.distanceKm,
        eta_minutes: plan.etaMinutes,
        transport_cost: transportCost,
        pool_savings: savings,
        expected_amount: plan.grossAmount - transportCost,
        payment_status: "held",
        dataset,
      })
      .select()
      .single();
    if (shipErr) throw new Error(shipErr.message);

    if (data.qualityNotes || data.grade) {
      await supabase.from("quality_reports").insert({
        shipment_id: shipment.id,
        grade: data.grade,
        notes: data.qualityNotes,
        dataset,
      });
    }

    if (chosen.length) {
      const { error: tripErr } = await supabase.from("trips").insert(
        chosen.map((a) => ({
          shipment_id: shipment.id,
          vehicle_id: a.vehicleId,
          status: "OFFERED",
          load_tons: a.tons,
          distance_km: plan.distanceKm,
          eta_minutes: plan.etaMinutes,
          payout: Math.round(a.cost * 0.62),
          dataset,
        })),
      );
      if (tripErr) throw new Error(tripErr.message);
    }

    await supabase.from("listings").insert({
      shipment_id: shipment.id,
      crop_id: data.cropId,
      farm_id: farmId,
      mandi_id: data.mandiId,
      quantity_tons: data.tons,
      price_per_quintal: plan.pricePerQuintal,
      grade: data.grade,
      dataset,
    });

    await supabase.from("audit_logs").insert({
      actor: userId,
      action: "shipment.create",
      entity: shipment.id,
      detail: `${data.tons} t ${plan.crop.name} to ${plan.mandi.name}`,
      dataset,
    });

    return { shipmentId: shipment.id, plan };
  });

export const advanceTrip = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { tripId: string; driverId?: string; action: "accept" | "reject" | "next" }) => d)
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    let { data: trip, error } = await supabase
      .from("trips")
      .select("*")
      .eq("id", data.tripId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    // Simulated trips are not readable through the caller's own permissions
    // (they carry no owner). Fall back to the server-only reader, strictly
    // scoped to demo records, so the demo driver flow keeps working.
    if (!trip) {
      const demoDb = await demoReader();
      const res = await demoDb
        .from("trips")
        .select("*")
        .eq("id", data.tripId)
        .eq("dataset", DEMO)
        .maybeSingle();
      trip = res.data;
    }
    if (!trip) throw new Error("Trip not visible to this account");
    // Demo records are mutated through the server-only client; real records
    // always go through the caller's own (row-level-secured) session.
    const wdb = trip.dataset === DEMO ? await demoReader() : supabase;

    if (data.action === "reject") {
      await wdb.from("trips").update({ status: "OFFERED", driver_id: null }).eq("id", trip.id);
      await wdb
        .from("trip_events")
        .insert({ trip_id: trip.id, status: "REJECTED", note: "Driver declined", dataset: trip.dataset });
      return { status: "OFFERED" };
    }

    const next = data.action === "accept" ? "ACCEPTED" : nextTripStatus(trip.status);
    if (!next) return { status: trip.status };

    const order = [
      "OFFERED","ACCEPTED","EN_ROUTE_PICKUP","ARRIVED_PICKUP","LOADING",
      "IN_TRANSIT","ARRIVED_DESTINATION","UNLOADING","DELIVERED","COMPLETED",
    ];
    const patch = {
      status: next,
      progress: Math.min(1, order.indexOf(next) / 9),
      ...(data.action === "accept" && data.driverId ? { driver_id: data.driverId } : {}),
      ...(next === "EN_ROUTE_PICKUP" ? { started_at: new Date().toISOString() } : {}),
      ...(next === "COMPLETED" ? { completed_at: new Date().toISOString() } : {}),
    };

    const { error: upErr } = await wdb.from("trips").update(patch).eq("id", trip.id);
    if (upErr) throw new Error(upErr.message);
    await wdb
      .from("trip_events")
      .insert({ trip_id: trip.id, status: next, note: "Updated from Driver app", dataset: trip.dataset });

    if (trip.shipment_id) {
      const shipStatus =
        next === "IN_TRANSIT"
          ? "in_transit"
          : next === "DELIVERED"
            ? "delivered"
            : next === "COMPLETED"
              ? "completed"
              : null;
      if (shipStatus) {
        await wdb
          .from("shipments")
          .update({
            status: shipStatus,
            payment_status: shipStatus === "completed" ? "paid" : "held",
          })
          .eq("id", trip.shipment_id);
      }
    }
    if (next === "COMPLETED" && trip.driver_id) {
      await wdb.from("transactions").insert({
        role: "driver",
        kind: "credit",
        amount: trip.payout,
        note: `Trip payout ${trip.id}`,
        dataset: trip.dataset,
      });
    }
    return { status: next };
  });

export const purchaseListing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { listingId: string; tons: number; buyerName: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    if (data.tons <= 0) throw new Error("Quantity must be greater than zero");
    const { data: listing, error } = await supabase
      .from("listings")
      .select("*")
      .eq("id", data.listingId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!listing) throw new Error("Listing not found");
    if (Number(listing.quantity_tons) < data.tons)
      throw new Error(`Only ${listing.quantity_tons} t available`);

    const wdb = listing.dataset === DEMO ? await demoReader() : supabase;

    const total = Math.round(Number(listing.price_per_quintal) * data.tons * 10);
    const remaining = Math.round((Number(listing.quantity_tons) - data.tons) * 100) / 100;

    const { error: upErr } = await wdb
      .from("listings")
      .update({ quantity_tons: remaining, available: remaining > 0 })
      .eq("id", listing.id)
      .gte("quantity_tons", data.tons);
    if (upErr) throw new Error(upErr.message);

    const { data: order, error: orderErr } = await wdb
      .from("orders")
      .insert({
        buyer_id: listing.dataset === "real" ? userId : null,
        buyer_name: data.buyerName || "Buyer",
        listing_id: listing.id,
        crop_id: listing.crop_id,
        quantity_tons: data.tons,
        total_amount: total,
        status: "confirmed",
        dataset: listing.dataset,
      })
      .select()
      .single();
    if (orderErr) throw new Error(orderErr.message);

    await wdb.from("transactions").insert({
      role: "buyer",
      kind: "debit",
      amount: total,
      note: `Order ${order.id}`,
      dataset: listing.dataset,
    });
    await wdb.from("audit_logs").insert({
      actor: userId,
      action: "order.create",
      entity: order.id,
      detail: `${data.tons} t for ₹${total}`,
      dataset: listing.dataset,
    });
    return { orderId: order.id, total, remaining };
  });

export const reportIncident = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { kind: string; description: string; tripId?: string | null; role: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const db = publicClient();
    const { data: state } = await db.from("system_state").select("mode").eq("id", 1).maybeSingle();
    const dataset = state?.mode === "demo" ? ("demo" as const) : ("real" as const);
    const { error } = await supabase.from("incidents").insert({
      kind: data.kind,
      severity: data.kind === "SOS" ? "high" : "medium",
      trip_id: data.tripId ?? null,
      reporter_role: data.role,
      reporter_id: userId,
      description: data.description,
      dataset,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const createTicket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { subject: string; body: string; role: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("support_tickets").insert({
      user_id: userId,
      role: data.role,
      subject: data.subject,
      body: data.body,
      dataset: "real",
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const recordGps = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: { tripId: string; vehicleId: string | null; lat: number; lng: number; speed: number; key: string }) => d,
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("gps_pings").upsert(
      {
        trip_id: data.tripId,
        vehicle_id: data.vehicleId,
        lat: data.lat,
        lng: data.lng,
        speed_kmph: data.speed,
        idempotency_key: data.key,
        dataset: "real",
      },
      { onConflict: "idempotency_key", ignoreDuplicates: true },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });
