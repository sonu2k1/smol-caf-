# Supabase Database Migrations

This directory contains versioned SQL migrations managed via the Supabase CLI.

## Workflows

### 1. Linking your remote Supabase project

```bash
npx supabase link --project-ref <your-project-ref>
```

### 2. Generating types from Supabase

```bash
npm run db:types
```

### 3. Creating a new migration

```bash
npx supabase migration new <migration_name>
```

### 4. Pushing migrations to remote

```bash
npm run db:push
```
