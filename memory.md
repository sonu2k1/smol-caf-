# Memory.md — Living Project Context (smol café POS)

> Purpose: single source of truth for "where the project currently stands." Update at the end of every work session so any AI assistant (or future-you) can pick up context instantly.

## Project Summary

Multi-role POS + operations system for **smol café** (Rishikesh). Covers: QR-based digital menu (Admin), order taking + billing (Cashier), live kitchen order queue (Kitchen), inventory + shelf-life tracking (Chef), analytics + staff management (Super Admin), and a public read-only menu for Customers. Built solo.

## Roles (see rules.md §2 for permissions detail)

- **Super Admin** — analytics dashboards, user add/delete
- **Admin** — QR menu creation/editing (daily menu updates)
- **Cashier** — order taking, billing, receipts
- **Kitchen** — order queue, status: received → started → preparing → ready
- **Chef** — inventory, shelf-life tracking per item
- **Customer** — no login, public QR menu view + receipt at counter pay

## Tech Stack (locked — see rules.md)

- Frontend: React + Next.js (App Router)
- Backend: Next.js API routes / Server Actions on Supabase — no separate Express server
- Database: **Postgres via Supabase** (ap-south-1 Mumbai) — SQL-vs-Mongo TODO is closed
- Auth: Supabase Auth + RLS as a second layer alongside server-side role checks
- Styling: Tailwind CSS

## ⚠️ Known Gap — LocalStorage prototype vs. locked stack

The current build (see "Current Status" below) uses a **LocalStorage-backed mock DB**, not Supabase/Postgres. That was fine for a fast UI prototype, but it cannot support what `rules.md` now requires: server-side price recalculation, idempotent order creation, RLS-enforced role checks, or historical price snapshots — none of that is possible without a real server + database. Before Phase 1 (order taking/billing) is trusted with real money at the café, the LocalStorage mock needs to be replaced with the real Supabase schema (see `smol-cafe-vibe-coding-build-guide.md` Phase 0). Treat the current "Phase 0-7 Complete" status as a **UI/UX prototype milestone**, not a production-ready milestone, until this migration happens.

## Brand

Built for the real smol café brand (brand kit v1.0, Aug 2026): café crème / smol cherry / espresso ink core palette, EB Garamond + Inter + Noto Sans Mono typography, day/night identity duality, warm-low-pressure voice. Full detail in `design.md`.

## Reference Docs

- `prd.md` — roles, features per role, order flow, scope
- `rules.md` — coding conventions, role/permissions model, API/security rules
- `phases.md` — roadmap, current phase tracked below
- `design.md` — smol café brand system applied to the app, per-role screen patterns
- `smol-cafe-vibe-coding-build-guide.md` — copy-paste build prompts, phase-aligned with phases.md
- `menu-seed-master.csv` — real 59-item menu (smol café V0.8 workbook), seed source for `menu_items`

## Current Status

- **UI/UX prototype:** All 6 roles implemented (Customer Menu, Cashier POS, Kitchen Queue, Chef Inventory, Admin Menu/QR, Super Admin Analytics) on Next.js App Router + TypeScript + Tailwind, running on local dev server (`http://localhost:3000`) with a LocalStorage-backed mock DB.
- **Not yet done:** real Supabase/Postgres backend, real menu import (real 59 items are ready as CSV but not yet seeded into any real DB), server-side billing safety (price recalculation, idempotency), RLS/role enforcement server-side.
- **Last updated:** 2026-08-23

## Key Decisions Log

