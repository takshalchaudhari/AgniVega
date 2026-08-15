import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { createShipment, getReference, planShipment } from "@/lib/data.functions";
import { AppShell } from "@/components/shell";
import { Badge, Button, Card, Field, Progress, SectionTitle, inputClass } from "@/components/ui-kit";
import { costPlan, validateAllocation, type PlanRow } from "@/lib/logistics";
import { inr } from "@/lib/logistics";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/farmer/new")({
  head: () => ({
    meta: [
      { title: "Send a crop — Smart Krishi-Yatra" },
      {
        name: "description",
        content:
          "Plan a harvest pickup: choose crop, mandi and tonnage, see truck allocation, cost, ETA and spoilage risk before you book.",
      },
      { property: "og:title", content: "Send a crop — Smart Krishi-Yatra" },
      { property: "og:description", content: "Truck allocation, cost and risk before you book." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NewShipment,
});

import { FALLBACK_CROPS, FALLBACK_MANDIS } from "@/lib/constants";

type Plan = Awaited<ReturnType<typeof planShipment>>;

function NewShipment() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const ref = useServerFn(getReference);
  const plan = useServerFn(planShipment);
  const create = useServerFn(createShipment);
  const { data: reference } = useQuery({ queryKey: ["reference"], queryFn: () => ref({}) });

  const [step, setStep] = useState(1);
  const [cropId, setCropId] = useState("");
  const [mandiId, setMandiId] = useState("");
  const [tons, setTons] = useState(6);
  const [priority, setPriority] = useState("normal");
  const [pooled, setPooled] = useState(true);
  const [grade, setGrade] = useState("A");
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [village, setVillage] = useState("Shirur");
  const [district, setDistrict] = useState("Pune");
  const [quote, setQuote] = useState<Plan | null>(null);
  const [rows, setRows] = useState<PlanRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const crops = reference?.crops && reference.crops.length > 0 ? reference.crops : FALLBACK_CROPS;
  const mandis = reference?.mandis && reference.mandis.length > 0 ? reference.mandis : FALLBACK_MANDIS;

  async function getQuote() {
    setError(null);
    setBusy(true);
    try {
      const res = await plan({
        data: { cropId, mandiId, farmId: null, tons, priority, pooled },
      });
      setQuote(res);
      setRows(res.allocations);
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not plan this load");
    } finally {
      setBusy(false);
    }
  }

  async function book() {
    setError(null);
    setBusy(true);
    try {
      const res = await create({
        data: {
          cropId,
          mandiId,
          farmId: null,
          tons,
          priority,
          pooled,
          harvestDate,
          grade,
          qualityNotes: notes,
          village,
          district,
          allocations: rows.map((r) => ({ vehicleId: r.vehicleId, tons: r.tons })),
        },
      });
      void res;
      await navigate({ to: "/farmer/shipments" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setBusy(false);
    }
  }

  const edited = costPlan(rows, quote?.distanceKm ?? 0, pooled, tons);
  const capacityError = validateAllocation(rows);
  const used = new Set(rows.map((r) => r.vehicleId));
  const spare = (quote?.availableVehicles ?? []).filter((v) => !used.has(v.vehicleId));
  const capacityOffered =
    Math.round(
      (quote?.availableVehicles ?? []).reduce((s, v) => s + Math.min(v.capacity, 12), 0) * 10,
    ) / 10;

  function repriced(next: { vehicleId: string; regNo: string; type: string; capacity: number; refrigerated: boolean; tons: number }[]) {
    return costPlan(next, quote?.distanceKm ?? 0, pooled, tons).rows;
  }
  function setTonsFor(index: number, value: number) {
    setRows((prev) => repriced(prev.map((r, i) => (i === index ? { ...r, tons: value } : r))));
  }
  function removeRow(index: number) {
    setRows((prev) => repriced(prev.filter((_, i) => i !== index)));
  }
  function addRow(vehicleId: string) {
    const v = (quote?.availableVehicles ?? []).find((x) => x.vehicleId === vehicleId);
    if (!v) return;
    setRows((prev) => {
      const remaining = Math.max(0, tons - prev.reduce((s, r) => s + r.tons, 0));
      return repriced([...prev, { ...v, tons: Math.min(remaining, Math.min(v.capacity, 12)) }]);
    });
  }
  function autoBalance() {
    setRows((prev) => {
      if (!prev.length) return prev;
      let left = tons;
      const share = tons / prev.length;
      return repriced(
        prev.map((r, i) => {
          const cap = Math.min(r.capacity, 12);
          const take = i === prev.length - 1 ? Math.min(left, cap) : Math.min(cap, Math.round(share * 2) / 2);
          left = Math.round((left - take) * 100) / 100;
          return { ...r, tons: take };
        }),
      );
    });
  }

  return (
    <AppShell role="farmer" title="Send your crop" subtitle={`Step ${step} of 3`}>
      <div className="mb-5">
        <Progress value={step / 3} />
      </div>

      {step === 1 ? (
        <Card className="space-y-4">
          <SectionTitle title="What are you sending?" />
          <Field label="Crop">
            <select className={inputClass} value={cropId} onChange={(e) => setCropId(e.target.value)}>
              <option value="">Select a crop</option>
              {crops.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.name} · {c.name_hi}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Quantity (tonnes)" hint="One truck can carry up to 12 tonnes.">
            <input
              type="number"
              min={0.5}
              step={0.5}
              className={inputClass}
              value={tons}
              onChange={(e) => setTons(Number(e.target.value))}
            />
          </Field>
          <Field label="Harvest date">
            <input
              type="date"
              className={inputClass}
              value={harvestDate}
              onChange={(e) => setHarvestDate(e.target.value)}
            />
          </Field>
          <Field label="Quality grade">
            <select className={inputClass} value={grade} onChange={(e) => setGrade(e.target.value)}>
              <option value="A">A — best</option>
              <option value="B">B — good</option>
              <option value="C">C — average</option>
            </select>
          </Field>
          <Field label="Notes for the buyer">
            <input className={inputClass} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>
          <Button disabled={!cropId || tons <= 0} onClick={() => setStep(2)}>
            Next
          </Button>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card className="space-y-4">
          <SectionTitle title="Where should it go?" />
          <Field label="Mandi">
            <select className={inputClass} value={mandiId} onChange={(e) => setMandiId(e.target.value)}>
              <option value="">Select a mandi</option>
              {mandis.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} · {m.district}
                </option>
              ))}
            </select>
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Your village">
              <input className={inputClass} value={village} onChange={(e) => setVillage(e.target.value)} />
            </Field>
            <Field label="District">
              <input className={inputClass} value={district} onChange={(e) => setDistrict(e.target.value)} />
            </Field>
          </div>
          <Field label="How urgent?">
            <select className={inputClass} value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </Field>
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" checked={pooled} onChange={(e) => setPooled(e.target.checked)} />
            Share the truck with nearby farmers to cut cost
          </label>
          <div className="flex gap-2">
            <Button variant="soft" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button disabled={!mandiId || busy} onClick={getQuote}>
              {busy ? "Calculating…" : "See plan & cost"}
            </Button>
          </div>
        </Card>
      ) : null}

      {step === 3 && quote ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="space-y-3">
            <SectionTitle title="Your transport plan" />
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Info label="Distance" value={`${quote.distanceKm} km`} />
              <Info label="ETA" value={`${Math.floor(quote.etaMinutes / 60)} h ${quote.etaMinutes % 60} m`} />
              <Info label="Transport cost" value={inr(edited.transportCost)} />
              <Info label="Pooling saved" value={inr(edited.poolSavings)} />
              <Info label="Rate today" value={`₹${quote.pricePerQuintal}/qtl`} />
              <Info label="You receive" value={inr(quote.grossAmount - edited.transportCost)} />
            </div>
            <div className="tint-panel p-3 text-sm">
              <Badge tone={quote.risk.level === "high" ? "bad" : quote.risk.level === "medium" ? "warn" : "good"}>
                Spoilage risk: {quote.risk.level}
              </Badge>
              <p className="mt-2 text-muted-foreground">{quote.risk.message}</p>
              {quote.needsCooling ? (
                <p className="mt-1 text-muted-foreground">A refrigerated vehicle is being used.</p>
              ) : null}
            </div>
          </Card>

          <Card className="space-y-3">
            <SectionTitle title="Trucks allocated" hint="12 tonne hard limit per vehicle" />
            <div className="tint-panel p-3 text-sm">
              <p className="font-semibold">
                {edited.allocatedTons} t of {tons} t loaded · transport {inr(edited.transportCost)}
                {pooled && edited.poolSavings > 0 ? ` (pooling saves ${inr(edited.poolSavings)})` : ""}
              </p>
              <p className="text-muted-foreground">
                Fleet capacity offered: {capacityOffered} t across {quote.availableVehicles.length} free trucks.
              </p>
            </div>
            {rows.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No truck is assigned yet. Add one below or your load will be queued.
              </p>
            ) : (
              rows.map((a, i) => (
                <div key={a.vehicleId} className="tint-panel space-y-2 p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{a.regNo}</p>
                      <p className="text-muted-foreground">
                        {a.type} · up to {Math.min(a.capacity, 12)} t {a.refrigerated ? "· cooled" : ""}
                      </p>
                    </div>
                    <Badge tone={a.utilization > 100 ? "bad" : "primary"}>{a.utilization}% full</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={0}
                      max={Math.min(a.capacity, 12)}
                      step={0.5}
                      value={a.tons}
                      className="w-full"
                      onChange={(e) => setTonsFor(i, Number(e.target.value))}
                    />
                    <input
                      type="number"
                      min={0}
                      max={Math.min(a.capacity, 12)}
                      step={0.5}
                      className={`${inputClass} w-24`}
                      value={a.tons}
                      onChange={(e) => setTonsFor(i, Number(e.target.value))}
                    />
                    <Button variant="ghost" onClick={() => removeRow(i)}>
                      Remove
                    </Button>
                  </div>
                  <Progress value={Math.min(1, a.tons / Math.min(a.capacity, 12))} />
                  <p className="text-xs text-muted-foreground">
                    Cost for this truck {inr(a.cost)} · legal limit 12 t
                  </p>
                </div>
              ))
            )}
            {spare.length ? (
              <Field label="Add another truck">
                <select
                  className={inputClass}
                  value=""
                  onChange={(e) => e.target.value && addRow(e.target.value)}
                >
                  <option value="">Choose a free truck</option>
                  {spare.map((v) => (
                    <option key={v.vehicleId} value={v.vehicleId}>
                      {v.regNo} · {v.type} · {Math.min(v.capacity, 12)} t {v.refrigerated ? "· cooled" : ""}
                    </option>
                  ))}
                </select>
              </Field>
            ) : null}
            <div className="flex gap-2">
              <Button variant="soft" onClick={() => setRows(quote.allocations)}>
                Reset to suggestion
              </Button>
              <Button variant="soft" onClick={autoBalance}>
                Balance evenly
              </Button>
            </div>
            {capacityError ? <p className="text-sm text-destructive">{capacityError}</p> : null}
            {edited.unassignedTons > 0 ? (
              <p className="text-sm text-destructive">
                {edited.unassignedTons} t still needs a truck.
              </p>
            ) : null}

            {user ? (
              <Button
                className="w-full"
                disabled={busy || !!capacityError || edited.unassignedTons > 0}
                onClick={book}
              >
                {busy ? "Booking…" : "Confirm and book"}
              </Button>
            ) : (
              <Button className="w-full" variant="soft" onClick={() => navigate({ to: "/auth" })}>
                Sign in to book this load
              </Button>
            )}
            <Button variant="ghost" className="w-full" onClick={() => setStep(2)}>
              Change details
            </Button>
          </Card>
        </div>
      ) : null}

      {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
    </AppShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="tint-panel p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
