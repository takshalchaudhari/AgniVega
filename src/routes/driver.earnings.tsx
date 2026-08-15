import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getDriverBoard } from "@/lib/data.functions";
import { AppShell } from "@/components/shell";
import { Card, Empty, SectionTitle, Stat } from "@/components/ui-kit";
import { inr } from "@/lib/logistics";

export const Route = createFileRoute("/driver/earnings")({
  head: () => ({
    meta: [
      { title: "Earnings — Krishi-Yatra Driver" },
      { name: "description", content: "Payouts per completed trip, distance run and incident log." },
      { property: "og:title", content: "Earnings — Krishi-Yatra Driver" },
      { property: "og:description", content: "Payouts, kilometres and incidents." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Earnings,
});

function Earnings() {
  const board = useServerFn(getDriverBoard);
  const { data } = useQuery({ queryKey: ["driver-board"], queryFn: () => board({}) });
  const trips = data?.trips ?? [];
  const done = trips.filter((t) => t.status === "COMPLETED");
  const paid = done.reduce((s, t) => s + Number(t.payout ?? 0), 0);
  const km = done.reduce((s, t) => s + Number(t.distance_km ?? 0), 0);

  return (
    <AppShell role="driver" title="Earnings" subtitle="What you have run and earned.">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Total payout" value={inr(paid)} emoji="💵" />
        <Stat label="Trips completed" value={done.length} emoji="✅" />
        <Stat label="Distance run" value={`${km} km`} emoji="🛣️" />
      </div>

      <SectionTitle title="Incidents reported" />
      {(data?.incidents ?? []).length === 0 ? (
        <Empty title="No incidents — safe driving" />
      ) : (
        <div className="space-y-2">
          {(data?.incidents ?? []).map((i) => (
            <Card key={i.id} className="p-3">
              <p className="text-sm font-medium">
                {i.kind} · {i.severity}
              </p>
              <p className="text-xs text-muted-foreground">{i.description}</p>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
