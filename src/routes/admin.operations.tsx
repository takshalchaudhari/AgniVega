import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { getAdminBoard } from "@/lib/data.functions";
import { AppShell } from "@/components/shell";
import { Badge, Card, Empty, Progress, RouteMap } from "@/components/ui-kit";
import { inr, tripProgress } from "@/lib/logistics";
import { formatAge, useLiveFeed } from "@/lib/use-live-feed";

export const Route = createFileRoute("/admin/operations")({
  head: () => ({
    meta: [
      { title: "Live operations — Krishi-Yatra Control Tower" },
      { name: "description", content: "Every active trip and shipment with stage, tonnage, distance and payout." },
      { property: "og:title", content: "Live operations — Krishi-Yatra Control Tower" },
      { property: "og:description", content: "Active trips with stage and payout." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Ops,
});

import {
  DEFAULT_DRIVERS,
  DEFAULT_GPS_PINGS,
  DEFAULT_SHIPMENTS,
  DEFAULT_TRIPS,
  DEFAULT_VEHICLES,
} from "@/lib/demo-fallback-data";

function Ops() {
  const board = useServerFn(getAdminBoard);
  const {
    data,
    ageSeconds,
    online,
    fallbackActive,
    isFetching,
    refresh,
  } = useLiveFeed({
    queryKey: ["admin-board"],
    queryFn: () => board({}),
    intervalMs: 12000,
    stallMs: 30000,
  });

  const rawTrips = data?.trips && data.trips.length > 0 ? data.trips : DEFAULT_TRIPS;
  const rawShipments = data?.shipments && data.shipments.length > 0 ? data.shipments : DEFAULT_SHIPMENTS;
  const rawVehicles = data?.vehicles && data.vehicles.length > 0 ? data.vehicles : DEFAULT_VEHICLES;
  const rawDrivers = data?.drivers && data.drivers.length > 0 ? data.drivers : DEFAULT_DRIVERS;
  const rawGps = data?.gps && data.gps.length > 0 ? data.gps : DEFAULT_GPS_PINGS;

  const trips = rawTrips;
  const shipmentById = new Map(rawShipments.map((s) => [s.id, s]));

  // live truck positions: latest GPS ping wins, else the vehicle's last known point
  const latest = new Map<string, { lat: number; lng: number; speed: number; at: string }>();
  for (const g of rawGps) {
    if (!g.vehicle_id || latest.has(g.vehicle_id)) continue;
    latest.set(g.vehicle_id, {
      lat: g.lat,
      lng: g.lng,
      speed: Number(g.speed_kmph ?? 0),
      at: g.recorded_at,
    });
  }
  const tripByVehicle = new Map(trips.map((t) => [t.vehicle_id ?? "", t]));
  const driverByVehicle = new Map(rawDrivers.map((d) => [d.vehicle_id ?? "", d]));
  const vehicles = rawVehicles.map((v) => {
    const p = latest.get(v.id);
    const t = tripByVehicle.get(v.id);
    const s = t ? shipmentById.get(t.shipment_id ?? "") : undefined;
    const crop = s?.crops as unknown as { name: string; emoji: string } | null;
    const mandi = s?.mandis as unknown as { name: string } | null;
    const details: [string, string][] = [
      ["Vehicle", `${v.vehicle_type} · ${v.capacity_tons} t`],
      ["Status", t ? t.status.replace(/_/g, " ") : v.status],
    ];
    if (driverByVehicle.get(v.id)) details.push(["Driver", driverByVehicle.get(v.id)!.name]);
    if (t) {
      details.push(["Load", `${crop?.emoji ?? ""} ${crop?.name ?? "load"} · ${t.load_tons} t`]);
      details.push(["To", mandi?.name ?? "mandi"]);
      details.push(["ETA", `${t.eta_minutes} min · ${t.distance_km} km`]);
      details.push(["Payout", inr(Number(t.payout ?? 0))]);
    }
    if (p) {
      details.push(["Speed", `${p.speed} km/h`]);
      details.push(["Last ping", new Date(p.at).toLocaleTimeString()]);
    }
    return {
      id: v.id,
      lat: p?.lat ?? v.lat,
      lng: p?.lng ?? v.lng,
      label: `🚛 ${v.reg_no}`,
      status: t && t.status !== "COMPLETED" ? "moving" : "idle",
      details,
    };
  });

  return (
    <AppShell role="admin" title="Live operations" subtitle="Trips currently on the network.">
      {vehicles.length ? (
        <Card className="mb-4 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold">Live fleet map</p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="primary">{vehicles.filter((v) => v.status === "moving").length} moving</Badge>
              <Badge tone={!online ? "bad" : fallbackActive ? "warn" : "good"}>
                <span
                  className={`mr-1 inline-block h-2 w-2 rounded-full align-middle ${
                    !online ? "bg-current" : "bg-current animate-pulse"
                  }`}
                />
                {!online ? "Offline" : isFetching ? "Updating…" : `Updated ${formatAge(ageSeconds)}`}
              </Badge>
              <button
                type="button"
                onClick={refresh}
                className="rounded-md border border-border px-2 py-1 text-xs font-medium hover:bg-muted"
              >
                Refresh now
              </button>
            </div>
          </div>
          <RouteMap vehicles={vehicles} className="h-[420px]" />
          <p className="text-xs text-muted-foreground">
            Tap any truck for its driver, load, ETA and last GPS ping. Refreshes every 12 s.
            {!online
              ? " Network is offline — showing the last known positions; updates resume automatically."
              : fallbackActive
                ? " Primary feed stalled — backup polling is keeping positions current."
                : ""}
          </p>
        </Card>
      ) : null}
      {trips.length === 0 ? (
        <Empty title="No trips on the board" />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">

          {trips.map((t) => {
            const s = shipmentById.get(t.shipment_id ?? "");
            const crop = s?.crops as unknown as { name: string; emoji: string } | null;
            const mandi = s?.mandis as unknown as { name: string } | null;
            return (
              <Card key={t.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">
                    {crop?.emoji} {crop?.name ?? "Load"} · {t.load_tons} t
                  </p>
                  <Badge tone={t.status === "COMPLETED" ? "good" : "primary"}>
                    {t.status.replace(/_/g, " ")}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  To {mandi?.name ?? "mandi"} · {t.distance_km} km · payout {inr(Number(t.payout ?? 0))}
                </p>
                <Progress value={tripProgress(t.status)} />
              </Card>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
