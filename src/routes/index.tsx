import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getReference } from "@/lib/data.functions";
import { ROLE_LIST } from "@/lib/roles";
import { Badge, Card } from "@/components/ui-kit";
import { useAuth } from "@/hooks/useAuth";
import { Footer } from "@/components/footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smart Krishi-Yatra — Farm to mandi logistics platform" },
      {
        name: "description",
        content:
          "Five connected apps for farmers, drivers, fleet owners, buyers and operators: crop pickup, pooled trucking, live mandi prices and full trip tracking.",
      },
      { property: "og:title", content: "Smart Krishi-Yatra — Farm to mandi logistics" },
      {
        property: "og:description",
        content:
          "Plan a load, allocate trucks under the 12-tonne limit, follow every trip and settle payments.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://smartkrishiyatraa.noxverse.in/" },
    ],
    links: [{ rel: "canonical", href: "https://smartkrishiyatraa.noxverse.in/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              name: "Smart Krishi-Yatra",
              url: "https://smartkrishiyatraa.noxverse.in",
              description:
                "Agri-logistics platform connecting farmers, drivers, fleet owners, buyers and operators for farm-to-mandi transport.",
              areaServed: "IN",
            },
            {
              "@type": "WebSite",
              name: "Smart Krishi-Yatra",
              url: "https://smartkrishiyatraa.noxverse.in",
              description:
                "Plan crop pickups, pool trucks under the 12-tonne limit, track every trip live and follow mandi prices.",
              inLanguage: ["en", "hi", "mr"],
              publisher: { "@type": "Organization", name: "Smart Krishi-Yatra" },
            },
          ],
        }),
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const load = useServerFn(getReference);
  const { data } = useQuery({ queryKey: ["reference"], queryFn: () => load({}) });
  const { user } = useAuth();

  return (
    <div data-role="farmer" className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <span className="text-sm font-semibold">🌾 Smart Krishi-Yatra</span>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/demo"
            className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/20"
          >
            ⚡ 14-Stage Demo
          </Link>
          <Link
            to="/auth"
            className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
          >
            {user ? "Account" : "Sign in"}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-16">
        <section className="tint-panel px-6 py-12 text-center">
          <h1 className="mx-auto max-w-3xl text-4xl font-semibold md:text-5xl">
            From the farm gate to the mandi, in one journey
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Book a truck for your harvest, pool loads with neighbours, watch the trip live and get
            paid on delivery. Built for small growers, drivers and buyers across Maharashtra.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/farmer"
              className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
            >
              Open the Farmer app
            </Link>
            <Link to="/admin" className="rounded-xl border border-border px-5 py-3 text-sm font-semibold">
              Control tower
            </Link>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              { k: "Crops tracked", v: data?.crops.length ?? "—" },
              { k: "APMC mandis", v: data?.mandis.length ?? "—" },
              { k: "Vehicle limit", v: "12 t" },
            ].map((s) => (
              <div key={s.k} className="surface-card p-4">
                <p className="text-2xl font-semibold">{s.v}</p>
                <p className="text-xs text-muted-foreground">{s.k}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">Choose your app</h2>
          <p className="text-sm text-muted-foreground">
            Each role has its own interface, navigation and Android package.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ROLE_LIST.map((r) => (
              <Link key={r.key} to={r.home} data-role={r.key} className="block">
                <Card className="h-full transition hover:-translate-y-0.5">
                  <div className="text-3xl">{r.emoji}</div>
                  <h3 className="mt-3 text-lg font-semibold">{r.app}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{r.tagline}</p>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
