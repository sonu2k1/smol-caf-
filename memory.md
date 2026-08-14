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
- Frontend: React + Next.js
- Backend: Node.js
- Database: SQL/Mongo *(TODO: finalize before Phase 0 is complete)*
- Styling: Tailwind CSS (proposed, confirm before Phase 0)

## Brand
Built for the real smol café brand (brand kit v1.0, Aug 2026): café crème / smol cherry / espresso ink core palette, EB Garamond + Inter + Noto Sans Mono typography, day/night identity duality, warm-low-pressure voice. Full detail in `design.md`.

## Reference Docs
- `prd.md` — roles, features per role, order flow, scope
- `rules.md` — coding conventions, role/permissions model, API/security rules
- `phases.md` — roadmap, current phase tracked below
- `design.md` — smol café brand system applied to the app, per-role screen patterns

## Current Status
- **Phase:** Phase 0-7 Complete — All 6 roles implemented (Customer Menu, Cashier POS, Kitchen Queue, Chef Inventory, Admin Menu/QR, Super Admin Analytics). Next.js App Router + TypeScript + Tailwind CSS built and running on local dev server (`http://localhost:3000`).
- **Last updated:** 2026-08-14

## Key Decisions Log
| Date | Decision | Why |
|------|----------|-----|
| 2026-08-13 | Chose React/Next.js + Node.js + SQL/Mongo | Developer's preferred/familiar stack |
| 2026-08-13 | Solo build, mobile web (not native app) | Faster to ship, no app store friction |
| 2026-08-13 | Adopted smol café brand kit for design.md | App is for a real café with an existing brand identity |
| 2026-08-14 | Expanded to 6 roles (Super Admin, Admin, Cashier, Kitchen, Chef, Customer) | Café needs full ops coverage, not just billing |
| 2026-08-14 | Built Next.js App Router with TypeScript & Tailwind CSS | Full production quality, typed, responsive mobile design |
| 2026-08-14 | Built local reactive DB service with LocalStorage sync | Fast, zero-setup, persistent data for all 6 roles |

## Next Steps
- Production deployment (e.g. Vercel)
- Thermal printer integration / KOT hardware (Phase 8 stretch goal)


---
*Update this file after each session: what got built, what changed, what's next.*
