"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/api";

const FILL = { fontVariationSettings: "'FILL' 1" } as const;

const NAV_ITEMS = [
  { icon: "dashboard", label: "Dashboard", href: "/admin-dashboard" },
  { icon: "emergency", label: "SOS", href: "/sos" },
  { icon: "home_pin", label: "Shelters", href: "/shelter-dashboard", active: true },
  { icon: "map", label: "Map", href: "/map" },
  { icon: "person_search", label: "Missing Persons", href: "/missing-persons" },
  { icon: "volunteer_activism", label: "Donations", href: "/donations" },
  { icon: "settings", label: "Settings", href: "/profile" },
];

const RESIDENTS = [
  {
    name: "Elena Rodriguez",
    id: "RL-2938-41",
    status: "Verified",
    statusClass: "bg-emerald-100 text-emerald-700",
    room: "Wing A / R-12",
    entry: "Oct 12, 08:45 AM",
    needs: { label: "Diabetes", class: "bg-amber-100 text-amber-700" },
  },
  {
    name: "Marcus Thorne",
    id: "RL-1102-09",
    status: "Processing",
    statusClass: "bg-blue-100 text-blue-700",
    room: "Wing B / R-04",
    entry: "Oct 14, 11:20 PM",
    needs: null,
  },
  {
    name: "Sarah J. Miller",
    id: "RL-4482-17",
    status: "Verified",
    statusClass: "bg-emerald-100 text-emerald-700",
    room: "Wing A / R-22",
    entry: "Oct 10, 02:15 PM",
    needs: { label: "Mobility Impaired", class: "bg-primary/10 text-primary" },
  },
];

const OCCUPANCY = [
  { label: "Wing A (General Housing)", count: "170/200", width: "85%", bar: "bg-secondary" },
  { label: "Wing B (Family Units)", count: "90/150", width: "60%", bar: "bg-secondary" },
  { label: "Wing C (Medical & Care)", count: "45/50", width: "90%", bar: "bg-error" },
];

const INVENTORY = [
  {
    icon: "medical_services",
    iconClass: "bg-primary/10 text-primary",
    label: "First Aid Supplies",
    value: "12% Low",
    valueClass: "text-error",
  },
  {
    icon: "restaurant",
    iconClass: "bg-emerald-100 text-emerald-600",
    label: "Hygiene Kits",
    value: "Optimal",
    valueClass: "text-emerald-600",
  },
  {
    icon: "power",
    iconClass: "bg-blue-100 text-blue-600",
    label: "Generator Fuel",
    value: "84% Capacity",
    valueClass: "text-blue-600",
  },
];

const HOTLINE = [
  { label: "Central Command", number: "911-RESQ-NEST", iconClass: "text-primary" },
  { label: "Medical Dispatch", number: "*EMS-4444", iconClass: "text-secondary" },
  { label: "Local Fire Dept", number: "312-555-0199", iconClass: "text-amber-500" },
];

