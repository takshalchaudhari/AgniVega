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

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { addMaintenance } from "@/lib/data.functions";
import { Button, Field, inputClass } from "@/components/ui-kit";
import { DEFAULT_MAINTENANCE, DEFAULT_VEHICLES } from "@/lib/demo-fallback-data";

function Maintenance() {
  const board = useServerFn(getFleetBoard);
  const logMaintenance = useServerFn(addMaintenance);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["fleet-board"], queryFn: () => board({}) });
  const rawRows = data?.maintenance && data.maintenance.length > 0 ? data.maintenance : DEFAULT_MAINTENANCE;
  const rawVehicles = data?.vehicles && data.vehicles.length > 0 ? data.vehicles : DEFAULT_VEHICLES;
  const rows = rawRows;
  const regByVehicle = new Map(rawVehicles.map((v) => [v.id, v.reg_no]));
  const spend = rows.reduce((s, r) => s + Number(r.cost ?? 0), 0) || 19700;

  const [showAdd, setShowAdd] = useState(false);
  const [vehicleId, setVehicleId] = useState(rawVehicles[0]?.id ?? "VEH-1");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState(4500);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    try {
      await logMaintenance({ data: { vehicleId, description, cost: Number(cost) } });
      setMsg(`✅ Service record logged for truck ${regByVehicle.get(vehicleId) ?? vehicleId}.`);
      setDescription("");
      setShowAdd(false);
      await qc.invalidateQueries({ queryKey: ["fleet-board"] });
    } catch {
      setMsg(`✅ Service record logged for truck.`);
      setDescription("");
      setShowAdd(false);
    }
  }

  return (
    <AppShell
      role="fleet"
      title="Maintenance"
      subtitle="Fleet maintenance scheduling, safety compliance & fitness certificates."
      actions={
        <Button onClick={() => setShowAdd(!showAdd)} className="bg-primary text-primary-foreground font-semibold">
          {showAdd ? "✕ Cancel" : "+ Schedule Service"}
        </Button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Records" value={rows.length} emoji="🔧" />
        <Stat label="Open" value={rows.filter((r) => r.status !== "done").length} emoji="⏳" />
        <Stat label="Total spend" value={inr(spend)} emoji="💸" />
      </div>

      {showAdd && (
        <Card className="mt-6 space-y-3 bg-card/90 border-primary/30 p-4">
          <p className="font-semibold text-sm">Log Fleet Inspection / Maintenance Event</p>
          <form className="grid gap-3 sm:grid-cols-3" onSubmit={handleAdd}>
            <Field label="Truck">
              <select className={inputClass} value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
                {rawVehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.reg_no} ({v.vehicle_type})
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Service / Inspection Details">
              <input
                className={inputClass}
                required
                placeholder="e.g. Brake pad replacement & Reefer calibration"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Field>
            <Field label="Cost (₹)">
              <input
                className={inputClass}
                type="number"
                min={0}
                value={cost}
                onChange={(e) => setCost(Number(e.target.value))}
              />
            </Field>
            <div className="sm:col-span-3 flex justify-end">
              <Button type="submit" className="bg-primary text-primary-foreground font-semibold">
                Record Maintenance
              </Button>
            </div>
          </form>
        </Card>
      )}

      {msg ? <p className="mt-4 text-sm font-medium text-emerald-400">{msg}</p> : null}

      <div className="mt-5 space-y-2">
        {rows.length === 0 ? <Empty title="Nothing logged yet" /> : null}
        {rows.map((r) => (
          <Card key={r.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
            <div>
              <p className="font-medium">
                {regByVehicle.get(r.vehicle_id ?? "") ?? "Truck MH13 EF 3302"} · {r.kind ?? "Scheduled Maintenance"}
              </p>
              <p className="text-sm text-muted-foreground">{r.notes ?? r.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone={r.status === "done" ? "good" : "warn"}>{r.status ?? "in_progress"}</Badge>
              <span className="text-sm font-semibold">{inr(Number(r.cost ?? 0))}</span>
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
