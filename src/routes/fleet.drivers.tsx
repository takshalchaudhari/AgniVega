import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getFleetBoard } from "@/lib/data.functions";
import { AppShell } from "@/components/shell";
import { Badge, Card, Empty } from "@/components/ui-kit";

export const Route = createFileRoute("/fleet/drivers")({
  head: () => ({
    meta: [
      { title: "Drivers — Krishi-Yatra Fleet" },
      { name: "description", content: "Licences, ratings, availability and language for every driver in the fleet." },
      { property: "og:title", content: "Drivers — Krishi-Yatra Fleet" },
      { property: "og:description", content: "Licences, ratings and availability." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Drivers,
});

function Drivers() {
  const board = useServerFn(getFleetBoard);
  const { data } = useQuery({ queryKey: ["fleet-board"], queryFn: () => board({}) });
  const drivers = data?.drivers ?? [];

  return (
    <AppShell role="fleet" title="Drivers" subtitle="Who is available to run a load.">
      {drivers.length === 0 ? (
        <Empty title="No drivers yet" />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {drivers.map((d) => (
            <Card key={d.id} className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{d.name}</p>
                <Badge tone={d.status === "available" ? "good" : "primary"}>{d.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {d.phone} · licence {d.license_no}
              </p>
              <p className="text-xs text-muted-foreground">
                Rating {d.rating}★
              </p>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
