import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getFleetBoard } from "@/lib/data.functions";
import { AppShell } from "@/components/shell";
import { Badge, Card, Empty } from "@/components/ui-kit";

export const Route = createFileRoute("/fleet/vehicles")({
  head: () => ({
    meta: [
      { title: "Vehicles — Krishi-Yatra Fleet" },
      { name: "description", content: "Registration, capacity under the 12-tonne limit, cooling and live status for every truck." },
      { property: "og:title", content: "Vehicles — Krishi-Yatra Fleet" },
      { property: "og:description", content: "Capacity, cooling and live status per truck." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Vehicles,
});

function Vehicles() {
  const board = useServerFn(getFleetBoard);
  const { data } = useQuery({ queryKey: ["fleet-board"], queryFn: () => board({}) });
  const vehicles = data?.vehicles ?? [];

  return (
    <AppShell role="fleet" title="Vehicles" subtitle="Hard limit: 12 tonnes per truck.">
      {vehicles.length === 0 ? (
        <Empty title="No vehicles registered" />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((v) => (
            <Card key={v.id} className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{v.reg_no}</p>
                <Badge tone={v.status === "available" ? "good" : v.status === "on_trip" ? "primary" : "warn"}>
                  {v.status.replace(/_/g, " ")}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {v.vehicle_type} · {v.capacity_tons} t {v.refrigerated ? "· refrigerated" : ""}
              </p>
              <p className="text-xs text-muted-foreground">Odometer {v.odometer_km} km</p>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
