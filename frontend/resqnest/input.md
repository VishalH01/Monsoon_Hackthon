# ResQNest — Page Inputs & Data Spec

This document lists, for every page in the frontend, the **user inputs** (fields the
user fills in), the **data inputs** (values that must be supplied by the backend /
API to populate the page), and the **actions** (what each button/control should do).

> Status: the UI is built; backend wiring is **not** done yet. Use this as the
> frontend ↔ backend contract when building the APIs.

Legend — field notation: `name (type, required?) — notes`.

---

## `/` — Landing Page

- **User inputs:** none.
- **Data inputs:** static marketing content (can stay hard-coded). Optionally:
  live stats (`avgResponse`, `livesImpacted`, `countries`, `volunteers`).
- **Actions:**
  - "Login" → `/login`
  - "Get Started" / "Become a Volunteer" → `/register`
  - "Report Emergency" → `/sos`
  - In-page anchors: `#features`, `#about`, `#contact`.

---

## `/login` — Operator Login

- **User inputs:**
  - `email` (email, required) — official email address.
  - `password` (password, required).
  - `remember` (checkbox, optional) — "remember this terminal for 12 hours".
- **Data inputs:** none on load.
- **Actions:**
  - Submit → authenticate, then redirect to the role's dashboard.
  - "Microsoft SSO" / "Agency ID" → SSO providers.
  - "Reset access?" → password reset flow.
  - "Register New Entity" → `/register`.

---

## `/register` — Account Registration

- **User inputs (all roles):**
  - `role` (toggle: `victim` | `volunteer`, required).
  - `fullName` (text, required).
  - `email` (email, required).
  - `phone` (tel, required).
  - `location` (text, required) — primary location.
  - `password` (password, required).
  - `confirmPassword` (password, required, must match `password`).
  - `acceptTerms` (checkbox, required).
- **User inputs (volunteer only):**
  - `skills` (multi-select: Medical, Logistics, Search & Rescue, Technical/IT,
    Language Support).
  - `availability` (radio: `immediate` | `weekends` | `remote`).
- **Actions:** Submit → create account → email verification → redirect to login.

---

## `/sos` — Emergency SOS Submission

- **User inputs:**
  - `location` (text, required) — auto-detected (GPS) with manual "Update".
  - `disasterType` (select, required): Flood, Earthquake, Wildfire, Medical
    Emergency, Structural Failure, Severe Storm.
  - `peopleAffected` (number, required, min 1).
  - `severity` (range 1–5, default 4) — Minor → Catastrophic.
  - `description` (textarea, optional) — hazards / special needs.
  - `photo` (file, optional, image, max 10MB).
- **Data inputs:**
  - `recentRequests[]` — `{ id, type, status, submittedAt, location }`.
  - `statusTimeline[]` — `{ title, detail, time }` for the active request.
  - `commandContacts[]` — `{ name, subtitle, phone }`.
  - `estimatedPriority` (computed server-side from the form).
- **Actions:** Submit → broadcast SOS with geo-coordinates → show dispatch
  confirmation. "Update" → re-fetch GPS location.

---

## `/victim-dashboard` — Victim Dashboard

- **User inputs:** `search` (text); "Update Status" (opens status form);
  "Check-In".
- **Data inputs:**
  - `safetyStatus` — `{ state: "Safe"|..., verified: bool, lastCheckIn }`.
  - `assignedResponder` — `{ name, role, photo, online, etaMinutes, phone }`.
  - `nearbyShelters[]` — `{ name, distance, capacityPct }`.
  - `currentLocation` (lat/lng + address) + active hazard zones for the map.
  - `recentRequests[]` — `{ type, status, requestedAt, ref, eta }`.
  - `quickDialContacts[]` — `{ label, value/phone }`.
  - `liveUpdates[]` — ticker messages.
- **Actions:** Update Status, New Request, call responder, floating SOS → `/sos`.

---

## `/volunteer-dashboard` — Volunteer Dashboard

- **User inputs:**
  - `availability` (toggle: Active Duty / Off Duty).
  - `search` (text).
