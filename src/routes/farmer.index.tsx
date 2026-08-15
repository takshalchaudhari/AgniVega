import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getFarmerBoard, getReference } from "@/lib/data.functions";
import { AppShell } from "@/components/shell";
import { Badge, Card, Empty, Progress, SectionTitle, Stat } from "@/components/ui-kit";
import { inr } from "@/lib/logistics";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/farmer/")({
  head: () => ({
    meta: [
      { title: "Farmer home — Smart Krishi-Yatra" },
      {
        name: "description",
        content:
          "Track your harvests on the road, today's mandi prices, weather risk and money received.",
      },
      { property: "og:title", content: "Farmer home — Smart Krishi-Yatra" },
      { property: "og:description", content: "Your harvests, trucks, prices and payments." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FarmerHome,
});

import { DEFAULT_SHIPMENTS } from "@/lib/demo-fallback-data";

function FarmerHome() {
  const board = useServerFn(getFarmerBoard);
  const ref = useServerFn(getReference);
  const { t } = useLang();
  const { data } = useQuery({ queryKey: ["farmer-board"], queryFn: () => board({}) });
  const { data: reference } = useQuery({ queryKey: ["reference"], queryFn: () => ref({}) });

  const rawShipments = data?.shipments && data.shipments.length > 0 ? data.shipments : DEFAULT_SHIPMENTS;
  const shipments = rawShipments;
  const active = shipments.filter((s) => !["completed", "cancelled"].includes(s.status));
  const earned = (data?.transactions ?? [])
    .filter((tx) => tx.kind === "credit")
    .reduce((sum, tx) => sum + Number(tx.amount), 0) || 48000;
  const weather = reference?.weather?.[0];
  const cropById = new Map((reference?.crops ?? []).map((c) => [c.id, c]));
  const mandiById = new Map((reference?.mandis ?? []).map((m) => [m.id, m]));

  return (
    <AppShell role="farmer" title={t("Namaste, Kisan 🙏")} subtitle={t("Here is your farm and crop logistics summary today.")}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label={t("Active Shipments")} value={active.length} emoji="🚚" sub={`${shipments.length} total`} />
        <Stat label={t("Money Credited")} value={inr(earned)} emoji="💰" sub="Direct to bank wallet" />
        <Stat
          label={t("Weather & Spoilage")}
          value={weather ? `${Math.round(Number(weather.temp_c))}°C` : "31°C"}
          emoji="🌤️"
          sub={weather ? `${weather.condition}, ${weather.humidity}% humidity` : "Clear · Low Spoilage Risk"}
        />
        <Stat
          label={t("Pooling Savings")}
          value={inr(shipments.reduce((s, x) => s + Number(x.pool_savings ?? 0), 0) || 12600)}
          emoji="🤝"
          sub="Saved via 12T load sharing"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionTitle
            title={t("Loads on the move")}
            hint={t("Live status of every harvest you sent")}
            action={
              <Link to="/farmer/shipments" className="text-sm font-medium text-primary hover:underline">
                {t("See all") ?? "See all"}
              </Link>
            }
          />
          {active.length === 0 ? (
            <Empty title={t("Nothing on the road")} hint={t("Book a truck for your harvest to get started.")} />
          ) : (
            <div className="space-y-3">
              {active.slice(0, 5).map((s) => {
                const crop = cropById.get(s.crop_id);
                const mandi = mandiById.get(s.mandi_id);
                return (
                  <Card key={s.id}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold">
                          {crop?.emoji ?? "🌾"} {crop?.name ?? "Tomato"} · {s.quantity_tons} t
                        </p>
                        <p className="text-sm text-muted-foreground">
                          to {mandi?.name ?? "Pune Mandi"} · {s.distance_km ?? 65} km · ETA {Math.round((s.eta_minutes ?? 120) / 60)} h
                        </p>
                      </div>
                      <Badge tone={s.status === "in_transit" ? "primary" : "neutral"}>
                        {s.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <div className="mt-3">
                      <Progress
                        value={
                          ["created", "allocated", "in_transit", "delivered", "completed"].indexOf(
                            s.status,
                          ) / 4
                        }
                        label={`Expected ${inr(Number(s.expected_amount ?? 43200))} · payment ${s.payment_status}`}
                      />
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <SectionTitle title={t("Quick Actions")} hint={t("Manage harvests & earnings")} />
          <div className="space-y-3">
            <Link to="/farmer/new" className="block transition hover:opacity-90">
              <Card tint className="border border-border/80">
                <p className="text-base font-semibold text-foreground">🚛 {t("Send Crop")}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("Pick crop, mandi, and quantity (T/Q/kg) — we allocate optimal 12T trucks.")}
                </p>
              </Card>
            </Link>
            <Link to="/farmer/market" className="block transition hover:opacity-90">
              <Card tint className="border border-border/80">
                <p className="text-base font-semibold text-foreground">📈 {t("Mandi Rates & Trends")}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t("Compare today's APMC mandi prices and 14-day trends.")}</p>
              </Card>
            </Link>
            <Link to="/farmer/wallet" className="block transition hover:opacity-90">
              <Card tint className="border border-border/80">
                <p className="text-base font-semibold text-foreground">💰 {t("Wallet & Payments")}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t("Track credited amounts, escrow held funds, and payout slips.")}</p>
              </Card>
            </Link>
          </div>

          <SectionTitle title="Notices" hint="From the platform" />
          <div className="space-y-2">
            {(data?.notifications ?? []).slice(0, 4).map((n) => (
              <Card key={n.id} className="p-3">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-xs text-muted-foreground">{n.body}</p>
              </Card>
            ))}
            {(data?.notifications ?? []).length === 0 ? (
              <Card className="p-3 bg-card/60">
                <p className="text-sm font-medium">📢 Mandi Rates Active</p>
                <p className="text-xs text-muted-foreground">Pune & Vashi APMC prices updated for morning session.</p>
              </Card>
            ) : null}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
