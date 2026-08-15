import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getBuyerBoard } from "@/lib/data.functions";
import { AppShell } from "@/components/shell";
import { Badge, Card, Empty, Stat } from "@/components/ui-kit";
import { inr } from "@/lib/logistics";

export const Route = createFileRoute("/buyer/orders")({
  head: () => ({
    meta: [
      { title: "My orders — Krishi-Yatra Buyer" },
      { name: "description", content: "Every lot you purchased, with tonnage, amount and delivery status." },
      { property: "og:title", content: "My orders — Krishi-Yatra Buyer" },
      { property: "og:description", content: "Tonnage, amount and delivery status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Orders,
});

import { DEFAULT_ORDERS } from "@/lib/demo-fallback-data";

function Orders() {
  const board = useServerFn(getBuyerBoard);
  const { data } = useQuery({ queryKey: ["buyer-board"], queryFn: () => board({}) });
  const rawOrders = data?.orders && data.orders.length > 0 ? data.orders : DEFAULT_ORDERS;
  const orders = rawOrders;
  const spend = orders.reduce((s, o) => s + Number(o.total_amount ?? 0), 0);

  return (
    <AppShell role="buyer" title="My orders" subtitle="What you bought and where it is.">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Orders" value={orders.length} emoji="🧾" />
        <Stat label="Total spend" value={inr(spend)} emoji="💳" />
        <Stat
          label="Tonnes bought"
          value={orders.reduce((s, o) => s + Number(o.quantity_tons ?? 0), 0)}
          emoji="⚖️"
        />
      </div>
      <div className="mt-5 space-y-2">
        {orders.length === 0 ? <Empty title="No orders yet" /> : null}
        {orders.map((o) => {
          const crop = o.crops as unknown as { name: string; emoji: string } | null;
          return (
            <Card key={o.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
              <div>
                <p className="font-medium">
                  {crop?.emoji} {crop?.name} · {o.quantity_tons} t
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(o.created_at).toLocaleString("en-IN")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={o.status === "delivered" ? "good" : "primary"}>{o.status}</Badge>
                <span className="font-semibold">{inr(Number(o.total_amount ?? 0))}</span>
              </div>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