- **Data inputs:**
  - `stats` — `{ assignedMissions, completedTasks, resourcesAssigned }`.
  - `activeMissions[]` — `{ title, desc, location, priority:
    emergency|high|normal, action: accept|complete }`.
  - `activityTimeline[]` — `{ time, title, body }`.
  - `regionalStats` — `{ totalRescues, mealsServed, efficiency }`.
- **Actions:** toggle availability, Accept/Complete mission, New Request,
  Export Report.

---

## `/shelter-dashboard` — Shelter Management

- **User inputs:** `search` (text); "Status Update"; "Export Report"; resident
  filter/sort; table pagination (Prev/Next).
- **Data inputs:**
  - `kpis` — `{ totalCapacity, occupied, availableBeds, medicalKits,
    foodStock, waterStock }` (+ trend/low flags).
  - `residents[]` — `{ name, id, status: Verified|Processing, room, entryDate,
    specialNeeds }` (+ total count for pagination).
  - `occupancyByWing[]` — `{ wing, current, total, pct }`.
  - `criticalInventory[]` — `{ item, statusLabel, level }`.
  - `shelterDetails` — `{ address, manager, phone, threatLevel, threatNote }`.
  - `emergencyHotline[]` — `{ label, number }`.
  - `mapLocation`, `safePathLabel`.
- **Actions:** Status Update, Export, New Dispatch, dismiss sync toast.

---

## `/profile` — Profile Management

- **User inputs:**
  - Change password: `currentPassword`, `newPassword`.
  - Notification toggles: `emailAlerts` (bool), `smsAlerts` (bool),
    `pushNotifications` (bool).
  - "Edit Profile" (opens an editable form of the details below).
- **Data inputs:**
  - `profile` — `{ name, role, avatar, bio, status, operatorId }`.
  - `personalDetails` — `{ legalName, email, phone, languages }`.
  - `emergencyContact` — `{ name, relationship, phone }`.
  - `roleData` — `{ organization, accessTier, skills[] }`.
  - `recentActivities[]` — `{ icon, title, desc, meta }`.
  - `deployment` — `{ assignment, homeBase, deploymentDate, mapLocation }`.
- **Actions:** Edit Profile, Export ID, Update Security, toggle notifications.

---

## `/missing-persons` — Missing Persons Database

- **User inputs:**
  - `search` (text) — name, ID, or last known location.
  - `statusFilter` (chips: All | Missing | Found | Verified).
  - "Report Missing Person" form: `name`, `age`, `photo`, `lastKnownLocation`,
    `lastSeenAt`, `status`, optional `description`.
- **Data inputs:**
  - `stats` — `{ totalReported, currentlyMissing, foundSafe, identityPending }`.
  - `cases[]` — `{ name, age, status: Missing|Found, location, lastSeen/located,
    photo }`.
  - `hotzones[]` — map markers `{ lat, lng, label, count, type }`.
  - `realtimeUpdates[]` — `{ type, title, desc, time }`.
- **Actions:** Report Missing Person, Details/View Location/Urgent Alert, share,
  Expand Map, View All Logs.

---

## `/distribution` — Relief Distribution

- **User inputs:** `search` (text) — distribution IDs / recipients; "Generate QR
  Code"; QR scan (camera).
- **Data inputs:**
  - `kpis` — `{ pendingDistributions (+highPriority), completedDistributions
    (+trend), todaysDeliveries (+target) }`.
  - scanning a recipient QR resolves their distribution batch.
- **Actions:** Generate QR, scan pickup QR, Emergency Alert → `/sos`.

---

## `/donations` — Donation Management

- **User inputs:**
  - `search` (text) — transactions, donors, or aid types.
  - "New Disbursement" form: `recipient`, `assetType` (Funds/Medical/Food/...),
    `amount`/`quantity`, `notes`.
  - "Record New Donation" (FAB): `donor`, `donorType`, `assetType`,
    `amount`/`quantity`.
  - `trendRange` (select: Last 30 Days | Last Quarter); ledger filter/export;
    pagination.
