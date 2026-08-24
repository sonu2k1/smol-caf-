# Smol Café — Vibe-Coding Build Guide

A step-by-step plan to build the Smol Café app based on the Production Handover spec (v1.0). Each step has a ready-to-paste prompt. Do them **in order** — don't skip ahead to Phase 3+ features before Phase 0-2 works end to end on a real device.

**Note on stack:** the handover doc recommends Next.js + Supabase (Postgres). Your existing cafe-pos notes had React/Next.js + Node.js + SQL/Mongo. Pick ONE before you start — the prompts below assume **Next.js + Postgres (Supabase)** since that's what the spec is written against and it gives you Auth + Realtime + Storage + Cron for free. If you want to keep a separate Node backend instead, say so and I'll adjust the prompts.

---

## Phase 0 — Foundation (do this first, once)

### Step 0.1 — Repo & project setup

```
Set up a new Next.js 15 (App Router) + TypeScript project called "smol-cafe".
Use Tailwind CSS. Set up ESLint + Prettier. Create this folder structure:

apps/web (the Next.js app)
packages/db (schema, migrations, query layer)
packages/ui (shared components)

Add a README explaining the folder structure. Do not add any business logic yet —
this step is only scaffolding.
```

### Step 0.2 — Supabase project + connection

```
I have a Supabase project (Postgres, region ap-south-1 Mumbai). Help me:
1. Install @supabase/supabase-js and @supabase/ssr
2. Set up env vars: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
3. Create a typed Supabase client for server components and one for client components
4. Create a packages/db folder with a migrations setup using the Supabase CLI

Don't create any tables yet — just the connection scaffolding.
```

### Step 0.3 — Core schema (money-critical tables only)

```
Create Postgres migrations for ONLY these tables, based on this spec:

- locations (id, name, timezone)
- dining_tables (id, location_id, label, seats, active)
- table_qr_tokens (id, table_id, token_hash, version, revoked_at)
- table_sessions (id, location_id, table_id, status, opened_at, closed_at, guest_count, bill_id, session_token_version, last_activity_at)
- menu_categories (id, location_id, name, sort_order)
- menu_items (id, category_id, name, status)
- menu_item_versions (id, menu_item_id, description, image_url, created_at)
- menu_prices (id, menu_item_id, amount_paise, currency, effective_from, effective_to)
- orders (id, location_id, table_session_id, order_no, status, service_mode, submitted_at, accepted_at, ready_at, served_at, subtotal_snapshot, tax_snapshot, total_snapshot, version, created_at)
- order_items (id, order_id, menu_item_id, menu_item_version_id, name_snapshot, unit_price_snapshot, qty, line_subtotal, item_status)
- order_status_history (id, order_id, from_status, to_status, actor_type, actor_id, created_at)
- bills (id, table_session_id, status, subtotal, tax, total, paid_amount, created_at, closed_at)
- payment_attempts (id, bill_id, provider, amount, currency, status, idempotency_key, created_at, captured_at)

Rules to follow strictly:
- All money columns are INTEGER (paise), never decimal/float
- order_status: enum DRAFT, SUBMITTED, ACCEPTED, PREPARING, READY, SERVED, CLOSED, CANCELLED, REJECTED
- payment_status: enum CREATED, PENDING, AUTHORIZED, CAPTURED, FAILED, CANCELLED, PARTIALLY_REFUNDED, REFUNDED
- table_sessions.status: enum OPEN, PAYMENT_PENDING, CLOSED, EXPIRED
- Add a partial unique index: only one OPEN table_session per table_id
- Add UNIQUE(location_id, order_no) on orders
- order_items must snapshot name and price — never join to live menu_items.name for historical display
- Write this as Supabase migration files with up only (no destructive down needed yet)

After writing migrations, explain in 3-4 lines what each table is for.
```

### Step 0.4 — Row Level Security (RLS) basics

```
Add Supabase RLS policies for the tables above with this rule:
- Anonymous/customer role can only SELECT/INSERT rows tied to their own table_session_id
  (passed via a custom JWT claim or session cookie — suggest the simplest working approach)
- Staff/kitchen/admin roles need a separate Postgres role or claim check
- Deny by default — no table should be publicly readable/writable without an explicit policy

Explain the auth strategy you chose in plain language before writing policies.
```

