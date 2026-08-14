# Design.md — UI/UX Guidelines for Cafe POS (smol café)

This app is being built for **smol café** — a warm, literary, day-to-night neighbourhood café in Rishikesh. This design system adapts smol café's official brand kit (v1.0, Aug 2026) for an **internal, staff-facing POS tool**. Where brand warmth and POS speed conflict, speed and usability win — but the app should still feel unmistakably "smol" to anyone who opens it.

## 1. Design Principles (priority order)
1. **Speed over aesthetics** — rush-hour tool; every extra tap costs time
2. **High contrast, large tap targets** — cafe lighting varies, staff move fast
3. **Minimal cognitive load** — cashier shouldn't need training beyond 5 minutes
4. **Feels like smol** — even a functional tool should carry the brand's warmth, not feel like generic SaaS

## 2. Target Devices
- Primary: Android phones (~360–412px width), portrait, one-handed use at the counter
- Secondary: counter-mounted tablet, landscape possible
- Mobile-first, then adapt for tablet width

## 3. Brand Foundation (from smol café brand kit v1.0)

**Personality:** warm, nostalgic (familiar not imitation), imperfect (designed, never sterile), youthful, intellectual/bookish. Not a wellness-beige café, not a diner-theme costume, not a clinical coffee lab.

**The 3-second test** (use this to sanity-check any screen): would this feel natural on a table in a lived-in 90s café or in an old paperback — while still working clearly in 2026?

## 4. Colour System

Locked palette — do not introduce new colours without updating this doc.

| Name | Hex | Role in POS app |
|---|---|---|
| café crème | #F3E7D3 | Primary background (day mode) |
| espresso ink | #241F1C | Primary text; primary background (night mode) |
| smol cherry | #B72E35 | Primary action colour (Add to cart, Checkout, active states) |
| butter taxi | #F2C84B | Small accents only — **never small text**, decoration/background only |
| biscuit | #C9AE8B | Secondary/muted surfaces, card borders |
| walnut | #725039 | Secondary text/labels |
| dusty pool | #75AFA7 | Rare accent — e.g. success/confirmation states |
| electric violet | #754CFF | Night-mode accent only, 5–12% usage — never a daytime primary |

**Day / Night mode:** the app should offer a **day mode** (crème background, espresso text, cherry accents, airy) and a **night mode** (espresso background, crème text, cherry still present, violet as a controlled accent). This mirrors the café's own day/night identity and is a nice functional match since cafes actually operate day-to-night — night mode also helps eyes in low light during evening shifts.

**Contrast rules (carried directly from brand kit — do not break):**
- Espresso ink on crème (13.34:1) — best for body copy
- Cherry on crème (4.97:1) — headlines, buttons, normal text — PASS
- Walnut on crème (5.88:1) — secondary copy
- Crème on espresso (13.34:1) — night body copy
- Butter taxi on espresso (10.20:1) — night utility text only
- **Never** butter taxi as small text on crème (1.31:1 — fails)
- **Never** cherry as small text on espresso — use crème, biscuit, or butter instead

## 5. Typography

Same three brand families, re-weighted for a functional app:

