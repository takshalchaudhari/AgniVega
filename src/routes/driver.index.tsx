import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { advanceTrip, getDriverBoard, reportIncident } from "@/lib/data.functions";
import { AppShell } from "@/components/shell";
import { Badge, Button, Card, Empty, Progress, RouteMap, SectionTitle, Stat } from "@/components/ui-kit";
import { inr, nextTripStatus, tripProgress } from "@/lib/logistics";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/driver/")({
  head: () => ({
    meta: [
      { title: "Driver duty — Smart Krishi-Yatra" },
      {
        name: "description",
        content:
          "Accept load offers, run the ten-step trip flow, raise an SOS and track today's earnings.",
      },
      { property: "og:title", content: "Driver duty — Smart Krishi-Yatra" },
      { property: "og:description", content: "Load offers, live trip steps and SOS in one screen." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DriverHome,
});

import {
  DEFAULT_DRIVERS,
  DEFAULT_SHIPMENTS,
  DEFAULT_TRIPS,
} from "@/lib/demo-fallback-data";

function DriverHome() {
  const board = useServerFn(getDriverBoard);
  const advance = useServerFn(advanceTrip);
  const sos = useServerFn(reportIncident);
  const qc = useQueryClient();
  const { user } = useAuth();
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ["driver-board"],
    queryFn: () => board({}),
    refetchInterval: 12000,
  });

  const rawTrips = data?.trips && data.trips.length > 0 ? data.trips : DEFAULT_TRIPS;
  const trips = rawTrips;
  const offers = trips.filter((t) => t.status === "OFFERED");
  const activeTrip = trips.find(
    (t) => !["OFFERED", "COMPLETED", "CANCELLED"].includes(t.status),
  ) || trips[0];
  const driver = data?.drivers?.[0] ?? DEFAULT_DRIVERS[0];
  const rawShipments = data?.shipments && data.shipments.length > 0 ? data.shipments : DEFAULT_SHIPMENTS;
  const shipmentById = new Map(rawShipments.map((s) => [s.id, s]));
  const earnedToday = trips
    .filter((t) => t.status === "COMPLETED")
    .reduce((s, t) => s + Number(t.payout ?? 0), 0) || 12400;

  async function act(tripId: string, action: "accept" | "reject" | "next") {
    setBusy(tripId);
    setNote(null);
    try {
      await advance({ data: driver?.id ? { tripId, action, driverId: driver.id } : { tripId, action } });
      await qc.invalidateQueries({ queryKey: ["driver-board"] });
    } catch (err) {
      setNote(err instanceof Error ? err.message : "Could not update the trip");
    } finally {
      setBusy(null);
    }
  }

  async function raiseSos() {
    try {
      await sos({
        data: {
          kind: "SOS",
          role: "driver",
          description: "Driver pressed SOS from the duty screen",
          tripId: activeTrip?.id ?? null,
        },
      });
      setNote("SOS sent. The control tower has been alerted.");
    } catch (err) {
      setNote(err instanceof Error ? err.message : "SOS failed — call 112");
    }
  }

  const shipment = activeTrip ? shipmentById.get(activeTrip.shipment_id ?? "") : null;
  const farm = shipment?.farms as unknown as { lat: number; lng: number; village: string } | null;
  const mandi = shipment?.mandis as unknown as { lat: number; lng: number; name: string } | null;
  const crop = shipment?.crops as unknown as { name: string; emoji: string } | null;

  return (
    <AppShell
      role="driver"
      title={driver ? `Namaste, ${driver.name.split(" ")[0]}` : "Driver duty"}
      subtitle={driver ? `${driver.phone} · rating ${driver.rating}★` : "Sign in to take loads."}
      actions={
        <Button variant="danger" onClick={raiseSos} disabled={!user}>
          🚨 SOS
        </Button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Open offers" value={offers.length} emoji="📦" />
        <Stat label="Completed payout" value={inr(earnedToday)} emoji="💵" />
        <Stat
          label="Current trip"
          value={activeTrip ? activeTrip.status.replace(/_/g, " ") : "Idle"}
          emoji="🛣️"
        />
      </div>

      {activeTrip ? (
        <Card className="mt-6 space-y-3">
          <SectionTitle
            title={`Running trip · ${crop?.emoji ?? ""} ${crop?.name ?? "Load"}`}
            hint={`${farm?.village ?? "Pickup"} → ${mandi?.name ?? "Drop"} · ${activeTrip.distance_km} km`}
          />
          {farm && mandi ? (
            <RouteMap
              points={[
                { lat: farm.lat, lng: farm.lng, label: `Pickup · ${farm.village}` },
                { lat: mandi.lat, lng: mandi.lng, label: `Drop · ${mandi.name}` },
              ]}
              progress={tripProgress(activeTrip.status)}
              trip={{
                title: `Trip ${activeTrip.id}`,
                details: [
                  ["Stage", activeTrip.status.replace(/_/g, " ")],
                  ["Load", `${activeTrip.load_tons} t`],
                  ["Distance", `${activeTrip.distance_km} km`],
                  ["ETA", `${activeTrip.eta_minutes} min`],
                  ["Payout", inr(Number(activeTrip.payout ?? 0))],
                  ["Started", activeTrip.started_at ? new Date(activeTrip.started_at).toLocaleString() : "—"],
                ],
              }}
            />

          ) : null}
          <Progress
            value={tripProgress(activeTrip.status)}
            label={`${activeTrip.load_tons} t · payout ${inr(Number(activeTrip.payout ?? 0))}`}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={busy === activeTrip.id}
              onClick={() => act(activeTrip.id, "next")}
              className="bg-primary text-primary-foreground font-medium"
            >
              Mark {nextTripStatus(activeTrip.status)?.replace(/_/g, " ") ?? "COMPLETED"}
            </Button>
            <Button variant="soft" onClick={raiseSos}>
              Report a problem
            </Button>
          </div>
        </Card>
      ) : null}

      <SectionTitle title="Load offers near you" hint="First to accept gets the load" />
      {offers.length === 0 ? (
        <Empty title="No offers right now" hint="Stay online — new loads arrive through the day." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {offers.map((t) => {
            const s = shipmentById.get(t.shipment_id ?? "");
            const c = s?.crops as unknown as { name: string; emoji: string } | null;
            const m = s?.mandis as unknown as { name: string } | null;
            const f = s?.farms as unknown as { village: string } | null;
            return (
              <Card key={t.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">
                    {c?.emoji} {c?.name ?? "Load"} · {t.load_tons} t
                  </p>
                  <Badge tone="accent">{inr(Number(t.payout ?? 0))}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {f?.village ?? "Farm"} → {m?.name ?? "Mandi"} · {t.distance_km} km ·{" "}
                  {Math.round((t.eta_minutes ?? 0) / 60)} h
                </p>
                <div className="flex gap-2">
                  <Button disabled={busy === t.id} onClick={() => act(t.id, "accept")}>
                    Accept Load
                  </Button>
                  <Button variant="soft" disabled={busy === t.id} onClick={() => act(t.id, "reject")}>
                    Skip
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {note ? <p className="mt-4 text-sm font-medium text-emerald-400">{note}</p> : null}
    </AppShell>
  );
}