**✅ Checkpoint before moving on:** you should be able to manually insert a location + table + QR token via SQL and query it back through Supabase client in Next.js.

---

## Phase 1 — Core ordering (the actual product)

Build these as **separate prompts/sessions**, one at a time. Test each before starting the next.

### Step 1.1 — QR entry & table session

```
Build the QR entry flow:
1. Route: /t/[tableToken] — resolves the token, validates it against table_qr_tokens,
   creates or joins an OPEN table_session, sets a signed session cookie scoped to that session
2. If token is invalid/revoked, show a clear "This QR isn't working, please call staff" screen —
   never silently create a session
3. Show "You're at Table {label}" with a "Not your table?" link that clears the session

Use a server action for the resolve logic (not client-side). Keep it simple — no realtime yet.
```

### Step 1.2 — Menu display (read-only)

```
Build the menu browsing page for a table session:
1. Fetch active menu_categories + menu_items + current menu_prices (join on effective_from/effective_to)
2. Group items by category with sticky category nav
3. Item card: name, price (format from paise to ₹), short description
4. Item detail view/modal: full description, quantity selector

No cart yet — just browsing. No modifiers yet either. Keep it minimal and mobile-first.
```

### Step 1.3 — Cart & order submission (the money-critical part)

```
Build cart + order submission:
1. Client-side cart state (React context or zustand) — NOT persisted to DB until submit
2. On "Place order": call a server action that, INSIDE ONE DB TRANSACTION:
   - re-validates current price for every item (reject if price changed, return a diff)
   - re-validates the table_session is still OPEN
   - creates the order row + order_items with price/name SNAPSHOTTED at submit time
   - generates order_no unique per location
   - inserts an order_status_history row (DRAFT -> SUBMITTED)
3. Accept an idempotency key from the client (generate a UUID per cart-submit attempt) so a
   double-tap on "Place order" cannot create two orders
4. Return the created order with a clear success state; on price-conflict return a 409 with
   the specific changed items so the UI can show "price changed, please review"

This is the most important transaction in the whole app — walk me through the SQL/transaction
logic before writing the final code so I can review it.
```

### Step 1.4 — Order status tracking (polling first, not realtime)

```
Build order status tracking for the customer:
1. Page showing current order(s) for this table_session with status: Submitted, Accepted,
   Preparing, Ready, Served
2. Poll every 4 seconds for status changes (no Supabase Realtime yet — keep it simple)
3. Plain-language copy per state, matching this table: [paste Section 4.5 table from the doc]

Don't build push notifications yet.
```

### Step 1.5 — Kitchen ticket board (KDS)

```
Build a kitchen-facing ticket board at /kitchen:
1. Simple staff login (email+password via Supabase Auth is fine for now, RBAC later)
2. Columns: NEW, ACCEPTED, PREPARING, READY — poll every 3 seconds for new/updated orders
3. Each card shows: order number, table label, elapsed time since submitted, items + qty + notes
4. One-tap buttons: Accept, Start Preparing, Mark Ready — each calls a server action that
   validates the current status before transitioning (reject if someone already moved it,
   to avoid double-processing) and writes to order_status_history
5. Make buttons big (44px+ touch targets) — this runs on a tablet

Use optimistic UI updates but always reconcile with server response.
```

### Step 1.6 — Running bill + cash payment

```
Build the running bill:
1. Bill view for a table_session: all orders grouped by round, subtotal, tax, total, amount paid, balance due
2. "Request bill" action from customer side -> notifies staff (just a DB flag + staff-side poll for now)
3. Staff-side "Record cash payment": enter amount tendered, mark bill as PAID, closes the
   table_session (status -> CLOSED), require staff identity on the payment_attempts row
4. Once a bill is CLOSED, no further mutation to orders/order_items under it is allowed
   (enforce this in the transaction, not just the UI)

No Razorpay yet — cash/manual only in this step.
```

**✅ Checkpoint before Phase 2:** a real device end-to-end test — scan QR → order → kitchen accepts/preps/ready → cash payment → bill closes. Do this on an actual phone + tablet, not just localhost.

