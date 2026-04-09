# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

**MyGarden / GardenGrid** is a multilingual kitchen garden planner. It is a single-page React app (no router, no state library) bundled with esbuild and served by a PHP backend on a shared host. The entire frontend lives in one large file: `GardenGrid.jsx`.

## Build

```bash
npm run build
# Output: public_html/assets/app.js (minified ESM bundle)
```

There is no dev server, no hot reload, and no test suite. Development means editing `GardenGrid.jsx`, running `npm run build`, and refreshing the browser. The build command is the only npm script.

## Architecture

### Frontend (`GardenGrid.jsx`)

All frontend code is in a single ~5000+ line JSX file. It is structured top to bottom as:

1. **Theme (`T`)** — a single object with all design tokens (colors, radii, shadows, spacing).
2. **i18n (`LANG`)** — translation dictionaries for `en`, `nl`, `fr`, `de`. Every string shown to users must go through `t(key)` using the active language from `state.users[activeUser].settings.lang`.
3. **Domain constants** — `FIELD_TYPES`, `STRUCT_TYPES`, `ZONE_TYPES`, `PLANT_STATUSES`, `TASK_TYPES`, `CATEGORIES`, etc., each with parallel `*_LABEL_K`, `*_ICONS`, `*_FILL`, `*_STROKE`, `*_COLORS` maps.
4. **Built-in plant library (`PLANT_LIB`)** — 600+ species with variety arrays, mysql database.
5. **Seed data (`SEED`)** — realistic demo data used when no persisted state exists.
6. **Persistence** — `loadState` / `saveState` / `resetState` talk to `/api/state.php`. Legacy `localStorage` migration is handled on first load. Session (active user ID) is stored server-side via `/api/session.php`.
7. **Shared UI primitives** — `Btn`, `Badge`, `ListRow`, `Input`, `Sel`, `Textarea`, `Modal`, `EmptyState`, `Card`, `StatCard`, `PillFilter`, `PageShell`, `PageHeader`, `SectionPanel`, `QuickAction`.
8. **`GardenEditor`** — the SVG canvas editor component (drag, resize, zones, beds, structures). `SCALE = 62` px/meter.
9. **Screen components** — one per nav item:
   - `LoginScreen` / `AccountScreen`
   - `DashboardScreen`
   - `GardensScreen`
   - `EditorScreen` (wraps `GardenEditor`)
   - `FieldsScreen`
   - `PlantsScreen`
   - `TasksScreen`
   - `GreenhouseScreen`
   - `SettingsScreen`
10. **`Sidebar`** — left nav, profile switcher, collapse support.
11. **`GardenGridApp`** (default export) — root component: loads state, manages `useReducer`, routes between screens via `screen` state string.

### State model

All state is a single plain JS object persisted as JSON to the `app_state` MySQL table (column `state_json`). Shape:

```js
{
  users: [{ id, name, email, password, avatar, color, settings: { lang, sms_phone, sms_alerts_enabled, weather_latitude, weather_longitude, weather_location_name } }],
  activeUserId: string | null,
  gardens: [{ id, user_id, name, width, height, unit, type, notes }],
  fields: [{ id, garden_id, user_id, name, type, x, y, width, height, notes }],
  structures: [{ id, garden_id, user_id, type, name, x, y, width, height, notes, ventilated, temperature, humidity }],
  zones: [{ id, garden_id, user_id, type, x, y, width, height, notes }],
  plants: [{ id, garden_id, user_id, field_id, name, variety, category, status, quantity, sow_date, plant_date, harvest_date, notes }],
  tasks: [{ id, user_id, title, type, status, due_date, linked_type, linked_id, notes }],
  slots: [],
  activeGardenId: string,
}
```

State mutations go through a `useReducer` with action types dispatched from screen components. There is no Redux or Zustand.

### Backend (`public_html/api/`)

Three PHP endpoints, all thin:

| File | Purpose |
|---|---|
| `_bootstrap.php` | DB connection factory (`db()`), `read_json_body()`, `respond()` |
| `state.php` | GET/POST/DELETE the single `app_state` row |
| `session.php` | GET/POST/DELETE `$_SESSION['gardengrid_uid']` |
| `weather.php` | Proxies Open-Meteo forecast data |

### Storm alert cron (`scripts/check_storm_alerts.php`)

Runs via server cron. Reads `app_state`, checks Open-Meteo for each user who has `sms_alerts_enabled`, sends SMS via Infinireach / android-sms-gateway / Twilio (configured via `config/services.php` and env vars). Deduplicates via `storm_alert_log` table.

### Config

- `config/database.php` — MySQL credentials (hardcoded, shared hosting).
- `config/services.php` — Weather API URL, SMS provider config. Sensitive keys should be in env vars (`MYGARDEN_*`), but fallbacks are in the file.

## Language & copy rules

- The primary UI language is **Dutch** (`nl`). The default lang for new users is set in seed data.
- All visible strings must be added to all four `LANG` dictionaries (`en`, `nl`, `fr`, `de`) before use.
- Dutch copy must be natural Belgian Dutch, not literal translations.
- Never mix English and Dutch in the same UI context.

## Design system

All styling is inline CSS using the `T` theme object. No CSS files, no Tailwind, no CSS modules. When changing visual appearance, update `T` first; use `T.*` tokens everywhere — do not hardcode colors or spacing values.

The editor canvas uses SVG with `SCALE = 62` px per meter. Bed/structure positions are stored in meters; multiply by `SCALE` for pixel coordinates in the SVG.

## Key conventions

- `gid()` generates random IDs (`Math.random().toString(36).slice(2,10)`).
- All dates are ISO strings (`YYYY-MM-DD`).
- Plant status flow: `planned → sown → planted → growing → harvestable → harvested → removed`.
- Tasks link to a `linked_type` (`"field"`, `"garden"`, `"struct"`, `"plant"`) and a `linked_id`.
- Structures with type `"greenhouse"` or `"tunnel_greenhouse"` appear in `GreenhouseScreen`.
