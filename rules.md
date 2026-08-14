# Rules.md — Development Conventions for smol café POS

Purpose: keep the codebase consistent across a multi-role, solo-built system. Follow strictly — future-you or an AI assistant should never have to re-guess conventions.

## 1. Tech Stack (locked)
- **Frontend:** React with Next.js (App Router)
- **Backend:** Node.js (Express or Next.js API routes — pick one, stay consistent)
- **Database:** SQL (Postgres/MySQL) or MongoDB — pick one, do not mix *(TODO: finalize — see memory.md)*
- **Styling:** Tailwind CSS
- **State management:** React Context / Zustand for client state

## 2. Roles & Permissions Model
This is the most important architectural decision in this project — get it right early.

| Role | Access |
|---|---|
| super_admin | everything: analytics, user management, admin + cashier + kitchen + chef views |
| admin | menu/QR management, cashier + kitchen + chef views, NOT user management or top-level analytics |
| cashier | order taking, billing, receipts, own order history only |
| kitchen | order queue + status updates only |
| chef | inventory + shelf-life only |
| customer | no login — public read-only QR menu route only |

- Every API route must check role before returning data — never rely on frontend hiding a button as the only protection
- Store role on the staff user record; check it server-side on every protected request
- Customer-facing QR menu route must be fully public and never expose staff/order/inventory data

## 3. Folder Structure
```
/app or /pages              → routes/pages
/app/(customer)/menu        → public QR menu route
/app/(staff)/cashier        → cashier screens
/app/(staff)/kitchen        → kitchen queue screens
/app/(staff)/chef           → inventory screens
/app/(staff)/admin          → menu/QR management
/app/(staff)/super-admin    → analytics + user management
/components                 → reusable UI components
/components/ui              → generic UI primitives
/features/<feature>         → feature-specific logic (orders, inventory, menu, analytics)
/lib                        → utilities, API clients, helpers
/server or /api             → backend routes/controllers
/models                     → DB schemas/models
/hooks                      → custom React hooks
/middleware                 → role-check/auth middleware
```

## 4. Naming Conventions
- Components: PascalCase (`OrderQueueCard.jsx`)
- Files/folders (non-component): kebab-case (`shelf-life-utils.js`)
- Variables/functions: camelCase
- DB tables/collections: snake_case, lowercase plural (`orders`, `menu_items`, `inventory_items`, `staff_users`)
- Order status values: fixed enum — `received`, `started`, `preparing`, `ready`, `completed` — never free text
- Env variables: SCREAMING_SNAKE_CASE

## 5. Git Conventions
- Branches: `feature/<name>`, `fix/<name>`, `chore/<name>` — prefix with role area when relevant, e.g. `feature/kitchen-status-updates`
- Commit messages: short, imperative
- Commit in small working chunks per role/feature, not giant cross-role commits

## 6. Code Style
- ESLint + Prettier before commit
- Functional components + hooks only
- Small, single-purpose components
- No magic numbers for prices/tax/shelf-life thresholds — centralize in `/lib/config.js`

## 7. API Design Rules
- REST convention: `/api/orders`, `/api/menu-items`, `/api/inventory`, `/api/staff`, `/api/analytics`
- Consistent response shape: `{ success, data, error }`
- Validate all incoming bodies (zod/joi)
- Never trust client-side price totals — recalculate server-side before saving an order
- Order status transitions validated server-side (can't skip from `received` to `ready` directly unless explicitly allowed)

## 8. Real-Time / Live Updates
- Kitchen queue and order status need near-real-time updates — use polling (simplest, fine for a single cafe) or WebSockets/SSE if polling feels laggy in practice
- QR menu should reflect Admin's edits without customer needing to hard-refresh (short polling interval or revalidation is enough — no need for full websockets here)

## 9. Error Handling
- User-facing errors: simple, calm, on-brand (see design.md voice section) — never raw error codes shown to staff or customers
- Log real error details server-side only

## 10. Auth & Security
- Hash staff PINs/passwords (bcrypt)
- Role-based route protection on every staff route (server-side, not just UI hiding)
- Rate-limit login attempts
- Super Admin action (add/delete user) should require re-confirmation (e.g. "are you sure?") since it changes access

## 11. Inventory / Shelf-Life Rules
- Every inventory entry stores: item name, quantity, unit, date added, shelf-life/expiry date
- Status derived automatically from dates: fresh / expiring soon (e.g. ≤1 day) / expired — don't make chef calculate this manually
- Never hard-delete inventory history — mark as used/wasted/expired instead, for future reporting

## 12. Testing (lightweight, solo project)
- Manual test checklist per role before each deploy (see phases.md)
- Priority for actual unit tests: order total/tax/discount calculation, order status transition logic, shelf-life status derivation — these are the highest-risk-of-bug areas

## 13. AI-Assistant Specific Rules
- Always check `memory.md` for current project state before suggesting changes
- Don't introduce a new state management library, DB, or real-time approach without flagging it first
- Keep mobile-first: every UI suggestion must work on a ~375px screen first
- Never suggest exposing staff/order/inventory data on the public customer QR route