---

## Phase 2 — Online payments (Razorpay)

### Step 2.1 — Razorpay order creation + checkout

```
Integrate Razorpay for online payment:
1. Server action creates a Razorpay order using an internal idempotency key tied to the bill_id + amount
2. Store this as a payment_attempts row with status PENDING before opening checkout
3. Client opens Razorpay checkout with only the public order id/amount — no secret key on client
4. On client success callback, verify the signature SERVER-SIDE before treating it as paid —
   do not trust the client success screen alone

Explain the idempotency key strategy before coding it.
```

### Step 2.2 — Webhook handling (idempotent)

```
Build the Razorpay webhook endpoint:
1. Read raw body, verify signature
2. Store event in a webhook_events table keyed by provider_event_id UNIQUE — if it already
   exists, acknowledge 200 and do nothing (dedupe)
3. On payment.captured: update payment_attempts + bill paid_amount inside a transaction;
   bill's paid status is computed from successful captures minus refunds, never from
   "latest attempt status" alone
4. Handle out-of-order delivery: never let an AUTHORIZED event overwrite a CAPTURED one

Write a small test script simulating a duplicate webhook delivery to prove dedupe works.
```

**✅ Checkpoint:** test success, failure, abandoned, and duplicate-webhook scenarios in Razorpay test mode before moving on.

---

## Phase 3 — Inventory (only once Phase 1-2 are solid in real use)

### Step 3.1 — Ingredients, recipes, and availability

```
Add inventory tables: ingredients, units, recipes, recipe_components, inventory_movements
(append-only: RECEIVE, RESERVE, RELEASE, CONSUME, WASTE, ADJUST).
Add a function: servable_qty(menu_item_id) = min across recipe components of
available_component_qty / qty_per_item.
On order submit, reserve required ingredient quantities in the SAME transaction as order
creation. On kitchen "start preparing", move reservation to consumed.
Manual 86 (sold-out) override always wins over computed availability.
```

**✅ Checkpoint:** run a manual stock receipt + a couple of test orders and confirm available stock decreases correctly and can't go negative.

---

## Phase 4 — Loyalty & customer profile

### Step 4.1 — Customer accounts

```
Add optional customer accounts on top of the anonymous table-session flow:
1. OTP-based login (phone) using Supabase Auth, or passkey if simpler to wire up
2. A "profiles" table linked to auth.users: display name, phone (optional), created_at
3. Anonymous orders placed under a table_session can be "claimed" to a profile using the
   receipt/session reference, only within a short claim window (e.g. 24 hours)
4. Login must stay fully optional — the ordering flow must keep working with zero account

Do not block ordering behind login at any point.
```

### Step 4.2 — Loyalty points ledger

```
Build loyalty as an append-only ledger, not a mutable balance field:
1. loyalty_accounts (id, profile_id, current_balance_cached)
2. loyalty_ledger (id, loyalty_account_id, type, points, related_order_id, created_at)
   type enum: EARN, REDEEM, EXPIRE, ADJUST, REVERSAL
3. Points are only EARNed when a bill is fully PAID/CAPTURED (not on order submission) —
   hook this into the payment-captured webhook handler from Phase 2
4. current_balance_cached is recomputed from the ledger in the same transaction that inserts
   a new ledger row — never trust a manually incremented counter
5. If a payment is refunded, insert a REVERSAL ledger row for the proportional points

Show me the balance-recompute transaction before finalizing.
```

### Step 4.3 — Rewards & redemption

```
Add a rewards system:
1. rewards table: name, type (FIXED_ITEM, FIXED_VALUE, PERCENTAGE), points_cost, expiry, active
2. reward_redemptions table: reward_id, profile_id, order_id (nullable), redeemed_at, points_spent
3. Redeeming a reward inserts a REDEEM ledger row and applies the discount to the current cart/order
   inside the same transaction as order submission — never apply a discount client-side only
4. Admin UI to create/edit rewards (simple CRUD is fine here)
```

**✅ Checkpoint:** create a test reward, redeem it end-to-end, confirm points ledger and balance both update correctly and a refund reverses points.

