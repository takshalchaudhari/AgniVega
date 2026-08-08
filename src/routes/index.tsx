import { createFileRoute, Link } from "@tanstack/react-router";
import { Emblem } from "@/components/agnivega/Emblem";
import { BrandHeader } from "@/components/agnivega/BrandHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FUEL_BASELINE } from "@/lib/krishi/constants";

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
        content: "Fuel-indexed, pooled, spoilage-aware agricultural transport for Maharashtra's farmers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const PILLARS = [
  {
    title: "Calculate, then confirm",
    body: "Every quote is a read-only simulation. Nothing is booked until the farmer taps confirm on a fully itemised breakdown.",
  },
  {
    title: "Fuel-indexed freight",
    body: `Rates track the Nashik diesel baseline of ₹${FUEL_BASELINE.diesel}/L, vehicle mileage and toll allowance — not a flat per-km guess.`,
  },
  {
    title: "Triple-fallback routing",
    body: "OpenRouteService first, public OSRM second, offline Haversine geometry third. The calculator never fails in the field.",
  },
  {
    title: "Four decoupled portals",
    body: "Farmer, driver, fleet and admin are separate role-gated surfaces sharing one economic engine.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <BrandHeader />
      <main>
        <section className="bg-primary px-4 py-20 text-primary-foreground">
          <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
            <Emblem className="h-20 w-20" />
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
              Smart Krishi-Yatra AI
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-primary-foreground/80">
              The agri-logistics operating system that turns scattered smallholder harvests into
              pooled, fuel-indexed, spoilage-aware truck runs — and shows the farmer the real cash
              left in hand.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" variant="secondary">
                <Link to="/farmer">Open Farmer Portal</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-transparent text-primary-foreground">
                <Link to="/driver">Driver Cockpit</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-center text-2xl font-bold text-primary">
            Built for the Kopargaon–Nashik belt
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {PILLARS.map((pillar) => (
              <Card key={pillar.title}>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-primary">{pillar.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{pillar.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <footer className="border-t px-4 py-8 text-center text-sm text-muted-foreground">
          Team Agnivega · Smart Kopargaon Hackathon 2026 · Problem Statement #041
        </footer>
      </main>
    </div>
  );
}
