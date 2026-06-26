# ResQNest — Frontend

The frontend for **ResQNest**, a mission-critical disaster management platform
for coordinating emergency response, tracking logistics, and connecting victims,
volunteers, shelters, and admins.

## Tech Stack

- **[Next.js 16](https://nextjs.org)** (App Router, Turbopack)
- **React 19** (React Compiler enabled)
- **TypeScript**
- **Tailwind CSS v4** (configured via `@theme` tokens in `src/app/globals.css`)
- Fonts: **Inter** + **JetBrains Mono** (`next/font`), **Material Symbols** icons
- **Leaflet** + **react-leaflet** (OpenStreetMap) for the `/map` page — loaded
  client-side via `next/dynamic` (`ssr: false`) from `src/app/components/`

## Getting Started

```bash
cd frontend/resqnest
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Routes

| URL                | Page                 | Component                          |
| ------------------ | -------------------- | ---------------------------------- |
| `/`                | Landing page         | `src/app/Pages/landing.tsx`        |
| `/login`           | Operator login       | `src/app/Pages/login.tsx`          |
| `/register`        | Account registration | `src/app/Pages/register.tsx`       |
| `/sos`                | Emergency SOS form  | `src/app/Pages/sos.tsx`                |
| `/victim-dashboard`   | Victim dashboard    | `src/app/Pages/victimDashboard.tsx`    |
| `/volunteer-dashboard`| Volunteer dashboard | `src/app/Pages/volunteerDashboard.tsx` |
| `/shelter-dashboard`  | Shelter management  | `src/app/Pages/shelterDashboard.tsx`   |
| `/profile`            | Profile management  | `src/app/Pages/profile.tsx`            |
| `/missing-persons`    | Missing persons db  | `src/app/Pages/missingPersons.tsx`     |
| `/distribution`       | Relief distribution | `src/app/Pages/distribution.tsx`       |
| `/donations`          | Donation management | `src/app/Pages/donations.tsx`          |
| `/inventory`          | Inventory management| `src/app/Pages/inventory.tsx`          |
| `/admin-dashboard`    | Admin command center| `src/app/Pages/adminDashboard.tsx`     |
| `/map`                | Live operations map | `src/app/Pages/map.tsx`                |

## Project Structure & Conventions

All page components live in one common folder — **`src/app/Pages/`** — and each
URL is wired up with a tiny route file under `src/app/<route>/page.tsx` that
re-exports the component.

```
src/app/
├── Pages/            # all page components live here
│   ├── landing.tsx
│   ├── login.tsx
│   └── register.tsx
├── login/page.tsx    # route → export { default } from "@/app/Pages/login";
├── register/page.tsx # route → export { default } from "@/app/Pages/register";
├── page.tsx          # route "/" → re-exports Pages/landing
├── layout.tsx        # fonts, metadata, Material Symbols
└── globals.css       # Tailwind v4 design tokens + animations
```

> **Why:** Next.js App Router only creates a URL when a folder contains a
> `page.tsx`. The wrapper pattern keeps every page's code in one `Pages/` folder
> while still producing real routes.

### Adding a new page

1. Create the component in `src/app/Pages/<name>.tsx` with a default export:
   ```tsx
   export default function MissingPersonPage() { /* ... */ }
   ```
   Add `"use client";` at the top if it uses state, effects, or event handlers.
2. Create the route wrapper `src/app/<route>/page.tsx`:
   ```tsx
   export { default } from "@/app/Pages/<name>";
   ```
   Example: `Pages/sos.tsx` + `src/app/sos/page.tsx` → live at `/sos`.

### Design system

Use the shared tokens from `globals.css` so pages stay consistent:

- **Colors:** `primary`, `primary-container`, `secondary`, `surface`,
  `on-surface`, `on-surface-variant`, `outline-variant`, etc.
- **Type scale:** `text-display-lg`, `text-headline-lg`, `text-body-md`,
  `text-label-md`, … (paired with matching `font-*` families).
- **Spacing:** `margin-mobile`, `margin-desktop`, `stack-sm/md/lg`, `gutter`.
- **Helpers:** `.glass-card`, `.glass-panel`, `.shimmer-bg`, `.animate-float`,
  `.animate-emergency`, `.material-symbols-outlined`.

## Pages roadmap

Done: Landing, Login, Register, SOS, VictimDashboard, VolunteerDashboard,
ShelterDashboard, Profile, MissingPersons, Distribution, Donations, Inventory,
AdminDashboard (doubles as the analytics/Analyze view), Map. All pages from the
original list are now built.
