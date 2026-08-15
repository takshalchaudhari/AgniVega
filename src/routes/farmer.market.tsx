import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { getPrices, getReference } from "@/lib/data.functions";
import { AppShell } from "@/components/shell";
import { Badge, Card, Empty, Field, SectionTitle, inputClass } from "@/components/ui-kit";

export const Route = createFileRoute("/farmer/market")({
  head: () => ({
    meta: [
      { title: "Mandi prices — Smart Krishi-Yatra" },
      {
        name: "description",
        content:
          "Compare today's APMC mandi rates for your crop, see the 14-day trend and pick the best market.",
      },
      { property: "og:title", content: "Mandi prices — Smart Krishi-Yatra" },
      { property: "og:description", content: "Today's rates and trend for every crop and mandi." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Market,
});

import { FALLBACK_CROPS, FALLBACK_MANDIS } from "@/lib/constants";

function Market() {
  const ref = useServerFn(getReference);
  const priceFn = useServerFn(getPrices);
  const { data: reference } = useQuery({ queryKey: ["reference"], queryFn: () => ref({}) });
  const [cropId, setCropId] = useState("");

  const crops = reference?.crops && reference.crops.length > 0 ? reference.crops : FALLBACK_CROPS;
  const mandis = reference?.mandis && reference.mandis.length > 0 ? reference.mandis : FALLBACK_MANDIS;
  const selected = cropId || crops[0]?.id || "onion";
  const { data: prices } = useQuery({
    queryKey: ["prices", selected],
    queryFn: () => priceFn({ data: { cropId: selected } }),
    enabled: Boolean(selected),
  });

  const mandiById = new Map(mandis.map((m) => [m.id, m]));
  const latestDate = prices?.[0]?.recorded_on;
  const today = (prices ?? []).filter((p) => p.recorded_on === latestDate);
  const best = [...today].sort(
    (a, b) => Number(b.price_per_quintal) - Number(a.price_per_quintal),
  )[0];
  const history = (prices ?? [])
    .filter((p) => p.mandi_id === best?.mandi_id)
    .slice(0, 14)
    .reverse();
  const max = Math.max(...history.map((h) => Number(h.price_per_quintal)), 1);
  const min = Math.min(...history.map((h) => Number(h.price_per_quintal)), max);

  return (
    <AppShell role="farmer" title="Market rates" subtitle="Sell where the price is best today.">
      <Card className="mb-5">
        <Field label="Crop">
          <select className={inputClass} value={selected} onChange={(e) => setCropId(e.target.value)}>
            {crops.map((c) => (
              <option key={c.id} value={c.id}>
                {c.emoji} {c.name} · {c.name_mr}
              </option>
            ))}
          </select>
        </Field>
      </Card>

      {today.length === 0 ? (
        <Empty title="No prices published yet" />
      ) : (
        <>
          <SectionTitle title="Today's rates" hint={latestDate ?? ""} />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[...today]
              .sort((a, b) => Number(b.price_per_quintal) - Number(a.price_per_quintal))
              .map((p) => (
                <Card key={p.id}>
                  <p className="text-sm font-medium">{mandiById.get(p.mandi_id)?.name}</p>
                  <p className="text-2xl font-semibold">₹{Number(p.price_per_quintal).toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">per quintal · arrivals {p.arrivals_tons} t</p>
                  {p.id === best?.id ? (
                    <div className="mt-2">
                      <Badge tone="good">Best price today</Badge>
                    </div>
                  ) : null}
                </Card>
              ))}
          </div>

          <SectionTitle
            title="14-day trend"
            hint={`At ${mandiById.get(best?.mandi_id ?? "")?.name ?? "top mandi"}`}
          />
          <Card>
            <div className="flex h-40 items-end gap-1.5">
              {history.map((h) => {
                const v = Number(h.price_per_quintal);
                const pct = ((v - min) / Math.max(1, max - min)) * 80 + 20;
                return (
                  <div key={h.id} className="flex flex-1 flex-col items-center gap-1">
                    <div className="w-full rounded-t bg-primary/70" style={{ height: `${pct}%` }} />
                    <span className="text-[9px] text-muted-foreground">
                      {new Date(h.recorded_on).getDate()}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Range ₹{min.toFixed(0)} – ₹{max.toFixed(0)} per quintal.
            </p>
          </Card>
        </>
      )}
    </AppShell>
  );
}
