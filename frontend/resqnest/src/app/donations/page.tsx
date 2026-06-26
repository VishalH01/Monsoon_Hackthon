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
  { icon: "volunteer_activism", label: "Donations", href: "/donations", active: true },
  { icon: "account_circle", label: "Profile", href: "/profile" },
];

export default function DonationsPage() {
  const [ledger, setLedger] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [donorName, setDonorName] = useState("");
  const [donorType, setDonorType] = useState("Individual");
  const [donorEmail, setDonorEmail] = useState("");
  const [donationType, setDonationType] = useState("MONEY");
  const [amount, setAmount] = useState<number>(0);
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState<number>(0);
  const [unit, setUnit] = useState("Units");
  const [notes, setNotes] = useState("");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const data = await api.donations.fetchAll();
      setLedger(data || []);
    } catch (err) {
      console.error("Error fetching donations:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = {
        donorName,
        donorType,
        donorEmail,
        donationType,
        notes,
        status: "PENDING",
      };

      if (donationType === "MONEY") {
        payload.amount = Number(amount);
      } else {
        payload.itemName = itemName;
        payload.quantity = Number(quantity);
        payload.unit = unit;
      }

      const response = await api.donations.create(payload);
      
      if (donationType === "MONEY" && response && response.id) {
        // Create stripe checkout session
        const session = await api.donations.createPaymentSession(response.id);
        if (session && session.checkoutUrl) {
          window.location.href = session.checkoutUrl;
          return;
        }
      }

      setModalOpen(false);
      fetchDonations();
      // Reset form
      setDonorName("");
      setDonorEmail("");
      setAmount(0);
      setItemName("");
      setQuantity(0);
      setNotes("");
    } catch (err: any) {
      alert("Error recording donation: " + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  const filteredLedger = ledger.filter((item) => {
    const term = search.toLowerCase();
    return (
      item.donorName?.toLowerCase().includes(term) ||
      item.donorEmail?.toLowerCase().includes(term) ||
      item.itemName?.toLowerCase().includes(term) ||
      item.donationType?.toLowerCase().includes(term)
    );
  });

  // Calculate dynamic metrics
  const totalMoney = ledger
    .filter((d) => d.donationType === "MONEY")
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const totalItemsCount = ledger
    .filter((d) => d.donationType === "ITEMS")
    .reduce((acc, curr) => acc + (curr.quantity || 0), 0);

  // Group top contributors by email
  const contributorsMap: Record<string, { name: string; type: string; total: number }> = {};
  ledger.forEach((d) => {
    const key = d.donorEmail || d.donorName;
    if (!key) return;
    const value = d.donationType === "MONEY" ? (d.amount || 0) : (d.quantity || 0) * 10; // value items for score representation
    if (contributorsMap[key]) {
      contributorsMap[key].total += value;
    } else {
      contributorsMap[key] = {
        name: d.donorName || "Anonymous",
        type: d.donorType || "Individual",
        total: value,
      };
    }
  });

  const contributors = Object.values(contributorsMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 4);

  return (
    <>
      {/* Sidebar */}
      <aside className="w-sidebar-width h-screen fixed left-0 top-0 bg-[#0F172A] border-r border-outline-variant shadow-lg flex flex-col py-stack-lg z-50">
        <div className="px-6 mb-10">
          <h1 className="font-headline-md text-headline-md font-bold text-white tracking-tight">
            ResQNest
          </h1>
          <p className="text-surface-variant font-label-md text-xs mt-1">
            Mission-Critical Operations
          </p>
        </div>
        <nav className="flex-1 space-y-1 px-3">
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
                    ? "relative flex items-center gap-3 px-4 py-3 rounded-lg text-secondary-fixed bg-secondary-fixed/10 border-l-4 border-secondary font-bold active:scale-95 duration-150"
                    : "flex items-center gap-3 px-4 py-3 rounded-lg text-surface-variant font-medium hover:bg-surface-variant/10 hover:text-white transition-colors active:scale-95 duration-150"
                }
              >
                <span
                  className="material-symbols-outlined"
                  style={item.active ? FILL : undefined}
                >
                  {item.icon}
                </span>
                <span className="font-label-md">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="px-4 mt-auto">
          <Link
            href="/sos"
            className="w-full bg-primary-container text-white font-label-md py-4 rounded-lg flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined">broadcast_on_home</span>
            Emergency Broadcast
          </Link>
        </div>
      </aside>

      {/* Main Wrapper */}
      <div className="ml-[280px] min-h-screen">
        {/* Top App Bar */}
        <header className="fixed top-0 right-0 w-[calc(100%-280px)] h-16 bg-surface/70 backdrop-blur-md border-b border-outline-variant flex items-center justify-between px-margin-desktop z-40">
          <div className="flex items-center flex-1">
            <div className="relative w-96 focus-within:scale-[1.02] transition-transform">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">
                search
              </span>
              <input
                className="w-full bg-white border border-outline rounded-full py-2 pl-10 pr-4 text-body-sm focus:ring-2 focus:ring-secondary focus:border-secondary transition-all outline-none"
                placeholder="Search transactions, donors, or aid types..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-low transition-all active:opacity-80">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-low transition-all active:opacity-80">
              <span className="material-symbols-outlined">settings</span>
            </button>
            <div className="h-8 w-px bg-outline-variant mx-2" />
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right">
                <p className="text-label-md font-bold text-on-surface leading-tight">
                  Commander Sarah
                </p>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">
                  Logistics Lead
                </p>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover bg-primary-container text-white font-bold flex items-center justify-center">
                S
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="pt-24 pb-stack-lg px-margin-desktop max-w-[1440px] mx-auto">
          {/* Page Header */}
          <div className="flex justify-between items-end mb-stack-lg">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface">
                Donation Intelligence
              </h2>
              <p className="text-on-surface-variant font-body-md">
                Monitoring global influx and strategic asset deployment.
              </p>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="bg-primary hover:bg-primary-container text-white px-6 py-3 rounded-lg font-label-md flex items-center gap-2 shadow-xl shadow-primary/10 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined" style={FILL}>
                add
              </span>
              Record Donation
            </button>
          </div>

          {/* KPI Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-stack-lg">
            {/* KPI 1 */}
            <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <span className="material-symbols-outlined text-secondary">
                    payments
                  </span>
                </div>
                <span className="text-xs font-bold text-green-600 flex items-center bg-green-50 px-2 py-1 rounded">
                  <span className="material-symbols-outlined text-sm mr-1">
                    trending_up
                  </span>
                  +12.4%
                </span>
              </div>
              <p className="text-on-surface-variant font-label-md uppercase text-[10px] tracking-widest">
                Total Fund Inflow
              </p>
              <h3 className="text-headline-lg font-extrabold text-on-surface mt-1">
                ${totalMoney.toLocaleString()}
              </h3>
              <div className="mt-4 h-1 bg-secondary/10 rounded-full overflow-hidden">
                <div className="h-full bg-secondary w-3/4 rounded-full" />
              </div>
            </div>
            {/* KPI 2 */}
            <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                  <span className="material-symbols-outlined">restaurant</span>
                </div>
                <span className="text-xs font-bold text-orange-600 flex items-center bg-orange-50 px-2 py-1 rounded">
                  Active
                </span>
              </div>
              <p className="text-on-surface-variant font-label-md uppercase text-[10px] tracking-widest">
                Material Items Contributed
              </p>
              <h3 className="text-headline-lg font-extrabold text-on-surface mt-1">
                {totalItemsCount.toLocaleString()}
              </h3>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-on-surface-variant">Logistics Status</p>
                <p className="text-xs font-bold text-orange-600">Healthy Flow</p>
              </div>
            </div>
            {/* KPI 3 */}
            <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <span className="material-symbols-outlined">
                    medical_services
                  </span>
                </div>
                <span className="text-xs font-bold text-blue-600 flex items-center bg-blue-50 px-2 py-1 rounded">
                  Stable
                </span>
              </div>
              <p className="text-on-surface-variant font-label-md uppercase text-[10px] tracking-widest">
                Active Campaigns
              </p>
              <h3 className="text-headline-lg font-extrabold text-on-surface mt-1">
                3 Campaigns
              </h3>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <p className="text-xs text-on-surface-variant">
                  Monsoon Flood Relief
                </p>
              </div>
            </div>
            {/* KPI 4 */}
            <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <span className="material-symbols-outlined">flag</span>
                </div>
                <p className="text-xs font-bold text-primary">Target Achieved</p>
              </div>
              <p className="text-on-surface-variant font-label-md uppercase text-[10px] tracking-widest">
                Logistics Goal Status
              </p>
              <div className="mt-4">
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[80%] rounded-full" />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-on-surface-variant font-mono-sm">
                    80% completed
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Table & Sidebar */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-gutter items-start">
            {/* Donation Ledger */}
            <div className="xl:col-span-3 bg-white rounded-xl border border-outline-variant shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-outline-variant flex justify-between items-center">
                <h4 className="font-headline-md text-on-surface">
                  Donation Ledger
                </h4>
                <div className="flex gap-2">
                  <button className="p-2 rounded hover:bg-surface-container transition-colors" onClick={fetchDonations}>
                    <span className="material-symbols-outlined">refresh</span>
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-surface text-on-surface-variant">
                    <tr>
                      {["Donor / Organization", "Date", "Asset Type", "Amount/Qty", "Status", "Notes"].map(
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
                        <td colSpan={6} className="text-center py-8 text-on-surface-variant">
                          <span className="material-symbols-outlined animate-spin align-middle mr-2">
                            sync
                          </span>
                          Syncing donation records...
                        </td>
                      </tr>
                    ) : filteredLedger.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-on-surface-variant italic">
                          No donations recorded in ledger.
                        </td>
                      </tr>
                    ) : (
                      filteredLedger.map((row) => {
                        const isMoney = row.donationType === "MONEY";
                        return (
                          <tr
                            key={row.id}
                            className="hover:bg-surface-container-lowest transition-colors"
                          >
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-8 h-8 rounded flex items-center justify-center font-bold text-xs bg-secondary/10 text-secondary"
                                >
                                  {row.donorName ? row.donorName.substring(0,2).toUpperCase() : "DN"}
                                </div>
                                <div>
                                  <p className="font-bold text-on-surface">
                                    {row.donorName}
                                  </p>
                                  <p className="text-[10px] text-on-surface-variant">
                                    {row.donorType} • {row.donorEmail}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5 text-body-sm text-on-surface-variant">
                              {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "Pending"}
                            </td>
                            <td className="px-6 py-5">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                  isMoney
                                    ? "bg-secondary-fixed text-on-secondary-fixed-variant"
                                    : "bg-orange-100 text-orange-700"
                                }`}
                              >
                                <span className="material-symbols-outlined text-[14px]">
                                  {isMoney ? "payments" : "restaurant"}
                                </span>{" "}
                                {row.donationType}
                              </span>
                            </td>
                            <td className="px-6 py-5 font-mono-sm font-bold text-on-surface">
                              {isMoney ? `$${(row.amount || 0).toLocaleString()}` : `${row.quantity} ${row.unit || "units"} of ${row.itemName}`}
                            </td>
                            <td className="px-6 py-5">
                              <span
                                className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide inline-block ${
                                  row.status === "RECEIVED" || row.status === "DISTRIBUTED"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-blue-100 text-blue-700"
                                }`}
                              >
                                {row.status}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-body-sm text-on-surface-variant max-w-[200px] truncate">
                              {row.notes || "-"}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Contributors */}
            <div className="bg-white rounded-xl border border-outline-variant shadow-sm flex flex-col h-full">
              <div className="px-6 py-5 border-b border-outline-variant">
                <h4 className="font-headline-md text-on-surface">
                  Top Contributors
                </h4>
                <p className="text-body-sm text-on-surface-variant">
                  System Ranking
                </p>
              </div>
              <div className="p-4 space-y-4">
                {contributors.map((c: any, index) => (
                  <div
                    key={c.name}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-container-low transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center font-bold bg-blue-100 text-blue-700 text-sm"
                        >
                          {c.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div
                          className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-sm bg-yellow-400 text-[8px] font-bold"
                        >
                          {index + 1}
                        </div>
                      </div>
                      <div>
                        <p className="text-body-sm font-bold text-on-surface group-hover:text-secondary">
                          {c.name}
                        </p>
                        <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-tighter">
                          {c.type}
                        </p>
                      </div>
                    </div>
                    <p className="text-body-sm font-mono-sm font-bold text-green-600">
                      Score: {c.total.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Record Donation Modal */}
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
                  Record New Donation
                </h3>
                <p className="text-body-sm text-on-surface-variant">
                  Register cash contributions (via Stripe) or supply items into the ledger
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant/20"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleRecordDonation}>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-stack-lg">
                <div className="space-y-4">
                  <div>
                    <label className="block font-label-md text-on-surface mb-2">
                      Donor Name
                    </label>
                    <input
                      className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-bright focus:border-secondary outline-none text-body-md"
                      type="text"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-label-md text-on-surface mb-2">
                      Donor Email
                    </label>
                    <input
                      className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-bright focus:border-secondary outline-none text-body-md"
                      type="email"
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-label-md text-on-surface mb-2">
                      Donor Type
                    </label>
                    <select
                      value={donorType}
                      onChange={(e) => setDonorType(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-bright focus:border-secondary outline-none text-body-md"
                    >
                      <option value="Individual">Individual</option>
                      <option value="Corporate">Corporate</option>
                      <option value="NGO">NGO Partner</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block font-label-md text-on-surface mb-2">
                      Donation Content Type
                    </label>
                    <select
                      value={donationType}
                      onChange={(e) => setDonationType(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-bright focus:border-secondary outline-none text-body-md"
                    >
                      <option value="MONEY">MONEY (Direct Payment Session)</option>
                      <option value="ITEMS">ITEMS (Material Goods Supply)</option>
                    </select>
                  </div>
                  {donationType === "MONEY" ? (
                    <div>
                      <label className="block font-label-md text-on-surface mb-2 font-bold text-secondary">
                        Donation Amount ($ USD)
                      </label>
                      <input
                        className="w-full px-4 py-2 rounded-lg border border-secondary bg-surface-bright text-secondary font-bold focus:ring-0 outline-none text-body-md"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        min={5}
                        required
                      />
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block font-label-md text-on-surface mb-2">
                            Item Name
                          </label>
                          <input
                            className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-bright outline-none text-body-md"
                            type="text"
                            value={itemName}
                            onChange={(e) => setItemName(e.target.value)}
                            placeholder="e.g. Blankets"
                            required
                          />
                        </div>
                        <div>
                          <label className="block font-label-md text-on-surface mb-2">
                            Quantity
                          </label>
                          <input
                            className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-bright outline-none text-body-md"
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            min={1}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block font-label-md text-on-surface mb-2">
                          Unit Measure
                        </label>
                        <input
                          className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-bright outline-none text-body-md"
                          type="text"
                          value={unit}
                          onChange={(e) => setUnit(e.target.value)}
                          placeholder="e.g. Pcs, Boxes"
                          required
                        />
                      </div>
                    </>
                  )}
                  <div>
                    <label className="block font-label-md text-on-surface mb-2">
                      Notes
                    </label>
                    <textarea
                      className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-bright outline-none text-body-md h-16 resize-none"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Special instructions or campaign allocations..."
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
                  {saving ? "Processing..." : donationType === "MONEY" ? "Proceed to Stripe Checkout" : "Log Supplies"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setModalOpen(true)}
        className="fixed bottom-10 right-10 w-16 h-16 bg-primary rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all z-50 group"
      >
        <span className="material-symbols-outlined text-3xl" style={FILL}>
          volunteer_activism
        </span>
        <span className="absolute right-full mr-4 bg-on-surface text-white text-[10px] uppercase tracking-widest px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Record New Donation
        </span>
      </button>
    </>
  );
}
