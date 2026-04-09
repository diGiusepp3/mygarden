# MyGarden / GardenGrid — Complete Project Summary

## 1. PROJECT OVERVIEW

**MyGarden** (codename: GardenGrid) is a **multilingual garden planner web app** for planning, tracking, and managing gardens at scale.

**Vision:** Start as a kitchen garden planner → evolve into a **general garden planner** with support for plants, vegetables, fruits, grass, landscaping, and eventually **3D visual representation** with placeable objects.

**Current Status:** MVP with core features (gardens, beds, plants, tasks, greenhouses). Expanding to general garden support + AI-powered plant library generation.

**Tech Stack:**
- **Frontend:** React (single 5000+ line JSX file, no router/state library)
- **Build:** esbuild (no dev server, no hot reload)
- **Backend:** PHP (three thin API endpoints)
- **Database:** MySQL (centralized state storage)
- **Hosting:** Shared hosting (no GPU, CPU-only)
- **LLM:** Self-hosted Ollama (Mistral, Gemma4 for plant generation)
- **Internationalization:** 4 languages (EN, NL, FR, DE) — primary is Dutch (BE)

---

## 2. ARCHITECTURE

### Frontend (`GardenGrid.jsx` — 5000+ lines)

**Structure (top-to-bottom):**

1. **Theme (`T`)** — Design tokens: colors, spacing, radii, shadows
2. **i18n (`LANG`)** — Translation dictionaries for all 4 languages + `useT(lang)` hook
3. **Domain Constants:**
   - `FIELD_TYPES`, `STRUCT_TYPES`, `ZONE_TYPES` (garden infrastructure)
   - `PLANT_STATUSES` (planned → sown → planted → growing → harvestable → harvested → removed)
   - `CATEGORIES` (Vegetable, Herb, Fruit, Flower, Legume, Root, Leafy Green, Other)
   - `TASK_TYPES`, `TASK_STATUS` (pending, done)
   - `GARDEN_TYPES`, `GH_TYPES` (greenhouse/tunnel types)
   - Parallel `*_ICONS`, `*_COLORS`, `*_FILL`, `*_STROKE` maps for UI rendering

4. **Plant Library (`PLANT_LIB`)** — 600+ hardcoded + generated plant entries
   - Each plant: `name`, `category`, `varieties[]`, `days_to_harvest`, `spacing_cm`, `companions`, `avoid`, `greenhouse` flag, `notes_growing`
   - Can be expanded via `/api/generate-plants.php` (Ollama-powered plant generation)
   - Stored in MySQL `plants_library` table

5. **Seed Data (`SEED`)** — Demo data (2 users, 3 gardens, 10+ fields, 30+ plants, tasks, structures)
   - Used on first load if no persisted state exists
   - Contains realistic examples of all entity types

6. **Persistence Layer:**
   - `/api/state.php` — GET/POST/DELETE entire app state (JSON blob in MySQL `app_state` table)
   - `/api/session.php` — Track active user ID (server-side session)
   - `loadState()` / `saveState()` / `resetState()` — Client-side persistence interface
   - Legacy localStorage migration on first load

7. **UI Primitives** (reusable components):
   - `Btn` (primary/secondary/accent/ghost/danger/success/outline variants)
   - `Badge`, `ListRow`, `Input`, `Sel`, `Textarea`, `Modal`
   - `EmptyState`, `Card`, `StatCard`, `PillFilter`
   - `PageShell`, `PageHeader`, `SectionPanel`, `QuickAction`
   - `FormRow`, `FormActions`, `InfoBanner`

8. **Complex Components:**
   - **`GardenEditor`** — SVG canvas for visual garden layout (drag, resize, zones, beds)
     - `SCALE = 62` px/meter (all positions stored in meters, multiplied for pixel rendering)
   - **Screen Components** (one per nav item):
     - `LoginScreen` / `AccountScreen` — auth + profile
     - `DashboardScreen` — overview, upcoming tasks, next harvest
     - `GardensScreen` — create/manage gardens
     - `EditorScreen` — visual garden layout (wraps `GardenEditor`)
     - `FieldsScreen` — beds/fields CRUD
     - `PlantsScreen` — plant inventory with **QuickAddPlantModal** (new)
     - `TasksScreen` — task management
     - `GreenhouseScreen` — greenhouse-specific plant tracking
     - `SettingsScreen` — weather, language, SMS alerts
     - `DevScreen` — Ollama plant generation (dev-only, `is_dev: true` users)

