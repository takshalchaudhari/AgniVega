import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type MapPoint = {
  lat: number;
  lng: number;
  label?: string;
  /** extra rows rendered in the popup: ["Status", "In transit"] pairs */
  details?: [string, string][];
};

export type MapVehicle = {
  id: string;
  lat: number;
  lng: number;
  label: string;
  details?: [string, string][];
  status?: string;
};

export type MapTrip = {
  title?: string;
  details?: [string, string][];
};

function pin(emoji: string, ring: string, pulse = false) {
  return L.divIcon({
    className: "",
    html: `<div style="display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:9999px;background:#fff;border:2px solid ${ring};box-shadow:0 4px 12px rgba(0,0,0,.25);font-size:17px;line-height:1;${
      pulse ? "animation:sky-pulse 1.6s ease-out infinite;" : ""
    }">${emoji}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });
}

const esc = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

function popupHtml(title: string, rows: [string, string][] = []) {
  const body = rows
    .map(
      ([k, v]) =>
        `<div style="display:flex;gap:10px;justify-content:space-between;font-size:12px;margin-top:3px"><span style="opacity:.65">${esc(
          k,
        )}</span><b style="text-align:right">${esc(v)}</b></div>`,
    )
    .join("");
  return `<div style="min-width:170px"><div style="font-weight:700;font-size:13px">${esc(
    title,
  )}</div>${body}</div>`;
}

/** Real OpenStreetMap map: clickable pins, clickable route segments, live trucks. */
export default function LiveMap({
  points,
  progress = 0,
  trip,
  vehicles = [],
  className,
}: {
  points: MapPoint[];
  progress?: number | undefined;
  trip?: MapTrip | undefined;
  vehicles?: MapVehicle[] | undefined;
  className?: string | undefined;
}) {
  const el = useRef<HTMLDivElement | null>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!el.current || map.current) return;
    map.current = L.map(el.current, {
      zoomControl: true,
      scrollWheelZoom: false,
      attributionControl: true,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map.current);
    map.current.setView([20.5937, 78.9629], 5);
    layer.current = L.layerGroup().addTo(map.current);
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    const m = map.current;
    const g = layer.current;
    if (!m || !g) return;
    let cancelled = false;
    g.clearLayers();

    const tripRows = trip?.details ?? [];
    const tripTitle = trip?.title ?? "Trip";

    // ---- fleet mode: live vehicles, each clickable ----
    if (vehicles.length) {
      const bounds: L.LatLngExpression[] = [];
      vehicles.forEach((v) => {
        bounds.push([v.lat, v.lng]);
        L.marker([v.lat, v.lng], {
          icon: pin("🚛", v.status === "moving" ? "#1d4ed8" : "#64748b", v.status === "moving"),
          title: v.label,
        })
          .addTo(g)
          .bindPopup(popupHtml(v.label, v.details ?? []));
      });
      if (bounds.length) m.fitBounds(L.latLngBounds(bounds).pad(0.25));
    }

    if (points.length < 2) return () => { cancelled = true; };

    const start = points[0]!;
    const end = points[points.length - 1]!;
    const latlngs = points.map((p) => L.latLng(p.lat, p.lng));

    const stops = () => {
      L.marker(latlngs[0]!, { icon: pin("🌾", "#16a34a"), title: start.label ?? "Pickup" })
        .addTo(g)
        .bindPopup(popupHtml(start.label ?? "Pickup — farm", start.details ?? tripRows));
      L.marker(latlngs[latlngs.length - 1]!, {
        icon: pin("🏬", "#ea580c"),
        title: end.label ?? "Drop",
      })
        .addTo(g)
        .bindPopup(popupHtml(end.label ?? "Drop — mandi", end.details ?? tripRows));
      points.slice(1, -1).forEach((p, i) =>
        L.marker([p.lat, p.lng], { icon: pin("📍", "#0ea5e9") })
          .addTo(g)
          .bindPopup(popupHtml(p.label ?? `Stop ${i + 1}`, p.details ?? [])),
      );
    };

    const draw = (coords: L.LatLngExpression[]) => {
      if (cancelled || !map.current) return;
      const pts = coords.map((c) => L.latLng(c as L.LatLngExpression));
      const idx = Math.min(pts.length - 1, Math.max(0, Math.round((pts.length - 1) * progress)));

      // covered vs remaining segments, each clickable with trip context
      const done = pts.slice(0, idx + 1);
      const left = pts.slice(idx);
      if (done.length > 1)
        L.polyline(done, { color: "#0f766e", weight: 6, opacity: 0.9 })
          .addTo(g)
          .bindPopup(
            popupHtml(`${tripTitle} — covered`, [
              ["Segment", "Pickup → live position"],
              ["Completed", `${Math.round(progress * 100)}%`],
              ...tripRows,
            ]),
          );
      if (left.length > 1)
        L.polyline(left, { color: "#0f766e", weight: 5, opacity: 0.4, dashArray: "8 8" })
          .addTo(g)
          .bindPopup(
            popupHtml(`${tripTitle} — remaining`, [
              ["Segment", "Live position → mandi"],
              ["Remaining", `${Math.round((1 - progress) * 100)}%`],
              ...tripRows,
            ]),
          );

      L.marker(pts[idx]!, { icon: pin("🚛", "#1d4ed8", true), title: "Live position" })
        .addTo(g)
        .bindPopup(
          popupHtml("🚛 Live position", [
            ["Route done", `${Math.round(progress * 100)}%`],
            ["Updated", new Date().toLocaleTimeString()],
            ...tripRows,
          ]),
        );
      if (!vehicles.length)
        m.fitBounds(L.polyline(coords).getBounds(), { padding: [28, 28] });
    };

    stops();
    draw(latlngs);

    const path = points.map((p) => `${p.lng},${p.lat}`).join(";");
    fetch(`https://router.project-osrm.org/route/v1/driving/${path}?overview=full&geometries=geojson`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        const c = j?.routes?.[0]?.geometry?.coordinates as [number, number][] | undefined;
        if (!c?.length || cancelled) return;
        g.clearLayers();
        stops();
        draw(c.map(([lng, lat]) => [lat, lng] as L.LatLngTuple));
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [JSON.stringify(points), JSON.stringify(vehicles), JSON.stringify(trip), progress]);

  return (
    <div
      ref={el}
      className={className ?? "h-56 w-full overflow-hidden rounded-2xl border border-border"}
      role="application"
      aria-label="Live logistics map"
    />
  );
}
