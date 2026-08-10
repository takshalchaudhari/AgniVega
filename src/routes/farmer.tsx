import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import QRCode from "react-qr-code";
import {
  Leaf,
  MapPin,
  Truck,
  Users,
  Fuel,
  ShieldCheck,
  WifiOff,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

import { BrandHeader } from "@/components/agnivega/BrandHeader";
import { AuthButton, useLocalUser } from "@/components/agnivega/AuthButton";
import { VoiceInput, TalkBack, speak } from "@/components/agnivega/VoiceInput";
import { LanguagePicker } from "@/components/agnivega/LanguagePicker";
import { DemoToggleButton } from "@/components/agnivega/DemoBanner";
import { useDemoMode } from "@/lib/demo/demo-mode";
import { SpoilageClock } from "@/components/agnivega/SpoilageClock";
import { LiveMap } from "@/components/agnivega/LiveMap";
import { ENRHeroCard } from "@/components/agnivega/ENRHeroCard";
import { ExplainabilityCard } from "@/components/agnivega/ExplainabilityCard";
import { DelayAlertCard } from "@/components/agnivega/DelayAlertCard";
import { VoiceIVRPrototype } from "@/components/agnivega/VoiceIVRPrototype";
import { CropSelector } from "@/components/agnivega/CropSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { getReferenceData, calculateOptions } from "@/lib/krishi/krishi.functions";
import { interpretVoice } from "@/lib/krishi/voice.functions";
import { confirmShipment, listMyShipments } from "@/lib/krishi/portal.functions";
import { cropName, languageName, spokenConfirmation, t, type Lang } from "@/lib/krishi/i18n";
import { UNITS, rupees, toKilograms, type UnitKey } from "@/lib/krishi/constants";
import type { CalculationResult, MandiOption } from "@/lib/krishi/types";

export const Route = createFileRoute("/farmer")({
  head: () => ({
    meta: [
      { title: "Farmer Portal — Smart Krishi-Yatra AI" },
      {
        name: "description",
        content:
          "Calculate your true net mandi profit, pool your harvest with nearby farmers and confirm transport in two taps.",
      },
      { property: "og:title", content: "Farmer Portal — Smart Krishi-Yatra AI" },
      {
        property: "og:description",
        content:
          "Fuel-indexed freight, pooled trucks and spoilage-aware mandi selection for Kopargaon farmers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FarmerPortal,
});

import { useSimulatedDelay } from "@/lib/demo/delay-sim";

const OFFLINE_KEY = "krishi.offline.queue";

function FarmerPortal() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { role } = useLocalUser();

  const [lang, setLang] = useState<Lang>("mr");
  const [cropId, setCropId] = useState("");
  const [quantity, setQuantity] = useState("5");
  const [unit, setUnit] = useState<UnitKey>("quintal");
  const [villageId, setVillageId] = useState("");
  const [emergency, setEmergency] = useState(false);
  const [demoMode, setDemoMode] = useDemoMode();
  const [assistantLine, setAssistantLine] = useState("");
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [pending, setPending] = useState<{ option: MandiOption; mode: "POOLED" | "SOLO" } | null>(
    null,
  );
  const [handover, setHandover] = useState<string | null>(null);
  const [online, setOnline] = useState(true);
  const [simulatedDelayMinutes, setSimulatedDelayMinutes] = useSimulatedDelay();
  const [showVoiceIVR, setShowVoiceIVR] = useState(false);

  useEffect(() => {
    const sync = () => setOnline(navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  const referenceFn = useServerFn(getReferenceData);
  const calcFn = useServerFn(calculateOptions);
  const confirmFn = useServerFn(confirmShipment);
  const shipmentsFn = useServerFn(listMyShipments);
  const voiceFn = useServerFn(interpretVoice);

  const reference = useQuery({ queryKey: ["krishi-reference"], queryFn: () => referenceFn({}) });
  const shipments = useQuery({
    queryKey: ["my-shipments"],
    queryFn: () => shipmentsFn({}),
    enabled: Boolean(role),
  });

  useEffect(() => {
    if (!reference.data) return;
    if (!cropId && reference.data.crops[0]) setCropId(reference.data.crops[0].id);
    if (!villageId && reference.data.villages[0]) setVillageId(reference.data.villages[0].id);
  }, [reference.data, cropId, villageId]);

  const crop = reference.data?.crops.find((c) => c.id === cropId);
  const village = reference.data?.villages.find((v) => v.id === villageId);
  const weightKg = useMemo(
    () => toKilograms(Number(quantity) || 0, unit, crop?.crate_kg ?? 25),
    [quantity, unit, crop],
  );

  const calculate = useMutation({
    mutationFn: async () => {
      if (!crop || !village) throw new Error("Select a crop and a village first");
      if (weightKg <= 0) throw new Error("Enter a valid quantity");
      return calcFn({
        data: {
          cropId: crop.id,
          weightKg,
          villageName: village.name,
          lat: village.lat,
          lng: village.lng,
          demoMode,
          emergency,
          delayMinutes: simulatedDelayMinutes ?? 0,
        },
      });
    },
    onSuccess: (data) => {
      setResult(data);
      if (crop) {
        const line = spokenConfirmation(weightKg, crop, lang);
        setAssistantLine(line);
        speak(line, lang);
      }
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const confirm = useMutation({
    mutationFn: async () => {
      if (!result || !pending || !crop || !village) throw new Error("Nothing to confirm");
      const numbers =
        pending.mode === "POOLED"
          ? {
              freightShare: pending.option.pooled.freightShare,
              platformFee: pending.option.pooled.platformFee,
              netPayout: pending.option.pooled.netPayout,
            }
          : {
              freightShare: pending.option.solo.freightCost,
              platformFee: pending.option.solo.platformFee,
              netPayout: pending.option.solo.netPayout,
            };
      return confirmFn({
        data: {
          cropId: crop.id,
          mandiId: pending.option.mandiId,
          villageName: village.name,
          lat: village.lat,
          lng: village.lng,
          weightKg,
          distanceKm: pending.option.distanceKm,
          mode: pending.mode,
          grossPayout: pending.option.grossPayout,
          emergency,
          spoilageDeadlineIso: pending.option.spoilage.deadlineIso,
          ...numbers,
        },
      });
    },
    onSuccess: (data) => {
      setHandover(data.handoverToken);
      setPending(null);
      toast.success("Shipment confirmed. Show the handover code to your driver.");
      queryClient.invalidateQueries({ queryKey: ["my-shipments"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function requestConfirm(option: MandiOption, mode: "POOLED" | "SOLO") {
    if (!role) {
      navigate({ to: "/auth", search: { next: "/farmer" } as never });
      return;
    }
    if (!online) {
      const queue = JSON.parse(localStorage.getItem(OFFLINE_KEY) ?? "[]");
      queue.push({ option, mode, weightKg, cropId, villageId, at: Date.now() });
      localStorage.setItem(OFFLINE_KEY, JSON.stringify(queue));
      toast.success(t("offlineQueued", lang));
      return;
    }
    setPending({ option, mode });
  }

  async function handleVoice(text: string) {
    const crops = reference.data?.crops ?? [];
    const villages = reference.data?.villages ?? [];
    try {
      const intent = await voiceFn({
        data: {
          transcript: text,
          lang,
          languageName: languageName(lang),
          crops: crops.map((c) => ({ slug: c.slug, label: cropName(c, lang) })),
          villages: villages.map((v) => v.name),
        },
      });
      const matchedCrop = crops.find((c) => c.slug === intent.cropSlug);
      if (matchedCrop) setCropId(matchedCrop.id);
      if (intent.quantity && intent.quantity > 0) setQuantity(String(intent.quantity));
      if (intent.unit && intent.unit in UNITS) setUnit(intent.unit as UnitKey);
      const matchedVillage = villages.find(
        (v) => v.name.toLowerCase() === (intent.village ?? "").toLowerCase(),
      );
      if (matchedVillage) setVillageId(matchedVillage.id);
      if (intent.emergency) setEmergency(true);
      setAssistantLine(intent.reply);
      speak(intent.reply, lang);
      toast.success(intent.reply);
    } catch {
      const digits = text.match(/\d+/);
      if (digits) setQuantity(digits[0]);
      setAssistantLine(text);
      toast.message(`Heard: ${text}`);
    }
  }

  function useGps() {
    if (!navigator.geolocation || !reference.data) return;
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      let nearestId = villageId;
      let nearest = Number.POSITIVE_INFINITY;
      for (const v of reference.data!.villages) {
        const d = (v.lat - latitude) ** 2 + (v.lng - longitude) ** 2;
        if (d < nearest) {
          nearest = d;
          nearestId = v.id;
        }
      }
      setVillageId(nearestId);
      toast.success("Nearest village detected from GPS");
    });
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <BrandHeader active="Farmer" />

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-primary">{t("farmerPortal", lang)}</h1>
            <p className="text-sm text-muted-foreground">{t("tagline", lang)}</p>
          </div>
          <div className="flex items-center gap-2">
            {!online && (
              <Badge variant="destructive" className="gap-1">
                <WifiOff className="h-3 w-3" /> Offline
              </Badge>
            )}
            <DemoToggleButton />
            <LanguagePicker value={lang} onChange={setLang} />
            <AuthButton />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          {/* ---------------- STEP 1: Calculate ---------------- */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Leaf className="h-5 w-5 text-primary" /> Step 1 — Calculate
              </CardTitle>
              <CardDescription>
                Nothing is booked at this stage. You will see the full money breakdown first.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <VoiceInput
                lang={lang}
                onTranscript={handleVoice}
                label={t("speak", lang)}
                listeningLabel={t("listening", lang)}
              />
              {assistantLine && <TalkBack text={assistantLine} lang={lang} />}

              <div>
                <Label className="text-lg mb-2 block">{t("crop", lang)}</Label>
                <CropSelector
                  crops={reference.data?.crops ?? []}
                  selectedId={cropId}
                  onChange={setCropId}
                  lang={lang}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="qty" className="text-lg block mb-2">
                    {t("weight", lang)}
                  </Label>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-12 w-12 shrink-0 text-xl font-bold field-tap"
                      onClick={() => setQuantity((q) => String(Math.max(1, (Number(q) || 0) - 1)))}
                    >
                      −
                    </Button>
                    <Input
                      id="qty"
                      inputMode="decimal"
                      className="h-12 text-center text-xl font-bold field-tap"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="h-12 w-12 shrink-0 text-xl font-bold field-tap"
                      onClick={() => setQuantity((q) => String((Number(q) || 0) + 1))}
                    >
                      +
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-lg block mb-2">Unit</Label>
                  <Select value={unit} onValueChange={(v) => setUnit(v as UnitKey)}>
                    <SelectTrigger className="h-12 text-lg font-medium field-tap">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(UNITS).map(([key, value]) => (
                        <SelectItem key={key} value={key} className="text-lg py-3">
                          {value.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                = <strong>{weightKg.toLocaleString("en-IN")} kg</strong> total payload
              </p>

              <div>
                <Label>{t("village", lang)}</Label>
                <div className="flex gap-2">
                  <Select value={villageId} onValueChange={setVillageId}>
                    <SelectTrigger className="field-tap">
                      <SelectValue placeholder="Select village" />
                    </SelectTrigger>
                    <SelectContent>
                      {(reference.data?.villages ?? []).map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.name} ({v.taluka})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    className="field-tap px-3"
                    onClick={useGps}
                  >
                    <MapPin className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="text-sm font-medium">Emergency harvest</p>
                  <p className="text-xs text-muted-foreground">Prioritise me in the driver queue</p>
                </div>
                <Switch checked={emergency} onCheckedChange={setEmergency} />
              </div>

              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="text-sm font-medium">Demo mode</p>
                  <p className="text-xs text-muted-foreground">
                    Seeded Kopargaon pool partners and prices
                  </p>
                </div>
                <Switch checked={demoMode} onCheckedChange={setDemoMode} />
              </div>

              <Button
                className="field-tap w-full"
                onClick={() => calculate.mutate()}
                disabled={calculate.isPending}
              >
                {calculate.isPending ? "Calculating…" : t("calculate", lang)}
              </Button>
            </CardContent>
          </Card>

          {/* ---------------- STEP 2: Compare & Confirm ---------------- */}
          <div className="space-y-6">
            {!result && (
              <Card className="flex h-64 items-center justify-center text-center">
                <CardContent className="pt-6">
                  <Sparkles className="mx-auto h-8 w-8 text-accent" />
                  <p className="mt-3 max-w-sm text-sm text-muted-foreground">
                    Enter your harvest details and press calculate. We compare every reachable mandi
                    on <strong>net cash in hand</strong>, not on headline price.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Voice / IVR prototype (toggleable) */}
            {showVoiceIVR && (
              <VoiceIVRPrototype
                lang={lang}
                onIntentParsed={(intent) => {
                  const crops = reference.data?.crops ?? [];
                  if (intent.crop) {
                    const matched = crops.find((c) => c.slug === intent.crop);
                    if (matched) setCropId(matched.id);
                  }
                  if (intent.weightKg && intent.weightKg > 0) {
                    setQuantity(String(intent.weightKg));
                    setUnit("kg");
                  }
                }}
                {...(result
                  ? {
                      resultNarration: `${result.best.mandiName} मध्ये जा. ${rupees(result.best.pooled.netPayout)} मिळतील.`,
                    }
                  : {})}
              />
            )}

            {/* Delay recalculation card */}
            {result &&
              simulatedDelayMinutes !== null &&
              (() => {
                const delayH = simulatedDelayMinutes / 60;
                const newTransitH =
                  result.best.distanceKm / 34 + result.best.queueMinutes / 60 + delayH;
                const ratio = Math.min(1, newTransitH / (crop?.spoilage_hours ?? 336));
                const newRisk = Math.round(ratio * 100);
                const newLevel = newRisk >= 60 ? "critical" : newRisk >= 30 ? "watch" : "safe";
                return (
                  <DelayAlertCard
                    delayMinutes={simulatedDelayMinutes}
                    result={{
                      recommendationChanged: false,
                      oldMandiName: result.best.mandiName,
                      oldNetPayout: result.best.pooled.netPayout,
                      reason: `${crop?.name_en ?? "Crop"} shelf life is ${crop?.spoilage_hours ?? 336}h. Even with +${delayH.toFixed(1)}h delay, transit is ${newTransitH.toFixed(1)}h — ${newRisk}% of shelf life. Original destination remains optimal.`,
                      newSpoilageRisk: newRisk,
                      newSpoilageLevel: newLevel,
                      hoursRemaining: (crop?.spoilage_hours ?? 336) - newTransitH,
                    }}
                    onAcknowledge={() => {
                      setSimulatedDelayMinutes(null);
                      setTimeout(() => calculate.mutate(), 0);
                    }}
                  />
                );
              })()}

            {result && (
              <>
                {/* Primary: ENR Hero Card */}
                <ENRHeroCard
                  option={result.best}
                  cropName={crop ? cropName(crop, lang) : ""}
                  weightKg={weightKg}
                  routerTier={result.routerTier}
                  dieselPrice={result.dieselPrice}
                  commissionPercent={result.commissionPercent}
                  lang={lang}
                  onConfirmPooled={() => requestConfirm(result.best, "POOLED")}
                  onConfirmSolo={() => requestConfirm(result.best, "SOLO")}
                  priceDataStatus={result.routerTier === "live" ? "LIVE" : "SIMULATED"}
                />

                {/* Explainability: Why this destination? */}
                <ExplainabilityCard
                  winner={result.best}
                  allOptions={result.options}
                  weightKg={weightKg}
                />

                {/* Demo delay simulation button */}
                {demoMode && simulatedDelayMinutes === null && (
                  <div className="flex gap-2">
                    <Button
                      id="simulate-delay-btn"
                      variant="outline"
                      className="text-xs"
                      onClick={() => {
                        setSimulatedDelayMinutes(180);
                        setTimeout(() => calculate.mutate(), 0);
                      }}
                    >
                      🕐 Simulate +3h Delay (Demo)
                    </Button>
                    <Button
                      id="toggle-ivr-btn"
                      variant="outline"
                      className="text-xs"
                      onClick={() => setShowVoiceIVR((v) => !v)}
                    >
                      🎙️ {showVoiceIVR ? "Hide" : "Show"} Voice / IVR
                    </Button>
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        {t("savings", lang)} by pooling
                      </p>
                      <p className="mt-1 text-3xl font-bold text-primary">
                        {rupees(
                          Math.max(
                            0,
                            result.best.solo.freightCost - result.best.pooled.freightShare,
                          ),
                        )}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Freight {rupees(result.best.solo.freightCost)} solo →{" "}
                        {rupees(result.best.pooled.freightShare)} shared across{" "}
                        {result.best.pooled.poolPartners + 1} farmers
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {result.best.esg.litresSaved.toFixed(1)} L diesel and{" "}
                        {result.best.esg.co2Saved.toFixed(1)} kg CO₂ avoided
                      </p>
                    </CardContent>
                  </Card>
                  <SpoilageClock
                    deadlineIso={result.best.spoilage.deadlineIso}
                    totalHours={crop?.spoilage_hours ?? 24}
                    level={result.best.spoilage.level}
                    label={t("spoilage", lang)}
                  />
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Pool circle ({result.nearbyPool.radiusKm} km)
                      </p>
                      <p className="mt-1 text-3xl font-bold text-primary">
                        {result.nearbyPool.totalWeightKg.toLocaleString("en-IN")} kg
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        across {result.nearbyPool.partners + 1} farmers
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Live pooled route</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LiveMap
                      height={320}
                      points={[
                        {
                          label: result.village,
                          lat: result.pickup.lat,
                          lng: result.pickup.lng,
                          kind: "pickup" as const,
                          detail: `Your pickup · ${weightKg} kg`,
                        },
                        ...result.nearbyPool.members.map((m) => ({
                          label: m.village,
                          lat: m.lat,
                          lng: m.lng,
                          kind: "partner" as const,
                          detail: `${m.weightKg} kg · ${m.distanceKm} km away`,
                        })),
                        {
                          label: result.best.mandiName,
                          lat:
                            reference.data?.mandis.find((m) => m.id === result.best.mandiId)?.lat ??
                            0,
                          lng:
                            reference.data?.mandis.find((m) => m.id === result.best.mandiId)?.lng ??
                            0,
                          kind: "mandi" as const,
                          detail: `Gate queue ${result.best.queueMinutes} min`,
                        },
                      ]}
                      route={[
                        { lat: result.pickup.lat, lng: result.pickup.lng },
                        ...result.nearbyPool.members.map((m) => ({ lat: m.lat, lng: m.lng })),
                        {
                          lat:
                            reference.data?.mandis.find((m) => m.id === result.best.mandiId)?.lat ??
                            0,
                          lng:
                            reference.data?.mandis.find((m) => m.id === result.best.mandiId)?.lng ??
                            0,
                        },
                      ]}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      All mandis ranked by Expected Net Realization
                    </CardTitle>
                    <CardDescription>
                      Highest headline price is rarely the highest Expected Net Realization (ENR).
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {result.options.map((option) => (
                      <div
                        key={option.mandiId}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3"
                      >
                        <div>
                          <p className="font-medium">
                            {option.mandiName}{" "}
                            <span className="text-xs text-muted-foreground">
                              ({option.mandiCode})
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ₹{option.pricePerKg}/kg · {option.distanceKm} km ·{" "}
                            {option.spoilage.level === "critical" && (
                              <span className="text-destructive">
                                <TriangleAlert className="inline h-3 w-3" /> spoilage risk{" "}
                                {option.spoilage.riskPercent}%
                              </span>
                            )}
                            {option.spoilage.level !== "critical" &&
                              `spoilage risk ${option.spoilage.riskPercent}%`}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-lg font-bold text-primary">
                              {rupees(option.pooled.netPayout)}
                            </p>
                            <p className="text-[11px] text-muted-foreground">pooled net</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => requestConfirm(option, "POOLED")}
                          >
                            Choose
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </>
            )}

            {role && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{t("myShipments", lang)}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(shipments.data ?? []).length === 0 && (
                    <p className="text-sm text-muted-foreground">No shipments yet.</p>
                  )}
                  {(shipments.data ?? []).map((row: any) => (
                    <div
                      key={row.id}
                      className="flex items-center justify-between rounded-md border p-3 text-sm"
                    >
                      <span>
                        {row.crops?.name_en} · {Number(row.weight_kg)} kg → {row.mandis?.name}
                      </span>
                      <span className="flex items-center gap-2">
                        <Badge variant="secondary">{row.status}</Badge>
                        <strong className="text-primary">{rupees(Number(row.net_payout))}</strong>
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* ---------------- Confirmation dialog (Step 2 gate) ---------------- */}
      <Dialog open={Boolean(pending)} onOpenChange={(open) => !open && setPending(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm transport</DialogTitle>
            <DialogDescription>
              This creates a real booking. Nothing was reserved during the calculation step.
            </DialogDescription>
          </DialogHeader>
          {pending && (
            <div className="space-y-2 rounded-md border p-4 text-sm">
              <Row label="Mandi" value={pending.option.mandiName} />
              <Row label="Mode" value={pending.mode === "POOLED" ? "Pooled truck" : "Solo truck"} />
              <Row label="Payload" value={`${weightKg.toLocaleString("en-IN")} kg`} />
              <Row
                label="Net cash to you"
                value={rupees(
                  pending.mode === "POOLED"
                    ? pending.option.pooled.netPayout
                    : pending.option.solo.netPayout,
                )}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPending(null)}>
              Cancel
            </Button>
            <Button onClick={() => confirm.mutate()} disabled={confirm.isPending}>
              {confirm.isPending ? "Confirming…" : "Confirm booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------------- Handover QR ---------------- */}
      <Dialog open={Boolean(handover)} onOpenChange={(open) => !open && setHandover(null)}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" /> Handover code
            </DialogTitle>
            <DialogDescription>
              Show this to the driver at pickup. It can only be scanned once.
            </DialogDescription>
          </DialogHeader>
          {handover && (
            <div className="mx-auto rounded-lg bg-card p-4">
              <QRCode value={handover} size={180} />
              <p className="mt-3 font-mono text-sm font-bold tracking-wider">{handover}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

interface OptionPanelProps {
  title: string;
  icon: React.ReactNode;
  rows: [string, string][];
  net: number;
  footer: string;
  cta: string;
  onConfirm: () => void;
  highlight?: boolean;
}

function OptionPanel({
  title,
  icon,
  rows,
  net,
  footer,
  cta,
  onConfirm,
  highlight,
}: OptionPanelProps) {
  return (
    <div className={`rounded-lg border p-4 ${highlight ? "border-accent bg-accent/10" : ""}`}>
      <p className="flex items-center gap-2 text-sm font-semibold">
        {icon}
        {title}
      </p>
      <div className="mt-3 space-y-1 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between">
            <span className="text-muted-foreground">{label}</span>
            <span className="tabular-nums">{value}</span>
          </div>
        ))}
        <div className="flex justify-between border-t pt-2">
          <span className="font-semibold">Net cash</span>
          <span className="text-xl font-bold tabular-nums text-primary">{rupees(net)}</span>
        </div>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">{footer}</p>
      <Button
        className="field-tap mt-3 w-full"
        variant={highlight ? "default" : "outline"}
        onClick={onConfirm}
      >
        {cta}
      </Button>
    </div>
  );
}
