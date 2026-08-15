import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAdminBoard } from "@/lib/data.functions";
import { AppShell } from "@/components/shell";
import { Card, Empty, SectionTitle, Stat } from "@/components/ui-kit";

export const Route = createFileRoute("/admin/network")({
  head: () => ({
    meta: [
      { title: "Network — Krishi-Yatra Control Tower" },
      { name: "description", content: "Farms, fleets, vehicles, drivers, buyers and support tickets across the platform." },
      { property: "og:title", content: "Network — Krishi-Yatra Control Tower" },
      { property: "og:description", content: "Participants and support load across the platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Network,
});

function Network() {
  const board = useServerFn(getAdminBoard);
  const { data } = useQuery({ queryKey: ["admin-board"], queryFn: () => board({}) });

  return (
    <AppShell role="admin" title="Network" subtitle="Who and what is on the platform.">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Farms" value={(data?.farms ?? []).length} emoji="🌾" />
        <Stat label="Fleets" value={(data?.fleets ?? []).length} emoji="🏢" />
        <Stat label="Vehicles" value={(data?.vehicles ?? []).length} emoji="🚚" />
        <Stat label="Drivers" value={(data?.drivers ?? []).length} emoji="🧑‍✈️" />
      </div>

      <SectionTitle title="Support tickets" />
      {(data?.tickets ?? []).length === 0 ? (
        <Empty title="No tickets open" />
      ) : (
        <div className="space-y-2">
          {(data?.tickets ?? []).map((t) => (
            <Card key={t.id} className="p-4">
              <p className="font-medium">
                {t.subject} · {t.role}
              </p>
              <p className="text-sm text-muted-foreground">{t.body}</p>
            </Card>
          ))}
        </div>
      )}

      <SectionTitle title="Audit trail" />
      <div className="space-y-1">
        {(data?.audit ?? []).slice(0, 12).map((a) => (
          <Card key={a.id} className="p-3">
            <p className="text-sm">
              <span className="font-medium">{a.action}</span> — {a.detail}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(a.created_at).toLocaleString("en-IN")}
            </p>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
