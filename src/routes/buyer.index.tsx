import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { getBuyerBoard, purchaseListing } from "@/lib/data.functions";
import { AppShell } from "@/components/shell";
import { Badge, Button, Card, Empty, SectionTitle, inputClass } from "@/components/ui-kit";
import { inr } from "@/lib/logistics";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/buyer/")({
  head: () => ({
    meta: [
      { title: "Produce market — Smart Krishi-Yatra" },
      { name: "description", content: "Buy graded produce direct from farms, with grade, quantity and mandi rate shown up front." },
      { property: "og:title", content: "Produce market — Smart Krishi-Yatra" },
      { property: "og:description", content: "Graded lots direct from the farm gate." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BuyerMarket,
});

import {
  DEFAULT_LISTINGS,
} from "@/lib/demo-fallback-data";

function BuyerMarket() {
  const board = useServerFn(getBuyerBoard);
  const buy = useServerFn(purchaseListing);
  const qc = useQueryClient();
  const { user } = useAuth();
  const { data } = useQuery({ queryKey: ["buyer-board"], queryFn: () => board({}) });
  const [qty, setQty] = useState<Record<string, number>>({});
  const [msg, setMsg] = useState<string | null>(null);

  const [cropFilter, setCropFilter] = useState("");
  const [mandiFilter, setMandiFilter] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const rawListings = data?.listings && data.listings.length > 0 ? data.listings : DEFAULT_LISTINGS;
  const all = rawListings.filter((l) => l.available && Number(l.quantity_tons) > 0);
  const cropOptions = Array.from(
    new Map(
      all.map((l) => {
        const c = l.crops as unknown as { name: string; emoji: string } | null;
        return [l.crop_id, `${c?.emoji ?? "🌾"} ${c?.name ?? l.crop_id}`] as const;
      }),
    ),
  );
  const mandiOptions = Array.from(
    new Map(
      all.map((l) => {
        const m = l.mandis as unknown as { name: string } | null;
        return [l.mandi_id ?? "", m?.name ?? "Mandi Gate"] as const;
      }),
    ),
  ).filter(([id]) => id);

  const listings = all.filter(
    (l) =>
      (!cropFilter || l.crop_id === cropFilter) &&
      (!mandiFilter || l.mandi_id === mandiFilter) &&
      (!gradeFilter || l.grade === gradeFilter) &&
      (!maxPrice || Number(l.price_per_quintal) <= Number(maxPrice)),
  );

  const todayRates = new Map(
    (data?.prices ?? []).map((p) => [`${p.crop_id}|${p.mandi_id}`, Number(p.price_per_quintal)]),
  );

  async function order(id: string, max: number) {
    setMsg(null);
    const tons = qty[id] ?? Math.min(1, max);
    try {
      const res = await buy({ data: { listingId: id, tons, buyerName: user?.email ?? "Buyer" } });
      setMsg(`Order placed for ${tons} t — ${inr(res.total)}.`);
      await qc.invalidateQueries({ queryKey: ["buyer-board"] });
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Could not place the order");
    }
  }

  return (
    <AppShell role="buyer" title="Produce market" subtitle="Graded lots, straight from the farm.">
      <SectionTitle title="Find produce" hint="Filter by crop, mandi, grade and price" />
      <Card className="grid gap-3 sm:grid-cols-4">
        <select className={inputClass} value={cropFilter} onChange={(e) => setCropFilter(e.target.value)}>
          <option value="">All crops</option>
          {cropOptions.map(([id, label]) => (
            <option key={id} value={id}>{label}</option>
          ))}
        </select>
        <select className={inputClass} value={mandiFilter} onChange={(e) => setMandiFilter(e.target.value)}>
          <option value="">All mandis</option>
          {mandiOptions.map(([id, label]) => (
            <option key={id} value={id}>{label}</option>
          ))}
        </select>
        <select className={inputClass} value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)}>
          <option value="">Any grade</option>
          <option value="A">Grade A</option>
          <option value="B">Grade B</option>
          <option value="C">Grade C</option>
        </select>
        <input
          className={inputClass}
          type="number"
          placeholder="Max ₹/qtl"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
      </Card>

      <SectionTitle title="Available lots" hint={`${listings.length} of ${all.length} listings`} />
      {listings.length === 0 ? (
        <Empty title="No lots on sale right now" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((l) => {
            const crop = l.crops as unknown as { name: string; emoji: string } | null;
            const farm = l.farms as unknown as { village: string; district: string } | null;
            const max = Number(l.quantity_tons);
            return (
              <Card key={l.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">
                    {crop?.emoji} {crop?.name}
                  </p>
                  <Badge tone="accent">Grade {l.grade}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {max} t available · {farm?.village ?? "farm"}, {farm?.district ?? ""}
                </p>
                <p className="text-xl font-semibold">₹{Number(l.price_per_quintal).toFixed(0)}/qtl</p>
                {todayRates.has(`${l.crop_id}|${l.mandi_id}`) ? (
                  <p className="text-xs text-muted-foreground">
                    Mandi rate today ₹{todayRates.get(`${l.crop_id}|${l.mandi_id}`)}/qtl
                  </p>
                ) : null}
                <input
                  type="number"
                  min={0.5}
                  max={max}
                  step={0.5}
                  className={inputClass}
                  value={qty[l.id] ?? Math.min(1, max)}
                  onChange={(e) => setQty((q) => ({ ...q, [l.id]: Number(e.target.value) }))}
                />
                <Button className="w-full bg-primary text-primary-foreground font-semibold" onClick={() => order(l.id, max)}>
                  🛒 Buy {qty[l.id] ?? Math.min(1, max)} t (Lock Escrow)
                </Button>
              </Card>
            );
          })}
        </div>
      )}
      {msg ? <p className="mt-4 text-sm font-medium text-emerald-400">{msg}</p> : null}
    </AppShell>
  );
}
