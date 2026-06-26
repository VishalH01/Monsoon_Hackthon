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
  { icon: "person_search", label: "Missing Persons", href: "/missing-persons" },
  { icon: "volunteer_activism", label: "Donations", href: "/donations" },
  { icon: "inventory", label: "Distribution", href: "/distribution", active: true },
  { icon: "person", label: "Profile", href: "/profile" },
];

export default function DistributionPage() {
  const [distributions, setDistributions] = useState<any[]>([]);
  const [inventories, setInventories] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [inventoryId, setInventoryId] = useState("");
  const [volunteerId, setVolunteerId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [distributedTo, setDistributedTo] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const dists = await api.distributions.fetchAll();
      setDistributions(dists || []);

      const invs = await api.inventories.fetchAll();
      setInventories(invs || []);

      const vols = await api.volunteers.fetchAll();
      setVolunteers(vols || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDistribution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inventoryId || !distributedTo) {
      alert("Inventory Item and Recipient are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        inventoryId: Number(inventoryId),
        volunteerId: volunteerId ? Number(volunteerId) : undefined,
        quantity: Number(quantity),
        distributedTo,
        status: "PENDING",
        notes,
      };
      await api.distributions.create(payload);
      setModalOpen(false);
      fetchData();
      // Reset form
      setInventoryId("");
      setVolunteerId("");
      setQuantity(1);
      setDistributedTo("");
      setNotes("");
    } catch (err: any) {
      alert("Error creating dispatch: " + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await api.distributions.updateStatus(id, status);
      fetchData();
    } catch (err: any) {
      alert("Error updating status: " + (err.message || err));
    }
  };

  const filteredDistributions = distributions.filter((d) => {
    const term = search.toLowerCase();
    return (
      d.distributedTo?.toLowerCase().includes(term) ||
      d.itemName?.toLowerCase().includes(term) ||
      d.notes?.toLowerCase().includes(term) ||
      d.id?.toString().includes(term)
    );
  });

  const pendingCount = distributions.filter((d) => d.status === "PENDING").length;
  const completedCount = distributions.filter((d) => d.status === "COMPLETED").length;

  return (
    <>
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-sidebar-width bg-inverse-surface shadow-lg z-50 flex flex-col py-stack-lg transition-all duration-300 hidden md:flex">
        <div className="px-6 mb-stack-lg">
          <h1 className="font-display-lg text-display-lg font-black text-on-primary tracking-tighter">
            ResQNest
          </h1>
          <p className="text-surface-variant font-label-md opacity-80 mt-1">
            Ops Commander
          </p>
        </div>
        <nav className="flex-1 px-4 space-y-1">
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
                    ? "flex items-center gap-stack-md bg-secondary-container text-on-secondary-container border-l-4 border-secondary px-4 py-3 rounded-lg"
                    : "flex items-center gap-stack-md text-surface-variant hover:text-on-secondary px-4 py-3 hover:bg-surface-variant/10 rounded-lg transition-colors duration-200"
                }
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="font-label-md">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto px-4 pb-stack-lg space-y-6">
          <Link
            href="/sos"
            className="w-full bg-primary text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 active:scale-95 duration-100"
          >
            <span className="material-symbols-outlined" style={FILL}>
              warning
            </span>
            <span>Emergency Alert</span>
          </Link>
          <div className="pt-4 border-t border-outline-variant/20">
            <Link
              className="flex items-center gap-stack-md text-surface-variant hover:text-on-secondary px-4 py-2 transition-colors duration-200"
              href="/profile"
            >
              <span className="material-symbols-outlined">settings</span>
              <span className="font-label-md">Settings</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="md:ml-sidebar-width min-h-screen flex flex-col">
        {/* Top App Bar */}
        <header className="sticky top-0 z-40 h-20 bg-surface/70 backdrop-blur-md border-b border-outline-variant flex justify-between items-center px-margin-desktop shadow-sm">
          <div className="flex items-center gap-stack-md flex-1">
            <div className="relative w-96 group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                search
              </span>
              <input
                className="w-full bg-surface-container-low border border-outline-variant rounded-full py-2 pl-10 pr-4 text-body-sm focus:ring-2 focus:ring-secondary focus:outline-none transition-all"
                placeholder="Search distribution dispatches..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 border-r border-outline-variant pr-6">
              <button className="relative text-on-surface-variant hover:text-primary transition-all">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="font-label-md text-on-surface leading-tight">
                  Admin Commander
                </p>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">
                  North Sector HQ
                </p>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-secondary shadow-sm object-cover bg-primary-container text-white font-bold flex items-center justify-center">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-margin-desktop">
          {/* Page Header */}
          <div className="flex justify-between items-end mb-stack-lg">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-background">
                Relief Distribution
              </h2>
              <p className="text-on-surface-variant font-body-md mt-1">
                Real-time oversight of humanitarian aid flow and logistics.
              </p>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="bg-primary hover:bg-primary-container text-white px-stack-lg py-3 rounded-lg font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 text-body-sm"
            >
              <span className="material-symbols-outlined">local_shipping</span>
              New Aid Dispatch
            </button>
          </div>

          <div className="space-y-gutter">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              <div className="bg-white p-stack-lg rounded-xl border border-outline-variant shadow-sm flex items-center justify-between group transition-all hover:border-primary/50">
                <div>
                  <p className="text-on-surface-variant font-label-md mb-2">
                    Pending Dispatches
                  </p>
                  <h3 className="text-display-lg font-display-lg text-on-surface">
                    {pendingCount}
                  </h3>
                  <div className="flex items-center gap-1 mt-2 text-primary">
                    <span className="material-symbols-outlined text-sm">
                      priority_high
                    </span>
                    <span className="text-xs font-bold">Needs attention</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">pending_actions</span>
                </div>
              </div>

              <div className="bg-white p-stack-lg rounded-xl border border-outline-variant shadow-sm flex items-center justify-between group transition-all hover:border-secondary/50">
                <div>
                  <p className="text-on-surface-variant font-label-md mb-2">
                    Completed Dispatches
                  </p>
                  <h3 className="text-display-lg font-display-lg text-on-surface">
                    {completedCount}
                  </h3>
                  <div className="flex items-center gap-1 mt-2 text-green-600">
                    <span className="material-symbols-outlined text-sm">
                      task_alt
                    </span>
                    <span className="text-xs font-bold">Safely delivered</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-secondary/10 text-secondary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">task_alt</span>
                </div>
              </div>

              <div className="bg-white p-stack-lg rounded-xl border border-outline-variant shadow-sm flex items-center justify-between group hover:border-tertiary/50 transition-all">
                <div>
                  <p className="text-on-surface-variant font-label-md mb-2">
                    Total Dispatches
                  </p>
                  <h3 className="text-display-lg font-display-lg text-on-surface">
                    {distributions.length}
                  </h3>
                  <div className="flex items-center gap-1 mt-2 text-tertiary">
                    <span className="material-symbols-outlined text-sm">
                      local_shipping
                    </span>
                    <span className="text-xs font-bold">Active in pipeline</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">local_shipping</span>
                </div>
              </div>
            </div>

            {/* Distribution Table */}
            <div className="bg-white rounded-xl border border-outline-variant shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-outline-variant flex justify-between items-center">
                <h4 className="font-headline-md text-on-surface">
                  Dispatch Pipeline
                </h4>
                <button onClick={fetchData} className="p-2 rounded hover:bg-surface-container transition-colors">
                  <span className="material-symbols-outlined">refresh</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-surface text-on-surface-variant">
                    <tr>
                      {["ID", "Recipient", "Item / Asset", "Quantity", "Assigned Volunteer", "Status", "Notes", "Actions"].map(
                        (h) => (
                          <th
                            key={h}
                            className="px-6 py-4 font-label-md text-xs uppercase tracking-wider"
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="text-center py-8 text-on-surface-variant">
                          <span className="material-symbols-outlined animate-spin align-middle mr-2">
                            sync
                          </span>
                          Loading dispatches...
                        </td>
                      </tr>
                    ) : filteredDistributions.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-8 text-on-surface-variant italic">
                          No distributions recorded. Click "New Aid Dispatch" to dispatch cargo.
                        </td>
                      </tr>
                    ) : (
                      filteredDistributions.map((row) => (
                        <tr
                          key={row.id}
                          className="hover:bg-surface-container-lowest transition-colors text-body-sm"
                        >
                          <td className="px-6 py-5 font-bold font-mono-sm">
                            #{row.id}
                          </td>
                          <td className="px-6 py-5 font-bold text-on-surface">
                            {row.distributedTo}
                          </td>
                          <td className="px-6 py-5 font-semibold">
                            {row.itemName || `Inventory #${row.inventoryId}`}
                          </td>
                          <td className="px-6 py-5 font-mono-sm">
                            {row.quantity}
                          </td>
                          <td className="px-6 py-5">
                            {row.volunteerName || `Volunteer #${row.volunteerId || "Not assigned"}`}
                          </td>
                          <td className="px-6 py-5">
                            <span
                              className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide inline-block ${
                                row.status === "COMPLETED"
                                  ? "bg-green-100 text-green-700"
                                  : row.status === "CANCELLED"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {row.status}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-on-surface-variant max-w-[200px] truncate">
                            {row.notes || "-"}
                          </td>
                          <td className="px-6 py-5">
                            {row.status === "PENDING" && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleUpdateStatus(row.id, "COMPLETED")}
                                  className="px-3 py-1 bg-green-600 text-white rounded font-bold hover:bg-green-700 transition-all text-xs"
                                >
                                  Complete
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(row.id, "CANCELLED")}
                                  className="px-3 py-1 bg-red-600 text-white rounded font-bold hover:bg-red-700 transition-all text-xs"
                                >
                                  Cancel
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* New Aid Dispatch Modal */}
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
                  Dispatch Aid Supplies
                </h3>
                <p className="text-body-sm text-on-surface-variant">
                  Select items from warehouse inventory and allocate to volunteers or direct recipients
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant/20"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCreateDistribution}>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-stack-lg">
                <div className="space-y-4">
                  <div>
                    <label className="block font-label-md text-on-surface mb-2">
                      Select Inventory Item
                    </label>
                    <select
                      value={inventoryId}
                      onChange={(e) => setInventoryId(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-bright focus:border-secondary outline-none text-body-md"
                      required
                    >
                      <option value="">-- Choose Item --</option>
                      {inventories.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.itemName} (Available: {i.quantity} {i.unit || "units"})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-label-md text-on-surface mb-2">
                      Quantity to Dispatch
                    </label>
                    <input
                      className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-bright focus:border-secondary outline-none text-body-md"
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      min={1}
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-label-md text-on-surface mb-2">
                      Recipient / Destination
                    </label>
                    <input
                      className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-bright focus:border-secondary outline-none text-body-md"
                      type="text"
                      value={distributedTo}
                      onChange={(e) => setDistributedTo(e.target.value)}
                      placeholder="e.g. Shelter Alpha, Community Center"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block font-label-md text-on-surface mb-2">
                      Assign Dispatch Volunteer (Optional)
                    </label>
                    <select
                      value={volunteerId}
                      onChange={(e) => setVolunteerId(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-bright focus:border-secondary outline-none text-body-md"
                    >
                      <option value="">-- Choose Volunteer --</option>
                      {volunteers.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.fullName || v.username} ({v.status})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-label-md text-on-surface mb-2">
                      Logistics Notes / Instructions
                    </label>
                    <textarea
                      className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-bright outline-none text-body-md h-28 resize-none"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Specify routing guidelines or urgent conditions..."
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
                  {saving ? "Creating Dispatch..." : "Initiate Dispatch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
