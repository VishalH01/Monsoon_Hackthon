"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/api";

const FILL = { fontVariationSettings: "'FILL' 1" } as const;

const NAV_ITEMS = [
  { icon: "dashboard", label: "Dashboard", href: "/admin-dashboard", active: true },
  { icon: "map", label: "Operations Map", href: "/map" },
  { icon: "emergency", label: "SOS System", href: "/sos" },
  { icon: "home_work", label: "Shelters", href: "/shelter-dashboard" },
  { icon: "inventory_2", label: "Inventory Ledger", href: "/inventory" },
  { icon: "person_search", label: "Missing Database", href: "/missing-persons" },
  { icon: "volunteer_activism", label: "Donation HQ", href: "/donations" },
  { icon: "person", label: "Profile", href: "/profile" },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [assignmentSaving, setAssignmentSaving] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const data = await api.dashboard.fetchStats();
      setStats(data);

      const vols = await api.volunteers.fetchAll();
      // Filter online/available volunteers
      setVolunteers(vols || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load admin stats. Verify administrator token permissions.");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignVolunteer = async (sosId: number, volunteerId: number) => {
    if (!volunteerId) return;
    setAssignmentSaving(prev => ({ ...prev, [sosId]: true }));
    try {
      await api.sos.assignVolunteer(sosId, volunteerId);
      // Reload stats
      const updatedStats = await api.dashboard.fetchStats();
      setStats(updatedStats);
    } catch (err: any) {
      alert("Error assigning volunteer: " + (err.message || err));
    } finally {
      setAssignmentSaving(prev => ({ ...prev, [sosId]: false }));
    }
  };

  const handleForceRecalculate = async () => {
    try {
      await api.sos.forceRecalculatePriorities();
      const updatedStats = await api.dashboard.fetchStats();
      setStats(updatedStats);
      alert("Urgency priorities recalculated based on new risk telemetry!");
    } catch (err: any) {
      alert("Recalculation error: " + (err.message || err));
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface text-on-surface">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-4xl animate-spin text-primary">
            sync
          </span>
          <p className="font-label-md">Syncing with HQ Satellites...</p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface text-on-surface p-6">
        <div className="glass-card max-w-md p-8 rounded-2xl shadow-xl text-center border border-outline-variant">
          <span className="material-symbols-outlined text-5xl text-primary mb-4">
            gpp_maybe
          </span>
          <h3 className="font-headline-md text-xl mb-2 text-on-surface">Access Forbidden</h3>
          <p className="text-on-surface-variant font-body-md mb-6">{error}</p>
          <Link
            href="/login"
            className="inline-block bg-primary text-on-primary font-bold px-6 py-3 rounded-lg hover:bg-primary-container transition-all active:scale-95"
          >
            Authenticate Admin
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Sidebar */}
      <aside className="h-screen w-sidebar-width fixed left-0 top-0 bg-inverse-surface shadow-md flex flex-col py-stack-lg z-50 hidden md:flex">
        <div className="px-6 mb-8">
          <h1 className="font-headline-md text-headline-md font-bold text-white">
            ResQNest HQ
          </h1>
          <p className="text-secondary text-xs uppercase tracking-widest font-semibold mt-1">
            Unified Command Center
          </p>
        </div>
        <nav className="flex-grow">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={
                item.active
                  ? "flex items-center gap-3 px-4 py-3 border-l-4 border-secondary bg-secondary-container/10 text-secondary font-bold transition-all duration-200 ease-in-out"
                  : "flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-white hover:bg-secondary-container/20 transition-all duration-200 ease-in-out"
              }
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-auto px-6 pt-4 border-t border-white/10 flex items-center gap-3 text-white/70">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
            A
          </div>
          <div className="text-xs">
            <p className="font-bold text-white">Global Command</p>
            <p>Status: Active On Duty</p>
          </div>
        </div>
      </aside>

      {/* Top App Bar */}
      <header className="fixed top-0 right-0 w-[calc(100%-280px)] z-40 bg-surface/70 backdrop-blur-md shadow-sm border-b border-outline-variant/30 flex justify-between items-center px-margin-desktop py-4">
        <div className="flex items-center gap-stack-md">
          <h2 className="font-headline-md text-headline-md font-extrabold text-on-surface">
            Command Center
          </h2>
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={handleForceRecalculate}
            className="px-4 py-2 bg-primary text-white font-bold rounded-lg flex items-center gap-2 hover:bg-primary-container transition-all active:scale-95 shadow-md text-sm"
          >
            <span className="material-symbols-outlined">bolt</span>
            <span>Recalculate Priorities</span>
          </button>
          <div className="flex items-center gap-4 border-l border-outline-variant/30 pl-6">
            <button
              onClick={() => window.print()}
              className="bg-primary-container text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-primary transition-colors shadow-md text-sm"
            >
              <span className="material-symbols-outlined">download</span>
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="ml-sidebar-width pt-24 px-margin-desktop pb-stack-lg min-h-screen bg-[#F8FAFC]">
        {/* KPI Header Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-stack-lg">
          <div className="bento-card bg-white border border-outline-variant/50 p-6 rounded-xl flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <p className="text-on-surface-variant font-label-md text-label-md uppercase tracking-wider">
                Active SOS Requests
              </p>
              <span className="material-symbols-outlined text-primary" style={FILL}>
                emergency
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-headline-lg">{stats.activeSOSCount || 0}</span>
              <span className="text-xs px-2 py-0.5 bg-red-100 text-red-800 rounded font-bold animate-pulse">
                Needs Dispatch
              </span>
            </div>
            <p className="text-xs text-outline mt-2 italic">Active alarms in queue</p>
          </div>

          <div className="bento-card bg-white border border-outline-variant/50 p-6 rounded-xl flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <p className="text-on-surface-variant font-label-md text-label-md uppercase tracking-wider">
                Volunteers Online
              </p>
              <span className="material-symbols-outlined text-secondary" style={FILL}>
                volunteer_activism
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-headline-lg">{stats.volunteersOnline || 0}</span>
              <div className="flex items-center text-green-600 text-sm font-bold">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping mr-1" />
                <span>Live Ready</span>
              </div>
            </div>
            <p className="text-xs text-outline mt-2 italic">Ready for assignment</p>
          </div>

          <div className="bento-card bg-white border border-outline-variant/50 p-6 rounded-xl flex flex-col justify-between border-l-4 border-secondary">
            <div className="flex justify-between items-start mb-4">
              <p className="text-on-surface-variant font-label-md text-label-md uppercase tracking-wider">
                Shelter Occupancy
              </p>
              <span className="material-symbols-outlined text-tertiary" style={FILL}>
                night_shelter
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-headline-lg">
                {stats.shelterOccupancyRate !== undefined ? `${stats.shelterOccupancyRate}%` : "0%"}
              </span>
              <span className="text-xs text-outline">({stats.sheltersAvailable || 0} Shelters)</span>
            </div>
            <p className="text-xs text-outline mt-2 italic">
              Capacity distribution status
            </p>
          </div>

          <div className="bento-card bg-white border border-outline-variant/50 p-6 rounded-xl flex flex-col justify-between border-l-4 border-primary">
            <div className="flex justify-between items-start mb-4">
              <p className="text-on-surface-variant font-label-md text-label-md uppercase tracking-wider">
                Warehouse Alerts
              </p>
              <span className="material-symbols-outlined text-primary" style={FILL}>
                warning
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-headline-lg text-primary">
                {stats.inventoryAlertsCount || 0} items
              </span>
            </div>
            <p className="text-xs text-outline mt-2 italic">
              Inventory levels below threshold
            </p>
          </div>
        </div>

        {/* Dynamic Map Navigation & Details */}
        <div className="grid grid-cols-12 gap-gutter mb-stack-lg">
          {/* Active alerts table */}
          <div className="col-span-12 lg:col-span-8 bento-card bg-white border border-outline-variant/50 rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center">
              <h3 className="font-headline-md text-headline-md flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">
                  report
                </span>
                Active Emergency Dispatch Logs
              </h3>
              <span className="text-body-sm text-on-surface-variant font-bold">
                Triage Sorted by Urgency Score
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs uppercase tracking-wider text-outline font-bold border-b border-outline-variant/30 bg-surface">
                    {["Status", "Victim", "Location", "Priority / Base Score", "Assigned Volunteer", "Report Time"].map(
                      (h) => (
                        <th key={h} className="px-6 py-4">
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {(!stats.recentSOSAlerts || stats.recentSOSAlerts.length === 0) ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-on-surface-variant italic">
                        No active SOS requests in emergency pipeline. System clear!
                      </td>
                    </tr>
                  ) : (
                    stats.recentSOSAlerts.map((row: any) => {
                      const isHigh = row.priorityScore >= 70;
                      return (
                        <tr
                          key={row.id}
                          className={`hover:bg-slate-50 transition-colors ${isHigh ? "bg-red-50/20" : ""}`}
                        >
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                                row.status === "ACTIVE"
                                  ? "bg-red-100 text-red-800 animate-pulse"
                                  : row.status === "RESOLVED"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {row.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-bold text-on-surface">{row.name || `User #${row.userId}`}</p>
                            <p className="text-[11px] text-on-surface-variant max-w-[200px] truncate">{row.message}</p>
                          </td>
                          <td className="px-6 py-4 text-sm font-mono-sm">
                            {row.latitude.toFixed(4)}, {row.longitude.toFixed(4)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="flex gap-0.5">
                                {[1, 2, 3].map((star) => {
                                  const fillStar = row.priorityScore >= (star * 33);
                                  return (
                                    <div
                                      key={star}
                                      className={`w-3.5 h-2 rounded-sm ${fillStar ? "bg-primary" : "bg-outline-variant"}`}
                                    />
                                  );
                                })}
                              </div>
                              <span className="font-bold text-xs">({row.priorityScore})</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {row.volunteerId ? (
                              <span className="px-2 py-1 bg-green-50 text-green-700 rounded font-semibold text-xs">
                                Volunteer #{row.volunteerId}
                              </span>
                            ) : (
                              <select
                                onChange={(e) => handleAssignVolunteer(row.id, Number(e.target.value))}
                                defaultValue=""
                                disabled={assignmentSaving[row.id]}
                                className="px-2 py-1 bg-surface border border-outline-variant rounded text-xs outline-none focus:ring-1 focus:ring-secondary"
                              >
                                <option value="" disabled>-- Assign --</option>
                                {volunteers.map((v) => (
                                  <option key={v.id} value={v.id}>
                                    {v.fullName || v.username} ({v.status})
                                  </option>
                                ))}
                              </select>
                            )}
                          </td>
                          <td className="px-6 py-4 text-xs font-mono text-outline">
                            {row.createdAt ? new Date(row.createdAt).toLocaleTimeString() : "-"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Critical inventory items notifications */}
          <div className="col-span-12 lg:col-span-4 bento-card bg-white border border-outline-variant/50 rounded-xl p-8 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-headline-md text-headline-md mb-2">
                Supply Shortages
              </h3>
              <p className="text-outline text-sm mb-6">
                Warehouse inventory below target thresholds
              </p>
              <div className="space-y-4">
                {(!stats.criticalInventoryAlerts || stats.criticalInventoryAlerts.length === 0) ? (
                  <p className="text-center py-6 text-on-surface-variant italic">
                    Supply lines optimal. No shortages logged!
                  </p>
                ) : (
                  stats.criticalInventoryAlerts.slice(0, 5).map((item: any) => (
                    <div
                      key={item.id}
                      className="p-3 bg-red-50/30 border border-primary/10 rounded-lg flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">
                          warning
                        </span>
                        <div>
                          <p className="font-bold text-on-surface text-sm">{item.itemName}</p>
                          <p className="text-[10px] text-on-surface-variant uppercase">
                            Warehouse: {item.warehouseLocation || "Main Depot"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary text-sm">{item.quantity} {item.unit}</p>
                        <p className="text-[10px] text-on-surface-variant">Min: {item.threshold}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <Link
              href="/inventory"
              className="w-full mt-6 py-2.5 bg-secondary text-on-secondary font-bold text-center text-sm rounded-lg hover:bg-secondary-container transition-all active:scale-95 shadow-md block"
            >
              Reorder Supplies Ledger
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