- **Data inputs:**
  - `kpis` — `{ totalFundInflow (+trend%), foodRations (+daysLeft), traumaKits
    (+status), monthlyTarget (+pctToGoal) }`.
  - `influxTrend[]` — per-day donation volume (bar chart).
  - `aidDeployment` — `{ deployedPct, inField, inWarehouse }`.
  - `ledger[]` — `{ donor, donorType, date, assetType, amount/qty, status:
    Processed|In-Transit|Distributed }` (+ total count for pagination).
  - `topContributors[]` — `{ name, org, amount, rank, avatar }`.
- **Actions:** New Disbursement, Record New Donation (FAB), filter/export ledger,
  View Leaderboard, Emergency Broadcast → `/sos`.

---

## `/inventory` — Inventory Management

- **User inputs:**
  - `search` (text) — by name or ID; Filter; Export.
  - Add / Edit Resource modal: `itemName` (text), `category` (select:
    Food/Water/Medical/Shelter), `unitType` (text), `currentStock` (number),
    `minimumLevel` (number), `warehouseLocation` (text).
- **Data inputs:**
  - `summary` — per-category totals `{ food, water, medicines, blankets,
    medicalKits }` with trend % and status (stable/critical).
  - `items[]` — `{ name, id, category, currentStock, minimumLevel, location,
    pct, status: healthy|low|critical }` (+ total count for pagination).
- **Actions:** Add Resource (opens modal), Edit item (opens modal, Esc/backdrop
  closes), Update Resource, Filter, Export, paginate.

---

## `/admin-dashboard` — Admin Command Center

> Also serves as the analytics/"Analyze" view.

- **User inputs:** `search` (text); `dateRange` (select: Last 30 Days | ...);
  chart toggle (AREA | LINE); "Export Report".
- **Data inputs:**
  - `kpis` — `{ responseTime (+trend), avgResolution (+trend), peopleHelped
    (+today), resourcesDistributed (+quotaPct) }`.
  - `dailySos[]` — time series for the trend chart.
  - `sosByDisaster[]` — `{ label, pct }` (Flood/Earthquake/Medical/Fire).
  - `volunteerHours[]` — `{ sector, hours, pct }`.
  - `shelterOccupancy[]` — `{ zone, occupiedPct }`.
  - `resourceDrift` — multi-series (water/meds/food) + projected depletion.
  - `funding` — `{ targetSeries, actualSeries, progressPct }`.
  - `opsLog[]` — `{ status, incident, location, team, priority(1–3), time }`.
- **Actions:** change date range, toggle chart type, Export Report.

---

## `/map` — Live Operations Map

> Real interactive map via **react-leaflet + OpenStreetMap** (free, no API key).
> Component: `src/app/components/LeafletMap.tsx`, loaded with `next/dynamic`
> (`ssr: false`). Marker coords are sample data — wire to a real feed/API.

- **User inputs:** `search` (text — not yet wired to the map); `layers` (chips:
  All | SOS | Shelters | Resources | Missing — **filters markers live**);
  pan / zoom (Leaflet).
- **Data inputs:**
  - `markers[]` — `{ lat, lng, type: sos|shelter|resource|missing, label }`.
  - `incidents[]` — `{ type, title, location, time }` for the live panel.
  - viewport center / default zoom.
- **Actions:** filter layers, zoom in/out, click marker → popup, View All
  Incidents → `/missing-persons`, Report Emergency → `/sos`.

---

## Cross-cutting notes

- **Auth/role:** after login, route the user to their dashboard
  (victim/volunteer/admin/shelter) based on `role`.
- **Shared nav:** sidebars link to `/sos`, `/shelter-dashboard`, `/profile`,
  `/missing-persons`, `/distribution`; unbuilt destinations currently point to
  `#`.
- **Images:** profile/case photos currently use external placeholder URLs —
  replace with uploaded/CDN images.
- **All forms** are currently front-end only (no submit handler posts to an API
  yet); wire them to the backend when endpoints exist.
