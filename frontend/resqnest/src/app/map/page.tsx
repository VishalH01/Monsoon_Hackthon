"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { api } from "@/api";

const FILL = { fontVariationSettings: "'FILL' 1" } as const;

// Leaflet touches `window`, so load the map only on the client (no SSR).
const LeafletMap = dynamic(() => import("@/app/components/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-surface-container animate-pulse flex items-center justify-center">
      <span className="material-symbols-outlined text-4xl animate-spin text-primary">sync</span>
    </div>
  ),
});

const NAV_ITEMS = [
  { icon: "dashboard", label: "Dashboard", href: "/admin-dashboard" },
  { icon: "emergency", label: "SOS", href: "/sos" },
  { icon: "home_work", label: "Shelters", href: "/shelter-dashboard" },
  { icon: "map", label: "Map", href: "/map", active: true },
  { icon: "person_search", label: "Missing Persons", href: "/missing-persons" },
  { icon: "inventory_2", label: "Inventory", href: "/inventory" },
  { icon: "account_circle", label: "Profile", href: "/profile" },
];

const LAYERS = ["All Layers", "SOS", "Shelters", "Resources", "Missing"];

const LEGEND = [
  { label: "SOS / Incident", dot: "bg-primary" },
  { label: "Shelter", dot: "bg-secondary" },
  { label: "Active Responders", dot: "bg-tertiary" },
  { label: "Missing Case", dot: "bg-on-surface-variant" },
];

