import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Emblem } from "@/components/agnivega/Emblem";
import { BrandHeader } from "@/components/agnivega/BrandHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, ArrowRight, TrendingUp, Truck, Scale } from "lucide-react";
import { FUEL_BASELINE, rupees } from "@/lib/krishi/constants";
import { VoiceIVRPrototype } from "@/components/agnivega/VoiceIVRPrototype";
import { MandiComparisonTable } from "@/components/agnivega/MandiComparisonTable";
import type { Lang } from "@/lib/krishi/i18n";
import {
  DEMO_ENR_RESULTS,
  DEMO_WINNER,
  DEMO_INSIGHT,
  DEMO_WEIGHT_KG,
} from "@/lib/krishi/canonical-demo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smart Krishi-Yatra AI — Agri-Logistics OS by Team Agnivega" },
      {
        name: "description",
        content:
          "Pool farm loads, index freight to live diesel prices and pick the mandi that pays the most net cash. Built for Kopargaon, Rahata, Shirdi and Nashik.",
      },
      { property: "og:title", content: "Smart Krishi-Yatra AI — Team Agnivega" },
      {
        property: "og:description",
        content:
          "Fuel-indexed, pooled, spoilage-aware agricultural transport for Maharashtra's farmers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  const [ivrLang, setIvrLang] = useState<Lang>("mr");

  return (
    <div className="min-h-screen bg-background">
      <BrandHeader />
      <main>
        {/* HERO SECTION */}
        <section className="bg-primary px-4 pt-20 pb-24 text-primary-foreground relative overflow-hidden">
          <div className="mx-auto flex max-w-5xl flex-col items-center text-center relative z-10">
            <Emblem className="h-20 w-20 mb-6" />
            <Badge
              variant="outline"
              className="mb-4 text-primary-foreground border-primary-foreground/30 bg-primary-foreground/10 px-3 py-1"
            >
              Smart Kopargaon Hackathon 2026 (SKH041)
            </Badge>
            <h1 className="text-5xl font-bold tracking-tight sm:text-7xl mb-6">
              What will you <span className="text-accent">actually earn</span> today?
            </h1>
            <p className="max-w-2xl text-xl text-primary-foreground/90 leading-relaxed mb-10">
              Stop guessing. Smart Krishi-Yatra AI calculates fuel-indexed freight, pools your load
              with neighbors, and estimates the Expected Net Realization (ENR) to help you choose
              the best mandi.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" variant="secondary" className="text-lg px-8 h-14">
                <Link to="/farmer">
                  Open Farmer Portal <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="text-lg px-8 h-14 bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link to="/admin">Admin Dashboard</Link>
              </Button>
            </div>
          </div>

          {/* Abstract background shapes */}
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-accent/20 rounded-full blur-3xl mix-blend-screen pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-1/2 h-64 bg-secondary/30 blur-3xl mix-blend-screen pointer-events-none" />
        </section>

        {/* HERO DEMO SCENARIO */}
        <section className="mx-auto max-w-5xl px-4 py-16 -mt-10 relative z-20">
          <Card className="border-accent shadow-xl bg-card">
            <CardHeader className="bg-accent/5 pb-4 border-b">
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                  <Badge className="bg-accent text-accent-foreground mb-2">
                    Live Demo Scenario
                  </Badge>
                  <CardTitle className="text-2xl">Ramesh Patil · 10 Quintals Onion</CardTitle>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <div className="flex items-center gap-2 justify-end">
                    <Scale className="h-4 w-4" /> 1,000 kg
                  </div>
                  <div className="flex items-center gap-2 justify-end mt-1">
                    <Truck className="h-4 w-4" /> Tata 407 (Pooled)
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x">
                {DEMO_ENR_RESULTS.filter((r) =>
                  ["mandi-1", "mandi-4", "mandi-3"].includes(r.mandiId),
                ).map((mandi) => {
                  const isWinner = mandi.mandiId === DEMO_WINNER.mandiId;
                  return (
                    <div
                      key={mandi.mandiId}
                      className={`p-6 ${isWinner ? "bg-green-50/50 relative overflow-hidden" : "opacity-70"}`}
                    >
                      {isWinner && (
                        <div className="absolute top-0 right-0 bg-green-600 text-white text-[10px] font-bold px-3 py-1 uppercase tracking-wider rounded-bl-lg">
                          Recommended
                        </div>
                      )}
                      <h3
                        className={`font-semibold text-lg mb-4 ${isWinner ? "text-green-900" : ""}`}
                      >
                        {mandi.mandiName}
                      </h3>
                      <div className="space-y-2 text-sm mb-6">
                        <div className="flex justify-between font-medium">
                          <span>Price (₹{mandi.pricePerKg}/kg)</span>{" "}
                          <span>₹{mandi.grossPayout.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-red-600">
                          <span>Freight ({mandi.distanceKm}km)</span>{" "}
                          <span>− ₹{mandi.freightCost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-red-600">
                          <span>Platform Fee</span>{" "}
                          <span>− ₹{mandi.platformFee.toLocaleString()}</span>
                        </div>
                        {mandi.spoilageLoss > 0 && (
                          <div className="flex justify-between text-amber-600">
                            <span>Spoilage Risk</span>{" "}
                            <span>− ₹{mandi.spoilageLoss.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                      <div
                        className={`pt-4 border-t flex justify-between font-bold ${isWinner ? "text-2xl text-green-700" : "text-lg"}`}
                      >
                        <span>ENR Estimate</span> <span>₹{mandi.netPayout.toLocaleString()}</span>
                      </div>
                      {isWinner && (
                        <div className="mt-4 flex items-start gap-2 bg-white rounded p-3 border border-green-200 text-xs">
                          <TrendingUp className="h-4 w-4 text-green-600 shrink-0" />
                          <p>{DEMO_INSIGHT.keyReason}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* IVR / CALL-IN SECTION */}
        <section className="bg-secondary/30 px-4 py-20">
          <div className="mx-auto max-w-5xl grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                No smartphone? <br />
                Just call.
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Our Voice IVR prototype lets farmers call a toll-free number, speak their crop and
                quantity in Marathi or Hindi, and instantly hear the best APMC recommendation based
                on the Expected Net Realization.
              </p>
              <div className="flex items-center gap-4 bg-background p-4 rounded-lg border shadow-sm inline-flex mb-8">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Try the prototype now</p>
                  <p className="font-mono text-lg font-bold">Speak into your mic</p>
                </div>
              </div>
            </div>
            <div>
              {/* Force re-render if lang changes just in case */}
              <VoiceIVRPrototype
                key={ivrLang}
                lang={ivrLang}
                onIntentParsed={() => {}}
                resultNarration="नाशिक बाजार समितीत जा. आपल्याला ₹21,925 मिळतील."
              />
              <div className="mt-4 flex justify-center gap-2">
                <Button
                  variant={ivrLang === "mr" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIvrLang("mr")}
                >
                  मराठी (Marathi)
                </Button>
                <Button
                  variant={ivrLang === "hi" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIvrLang("hi")}
                >
                  हिन्दी (Hindi)
                </Button>
                <Button
                  variant={ivrLang === "en" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIvrLang("en")}
                >
                  English
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* COMPETITOR COMPARISON */}
        <section className="mx-auto max-w-5xl px-4 py-20">
          <MandiComparisonTable />
        </section>

        <footer className="border-t px-4 py-12 text-center text-muted-foreground">
          <Emblem className="h-8 w-8 mx-auto mb-4 opacity-50" />
          <p className="font-medium text-foreground mb-1">Smart Krishi-Yatra AI</p>
          <p className="text-sm">
            Team Agnivega · Smart Kopargaon Hackathon 2026 · Problem Statement #041
          </p>
        </footer>
      </main>
    </div>
  );
}
