"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { api } from "@/api";

const FILL = { fontVariationSettings: "'FILL' 1" } as const;

const NAV_ITEMS = [
  { icon: "dashboard", label: "Dashboard", href: "/volunteer-dashboard", active: true },
  { icon: "volunteer_activism", label: "Assigned Tasks", href: "/volunteer-dashboard" },
  { icon: "home_work", label: "Shelters", href: "/shelter-dashboard" },
  { icon: "map", label: "Map View", href: "/map" },
  { icon: "inventory_2", label: "Inventory", href: "/inventory" },
  { icon: "person", label: "Profile", href: "/profile" },
];

type Priority = "emergency" | "high" | "normal";

const PRIORITY_PILL: Record<Priority, string> = {
  emergency: "bg-primary/10 text-primary",
  high: "bg-amber-600/10 text-amber-600",
  normal: "bg-secondary/10 text-secondary",
};

const MISSIONS: {
  title: string;
  desc: string;
  location: string;
  priority: Priority;
  action: "accept" | "complete";
}[] = [
  {
    title: "Medical Evac - Unit #401",
    desc: "Severe trauma, urgent transport needed",
    location: "S. Harbor District",
    priority: "emergency",
    action: "accept",
  },
  {
    title: "Food Supply - Shelters A-C",
    desc: "500 rations, non-perishables",
    location: "North Shelter Complex",
    priority: "high",
    action: "complete",
  },
  {
    title: "Water Purification Unit",
    desc: "Routine maintenance/filter swap",
    location: "Western Reservoir",
    priority: "normal",
    action: "accept",
  },
  {
    title: "Elderly Wellness Check",
    desc: "Check-in with residents of Block 12",
    location: "Downtown Residential",
    priority: "high",
    action: "complete",
  },
];

const STATS = [
  {
    icon: "assignment",
    fill: true,
    iconWrap: "bg-primary/10 text-primary",
    note: "+2 vs Yesterday",
    noteTone: "text-primary",
    label: "Assigned Missions",
    value: "04",
  },
  {
    icon: "task_alt",
    fill: false,
    iconWrap: "bg-tertiary-container/10 text-tertiary-container",
    note: "92% Target",
    noteTone: "text-tertiary-container",
    label: "Completed Tasks",
    value: "128",
  },
  {
    icon: "local_shipping",
    fill: false,
    iconWrap: "bg-on-surface-variant/10 text-on-surface-variant",
    note: "In Transit",
    noteTone: "text-on-surface-variant",
    label: "Resources Assigned",
    value: "1.2k",
    unit: "units",
  },
];

const TIMELINE = [
  {
    time: "09:42 AM",
    title: "Medical Evac Completed",
    body: "Unit #401 safely transported to General Hospital Helipad. Patient stable.",
    icon: "check",
    dot: "bg-secondary",
  },
  {
    time: "08:15 AM",
    title: "Emergency Signal Received",
    body: "New SOS from Harbor District. Search and rescue team dispatched immediately.",
    icon: "error",
    dot: "bg-primary",
  },
  {
    time: "07:30 AM",
    title: "Logistics Update",
    body: "Food rations for Northern Sector delivered. Inventory records updated.",
    icon: "local_shipping",
    dot: "bg-tertiary-container",
  },
  {
    time: "06:00 AM",
    title: "Shift Commencement",
    body: "Operator Alex Rivera clocked in for Morning Shift - Coastal Sector.",
    icon: "schedule",
    dot: "bg-surface-variant border border-outline-variant",
    muted: true,
  },
];

