# Smol Café — Monorepo

Welcome to the **Smol Café** monorepo! This repository is organized as a modern TypeScript monorepo using npm workspaces.

---

## 📁 Folder Structure

```
smol-cafe/
├── apps/
│   └── web/                 # Next.js 15 (App Router) + TypeScript + Tailwind CSS application
├── packages/
│   ├── db/                  # Database schema, migrations, and query layer
│   └── ui/                  # Reusable shared UI component library
├── design.md                # Brand kit and design guidelines
├── memory.md                # Living project context and roadmap status
├── phases.md                # Phased development plan
├── prd.md                   # Product Requirements Document
├── rules.md                 # System architecture and security guidelines
├── smol-cafe-vibe-coding-build-guide.md # Step-by-step vibe coding guide
└── package.json             # Root monorepo configuration (npm workspaces)
```

---

## 📦 Packages & Apps

### 1. `apps/web`

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS
- **Purpose:** Customer ordering, cashier POS, kitchen display, chef inventory, and admin management web interfaces.

### 2. `packages/db`

- **Purpose:** Centralized data access layer, typed schemas, and Supabase / Postgres SQL migrations.
- **Structure:**
  - `src/schema/`: Typed table definitions and data models.
  - `src/migrations/`: Postgres migration scripts.
  - `src/queries/`: Typed query and mutation functions.

### 3. `packages/ui`

- **Purpose:** Shared, accessible UI primitives and design components used across `apps/web`.
- **Structure:**
  - `src/components/`: Reusable React components (buttons, badges, modals, cards, etc.).
  - `src/index.ts`: Public API export for the package.

---

## 🚀 Getting Started

### 1. Install Dependencies

From the repository root:

```bash
npm install
```

### 2. Development Mode

Run the Next.js web application:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 3. Build & Typecheck

Build all packages and apps:

```bash
npm run build
```

Run TypeScript type-checking across all workspaces:

```bash
npm run typecheck
```

### 4. Code Quality & Formatting

Run ESLint:

```bash
npm run lint
```

Format files with Prettier:

```bash
npm run format
```

Check formatting:

```bash
npm run format:check
```
