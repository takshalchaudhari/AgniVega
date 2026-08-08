import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { BrandHeader } from "@/components/agnivega/BrandHeader";
import { AuthButton } from "@/components/agnivega/AuthButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DemoControlPanel } from "@/components/agnivega/DemoControlPanel";
import { rupees } from "@/lib/krishi/constants";
import {
  getAdminOverview,
  overrideMandiPrice,
  reviewKyc,
  updateCommission,
} from "@/lib/krishi/admin.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Control Tower — Smart Krishi-Yatra AI" },
      {
        name: "description",
        content: "Approve driver KYC, tune commission and diesel indexing, and audit every platform action.",
      },
      { property: "og:title", content: "Admin Control Tower — Smart Krishi-Yatra AI" },
      { property: "og:description", content: "Governance, KYC review, pricing overrides and audit trail." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminPortal,
});

function AdminPortal() {
  const queryClient = useQueryClient();
  const overviewFn = useServerFn(getAdminOverview);
  const kycFn = useServerFn(reviewKyc);
  const commissionFn = useServerFn(updateCommission);
  const priceFn = useServerFn(overrideMandiPrice);

  const overview = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => overviewFn({}),
    retry: false,
  });

  const [config, setConfig] = useState({ ratePercent: 3, dieselPrice: 99.07, petrolPrice: 112.44 });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-overview"] });

  const decide = useMutation({
    mutationFn: (vars: { driverId: string; decision: "approved" | "rejected" }) =>
      kycFn({ data: { ...vars, reason: null } }),
    onSuccess: () => {
      toast.success("KYC decision recorded");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveConfig = useMutation({
    mutationFn: () => commissionFn({ data: config }),
    onSuccess: () => {
      toast.success("Platform economics updated");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const override = useMutation({
    mutationFn: (vars: { id: string; pricePerKg: number }) => priceFn({ data: vars }),
    onSuccess: () => {
      toast.success("Mandi price overridden");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (overview.isError) {
    return (
      <div className="min-h-screen bg-secondary/30">
        <BrandHeader active="Admin" />
        <main className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="text-xl font-semibold">Administrator access required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account does not hold the admin role for this deployment.
          </p>
        </main>
      </div>
    );
  }

  const data = overview.data;
  const gmv = (data?.shipments ?? []).reduce(
    (sum: number, s: any) => sum + Number(s.gross_payout ?? 0),
    0,
  );
  const fees = (data?.shipments ?? []).reduce(
    (sum: number, s: any) => sum + Number(s.platform_fee ?? 0),
    0,
  );

  return (
    <div className="min-h-screen bg-secondary/30">
      <BrandHeader active="Admin" />
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-primary">Control Tower</h1>
            <p className="text-sm text-muted-foreground">
              Governance, KYC, pricing and the immutable audit trail.
            </p>
          </div>
          <AuthButton />
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Stat label="Shipments" value={String(data?.shipments.length ?? 0)} />
          <Stat label="Trips" value={String(data?.trips.length ?? 0)} />
          <Stat label="GMV" value={rupees(gmv)} />
          <Stat label="Platform fees" value={rupees(fees)} />
        </div>

        <Tabs defaultValue="kyc">
          <TabsList>
            <TabsTrigger value="kyc">KYC queue</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="resilience">Router health</TabsTrigger>
            <TabsTrigger value="demo">Demo control</TabsTrigger>
            <TabsTrigger value="audit">Audit log</TabsTrigger>
          </TabsList>

          <TabsContent value="kyc" className="mt-4 space-y-2">
            {(data?.kyc ?? []).map((row: any) => (
              <div key={row.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-card p-3">
                <span className="text-sm">
                  {row.drivers?.full_name ?? "Driver"} · {row.doc_type}
                </span>
                <Badge variant="secondary">{row.status}</Badge>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => decide.mutate({ driverId: row.driver_id, decision: "approved" })}>
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => decide.mutate({ driverId: row.driver_id, decision: "rejected" })}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
            {(data?.kyc ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">KYC queue is empty.</p>
            )}
          </TabsContent>

          <TabsContent value="pricing" className="mt-4 space-y-4">
            <Card className="max-w-lg">
              <CardHeader>
                <CardTitle className="text-base">Fuel index & commission</CardTitle>
                <CardDescription>
                  Commission is clamped to the 3–5% band agreed with farmer collectives.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-3">
                <div>
                  <Label>Commission %</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min={3}
                    max={5}
                    value={config.ratePercent}
                    onChange={(e) => setConfig({ ...config, ratePercent: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Diesel ₹/L</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={config.dieselPrice}
                    onChange={(e) => setConfig({ ...config, dieselPrice: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Petrol ₹/L</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={config.petrolPrice}
                    onChange={(e) => setConfig({ ...config, petrolPrice: Number(e.target.value) })}
                  />
                </div>
                <Button className="md:col-span-3" onClick={() => saveConfig.mutate()} disabled={saveConfig.isPending}>
                  Save economics
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Mandi price overrides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(data?.prices ?? []).slice(0, 25).map((row: any) => (
                  <div key={row.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-2 text-sm">
                    <span>
                      {row.mandis?.name} · {row.crops?.name_en}
                    </span>
                    <span className="text-muted-foreground">source: {row.source}</span>
                    <div className="flex items-center gap-2">
                      <Input
                        className="h-8 w-24"
                        type="number"
                        step="0.5"
                        defaultValue={Number(row.price_per_kg)}
                        onBlur={(e) =>
                          Number(e.target.value) !== Number(row.price_per_kg) &&
                          override.mutate({ id: row.id, pricePerKg: Number(e.target.value) })
                        }
                      />
                      <span className="text-xs text-muted-foreground">₹/kg</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resilience" className="mt-4 space-y-2">
            <p className="text-sm text-muted-foreground">
              Every routing call records which tier answered: OpenRouteService, OSRM, or the offline
              Haversine fallback.
            </p>
            {(data?.fallback ?? []).map((row: any) => (
              <div key={row.id} className="flex items-center justify-between rounded-md border bg-card p-3 text-sm">
                <Badge variant="outline">{row.tier}</Badge>
                <span>{row.outcome}</span>
                <span className="text-muted-foreground">{row.latency_ms} ms</span>
              </div>
            ))}
            {(data?.fallback ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">No router telemetry recorded yet.</p>
            )}
          </TabsContent>

          <TabsContent value="demo" className="mt-4">
            <DemoControlPanel />
          </TabsContent>

          <TabsContent value="audit" className="mt-4 space-y-1">
            {(data?.audit ?? []).map((row: any) => (
              <div key={row.id} className="rounded-md border bg-card p-2 font-mono text-xs">
                {new Date(row.created_at).toLocaleString("en-IN")} · {row.action} · {row.entity}#
                {String(row.entity_id).slice(0, 8)}
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold text-primary">{value}</p>
      </CardContent>
    </Card>
  );
}