export default function MapPage() {
  const [activeLayer, setActiveLayer] = useState("All Layers");
  const [points, setPoints] = useState<any[]>([]);
  const [recentIncidents, setRecentIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchMapPoints();
  }, []);

  const fetchMapPoints = async () => {
    setLoading(true);
    try {
      const allPoints: any[] = [];
      const incidents: any[] = [];

      // 1. Fetch SOS
      try {
        const sosList = await api.sos.fetchAllSOS();
        if (sosList) {
          sosList.forEach((s: any) => {
            if (s.latitude && s.longitude) {
              allPoints.push({
                lat: s.latitude,
                lng: s.longitude,
                type: "sos",
                label: `🚨 EMERGENCY Alert: ${s.message || "No message"} (Urgency: ${s.priorityScore || 0})`,
                name: s.message || "SOS Alert",
              });
              if (s.status === "ACTIVE") {
                incidents.push({
                  dot: "bg-primary",
                  title: s.message || "Active Distress Alarm",
                  location: `Coordinates: [${s.latitude.toFixed(3)}, ${s.longitude.toFixed(3)}]`,
                  time: s.createdAt ? new Date(s.createdAt).toLocaleTimeString() : "Just now",
                });
              }
            }
          });
        }
      } catch (e) {
        console.error("SOS Fetch for map failed", e);
      }

      // 2. Fetch Shelters
      try {
        const shelters = await api.shelters.fetchAll();
        if (shelters) {
          shelters.forEach((s: any) => {
            if (s.latitude && s.longitude) {
              allPoints.push({
                lat: s.latitude,
                lng: s.longitude,
                type: "shelter",
                label: `🏠 Shelter: ${s.name} (${s.occupied || 0}/${s.capacity || 0} capacity)`,
                name: s.name,
              });
              if (s.occupied >= s.capacity) {
                incidents.push({
                  dot: "bg-secondary",
                  title: `Shelter ${s.name} at Capacity`,
                  location: s.address || "Sector area",
                  time: "Updated recently",
                });
              }
            }
          });
        }
      } catch (e) {
        console.error("Shelter Fetch for map failed", e);
      }

      // 3. Fetch Volunteers (mapped as Resources / Responders)
      try {
        const volunteers = await api.volunteers.fetchAll();
        if (volunteers) {
          volunteers.forEach((v: any) => {
            let lat = v.latitude;
            let lng = v.longitude;
            if (!lat || !lng) {
              const seed = v.id || 1;
              const pseudoRandomLat = (Math.sin(seed) * 1000) % 1;
              const pseudoRandomLng = (Math.cos(seed) * 1000) % 1;
              lat = 12.97 + pseudoRandomLat * 0.015;
              lng = 77.59 + pseudoRandomLng * 0.015;
            }
            allPoints.push({
              lat: lat,
              lng: lng,
              type: "resource",
              label: `👷 Responder: ${v.name} (${v.status || "AVAILABLE"})`,
              name: v.name,
            });
          });
        }
      } catch (e) {
        console.error("Volunteer Fetch for map failed", e);
      }

      // 4. Fetch Missing Persons
      try {
        const missing = await api.missingPersons.fetchAll();
        if (missing) {
          missing.forEach((m: any) => {
            if (m.latitude && m.longitude) {
              allPoints.push({
                lat: m.latitude,
                lng: m.longitude,
                type: "missing",
                label: `🔍 Missing Case: ${m.fullName} (Last seen: ${m.lastSeenLocation})`,
                name: m.fullName,
              });
            }
          });
        }
      } catch (e) {
        console.error("Missing Persons Fetch for map failed", e);
      }

      setPoints(allPoints);
      setRecentIncidents(incidents);
    } catch (err) {
      console.error("Failed to load map assets:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter based on search query
  const filteredPoints = points.filter((p) => {
    if (!search) return true;
    return (
      p.label?.toLowerCase().includes(search.toLowerCase()) ||
      p.name?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <>
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-sidebar-width bg-inverse-surface shadow-lg flex flex-col py-stack-lg border-r border-outline-variant/10 z-[60] hidden md:flex">
        <div className="px-6 mb-10">
          <h1 className="font-headline-lg text-headline-lg font-black text-on-primary">
            ResQNest Map
          </h1>
          <p className="font-label-md text-label-md text-secondary-fixed/60 mt-1 uppercase tracking-widest">
            Tactical Overview
          </p>
        </div>
        <nav className="flex-grow px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            let href = item.href;
            if (item.label === "Dashboard") {
              const role = typeof window !== "undefined" ? localStorage.getItem("resqnest_role") : null;
              if (role === "VOLUNTEER") href = "/volunteer-dashboard";
              else if (role === "VICTIM") href = "/victim-dashboard";
              else if (role === "SHELTER_MANAGER") href = "/shelter-dashboard";
              else href = "/admin-dashboard";
            }
            return (
              <Link
                key={item.label}
                href={href}
                className={
                  item.active
                    ? "flex items-center gap-3 px-4 py-3 rounded-lg text-secondary-fixed bg-secondary-fixed/10 border-l-4 border-secondary font-bold transition-all cursor-pointer"
                    : "flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant/80 font-medium hover:bg-surface-variant/10 hover:text-white transition-all cursor-pointer"
                }
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="font-label-md text-label-md">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="px-6 mt-auto">
          <Link
            href="/sos"
            className="w-full bg-primary text-white py-4 rounded-lg font-bold shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">report</span>
            Report Emergency
          </Link>
        </div>
      </aside>

      {/* Main Container */}
      <div className="md:ml-sidebar-width h-screen flex flex-col">
        {/* Top App Bar */}
        <header className="flex justify-between items-center w-full px-margin-desktop h-16 bg-surface shadow-sm border-b border-outline-variant shrink-0 relative z-20">
          <div className="flex items-center gap-4">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant">
                search
              </span>
              <input
                className="pl-10 pr-4 py-2 bg-surface-container rounded-full border-none focus:ring-2 focus:ring-primary w-72 text-sm outline-none"
                placeholder="Search map markers..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {loading && (
              <span className="material-symbols-outlined animate-spin text-primary text-sm">
                sync
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={fetchMapPoints}
              className="p-2 hover:bg-surface-container-high transition-colors rounded-full relative cursor-pointer"
              title="Refresh Map Data"
            >
              <span className="material-symbols-outlined text-on-surface-variant">
                refresh
              </span>
            </button>
            <div className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform">
              <span className="material-symbols-outlined text-primary text-headline-md">
                account_circle
              </span>
              <span className="hidden lg:block font-body-md font-bold text-primary">
                HQ Ops Terminal
              </span>
            </div>
          </div>
        </header>

        {/* Map Canvas */}
        <div className="flex-1 relative overflow-hidden bg-surface-container">
          {/* OpenStreetMap (Leaflet) loaded dynamically */}
          <div className="absolute inset-0 z-0">
            <LeafletMap activeLayer={activeLayer} points={filteredPoints} />
          </div>

          {/* Top: layer filter bar */}
          <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-wrap items-center gap-2 glass-effect p-2 rounded-xl border border-white/50 shadow-lg bg-white/85 backdrop-blur-md">
            <div className="flex items-center gap-2 px-2 text-on-surface font-bold text-sm">
              <span className="material-symbols-outlined text-primary" style={FILL}>
                layers
              </span>
              Live Map Layers
            </div>
            <div className="h-6 w-px bg-outline-variant/60 mx-1" />
            <div className="flex gap-2 overflow-x-auto">
              {LAYERS.map((label) => (
                <button
                  key={label}
                  onClick={() => setActiveLayer(label)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    activeLayer === label
                      ? "bg-primary text-white shadow-sm"
                      : "bg-white/70 text-on-surface-variant hover:bg-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom-left: legend */}
          <div className="absolute bottom-4 left-4 z-[1000] glass-effect p-4 rounded-xl border border-white/50 shadow-lg bg-white/85 backdrop-blur-md">
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">
              Legend
            </p>
            <div className="space-y-2">
              {LEGEND.map((l) => (
                <div key={l.label} className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${l.dot}`} />
                  <span className="text-xs font-medium text-on-surface">
                    {l.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top-right: live incidents panel */}
          <div className="absolute top-20 right-4 z-[1000] w-72 glass-effect rounded-xl border border-white/50 shadow-lg overflow-hidden hidden lg:block bg-white/85 backdrop-blur-md">
            <div className="px-4 py-3 border-b border-outline-variant/40 flex items-center justify-between">
              <h3 className="font-bold text-on-surface flex items-center gap-2 text-sm">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  notifications_active
                </span>
                Active Incidents
              </h3>
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {recentIncidents.length}
              </span>
            </div>
            <div className="p-3 space-y-3 max-h-72 overflow-y-auto custom-scrollbar">
              {recentIncidents.length === 0 ? (
                <p className="text-center py-4 text-xs text-on-surface-variant italic">
                  No active red alerts in map center.
                </p>
              ) : (
                recentIncidents.map((inc, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/60 transition-colors cursor-pointer"
                  >
                    <span
                      className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${inc.dot}`}
                    />
                    <div className="flex-1">
                      <p className="text-body-sm font-bold text-on-surface">
                        {inc.title}
                      </p>
                      <p className="text-[11px] text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">
                          location_on
                        </span>
                        {inc.location}
                      </p>
                      <p className="text-[10px] text-outline font-bold mt-0.5">
                        {inc.time}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
