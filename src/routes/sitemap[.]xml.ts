import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://smartkrishiyatraa.noxverse.in";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const entries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/farmer", changefreq: "daily", priority: "0.9" },
  { path: "/farmer/market", changefreq: "daily", priority: "0.8" },
  { path: "/farmer/shipments", changefreq: "daily", priority: "0.7" },
  { path: "/farmer/new", changefreq: "monthly", priority: "0.6" },
  { path: "/driver", changefreq: "daily", priority: "0.8" },
  { path: "/driver/trips", changefreq: "daily", priority: "0.6" },
  { path: "/fleet", changefreq: "daily", priority: "0.8" },
  { path: "/fleet/vehicles", changefreq: "weekly", priority: "0.6" },
  { path: "/buyer", changefreq: "daily", priority: "0.9" },
  { path: "/buyer/orders", changefreq: "daily", priority: "0.6" },
  { path: "/terms", changefreq: "monthly", priority: "0.5" },
  { path: "/privacy", changefreq: "monthly", priority: "0.5" },
  { path: "/disclaimer", changefreq: "monthly", priority: "0.5" },
  { path: "/contact", changefreq: "monthly", priority: "0.5" },
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