---

## Phase 5 — Smol experience features

Build these as independent, isolated features — none of them should touch the ordering/payment transaction logic from Phase 1-2.

### Step 5.1 — The Blackboard (admin-managed home content)

```
Build an admin-editable "Blackboard" content block shown on the customer home screen:
1. blackboard_posts table: title, body, image_url, active, starts_at, ends_at
2. Admin CRUD screen to create/schedule/deactivate posts
3. Customer home screen shows the currently active post (based on starts_at/ends_at), falling
   back to nothing gracefully if none is active
```

### Step 5.2 — Events / What's On

```
Build a simple events feature:
1. cafe_events table: title, description, starts_at, capacity, join_url_or_note
2. Admin CRUD to create events
3. Customer-facing "What's On" card on home/profile showing upcoming events with a "Join"
   action (just records interest — no ticketing complexity needed)
```

### Step 5.3 — Music sessions (request/vote only, no live playback API)

```
Build a request/vote music session feature — Smol-owned layer only, do NOT integrate directly
with Spotify Web API for playback:
1. music_sessions table: id, location_id, status (OPEN/CLOSED), opened_at, closed_at
2. song_requests table: id, session_id, table_session_id, track_name, artist, status
   (PENDING, APPROVED, QUEUED, PLAYING, PLAYED, REJECTED, SKIPPED)
3. song_votes table: id, request_id, table_session_id, UNIQUE(request_id, table_session_id)
   — one vote per table session per track
4. Customer UI: submit a request, see the queue, upvote once
5. Staff UI: approve/reject requests, mark playing/played, moderate/ban terms
6. Rate-limit requests and votes per table_session to prevent spam

Playback itself stays manual (staff plays it) — this system only manages the queue.
```

### Step 5.4 — Conversation Board mode & Another Round suggestions

```
Add two small experience features:
1. When "Conversation Board" item is ordered, show an optional playful card-deck modal with
   3-4 prompt cards (hardcoded content list is fine for v1)
2. "Another Round" suggestions: after an order is ACCEPTED, show 2-3 suggested items based on
   menu_pairings for items already in the order — suppress this suggestion if kitchen station
   load is currently high (simple heuristic: open ticket count per station above a threshold)
```

**✅ Checkpoint:** these are all additive UI/data features — confirm none of them can block or slow down the core order/payment flow if they fail (wrap each in error boundaries / try-catch that fails silently).

---

## Phase 6 — Advanced ops

### Step 6.1 — Procurement

```
Build basic procurement:
1. vendors table
2. purchase_orders / purchase_order_lines (status: DRAFT, APPROVED, SENT, PARTIALLY_RECEIVED,
   RECEIVED, CLOSED, CANCELLED)
3. goods_receipts / goods_receipt_lines — actual received qty, unit cost, invoice reference
4. Only goods_receipt creates a RECEIVE inventory_movement — creating a PO must never change
   stock balances
5. Simple admin UI: create PO, mark received, see vendor price history
```

### Step 6.2 — Budgets & vendor analytics

```
Add a simple budget-vs-actual view:
1. budgets table: category, month, budgeted_amount
2. Compute actual spend per category from goods_receipts and show budget vs actual with
   drill-down to line items
2. Add a vendor spend report: total spend, price changes over time, top ingredients by spend
```

### Step 6.3 — ETA calibration (rules-based, not ML)

```
Build a simple, explainable ETA engine — no machine learning:
1. Each menu_item has base_prep_seconds and a station assignment
2. ETA for an order = max across stations of (station_backlog_work / capacity + item's own
   prep time) + a fixed expo_buffer
3. Show ETA as a RANGE (e.g. 12-16 min), never a fake-precise single number
4. Record predicted_ready_at vs actual served_at on every order so you can review prediction
   error later — don't build auto-calibration yet, just log the data
```

---

## Phase 7 — Hardening & go-live (do NOT skip this before real customers use it)

This phase is prompts to _review and harden_, not just add features. Go through each one seriously.

### Step 7.1 — Security pass

