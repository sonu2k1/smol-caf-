# Phases.md — Development Roadmap for smol café POS

Solo-dev roadmap. Each phase ships something testable at the actual cafe. Roles are layered in roughly in the order they block each other (menu → orders → kitchen → inventory → analytics/admin).

> **Updated to reflect completed deliverables:** Stack finalized as Next.js 15 + Supabase (Postgres Mumbai), real 59-item master menu seeded, atomic order transactions with price re-validation and stock reservation, live tablet KDS, running bill with cash/online Razorpay settlement, webhook deduplication, append-only inventory ledger, optional customer OTP accounts with 24h order claiming, append-only loyalty rewards system, and admin rewards manager.

---

## Phase 0 — Setup ✅ [COMPLETED]

- [x] Initialize Next.js 15 project (App Router, TypeScript, Tailwind CSS workspaces: `apps/web`, `packages/db`, `packages/ui`), folder structure, ESLint/Prettier
- [x] Set up **Supabase (Postgres, ap-south-1 Mumbai)** as the database with transactional correctness
- [x] Core schema first: `locations`, `dining_tables`, `table_qr_tokens`, `table_sessions`, `menu_categories`, `menu_items`, `menu_item_versions`, `menu_prices`, `orders`, `order_items`, `order_status_history`, `bills`, `payment_attempts` — money columns as integer paise, never decimal
- [x] Auth system + role model (`super_admin`, `admin`, `cashier`, `kitchen`, `chef`) via Supabase Auth + RLS — deny by default, customer session-isolation
- [x] **Deliverable:** Empty, role-aware app deployed and reachable on phone browser

---

## Phase 1 — Menu & QR (Admin & Customer) ✅ [COMPLETED]

- [x] **Import the real menu**: V0.8 master menu (59 items across 13 categories) seeded into `menu_items`/`menu_prices` with JSONB metadata (dietary, spice, pairing tags) via idempotent Node.js seed script
- [x] Generate QR code flow linking to `/t/[tableToken]` — resolves to a table session, creates signed HMAC session cookie
- [x] Public customer menu view (`/menu`) — grouped by category, sticky pill navigation, paise-to-₹ pricing, search, veg-only filter, and item detail modal with pairings
- [x] Manual 86 (sold-out) overrides and status toggles
- [x] **Deliverable:** Customers can scan table QR and browse the real 59-item menu live with 0 login friction

---

## Phase 2 — Order Taking, Billing & Payments ✅ [COMPLETED]

- [x] Ephemeral client cart state (`CartContext`, `CartDrawer`)
- [x] Checkout & **`submit_order` PL/pgSQL Atomic Transaction**: re-validates price and stock at submit time, generates sequential `order_no`, snapshots prices, and handles 409 diffs
- [x] Client UUID idempotency key preventing double-tap duplicate orders
- [x] Customer Running Bill (`/bill`): round-by-round breakdown and "Request Bill" staff alert
- [x] Staff Cashier POS (`/cashier`): live table cards, cash tender input, change due calculator, and atomic `record_cash_payment` RPC session closure
- [x] **Razorpay Online Checkout**: 4-stage idempotency, pre-checkout `PENDING` logging, client key isolation, and server-side HMAC SHA-256 signature verification
- [x] **Razorpay Webhooks (`/api/webhooks/razorpay`)**: Raw body HMAC verification, `webhook_events` table deduplication (`provider_event_id UNIQUE`), net paid aggregation, out-of-order state guard, and automated test suite (`npm run test:webhook`)
- [x] **Deliverable:** End-to-end order placement, cash/online settlement, and automated webhook lifecycle

---

## Phase 3 — Kitchen Display System (KDS) ✅ [COMPLETED]

- [x] Orders appear in Kitchen queue automatically at `/kitchen`
- [x] 4 live Kanban columns: `NEW`, `ACCEPTED`, `PREPARING`, `READY`
- [x] 3-second live polling with audio chime and color-coded urgency timers (🟢 `<5m`, 🟡 `5–10m`, 🔴 `>10m`)
- [x] Concurrency conflict protection & 48px+ tablet touch target transition buttons
- [x] Customer live order status tracking (`/orders` & `/order-status`) with 4s polling and 5-step visual stepper (`SUBMITTED` ➔ `ACCEPTED` ➔ `PREPARING` ➔ `READY` ➔ `SERVED`)
- [x] **Deliverable:** Kitchen staff tracks and updates tickets digitally without paper chits; customers see live order progress

---

## Phase 4 — Chef Inventory & Shelf Life Engine ✅ [COMPLETED]

- [x] Inventory Schema: `units`, `ingredients`, `recipes`, `recipe_components`, `inventory_movements` (append-only ledger: `RECEIVE`, `RESERVE`, `RELEASE`, `CONSUME`, `WASTE`, `ADJUST`)
- [x] `servable_qty(menu_item_id)` stored function: computes component bottleneck with manual 86 precedence
- [x] Atomic stock reservation on order submission in `submit_order`
- [x] Kitchen stock consumption on "Start Preparing" and auto-release on cancellation
- [x] **Deliverable:** Automated stock tracking and bottleneck-aware auto-86 calculation

---

## Customer Accounts, Loyalty & Rewards Subsystem ✅ [COMPLETED]

- [x] Optional Customer Accounts: `profiles` table, phone/email Supabase OTP auth, 100% zero-friction anonymous guest dining preserved
- [x] 24-Hour Order Claiming Engine: `claim_session_orders` RPC linking guest table sessions to user accounts
- [x] Append-Only Loyalty Ledger: `loyalty_accounts`, `loyalty_ledger`, and row-locked `record_loyalty_movement` atomic balance-recompute transaction
- [x] Earn points on bill capture (1 pt per ₹10) and proportional refund reversals
- [x] Rewards Catalog: `rewards`, `reward_redemptions`, server-side atomic discount calculation and points debit in `submit_order`
- [x] Admin Rewards Manager Dashboard (`/admin/rewards`): create, edit, and toggle rewards
- [x] Customer Profile Dashboard (`/profile`): points balance, live table claim banner, claimed orders history, and digital receipts

---

## Phase 5 — Super Admin: Analytics & User Management ⏳ [NEXT UP]

- [ ] Graphical dashboards: sales trends, top items, payment split, revenue by range
- [ ] User management: add/remove/deactivate staff accounts, assign roles (`super_admin`, `admin`, `cashier`, `kitchen`, `chef`)
- [ ] **Deliverable:** Owner can see business performance and manage staff access from one place

---

## Phase 6 — Order History & Reports ⏳ [UPCOMING]

- [ ] Cashier: today's order history & daily shift reconciliation
- [ ] Admin: full order history with filters (date, status, payment method, customer)
- [ ] Immutable receipt lookups (guaranteed by price/name snapshots)
- [ ] **Deliverable:** Look up any past order/bill with complete audit trail

---

## Phase 7 — Polish & Hardening ⏳ [UPCOMING]

- [ ] Mobile UI polish per role (touch targets, tablet optimization)
- [ ] End-to-end device testing on real phones/tablets at the café
- [ ] Production security audit: rate limiting, environment variable check
- [ ] **Deliverable:** Production-ready v1 for daily multi-role café operations
