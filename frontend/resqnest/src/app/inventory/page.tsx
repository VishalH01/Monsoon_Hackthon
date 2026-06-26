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
  { icon: "inventory_2", label: "Inventory", href: "/inventory", active: true },
  { icon: "person_search", label: "Missing Persons", href: "/missing-persons" },
  { icon: "volunteer_activism", label: "Donations", href: "/donations" },
  { icon: "person", label: "Profile", href: "/profile" },
];

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null); // if null, we are adding new item

  // Form State
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("FOOD");
  const [quantity, setQuantity] = useState(0);
  const [unit, setUnit] = useState("Units");
  const [threshold, setThreshold] = useState(10);
  const [warehouseLocation, setWarehouseLocation] = useState("");
  const [shelterId, setShelterId] = useState<string>("");

  const [shelters, setShelters] = useState<any[]>([]);

  useEffect(() => {
    fetchInventory();
    fetchShelters();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const data = await api.inventories.fetchAll();
      setItems(data || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to fetch inventory items.");
    } finally {
      setLoading(false);
    }
  };

  const fetchShelters = async () => {
    try {
      const data = await api.shelters.fetchAll();
      setShelters(data || []);
    } catch (err) {
      console.error("Failed to fetch shelters for dropdown:", err);
    }
  };

  const handleOpenAddModal = () => {
    setSelectedItem(null);
    setItemName("");
    setCategory("FOOD");
    setQuantity(0);
    setUnit("Units");
    setThreshold(10);
    setWarehouseLocation("");
    setShelterId("");
    setModalOpen(true);
  };

  const handleOpenEditModal = (item: any) => {
    setSelectedItem(item);
    setItemName(item.itemName);
    setCategory(item.category || "FOOD");
    setQuantity(item.quantity);
    setUnit(item.unit || "Units");
    setThreshold(item.threshold || 10);
    setWarehouseLocation(item.warehouseLocation || "");
    setShelterId(item.shelterId ? item.shelterId.toString() : "");
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedItem) {
        // Edit quantity
        await api.inventories.updateQuantity(selectedItem.id, quantity);
      } else {
        // Create new item
        const payload = {
          itemName,
          category,
          quantity: Number(quantity),
          unit,
          threshold: Number(threshold),
          warehouseLocation,
          shelterId: shelterId ? Number(shelterId) : undefined,
        };
        await api.inventories.create(payload);
      }
      setModalOpen(false);
      fetchInventory();
    } catch (err: any) {
      alert("Error saving item: " + (err.message || err));
    }
  };

  // Filter items based on search and category filter
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.itemName?.toLowerCase().includes(search.toLowerCase()) || 
                          item.warehouseLocation?.toLowerCase().includes(search.toLowerCase()) ||
                          item.id?.toString().includes(search);
    const matchesCategory = categoryFilter === "" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Calculate dynamic KPIs from current database
  const getCategoryStats = (cat: string) => {
    const catItems = items.filter(i => i.category === cat);
    const total = catItems.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
    const criticalCount = catItems.filter(i => i.status === "CRITICAL" || (i.threshold && i.quantity <= i.threshold)).length;
    return { total, criticalCount };
  };

  const foodStats = getCategoryStats("FOOD");
  const waterStats = getCategoryStats("WATER");
  const medicalStats = getCategoryStats("MEDICAL");
  const shelterStats = getCategoryStats("SHELTER");

  const kpis = [
    {
      icon: "restaurant",
      iconClass: "text-secondary",
      label: "Food In Stock",
      value: foodStats.total.toLocaleString(),
      unit: "Units",
      badge: foodStats.criticalCount > 0 ? `${foodStats.criticalCount} CRITICAL` : "STABLE",
      badgeClass: foodStats.criticalCount > 0 ? "text-primary bg-primary/10" : "text-secondary bg-secondary/10",
      barW: foodStats.total > 1000 ? "w-full" : "w-1/2",
      barC: "bg-secondary",
    },
    {
      icon: "water_drop",
      iconClass: "text-secondary",
      label: "Water Reserve",
      value: waterStats.total.toLocaleString(),
      unit: "Liters",
      badge: waterStats.criticalCount > 0 ? `${waterStats.criticalCount} CRITICAL` : "STABLE",
      badgeClass: waterStats.criticalCount > 0 ? "text-primary bg-primary/10" : "text-secondary bg-secondary/10",
      barW: waterStats.total > 2000 ? "w-full" : "w-1/3",
      barC: "bg-secondary",
    },
    {
      icon: "vaccines",
      iconClass: "text-primary",
      label: "Medical Kits",
      value: medicalStats.total.toLocaleString(),
      unit: "Kits",
      badge: medicalStats.criticalCount > 0 ? "CRITICAL ALERT" : "STABLE",
      badgeClass: medicalStats.criticalCount > 0 ? "text-primary bg-primary/10" : "text-secondary bg-secondary/10",
      barW: medicalStats.criticalCount > 0 ? "w-[15%]" : "w-2/3",
      barC: medicalStats.criticalCount > 0 ? "bg-primary" : "bg-secondary",
      card: medicalStats.criticalCount > 0 ? "border-2 border-primary" : "border border-outline-variant",
    },
    {
      icon: "padding",
      iconClass: "text-secondary",
      label: "Blankets / Bedding",
      value: shelterStats.total.toLocaleString(),
      unit: "Units",
      badge: shelterStats.criticalCount > 0 ? "LOW STOCK" : "STABLE",
      badgeClass: shelterStats.criticalCount > 0 ? "text-primary bg-primary/10" : "text-on-surface-variant bg-surface-variant/30",
      barW: "w-full",
      barC: "bg-secondary",
    },
  ];

  return (
    <>
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-sidebar-width bg-inverse-surface flex flex-col py-stack-lg z-50 border-r border-outline-variant shadow-lg hidden md:flex">
        <div className="px-6 mb-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-on-primary">
            <span className="material-symbols-outlined text-[24px]">
              emergency
            </span>
          </div>
          <div>
            <h1 className="font-headline-md text-headline-md text-on-primary-container leading-none">
              ResQNest
            </h1>
            <p className="font-label-md text-label-md text-surface-variant opacity-70 mt-1">
              Disaster Operations
            </p>
          </div>
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
                    ? "flex items-center gap-3 px-4 py-3 font-label-md text-label-md bg-secondary-container text-on-secondary-container border-l-4 border-secondary transition-all duration-200"
                    : "flex items-center gap-3 px-4 py-3 font-label-md text-label-md text-surface-variant hover:text-on-surface-variant hover:bg-surface-variant/10 transition-all duration-200"
                }
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto px-6 mb-6">
          <button
            onClick={handleOpenAddModal}
            className="w-full bg-primary-container text-white py-3 rounded-lg font-label-md text-label-md shadow-md active:scale-95 transition-transform"
          >
            Add Resource
          </button>
        </div>
        <div className="px-3 border-t border-outline-variant/30 pt-6 space-y-1">
          <Link
            className="flex items-center gap-3 px-4 py-3 font-label-md text-label-md text-surface-variant hover:text-on-surface-variant hover:bg-surface-variant/10 transition-all"
            href="/sos"
          >
            <span className="material-symbols-outlined">support_agent</span>
            Support
          </Link>
          <button
            className="w-full flex items-center gap-3 px-4 py-3 font-label-md text-label-md text-surface-variant hover:text-on-surface-variant hover:bg-surface-variant/10 transition-all text-left"
            onClick={() => {
              api.auth.logout();
              window.location.href = "/login";
            }}
          >
            <span className="material-symbols-outlined">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col md:ml-sidebar-width h-screen overflow-hidden">
        {/* Top App Bar */}
        <header className="w-full sticky top-0 z-40 bg-surface/70 backdrop-blur-md border-b border-outline-variant shadow-sm flex items-center justify-between px-margin-desktop h-16">
          <div className="flex items-center gap-6">
            <h2 className="font-headline-md text-headline-md font-bold text-primary">
              ReliefOps Command
            </h2>
            <div className="relative hidden lg:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                search
              </span>
              <input
                className="pl-10 pr-4 py-1.5 rounded-full border border-outline-variant bg-surface-container-low text-body-sm w-80 focus:ring-2 focus:ring-secondary/50 outline-none transition-all"
                placeholder="Search resources..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            {["notifications", "help", "settings"].map((icon) => (
              <button
                key={icon}
                className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer active:scale-95"
              >
                <span className="material-symbols-outlined">{icon}</span>
              </button>
            ))}
            <div className="h-8 w-px bg-outline-variant mx-2" />
            <div className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform">
              <div className="w-8 h-8 rounded-full bg-surface-container-highest overflow-hidden flex items-center justify-center text-primary font-bold border border-primary">
                A
              </div>
              <span className="font-label-md text-on-surface hidden sm:block">
                Ops Manager
              </span>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-margin-desktop">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-stack-lg mb-stack-lg">
            {kpis.map((k) => (
              <div
                key={k.label}
                className={`bg-surface-container-lowest p-stack-md rounded-xl shadow-sm hover:shadow-md transition-shadow ${k.card || "border border-outline-variant"}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span
                    className={`material-symbols-outlined text-[20px] ${k.iconClass}`}
                  >
                    {k.icon}
                  </span>
                  <span
                    className={`text-[12px] font-bold px-2 py-0.5 rounded-full ${k.badgeClass}`}
                  >
                    {k.badge}
                  </span>
                </div>
                <h3 className="text-on-surface-variant font-label-md text-[12px] uppercase tracking-wider">
                  {k.label}
                </h3>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="font-headline-md text-headline-md text-on-surface">
                    {k.value}
                  </span>
                  <span className="text-body-sm text-on-surface-variant">
                    {k.unit}
                  </span>
                </div>
                <div className="mt-3 h-1 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className={`h-full ${k.barC} ${k.barW}`} />
                </div>
              </div>
            ))}
          </div>

          {/* Inventory Controls */}
          <div className="bg-surface-container-lowest p-stack-md rounded-xl shadow-sm border border-outline-variant mb-stack-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                  search
                </span>
                <input
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-outline-variant bg-surface-bright text-body-md focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
                  placeholder="Search resources by name..."
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-outline-variant rounded-lg font-label-md text-on-surface-variant bg-surface outline-none"
              >
                <option value="">All Categories</option>
                <option value="FOOD">Food</option>
                <option value="WATER">Water</option>
                <option value="MEDICAL">Medical</option>
                <option value="SHELTER">Shelter</option>
              </select>
            </div>
            <button
              onClick={handleOpenAddModal}
              className="bg-primary text-on-primary px-6 py-2 rounded-lg font-label-md shadow-lg hover:shadow-primary/20 active:scale-95 transition-all"
            >
              Add Resource
            </button>
          </div>

          {/* Inventory Table */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container text-on-surface-variant border-b border-outline-variant">
                    {["Item Name", "Category", "Current Stock", "Minimum Level", "Warehouse Location", "Shelter Assigned"].map(
                      (h) => (
                        <th key={h} className="px-6 py-4 font-label-md text-label-md">
                          {h}
                        </th>
                      )
                    )}
                    <th className="px-6 py-4 font-label-md text-label-md text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-on-surface-variant">
                        <span className="material-symbols-outlined animate-spin align-middle mr-2">
                          sync
                        </span>
                        Loading warehouse databases...
                      </td>
                    </tr>
                  ) : filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-on-surface-variant italic">
                        No resources found matching filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => {
                      const critical = item.status === "CRITICAL" || (item.threshold && item.quantity <= item.threshold);
                      const pct = item.pct || (item.threshold ? Math.min(100, (item.quantity / (item.threshold * 2)) * 100) : 100);

                      return (
                        <tr
                          key={item.id}
                          className={`transition-colors group ${
                            critical
                              ? "bg-error-container/20 hover:bg-error-container/40"
                              : "hover:bg-surface-container-low"
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className={`font-bold ${critical ? "text-primary" : "text-on-surface"}`}>
                              {item.itemName}
                            </div>
                            <div className={`text-[12px] font-mono-sm ${critical ? "text-primary" : "text-on-surface-variant"}`}>
                              ID: {item.id}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 rounded text-[11px] font-bold ${
                                critical
                                  ? "bg-primary text-on-primary"
                                  : "bg-secondary-fixed text-on-secondary-fixed-variant"
                              }`}
                            >
                              {item.category}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-24 h-2 rounded-full ${critical ? "bg-error-container" : "bg-slate-200"}`}>
                                <div
                                  className={`h-full rounded-full ${critical ? "bg-primary" : "bg-green-600"}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <div className="flex flex-col">
                                <span className={`font-bold ${critical ? "text-primary" : "text-on-surface"}`}>
                                  {item.quantity} {item.unit}
                                </span>
                                {critical && (
                                  <span className="px-2 py-0.5 bg-primary text-on-primary rounded text-[9px] font-black uppercase inline-block text-center mt-1">
                                    CRITICAL
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-on-surface-variant">
                            {item.threshold} {item.unit}
                          </td>
                          <td className="px-6 py-4 text-on-surface-variant font-semibold">
                            {item.warehouseLocation || "Main Depot"}
                          </td>
                          <td className="px-6 py-4 text-on-surface-variant">
                            {item.shelterName || "None (Global Reserve)"}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleOpenEditModal(item)}
                              className={`p-2 rounded-full transition-colors material-symbols-outlined ${
                                critical
                                  ? "text-primary hover:bg-primary/10"
                                  : "text-secondary hover:bg-secondary/10"
                              }`}
                            >
                              edit
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Resource Modal */}
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
                  {selectedItem ? "Modify Quantity" : "Add Resource"}
                </h3>
                <p className="text-body-sm text-on-surface-variant">
                  {selectedItem ? `Update stock levels for ${selectedItem.itemName}` : "Register a new supply asset in the logistics network"}
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant/20"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-stack-lg">
                <div className="space-y-4">
                  <div>
                    <label className="block font-label-md text-on-surface mb-2">
                      Item Name
                    </label>
                    <input
                      className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-bright focus:border-secondary outline-none text-body-md disabled:bg-slate-100"
                      type="text"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      required
                      disabled={!!selectedItem}
                    />
                  </div>
                  <div>
                    <label className="block font-label-md text-on-surface mb-2">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-bright focus:border-secondary outline-none text-body-md disabled:bg-slate-100"
                      disabled={!!selectedItem}
                    >
                      <option value="FOOD">Food</option>
                      <option value="WATER">Water</option>
                      <option value="MEDICAL">Medical</option>
                      <option value="SHELTER">Shelter</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-label-md text-on-surface mb-2">
                      Unit Type
                    </label>
                    <input
                      className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-bright focus:border-secondary outline-none text-body-md disabled:bg-slate-100"
                      type="text"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      placeholder="e.g. Liters, Units, Kits"
                      required
                      disabled={!!selectedItem}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block font-label-md text-on-surface mb-2 font-bold text-primary">
                      Current Quantity
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        className="flex-1 px-4 py-2 rounded-lg border border-primary bg-surface-bright text-primary font-bold focus:ring-0 outline-none text-body-md"
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        min={0}
                        required
                      />
                      <span className="text-primary font-bold">{unit}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block font-label-md text-on-surface mb-2">
                      Min Threshold (Critical Alert Level)
                    </label>
                    <input
                      className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-bright outline-none text-body-md disabled:bg-slate-100"
                      type="number"
                      value={threshold}
                      onChange={(e) => setThreshold(Number(e.target.value))}
                      min={1}
                      required
                      disabled={!!selectedItem}
                    />
                  </div>
                  <div>
                    <label className="block font-label-md text-on-surface mb-2">
                      Warehouse Location
                    </label>
                    <input
                      className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-bright outline-none text-body-md disabled:bg-slate-100"
                      type="text"
                      value={warehouseLocation}
                      onChange={(e) => setWarehouseLocation(e.target.value)}
                      placeholder="e.g. Zone B-04"
                      disabled={!!selectedItem}
                    />
                  </div>
                  {!selectedItem && (
                    <div>
                      <label className="block font-label-md text-on-surface mb-2">
                        Assign to Shelter (Optional)
                      </label>
                      <select
                        value={shelterId}
                        onChange={(e) => setShelterId(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-bright outline-none text-body-md"
                      >
                        <option value="">Global Reserve (No Specific Shelter)</option>
                        {shelters.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-6 border-t border-outline-variant bg-surface flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2 text-primary">
                  {quantity <= threshold && (
                    <>
                      <span className="material-symbols-outlined text-[20px]">
                        warning
                      </span>
                      <span className="text-[12px] font-bold">
                        Warning: Level is currently below minimum safety threshold.
                      </span>
                    </>
                  )}
                </div>
                <div className="flex gap-4 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 sm:flex-none px-6 py-2 border border-outline-variant rounded-lg font-label-md hover:bg-surface-container-high"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 sm:flex-none px-6 py-2 bg-secondary text-on-secondary rounded-lg font-label-md shadow-lg shadow-secondary/20 active:scale-95 transition-all"
                  >
                    {selectedItem ? "Update Quantity" : "Add Resource"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
