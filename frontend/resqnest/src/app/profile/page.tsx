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
  { icon: "person", label: "Profile", href: "/profile", active: true },
];

const ACTIVITIES = [
  {
    icon: "inventory",
    iconClass: "bg-secondary/10 text-secondary",
    title: "Updated Inventory at Shelter Alpha",
    desc: "Reallocated 500 medical kits and verified cold-chain storage status.",
    meta: "2 hours ago • Sector 7-G",
    line: true,
  },
  {
    icon: "report_problem",
    iconClass: "bg-primary/10 text-primary",
    title: "Submitted SOS Triage Report",
    desc: "Validated high-priority rescue request in Zone 4-A flood plain.",
    meta: "Yesterday, 14:22 • Zone 4-A",
    line: true,
  },
  {
    icon: "groups",
    iconClass: "bg-tertiary/10 text-tertiary",
    title: "Staff Deployment Approval",
    desc: "Authorized movement of 12 medical volunteers to Field Hospital 3.",
    meta: "2 days ago • HQ Command",
    line: false,
  },
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Edit fields state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState("");
  const [availability, setAvailability] = useState("");
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(false);

  // Password fields state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [updateStatus, setUpdateStatus] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await api.users.getProfile();
      setProfile(data);
      if (data) {
        setFullName(data.fullName || "");
        setEmail(data.email || "");
        setUsername(data.username || "");
        setPhone(data.phone || "");
        setLocation(data.location || "");
        setSkills(data.skills || "");
        setAvailability(data.availability || "");
        setEmailAlerts(!!data.emailAlerts);
        setSmsAlerts(!!data.smsAlerts);
        setPushNotifications(!!data.pushNotifications);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load profile. Please make sure you are logged in.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateStatus("");
    setError("");
    try {
      const payload = {
        username,
        email,
        fullName,
        phone,
        location,
        skills,
        availability,
        emailAlerts,
        smsAlerts,
        pushNotifications,
      };
      const updated = await api.users.updateProfile(payload);
      setProfile(updated);
      setUpdateStatus("Profile updated successfully!");
      setIsEditing(false);
      setTimeout(() => setUpdateStatus(""), 4000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to update profile.");
    }
  };

  const handleToggleNotification = async (type: "email" | "sms" | "push", currentVal: boolean) => {
    // Determine target values
    const newEmail = type === "email" ? !currentVal : emailAlerts;
    const newSms = type === "sms" ? !currentVal : smsAlerts;
    const newPush = type === "push" ? !currentVal : pushNotifications;

    if (type === "email") setEmailAlerts(newEmail);
    if (type === "sms") setSmsAlerts(newSms);
    if (type === "push") setPushNotifications(newPush);

    try {
      const payload = {
        username,
        email,
        fullName,
        phone,
        location,
        skills,
        availability,
        emailAlerts: newEmail,
        smsAlerts: newSms,
        pushNotifications: newPush,
      };
      const updated = await api.users.updateProfile(payload);
      setProfile(updated);
    } catch (err) {
      console.error("Failed to update notification status:", err);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus("");
    setPasswordError("");
    if (!currentPassword || !newPassword) {
      setPasswordError("Both current and new password are required.");
      return;
    }
    try {
      await api.users.changePassword({ currentPassword, newPassword });
      setPasswordStatus("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setTimeout(() => setPasswordStatus(""), 4000);
    } catch (err: any) {
      console.error(err);
      setPasswordError(err.message || "Failed to change password.");
    }
  };

  const handleSignOut = () => {
    api.auth.logout();
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface text-on-surface">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-4xl animate-spin text-primary">
            sync
          </span>
          <p className="font-label-md">Loading your security clearance profile...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface text-on-surface p-6">
        <div className="glass-card max-w-md p-8 rounded-2xl shadow-xl text-center border border-outline-variant">
          <span className="material-symbols-outlined text-5xl text-primary mb-4">
            gpp_maybe
          </span>
          <h3 className="font-headline-md text-xl mb-2 text-on-surface">Access Denied</h3>
          <p className="text-on-surface-variant font-body-md mb-6">{error}</p>
          <Link
            href="/login"
            className="inline-block bg-primary text-on-primary font-bold px-6 py-3 rounded-lg hover:bg-primary-container transition-all active:scale-95"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Sidebar */}
      <aside className="w-sidebar-width h-full left-0 fixed bg-inverse-surface flex flex-col border-r border-outline-variant z-50 hidden md:flex">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-lg">
              <span className="material-symbols-outlined text-white" style={FILL}>
                emergency
              </span>
            </div>
            <div>
              <h1 className="font-headline-md text-headline-md text-on-primary leading-tight">
                ResQNest
              </h1>
              <p className="text-[11px] uppercase tracking-widest text-on-surface-variant/60 font-bold">
                Mission Control
              </p>
            </div>
          </div>
          <nav className="space-y-1">
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
                      ? "flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary text-on-secondary border-l-4 border-secondary-fixed transition-all duration-200"
                      : "flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant/80 hover:text-on-surface hover:bg-surface-variant/10 transition-all duration-200"
                  }
                >
                  <span
                    className="material-symbols-outlined"
                    style={item.active ? FILL : undefined}
                  >
                    {item.icon}
                  </span>
                  <span className="font-label-md text-label-md">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="mt-auto p-6 border-t border-outline-variant/20">
          <Link
            href="/sos"
            className="block text-center w-full py-3 bg-primary text-on-primary font-bold rounded-lg shadow-lg hover:shadow-primary/20 transition-all active:scale-95 mb-6"
          >
            Report Emergency
          </Link>
          <div className="space-y-1">
            <Link
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-on-surface-variant/80 hover:text-on-surface hover:bg-surface-variant/10 transition-all"
              href="/sos"
            >
              <span className="material-symbols-outlined">help</span>
              <span className="font-label-md text-label-md">Support</span>
            </Link>
            <button
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-on-surface-variant/80 hover:text-on-surface hover:bg-surface-variant/10 transition-all text-left"
              onClick={handleSignOut}
            >
              <span className="material-symbols-outlined text-error">logout</span>
              <span className="font-label-md text-label-md">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="md:ml-sidebar-width min-h-screen">
        {/* Top Navigation */}
        <header className="bg-surface/70 backdrop-blur-xl w-full top-0 sticky z-40 border-b border-outline-variant shadow-sm flex justify-between items-center px-gutter py-4">
          <div className="flex items-center gap-4">
            <div className="md:hidden">
              <span className="material-symbols-outlined text-primary">menu</span>
            </div>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-on-surface-variant">
                search
              </span>
              <input
                className="pl-10 pr-4 py-2 bg-surface-container rounded-full border-none focus:ring-2 focus:ring-secondary/30 text-body-sm w-64"
                placeholder="Search mission assets..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex gap-4">
              <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">
                notifications
              </span>
              <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">
                settings
              </span>
            </div>
            <button className="px-5 py-2 bg-secondary/10 text-secondary font-bold rounded-full hover:bg-secondary/20 transition-colors text-label-md">
              Support
            </button>
            <div className="w-10 h-10 rounded-full border-2 border-primary overflow-hidden bg-slate-200 flex items-center justify-center text-primary font-bold">
              {profile.username ? profile.username[0].toUpperCase() : "U"}
            </div>
          </div>
        </header>

        {/* Profile Content */}
        <div className="max-w-container-max mx-auto p-4 md:p-stack-lg">
          {/* Status Message */}
          {updateStatus && (
            <div className="mb-4 p-4 bg-green-100 border border-green-300 text-green-800 rounded-lg font-bold flex items-center gap-2">
              <span className="material-symbols-outlined">check_circle</span>
              {updateStatus}
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-error-container/20 border border-primary/20 text-primary rounded-lg font-bold flex items-center gap-2">
              <span className="material-symbols-outlined">error</span>
              {error}
            </div>
          )}

          {/* Profile Header */}
          <section className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant shadow-sm mb-stack-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden border-4 border-surface shadow-xl bg-gradient-to-tr from-secondary to-primary-container flex items-center justify-center text-white text-5xl font-black">
                  {profile.fullName ? profile.fullName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() : profile.username[0].toUpperCase()}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-secondary text-white p-2 rounded-lg shadow-lg">
                  <span className="material-symbols-outlined text-sm">
                    verified_user
                  </span>
                </div>
              </div>
              <div className="flex-grow text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                  <h2 className="font-headline-lg text-headline-lg text-on-surface">
                    {profile.fullName || profile.username}
                  </h2>
                  <span className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-label-md capitalize">
                    {profile.role?.replace("ROLE_", "").toLowerCase()}
                  </span>
                </div>
                <p className="text-on-surface-variant mb-6 font-body-md max-w-2xl">
                  {profile.skills ? `Skills: ${profile.skills}` : "No skills listed yet. Click edit to add certified skills and support capabilities."}
                  {profile.availability && ` | Availability: ${profile.availability}`}
                </p>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="bg-primary text-on-primary font-bold px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-primary-container transition-all active:scale-95 shadow-md"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {isEditing ? "close" : "edit"}
                    </span>
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </button>
                  <button className="bg-white border border-outline-variant text-secondary font-bold px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-surface-container transition-all active:scale-95 shadow-sm">
                    <span className="material-symbols-outlined text-sm">share</span>
                    Export ID
                  </button>
                </div>
              </div>
              <div className="hidden lg:block text-right">
                <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mb-1">
                  Status
                </p>
                <div className="flex items-center gap-2 text-green-600 font-bold">
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                  ACTIVE ON DUTY
                </div>
                <p className="text-mono-sm text-on-surface-variant mt-2">
                  ID: RN-{profile.id || "0000"}
                </p>
              </div>
            </div>
          </section>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-stack-lg">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-stack-lg">
              {isEditing ? (
                /* Edit Profile Form */
                <form onSubmit={handleUpdateProfile} className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm space-y-4">
                  <h3 className="font-headline-md text-[18px] text-on-surface mb-4">
                    Modify Profile Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-body-sm font-semibold mb-1">Full Legal Name</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-secondary/30 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-body-sm font-semibold mb-1">Primary Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-secondary/30 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-body-sm font-semibold mb-1">Username</label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-secondary/30 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-body-sm font-semibold mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-secondary/30 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-body-sm font-semibold mb-1">Location / Zone</label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-secondary/30 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-body-sm font-semibold mb-1">Availability</label>
                      <input
                        type="text"
                        value={availability}
                        onChange={(e) => setAvailability(e.target.value)}
                        className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-secondary/30 outline-none"
                        placeholder="e.g. Weekends, 24/7, Nights"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-body-sm font-semibold mb-1">Skills &amp; Certifications</label>
                      <textarea
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-secondary/30 outline-none h-20 resize-none"
                        placeholder="e.g. First Aid, Triage, Logistics, Water Rescue"
                      />
                    </div>
                  </div>
                  <div className="flex gap-4 pt-2">
                    <button
                      type="submit"
                      className="bg-primary text-on-primary font-bold px-6 py-2 rounded-lg hover:bg-primary-container transition-all active:scale-95 shadow-md"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="border border-outline-variant text-on-surface font-bold px-6 py-2 rounded-lg hover:bg-surface-container transition-all active:scale-95"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                /* Profile Display */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-lg">
                  {/* Personal Details */}
                  <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-headline-md text-[18px] text-on-surface">
                        Personal Details
                      </h3>
                      <span className="material-symbols-outlined text-on-surface-variant text-sm">
                        info
                      </span>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                          Full Legal Name
                        </label>
                        <p className="text-body-md font-semibold text-on-surface">
                          {profile.fullName || "Not Specified"}
                        </p>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                          Primary Email
                        </label>
                        <p className="text-body-md font-semibold text-on-surface">
                          {profile.email}
                        </p>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                          Phone Number
                        </label>
                        <p className="text-body-md font-semibold text-on-surface">
                          {profile.phone || "Not Specified"}
                        </p>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                          Location Zone
                        </label>
                        <p className="text-body-md font-semibold text-on-surface">
                          {profile.location || "Not Specified"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm bg-[radial-gradient(circle_at_top_right,rgba(183,0,17,0.05),transparent_70%)]">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-headline-md text-[18px] text-on-surface">
                        Safety &amp; Check-In
                      </h3>
                      <span
                        className="material-symbols-outlined text-primary text-sm"
                        style={FILL}
                      >
                        emergency_home
                      </span>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-surface p-3 rounded-lg border border-outline-variant/30">
                        <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                          Safety Status
                        </label>
                        <p className="text-body-md font-bold text-secondary uppercase">
                          {profile.safetyStatus || "UNKNOWN"}
                        </p>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                          Status Verified
                        </label>
                        <p className="text-body-md font-semibold text-on-surface">
                          {profile.safetyStatusVerified ? "Yes (Verified)" : "No"}
                        </p>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                          Last Check-In
                        </label>
                        <p className="text-body-md font-semibold text-on-surface">
                          {profile.lastCheckIn ? new Date(profile.lastCheckIn).toLocaleString() : "Never Checked In"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Admin & Role Data */}
              <div className="bg-white rounded-xl border border-outline-variant shadow-sm overflow-hidden">
                <div className="flex border-b border-outline-variant">
                  <button className="px-6 py-4 font-bold text-primary border-b-2 border-primary bg-surface/50">
                    Access Clearance &amp; System Role
                  </button>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-label-md text-on-surface-variant mb-4 uppercase tracking-widest font-bold">
                        Organization &amp; Access
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-secondary">
                            corporate_fare
                          </span>
                          <div>
                            <p className="text-body-sm font-semibold">
                              ResQNest Regional Network
                            </p>
                            <p className="text-[12px] text-on-surface-variant">
                              Disaster Relief Logistics Center
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-secondary">
                            admin_panel_settings
                          </span>
                          <div>
                            <p className="text-body-sm font-semibold uppercase">
                              {profile.role?.replace("ROLE_", "")} Privileges
                            </p>
                            <p className="text-[12px] text-on-surface-variant">
                              Active role clearances assigned by administrator.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-label-md text-on-surface-variant mb-4 uppercase tracking-widest font-bold">
                        Skills &amp; Capabilities
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills ? (
                          profile.skills.split(",").map((skill: string) => (
                            <span
                              key={skill}
                              className="px-3 py-1 bg-surface-container text-on-surface-variant rounded-md text-body-sm font-medium"
                            >
                              {skill.trim()}
                            </span>
                          ))
                        ) : (
                          <span className="text-body-sm text-on-surface-variant italic">
                            No skills registered.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activities */}
              <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm">
                <h3 className="font-headline-md text-[18px] text-on-surface mb-6">
                  Recent Mission Activities
                </h3>
                <div className="space-y-6">
                  {ACTIVITIES.map((a) => (
                    <div key={a.title} className="flex gap-4 relative">
                      {a.line && (
                        <div className="absolute top-8 left-4 bottom-[-24px] w-0.5 bg-outline-variant" />
                      )}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 border border-white ${a.iconClass}`}
                      >
                        <span className="material-symbols-outlined text-sm">
                          {a.icon}
                        </span>
                      </div>
                      <div>
                        <p className="text-body-md font-semibold">{a.title}</p>
                        <p className="text-body-sm text-on-surface-variant">
                          {a.desc}
                        </p>
                        <p className="text-mono-sm text-on-surface-variant mt-1 text-[11px]">
                          {a.meta}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-stack-lg">
              {/* Current Deployment */}
              <div className="bg-white rounded-xl border border-outline-variant shadow-sm overflow-hidden">
                <div className="p-6">
                  <h3 className="font-headline-md text-[18px] text-on-surface mb-4">
                    Current Deployment
                  </h3>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span
                        className="material-symbols-outlined text-primary"
                        style={FILL}
                      >
                        location_on
                      </span>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">
                        Active Assignment
                      </p>
                      <p className="text-headline-md text-[20px]">{profile.location || "Standby Zone"}</p>
                    </div>
                  </div>
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-body-sm">
                      <span className="text-on-surface-variant">Home Base:</span>
                      <span className="font-semibold">ResQNest HQ</span>
                    </div>
                    <div className="flex justify-between text-body-sm">
                      <span className="text-on-surface-variant">
                        Availability Status:
                      </span>
                      <span className="font-semibold">{profile.availability || "Standby"}</span>
                    </div>
                  </div>
                </div>
                <div className="h-48 w-full bg-surface-container relative group">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage:
                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDeqFqhXbMQIp4L-pje5qaDOwvhcs980lBHI1OQhUBxEcQNQ6iVcFnoeFzmHQ92AcGGnEXlvQ0ELSenKh97HkUqNEdUWHdLA1IY1d71WdPoRDYJhw5mTPjJE79HTfMHdiMsg2bsxvYUQa0tKnjVXSysO6u2paN702q2-OprR4C6jYWkGrzovvsZ28NHCoF6owSAdqCXsnZfP8TbMFnDlDmsI8E7itROaJVud754LZGQverk6-TrvKDYXcANZrcf8qjDLVARBIjvSbs')",
                    }}
                  />
                  <div className="absolute inset-0 bg-secondary/10 group-hover:bg-transparent transition-all" />
                  <Link href="/map" className="absolute bottom-4 right-4 bg-white/90 backdrop-blur text-secondary px-4 py-2 rounded-lg text-label-md font-bold shadow-lg flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">
                      fullscreen
                    </span>
                    Open Operations Map
                  </Link>
                </div>
              </div>

              {/* Account Settings */}
              <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm">
                <h3 className="font-headline-md text-[18px] text-on-surface mb-6">
                  Account Settings
                </h3>

                {/* Change Password Form */}
                <form onSubmit={handleChangePassword} className="mb-8">
                  <h4 className="text-label-md font-bold text-on-surface mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant">
                      lock
                    </span>
                    Change Password
                  </h4>
                  {passwordStatus && (
                    <div className="mb-2 text-xs font-bold text-green-600">
                      {passwordStatus}
                    </div>
                  )}
                  {passwordError && (
                    <div className="mb-2 text-xs font-bold text-primary">
                      {passwordError}
                    </div>
                  )}
                  <div className="space-y-3">
                    <input
                      className="w-full px-4 py-2 rounded-lg border border-outline-variant focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all outline-none text-body-sm"
                      placeholder="Current Password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                    <input
                      className="w-full px-4 py-2 rounded-lg border border-outline-variant focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all outline-none text-body-sm"
                      placeholder="New Password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <button
                      type="submit"
                      className="w-full py-2 bg-secondary text-on-secondary font-bold rounded-lg hover:bg-secondary-container transition-all active:scale-95 text-body-sm"
                    >
                      Update Security
                    </button>
                  </div>
                </form>

                {/* Notification Toggles */}
                <div>
                  <h4 className="text-label-md font-bold text-on-surface mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant">
                      notifications_active
                    </span>
                    SOS Notifications
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-body-sm font-semibold">Email Alerts</span>
                        <span className="text-[12px] text-on-surface-variant">Daily mission summaries</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          checked={emailAlerts}
                          onChange={() => handleToggleNotification("email", emailAlerts)}
                          className="sr-only peer"
                          type="checkbox"
                        />
                        <div className="w-11 h-6 bg-surface-container peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary" />
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-body-sm font-semibold">SMS Critical Alerts</span>
                        <span className="text-[12px] text-on-surface-variant">Direct SOS dispatches</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          checked={smsAlerts}
                          onChange={() => handleToggleNotification("sms", smsAlerts)}
                          className="sr-only peer"
                          type="checkbox"
                        />
                        <div className="w-11 h-6 bg-surface-container peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-body-sm font-semibold">Push Notifications</span>
                        <span className="text-[12px] text-on-surface-variant">In-app activity updates</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          checked={pushNotifications}
                          onChange={() => handleToggleNotification("push", pushNotifications)}
                          className="sr-only peer"
                          type="checkbox"
                        />
                        <div className="w-11 h-6 bg-surface-container peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