```
Review this codebase for production security gaps and fix them:
1. Confirm every mutation-triggering API route/server action enforces RBAC server-side
   (not just hiding a button in the UI)
2. Add rate limiting on: QR resolve, OTP request, order submission, payment creation,
   music votes, service requests
3. Confirm RLS policies deny by default and there's no route where an anonymous customer
   token can read another table's orders/bill
4. Add MFA requirement for owner/admin accounts in Supabase Auth
5. Scan for any secrets committed to the repo; move them to environment variables
6. Confirm all user-generated text (order notes, song requests, feedback) is sanitized
   before being rendered anywhere (XSS)

List every issue you find before fixing, so I can review the list first.
```

### Step 7.2 — Reliability & backup

```
Set up reliability basics:
1. Enable Point-in-Time Recovery on the Supabase project (this is a dashboard setting —
   tell me exactly where to enable it)
2. Write a script for a nightly logical DB dump to a SEPARATE storage location/account
   (not the same Supabase project) — schedule via Supabase Cron or GitHub Actions
3. Write a restore-drill runbook: exact steps to restore the latest dump to a fresh project
   and verify order/bill/payment data integrity
4. Add a graceful-degradation check: if realtime/polling backend is unreachable, disable
   "Place Order" and show "please call staff" instead of a silently failing button
```

### Step 7.3 — Observability & alerts

```
Add observability:
1. Integrate Sentry for error tracking (client + server)
2. Add structured logging with a request_id propagated through each request, into
   order_status_history and audit-relevant actions — never log secrets/OTPs/full payment payloads
3. Add basic alert rules (even simple email/webhook alerts are fine for v1):
   - create-order failure rate > 5% in 5 min
   - no KDS heartbeat / no ticket updates for 3 min during open hours while orders exist
   - webhook processing failures above a threshold
```

### Step 7.4 — Automated tests for release-blocking scenarios

```
Write automated tests (integration + a few E2E) for these specific scenarios — these are
release-blocking, not optional:
1. Double-tapping "Place order" with the same idempotency key creates exactly ONE order
2. A price change between browsing and submit produces a clean 409 diff, not a silent
   wrong-price charge
3. Two customers trying to order the last unit of a stock-limited item: only one succeeds,
   the other gets a deterministic sold-out response
4. Kitchen double-tapping Accept/Ready doesn't create duplicate status-history entries
5. A duplicate Razorpay webhook event only applies the financial change once
6. An out-of-order webhook (e.g. AUTHORIZED arriving after CAPTURED) cannot regress payment status
7. Editing a menu item's price does not change the total on an already-placed historical order
```

### Step 7.5 — Go-live checklist walkthrough

```
Using this go-live checklist, go through my codebase feature by feature and tell me,
honestly, which items are NOT yet satisfied. Don't assume anything passes without pointing
to the actual code that proves it:

Customer: QR resolves correctly and fails safely when invalid; anonymous ordering works;
price/availability conflict is human-readable; running bill matches server ledger; receipt/
history works.

Kitchen: new order appears once; accept/start/ready work correctly on two devices at once;
reconnect after Wi-Fi drop doesn't duplicate a ticket; 86 propagates quickly.

Payments & Bills: success/failure/abandon/retry all tested; duplicate + out-of-order webhook
fixtures pass; refund tested; historical bill unchanged after a menu edit.

Admin & Security: owner MFA enabled; role matrix has negative tests; audit log records
sensitive actions; no secrets in repo; admin/KDS data can't be read anonymously.

Reliability: backup enabled; restore drill completed and timestamped; realtime-down fallback
tested; outage SOP documented.

Give me a pass/fail table, not a summary paragraph.
```

**✅ Final checkpoint:** don't let real paying customers use this until Step 7.5's checklist comes back mostly ✅. A partial pass list here is fine — just make sure YOU know what's still open, not the customers finding out.

---

## Rules to keep in your back pocket while prompting

- **Never** ask for two phases in one prompt — you'll get shallow, buggy code for both.
- Before accepting any prompt output that touches `orders`, `payment_attempts`, or money math, read the transaction logic yourself line by line.
- After each step, test on a real phone/tablet, not just the browser dev tools.
- If a prompt's output feels too big to review in one sitting, that's a signal to split the prompt further next time.