| Date       | Decision                                                                                          | Why                                                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 2026-08-13 | Chose React/Next.js + Node.js + SQL/Mongo                                                         | Developer's preferred/familiar stack                                                                                      |
| 2026-08-13 | Solo build, mobile web (not native app)                                                           | Faster to ship, no app store friction                                                                                     |
| 2026-08-13 | Adopted smol café brand kit for design.md                                                         | App is for a real café with an existing brand identity                                                                    |
| 2026-08-14 | Expanded to 6 roles (Super Admin, Admin, Cashier, Kitchen, Chef, Customer)                        | Café needs full ops coverage, not just billing                                                                            |
| 2026-08-14 | Built Next.js App Router with TypeScript & Tailwind CSS                                           | Full production quality, typed, responsive mobile design                                                                  |
| 2026-08-14 | Built local reactive DB service with LocalStorage sync                                            | Fast, zero-setup, persistent data for all 6 roles — prototype only, see Known Gap above                                   |
| 2026-08-23 | Finalized DB choice: Postgres via Supabase (closes the SQL/Mongo TODO)                            | Order/billing needs real multi-table transactions; Supabase also gives Auth + RLS + Realtime without a separate backend   |
| 2026-08-23 | Adopted server-side price recalculation + idempotency keys for order/checkout                     | Prevent double-billing and stale-price charges — only possible with a real backend, not LocalStorage                      |
| 2026-08-23 | Real menu (59 items, V0.8 workbook) exported to `menu-seed-master.csv` as the v1 seed source      | Menu should be data seeded into DB, never hardcoded or re-read from the spreadsheet at runtime                            |
| 2026-08-23 | Set up clean Next.js 15 + TypeScript monorepo (`apps/web`, `packages/db`, `packages/ui`)          | Phase 0 Step 0.1 scaffolding with Tailwind CSS, ESLint, Prettier, and npm workspaces                                      |
| 2026-08-23 | Set up Supabase SSR & Browser clients + packages/db migrations tooling                            | Phase 0 Step 0.2 Supabase connection scaffolding with typed SSR/Client/Admin clients and CLI config                       |
| 2026-08-23 | Created Core Postgres Schema migration for 13 money-critical tables                               | Phase 0 Step 0.3: integer paise pricing, status enums, partial unique table session index, immutable snapshots            |
| 2026-08-23 | Configured Supabase RLS policies across 13 core tables with customer session isolation & RBAC     | Phase 0 Step 0.4: Deny-by-default, customer table_session_id claim scoping, staff roles (admin, cashier, kitchen, chef)   |
| 2026-08-23 | Built idempotent Menu CSV seed script (`packages/db/scripts/seed-menu.ts`) with dry-run/apply     | Imports 59 menu items into 13 categories with integer paise pricing, status mapping, and JSONB metadata enrichment        |
| 2026-08-23 | Built QR entry route (`/t/[tableToken]`) & table session flow with signed session cookies         | Phase 1 Step 1.1: Server Action token resolution, single open table_session management, and invalid QR fallback screens   |
| 2026-08-23 | Built mobile-first Menu Browsing page (`/menu`) with sticky category nav & item detail modal      | Phase 1 Step 1.2: Direct Supabase join queries (categories + items + prices + versions), dietary badges, pairing preview  |
| 2026-08-23 | Built atomic Cart & Order Submission pipeline with PL/pgSQL transaction and anti-double-tap       | Phase 1 Step 1.3: submit_order RPC with price re-validation, session checks, order_no locking, and price snapshots        |
| 2026-08-23 | Built Customer Order Status Tracking (`/orders`) with 4-second polling & 5-step progress bar      | Phase 1 Step 1.4: Submitted -> Accepted -> Preparing -> Ready -> Served status matrix with plain-language brand copy      |
| 2026-08-23 | Built Kitchen Ticket Board (KDS at `/kitchen`) with 4 columns, 3s polling & concurrency safe      | Phase 1 Step 1.5: Tablet-optimized 44px+ buttons, live urgency timers (<5m, 5-10m, >10m), audit history, optimistic UI    |
| 2026-08-23 | Built Running Bill (`/bill`), 'Request Bill' action, & Staff Cash Settlement POS (`/cashier`)     | Phase 1 Step 1.6: record_cash_payment atomic RPC, tender/change calculator, table_session closure, and mutation locking   |
| 2026-08-23 | Integrated Razorpay Online Payments with 4-stage idempotency & server HMAC verification           | Pre-checkout PENDING attempt logging, client key isolation, HMAC SHA-256 constant-time signature verification & closure   |
| 2026-08-23 | Built Razorpay Webhook Endpoint (`/api/webhooks/razorpay`) with Dedupe & Out-of-Order Safety      | `webhook_events` provider_event_id UNIQUE deduplication, net paid calculation, and AUTHORIZED -> CAPTURED state guard     |
| 2026-08-23 | Built Inventory Tables, Recipes & `servable_qty()` with Auto-Reservation and Manual 86 Engine     | `inventory_movements` ledger, atomic stock reservation in `submit_order`, release/consume on prep, and 86 precedence      |
| 2026-08-23 | Built Optional Customer Accounts, OTP Auth & 24h Order Claiming Engine (`/profile`)               | `profiles` table, Supabase OTP auth, 24h `claim_session_orders` RPC, zero-friction anonymous guest ordering preserved     |
| 2026-08-23 | Built Append-Only Loyalty Ledger & Atomic Balance Recomputation Engine (`loyalty_ledger`)         | Row-locked `record_loyalty_movement` RPC, `current_balance_cached` derived from ledger, EARN on capture & refund REVERSAL |
| 2026-08-23 | Built Rewards Catalog, Atomic Cart Redemption & Admin CRUD Dashboard (`/admin/rewards`)           | `rewards` & `reward_redemptions`, server-side discount & points debit in `submit_order`, and Admin rewards manager        |
| 2026-08-23 | Built Admin-Editable Blackboard Daily Specials (`/admin/blackboard`) & Home Widget (`/`)          | `blackboard_posts` table with time scheduling (`starts_at`/`ends_at`), chalk-aesthetic widget, and graceful fallback      |
| 2026-08-23 | Built Smol Café Community Events ("What's On") & Lightweight RSVPs (`/admin/events`)              | `cafe_events` & `event_rsvps` tables, capacity tracking, 1-tap interest registration, and Home What's On card             |
| 2026-08-23 | Built Smol Café Jukebox — Request & Voting Subsystem (`/music` & `/admin/music`)                  | `music_sessions`, `song_requests`, `song_votes` tables, 15m rate-limiting, 1 vote/table dedupe, Staff DJ controller       |
| 2026-08-23 | Built Conversation Prompt Deck Modal & Kitchen-Load-Aware "Another Round" Suggestions (`/orders`) | 15 prompt card deck, metadata pairings upsell, and automatic suppression if active kitchen tickets > 5                    |
| 2026-08-23 | Built Basic Procurement & Goods Receipt Engine (`/admin/procurement`)                             | `vendors`, `purchase_orders`, `goods_receipts`, PO never touches stock, atomic `RECEIVE` movement on GRN only             |
| 2026-08-23 | Built Procurement Budget vs Actual & Vendor Spend Analytics (`/admin/budgets`)                   | `budgets` table with month/category allocation, live actual spend from GRNs with drill-down, supplier audit & price trends|

## Next Steps

1. Migrate off the LocalStorage mock DB — stand up the real Supabase project (Phase 0 of the build guide)
2. Import `menu-seed-master.csv` into `menu_items`/`menu_prices` (dry-run, then apply)
3. Rebuild Cashier checkout against the real DB with server-side recalculation + idempotency (Phase 2)
4. Re-point Kitchen/Chef/Admin/Super Admin screens from LocalStorage to real Supabase queries, role by role
5. Production deployment (Vercel)
6. Thermal printer integration / KOT hardware (Phase 8 stretch goal)

---

_Update this file after each session: what got built, what changed, what's next._
