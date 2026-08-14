# smol café — Mobile Web POS & Operations System

> **small place. long stay.**  
> A mobile-first POS + operations web application tailored for **smol café** in Rishikesh, India. Built with **Next.js (App Router)**, **TypeScript**, and **Tailwind CSS**.

---

## ☕ About the Project

`smol café` is a warm, literary, day-to-night neighbourhood cafe in Tapovan, Rishikesh. This web application provides an end-to-end operational loop for the café, connecting customers, counter cashiers, kitchen staff, inventory chefs, and the owner across 6 role-based interfaces.

The design strictly follows the official **smol café Brand Kit v1.0 (Aug 2026)**, translating brand warmth, typography, and day/night duality into a high-contrast, speed-optimized mobile web tool.

---

## ✨ Features by Role

### 1. 📖 Customer Digital QR Menu (`/menu`)
- **Public & Read-Only**: Accessible via QR code scanning; no login required.
- **Brand Aesthetic**: Built on a warm `café crème` background with `smol cherry` section headers and `Noto Sans Mono` prices.
- **Filtering & Search**: Real-time search by dish/drink name, category pills, and 100% vegetarian filter.
- **Daily Availability**: Displays live "sold out" badges whenever an item is disabled by Admin.

### 2. 💳 Cashier / Counter POS (`/cashier`)
- **Speed-Optimized UI**: 2-column mobile item grid with category navigation and quick quantity steppers (`+` / `-`).
- **Sticky Cart Drawer**: Displays item count and running total in real time.
- **Flexible Checkout**: Supports Dine-In vs Takeaway, custom discounts (%), tax toggle (5% GST), and payment method selection (**UPI / Cash / Card**).
- **Printable Receipts**: Generates digital/printable receipts with an `EB Garamond` header, `Noto Sans Mono` item breakdown, and rotating brand voice quotes.
- **Order History**: Review today's completed and pending orders.

### 3. 👨‍🍳 Kitchen Order Queue (`/kitchen`)
- **Live KDS Queue**: Displays incoming orders automatically (polling every 5 seconds).
- **Large Status Advancement Buttons**: High-contrast, single-tap buttons to advance status:  
  `received` → `started` → `preparing` → `ready` → `completed`
- **Elapsed Time Tracking**: Color-coded timer badges flagging orders taking >15 minutes.
- **Audio Chime Alert**: Toggleable sound notification for new orders.

### 4. 📦 Chef Inventory & Shelf-Life (`/chef`)
- **Automated Freshness Tracking**: Calculates shelf life dynamically from expiry dates:
  - 🟢 **fresh**: `dusty pool` badge
  - 🟡 **expiring soon** (≤ 2 days): `butter taxi` badge
  - 🔴 **expired**: `smol cherry` badge
- **Quick Stock Adjustments**: One-tap buttons for `-1 used` and `+1 stock`.
- **Add Ingredient Modal**: Easy entry form for new produce, dairy, bakery, and coffee stock batches.

### 5. ⚙️ Admin Menu & QR Management (`/admin`)
- **Menu Item CRUD**: Create, edit, or update prices, descriptions, categories, and chef's special badges.
- **Instant Sold-Out Toggle**: Toggle item availability live without reprinting physical menus.
- **QR Code Generator**: Live QR code generator linking to `/menu` with 1-click URL copying and preview.

### 6. 📊 Super Admin Dashboard (`/super-admin`)
- **Business Performance Analytics**: KPI summary for Total Revenue, Order Count, and Average Order Value (AOV).
- **7-Day Revenue Trend Chart**: Visual bar chart tracking weekly income.
- **Product & Payment Insights**: Top 5 selling menu items and payment method breakdown (UPI vs Cash vs Card).
- **Staff User Management**: Create staff accounts, assign roles, and activate/deactivate access instantly.

---

## 🎨 Brand & Design System

The app implements the locked color palette and typography rules from the **smol café brand kit**:

| Token Name | Hex | Role |
|---|---|---|
| **café crème** | `#F3E7D3` | Primary background (Day Mode) |
| **espresso ink** | `#241F1C` | Primary text & background (Night Mode) |
| **smol cherry** | `#B72E35` | Primary action buttons & active states |
| **butter taxi** | `#F2C84B` | Highlights & utility accents |
| **biscuit** | `#C9AE8B` | Borders & muted card surfaces |
| **walnut** | `#725039` | Secondary text & labels |
| **dusty pool** | `#75AFA7` | Success states & fresh inventory status |
| **electric violet** | `#754CFF` | Controlled Night Mode accent (5–12%) |

### Typography
- **Inter**: Functional UI font for buttons, forms, and navigation.
- **EB Garamond**: Editorial serif font for brand headers and receipt logos.
- **Noto Sans Mono**: Monospaced font for all prices, order numbers, timestamps, and line totals.

---

## 🔐 Preset Staff Demo Accounts

You can log in via the `/login` route or use the quick role switcher in the top navigation header:

| Role | Name | PIN | Access Route |
|---|---|---|---|
| **Super Admin** | Owner (Sonu) | `9999` | `/super-admin` |
| **Admin** | Manager (Rahul) | `1111` | `/admin` |
| **Cashier** | Cashier (Priya) | `2222` | `/cashier` |
| **Kitchen** | Chef (Aman) | `3333` | `/kitchen` |
| **Chef** | Inventory Chef (Vikram) | `4444` | `/chef` |
| **Customer** | Guest | N/A | `/menu` |

---

## 🚀 Getting Started (Local Setup)

### Prerequisites
- Node.js 18+ installed on your system
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/sonu2k1/smol-caf-.git
cd smol-caf-
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser (preferably in mobile view or phone browser) to explore the application.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 📁 Repository Structure

```
├── app/
│   ├── (customer)/menu/page.tsx    # Customer digital QR menu
│   ├── (staff)/
│   │   ├── admin/page.tsx          # Menu & QR management
│   │   ├── cashier/page.tsx        # Counter POS & billing
│   │   ├── chef/page.tsx           # Inventory & shelf life
│   │   ├── kitchen/page.tsx        # Kitchen order queue
│   │   └── super-admin/page.tsx    # Analytics & staff admin
│   ├── login/page.tsx              # Staff PIN authentication
│   ├── globals.css                 # Custom brand styles & CSS variables
│   └── layout.tsx                  # Root layout & Google Fonts configuration
├── components/
│   └── NavigationHeader.tsx        # Header with role switcher & theme toggle
├── context/
│   ├── AuthContext.tsx             # Role authentication context
│   └── ThemeContext.tsx            # Day/Night theme context
├── lib/
│   ├── config.ts                   # Centralized app constants
│   ├── db.ts                       # Reactive LocalStorage data service
│   ├── initial-data.ts             # Default Rishikesh menu & inventory dataset
│   └── types.ts                    # TypeScript domain interfaces
├── prd.md                          # Product Requirements Document
├── design.md                       # Design system specifications
├── memory.md                       # Project state tracker
├── phases.md                       # Development roadmap
├── tailwind.config.ts              # Tailwind brand design tokens
└── tsconfig.json                   # TypeScript configuration
```

---

## 📄 License

Internal project built for **smol café (Rishikesh)**. All rights reserved.
