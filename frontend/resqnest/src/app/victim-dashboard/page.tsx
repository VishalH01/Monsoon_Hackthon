"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { api } from "@/api";

const FILL = { fontVariationSettings: "'FILL' 1" } as const;

const LeafletMap = dynamic(() => import("@/app/components/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-surface-container animate-pulse" />
  ),
});

const NAV_ITEMS = [
  { icon: "dashboard", label: "Dashboard", href: "/victim-dashboard", active: true },
  { icon: "emergency", label: "SOS", href: "/sos" },
  { icon: "home_pin", label: "Shelters", href: "/shelter-dashboard" },
  { icon: "map", label: "Map", href: "/map" },
  { icon: "person_search", label: "Missing Persons", href: "/missing-persons" },
  { icon: "volunteer_activism", label: "Donations", href: "/donations" },
  { icon: "person", label: "Settings", href: "/profile" },
];

export default function VictimDashboard() {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [safetyStatus, setSafetyStatus] = useState("SAFE");
  const [nearbyShelters, setNearbyShelters] = useState<any[]>([]);
  const [recentSOS, setRecentSOS] = useState<any[]>([]);
  const [latitude, setLatitude] = useState(12.97);
  const [longitude, setLongitude] = useState(77.59);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [mapPoints, setMapPoints] = useState<any[]>([]);

  const fetchMapPoints = async () => {
    const allPoints: any[] = [];
    
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
              label: `🚨 EMERGENCY: ${s.message || s.description || "Active Alert"} (Urgency: ${s.priorityScore || 0})`,
            });
          }
        });
      }
    } catch (e) {
      console.error("SOS Fetch failed for victim map", e);
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
              label: `🏠 Shelter: ${s.name} (${s.occupied}/${s.capacity} capacity)`,
            });
          }
        });
      }
    } catch (e) {
      console.error("Shelter Fetch failed for victim map", e);
    }

    // 3. Fetch Volunteers
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
          });
        });
      }
    } catch (e) {
      console.error("Volunteer Fetch failed for victim map", e);
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
              label: `🔍 Missing Case: ${m.fullName}`,
            });
          }
        });
      }
    } catch (e) {
      console.error("Missing Persons Fetch failed for victim map", e);
    }

    setMapPoints(allPoints);
  };

  useEffect(() => {
    // 1. Get profile & status
    api.users.getProfile()
      .then((data) => {
        if (data) {
          setUserProfile(data);
          setSafetyStatus(data.safetyStatus || "SAFE");
        }
      })
      .catch((err) => console.log("Profile fetch failed:", err));

    // 2. Geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
          fetchShelters(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          fetchShelters(12.97, 77.59);
        }
      );
    } else {
      fetchShelters(12.97, 77.59);
    }

    // 3. Recent SOS
    api.sos.fetchAllSOS()
      .then((data) => {
        if (data) {
          setRecentSOS(data.slice(0, 5));
        }
      })
      .catch((err) => console.log(err));

    fetchMapPoints();
  }, []);

  const fetchShelters = (lat: number, lng: number) => {
    api.shelters.fetchNearby(lat, lng)
      .then((data) => {
        if (data) setNearbyShelters(data.slice(0, 3));
      })
      .catch((err) => console.log("Error fetching nearby shelters:", err));
  };

  const handleCheckIn = async (status: string) => {
    try {
      await api.users.checkIn(status);
      setSafetyStatus(status);
      setShowCheckInModal(false);
    } catch (err: any) {
      alert(err.message || "Error updating check-in status");
    }
  };
  return (
    <>
      {/* Side Navigation */}
      <aside className="fixed left-0 top-0 h-full w-sidebar-width bg-inverse-surface border-r border-outline-variant shadow-md flex flex-col py-stack-lg z-50">
        <div className="px-6 mb-10">
          <h1 className="font-display-lg text-headline-md font-extrabold text-primary-container tracking-tight">
            ResQNest
          </h1>
          <p className="text-surface-variant font-body-sm opacity-70">
            Operator ID: 8824
          </p>
        </div>
        <nav className="flex-1 px-2 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={
                item.active
                  ? "flex items-center gap-stack-md px-4 py-3 bg-secondary-container text-on-secondary-container border-l-4 border-secondary rounded-r-lg active:scale-95 transition-all"
                  : "flex items-center gap-stack-md px-4 py-3 text-surface-variant hover:text-surface hover:bg-white/10 active:scale-95 transition-all"
              }
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-body-md">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="px-4 mt-auto space-y-2">
          <Link
            href="/sos"
            className="w-full bg-primary-container text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-primary transition-colors"
          >
            <span className="material-symbols-outlined">emergency</span>
            EMERGENCY SOS
          </Link>
          <div className="pt-4 border-t border-white/10">
            <a
              className="flex items-center gap-stack-md px-4 py-2 text-surface-variant hover:text-surface"
              href="#"
            >
              <span className="material-symbols-outlined">help</span>
              <span className="font-body-sm">Support</span>
            </a>
            <Link
              className="flex items-center gap-stack-md px-4 py-2 text-error hover:text-error-container"
              href="/login"
            >
              <span className="material-symbols-outlined">logout</span>
              <span className="font-body-sm">Logout</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Top App Bar */}
      <header className="flex justify-between items-center px-margin-desktop h-16 sticky top-0 z-40 ml-sidebar-width w-[calc(100%-var(--spacing-sidebar-width))] bg-surface/70 backdrop-blur-xl border-b border-outline-variant shadow-sm">
        <div className="flex items-center gap-8">
          <h2 className="font-display-lg text-headline-md font-black text-primary">
            ResQNest Dashboard
          </h2>
          <div className="relative hidden lg:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
              search
            </span>
            <input
              className="pl-10 pr-4 py-2 bg-surface-container border-none rounded-full focus:ring-2 focus:ring-primary text-body-sm w-64"
              placeholder="Search aid, shelters..."
              type="text"
            />
          </div>
        </div>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex gap-6">
            <a
              className="text-primary font-bold border-b-2 border-primary pb-1 font-body-md"
              href="#"
            >
              Alerts
            </a>
            <a
              className="text-on-surface-variant font-medium hover:text-primary transition-colors font-body-md"
              href="#"
            >
              Protocol
            </a>
          </nav>
          <button
            onClick={() => setShowCheckInModal(true)}
            className="bg-secondary text-white px-4 py-1.5 rounded-full font-bold text-body-sm active:opacity-80 transition-opacity cursor-pointer"
          >
            Check-In
          </button>
          <div className="flex items-center gap-3">
            <button className="material-symbols-outlined p-2 text-on-surface-variant hover:text-primary transition-colors">
              notifications
            </button>
            <button className="material-symbols-outlined p-2 text-on-surface-variant hover:text-primary transition-colors">
              dark_mode
            </button>
            <div className="h-8 w-8 rounded-full bg-outline-variant overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="w-full h-full object-cover"
                alt="Operator avatar"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSFHDNqsatlVPXB0imyzrwDVgz2AV126QXHf_mvsYmPJQgaCHGSvDc4k7Rj1F2bJ1jJPmbRAAqr1e11xOY0IDiAG0aMWlpPjn0No9KcoK3Yh-WzTnKSBJj9Uypv1v7PLK6oc9NBTx6xxTJYNBWlofLOalzo9k3wHTHt4BA7VeyqUZtriU7PeQixkdPaipJjxe7NCsY6gQOVSAOsZN6CeqwruADq1dD2HeUGi6KgGSciPshpb96Zux36UQWXLbtqg9SshnJsRwIABk"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="ml-sidebar-width p-margin-desktop min-h-[calc(100vh-64px)]">
        {/* Live Ticker / Relief Updates */}
        <div className="mb-stack-lg bg-secondary-fixed/30 border border-secondary/20 rounded-xl p-4 flex items-center gap-4 overflow-hidden relative">
          <div className="flex items-center gap-2 text-secondary font-bold whitespace-nowrap">
            <span className="material-symbols-outlined">campaign</span>
            <span className="font-label-md">LIVE UPDATES:</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="font-body-md text-on-secondary-fixed animate-pulse">
              Water distribution point #4 is now active at Central Plaza.
              Medical teams dispatched to Sector 7.
              <span className="mx-8">|</span>
              Flood warnings downgraded in North Creek area.
              <span className="mx-8">|</span>
              Next supply drop scheduled for 14:00.
            </p>
          </div>
        </div>

        {/* Bento Grid Content */}
        <div className="bento-grid">
          {/* Safety Status Card */}
          <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl p-6 shadow-sm border border-outline-variant flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <h3 className="font-headline-md text-on-surface">
                Your Safety Status
              </h3>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                safetyStatus === "SAFE" ? "bg-green-100 text-green-700" :
                safetyStatus === "AFFECTED" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
              }`}>
                {safetyStatus}
              </span>
            </div>
            <div className="mt-6 flex flex-col items-center py-4">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 ${
                safetyStatus === "SAFE" ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"
              }`}>
                <span
                  className={`material-symbols-outlined text-5xl! ${
                    safetyStatus === "SAFE" ? "text-green-600" : "text-red-600"
                  }`}
                  style={FILL}
                >
                  {safetyStatus === "SAFE" ? "check_circle" : "warning"}
                </span>
              </div>
              <p className="mt-4 font-headline-lg">{safetyStatus === "SAFE" ? "Safe" : "Needs Help"}</p>
              <p className="text-on-surface-variant text-body-sm text-center">
                User: {userProfile?.fullName || userProfile?.username || "Guest"}
              </p>
            </div>
            <button
              onClick={() => setShowCheckInModal(true)}
              className="mt-4 w-full border border-outline py-2.5 rounded-lg font-bold text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
            >
              Update Status
            </button>
          </div>

          {/* Assigned Responder */}
          <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl p-6 shadow-sm border border-outline-variant">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-primary">
                volunteer_activism
              </span>
              <h3 className="font-headline-md text-on-surface">
                Assigned Responder
              </h3>
            </div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-surface-container">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="w-full h-full object-cover"
                  alt="Sarah Jenkins, Lead Coordinator"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdxg7lbff9s4K0aMee49iSq6P8ixyXxlKEaUDlK_y8bXf2Uwpek4hjq-OokNWPDIE2qOewUA9G5EruVXgaPFkHNtT1zG8-fRM6mwBwqwQRdeolC2n7V7HrXgLrqvScbo9QtJm4utn0hybzmYyb-6X2nrgGu6xsu8G5_G-jGys06ylBeqzFEY284evhGghN8owPcKYjV3el5LxKnGXNVgEcQ5kh18E9UXQBoqPxxZ7Wj8yjjNsl7eO0q1cufW2ygKdUGRGM9MPqGCM"
                />
              </div>
              <div>
                <p className="font-bold text-body-lg">Sarah Jenkins</p>
                <p className="text-on-surface-variant text-body-sm">
                  Lead Coordinator
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-xs text-on-surface-variant">
                    Active Now
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-surface-container rounded-xl p-4 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-on-surface-variant uppercase">
                  ETA
                </p>
                <p className="text-headline-md text-primary font-black">
                  18 MINS
                </p>
              </div>
              <button className="bg-primary text-white p-3 rounded-full hover:shadow-lg transition-shadow">
                <span className="material-symbols-outlined">call</span>
              </button>
            </div>
          </div>

          {/* Nearby Shelters */}
          <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl p-6 shadow-sm border border-outline-variant">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-headline-md text-on-surface">
                Nearby Shelters
              </h3>
              <Link className="text-primary font-bold text-body-sm hover:underline" href="/shelter-dashboard">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {nearbyShelters.length === 0 ? (
                <p className="text-body-sm text-on-surface-variant italic">No shelters found nearby.</p>
              ) : (
                nearbyShelters.map((s) => {
                  const pct = Math.round((s.occupied / s.capacity) * 100) || 0;
                  return (
                    <div key={s.id} className="flex items-center justify-between p-3 border border-outline-variant rounded-xl hover:bg-surface-bright transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-secondary-fixed rounded-lg flex items-center justify-center text-secondary">
                          <span className="material-symbols-outlined">home</span>
                        </div>
                        <div>
                          <p className="font-bold text-body-md">{s.name}</p>
                          <p className="text-xs text-on-surface-variant">
                            Location: {s.location || "Nearby"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-on-surface-variant">
                          CAPACITY
                        </p>
                        <p className={`text-body-sm font-bold ${pct > 80 ? "text-orange-600" : "text-green-600"}`}>
                          {pct}% Full ({s.occupied}/{s.capacity})
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Map Preview */}
          <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl p-2 shadow-sm border border-outline-variant min-h-[400px] flex flex-col">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant">
                  map
                </span>
                <h3 className="font-headline-md text-on-surface">
                  Live Area Map
                </h3>
              </div>
              <div className="flex gap-2">
                <span className="bg-error-container text-error px-3 py-1 rounded-full text-xs font-bold">
                  FLOOD ZONE ACTIVE
                </span>
                <span className="bg-surface-container text-on-surface-variant px-3 py-1 rounded-full text-xs font-bold">
                  GPS: STABLE
                </span>
              </div>
            </div>
            <div className="flex-1 rounded-xl overflow-hidden relative min-h-[300px]">
              <LeafletMap activeLayer="All Layers" points={mapPoints} center={[latitude, longitude]} />
            </div>
          </div>

          {/* Recent Requests Timeline */}
          <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl p-6 shadow-sm border border-outline-variant">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-headline-md text-on-surface">
                Recent Requests
              </h3>
              <Link className="text-secondary font-bold text-body-sm hover:underline" href="/sos">
                New Request
              </Link>
            </div>
            <div className="relative space-y-8 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-outline-variant">
              {recentSOS.length === 0 ? (
                <p className="text-body-sm text-on-surface-variant italic pl-6">No emergency requests registered.</p>
              ) : (
                recentSOS.map((req) => (
                  <div key={req.id} className="relative pl-12">
                    <div className="absolute left-0 top-1 w-10 h-10 bg-white border-2 border-primary rounded-full flex items-center justify-center z-10">
                      <span className="material-symbols-outlined text-primary text-xl">
                        emergency
                      </span>
                    </div>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-body-md">{req.disasterType} Alert</p>
                        <p className="text-xs text-on-surface-variant">
                          Requested: {req.createdAt ? new Date(req.createdAt).toLocaleTimeString() : "Recent"}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        req.status === "RESOLVED" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    <p className="mt-1 text-body-sm text-on-surface-variant italic">
                      Ref #REQ-{req.id} • Priority Score: {req.priorityScore}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="col-span-12 bg-white rounded-2xl p-6 shadow-sm border border-outline-variant">
            <h3 className="font-headline-md text-on-surface mb-6">
              Quick-Dial Contacts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center p-4 bg-error-container/20 border border-error/10 rounded-xl">
                <div className="w-12 h-12 bg-primary-container rounded-lg flex items-center justify-center text-white mr-4">
                  <span className="material-symbols-outlined">local_police</span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-body-md">Emergency Services</p>
                  <p className="text-headline-md font-black text-primary">911</p>
                </div>
              </div>
              {[
                {
                  icon: "family_restroom",
                  title: "Family Group",
                  sub: "3 Contacts Listed",
                },
                {
                  icon: "medical_information",
                  title: "City Hospital",
                  sub: "+1 (555) 092-3321",
                },
                {
                  icon: "corporate_fare",
                  title: "Relief HQ",
                  sub: "+1 (555) 900-4411",
                },
              ].map((c) => (
                <div
                  key={c.title}
                  className="flex items-center p-4 bg-surface-container rounded-xl"
                >
                  <div className="w-12 h-12 bg-on-surface-variant rounded-lg flex items-center justify-center text-white mr-4">
                    <span className="material-symbols-outlined">{c.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-body-md">{c.title}</p>
                    <p className="text-body-sm text-on-surface-variant">
                      {c.sub}
                    </p>
                  </div>
                  <button className="material-symbols-outlined text-on-surface-variant">
                    call
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Floating SOS Button */}
      <Link
        href="/sos"
        className="fixed bottom-margin-desktop right-margin-desktop w-20 h-20 bg-primary-container text-white rounded-full flex flex-col items-center justify-center shadow-2xl z-[60] sos-pulse-effect hover:scale-105 active:scale-95 transition-all group"
      >
        <span className="material-symbols-outlined text-3xl!" style={FILL}>
          emergency
        </span>
        <span className="text-[10px] font-black uppercase mt-1">
          One-Click SOS
        </span>
        <span className="absolute -top-12 right-0 bg-inverse-surface text-white text-[10px] py-1 px-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Tap to open SOS
        </span>
      </Link>

      {/* Check-In Modal */}
      {showCheckInModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-outline-variant shadow-xl">
            <h3 className="font-headline-md text-headline-md mb-2">Check-in Your Status</h3>
            <p className="text-body-sm text-on-surface-variant mb-6">Choose your current physical/safety status to alert HQ.</p>
            <div className="flex flex-col gap-2">
              {[
                { status: "SAFE", label: "Safe and Uninjured", color: "bg-green-600 text-white" },
                { status: "AFFECTED", label: "Affected (Need resources)", color: "bg-amber-600 text-white" },
                { status: "IN_DANGER", label: "In Danger (Urgent Rescue)", color: "bg-red-600 text-white" },
                { status: "EVACUATED", label: "Evacuated to Shelter", color: "bg-blue-600 text-white" },
              ].map((opt) => (
                <button
                  key={opt.status}
                  onClick={() => handleCheckIn(opt.status)}
                  className={`w-full py-3 rounded-lg font-label-md hover:brightness-95 active:scale-98 transition-all cursor-pointer ${opt.color}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowCheckInModal(false)}
              className="mt-4 w-full py-2 border border-outline rounded-lg text-sm font-semibold hover:bg-surface-container transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
