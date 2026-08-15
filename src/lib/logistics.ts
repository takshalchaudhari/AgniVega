/** Pure logistics maths shared by server functions and the UI. */

export const MAX_VEHICLE_TONS = 12;

export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Road distance approximation when OSRM is unreachable. */
export function roadDistanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  return Math.round(haversineKm(a, b) * 1.28);
}

export type VehicleLike = {
  id: string;
  reg_no: string;
  vehicle_type: string;
  capacity_tons: number;
  refrigerated: boolean;
  status: string;
  fleet_id: string | null;
};

export type Allocation = {
  vehicle: VehicleLike;
  tons: number;
  utilization: number;
  cost: number;
};

export const RATE_PER_TON_KM = 6.4;
export const BASE_DISPATCH_FEE = 900;

export function vehicleCost(tons: number, km: number, refrigerated: boolean) {
  const base = BASE_DISPATCH_FEE + tons * km * RATE_PER_TON_KM * 0.55;
  return Math.round(base * (refrigerated ? 1.22 : 1));
}

/**
 * Greedy best-fit allocation. Enforces the 12-tonne hard limit per vehicle and
 * prefers the fewest vehicles with the highest utilisation.
 */
export function allocateVehicles(
  tons: number,
  km: number,
  vehicles: VehicleLike[],
  opts: { needsCooling?: boolean } = {},
): { allocations: Allocation[]; unassignedTons: number } {
  const pool = vehicles
    .filter((v) => v.status === "available" && v.capacity_tons <= MAX_VEHICLE_TONS)
    .filter((v) => (opts.needsCooling ? v.refrigerated : true))
    .sort((a, b) => b.capacity_tons - a.capacity_tons);

  const allocations: Allocation[] = [];
  let remaining = tons;

  for (const v of pool) {
    if (remaining <= 0.01) break;
    // Prefer a smaller vehicle when it can finish the job on its own.
    const smallestFit = pool
      .filter((c) => !allocations.some((a) => a.vehicle.id === c.id))
      .filter((c) => c.capacity_tons >= remaining)
      .sort((a, b) => a.capacity_tons - b.capacity_tons)[0];
    const chosen = smallestFit ?? v;
    if (allocations.some((a) => a.vehicle.id === chosen.id)) continue;
    const load = Math.min(chosen.capacity_tons, remaining);
    allocations.push({
      vehicle: chosen,
      tons: Math.round(load * 100) / 100,
      utilization: Math.round((load / chosen.capacity_tons) * 100),
      cost: vehicleCost(load, km, chosen.refrigerated),
    });
    remaining = Math.round((remaining - load) * 100) / 100;
  }

  return { allocations, unassignedTons: Math.max(0, remaining) };
}

export function etaMinutes(km: number, priority: string) {
  const avgSpeed = priority === "urgent" ? 52 : priority === "high" ? 46 : 41;
  return Math.round((km / avgSpeed) * 60 + 45);
}

/** Pooling shares the dispatch fee and improves utilisation. */
export function poolSavings(allocations: { utilization: number }[]) {
  if (allocations.length < 2) return 0;
  const shared = BASE_DISPATCH_FEE * (allocations.length - 1) * 0.65;
  const utilBonus =
    allocations.reduce((s, a) => s + (100 - a.utilization), 0) * 18;
  return Math.round(shared + utilBonus);
}

export function spoilageRisk(
  perishability: string,
  etaMin: number,
  humidity: number,
  tempC: number,
): { level: "low" | "medium" | "high"; message: string } {
  const hours = etaMin / 60;
  let score = 0;
  if (perishability === "high") score += 3;
  else if (perishability === "medium") score += 1.5;
  if (hours > 8) score += 2;
  else if (hours > 4) score += 1;
  if (tempC > 33) score += 1.5;
  if (humidity > 70) score += 1;
  if (score >= 5)
    return {
      level: "high",
      message: "Move today and use a cooled vehicle — losses likely otherwise.",
    };
  if (score >= 3)
    return { level: "medium", message: "Travel early morning to protect the load." };
  return { level: "low", message: "Conditions are good for this journey." };
}

export const TRIP_FLOW = [
  "OFFERED",
  "ACCEPTED",
  "EN_ROUTE_PICKUP",
  "ARRIVED_PICKUP",
  "LOADING",
  "IN_TRANSIT",
  "ARRIVED_DESTINATION",
  "UNLOADING",
  "DELIVERED",
  "COMPLETED",
] as const;

export type TripStatus = (typeof TRIP_FLOW)[number];

export function nextTripStatus(current: string): TripStatus | null {
  const i = TRIP_FLOW.indexOf(current as TripStatus);
  if (i < 0 || i === TRIP_FLOW.length - 1) return null;
  return TRIP_FLOW[i + 1]!;
}

export function tripProgress(status: string) {
  const i = TRIP_FLOW.indexOf(status as TripStatus);
  return i < 0 ? 0 : i / (TRIP_FLOW.length - 1);
}

export function inr(value: number) {
  return "₹" + Math.round(value).toLocaleString("en-IN");
}

/* ---------------- editable allocation support ---------------- */

export type PlanRow = {
  vehicleId: string;
  regNo: string;
  type: string;
  capacity: number;
  refrigerated: boolean;
  tons: number;
  utilization: number;
  cost: number;
};

/** Recompute utilisation + cost for a hand-edited allocation. Pure. */
export function costPlan(
  rows: { vehicleId: string; regNo: string; type: string; capacity: number; refrigerated: boolean; tons: number }[],
  km: number,
  pooled: boolean,
  totalTons: number,
) {
  const priced: PlanRow[] = rows.map((r) => {
    const tons = Math.max(0, Math.min(r.tons, Math.min(r.capacity, MAX_VEHICLE_TONS)));
    return {
      ...r,
      tons: Math.round(tons * 100) / 100,
      utilization: Math.round((tons / Math.min(r.capacity, MAX_VEHICLE_TONS)) * 100),
      cost: vehicleCost(tons, km, r.refrigerated),
    };
  });
  const allocatedTons = priced.reduce((s, r) => s + r.tons, 0);
  const allocatedCost = priced.reduce((s, r) => s + r.cost, 0);
  const savings = pooled ? poolSavings(priced) : 0;
  return {
    rows: priced,
    allocatedTons: Math.round(allocatedTons * 100) / 100,
    unassignedTons: Math.max(0, Math.round((totalTons - allocatedTons) * 100) / 100),
    allocatedCost,
    poolSavings: savings,
    transportCost: Math.max(0, allocatedCost - savings),
  };
}

/** Hard capacity check used by both the UI and the server. */
export function validateAllocation(
  rows: { capacity: number; tons: number; regNo?: string }[],
): string | null {
  for (const r of rows) {
    if (r.tons > MAX_VEHICLE_TONS + 0.001)
      return `${r.regNo ?? "Vehicle"} exceeds the ${MAX_VEHICLE_TONS} tonne legal limit`;
    if (r.tons > r.capacity + 0.001)
      return `${r.regNo ?? "Vehicle"} can only carry ${r.capacity} t`;
  }
  return null;
}
