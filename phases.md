# Phases.md — Development Roadmap for smol café POS

Solo-dev roadmap. Each phase ships something testable at the actual cafe. Roles are layered in roughly in the order they block each other (menu → orders → kitchen → inventory → analytics/admin).

> **Updated to reflect decisions made since the last version:** stack finalized as Next.js + Supabase (Postgres), the real 59-item menu (V0.8 workbook) has an import path defined, and order/payment logic now follows the money-safety rules from the Production Handover doc (price snapshots, idempotency). See `smol-cafe-vibe-coding-build-guide.md` for the exact copy-paste prompts behind each step below.

## Phase 0 — Setup

- Initialize Next.js project (App Router, TypeScript), folder structure, ESLint/Prettier
- Set up **Supabase (Postgres, ap-south-1 Mumbai)** as the database — SQL vs Mongo decision is closed, going with Postgres for transactional correctness (orders/payments need real transactions)
- Core schema first: locations, dining_tables, menu_categories, menu_items, menu_prices, orders, order_items, bills — money columns as integer paise, never decimal
- Auth system + role model (super_admin, admin, cashier, kitchen, chef) via Supabase Auth + RLS — deny by default, enforce roles server-side (not just hidden buttons)
- Deploy pipeline (Vercel for the app, Supabase hosts the DB — no separate Railway/Render needed if going full Supabase)
- **Deliverable:** Empty, role-aware app deployed and reachable on phone browser

## Phase 1 — Menu & QR (Admin)

- Admin: CRUD menu items, categories, daily availability/sold-out toggle
- **Import the real menu**: the V0.8 workbook's "Master Menu" sheet (59 items) gets seeded into `menu_items`/`menu_prices` via a script — never hand-typed into the UI. Admin CRUD edits the DB from here on; the spreadsheet stays a one-time seed source.
- Generate QR code per table linking to `/t/[tableToken]` — resolves to a table session, not just a static menu link, so later phases (cart, order tracking) can build on it without rework
- Public customer menu view (smol café branded, read-only, no login) — grouped by category, price/description pulled from DB
- **Deliverable:** Admin can manage the full menu; customers can scan and browse the real 59-item menu live

## Phase 2 — Order Taking & Billing (Cashier)

- Cashier: browse menu, build cart, order type
- Checkout: discount/tax, payment method, **server-side total recalculation inside one DB transaction** — re-validate price/availability at submit time, don't trust the client's cart total
- Order submission carries an idempotency key so a double-tap can't create two orders/bills
- Receipt generation (on-screen + print-friendly) for counter pay
- **Deliverable:** Cashier can take a full order and bill a customer end-to-end, with no double-charge or duplicate-order risk

## Phase 3 — Kitchen Queue

- Orders placed by cashier appear in Kitchen queue automatically
- Kitchen: status buttons — received → started → preparing → ready
- Start with **polling (3–5s)**, not WebSockets/Realtime — simpler to ship and debug; upgrade later only if polling feels laggy in practice (see Phase 8)
- Cashier/Admin can see live status of any order
- **Deliverable:** Kitchen staff can track and update every incoming order without paper chits

## Phase 4 — Chef Inventory & Shelf Life

- Chef: add/edit inventory items with quantity, unit, date added, shelf-life
- Auto-derived freshness status (fresh / expiring soon / expired), colour-coded
- Low-stock and expiring-soon flags
- **Deliverable:** Chef has a live view of what needs to be used soon or restocked

## Phase 5 — Super Admin: Analytics & User Management

- Graphical dashboards: sales trends, top items, payment split, revenue by range
- User management: add/remove/deactivate staff accounts, assign roles
- **Deliverable:** Owner can see business performance and manage staff access from one place

## Phase 6 — Order History & Reports (cross-role)

- Cashier: today's order history
- Admin/Super Admin: full order history with filters (date, status, payment method)
- Historical orders always show the price/name that was true at order time, even if the menu changed since — this falls out naturally if Phase 2 snapshots prices correctly
- **Deliverable:** Any completed order can be looked up and reviewed, and old bills never silently change when the menu is edited

## Phase 7 — Polish & Hardening

- Mobile UI polish per role (touch targets, one-handed cashier/kitchen use)
- Error/loading/empty states everywhere, in-brand voice
- Security pass: RBAC enforced server-side everywhere, RLS denies by default, secrets out of the repo, rate limits on order/payment endpoints
- Backup check: confirm Supabase automated backups are on before real customer data starts flowing
- Full manual QA pass across all 5 roles on real phones at the cafe
- **Deliverable:** Production-ready v1 for daily multi-role use

## Phase 8 — Stretch Goals (post-v1)

- Supabase Realtime for instant kitchen updates (replacing polling from Phase 3, if it feels laggy)
- Online ordering via QR (not just menu-viewing) — customer places order directly, not just cashier
- Razorpay online payment (UPI/cards) alongside counter cash
- Batch-level shelf-life tracking (per delivery, not just per item)
- Thermal printer/KOT integration
- Multi-branch support

## Suggested Working Rhythm

- Build role by role, test each with the actual staff member who'd use it before moving on
- Update `memory.md` at the end of every phase with what's done/what's next
- Kitchen and Chef phases (3 & 4) can be reordered/parallelized if one matters more urgently at launch
- For exact copy-paste build prompts per phase, use `smol-cafe-vibe-coding-build-guide.md` alongside this roadmap
