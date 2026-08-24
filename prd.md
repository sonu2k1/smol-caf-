# PRD — Cafe POS for smol café (Multi-Role System)

## 1. Overview

A mobile-first web-based POS + operations system for **smol café** (Rishikesh), covering the full loop: digital QR menu for customers, order taking and billing at the counter, kitchen order tracking, chef-side inventory/shelf-life management, and owner-level analytics + staff management.

**Owner:** Solo developer
**Platform:** Mobile web app (responsive)
**Stack:** React/Next.js (frontend, App Router) + **Supabase (Postgres, ap-south-1 Mumbai)** for database, auth, and hos/realtime — Node.js/SQL-vs-Mongo decision is closed; going full Supabase gives real transactions (needed for orders/billing) plus Auth/RLS for role-based access without standing up a separate backend.

## 2. Problem Statement

A cafe has several moving parts happening at once — front counter billing, kitchen prep, ingredient freshness, and owner oversight — usually tracked on paper or not tracked at all. This app gives each role (owner, admin, kitchen, chef, customer) exactly the view they need, from one shared system.

## 3. Roles & Users

| Role                  | Who                 | Core Need                                                       |
| --------------------- | ------------------- | --------------------------------------------------------------- |
| **Super Admin**       | Owner               | See business performance at a glance; control who has access    |
| **Admin**             | Manager             | Keep the menu current; manage the QR-based digital menu         |
| **Cashier / Counter** | Front counter staff | Take orders, bill, collect payment, print/show receipt          |
| **Kitchen**           | Kitchen staff       | See what's been ordered, update prep status                     |
| **Chef**              | Kitchen/chef        | Track ingredient stock and shelf life                           |
| **Customer**          | Guest at the cafe   | Browse the menu (via QR), get a receipt after paying at counter |

## 4. Core Features by Role

### 4.1 Super Admin

- **Graphical data representation** — dashboards/charts for sales trends, revenue by day/week/month, top-selling items, payment method split
- **User management** — add/remove staff accounts (Admin, Cashier, Kitchen, Chef), assign roles, deactivate access instantly (e.g. staff who left)
- Full visibility into everything below (Admin + reports)

### 4.2 Admin

- **QR menu creation & editing** — generate a QR code that links to the live digital menu; edit menu items, prices, categories, and daily specials/availability — changes reflect instantly on the QR menu customers scan (no reprinting physical menus)
- Manage categories, item descriptions, images (optional), daily "sold out" toggle
- **Menu launches with real data** — the smol café V0.8 menu workbook (59 items, all categories, target prices) is the v1 seed source, imported once into the database. From that point on, Admin edits the live menu through this CRUD — the workbook is not re-read at runtime.

### 4.3 Cashier / Counter

- Take orders (from walk-in or from what customer showed at counter after browsing QR menu)
- Cart, discount, tax, payment method (Cash/UPI/Card)
- Generate receipt for counter payment
- View today's order history
- **Billing correctness:** the total shown to the customer is recalculated server-side at checkout (not just trusted from the cart UI), and each checkout submission carries a one-time key so a double-tap on "Complete Order" cannot create two bills for the same order.

### 4.4 Kitchen

- **Live order queue** — see incoming orders as they're placed, with items and quantities
- **Order status tracking** — update/show status per order: `received → started → preparing → ready`
- Simple, large-tap status buttons — kitchen staff move fast, hands may be busy
- v1 refreshes the queue by polling every few seconds; no dedicated realtime infrastructure needed at this scale (see Phase 8 in phases.md if it ever feels laggy in practice)

### 4.5 Chef

- **Inventory management** — track ingredients/products (vegetables, dairy, etc.)
- **Shelf-life tracking** — each inventory item shows a shelf-life/expiry indicator (e.g. "vegetable X — 2 days left", colour-coded: fresh / expiring soon / expired)
- Manual stock adjustment (add stock, mark used/wasted)
- Low-stock and expiring-soon alerts

### 4.6 Customer

- **Menu Details** — scan the QR code at the table/counter, view the live digital menu (read-only, no login needed) — smol café branded, matches physical menu design
- **Receipt** — after paying at the counter, customer receives/sees a receipt (digital display or printable) for their order

## 5. Order Flow (end to end)

1. Customer scans QR → views live menu (smol café branded, real 59-item catalogue)
2. Customer tells cashier their order (no online ordering/payment in v1 — payment is at counter)
3. Cashier enters order in POS → server recalculates the total from current menu prices → order sent to **Kitchen queue**
4. Kitchen updates status as it moves: received → started → preparing → ready
5. Cashier completes billing, collects payment, generates receipt for customer — once a receipt is generated, that order's line items and prices are locked (a later menu price change never rewrites a past receipt)
6. Order data flows into Super Admin's analytics automatically

## 6. Non-Functional Requirements

- Mobile-first responsive UI across all roles
- Role-based auth — each role sees only their relevant screens, enforced server-side (not just hidden buttons in the UI)
- Fast load, works on average cafe wifi
- Data persisted reliably — no lost orders, no lost inventory changes
- **No duplicate billing** — a network hiccup or an impatient double-tap at checkout must never create two orders/receipts for the same sale
- **Historical accuracy** — a completed order's item names/prices are a fixed record; editing the live menu afterward must never change what a past receipt shows
- QR menu must load fast on customer's own phone (no login, no app download)

## 7. Out of Scope (v1)

- Native mobile app
- Online ordering/payment via QR (QR is menu-viewing only, not ordering)
- Multi-branch support
- KDS hardware / dedicated kitchen display screens (kitchen view works on any phone/tablet browser for now)
- Customer accounts/loyalty programs
- Automated shelf-life prediction (AI) — v1 is manual entry of expiry/shelf-life per stock batch

## 8. Success Metrics

- Order-to-kitchen-to-ready flow visible in real time with no manual shouting/paper chits
- Chef can spot expiring stock before it's wasted
- Owner can see daily/weekly sales trends without asking anyone
- Staff onboarding/offboarding (add/remove access) takes under 1 minute

## 9. Open Questions

- Does Kitchen and Chef run on separate devices, or one shared kitchen tablet?
- Should "ready" status auto-notify the cashier/counter somehow?
- Shelf-life entry: per batch (each delivery) or per item (single running number)?
- Should customer QR menu support filtering (veg/non-veg, category) or just a simple scroll?

---

_See `phases.md` for the phase-by-phase build order and `smol-cafe-vibe-coding-build-guide.md` for exact prompts — both are scoped to this PRD's cashier-driven v1 (no self-order via QR)._
