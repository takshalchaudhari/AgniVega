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

import {
  DEFAULT_AUDIT_LOGS,
  DEFAULT_DRIVERS,
  DEFAULT_FARMS,
  DEFAULT_GPS_PINGS,
  DEFAULT_LISTINGS,
  DEFAULT_MAINTENANCE,
  DEFAULT_ORDERS,
  DEFAULT_SHIPMENTS,
  DEFAULT_TRIPS,
  DEFAULT_VEHICLES,
} from "./demo-fallback-data";

/**
 * The demo dashboards below are public (no sign-in). Sensitive operational
 * tables are served through the demo reader and automatically hydrated with
 * rich synchronized fallback data if the remote database is cold.
 */
const DEMO = "demo" as const;

export const getFarmerBoard = createServerFn({ method: "GET" }).handler(async () => {
  const pub = publicClient();
  const db = await demoReader();
  const [farms, shipments, trips, notifications, transactions, prices] = await Promise.all([
    db.from("farms").select("*").eq("dataset", DEMO).catch(() => ({ data: null })),
    db.from("shipments").select("*").eq("dataset", DEMO).order("created_at", { ascending: false }).catch(() => ({ data: null })),
    db.from("trips").select("*, vehicles(*), drivers(*)").eq("dataset", DEMO).catch(() => ({ data: null })),
    db
      .from("notifications")
      .select("*")
      .eq("dataset", DEMO)
      .eq("role", "farmer")
      .order("created_at", { ascending: false })
      .catch(() => ({ data: null })),
    db
      .from("transactions")
      .select("*")
      .eq("dataset", DEMO)
      .eq("role", "farmer")
      .order("created_at", { ascending: false })
      .catch(() => ({ data: null })),
    pub
      .from("market_prices")
      .select("*")
      .eq("recorded_on", new Date().toISOString().slice(0, 10))
      .limit(400)
      .catch(() => ({ data: null })),
  ]);

  const rawShipments = shipments.data && shipments.data.length > 0 ? shipments.data : DEFAULT_SHIPMENTS;
  const rawTrips = trips.data && trips.data.length > 0 ? trips.data : DEFAULT_TRIPS;
  const rawFarms = farms.data && farms.data.length > 0 ? farms.data : DEFAULT_FARMS;

  return {
    farms: safe.farms(rawFarms as any),
    shipments: rawShipments,
    trips: (rawTrips as any[]).map((t: any) => ({
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
    db.from("trips").select("*").eq("dataset", DEMO).order("created_at", { ascending: false }).catch(() => ({ data: null })),
    db.from("drivers").select("*").eq("dataset", DEMO).order("name").catch(() => ({ data: null })),
    db.from("vehicles").select("*").eq("dataset", DEMO).catch(() => ({ data: null })),
    db.from("shipments").select("*, crops(*), mandis(*), farms(*)").eq("dataset", DEMO).catch(() => ({ data: null })),
    db
      .from("trip_events")
      .select("*")
      .eq("dataset", DEMO)
      .order("created_at", { ascending: false })
      .limit(60)
      .catch(() => ({ data: null })),
    db
      .from("incidents")
      .select("*")
      .eq("dataset", DEMO)
      .order("created_at", { ascending: false })
      .limit(20)
      .catch(() => ({ data: null })),
  ]);

  const rawTrips = trips.data && trips.data.length > 0 ? trips.data : DEFAULT_TRIPS;
  const rawDrivers = drivers.data && drivers.data.length > 0 ? drivers.data : DEFAULT_DRIVERS;
  const rawVehicles = vehicles.data && vehicles.data.length > 0 ? vehicles.data : DEFAULT_VEHICLES;
  const rawShipments = shipments.data && shipments.data.length > 0 ? shipments.data : DEFAULT_SHIPMENTS;

  return {
    trips: rawTrips,
    drivers: safe.drivers(rawDrivers as any),
    vehicles: rawVehicles,
    shipments: (rawShipments as any[]).map((s: any) => ({
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
    db.from("fleets").select("*").eq("dataset", DEMO).catch(() => ({ data: null })),
    db.from("vehicles").select("*").eq("dataset", DEMO).order("reg_no").catch(() => ({ data: null })),
    db.from("drivers").select("*").eq("dataset", DEMO).order("name").catch(() => ({ data: null })),
    db.from("maintenance").select("*").eq("dataset", DEMO).order("created_at", { ascending: false }).catch(() => ({ data: null })),
    db.from("trips").select("*").eq("dataset", DEMO).catch(() => ({ data: null })),
    db
      .from("gps_pings")
      .select("*")
      .eq("dataset", DEMO)
      .order("recorded_at", { ascending: false })
      .limit(200)
      .catch(() => ({ data: null })),
  ]);

  const rawVehicles = vehicles.data && vehicles.data.length > 0 ? vehicles.data : DEFAULT_VEHICLES;
  const rawDrivers = drivers.data && drivers.data.length > 0 ? drivers.data : DEFAULT_DRIVERS;
  const rawTrips = trips.data && trips.data.length > 0 ? trips.data : DEFAULT_TRIPS;
  const rawMaintenance = maintenance.data && maintenance.data.length > 0 ? maintenance.data : DEFAULT_MAINTENANCE;
  const rawGps = gps.data && gps.data.length > 0 ? gps.data : DEFAULT_GPS_PINGS;

  return {
    fleets: safe.fleets(fleets.data),
    vehicles: rawVehicles,
    drivers: safe.drivers(rawDrivers as any),
    maintenance: rawMaintenance,
    trips: rawTrips,
    gps: rawGps,
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
      .order("created_at", { ascending: false })
      .catch(() => ({ data: null })),
    db
      .from("orders")
      .select("*, crops(*), listings(*)")
      .eq("dataset", DEMO)
      .order("created_at", { ascending: false })
      .catch(() => ({ data: null })),
    pub
      .from("market_prices")
      .select("*")
      .eq("recorded_on", new Date().toISOString().slice(0, 10))
      .limit(400)
      .catch(() => ({ data: null })),
  ]);

  const rawListings = listings.data && listings.data.length > 0 ? listings.data : DEFAULT_LISTINGS;
  const rawOrders = orders.data && orders.data.length > 0 ? orders.data : DEFAULT_ORDERS;

  return { listings: rawListings, orders: safe.orders(rawOrders as any), prices: prices.data ?? [] };
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
      .order("created_at", { ascending: false })
      .catch(() => ({ data: null })),
    db.from("trips").select("*").eq("dataset", DEMO).catch(() => ({ data: null })),
    db.from("vehicles").select("*").eq("dataset", DEMO).catch(() => ({ data: null })),
    db.from("drivers").select("*").eq("dataset", DEMO).catch(() => ({ data: null })),
    db.from("farms").select("*").eq("dataset", DEMO).catch(() => ({ data: null })),
    db.from("fleets").select("*").eq("dataset", DEMO).catch(() => ({ data: null })),
    db.from("orders").select("*").eq("dataset", DEMO).order("created_at", { ascending: false }).catch(() => ({ data: null })),
    db.from("listings").select("*").eq("dataset", DEMO).catch(() => ({ data: null })),
    db.from("incidents").select("*").eq("dataset", DEMO).order("created_at", { ascending: false }).catch(() => ({ data: null })),
    db.from("support_tickets").select("*").eq("dataset", DEMO).order("created_at", { ascending: false }).catch(() => ({ data: null })),
    db
      .from("audit_logs")
      .select("*")
      .eq("dataset", DEMO)
      .order("created_at", { ascending: false })
      .limit(50)
      .catch(() => ({ data: null })),
    db
      .from("gps_pings")
      .select("*")
      .eq("dataset", DEMO)
      .order("recorded_at", { ascending: false })
      .limit(120)
      .catch(() => ({ data: null })),
    pub.from("system_state").select("*").eq("id", 1).maybeSingle().catch(() => ({ data: null })),
    db
      .from("notifications")
      .select("*")
      .eq("dataset", DEMO)
      .order("created_at", { ascending: false })
      .limit(30)
      .catch(() => ({ data: null })),
  ]);

  const rawShipments = shipments.data && shipments.data.length > 0 ? shipments.data : DEFAULT_SHIPMENTS;
  const rawTrips = trips.data && trips.data.length > 0 ? trips.data : DEFAULT_TRIPS;
  const rawVehicles = vehicles.data && vehicles.data.length > 0 ? vehicles.data : DEFAULT_VEHICLES;
  const rawDrivers = drivers.data && drivers.data.length > 0 ? drivers.data : DEFAULT_DRIVERS;
  const rawFarms = farms.data && farms.data.length > 0 ? farms.data : DEFAULT_FARMS;
  const rawOrders = orders.data && orders.data.length > 0 ? orders.data : DEFAULT_ORDERS;
  const rawListings = listings.data && listings.data.length > 0 ? listings.data : DEFAULT_LISTINGS;
  const rawAudit = audit.data && audit.data.length > 0 ? audit.data : DEFAULT_AUDIT_LOGS;
  const rawGps = gps.data && gps.data.length > 0 ? gps.data : DEFAULT_GPS_PINGS;

  return {
    shipments: rawShipments,
    trips: rawTrips,
    vehicles: rawVehicles,
    drivers: safe.drivers(rawDrivers as any),
    farms: safe.farms(rawFarms as any),
    fleets: safe.fleets(fleets.data),
    orders: safe.orders(rawOrders as any),
    listings: rawListings,
    incidents: safe.incidents(incidents.data),
    tickets: safe.userScoped(tickets.data),
    audit: safe.audit(rawAudit as any),
    gps: rawGps,
    notifications: safe.userScoped(notifications.data),
    system: state.data ?? { mode: "demo", demo_status: "running", demo_tick: 0 },
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

  const [cropRes, mandiRes, farmRes, vehiclesRes, priceRes] = await Promise.all([
    pub.from("crops").select("*").eq("id", input.cropId).maybeSingle().then((r) => r, () => ({ data: null })),
    pub.from("mandis").select("*").eq("id", input.mandiId).maybeSingle().then((r) => r, () => ({ data: null })),
    input.farmId
      ? db.from("farms").select("lat,lng,district").eq("id", input.farmId).maybeSingle().then((r) => r, () => ({ data: null }))
      : Promise.resolve({ data: null }),
    db.from("vehicles").select("*").eq("status", "available").eq("dataset", DEMO).then((r) => r, () => ({ data: null })),
    pub
      .from("market_prices")
      .select("*")
      .eq("crop_id", input.cropId)
      .eq("mandi_id", input.mandiId)
      .order("recorded_on", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then((r) => r, () => ({ data: null })),
  ]);

  const crop = cropRes.data;
  const mandi = mandiRes.data;
  const vehicles = vehiclesRes.data;
  const price = priceRes.data;

  const matchedCrop =
    crop || FALLBACK_CROPS.find((c) => c.id === input.cropId) || FALLBACK_CROPS[0]!;
  const matchedMandi =
    mandi || FALLBACK_MANDIS.find((m) => m.id === input.mandiId) || FALLBACK_MANDIS[0]!;

  const availVehicles =
    vehicles && vehicles.length > 0
      ? vehicles
      : [
          {
            id: "VEH-1",
            reg_no: "MH13 EF 3302",
            vehicle_type: "12T Multi-Axle",
            capacity_tons: 12,
            refrigerated: false,
            status: "available",
            dataset: DEMO,
          },
          {
            id: "VEH-2",
            reg_no: "MH15 CD 7702",
            vehicle_type: "8T Medium Truck",
            capacity_tons: 8,
            refrigerated: false,
            status: "available",
            dataset: DEMO,
          },
          {
            id: "VEH-3",
            reg_no: "MH12 AB 1234",
            vehicle_type: "6T Light Commercial",
            capacity_tons: 6,
            refrigerated: false,
            status: "available",
            dataset: DEMO,
          },
          {
            id: "VEH-4",
            reg_no: "MH14 XY 5678",
            vehicle_type: "12T Reefer Truck",
            capacity_tons: 12,
            refrigerated: true,
            status: "available",
            dataset: DEMO,
          },
        ];

  const origin = input.origin ??
    (farm ? { lat: farm.lat, lng: farm.lng, district: farm.district } : { lat: 18.52, lng: 73.86, district: "Pune" });
  const km = roadDistanceKm(origin, { lat: matchedMandi.lat, lng: matchedMandi.lng });
  const eta = etaMinutes(km, input.priority);
  const needsCooling = matchedCrop.perishability === "high" && km > 250;

  const { allocations, unassignedTons } = allocateVehicles(input.tons, km, availVehicles as any, {
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
    .maybeSingle()
    .catch(() => ({ data: null }));

  const risk = spoilageRisk(
    matchedCrop.perishability,
    eta,
    weather?.humidity ?? 55,
    Number(weather?.temp_c ?? 30),
  );

  const pricePerQuintal = Number(price?.price_per_quintal ?? matchedCrop.base_price);
  const gross = Math.round(pricePerQuintal * input.tons * 10);

  return {
    crop: matchedCrop,
    mandi: matchedMandi,
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
    availableVehicles: availVehicles.map((v) => ({
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
  .handler(async ({ data }) => {
    const { supabaseAdmin: supabase } = await import("@/integrations/supabase/client.server");
    const { data: state } = await supabase.from("system_state").select("*").eq("id", 1).maybeSingle().catch(() => ({ data: null }));
    const dataset = state?.mode === "demo" ? ("demo" as const) : ("real" as const);
    const userId = "farmer_demo_user";

    let farmId = data.farmId;
    if (!farmId) {
      const { data: myFarms } = await supabase.from("farms").select("*").limit(1).catch(() => ({ data: null }));
      if (myFarms && myFarms.length > 0) {
        farmId = myFarms[0]!.id;
      } else {
        farmId = "FRM-DEMO-1";
        await supabase
          .from("farms")
          .upsert({
            id: farmId,
            farmer_name: data.farmName ?? "Kisan Patil",
            name: data.farmName ?? "Shivneri Farm",
            village: data.village ?? "Shirur",
            district: data.district ?? "Pune",
            lat: 18.827,
            lng: 74.373,
            dataset,
          })
          .catch(() => {});
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

    const shipmentId = `SHP-${Date.now()}`;
    await supabase
      .from("shipments")
      .upsert({
        id: shipmentId,
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
      .catch((err: Error) => {
        console.warn("Shipment upsert warning:", err);
      });

    if (data.qualityNotes || data.grade) {
      await supabase.from("quality_reports").upsert({
        id: `QR-${Date.now()}`,
        shipment_id: shipmentId,
        grade: data.grade,
        notes: data.qualityNotes,
        dataset,
      }).catch(() => {});
    }

    if (chosen.length) {
      await supabase.from("trips").upsert(
        chosen.map((a, i) => ({
          id: `TRP-${Date.now()}-${i + 1}`,
          shipment_id: shipmentId,
          vehicle_id: a.vehicleId,
          status: "OFFERED",
          load_tons: a.tons,
          distance_km: plan.distanceKm,
          eta_minutes: plan.etaMinutes,
          payout: Math.round(a.cost * 0.62),
          dataset,
        })),
      ).catch(() => {});
    }

    await supabase.from("listings").upsert({
      id: `LST-${Date.now()}`,
      shipment_id: shipmentId,
      crop_id: data.cropId,
      farm_id: farmId,
      mandi_id: data.mandiId,
      quantity_tons: data.tons,
      price_per_quintal: plan.pricePerQuintal,
      grade: data.grade,
      dataset,
    }).catch(() => {});

    await supabase.from("audit_logs").insert({
      actor: userId,
      action: "shipment.create",
      entity: shipmentId,
      detail: `${data.tons} t ${plan.crop.name} to ${plan.mandi.name}`,
      dataset,
    }).catch(() => {});

    return { shipmentId, plan };
  });

export const advanceTrip = createServerFn({ method: "POST" })
  .inputValidator((d: { tripId: string; driverId?: string; action: "accept" | "reject" | "next" }) => d)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const demoDb = await demoReader();
    const wdb = demoDb;

    let { data: trip } = await wdb
      .from("trips")
      .select("*")
      .eq("id", data.tripId)
      .maybeSingle()
      .then((r) => r, () => ({ data: null }));

    if (!trip) {
      const fallbackTrip = DEFAULT_TRIPS.find((t) => t.id === data.tripId) ?? DEFAULT_TRIPS[0]!;
      trip = { ...fallbackTrip };
    }

    if (data.action === "reject") {
      await wdb.from("trips").update({ status: "OFFERED", driver_id: null }).eq("id", trip.id).then(() => {}, () => {});
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

    await wdb.from("trips").update(patch).eq("id", trip.id).then(() => {}, () => {});
    await wdb
      .from("trip_events")
      .insert({ trip_id: trip.id, status: next, note: "Updated from Driver app", dataset: DEMO })
      .then(() => {}, () => {});

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
          .eq("id", trip.shipment_id)
          .then(() => {}, () => {});
      }
    }
    return { status: next };
  });

export const purchaseListing = createServerFn({ method: "POST" })
  .inputValidator((d: { listingId: string; tons: number; buyerName: string }) => d)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const demoDb = await demoReader();
    const wdb = demoDb;

    if (data.tons <= 0) throw new Error("Quantity must be greater than zero");
    let { data: listing } = await wdb
      .from("listings")
      .select("*")
      .eq("id", data.listingId)
      .maybeSingle()
      .then((r) => r, () => ({ data: null }));

    if (!listing) {
      listing = DEFAULT_LISTINGS.find((l) => l.id === data.listingId) as any;
    }
    const price = Number(listing?.price_per_quintal ?? 2400);
    const total = Math.round(price * data.tons * 10);
    const orderId = `ORD-${Date.now().toString().slice(-4)}`;

    await wdb
      .from("orders")
      .insert({
        id: orderId,
        buyer_id: "demo_buyer_1",
        buyer_name: data.buyerName || "Maha Agri Traders",
        listing_id: data.listingId,
        crop_id: listing?.crop_id ?? "crop_tomato",
        quantity_tons: data.tons,
        total_amount: total,
        status: "confirmed",
        dataset: DEMO,
      })
      .then(() => {}, () => {});

    await wdb
      .from("audit_logs")
      .insert({
        actor: "buyer",
        action: "order.create",
        entity: orderId,
        detail: `${data.tons} t for ₹${total} (Escrow Locked)`,
        dataset: DEMO,
      })
      .then(() => {}, () => {});

    return { orderId, total, status: "confirmed" };
  });

export const reportIncident = createServerFn({ method: "POST" })
  .inputValidator((d: { kind: string; description: string; tripId?: string | null; role: string }) => d)
  .handler(async ({ data }) => {
    const demoDb = await demoReader();
    await demoDb.from("incidents").insert({
      kind: data.kind,
      severity: data.kind === "SOS" ? "high" : "medium",
      trip_id: data.tripId ?? "TRP-101",
      reporter_role: data.role,
      reporter_id: "demo_user",
      description: data.description,
      status: "open",
      dataset: DEMO,
    }).then(() => {}, () => {});
    return { ok: true };
  });

export const createTicket = createServerFn({ method: "POST" })
  .inputValidator((d: { subject: string; body: string; role: string }) => d)
  .handler(async ({ data }) => {
    const demoDb = await demoReader();
    await demoDb.from("support_tickets").insert({
      user_id: "demo_user",
      role: data.role,
      subject: data.subject,
      body: data.body,
      status: "open",
      dataset: DEMO,
    }).then(() => {}, () => {});
    return { ok: true };
  });

export const recordGps = createServerFn({ method: "POST" })
  .inputValidator(
    (d: { tripId: string; vehicleId: string | null; lat: number; lng: number; speed: number; key: string }) => d,
  )
  .handler(async ({ data }) => {
    const demoDb = await demoReader();
    await demoDb.from("gps_pings").upsert(
      {
        trip_id: data.tripId,
        vehicle_id: data.vehicleId,
        lat: data.lat,
        lng: data.lng,
        speed_kmph: data.speed,
        idempotency_key: data.key,
        dataset: DEMO,
      },
      { onConflict: "idempotency_key", ignoreDuplicates: true },
    ).then(() => {}, () => {});
    return { ok: true };
  });

export const addVehicle = createServerFn({ method: "POST" })
  .inputValidator((d: { regNo: string; vehicleType: string; capacityTons: number; refrigerated: boolean; fleetId?: string }) => d)
  .handler(async ({ data }) => {
    const demoDb = await demoReader();
    const id = `VEH-${Date.now().toString().slice(-4)}`;
    await demoDb.from("vehicles").insert({
      id,
      reg_no: data.regNo,
      vehicle_type: data.vehicleType,
      capacity_tons: data.capacityTons,
      refrigerated: data.refrigerated,
      status: "available",
      fleet_id: data.fleetId ?? "FLT-1",
      lat: 18.5204,
      lng: 73.8567,
      dataset: DEMO,
    }).then(() => {}, () => {});
    return { ok: true, id };
  });

export const addDriver = createServerFn({ method: "POST" })
  .inputValidator((d: { name: string; phone: string; licenseNo: string; vehicleId?: string; fleetId?: string }) => d)
  .handler(async ({ data }) => {
    const demoDb = await demoReader();
    const id = `DRV-${Date.now().toString().slice(-4)}`;
    await demoDb.from("drivers").insert({
      id,
      name: data.name,
      phone: data.phone,
      license_no: data.licenseNo,
      vehicle_id: data.vehicleId || null,
      fleet_id: data.fleetId ?? "FLT-1",
      status: "available",
      rating: 4.9,
      dataset: DEMO,
    }).then(() => {}, () => {});
    return { ok: true, id };
  });

export const addMaintenance = createServerFn({ method: "POST" })
  .inputValidator((d: { vehicleId: string; description: string; cost: number; serviceDate?: string }) => d)
  .handler(async ({ data }) => {
    const demoDb = await demoReader();
    const id = `MNT-${Date.now().toString().slice(-4)}`;
    await demoDb.from("maintenance").insert({
      id,
      vehicle_id: data.vehicleId,
      description: data.description,
      cost: data.cost,
      service_date: data.serviceDate || new Date().toISOString(),
      dataset: DEMO,
    }).then(() => {}, () => {});
    return { ok: true, id };
  });

export const broadcastAdvisory = createServerFn({ method: "POST" })
  .inputValidator((d: { title: string; message: string; severity: "info" | "warning" | "critical" }) => d)
  .handler(async ({ data }) => {
    const demoDb = await demoReader();
    await demoDb.from("audit_logs").insert({
      actor: "admin",
      action: "network.advisory",
      entity: "ALL_ROUTES",
      detail: `[${data.severity.toUpperCase()}] ${data.title}: ${data.message}`,
      dataset: DEMO,
    }).then(() => {}, () => {});
    return { ok: true };
  });

export const resolveIncident = createServerFn({ method: "POST" })
  .inputValidator((d: { incidentId: string; resolutionNotes?: string }) => d)
  .handler(async ({ data }) => {
    const demoDb = await demoReader();
    await demoDb.from("incidents").update({
      status: "resolved",
      description: data.resolutionNotes ? `RESOLVED: ${data.resolutionNotes}` : undefined,
    }).eq("id", data.incidentId).then(() => {}, () => {});
    return { ok: true };
  });

export const releaseEscrow = createServerFn({ method: "POST" })
  .inputValidator((d: { shipmentId: string; amount: number }) => d)
  .handler(async ({ data }) => {
    const demoDb = await demoReader();
    await demoDb.from("shipments").update({
      payment_status: "paid",
    }).eq("id", data.shipmentId).then(() => {}, () => {});
    await demoDb.from("audit_logs").insert({
      actor: "admin",
      action: "escrow.release",
      entity: data.shipmentId,
      detail: `Direct payout released: ₹${data.amount.toLocaleString("en-IN")}`,
      dataset: DEMO,
    }).then(() => {}, () => {});
    return { ok: true };
  });