export default function ShelterDashboard() {
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [shelters, setShelters] = useState<any[]>([]);
  const [selectedShelter, setSelectedShelter] = useState<any>(null);
  const [residents, setResidents] = useState<any[]>([]);
  const [newResidentId, setNewResidentId] = useState("");
  const [checkingIn, setCheckingIn] = useState(false);

  const loadData = () => {
    api.shelters.fetchAll()
      .then((data) => {
        if (data && data.length > 0) {
          setShelters(data);
          const defaultShelter = selectedShelter || data[0];
          setSelectedShelter(defaultShelter);
          fetchResidents(defaultShelter.id);
        }
      })
      .catch((err) => console.error("Error fetching shelters:", err));
  };

  const fetchResidents = (shelterId: number) => {
    api.shelters.fetchResidents(shelterId)
      .then((data) => {
        if (data) setResidents(data);
      })
      .catch((err) => console.error("Error fetching residents:", err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectShelter = (shelter: any) => {
    setSelectedShelter(shelter);
    fetchResidents(shelter.id);
  };

  const handleAddResident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShelter || !newResidentId) return;
    setCheckingIn(true);
    try {
      await api.shelters.addResident(selectedShelter.id, Number(newResidentId));
      setToastMessage(`Resident with ID ${newResidentId} checked in successfully!`);
      setToastVisible(true);
      setNewResidentId("");
      fetchResidents(selectedShelter.id);
      loadData();
      setTimeout(() => setToastVisible(false), 4500);
    } catch (err: any) {
      alert(err.message || "Error checking in resident. Please verify User ID exists.");
    } finally {
      setCheckingIn(false);
    }
  };

  return (
    <>
      {/* Side Navigation */}
      <aside className="fixed left-0 top-0 h-screen w-[280px] bg-[#0F172A] shadow-lg flex flex-col py-6 z-50">
        <div className="px-6 mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white" style={FILL}>
                emergency
              </span>
            </div>
            <div>
              <h1 className="font-headline-md text-headline-md font-bold text-white tracking-tight">
                ResQNest HQ
              </h1>
              <p className="text-white/60 text-xs uppercase tracking-widest font-bold">
                Incident Command
              </p>
            </div>
          </div>
        </div>
        <nav className="sidebar-nav flex-1 space-y-1">
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
                    ? "flex items-center gap-3 px-6 py-3 text-secondary-fixed-dim border-l-4 border-secondary-fixed bg-secondary-container/10 cursor-pointer active:scale-95"
                    : "flex items-center gap-3 px-6 py-3 text-on-surface-variant/70 hover:text-white transition-colors duration-200 cursor-pointer active:scale-95 group"
                }
              >
                <span
                  className={
                    item.active
                      ? "material-symbols-outlined"
                      : "material-symbols-outlined group-hover:text-secondary-fixed"
                  }
                  style={item.active ? FILL : undefined}
                >
                  {item.icon}
                </span>
                <span className="font-label-md text-label-md">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="px-6 mt-auto">
          <button className="w-full py-4 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95">
            <span className="material-symbols-outlined">add_circle</span>
            New Dispatch
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-[280px] h-screen relative flex flex-col">
        {/* Top App Bar */}
        <header className="fixed top-0 right-0 w-[calc(100%-280px)] h-16 bg-surface/70 backdrop-blur-md border-b border-outline-variant flex items-center justify-between px-margin-desktop z-40">
          <div className="flex items-center flex-1 max-w-xl">
            <div className="relative w-full group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                search
              </span>
              <input
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-body-sm focus:ring-2 focus:ring-secondary/20 focus:bg-white transition-all"
                placeholder="Search residents, supplies, or reports..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full" />
              </button>
              <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined">help</span>
              </button>
            </div>
            <div className="h-8 w-px bg-outline-variant" />
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="text-right hidden xl:block">
                <p className="font-bold text-sm text-on-surface">Alex Commander</p>
                <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-tighter leading-none">
                  Shelter Administrator
                </p>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="w-10 h-10 rounded-full border-2 border-primary object-cover"
                alt="Alex Commander, Shelter Administrator"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBsfd-qMUdGOgEIql47uGKB9nw2BvUenwO1nMgMs7wKuB8SCaUnCIqL6uAkEVawvhXJVG5srzE-sG64XntYU6E1dZUnNhu9BmS3GRU5Umdrti0wP7uNbeVQ1h8kUja25w206ioieInqXkr8h4iGvAIEaRpHFhlBlW4xAEImAQLMSn6DwntHN9drxPJOOgSmdyzc82ay9XNM4oSmCFjd6bAmhMgiFRdpyExxK3p2ukDMxRR3TpdC8aqPUek_9ht-T1ravQVZAh28jGI"
              />
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="pt-24 px-margin-desktop pb-margin-desktop flex-1 min-h-0 overflow-y-auto custom-scrollbar">
          {/* Page Header */}
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 text-primary font-bold text-sm mb-1 uppercase tracking-widest">
                <span className="material-symbols-outlined text-sm">domain</span>
                Asset Management
              </div>
              <div className="flex items-center gap-4">
                <h2 className="font-headline-lg text-headline-lg text-on-surface">
                  {selectedShelter?.name || "St. Jude Community Shelter"}
                </h2>
                <div className="relative">
                  <select
                    value={selectedShelter?.id || ""}
                    onChange={(e) => {
                      const matched = shelters.find((s) => s.id === Number(e.target.value));
                      if (matched) handleSelectShelter(matched);
                    }}
                    className="pl-4 pr-10 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-secondary/20 cursor-pointer outline-none"
                  >
                    {shelters.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="text-on-surface-variant">
                Status: {selectedShelter?.status || "ACTIVE"} • Location: {selectedShelter?.location || "Springfield"}
              </p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 border border-outline-variant text-secondary font-bold rounded-lg flex items-center gap-2 hover:bg-white transition-colors">
                <span className="material-symbols-outlined text-xl">
                  file_download
                </span>{" "}
                Export Report
              </button>
              <button className="px-4 py-2 bg-primary text-white font-bold rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-all shadow-md">
                <span className="material-symbols-outlined text-xl">
                  emergency_home
                </span>{" "}
                Status Update
              </button>
            </div>
          </div>

          {/* KPI Cards Row */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-gutter mb-8">
            <KpiCard label="Total Capacity">
              <span className="font-headline-md text-on-surface">{selectedShelter?.capacity || 0}</span>
              <span className="material-symbols-outlined text-slate-300">
                group
              </span>
            </KpiCard>
            <KpiCard label="Occupied">
              <span className="font-headline-md text-secondary">{selectedShelter?.occupied || 0}</span>
              <span className="text-xs font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">
                {selectedShelter ? Math.round((selectedShelter.occupied / selectedShelter.capacity) * 100) : 0}%
              </span>
            </KpiCard>
            <KpiCard label="Available Beds">
              <span className="font-headline-md text-emerald-600">
                {selectedShelter ? selectedShelter.capacity - selectedShelter.occupied : 0}
              </span>
              <span className="material-symbols-outlined text-emerald-200">
                bed
              </span>
            </KpiCard>
            <KpiCard label="Medical Kits">
              <span className="font-headline-md text-on-surface">45</span>
              <span className="text-xs font-bold text-error bg-error/10 px-2 py-0.5 rounded-full">
                Low
              </span>
            </KpiCard>
            <KpiCard label="Food Stock">
              <span className="font-headline-md text-on-surface">1.2k</span>
              <p className="text-[10px] text-on-surface-variant">rations</p>
            </KpiCard>
            <KpiCard label="Water Stock">
              <span className="font-headline-md text-on-surface">2.5k</span>
              <p className="text-[10px] text-on-surface-variant">liters</p>
            </KpiCard>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-12 gap-gutter">
            {/* Main column */}
            <div className="col-span-12 xl:col-span-8 space-y-gutter">
              {/* Active Residents */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex flex-wrap items-center justify-between gap-4">
                  <h3 className="font-headline-md text-lg">Active Residents</h3>
                  <form onSubmit={handleAddResident} className="flex gap-2 items-center">
                    <input
                      type="number"
                      required
                      placeholder="User ID to check-in"
                      value={newResidentId}
                      onChange={(e) => setNewResidentId(e.target.value)}
                      className="px-3 py-1.5 border border-outline rounded-lg text-xs w-36 outline-none focus:border-primary bg-white text-on-surface"
                    />
                    <button
                      type="submit"
                      disabled={checkingIn}
                      className="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/95 transition-all cursor-pointer"
                    >
                      {checkingIn ? "Checking-in..." : "Check-in User"}
                    </button>
                  </form>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/50">
                      <tr className="text-on-surface-variant font-label-md text-xs uppercase">
                        <th className="px-6 py-4">Name &amp; ID</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Room / Wing</th>
                        <th className="px-6 py-4">Entry Date</th>
                        <th className="px-6 py-4">Special Needs</th>
                        <th className="px-6 py-4" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {residents.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-on-surface-variant italic">
                            No residents checked in to this shelter.
                          </td>
                        </tr>
                      ) : (
                        residents.map((r) => (
                          <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                              <p className="font-bold text-on-surface">{r.fullName || r.username}</p>
                              <p className="text-xs text-on-surface-variant font-mono-sm">
                                ID: {r.id} • {r.email}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 text-[10px] font-bold rounded uppercase bg-emerald-100 text-emerald-700">
                                {r.safetyStatus || "SAFE"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium">
                              {r.room || "General Hall"}
                            </td>
                            <td className="px-6 py-4 text-sm text-on-surface-variant">
                              {r.entryDate ? new Date(r.entryDate).toLocaleDateString() : "Recent"}
                            </td>
                            <td className="px-6 py-4">
                              {r.specialNeeds ? (
                                <span className="px-2 py-1 text-[10px] font-bold rounded-full bg-amber-100 text-amber-700">
                                  {r.specialNeeds}
                                </span>
                              ) : (
                                <span className="text-xs text-on-surface-variant italic">
                                  None reported
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button className="text-on-surface-variant hover:text-primary">
                                <span className="material-symbols-outlined">
                                  more_vert
                                </span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                  <span>Showing {residents.length} residents</span>
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50"
                      disabled
                    >
                      Prev
                    </button>
                    <button className="px-3 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50">
                      Next
                    </button>
                  </div>
                </div>
              </div>

              {/* Occupancy & Inventory */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                {/* Occupancy */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                  <h3 className="font-headline-md text-lg mb-6">Zone Occupancy</h3>
                  <div className="space-y-6">
                    {OCCUPANCY.map((o) => (
                      <div key={o.label}>
                        <div className="flex justify-between items-end mb-2">
                          <span className="font-bold text-sm">{o.label}</span>
                          <span className="text-xs font-mono-sm">{o.count}</span>
                        </div>
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${o.bar} transition-all duration-1000`}
                            style={{ width: o.width }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Critical Inventory */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                  <h3 className="font-headline-md text-lg mb-6">
                    Critical Inventory
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {INVENTORY.map((i) => (
                      <div
                        key={i.label}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded ${i.iconClass}`}>
                            <span className="material-symbols-outlined text-lg">
                              {i.icon}
                            </span>
                          </div>
                          <span className="text-sm font-bold">{i.label}</span>
                        </div>
                        <span className={`font-bold text-sm ${i.valueClass}`}>
                          {i.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Side Panels */}
            <div className="col-span-12 xl:col-span-4 space-y-gutter">
              {/* Shelter Information */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="relative h-32 w-full">
                  <div className="absolute inset-0 bg-slate-900/40 z-10" />
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage:
                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCNq3Sx1ZqWnezyRjLSSme79DkkJuk1hbZXRElj7qfeLnitjXdDsYBtUwcTGeo8a3Jb8GMYWUtxHVev95X_XyTwSTL_YR3-vEldFpYuQM7FEKt9TQCU9K2X1MaXAmV5QK0k46C2TRfL3DYaJ9kHGO8h5jVAjk8Yy7m-cOgHcm9ZzoMTzUBj1AxRFwVu2ZDxBvWAia9PFsDwamzmpuM9kITHU2iimzEx0TFxchIfkhnC6oriVGC57YKAjBuxLvUcS09b0DSpUY5XeuY')",
                    }}
                  />
                  <div className="absolute bottom-3 left-4 z-20">
                    <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">
                      Active Site
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="mb-6">
                    <h4 className="font-bold text-on-surface mb-2">
                      Shelter Details
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <span className="material-symbols-outlined text-on-surface-variant">
                          location_on
                        </span>
                        <span className="text-on-surface-variant">
                          {selectedShelter?.location || "Springfield"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="material-symbols-outlined text-on-surface-variant">
                          person
                        </span>
                        <span className="text-on-surface-variant">
                          Status:{" "}
                          <strong className="text-on-surface uppercase text-xs">
                            {selectedShelter?.status || "ACTIVE"}
                          </strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="material-symbols-outlined text-on-surface-variant">
                          call
                        </span>
                        <span className="text-on-surface-variant font-mono-sm">
                          +1 (555) 091-2241
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-error/5 border border-error/20 rounded-lg mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-error uppercase tracking-widest">
                        Threat Level
                      </span>
                      <span className="material-symbols-outlined text-error">
                        warning
                      </span>
                    </div>
                    <p className="text-error font-headline-md text-xl">
                      Elevated (Stage 2)
                    </p>
                    <p className="text-[11px] text-error/80 mt-1">
                      Severe weather warning active for the next 24 hours.
                    </p>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="bg-[#0F172A] text-white rounded-xl p-6 shadow-xl border border-white/10">
                <h4 className="font-bold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">
                    contact_phone
                  </span>
                  Emergency Hotline
                </h4>
                <div className="space-y-4">
                  {HOTLINE.map((h) => (
                    <div
                      key={h.label}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <div>
                        <p className="text-xs text-white/50 uppercase font-bold tracking-tighter">
                          {h.label}
                        </p>
                        <p className="font-bold font-mono-sm">{h.number}</p>
                      </div>
                      <span className={`material-symbols-outlined ${h.iconClass}`}>
                        call
                      </span>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-6 py-3 border border-white/20 rounded-lg text-sm font-bold hover:bg-white hover:text-[#0F172A] transition-all">
                  View All Protocols
                </button>
              </div>

              {/* Map Overview */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden p-2">
                <div className="relative rounded-lg overflow-hidden h-48">
                  <div className="w-full h-full grayscale hover:grayscale-0 transition-all duration-700 cursor-crosshair">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      className="w-full h-full object-cover"
                      alt="Map of Springfield, Illinois with relief coordination points"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBsI78NckHddmP9OiGRU3DVEz_C6OdbcNY15rNCuy_hDLecLEuCCLjbxpkPhFJZO5Qtux27jzQT4opsvY9923qy67WRvwNt33ure3p-DwzzIjeQSeLYH8VM-v4Y4IRRoD7Y15paWkl3SWvok0yaE3_hfEfm7fJqDGANfBbdZweHkJsSV0PoWzjR0kHhpb3KE_xaKTiNZVbXMRjc7az7beTRwo5C3hk1lWq92VtoFfrbjl0_Qkh14sDMgITsoxCq1pFeGLmAH1Uflb8"
                    />
                  </div>
                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                    <button className="w-8 h-8 bg-white/90 backdrop-blur rounded shadow flex items-center justify-center text-on-surface hover:bg-white">
                      <span className="material-symbols-outlined text-sm">add</span>
                    </button>
                    <button className="w-8 h-8 bg-white/90 backdrop-blur rounded shadow flex items-center justify-center text-on-surface hover:bg-white">
                      <span className="material-symbols-outlined text-sm">
                        remove
                      </span>
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-xs font-bold text-on-surface flex items-center gap-1">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    Sector Northeast Safe-Path
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Toast */}
        <div
          className={`fixed bottom-8 right-8 bg-[#0F172A] text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 transition-all duration-500 z-[100] ${
            toastVisible ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0"
          }`}
        >
          <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-lg">
              check_circle
            </span>
          </div>
          <div>
            <p className="font-bold text-sm">Shelter Console Alert</p>
            <p className="text-xs text-white/60">
              {toastMessage}
            </p>
          </div>
          <button
            className="ml-4 hover:text-primary"
            onClick={() => setToastVisible(false)}
            aria-label="Dismiss notification"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      </main>
    </>
  );
}

function KpiCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
      <p className="text-on-surface-variant font-label-md text-xs uppercase mb-3">
        {label}
      </p>
      <div className="flex items-end justify-between">{children}</div>
    </div>
  );
}