9. **Root Component (`GardenGridApp`):**
   - `useReducer` with single state object
   - Routes between screens via `screen` string in state
   - Boots state from server on mount
   - Auto-syncs to server on state changes
   - Harvest task synchronization (auto-creates/updates harvest tasks when plants are planted/harvested)

### Backend (`public_html/api/*.php`)

**3 Endpoints:**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/state.php` | GET/POST/DELETE | Fetch/save/reset entire app state JSON |
| `/api/session.php` | GET/POST/DELETE | Manage active user session (server-side) |
| `/api/weather.php` | GET | Proxy Open-Meteo forecast API |
| `/api/generate-plants.php` | POST | **NEW:** Generate plants via Ollama + save to DB |

**Bootstrap** (`_bootstrap.php`):
- MySQLi connection factory
- JSON body reading helper
- Standardized JSON response wrapper
- Session management

### State Model

**Single root object persisted as JSON to MySQL:**

```js
{
  users: [{
    id: string,
    name: string,
    email: string,
    password: string (plaintext, no hashing),
    avatar: emoji,
    color: hex,
    is_dev: boolean,
    settings: {
      lang: "en|nl|fr|de",
      sms_phone: string,
      sms_alerts_enabled: boolean,
      weather_latitude: number,
      weather_longitude: number,
      weather_location_name: string
    },
    created_at: ISO string
  }],
  activeUserId: string | null,
  
  gardens: [{
    id, user_id, name, width, height, unit, type,
    notes, created_at
  }],
  
  fields: [{
    id, garden_id, user_id, name, type,
    x, y, width, height (in meters),
    notes
  }],
  
  structures: [{
    id, garden_id, user_id, type (greenhouse/tunnel/compost/water_point/shed/path),
    x, y, width, height,
    name, notes, ventilated, temperature, humidity
  }],
  
  zones: [{
    id, garden_id, user_id, type (sun/shade/wet/etc),
    x, y, width, height, notes
  }],
  
  plants: [{
    id, garden_id, user_id, field_id, struct_id,
    name, variety, category, status,
    quantity, sow_date, plant_date, harvest_date,
    notes, row_count, sow_spacing_cm, row_plant_count, row_length_m
  }],
  
  tasks: [{
    id, user_id, title, type, status,
    due_date, linked_type, linked_id, notes
  }],
  
  slots: [{
    id, parent_id, parent_type (field/struct),
    type (bed_row/tunnel_row/greenhouse_tray),
    row_count, row_length_m, row_number
  }],
  
  activeGardenId: string
}
```

---

## 3. CURRENT FEATURES

### Garden Management
- Multi-user (2-4 users typical, stored in same state blob)
- Multiple gardens per user
- Garden types: kitchen, herb, allotment, mixed, etc.
- Visual editor (drag, resize, place beds/structures)

### Beds & Structures
- Flexible field types: raised_bed, herb_bed, flower_bed, open_field, greenhouse_bed, fruit_area
- Structures: greenhouses, tunnels, compost zones, water points, sheds, paths
- Support for "slots" (rows within beds for detailed planning)

### Plant Management
- 600+ plant library (hardcoded + generated)
- Plant lifecycle tracking: planned → sown → planted → growing → harvestable → harvested
- Variety selection
- Companion/avoid tracking (in library, not enforced in UI yet)
- Multi-quantity per plant
- Auto-harvest task creation when harvest_date is set

### Harvest & Tasks
- Auto-generated harvest tasks linked to plants
- Manual task creation (watering, weeding, etc.)
- Due date tracking, status management
- Task linking to gardens/beds/structures

### Greenhouse Tracking
- Dedicated screen for greenhouse/tunnel plants
- Tray/pot tracking within greenhouses
- Temperature/humidity metadata

### Weather & Alerts
- Open-Meteo integration for live weather
- SMS storm alerts (via Android SMS gateway / Infinireach)
- Cron-based alert checking (`scripts/check_storm_alerts.php`)

### Localization
- Full translations: English, Dutch (BE), French, German
- User language preference stored per user
- All visible strings go through `t()` function

### New: QuickAddPlantModal
- Streamlined plant addition: search → stage (zaailing/jonge plant/volwassen) → quantity → optional location
- Auto-calculated harvest dates based on `days_to_harvest`
- Status auto-set based on growth stage
- Date auto-populated (sow_date, plant_date)

### New: Dev Screen (Ollama Integration)
- Plant generation via local Ollama (Mistral, Gemma4)
- Dynamic plant generation form (count, category)
- Plants saved to `plants_library` MySQL table
- Dev users only (`is_dev: true`)

---

## 4. KEY CONVENTIONS & PATTERNS

### ID Generation
- `gid()` = `Math.random().toString(36).slice(2,10)` — 8-char alphanumeric

### Dates
- All ISO strings: `YYYY-MM-DD`
- Server timestamps: `ISO 8601` (with timezone)

### Data Organization
- **forUser()** helper — filter any array by `user_id === uid`
- **useReducer** pattern — all mutations via dispatch actions
- **Inline styles only** — no CSS files, all via `T.*` tokens
- **useT()** hook — language-aware translation

### SVG Editor
- `SCALE = 62` px/meter
- All coordinates stored in meters
- Drag/resize operations calculate in meters, render in pixels
- Collision detection via `pointInPolygon()` helper

### Dispatch Actions
```js
{ type: "ADD_PLANT", payload: { id, ...plant } }
{ type: "UPDATE_PLANT", payload: { ...updatedFields } }
{ type: "DELETE_PLANT", payload: id }
{ type: "ADD_TASK", payload: { id, ...task } }
{ type: "UPDATE_GARDEN", payload: { ...updatedFields } }
{ type: "SET_ACTIVE_GARDEN", payload: gardenId }
{ type: "SET_SETTING", payload: { lang: "en", ... } }
{ type: "HYDRATE_STATE", payload: { ...fullState } }
{ type: "SET_ACTIVE_USER", payload: userId }
```

---

## 5. FILE STRUCTURE

```
mygarden/
├── GardenGrid.jsx                    (5000+ lines, entire frontend)
├── public_html/
│   ├── index.html                    (entry point)
│   ├── assets/
│   │   └── app.js                    (esbuild output, minified ESM)
│   └── api/
│       ├── _bootstrap.php            (DB connection, helpers)
│       ├── state.php                 (state CRUD)
│       ├── session.php               (session management)
│       ├── weather.php               (forecast proxy)
│       └── generate-plants.php       (NEW: Ollama integration)
├── src/
│   ├── main.jsx                      (React root)
│   ├── theme.js                      (T object, design tokens)
│   ├── i18n.js                       (LANG dictionaries, useT hook)
│   ├── constants.js                  (domain enums, icons, colors)
│   ├── plantLibrary.js               (PLANT_LIB array)
│   ├── seed.js                       (SEED demo data)
│   ├── helpers.js                    (utility functions: gid, fmtDate, pointInPolygon, etc.)
│   └── state/
│       ├── persistence.js            (loadState, saveState, API calls)
│       └── reducer.js                (useReducer logic)
├── scripts/
│   └── check_storm_alerts.php        (cron job for SMS alerts)
├── config/
│   ├── database.php                  (MySQL credentials)
│   └── services.php                  (API keys, SMS provider config)
├── package.json                      (npm dependencies: esbuild, react)
├── CLAUDE.md                         (project instructions)
└── PROJECT_SUMMARY.md                (this file)
```

---

## 6. RECENT IMPROVEMENTS (This Session)

1. **QuickAddPlantModal** — Streamlined plant addition (3-4 fields instead of 15)
2. **Dev Screen** — Ollama-powered plant library expansion
3. **Dev User Flag** (`is_dev: true`) — Conditional sidebar nav item
4. **Mistral Model Support** — Fallback from Gemma4 to faster Mistral for plant generation
5. **Auto Harvest Dates** — Smart calculation based on growth stage
6. **Optional Location Assignment** — Decoupled location from quick add flow

---

## 7. KNOWN LIMITATIONS & AREAS FOR ENHANCEMENT

### Current Limitations
- **No authentication** — passwords stored plaintext, no session token validation
- **No input validation** — trusts all user input, SQL injection possible if state is compromised
- **Monolithic frontend** — entire app in one 5000+ line file, no component library
- **No offline support** — depends on server connection
- **Single state blob** — performance issues at scale (1000+ plants)
- **No versioning** — overwrite entire state, no undo/redo
- **No real-time sync** — no websockets, polling only
- **Companion/avoid logic** — stored in library but not enforced in UI
- **No mobile-responsive design** — desktop-first
- **No search/filter in library** — only category browse
- **Limited scheduling** — no recurring tasks, crop rotation planning

### Areas for Enhancement (Prompt Engineer Tasks)

1. **Architecture Refactoring**
   - Extract components into separate files (state/reducer is already modular)
   - Implement proper component library (shared UI kit)
   - Consider state library (Redux, Zustand, Jotai) for large-scale state management
   - Add TypeScript for type safety

2. **Security**
   - Hash passwords (bcrypt)
   - JWT or session token auth
   - Input sanitization
   - CORS/CSRF protection
   - Rate limiting on APIs

3. **Features**
   - Crop rotation planning (plant family tracking, bed rotation)
   - Companion planting enforcement (warn/suggest in UI)
   - Calendar view (weekly/monthly task view)
   - Recurring tasks
   - Photo attachments for plants/tasks
   - Notes/journal per plant lifecycle
   - Yield tracking (harvest quantity → storage)
   - Garden sharing/collaboration (read-only or edit)
   - Mobile app (React Native, Flutter)

4. **Performance**
   - Pagination for large plant lists
   - Virtual scrolling for big grids
   - Lazy-load images
   - Batch state updates (debounce saves)
   - Database indexing/query optimization

5. **3D & Visualization**
   - 3D garden model (Three.js, Babylon.js)
   - Isometric view option
   - Plant height tracking (crowding detection)
   - Sunlight simulation overlay

6. **AI Integration**
   - Plant problem diagnosis (photo → pest/disease detection)
   - Automated watering schedule (weather + plant needs)
   - Yield prediction (based on plant type, weather)
   - Multi-language garden tips (summarize companion plants in user language)
   - Smart plant suggestions (what to plant next based on season/soil)

7. **Data Import/Export**
   - CSV export (for spreadsheet tools)
   - Seed catalog import (from Johnny's, Baker Creek, etc.)
   - Garden layout templates (pre-made designs)

8. **DevOps**
   - Containerization (Docker)
   - CI/CD pipeline (GitHub Actions)
   - Automated testing (Jest, Playwright)
   - Monitoring/logging (Sentry, LogRocket)
   - Backup strategy

---

## 8. DEVELOPMENT WORKFLOW

**Build:**
```bash
npm run build  # → outputs public_html/assets/app.js (minified ESM)
```

**No dev server** — edit `GardenGrid.jsx` → build → refresh browser. Development is slow.

**Deploy:**
- Copy `public_html/assets/app.js` to server via SCP/SSH
- Server serves static files + PHP API endpoints
- Database is automatically updated via `/api/state.php`

**Testing:**
- Currently no test suite
- Manual browser testing only

---

## 9. FUTURE VISION

**Phase 2:** Expand plant library to 1000+, add crop rotation, 3D visualization
**Phase 3:** Mobile app, real-time collaboration, marketplace for garden designs
**Phase 4:** Community features, seed swaps, local garden networks

---

## 10. CONTACT & QUESTIONS

- **Owner:** Matthias (matthi_gielen@hotmail.be)
- **Dev Access:** Email + password + `is_dev: true` flag in state
- **Tech Questions:** Refer to CLAUDE.md or this summary

---

**Generated:** 2026-04-09
**App Version:** ~2.0.0 (MVP with Ollama integration)
