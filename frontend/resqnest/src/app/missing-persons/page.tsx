"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/api";

const FILL = { fontVariationSettings: "'FILL' 1" } as const;

const NAV_ITEMS = [
  { icon: "dashboard", label: "Dashboard", href: "/admin-dashboard" },
  { icon: "map", label: "Map", href: "/map" },
  { icon: "emergency", label: "SOS", href: "/sos" },
  { icon: "home_work", label: "Shelters", href: "/shelter-dashboard" },
  { icon: "inventory_2", label: "Inventory", href: "/inventory" },
  { icon: "person_search", label: "Missing Persons", href: "/missing-persons", active: true },
  { icon: "volunteer_activism", label: "Donations", href: "/donations" },
  { icon: "account_circle", label: "Profile", href: "/profile" },
];

export default function MissingPersonsPage() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, MISSING, FOUND, REUNITED

  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState<number>(30);
  const [gender, setGender] = useState("Male");
  const [lastSeenLocation, setLastSeenLocation] = useState("");
  const [latitude, setLatitude] = useState<number>(12.97);
  const [longitude, setLongitude] = useState<number>(77.59);
  const [description, setDescription] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const data = await api.missingPersons.fetchAll();
      setCases(data || []);
    } catch (err) {
      console.error("Error loading missing persons:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReportPerson = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        fullName,
        age: Number(age),
        gender,
        lastSeenLocation,
        latitude: Number(latitude),
        longitude: Number(longitude),
        description,
        contactName,
        contactPhone,
        status: "MISSING",
        photoUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDtuMBybdQ_F5MF2e21YOYADlwnElwPayNo3eM1W7HgbS5vZF18lntaVxRQ8lYCSP8xWQWQub1LPEH2zi-t-ZC-dDmTmUj2miBthNNSBG-4Iv0CWwtLQ_GdEkmeh-bXRa3A6Mvqe-B2yWCXYtjiRtH5TlQdt-T5lVqJaaBgd230LU2gxolPJv5N5fPHCvzKgR2lM4s87ekK2ux5hv_ZK9fp_4S2TyGmUW_eA8qmKtCUKUssMogl73Y6ZjIBXbj5IDgXyxKSjv94MQA",
      };
      await api.missingPersons.create(payload);
      setModalOpen(false);
      fetchCases();
      // Reset form
      setFullName("");
      setAge(30);
      setGender("Male");
      setLastSeenLocation("");
      setDescription("");
      setContactName("");
      setContactPhone("");
    } catch (err: any) {
      alert("Error reporting missing person: " + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await api.missingPersons.updateStatus(id, status);
      fetchCases();
    } catch (err: any) {
      alert("Error updating status: " + (err.message || err));
    }
  };

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      c.lastSeenLocation?.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate dynamic stats
  const totalReported = cases.length;
  const missingCount = cases.filter((c) => c.status === "MISSING").length;
  const foundCount = cases.filter((c) => c.status === "FOUND" || c.status === "REUNITED").length;
  const pendingCount = cases.filter((c) => !c.status).length;

  return (
    <>
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-sidebar-width bg-inverse-surface shadow-lg flex flex-col py-stack-lg border-r border-outline-variant/10 z-[60] hidden md:flex">
        <div className="px-6 mb-10">
          <h1 className="font-headline-lg text-headline-lg font-black text-on-primary">
            ResQNest
          </h1>
          <p className="font-label-md text-label-md text-secondary-fixed/60 mt-1 uppercase tracking-widest">
            Mission Operations
          </p>
        </div>
        <nav className="flex-1 px-3 space-y-1">
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

      {/* Main Wrapper */}
      <div className="md:ml-sidebar-width min-h-screen flex flex-col relative">
        {/* Top Navigation */}
        <header className="flex justify-between items-center w-full px-margin-desktop h-16 sticky top-0 z-50 bg-surface shadow-sm border-b border-outline-variant">
          <div className="flex items-center gap-4">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant">
                search
              </span>
              <input
                className="pl-10 pr-4 py-2 bg-surface-container rounded-full border-none focus:ring-2 focus:ring-primary w-64 text-sm"
                placeholder="Search missing databases..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-surface-container-high transition-colors rounded-full relative cursor-pointer">
              <span className="material-symbols-outlined text-on-surface-variant">
                notifications
              </span>
            </button>
            <div className="flex items-center gap-2 ml-2 cursor-pointer active:scale-95 transition-transform">
              <span className="material-symbols-outlined text-primary text-headline-md">
                account_circle
              </span>
              <span className="hidden lg:block font-body-md font-bold text-primary">
                Operator Terminal
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-margin-desktop space-y-stack-lg max-w-container-max mx-auto w-full">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface">
                Missing Persons Database
              </h2>
              <p className="text-on-surface-variant font-body-md mt-1">
                Real-time surveillance and case tracking for active disaster relief sectors.
              </p>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="bg-primary-container text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95 text-body-sm"
            >
              <span className="material-symbols-outlined" style={FILL}>
                add_circle
              </span>
              REPORT MISSING PERSON
            </button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-outline-variant/30 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-surface-container-highest text-primary">
                <span className="material-symbols-outlined text-3xl">groups</span>
              </div>
              <div>
                <p className="text-on-surface-variant text-label-md font-semibold uppercase tracking-wider">
                  Total Reported
                </p>
                <h3 className="text-headline-md font-bold text-on-surface">
                  {totalReported}
                </h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-outline-variant/30 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary-container/10 text-primary">
                <span className="material-symbols-outlined text-3xl">person_search</span>
              </div>
              <div>
                <p className="text-on-surface-variant text-label-md font-semibold uppercase tracking-wider">
                  Currently Missing
                </p>
                <h3 className="text-headline-md font-bold text-primary">
                  {missingCount}
                </h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-outline-variant/30 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-secondary-container/10 text-secondary">
                <span className="material-symbols-outlined text-3xl">check_circle</span>
              </div>
              <div>
                <p className="text-on-surface-variant text-label-md font-semibold uppercase tracking-wider">
                  Found &amp; Safe
                </p>
                <h3 className="text-headline-md font-bold text-secondary">
                  {foundCount}
                </h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-outline-variant/30 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-tertiary-container/10 text-tertiary">
                <span className="material-symbols-outlined text-3xl">clinical_notes</span>
              </div>
              <div>
                <p className="text-on-surface-variant text-label-md font-semibold uppercase tracking-wider">
                  Pending Status
                </p>
                <h3 className="text-headline-md font-bold text-tertiary">
                  {pendingCount}
                </h3>
              </div>
            </div>
          </div>

          <div className="flex flex-col xl:flex-row gap-gutter">
            {/* Main grid + search */}
            <div className="flex-1 space-y-gutter">
              {/* Filter Bar */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-outline-variant/30 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">
                    search
                  </span>
                  <input
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    placeholder="Search by name, ID, or last known location..."
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                  <button
                    onClick={() => setStatusFilter("ALL")}
                    className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold shadow-sm ${
                      statusFilter === "ALL" ? "bg-primary text-white" : "bg-surface-container text-on-surface-variant"
                    }`}
                  >
                    All Cases
                  </button>
                  <button
                    onClick={() => setStatusFilter("MISSING")}
                    className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold shadow-sm ${
                      statusFilter === "MISSING" ? "bg-primary text-white" : "bg-surface-container text-on-surface-variant"
                    }`}
                  >
                    Missing
                  </button>
                  <button
                    onClick={() => setStatusFilter("FOUND")}
                    className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold shadow-sm ${
                      statusFilter === "FOUND" ? "bg-primary text-white" : "bg-surface-container text-on-surface-variant"
                    }`}
                  >
                    Found
                  </button>
                  <button
                    onClick={() => setStatusFilter("REUNITED")}
                    className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold shadow-sm ${
                      statusFilter === "REUNITED" ? "bg-primary text-white" : "bg-surface-container text-on-surface-variant"
                    }`}
                  >
                    Reunited
                  </button>
                </div>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                  <div className="col-span-full text-center py-12 text-on-surface-variant">
                    <span className="material-symbols-outlined animate-spin align-middle mr-2">
                      sync
                    </span>
                    Syncing missing reports ledger...
                  </div>
                ) : filteredCases.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-on-surface-variant italic">
                    No matching cases found in database.
                  </div>
                ) : (
                  filteredCases.map((c) => {
                    const isMissing = c.status === "MISSING";
                    return (
                      <div
                        key={c.id}
                        className="bg-white rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                      >
                        <div className="relative h-48 bg-slate-100 flex items-center justify-center overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            className="w-full h-full object-cover"
                            alt={`${c.fullName}, age ${c.age}`}
                            src={c.photoUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuDtuMBybdQ_F5MF2e21YOYADlwnElwPayNo3eM1W7HgbS5vZF18lntaVxRQ8lYCSP8xWQWQub1LPEH2zi-t-ZC-dDmTmUj2miBthNNSBG-4Iv0CWwtLQ_GdEkmeh-bXRa3A6Mvqe-B2yWCXYtjiRtH5TlQdt-T5lVqJaaBgd230LU2gxolPJv5N5fPHCvzKgR2lM4s87ekK2ux5hv_ZK9fp_4S2TyGmUW_eA8qmKtCUKUssMogl73Y6ZjIBXbj5IDgXyxKSjv94MQA"}
                          />
                          <div className="absolute top-3 right-3">
                            <span
                              className={`${
                                isMissing ? "bg-primary" : "bg-secondary"
                              } text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-md`}
                            >
                              {c.status || "REPORTED"}
                            </span>
                          </div>
                        </div>
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-headline-md text-headline-md text-on-surface">
                              {c.fullName}
                            </h4>
                            <span className="text-on-surface-variant font-bold text-label-md">
                              Age: {c.age} ({c.gender})
                            </span>
                          </div>
                          <p className="text-body-sm text-on-surface-variant mb-4 italic">
                            &quot;{c.description}&quot;
                          </p>
                          <div className="space-y-2 border-t border-outline-variant/20 pt-4">
                            <div className="flex items-center gap-2 text-on-surface-variant text-body-sm">
                              <span className="material-symbols-outlined text-sm">
                                location_on
                              </span>
                              Last seen: {c.lastSeenLocation}
                            </div>
                            <div className="flex items-center gap-2 text-on-surface-variant text-body-sm">
                              <span className="material-symbols-outlined text-sm">
                                call
                              </span>
                              Contact: {c.contactName} ({c.contactPhone})
                            </div>
                          </div>
                          <div className="mt-5 pt-4 border-t border-outline-variant/30 flex gap-2">
                            {isMissing ? (
                              <button
                                onClick={() => handleUpdateStatus(c.id, "FOUND")}
                                className="flex-1 py-2 bg-secondary text-white font-bold rounded text-sm hover:brightness-115 transition-all text-center"
                              >
                                Mark Found
                              </button>
                            ) : c.status === "FOUND" ? (
                              <button
                                onClick={() => handleUpdateStatus(c.id, "REUNITED")}
                                className="flex-1 py-2 bg-green-600 text-white font-bold rounded text-sm hover:bg-green-700 transition-all text-center"
                              >
                                Reunited with Family
                              </button>
                            ) : (
                              <span className="flex-1 py-2 text-center text-green-700 font-bold text-sm bg-green-50 rounded">
                                Safe &amp; Reunited
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Report Person Modal */}
      {modalOpen && (
        <div
          onClick={() => setModalOpen(false)}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 transition-opacity duration-300 opacity-100"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-container-lowest w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden transition-transform duration-300 scale-100"
          >
            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface">
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface">
                  Report Missing Person
                </h3>
                <p className="text-body-sm text-on-surface-variant">
                  Register details to assist first responders and shelter networks in tracking
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant/20"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleReportPerson}>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-stack-lg">
                <div className="space-y-4">
                  <div>
                    <label className="block font-label-md text-on-surface mb-2">
                      Full Legal Name
                    </label>
                    <input
                      className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-bright focus:border-secondary outline-none text-body-md"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-label-md text-on-surface mb-2">
                        Age
                      </label>
                      <input
                        className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-bright outline-none text-body-md"
                        type="number"
                        value={age}
                        onChange={(e) => setAge(Number(e.target.value))}
                        min={0}
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-label-md text-on-surface mb-2">
                        Gender
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-bright outline-none text-body-md"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block font-label-md text-on-surface mb-2">
                      Last Seen Location
                    </label>
                    <input
                      className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-bright focus:border-secondary outline-none text-body-md"
                      type="text"
                      value={lastSeenLocation}
                      onChange={(e) => setLastSeenLocation(e.target.value)}
                      placeholder="e.g. Near River Bridge, Sector 4"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-label-md text-on-surface mb-2">
                        Latitude
                      </label>
                      <input
                        className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-bright outline-none text-body-md"
                        type="number"
                        step="0.0001"
                        value={latitude}
                        onChange={(e) => setLatitude(Number(e.target.value))}
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-label-md text-on-surface mb-2">
                        Longitude
                      </label>
                      <input
                        className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-bright outline-none text-body-md"
                        type="number"
                        step="0.0001"
                        value={longitude}
                        onChange={(e) => setLongitude(Number(e.target.value))}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block font-label-md text-on-surface mb-2">
                      Description / Last Clothing Details
                    </label>
                    <textarea
                      className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-bright outline-none text-body-md h-20 resize-none"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g. Wearing a blue raincoat, brown backpack..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-label-md text-on-surface mb-2">
                      Reporter / Contact Name
                    </label>
                    <input
                      className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-bright outline-none text-body-md"
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-label-md text-on-surface mb-2">
                      Contact Phone
                    </label>
                    <input
                      className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-bright outline-none text-body-md"
                      type="text"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-outline-variant bg-surface flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-6 py-2 border border-outline-variant rounded-lg font-label-md hover:bg-surface-container-high"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-primary text-white rounded-lg font-label-md shadow-lg shadow-primary/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  {saving ? "Filing Report..." : "File Search Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