export default function VolunteerDashboard() {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [volunteerEntity, setVolunteerEntity] = useState<any>(null);
  const [myMissions, setMyMissions] = useState<any[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);
  const [available, setAvailable] = useState(true);

  const loadData = () => {
    // 1. Fetch user profile
    api.users.getProfile()
      .then((profile) => {
        if (profile) {
          setUserProfile(profile);
          // Fetch volunteer entity based on email
          api.volunteers.fetchAll()
            .then((volunteers) => {
              const matched = volunteers.find((v: any) => v.email === profile.email);
              if (matched) {
                setVolunteerEntity(matched);
                setAvailable(matched.status === "AVAILABLE");
              }
            })
            .catch((err) => console.log("Error fetching volunteers:", err));
        }
      })
      .catch((err) => console.log("Error fetching user profile:", err));

    // 2. Fetch assigned tasks
    api.volunteerSOS.fetchMyMissions()
      .then((data) => {
        if (data) setMyMissions(data);
      })
      .catch((err) => console.log("Error fetching my missions:", err));

    // 3. Fetch active alerts
    api.sos.fetchAllSOS("ACTIVE")
      .then((data) => {
        if (data) setActiveAlerts(data);
      })
      .catch((err) => console.log("Error fetching active alerts:", err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleDuty = async (newVal: boolean) => {
    if (!volunteerEntity) {
      alert("No volunteer profile associated with this user.");
      return;
    }
    const statusStr = newVal ? "AVAILABLE" : "UNAVAILABLE";
    try {
      await api.volunteers.updateStatus(volunteerEntity.id, statusStr);
      setAvailable(newVal);
      setVolunteerEntity((prev: any) => prev ? { ...prev, status: statusStr } : null);
    } catch (err: any) {
      alert(err.message || "Error updating duty status");
    }
  };

  const handleAcceptMission = async (id: number) => {
    try {
      await api.volunteerSOS.acceptMission(id);
      loadData();
    } catch (err: any) {
      alert(err.message || "Error accepting mission");
    }
  };

  const handleCompleteMission = async (id: number) => {
    try {
      await api.volunteerSOS.completeMission(id);
      loadData();
    } catch (err: any) {
      alert(err.message || "Error completing mission");
    }
  };

  return (
    <>
      {/* Side Navigation */}
      <aside className="fixed inset-y-0 left-0 z-50 flex flex-col w-sidebar-width bg-[#0F172A] shadow-xl text-white">
        <div className="px-6 py-8 flex flex-col gap-1">
          <h1 className="font-headline-md text-headline-md font-bold text-white">
            ResQNest
          </h1>
          <p className="text-xs text-white/50 font-label-md tracking-widest uppercase">
            Mission-Critical HQ
          </p>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-label-md text-label-md ${
                item.active
                  ? "border-l-4 border-secondary bg-white/10 text-white"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-6 py-6">
          <Link
            href="/sos"
            className="w-full py-4 bg-primary-container text-white font-bold rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined" style={FILL}>
              emergency_share
            </span>
            SOS Emergency
          </Link>
        </div>
        <div className="px-4 py-6 border-t border-white/10 space-y-2">
          <a
            className="flex items-center gap-3 px-4 py-2 text-white/60 hover:text-white transition-colors text-label-md"
            href="#"
          >
            <span className="material-symbols-outlined">help</span> Support
          </a>
          <Link
            className="flex items-center gap-3 px-4 py-2 text-white/60 hover:text-white transition-colors text-label-md"
            href="/login"
          >
            <span className="material-symbols-outlined">logout</span> Logout
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-sidebar-width h-screen pt-16">
        {/* Top App Bar */}
        <header className="fixed top-0 right-0 left-sidebar-width z-40 flex items-center justify-between px-margin-desktop h-16 bg-surface/70 backdrop-blur-md border-b border-outline-variant/30 shadow-sm">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                search
              </span>
              <input
                className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none text-body-sm font-body-sm"
                placeholder="Search missions, locations, or assets..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-on-surface-variant">
              <button className="material-symbols-outlined hover:bg-surface-container-high p-2 rounded-full transition-all">
                notifications
              </button>
              <button className="material-symbols-outlined hover:bg-surface-container-high p-2 rounded-full transition-all">
                grid_view
              </button>
            </div>
            <div className="flex items-center gap-3 pl-6 border-l border-outline-variant/30">
              <div className="text-right hidden lg:block">
                <p className="text-on-surface font-bold text-sm">{userProfile?.fullName || userProfile?.username || "Alex Rivera"}</p>
                <p className="text-on-surface-variant text-xs">Field Responder ({userProfile?.skills || "General Support"})</p>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="w-10 h-10 rounded-full border-2 border-secondary shadow-sm object-cover"
                alt="Alex Rivera, Field Responder"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQY1HbXb6NX2356a7yt0EaaNGI51zYuo2wC4jP6VJDs86-n_dI5aAane8ZwBprs1-rbJVoHv9_YinNo5WukoKo0RB4JiJt8pK0_h9bkumRvZBdM6LYEeOi72CIDQhA1lkKqVmzKPLpQsjQA8O5ujy1C-dEemILsXw5UrSz_619qVyIQsMpoSvqLlgzaOdKsg7mEy73jF9wNd-O7YKcfZAeAHb695tpX1udcOl7LZ0NlZgo49p5LI3SHB9lA-G0hVnX6ufGEyBNVFc"
              />
            </div>
          </div>
        </header>

        {/* Dashboard Canvas */}
        <div className="h-full overflow-y-auto p-margin-desktop custom-scrollbar">
          {/* Header Section */}
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-1">
                Field Operations
              </h2>
              <p className="text-on-surface-variant font-body-md">
                Zone 7 - Coastal Response Team
              </p>
            </div>
            <div className="flex gap-3">
              <button className="px-6 py-2.5 bg-white border border-outline-variant rounded-xl font-label-md text-on-surface hover:bg-surface-container transition-all flex items-center gap-2">
                <span className="material-symbols-outlined">download</span>{" "}
                Report
              </button>
              <button className="px-6 py-2.5 bg-secondary text-white rounded-xl font-label-md shadow-md hover:opacity-90 transition-all flex items-center gap-2">
                <span className="material-symbols-outlined">add</span> New
                Request
              </button>
            </div>
          </div>

          {/* Impact & Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-8">
            {/* Status Toggle Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <span className="material-symbols-outlined p-2 bg-secondary/10 text-secondary rounded-lg">
                  person_pin_circle
                </span>
                <div className="flex items-center">
                  <span
                    className={`text-xs font-bold mr-2 ${
                      available ? "text-secondary" : "text-on-surface-variant"
                    }`}
                  >
                    {available ? "AVAILABLE" : "UNAVAILABLE"}
                  </span>
                  <div className="relative inline-block w-10 h-6 align-middle select-none">
                    <input
                      checked={available}
                      onChange={(e) => handleToggleDuty(e.target.checked)}
                      className="absolute block w-4 h-4 rounded-full bg-white border-2 border-secondary appearance-none cursor-pointer top-1 left-1 checked:left-5 transition-all duration-200 z-10"
                      id="toggle"
                      name="toggle"
                      type="checkbox"
                    />
                    <label
                      className="block overflow-hidden h-6 rounded-full bg-secondary cursor-pointer"
                      htmlFor="toggle"
                    />
                  </div>
                </div>
              </div>
              <div>
                <p className="text-on-surface-variant text-label-md font-label-md">
                  Status
                </p>
                <h3 className="text-headline-md font-bold text-on-surface">
                  {available ? "Active Duty" : "Off Duty"}
                </h3>
              </div>
            </div>

            {/* Stat cards */}
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="bg-white p-6 rounded-xl shadow-sm border border-outline-variant/30"
              >
                <div className="flex justify-between items-start mb-4">
                  <span
                    className={`material-symbols-outlined p-2 rounded-lg ${stat.iconWrap}`}
                    style={stat.fill ? FILL : undefined}
                  >
                    {stat.icon}
                  </span>
                  <span className={`text-xs font-bold font-label-md ${stat.noteTone}`}>
                    {stat.note}
                  </span>
                </div>
                <div>
                  <p className="text-on-surface-variant text-label-md font-label-md">
                    {stat.label}
                  </p>
                  <h3 className="text-headline-md font-bold text-on-surface">
                    {stat.value}
                    {stat.unit && (
                      <span className="text-sm font-normal text-on-surface-variant">
                        {" "}
                        {stat.unit}
                      </span>
                    )}
                  </h3>
                </div>
              </div>
            ))}
          </div>

          {/* Main Grid Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
            {/* Active Missions Table */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden flex flex-col">
              <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center">
                <h3 className="font-headline-md text-on-surface">
                  Active Missions
                </h3>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-surface-container rounded-lg transition-all">
                    <span className="material-symbols-outlined text-on-surface-variant">
                      filter_list
                    </span>
                  </button>
                  <button className="p-2 hover:bg-surface-container rounded-lg transition-all">
                    <span className="material-symbols-outlined text-on-surface-variant">
                      more_vert
                    </span>
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-surface-container-low text-on-surface-variant text-label-md">
                    <tr>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider">
                        Victim / Request
                      </th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-center">
                        Priority
                      </th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20 font-body-sm">
                    {myMissions.map((m) => (
                      <tr key={`my-${m.id}`} className="hover:bg-surface-container-lowest transition-colors group bg-secondary/5">
                        <td className="px-6 py-5">
                          <div className="flex flex-col">
                            <span className="font-bold text-on-surface">
                              REQ-{m.id} - {m.disasterType}
                            </span>
                            <span className="text-xs text-on-surface-variant">
                              {m.description || "No description provided."}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-secondary text-lg">
                              location_on
                            </span>
                            <span>{m.location || "Unknown"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="px-3 py-1 rounded-full font-semibold text-xs uppercase tracking-[0.05em] bg-amber-600/10 text-amber-600">
                            ASSIGNED / ACTIVE
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <button
                            onClick={() => handleCompleteMission(m.id)}
                            className="px-4 py-2 border border-secondary text-secondary rounded-lg text-xs font-bold hover:bg-secondary/5 transition-all group-hover:scale-105 cursor-pointer"
                          >
                            Complete Mission
                          </button>
                        </td>
                      </tr>
                    ))}

                    {activeAlerts.map((m) => (
                      <tr key={`active-${m.id}`} className="hover:bg-surface-container-lowest transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex flex-col">
                            <span className="font-bold text-on-surface">
                              REQ-{m.id} - {m.disasterType}
                            </span>
                            <span className="text-xs text-on-surface-variant">
                              {m.description || "No description provided."}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-secondary text-lg">
                              location_on
                            </span>
                            <span>{m.location || "Unknown"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="px-3 py-1 rounded-full font-semibold text-xs uppercase tracking-[0.05em] bg-primary/10 text-primary">
                            UNASSIGNED (Severity {m.severity})
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <button
                            onClick={() => handleAcceptMission(m.id)}
                            className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-container transition-all shadow-sm group-hover:scale-105 cursor-pointer"
                          >
                            Accept Mission
                          </button>
                        </td>
                      </tr>
                    ))}

                    {myMissions.length === 0 && activeAlerts.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-10 text-center text-on-surface-variant italic">
                          No active or assigned missions found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-outline-variant/30 p-6 flex flex-col">
              <h3 className="font-headline-md text-on-surface mb-6">
                Activity Timeline
              </h3>
              <div className="flex-1 space-y-8 relative before:content-[''] before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-outline-variant/30">
                {TIMELINE.map((t) => (
                  <div key={t.time} className="relative pl-10">
                    <div
                      className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white z-10 ${t.dot}`}
                    >
                      <span
                        className={`material-symbols-outlined text-xs ${
                          t.muted ? "text-on-surface-variant" : "text-white"
                        }`}
                      >
                        {t.icon}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-on-surface-variant font-label-md">
                        {t.time}
                      </span>
                      <h4 className="font-bold text-on-surface text-body-sm mt-1">
                        {t.title}
                      </h4>
                      <p className="text-on-surface-variant text-xs mt-1 leading-relaxed">
                        {t.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-8 text-secondary font-bold text-xs hover:underline flex items-center justify-center gap-1">
                View Full History{" "}
                <span className="material-symbols-outlined text-sm">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>

          {/* Footer Stats */}
          <div className="mt-8 flex flex-col md:flex-row justify-between items-center bg-slate-900 text-white rounded-xl p-8 shadow-lg overflow-hidden relative">
            <div className="relative z-10 mb-6 md:mb-0">
              <h4 className="font-headline-md mb-2">Regional Status: Stable</h4>
              <p className="text-white/60 text-body-sm">
                All operations proceeding as planned. Next shift handover in 3h
                12m.
              </p>
            </div>
            <div className="relative z-10 flex gap-8">
              {[
                { value: "2,451", label: "Total Rescues" },
                { value: "15.2k", label: "Meals Served" },
                { value: "98%", label: "Efficiency" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-2xl font-black">{s.value}</p>
                  <p className="text-xs text-white/50 uppercase tracking-widest font-label-md">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
            {/* Abstract pattern overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <svg height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern
                    height="40"
                    id="grid"
                    patternUnits="userSpaceOnUse"
                    width="40"
                  >
                    <path
                      d="M 40 0 L 0 0 0 40"
                      fill="none"
                      stroke="white"
                      strokeWidth="1"
                    />
                  </pattern>
                </defs>
                <rect fill="url(#grid)" height="100%" width="100%" />
              </svg>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
