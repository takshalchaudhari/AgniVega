import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { getFarmerBoard, getReference } from "@/lib/data.functions";
import { AppShell } from "@/components/shell";
import { Badge, Card, Empty, Progress, RouteMap } from "@/components/ui-kit";
import { TRIP_FLOW, inr, tripProgress } from "@/lib/logistics";

export const Route = createFileRoute("/farmer/shipments")({
  head: () => ({
    meta: [
      { title: "My loads — Smart Krishi-Yatra" },
      {
        name: "description",
        content: "Every harvest you sent: truck, driver, live trip stage, cost and payment status.",
      },
      { property: "og:title", content: "My loads — Smart Krishi-Yatra" },
      { property: "og:description", content: "Live trip stages and payment status for each load." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Shipments,
});

function Shipments() {
  const board = useServerFn(getFarmerBoard);
  const ref = useServerFn(getReference);
  const { data } = useQuery({
    queryKey: ["farmer-board"],
    queryFn: () => board({}),
    refetchInterval: 15000,
  });
  const { data: reference } = useQuery({ queryKey: ["reference"], queryFn: () => ref({}) });
  const [filter, setFilter] = useState("all");

  const cropById = new Map((reference?.crops ?? []).map((c) => [c.id, c]));
  const mandiById = new Map((reference?.mandis ?? []).map((m) => [m.id, m]));
  const farmById = new Map((data?.farms ?? []).map((f) => [f.id, f]));
  const shipments = (data?.shipments ?? []).filter((s) =>
    filter === "all" ? true : filter === "open" ? s.status !== "completed" : s.status === "completed",
  );

  return (
    <AppShell role="farmer" title="My loads" subtitle="Tap a load to follow its journey.">
      <div className="mb-4 flex gap-2">
        {[
          { k: "all", l: "All" },
          { k: "open", l: "On the road" },
          { k: "done", l: "Completed" },
        ].map((f) => (
          <button
            key={f.k}
            onClick={() => setFilter(f.k)}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              filter === f.k ? "bg-primary text-primary-foreground" : "border border-border"
            }`}
          >
            {f.l}
          </button>
        ))}
      </div>

      {shipments.length === 0 ? (
        <Empty title="No loads here yet" hint="Book a truck from the Send crop screen." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {shipments.map((s) => {
            const crop = cropById.get(s.crop_id);
            const mandi = mandiById.get(s.mandi_id);
            const farm = s.farm_id ? farmById.get(s.farm_id) : null;
            const trips = (data?.trips ?? []).filter((t) => t.shipment_id === s.id);
            const trip = trips[0];
            return (
              <Card key={s.id} className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold">
                      {crop?.emoji} {crop?.name} · {s.quantity_tons} t
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {farm?.village ?? "Farm"} → {mandi?.name ?? "Mandi"} · {s.distance_km} km
                    </p>
                  </div>
                  <Badge tone={s.status === "completed" ? "good" : "primary"}>
                    {s.status.replace(/_/g, " ")}
                  </Badge>
                </div>

                {farm && mandi ? (
                  <RouteMap
                    points={[
                      { lat: farm.lat, lng: farm.lng, label: `Pickup · ${farm.village}` },
                      { lat: mandi.lat, lng: mandi.lng, label: `Drop · ${mandi.name}` },
                    ]}
                    progress={trip ? tripProgress(trip.status) : 0}
                    trip={{
                      title: `${crop?.name ?? "Load"} · ${s.quantity_tons} t`,
                      details: [
                        ["Shipment", s.id],
                        ["Status", (trip?.status ?? s.status).replace(/_/g, " ")],
                        ["Harvested", s.harvest_date],
                        ["Grade", s.quality_grade],
                        ["Distance", `${s.distance_km} km`],
                        ["ETA", `${s.eta_minutes} min`],
                        ["Expected", inr(Number(s.expected_amount ?? 0))],
                      ],
                    }}
                  />

                ) : null}

                <div className="grid grid-cols-3 gap-2 text-sm">
                  <Metric label="Transport" value={inr(Number(s.transport_cost ?? 0))} />
                  <Metric label="Saved" value={inr(Number(s.pool_savings ?? 0))} />
                  <Metric label="You get" value={inr(Number(s.expected_amount ?? 0))} />
                </div>

                {trip ? (
                  <div>
                    <Progress
                      value={tripProgress(trip.status)}
                      label={`${trip.status.replace(/_/g, " ")} · step ${TRIP_FLOW.indexOf(trip.status as never) + 1} of ${TRIP_FLOW.length}`}
                    />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Waiting for a truck to accept.</p>
                )}

                <p className="text-xs text-muted-foreground">
                  Payment: {s.payment_status} · grade {s.quality_grade} · booked{" "}
                  {new Date(s.created_at).toLocaleDateString("en-IN")}
                </p>
              </Card>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="tint-panel p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