- **Inter** — primary font for the entire app UI (buttons, menu items, forms, nav). This is the brand's own "functional sans," made for exactly this job. Use Regular/Medium/SemiBold; avoid Black.
- **Noto Sans Mono** — for **all prices, times, and order numbers**. This is a direct, happy overlap with the brand kit (it's literally their "dates, times, prices" font) and gives the POS a distinctive typewriter-receipt feel instead of generic app numerals.
- **EB Garamond** — used sparingly: screen titles, receipt header ("smol café"), and empty-state/editorial touches (e.g. a quiet italic line on an empty order history: "no orders yet today"). Never for buttons, dense lists, or small functional copy.

Minimum sizes: 14px body (Inter), 16px+ for prices (Mono) and buttons.

## 6. Voice & Microcopy

Per brand voice: lowercase, warm, specific, low-pressure, lightly witty — never corporate, never "escape the ordinary" style hospitality-speak.

- Button labels: plain and specific — "add to order", "complete order", not "Proceed to Checkout Now!"
- Empty states: quiet and human — "no orders yet today" not "You have no data to display"
- Confirmations: "order saved" not "Success! Your transaction has been processed"
- Errors: calm, no blame — "couldn't save that, try again" not "Error 500: Transaction Failed"
- Always write "smol café" lowercase, everywhere in the app including receipts

## 7. Layout Patterns

### Order/Cashier Screen
- Top: category tabs (horizontal scroll), Inter Medium
- Middle: grid of menu item cards (2 columns on phone) — name in Inter, price in Noto Sans Mono
- Bottom (sticky): cart summary bar — item count + running total (Mono), tap to expand
- Cart expands as a bottom sheet, not a separate page

### Checkout Screen
- Itemized list (read-only), prices in Mono
- Discount/tax fields
- Payment method selector: large tappable buttons (Cash / UPI / Card)
- Big "complete order" button (cherry), fixed at bottom

### Receipt
- "smol café" header in EB Garamond
- Line items + totals in Noto Sans Mono (matches their actual print/menu system)
- Optional quiet italic line at the bottom, e.g. a rotating short line in the brand's voice

### Customer QR Menu (public, no login)
- Loads instantly on customer's own phone after scanning
- Same brand system as physical menu: crème background, cherry category headings, mono prices, EB Garamond for section titles
- Read-only — no cart, no "add to order" — this is browsing only, order is placed verbally at counter
- Categories as simple sections or tabs, big legible cards, no clutter

### Kitchen Queue Screen
- List/column of incoming orders, newest at top (or grouped by status)
- Each order card: order #, items + qty, time received
- Large, unmistakable status buttons: received → started → preparing → ready (one tap to advance, colour shifts per stage — e.g. biscuit → butter taxi → dusty pool → cherry for "ready")
- Designed for glancing from across a kitchen counter — bigger type than cashier screens, minimal text

### Chef Inventory Screen
- List of inventory items, each showing: name, quantity/unit, shelf-life status
- Colour-coded freshness: dusty pool (fresh) → butter taxi (expiring soon) → cherry (expired) — never colour alone, pair with a short label ("2 days left", "expired")
- Quick "mark used/wasted" and "add stock" actions per item, no deep forms for routine updates

### Super Admin Dashboard
- Charts: sales trend (line), top items (bar), payment method split (donut) — keep to 1 accent colour per chart plus neutrals, don't rainbow the charts
- User management: simple list of staff with role tag + add/deactivate actions
- This screen can be denser/less mobile-constrained since it's typically reviewed calmly, not mid-rush

### Admin Screens (Menu/QR Management)
- Standard list + form patterns for menu items, less speed-critical
- QR code shown prominently with a "regenerate/view" option; menu edits reflect live on the customer route

## 8. Graphic Language (light touch, admin/receipt only — not the cashier flow)
- Arched frame motif (door/arch shape) can appear as a section divider or card crop on admin/reports screens
- Thin lines, small underlines, and micro motifs (four-point stars, dots) — sparse, never on the cashier's fast-tap flow
- Avoid: coffee-bean clipart, gradients, chrome/3D effects, checkerboard beyond a tiny accent

## 9. Component Notes
- Menu item card: name (Inter) + price (Mono) + qty stepper, no modal needed for quantity
- Cart drawer: clear delete icon per line item
- Toasts for confirmations ("order saved") in brand voice; modals only for destructive actions ("cancel order?")

## 10. Accessibility & Usability
- Minimum tap target: 44x44px
- WCAG AA contrast — follow the pairing table in section 4 exactly, especially the butter-taxi and cherry-on-dark restrictions
- Never rely on colour alone for status (e.g. low stock — pair with icon/text, not just red)

## 11. Non-Negotiables (from brand kit, applied to app)
- "smol café" always lowercase, everywhere in-app
- Only Inter, EB Garamond, Noto Sans Mono — no other fonts
- No new colours without updating this doc
- Butter taxi never as small text; violet never as a daytime primary
- Keep the cashier flow visually calm — brand personality lives in receipts, empty states, and admin screens more than in the fast-tap cart flow

## 12. Key Screens Checklist
- [ ] Staff login (PIN entry, role-aware)
- [ ] Customer: QR menu (public, read-only)
- [ ] Cashier: Menu/Order screen
- [ ] Cashier: Cart/Checkout screen
- [ ] Cashier: Receipt/confirmation screen
- [ ] Admin: Menu management (list/add/edit)
- [ ] Admin: QR code view/regenerate
- [ ] Kitchen: Order queue with status buttons
- [ ] Chef: Inventory list with shelf-life status
- [ ] Chef: Add stock / mark used
- [ ] Super Admin: Analytics dashboard (charts)
- [ ] Super Admin: User management (add/deactivate staff)
- [ ] Day/night mode toggle
