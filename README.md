# FileFaker Faux 🗂

**FileFaker Faux** is a vintage '90s FileMaker Pro-inspired contact and accounts database built with **SvelteKit (Svelte 5)**, **TypeScript**, and local JSON disk persistence.

It replicates the look, feel, and workflow of classic FileMaker Pro 3.0 / 4.0:
- Retro 3D beveled Windows/Mac OS window chrome and toolbar
- Iconic FileMaker "Book / Rolodex" record flipper and position slider
- Browse Mode with toggleable **Form View** and **List View** (spreadsheet)
- Homepage with **Recently-Accessed Records** shelf and global search
- Unified contact schema supporting both **Businesses** (with nested personnel and multiple addresses) and **Individual Clients**
- Comprehensive **Timestamped Notes History** chronological log
- 100 realistic mock records simulating an organization database active from 1994 to 2026

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Seed / Reset Mock Database
The mock database is stored at `data/records.json`. To generate or re-seed the initial 100 records:
```bash
npm run seed
```

### 3. Start Development Server (Hot Reloading Enabled)
> ⚡ **RULE**: Whenever running locally, always run with hot reloading (HMR) enabled using `npm run dev`:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser. All code edits will update instantly via HMR.

---

## Features

- **Classic '90s FileMaker Pro Aesthetic**: Gray beveled panels, retro buttons, system typography, and authentic menu bar.
- **Record Flipper**: Flip through records page-by-page, scrub with the position slider, or enter a record number to jump.
- **Full CRUD Support**: Create new records via the vintage dialog, update details inline, manage addresses, manage contacts, add timestamped notes, and delete records.
- **Search & Filtering**: Multi-field instant query search across names, account numbers, notes, phones, emails, and addresses, plus status/type dropdowns.
- **Recently-Accessed Shelf**: Homepage automatically surfaces recently inspected and modified records with relative time indicators.
- **Local Persistence**: All mutations write back to `data/records.json` using atomic disk operations.

---

## Testing

### Unit Tests
Unit tests use **Vitest** and verify data generation, schema validation, query filters, and CRUD operations.
```bash
npm test
```

### Integration Tests
Integration tests use **Playwright** (`tests/integration/app.spec.ts`) for browser-driven end-to-end flows.

> ⚠️ **IMPORTANT RULE**: Per `.gemini/rules/testing-rules.md`, integration tests should **NEVER** be run automatically by automated agents, CI loops, or background tasks. They should only be run when specifically commanded by the human developer:

```bash
npm run test:integration
```

<!-- Dummy PR check for Antigravity Maintainability Review -->
