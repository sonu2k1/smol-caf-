# Phases.md — Development Roadmap for smol café POS

Solo-dev roadmap. Each phase ships something testable at the actual cafe. Roles are layered in roughly in the order they block each other (menu → orders → kitchen → inventory → analytics/admin).

## Phase 0 — Setup
- Initialize Next.js project, folder structure, ESLint/Prettier
- Set up Node.js backend + database (finalize SQL vs Mongo first)
- Auth system + role model (super_admin, admin, cashier, kitchen, chef)
- Deploy pipeline (Vercel + Railway/Render or similar)
- **Deliverable:** Empty, role-aware app deployed and reachable on phone browser

## Phase 1 — Menu & QR (Admin)
- Admin: CRUD menu items, categories, daily availability/sold-out toggle
- Generate QR code linking to public digital menu route
- Public customer menu view (smol café branded, read-only, no login)
- **Deliverable:** Admin can manage the full menu; customers can scan and browse it live

## Phase 2 — Order Taking & Billing (Cashier)
- Cashier: browse menu, build cart, order type
- Checkout: discount/tax, payment method, server-side total recalculation
- Receipt generation (on-screen + print-friendly) for counter pay
- **Deliverable:** Cashier can take a full order and bill a customer end-to-end

## Phase 3 — Kitchen Queue
- Orders placed by cashier appear in Kitchen queue automatically
- Kitchen: status buttons — received → started → preparing → ready
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
- **Deliverable:** Any completed order can be looked up and reviewed

## Phase 7 — Polish & Hardening
- Mobile UI polish per role (touch targets, one-handed cashier/kitchen use)
- Error/loading/empty states everywhere, in-brand voice
- Full manual QA pass across all 5 roles on real phones at the cafe
- **Deliverable:** Production-ready v1 for daily multi-role use

## Phase 8 — Stretch Goals (post-v1)
- WebSocket-based instant kitchen updates (if polling feels laggy)
- Online ordering via QR (not just menu-viewing)
- Batch-level shelf-life tracking (per delivery, not just per item)
- Thermal printer/KOT integration
- Multi-branch support

## Suggested Working Rhythm
- Build role by role, test each with the actual staff member who'd use it before moving on
- Update `memory.md` at the end of every phase with what's done/what's next
- Kitchen and Chef phases (3 & 4) can be reordered/parallelized if one matters more urgently at launch
