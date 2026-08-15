import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAdminBoard } from "@/lib/data.functions";
import { AppShell } from "@/components/shell";
import { Badge, Card, Empty, SectionTitle, Stat } from "@/components/ui-kit";
import { inr } from "@/lib/logistics";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Control tower — Smart Krishi-Yatra" },
      { name: "description", content: "Network-wide shipments, trips, incidents, revenue and system health in one operations view." },
      { property: "og:title", content: "Control tower — Smart Krishi-Yatra" },
      { property: "og:description", content: "Network health, incidents and revenue." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminHome,
});

function AdminHome() {
  const board = useServerFn(getAdminBoard);
  const { data } = useQuery({ queryKey: ["admin-board"], queryFn: () => board({}), refetchInterval: 15000 });

  const shipments = data?.shipments ?? [];
  const revenue = shipments.reduce((s, x) => s + Number(x.transport_cost ?? 0), 0);
  const openIncidents = (data?.incidents ?? []).filter((i) => i.status !== "resolved");

  return (
    <AppShell
      role="admin"
      title="Control tower"
      subtitle="Everything moving on the network right now."
      actions={
        data?.system ? (
          <Badge tone={data.system.mode === "demo" ? "warn" : "good"}>
            {data.system.mode === "demo" ? "Demo mode" : "Real data mode"}
          </Badge>
        ) : null
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Shipments" value={shipments.length} emoji="📦" />
        <Stat label="Trips" value={(data?.trips ?? []).length} emoji="🛣️" />
        <Stat label="Transport revenue" value={inr(revenue)} emoji="💰" />
        <Stat label="Open incidents" value={openIncidents.length} emoji="🚨" />
      </div>

      <SectionTitle title="Latest incidents" />
      {openIncidents.length === 0 ? (
        <Empty title="No open incidents" />
      ) : (
        <div className="space-y-2">
          {openIncidents.slice(0, 6).map((i) => (
            <Card key={i.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">
                  {i.kind} · {i.reporter_role}
                </p>
                <p className="text-sm text-muted-foreground">{i.description}</p>
              </div>
              <Badge tone={i.severity === "high" ? "bad" : "warn"}>{i.severity}</Badge>
            </Card>
          ))}
        </div>
      )}

      <SectionTitle title="System health" />
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Database" value={data?.health.database ?? "…"} emoji="🗄️" />
        <Stat label="API" value={data?.health.api ?? "…"} emoji="🔌" />
        <Stat label="Audit entries" value={(data?.audit ?? []).length} emoji="📝" />
      </div>
    </AppShell>
  );
}
