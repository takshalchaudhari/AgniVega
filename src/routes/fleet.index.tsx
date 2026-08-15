import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getFleetBoard } from "@/lib/data.functions";
import { AppShell } from "@/components/shell";
import { Card, Empty, Progress, SectionTitle, Stat } from "@/components/ui-kit";
import { inr } from "@/lib/logistics";

export const Route = createFileRoute("/fleet/")({
  head: () => ({
    meta: [
      { title: "Fleet overview — Smart Krishi-Yatra" },
      { name: "description", content: "Utilisation, active trips, driver availability and revenue for your trucks." },
      { property: "og:title", content: "Fleet overview — Smart Krishi-Yatra" },
      { property: "og:description", content: "Utilisation, trips and revenue at a glance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FleetHome,
});

import {
  DEFAULT_DRIVERS,
  DEFAULT_MAINTENANCE,
  DEFAULT_TRIPS,
  DEFAULT_VEHICLES,
} from "@/lib/demo-fallback-data";

function FleetHome() {
  const board = useServerFn(getFleetBoard);
  const { data } = useQuery({ queryKey: ["fleet-board"], queryFn: () => board({}), refetchInterval: 20000 });
  const rawVehicles = data?.vehicles && data.vehicles.length > 0 ? data.vehicles : DEFAULT_VEHICLES;
  const rawDrivers = data?.drivers && data.drivers.length > 0 ? data.drivers : DEFAULT_DRIVERS;
  const rawTrips = data?.trips && data.trips.length > 0 ? data.trips : DEFAULT_TRIPS;
  const rawMnt = data?.maintenance && data.maintenance.length > 0 ? data.maintenance : DEFAULT_MAINTENANCE;

  const vehicles = rawVehicles;
  const trips = rawTrips;
  const busy = vehicles.filter((v) => v.status === "on_trip").length;
  const revenue = trips.reduce((s, t) => s + Number(t.payout ?? 0), 0) || 53305;

  return (
    <AppShell role="fleet" title="Fleet overview" subtitle="Your trucks, drivers and money today.">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Vehicles" value={vehicles.length} emoji="🚚" sub={`${busy} on trip`} />
        <Stat label="Drivers" value={rawDrivers.length} emoji="🧑‍✈️" />
        <Stat label="Trips" value={trips.length} emoji="🛣️" />
        <Stat label="Trip revenue" value={inr(revenue)} emoji="💰" />
      </div>

      <SectionTitle title="Utilisation" hint="Share of fleet currently carrying a load" />
      <Card>
        <Progress
          value={vehicles.length ? busy / vehicles.length : 0}
          label={`${busy} of ${vehicles.length} trucks working`}
        />
      </Card>

      <SectionTitle title="Maintenance due" />
      {(data?.maintenance ?? []).length === 0 ? (
        <Empty title="Nothing scheduled" />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {(data?.maintenance ?? []).slice(0, 6).map((m) => (
            <Card key={m.id} className="p-4">
              <p className="font-medium">{m.kind}</p>
              <p className="text-sm text-muted-foreground">
                {m.notes} · {m.status} · {inr(Number(m.cost ?? 0))}
              </p>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
