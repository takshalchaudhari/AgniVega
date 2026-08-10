import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Fuel, Navigation, ScanLine, ShieldAlert, Truck, Wallet } from "lucide-react";

import { BrandHeader } from "@/components/agnivega/BrandHeader";
import { AuthButton } from "@/components/agnivega/AuthButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  acceptLoad,
  getDriverProfile,
  listAvailableLoads,
  listMyTrips,
  redeemHandoverToken,
  updateTripStatus,
  upsertDriverProfile,
} from "@/lib/krishi/driver.functions";
import { DEMO_RETURN_LOADS } from "@/lib/krishi/demo-data";
import { rupees } from "@/lib/krishi/constants";
import { driverNetMargin } from "@/lib/krishi/fuel-engine";
import { vehicleBySlug } from "@/lib/krishi/constants";

export const Route = createFileRoute("/_authenticated/driver")({
  head: () => ({
    meta: [
      { title: "Driver Cockpit — Smart Krishi-Yatra AI" },
      {
        name: "description",
        content:
          "Accept pooled farm loads, verify handover QR codes and track diesel-adjusted net margin per trip.",
      },
      { property: "og:title", content: "Driver Cockpit — Smart Krishi-Yatra AI" },
      {
        property: "og:description",
        content: "Loads, KYC, navigation and net margin for rural transporters.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DriverPortal,
});

function DriverPortal() {
  const queryClient = useQueryClient();
  const profileFn = useServerFn(getDriverProfile);
  const loadsFn = useServerFn(listAvailableLoads);
  const tripsFn = useServerFn(listMyTrips);
  const acceptFn = useServerFn(acceptLoad);
  const statusFn = useServerFn(updateTripStatus);
  const scanFn = useServerFn(redeemHandoverToken);
  const saveFn = useServerFn(upsertDriverProfile);

  const profile = useQuery({ queryKey: ["driver-profile"], queryFn: () => profileFn({}) });
  const loads = useQuery({ queryKey: ["driver-loads"], queryFn: () => loadsFn({}) });
  const trips = useQuery({ queryKey: ["driver-trips"], queryFn: () => tripsFn({}) });

  const [token, setToken] = useState("");
  const [loadQuery, setLoadQuery] = useState("");
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    license_number: "",
    home_lat: 19.8833,
    home_lng: 74.4778,
    radius_km: 40,
    night_mode: false,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["driver-loads"] });
    queryClient.invalidateQueries({ queryKey: ["driver-trips"] });
    queryClient.invalidateQueries({ queryKey: ["driver-profile"] });
  };

  const save = useMutation({
    mutationFn: () => saveFn({ data: form }),
    onSuccess: () => {
      toast.success("Driver profile saved. KYC review is pending.");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const accept = useMutation({
    mutationFn: (shipmentId: string) => acceptFn({ data: { shipmentId, vehicleId: null } }),
    onSuccess: () => {
      toast.success("Load accepted — trip planned.");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const setStatus = useMutation({
    mutationFn: (vars: { tripId: string; status: "ACTIVE" | "COMPLETED" }) =>
      new Promise<unknown>((resolve, reject) => {
        const send = (lat: number | null, lng: number | null) =>
          statusFn({ data: { ...vars, proofLat: lat, proofLng: lng } }).then(resolve, reject);
        if (vars.status === "COMPLETED" && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (p) => send(p.coords.latitude, p.coords.longitude),
            () => send(null, null),
          );
        } else {
          send(null, null);
        }
      }),
    onSuccess: () => {
      toast.success("Trip updated");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const scan = useMutation({
    mutationFn: () => scanFn({ data: { token } }),
    onSuccess: () => {
      toast.success("Custody transferred — load is now in transit.");
      setToken("");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const driver = profile.data?.driver;
  const referenceVehicle = vehicleBySlug("tata-407");

  return (
    <div className="min-h-screen cockpit">
      <BrandHeader active="Driver" />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-field-foreground">Driver Cockpit</h1>
            <p className="text-sm text-field-muted">
              High-contrast layout for in-vehicle use. Every figure is diesel-adjusted.
            </p>
          </div>
          <AuthButton />
        </div>

        {driver && driver.kyc_status !== "approved" && (
          <Card className="mb-4 border-warn">
            <CardContent className="flex items-center gap-3 pt-6">
              <ShieldAlert className="h-5 w-5 text-warn" />
              <p className="text-sm">
                KYC status: <strong>{driver.kyc_status}</strong>. Loads unlock once an administrator
                approves your documents.
                {driver.rejection_reason ? ` Reason: ${driver.rejection_reason}` : ""}
              </p>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue={driver ? "loads" : "profile"}>
          <TabsList>
            <TabsTrigger value="loads">Available loads</TabsTrigger>
            <TabsTrigger value="trips">My trips</TabsTrigger>
            <TabsTrigger value="handover">Handover scan</TabsTrigger>
            <TabsTrigger value="return">Return cargo</TabsTrigger>
            <TabsTrigger value="profile">Profile & KYC</TabsTrigger>
          </TabsList>

          <TabsContent value="loads" className="mt-4 space-y-3">
            {loads.data?.blocked && (
              <Card>
                <CardContent className="pt-6 text-sm">
                  Complete your driver profile and KYC to see loads.
                </CardContent>
              </Card>
            )}
            <Input
              value={loadQuery}
              onChange={(e) => setLoadQuery(e.target.value)}
              placeholder="Search the queue across India — village, crop or mandi"
              aria-label="Search available loads"
            />
            {(loads.data?.loads ?? [])
              .filter((load: any) => {
                const q = loadQuery.trim().toLowerCase();
                if (!q) return true;
                return [load.village_name, load.crops?.name_en, load.mandis?.name]
                  .filter(Boolean)
                  .some((v: string) => String(v).toLowerCase().includes(q));
              })
              .map((load: any) => {
                const margin = driverNetMargin(
                  Number(load.freight_share),
                  referenceVehicle,
                  Number(load.distance_km),
                );
                return (
                  <Card key={load.id}>
                    <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
                      <div>
                        <p className="font-semibold">
                          {load.crops?.name_en} · {Number(load.weight_kg)} kg
                          {load.emergency && (
                            <Badge variant="destructive" className="ml-2">
                              Emergency
                            </Badge>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {load.village_name} → {load.mandis?.name} ·{" "}
                          {Number(load.distance_km).toFixed(1)} km
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          <Fuel className="inline h-3 w-3" /> diesel {rupees(margin.diesel)} · tolls{" "}
                          {rupees(margin.tolls)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Net margin</p>
                        <p className="text-2xl font-bold text-primary">{rupees(margin.net)}</p>
                      </div>
                      <Button onClick={() => accept.mutate(load.id)} disabled={accept.isPending}>
                        Accept load
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            {!loads.data?.blocked && (loads.data?.loads ?? []).length === 0 && (
              <Card>
                <CardContent className="pt-6 text-sm text-muted-foreground">
                  No loads in your service radius right now.
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="trips" className="mt-4 space-y-3">
            {(trips.data ?? []).map((trip: any) => (
              <Card key={trip.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
                  <div>
                    <p className="font-semibold">
                      <Truck className="mr-1 inline h-4 w-4" />
                      {trip.mandis?.name ?? "Trip"} · {Number(trip.total_weight_kg)} kg
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {Number(trip.total_distance_km).toFixed(1)} km ·{" "}
                      {trip.trip_stops?.length ?? 0} stops
                    </p>
                  </div>
                  <Badge variant="secondary">{trip.status}</Badge>
                  <div className="flex gap-2">
                    {trip.status === "PLANNED" && (
                      <Button
                        size="sm"
                        onClick={() => setStatus.mutate({ tripId: trip.id, status: "ACTIVE" })}
                      >
                        <Navigation className="mr-1 h-4 w-4" /> Start trip
                      </Button>
                    )}
                    {trip.status === "ACTIVE" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setStatus.mutate({ tripId: trip.id, status: "COMPLETED" })}
                      >
                        Complete with location proof
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {(trips.data ?? []).length === 0 && (
              <Card>
                <CardContent className="pt-6 text-sm text-muted-foreground">
                  No trips yet.
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="handover" className="mt-4">
            <Card className="max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ScanLine className="h-4 w-4" /> Handover verification
                </CardTitle>
                <CardDescription>
                  Type or scan the farmer's one-time code to take custody of the load.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="KY-XXXXXXXX-XXXXXX"
                  className="font-mono uppercase"
                />
                <Button
                  className="w-full"
                  onClick={() => scan.mutate()}
                  disabled={!token || scan.isPending}
                >
                  Verify handover
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="return" className="mt-4 space-y-3">
            <p className="text-sm text-field-muted">
              Zero-empty-miles matcher: backhaul cargo waiting at your destination.
            </p>
            {DEMO_RETURN_LOADS.map((load) => (
              <Card key={load.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
                  <div>
                    <p className="font-semibold">{load.cargo}</p>
                    <p className="text-xs text-muted-foreground">
                      {load.from} → {load.to} · {load.weightKg} kg
                    </p>
                  </div>
                  <p className="flex items-center gap-1 text-lg font-bold text-primary">
                    <Wallet className="h-4 w-4" /> {rupees(load.payout)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="profile" className="mt-4">
            <Card className="max-w-lg">
              <CardHeader>
                <CardTitle className="text-base">Driver profile</CardTitle>
                <CardDescription>
                  Required before loads unlock. Documents are reviewed by an administrator.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Full name</Label>
                  <Input
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Licence number</Label>
                    <Input
                      value={form.license_number}
                      onChange={(e) => setForm({ ...form, license_number: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Service radius (km)</Label>
                    <Input
                      type="number"
                      value={form.radius_km}
                      onChange={(e) => setForm({ ...form, radius_km: Number(e.target.value) })}
                    />
                  </div>
                  <div className="flex items-end justify-between rounded-md border p-3">
                    <span className="text-sm">Night driving</span>
                    <Switch
                      checked={form.night_mode}
                      onCheckedChange={(v) => setForm({ ...form, night_mode: v })}
                    />
                  </div>
                </div>
                <Button className="w-full" onClick={() => save.mutate()} disabled={save.isPending}>
                  Save profile
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
