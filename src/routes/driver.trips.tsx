import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getDriverBoard } from "@/lib/data.functions";
import { AppShell } from "@/components/shell";
import { Badge, Card, Empty, Progress } from "@/components/ui-kit";
import { inr, tripProgress } from "@/lib/logistics";

export const Route = createFileRoute("/driver/trips")({
  head: () => ({
    meta: [
      { title: "Trip history — Krishi-Yatra Driver" },
      { name: "description", content: "Every load you carried, with distance, payout and status." },
      { property: "og:title", content: "Trip history — Krishi-Yatra Driver" },
      { property: "og:description", content: "Distance, payout and status for each trip." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Trips,
});

function Trips() {
  const board = useServerFn(getDriverBoard);
  const { data } = useQuery({ queryKey: ["driver-board"], queryFn: () => board({}) });
  const trips = data?.trips ?? [];
  const shipmentById = new Map((data?.shipments ?? []).map((s) => [s.id, s]));

  return (
    <AppShell role="driver" title="Trips" subtitle="Your load history and current runs.">
      {trips.length === 0 ? (
        <Empty title="No trips yet" />
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
