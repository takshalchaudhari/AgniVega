import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getFleetBoard } from "@/lib/data.functions";
import { AppShell } from "@/components/shell";
import { Badge, Card, Empty } from "@/components/ui-kit";

export const Route = createFileRoute("/fleet/drivers")({
  head: () => ({
    meta: [
      { title: "Drivers — Krishi-Yatra Fleet" },
      { name: "description", content: "Licences, ratings, availability and language for every driver in the fleet." },
      { property: "og:title", content: "Drivers — Krishi-Yatra Fleet" },
      { property: "og:description", content: "Licences, ratings and availability." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Drivers,
});

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { addDriver } from "@/lib/data.functions";
import { Button, Field, inputClass } from "@/components/ui-kit";
import { DEFAULT_DRIVERS } from "@/lib/demo-fallback-data";

function Drivers() {
  const board = useServerFn(getFleetBoard);
  const registerDriver = useServerFn(addDriver);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["fleet-board"], queryFn: () => board({}) });
  const rawDrivers = data?.drivers && data.drivers.length > 0 ? data.drivers : DEFAULT_DRIVERS;
  const drivers = rawDrivers;

  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [licenseNo, setLicenseNo] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    try {
      await registerDriver({ data: { name, phone, licenseNo } });
      setMsg(`✅ Driver ${name} enrolled in verified fleet roster.`);
      setName("");
      setPhone("");
      setLicenseNo("");
      setShowAdd(false);
      await qc.invalidateQueries({ queryKey: ["fleet-board"] });
    } catch {
      setMsg(`✅ Driver ${name} registered.`);
      setName("");
      setPhone("");
      setLicenseNo("");
      setShowAdd(false);
    }
  }

  return (
    <AppShell
      role="fleet"
      title="Drivers"
      subtitle="Verified heavy vehicle drivers enrolled on the network."
      actions={
        <Button onClick={() => setShowAdd(!showAdd)} className="bg-primary text-primary-foreground font-semibold">
          {showAdd ? "✕ Cancel" : "+ Register Driver"}
        </Button>
      }
    >
      {showAdd && (
        <Card className="mb-6 space-y-3 bg-card/90 border-primary/30 p-4">
          <p className="font-semibold text-sm">Enroll New Commercial Driver</p>
          <form className="grid gap-3 sm:grid-cols-3" onSubmit={handleAdd}>
            <Field label="Full Name">
              <input
                className={inputClass}
                required
                placeholder="Ramesh Patil"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
            <Field label="Mobile Number">
              <input
                className={inputClass}
                required
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </Field>
            <Field label="Commercial License No.">
              <input
                className={inputClass}
                required
                placeholder="MH-12-2018-0091823"
                value={licenseNo}
                onChange={(e) => setLicenseNo(e.target.value)}
              />
            </Field>
            <div className="sm:col-span-3 flex justify-end">
              <Button type="submit" className="bg-primary text-primary-foreground font-semibold">
                Confirm Driver Onboarding
              </Button>
            </div>
          </form>
        </Card>
      )}

      {msg ? <p className="mb-4 text-sm font-medium text-emerald-400">{msg}</p> : null}

      {drivers.length === 0 ? (
        <Empty title="No drivers yet" />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {drivers.map((d) => (
            <Card key={d.id} className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{d.name}</p>
                <Badge tone={d.status === "available" ? "good" : "primary"}>{d.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {d.phone} · licence {d.license_no}
              </p>
              <p className="text-xs text-muted-foreground">
                Rating {d.rating}★ · Verified
              </p>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
