# SCCHub — Supply Chain Collaboration Hub (UI Prototype)

SCCHub is a concept for a collaboration layer **above SAP** that brings material requirements, stock, purchase orders, call-offs, supplier confirmations, ETAs and exceptions into role-specific views, plus one shared **Integrated Overview**.

This repository contains an academic **clickable UI prototype**. It uses dummy data only — there is no backend, no real authentication and **no SAP connection**.

## Features

- **Demo login** with 8 accounts (no passwords; simulated session in the browser)
- **8 role-specific dashboards**, each with its own layout and priorities:

  | Role | Focus |
  |---|---|
  | Sales & Marketing | Promo/NPD calendar, forecast uplift, material readiness per product |
  | Material & Inventory Planner | Material alignment, shortage visibility, 14-day need vs. supply |
  | PPIC | Production schedule timeline, affected batches, replan decision |
  | Warehouse RM/PM | Arrival calendar, receiving queue, quality holds, stock position |
  | Procurement | PO pipeline, supplier commitment queue, ETA slips, *Usulan PO* |
  | SC Manager | On-time delivery KPI, PO at risk, escalations, exception aging |
  | Admin | Simulated integration status, data quality, alert rules A1–A6, accounts |
  | Supplier | Separate simplified portal: own orders, confirmation form, 12-week indicative projection |

- **Integrated Overview** — read-only, end-to-end view (demand → requirement → stock → PO → call-off → confirmation → ETA → exception) with material, supplier and period filters. Available to the 7 internal roles only.
- **Role-based navigation** following a role × menu access matrix; the supplier is redirected away from internal routes.
- **Consistent dummy data** from a single typed source. Main scenario: *Packaging Box M-100234* — need 50,000, on-hand 5,000, PO-04567 for 40,000; Supplier A confirms 30,000 with a 3-day ETA slip → 35,000 secured, **15,000 shortage**.
- Status vocabulary: `Aman` / `Waspada` / `Shortage` (materials) and `Terbuka` / `Ditangani` / `Eskalasi` / `Selesai` (exceptions).

> Interactive actions (supplier confirmation, *Usulan PO*, demand change, replan, receipt, threshold edits) are **local simulations** only and reset on reload. Phase 2 features are shown as labelled previews.

## Tech stack

React · TypeScript · Vite · Tailwind CSS · shadcn/ui (Radix) · Recharts · React Router · lucide-react

## Getting started

Requires Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev      # start dev server at http://localhost:5173
npm run build    # type-check and build to dist/
npm run preview  # serve the production build
npm run lint
```

## Demo walkthrough

1. Open `/login` and choose any demo account.
2. Each internal account lands on its own dashboard at `/dashboard`.
3. Open **Integrated Overview** from the sidebar, or deep-link a material: `/overview?material=M-100234`.
4. Sign in as **Joko (Supplier)** to see the separate portal at `/supplier`. Visiting `/overview` or `/dashboard` redirects back to the portal.
5. Use the profile menu to switch accounts or sign out.

> Route restrictions are UI containment for the demo, not a security boundary.

## Project structure

```
src/
├── data/            # typed dummy data and selectors (single source of truth)
├── lib/             # session, navigation/access matrix, formatting, local demo store
├── components/
│   ├── ui/          # shadcn/ui primitives
│   ├── shell/       # app shell: sidebar, header, alerts, profile menu
│   └── shared/      # status badges, panels, tables, chart helpers, dialogs
└── pages/
    ├── dashboards/  # eight role dashboards
    ├── supplier/    # supplier portal
    └── ...          # Integrated Overview, Material Alignment, Purchase Order, etc.
```

## Disclaimer

All companies, people, materials and figures are fictional and illustrative. Alert thresholds and parameters are dummy values, not calibrated policy. SCCHub is not an ERP and does not replace SAP.
