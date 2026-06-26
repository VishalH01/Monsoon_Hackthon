"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useRef, useState, useEffect } from "react";
import { api } from "@/api";

const FILL = { fontVariationSettings: "'FILL' 1" } as const;

// Load Leaflet map on client-side only
const LeafletMap = dynamic(() => import("@/app/components/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-surface-container animate-pulse flex items-center justify-center">
      <span className="material-symbols-outlined text-4xl animate-spin text-primary">sync</span>
    </div>
  ),
});

const SEVERITY_LEVELS = [
  "Minor Incident",
  "Stable but Urgent",
  "Serious Threat",
  "Extremely Urgent",
  "Critical / Lifethreatening",
];
const SEVERITY_COLORS = ["#0051d5", "#005e8d", "#b70011", "#dc2626", "#ba1a1a"];

const DISASTER_TYPES = [
  "Select Type...",
  "Flood",
  "Earthquake",
  "Wildfire",
  "Medical Emergency",
  "Structural Failure",
  "Severe Storm",
];

type Status = "idle" | "transmitting" | "success";

export default function SosPage() {
  const [severity, setSeverity] = useState(4);
  const [status, setStatus] = useState<Status>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [location, setLocation] = useState("");
  const [disasterType, setDisasterType] = useState("Flood");
  const [peopleAffected, setPeopleAffected] = useState(1);
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  // New priority modifiers
  const [age, setAge] = useState(30);
  const [isMedicalEmergency, setIsMedicalEmergency] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [hasChildren, setHasChildren] = useState(false);

  // Geolocation
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  // User profile & SOS history
  const [recentSOS, setRecentSOS] = useState<any[]>([]);
  const [dashboardUrl, setDashboardUrl] = useState("/");
  const [mapPoints, setMapPoints] = useState<any[]>([]);

  // Dynamic priority calculation
  const calculatedPriority = severity * 20 + 
    (isMedicalEmergency ? 30 : 0) + 
    (isDisabled ? 25 : 0) + 
    (hasChildren ? 20 : 0) + 
    (age < 12 || age > 65 ? 15 : 0);

  const fetchSOSHistory = () => {
    api.sos.fetchAllSOS()
      .then((data) => {
        if (data) {
          setRecentSOS(data.slice(0, 5));
        }
      })
      .catch((err) => console.error("Error fetching SOS history:", err));
  };

  const fetchSheltersForMap = () => {
    api.shelters.fetchAll()
      .then((shelters) => {
        if (shelters) {
          const shelterPoints = shelters
            .filter((s: any) => s.latitude && s.longitude)
            .map((s: any) => ({
              lat: s.latitude,
              lng: s.longitude,
              type: "shelter" as const,
              label: `🏠 Shelter: ${s.name} (${s.occupied}/${s.capacity} capacity)`,
            }));
          setMapPoints(shelterPoints);
        }
      })
      .catch((err) => console.error("Error fetching shelters for SOS map:", err));
  };

  useEffect(() => {
    // 1. Resolve role for dashboard navigation
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("resqnest_role");
      if (role === "VOLUNTEER") setDashboardUrl("/volunteer-dashboard");
      else if (role === "VICTIM") setDashboardUrl("/victim-dashboard");
      else if (role === "SHELTER_MANAGER") setDashboardUrl("/shelter-dashboard");
      else if (role) setDashboardUrl("/admin-dashboard");
    }

    // Auto-fill location if user is logged in
    api.users.getProfile()
      .then((profile) => {
        if (profile && profile.location) {
          setLocation(profile.location);
        }
      })
      .catch((err) => console.log("User not logged in or profile fetch failed"));

    // Attempt geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
        },
        (err) => {
          setLatitude(12.97);
          setLongitude(77.59);
        }
      );
    } else {
      setLatitude(12.97);
      setLongitude(77.59);
    }

    fetchSOSHistory();
    fetchSheltersForMap();
  }, []);

  const sevIndex = severity - 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== "idle") return;
    setStatus("transmitting");

    const formData = new FormData();
    formData.append("latitude", (latitude ?? 12.97).toString());
    formData.append("longitude", (longitude ?? 77.59).toString());
    formData.append("description", description);
    formData.append("location", location);
    formData.append("disasterType", disasterType);
    formData.append("peopleAffected", peopleAffected.toString());
    formData.append("age", age.toString());
    formData.append("severity", severity.toString());
    formData.append("hasChildren", hasChildren.toString());
    formData.append("isMedicalEmergency", isMedicalEmergency.toString());
    formData.append("isDisabled", isDisabled.toString());
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      await api.sos.submitSOS(formData);
      setStatus("success");
      setDescription("");
      setFileName(null);
      setImageFile(null);
      fetchSOSHistory();
      setTimeout(() => setStatus("idle"), 4500);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error submitting SOS");
      setStatus("idle");
    }
  };

  const scrollToForm = () =>
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });

  return (
    <>
      {/* Top Nav */}
      <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 bg-surface dark:bg-surface-dim border-b border-outline-variant dark:border-outline shadow-sm dark:shadow-none">
        <div className="flex items-center gap-4">
          <Link href={dashboardUrl} className="text-headline-md font-headline-md font-extrabold text-primary dark:text-primary-fixed-dim tracking-tight">
            ResQNest
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-stack-lg h-full">
          <Link
            className="font-label-md text-label-md text-primary dark:text-primary-fixed-dim border-b-2 border-primary dark:border-primary-fixed-dim pb-1 transition-colors duration-200"
            href="/sos"
          >
            SOS Portal
          </Link>
          <Link
            className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim transition-colors duration-200"
            href="/shelter-dashboard"
          >
            Resources
          </Link>
          <Link
            className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim transition-colors duration-200"
            href="/map"
          >
            Live Map
          </Link>
        </div>
        <div className="flex items-center gap-stack-sm">
          <button onClick={scrollToForm} className="bg-primary text-on-primary px-4 py-2 rounded font-label-md hover:brightness-110 active:scale-95 transition-all">
            Emergency Help
          </button>
          <button className="p-2 text-on-surface-variant hover:bg-surface-variant rounded-full transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <Link href="/profile" className="p-2 text-on-surface-variant hover:bg-surface-variant rounded-full transition-colors">
            <span className="material-symbols-outlined">account_circle</span>
          </Link>
        </div>
      </nav>

      <main className="pt-24 pb-stack-lg px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        {/* Hero Emergency Trigger */}
        <div className="flex flex-col items-center mb-stack-lg text-center">
          <div className="mb-stack-md relative">
            <button
              type="button"
              onClick={scrollToForm}
              className="w-32 h-32 md:w-48 md:h-48 bg-primary-container rounded-full flex flex-col items-center justify-center text-white shadow-xl animate-emergency transition-transform active:scale-90 hover:brightness-110"
            >
              <span
                className="material-symbols-outlined text-5xl! md:text-7xl! mb-2"
                style={FILL}
              >
                emergency_home
              </span>
              <span className="font-bold text-lg md:text-xl tracking-wider">
                SOS
              </span>
            </button>
          </div>
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-2">
            Initialize Emergency Protocol
          </h1>
          <p className="text-on-surface-variant max-w-2xl">
            Confirm your situation details below. Our AI Dispatcher will route
            your request to the nearest relevant authority immediately upon
            submission.
          </p>
        </div>

        {/* Main SOS Form Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-stack-lg mb-stack-lg">
          <div className="lg:col-span-8 lg:col-start-3">
            <div className="bg-surface-container-lowest p-stack-md md:p-stack-lg rounded-xl shadow-lg border border-outline-variant relative overflow-hidden">
              {/* AI Priority Badge */}
              <div className="flex justify-between items-start mb-stack-lg">
                <div>
                  <h2 className="font-headline-md text-headline-md text-on-surface">
                    Emergency Details
                  </h2>
                  <p className="text-body-sm text-on-surface-variant">
                    Fields marked with * are mission-critical
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="px-3 py-1 bg-primary text-on-primary text-xs font-bold rounded flex items-center gap-1 shadow-sm">
                    <span className="material-symbols-outlined text-sm!">
                      bolt
                    </span>
                    ESTIMATED SCORE: {calculatedPriority}
                  </span>
                  <span className="text-[10px] text-on-surface-variant mt-1 font-mono-sm uppercase tracking-widest">
                    Processing Real-time Data...
                  </span>
                </div>
              </div>

              <form ref={formRef} className="space-y-stack-md" onSubmit={handleSubmit}>
                {/* Location */}
                <div className="space-y-1">
                  <label className="font-label-md text-label-md text-on-surface-variant flex items-center gap-1">
                    Current Location *
                  </label>
                  <div className="relative group">
                    <span
                      className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-primary"
                      style={FILL}
                    >
                      location_on
                    </span>
                    <input
                      className="w-full pl-10 pr-4 py-3 bg-white border border-outline rounded focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-on-surface"
                      placeholder="Detecting automatically..."
                      required
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                    <button
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary font-label-md hover:underline"
                      type="button"
                      onClick={() => {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition((pos) => {
                            setLatitude(pos.coords.latitude);
                            setLongitude(pos.coords.longitude);
                            setLocation(`GPS: [${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}]`);
                          });
                        }
                      }}
                    >
                      GPS Detect
                    </button>
                  </div>
                </div>

                {/* Live Area Map Picker */}
                <div className="space-y-1 mt-2">
                  <label className="font-label-sm text-label-sm text-on-surface-variant block">
                    Verify location on Live Map (Click map or drag marker to set precise coordinates)
                  </label>
                  <div className="h-64 w-full rounded-lg border border-outline-variant overflow-hidden relative bg-surface-container">
                    {latitude !== null && longitude !== null && (
                      <LeafletMap
                        draggable
                        center={[latitude, longitude]}
                        onCoordinatesChange={(lat, lng) => {
                          setLatitude(lat);
                          setLongitude(lng);
                          setLocation(`GPS: [${lat.toFixed(4)}, ${lng.toFixed(4)}]`);
                        }}
                        points={mapPoints}
                      />
                    )}
                  </div>
                  <div className="text-[11px] text-on-surface-variant mt-1 flex justify-between font-mono">
                    <span>Latitude: {latitude !== null ? latitude.toFixed(6) : "Detecting..."}</span>
                    <span>Longitude: {longitude !== null ? longitude.toFixed(6) : "Detecting..."}</span>
                  </div>
                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
                  {/* Disaster Type */}
                  <div className="space-y-1">
                    <label className="font-label-md text-label-md text-on-surface-variant">
                      Disaster Type *
                    </label>
                    <div className="relative">
                      <select
                        className="w-full pl-4 pr-10 py-3 bg-white border border-outline rounded appearance-none focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-on-surface"
                        value={disasterType}
                        onChange={(e) => setDisasterType(e.target.value)}
                      >
                        {DISASTER_TYPES.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined pointer-events-none">
                        expand_more
                      </span>
                    </div>
                  </div>
                  {/* People Affected */}
                  <div className="space-y-1">
                    <label className="font-label-md text-label-md text-on-surface-variant">
                      People Affected *
                    </label>
                    <div className="flex items-center border border-outline rounded bg-white">
                      <span className="px-3 material-symbols-outlined text-on-surface-variant">
                        group
                      </span>
                      <input
                        className="w-full border-none py-3 focus:ring-0 outline-none text-on-surface"
                        min="1"
                        type="number"
                        value={peopleAffected}
                        onChange={(e) => setPeopleAffected(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>

                {/* Age & Priority Modifiers */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-stack-md pt-2">
                  <div className="space-y-1">
                    <label className="font-label-md text-label-md text-on-surface-variant">
                      Victim Age
                    </label>
                    <input
                      className="w-full px-4 py-3 bg-white border border-outline rounded focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-on-surface"
                      type="number"
                      min="0"
                      max="120"
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="medical"
                      className="w-5 h-5 rounded border-outline text-primary focus:ring-primary"
                      checked={isMedicalEmergency}
                      onChange={(e) => setIsMedicalEmergency(e.target.checked)}
                    />
                    <label htmlFor="medical" className="font-label-md text-label-md text-on-surface-variant cursor-pointer select-none">
                      Medical Alert?
                    </label>
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="disabled"
                      className="w-5 h-5 rounded border-outline text-primary focus:ring-primary"
                      checked={isDisabled}
                      onChange={(e) => setIsDisabled(e.target.checked)}
                    />
                    <label htmlFor="disabled" className="font-label-md text-label-md text-on-surface-variant cursor-pointer select-none">
                      Is Disabled?
                    </label>
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="hasChildren"
                      className="w-5 h-5 rounded border-outline text-primary focus:ring-primary"
                      checked={hasChildren}
                      onChange={(e) => setHasChildren(e.target.checked)}
                    />
                    <label htmlFor="hasChildren" className="font-label-md text-label-md text-on-surface-variant cursor-pointer select-none">
                      Has Children?
                    </label>
                  </div>
                </div>

                {/* Severity Control */}
                <div className="space-y-2">
                  <label className="font-label-md text-label-md text-on-surface-variant flex justify-between">
                    <span>Situation Severity</span>
                    <span
                      className="font-bold"
                      style={{ color: SEVERITY_COLORS[sevIndex] }}
                    >
                      {SEVERITY_LEVELS[sevIndex]}
                    </span>
                  </label>
                  <input
                    className="w-full h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
                    max="5"
                    min="1"
                    step="1"
                    type="range"
                    value={severity}
                    onChange={(e) => setSeverity(Number(e.target.value))}
                  />
                  <div className="flex justify-between text-[10px] text-on-surface-variant font-mono-sm uppercase">
                    <span>Minor</span>
                    <span>Stable</span>
                    <span>Serious</span>
                    <span>Critical</span>
                    <span>Catastrophic</span>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="font-label-md text-label-md text-on-surface-variant">
                    Description of Hazard / Special Needs
                  </label>
                  <textarea
                    className="w-full p-4 bg-white border border-outline rounded focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-on-surface"
                    placeholder="Identify trapped individuals, specific injuries, or environmental hazards..."
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {/* Upload Photo */}
                <div className="space-y-1">
                  <label className="font-label-md text-label-md text-on-surface-variant">
                    Visual Assessment (Optional)
                  </label>
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-outline-variant rounded-lg p-6 flex flex-col items-center justify-center bg-surface-container-low hover:bg-surface-container-high transition-colors cursor-pointer group"
                  >
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant group-hover:text-primary transition-colors mb-2">
                      add_a_photo
                    </span>
                    <p className="text-body-sm text-on-surface-variant font-medium">
                      {fileName ?? "Click to upload or take a photo of the scene"}
                    </p>
                    <p className="text-[10px] text-on-surface-variant/70 mt-1 uppercase tracking-tighter">
                      JPEG, PNG Max 10MB
                    </p>
                    <input
                      ref={fileRef}
                      className="hidden"
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setFileName(file ? file.name : null);
                        setImageFile(file);
                      }}
                    />
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={status !== "idle"}
                  className={`w-full text-white py-5 rounded-lg font-headline-md text-headline-md shadow-lg shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:active:scale-100 ${
                    status === "success" ? "bg-green-600" : "bg-primary-container"
                  }`}
                >
                  {status === "transmitting" && (
                    <>
                      <span className="material-symbols-outlined animate-spin">
                        progress_activity
                      </span>
                      Transmitting...
                    </>
                  )}
                  {status === "success" && (
                    <>
                      <span className="material-symbols-outlined">
                        check_circle
                      </span>
                      SOS Dispatched Successfully
                    </>
                  )}
                  {status === "idle" && (
                    <>
                      <span className="material-symbols-outlined text-3xl!" style={FILL}>
                        send
                      </span>
                      Submit SOS
                    </>
                  )}
                </button>

                {status === "success" && (
                  <p className="text-body-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                    Emergency signal transmitted. Stay where you are —
                    responders have been notified of your location and
                    situation.
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Below Form Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-stack-lg">
          {/* Recent SOS & Timeline */}
          <div className="lg:col-span-8 flex flex-col gap-stack-lg">
            <section className="bg-white border border-outline-variant rounded-xl p-stack-md shadow-sm">
              <h3 className="font-headline-md text-headline-md mb-stack-md flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  history
                </span>
                Your Recent SOS Requests
              </h3>
              <div className="space-y-stack-sm">
                {recentSOS.length === 0 ? (
                  <p className="text-body-sm text-on-surface-variant italic">No recent SOS signals found from this device.</p>
                ) : (
                  recentSOS.map((req) => (
                    <div key={req.id} className="border-l-4 border-primary bg-surface-container-low p-4 rounded-r-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-on-surface">
                            REQ-{req.id} - {req.disasterType}
                          </span>
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                            req.status === "RESOLVED" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}>
                            {req.status}
                          </span>
                        </div>
                        <p className="text-body-sm text-on-surface-variant">
                          Location: {req.location || "Unknown"} • Severity Level: {req.severity} • Score: {req.priorityScore}
                        </p>
                        {req.description && (
                          <p className="text-xs text-on-surface-variant/80 italic mt-1">
                            &quot;{req.description}&quot;
                          </p>
                        )}
                      </div>
                      <div className="text-xs font-mono text-outline">
                        {req.createdAt ? new Date(req.createdAt).toLocaleTimeString() : "Recent"}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Status Timeline */}
            <section className="bg-white border border-outline-variant rounded-xl p-stack-md shadow-sm">
              <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mb-stack-md">
                Live Status Timeline - REQ-8902
              </h3>
              <div className="relative space-y-6 pl-8">
                <div className="absolute left-[11px] top-1 bottom-1 w-[2px] bg-outline-variant" />
                <div className="relative">
                  <div className="absolute -left-[27px] top-1 w-[14px] h-[14px] rounded-full bg-primary shadow-sm ring-4 ring-white" />
                  <p className="font-bold text-on-surface text-sm">
                    Units Dispatched
                  </p>
                  <p className="text-body-sm text-on-surface-variant">
                    Unit Medic-4 is en route. ETA 4 mins.
                  </p>
                  <p className="text-[10px] text-on-surface-variant font-mono-sm mt-1">
                    10:42 AM
                  </p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[27px] top-1 w-[14px] h-[14px] rounded-full bg-primary shadow-sm ring-4 ring-white" />
                  <p className="font-bold text-on-surface text-sm">
                    Priority Elevated
                  </p>
                  <p className="text-body-sm text-on-surface-variant">
                    AI Analysis confirmed structural risks.
                  </p>
                  <p className="text-[10px] text-on-surface-variant font-mono-sm mt-1">
                    10:35 AM
                  </p>
                </div>
                <div className="relative opacity-50">
                  <div className="absolute -left-[27px] top-1 w-[14px] h-[14px] rounded-full bg-outline shadow-sm ring-4 ring-white" />
                  <p className="font-bold text-on-surface text-sm">
                    SOS Signal Received
                  </p>
                  <p className="text-[10px] text-on-surface-variant font-mono-sm mt-1">
                    10:31 AM
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Command Contacts */}
          <div className="lg:col-span-4 flex flex-col gap-stack-md">
            <h3 className="font-headline-md text-headline-md">
              Command Contacts
            </h3>
            {[
              {
                icon: "hub",
                title: "Central Command",
                sub: "Global Operations",
                cta: "1-800-RESQ-NEST",
                tone: "text-primary",
                bg: "bg-primary/10",
                hover: "hover:bg-primary hover:text-white",
              },
              {
                icon: "medical_services",
                title: "Medical Dispatch",
                sub: "Trauma & EMS",
                cta: "9-1-1 MEDICAL",
                tone: "text-secondary",
                bg: "bg-secondary/10",
                hover: "hover:bg-secondary hover:text-white",
              },
              {
                icon: "fire_truck",
                title: "Local Fire Dept",
                sub: "Rescue & HAZMAT",
                cta: "LOCAL-DISPATCH",
                tone: "text-tertiary",
                bg: "bg-tertiary/10",
                hover: "hover:bg-tertiary hover:text-white",
              },
            ].map((c) => (
              <div
                key={c.title}
                className="bg-white border border-outline-variant p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${c.bg} ${c.tone}`}>
                    <span className="material-symbols-outlined" style={FILL}>
                      {c.icon}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-on-surface">{c.title}</p>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">
                      {c.sub}
                    </p>
                  </div>
                </div>
                <button
                  className={`w-full py-2 bg-surface-container-high font-bold rounded transition-all flex items-center justify-center gap-2 ${c.tone} ${c.hover}`}
                >
                  <span className="material-symbols-outlined text-sm!">call</span>
                  {c.cta}
                </button>
              </div>
            ))}

            {/* Glassmorphism Banner */}
            <div className="glass-effect mt-stack-md p-stack-md rounded-xl border border-white border-opacity-50 text-center relative overflow-hidden">
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/10 rounded-full blur-2xl" />
              <span className="material-symbols-outlined text-primary mb-2">
                shield
              </span>
              <p className="text-body-sm font-bold text-on-surface mb-1">
                Encrypted Connection
              </p>
              <p className="text-[10px] text-on-surface-variant">
                Your location and data are secured with mission-grade 256-bit
                encryption during transit.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-stack-lg px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-stack-md bg-surface-container-highest dark:bg-inverse-surface border-t border-outline-variant dark:border-outline">
        <div className="flex flex-col items-center md:items-start">
          <span className="font-headline-md text-headline-md font-bold text-on-surface dark:text-on-secondary-container">
            ResQNest
          </span>
          <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-surface-variant">
            © 2024 ResQNest Mission-Critical Systems. All rights reserved.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-stack-md">
          {[
            "Privacy Policy",
            "Terms of Service",
            "Contact Support",
            "Emergency Protocol",
          ].map((item) => (
            <a
              key={item}
              className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim underline transition-all"
              href="#"
            >
              {item}
            </a>
          ))}
        </div>
      </footer>
    </>
  );
}
