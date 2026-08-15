import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getFleetBoard } from "@/lib/data.functions";
import { AppShell } from "@/components/shell";
import { Badge, Card, Empty, Stat } from "@/components/ui-kit";
import { inr } from "@/lib/logistics";

export const Route = createFileRoute("/fleet/maintenance")({
  head: () => ({
    meta: [
      { title: "Maintenance — Krishi-Yatra Fleet" },
      { name: "description", content: "Servicing, repairs and costs across the truck fleet." },
      { property: "og:title", content: "Maintenance — Krishi-Yatra Fleet" },
      { property: "og:description", content: "Servicing, repairs and spend." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Maintenance,
});

function Maintenance() {
  const board = useServerFn(getFleetBoard);
  const { data } = useQuery({ queryKey: ["fleet-board"], queryFn: () => board({}) });
  const rows = data?.maintenance ?? [];
  const regByVehicle = new Map((data?.vehicles ?? []).map((v) => [v.id, v.reg_no]));
  const spend = rows.reduce((s, r) => s + Number(r.cost ?? 0), 0);

  return (
    <AppShell role="fleet" title="Maintenance" subtitle="Keep the trucks on the road.">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Records" value={rows.length} emoji="🔧" />
        <Stat label="Open" value={rows.filter((r) => r.status !== "done").length} emoji="⏳" />
        <Stat label="Total spend" value={inr(spend)} emoji="💸" />
      </div>
      <div className="mt-5 space-y-2">
        {rows.length === 0 ? <Empty title="Nothing logged yet" /> : null}
        {rows.map((r) => (
          <Card key={r.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
            <div>
              <p className="font-medium">
                {regByVehicle.get(r.vehicle_id ?? "") ?? "Vehicle"} · {r.kind}
              </p>
              <p className="text-sm text-muted-foreground">{r.notes}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone={r.status === "done" ? "good" : "warn"}>{r.status}</Badge>
              <span className="text-sm font-semibold">{inr(Number(r.cost ?? 0))}</span>
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
