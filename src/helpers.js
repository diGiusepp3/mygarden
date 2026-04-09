import { LOCALE_MAP } from "./i18n.js";
import { SLOT_TYPE_LABELS, SLOT_TYPE_ICONS, SLOT_SEED_COLORS } from "./constants.js";

// ── Date helpers ──────────────────────────────────────────────
export const fmtDate = (d, lang = "en") => {
    if (!d) return "—";
    try { return new Date(d + "T00:00:00").toLocaleDateString(LOCALE_MAP[lang] || "en-GB", { day:"numeric", month:"short", year:"numeric" }); }
    catch { return d; }
};
export const isSameDay = (d, ref = new Date()) => {
    if (!d) return false;
    const value = new Date(d + "T00:00:00");
    return value.getFullYear() === ref.getFullYear() && value.getMonth() === ref.getMonth() && value.getDate() === ref.getDate();
};
export const isOverdue = (d, status) => {
    if (!d || status === "done") return false;
    return new Date(d + "T00:00:00") < new Date(new Date().toDateString());
};

// ── General helpers ───────────────────────────────────────────
export const clamp = (v, mn, mx) => Math.max(mn, Math.min(mx, v));
export const forUser = (arr, uid) => arr.filter(x => !x.user_id || x.user_id === uid);
export const isInsideGH = (field, gh) => {
    const cx = field.x + field.width / 2, cy = field.y + field.height / 2;
    return cx >= gh.x && cx <= gh.x + gh.width && cy >= gh.y && cy <= gh.y + gh.height;
};
export const gid = () => Math.random().toString(36).slice(2, 10);

// ── Harvest task sync ─────────────────────────────────────────
export const getHarvestTaskForPlant = (plant, uid) => {
    if (!plant?.harvest_date || plant.status === "harvested" || plant.status === "removed") return null;
    return {
        id: `harvest_${plant.id}`,
        user_id: uid,
        title: `Harvest ${plant.name}${plant.variety ? ` (${plant.variety})` : ""}`,
        type: "harvesting",
        status: "pending",
        due_date: plant.harvest_date,
        linked_type: "plant",
        linked_id: plant.id,
        notes: plant.notes || "",
    };
};
export const syncHarvestTask = (tasks, plant, uid) => {
    const nextTask = getHarvestTaskForPlant(plant, uid);
    const existing = tasks.find(t => t.id === `harvest_${plant.id}`);
    if (!nextTask) {
        return existing ? tasks.filter(t => t.id !== existing.id) : tasks;
    }
    if (existing) {
        return tasks.map(t => t.id === existing.id
            ? { ...existing, ...nextTask, status: plant.status === "harvested" ? "done" : existing.status === "done" ? "done" : "pending" }
            : t);
    }
    return [...tasks, nextTask];
};
export const removeHarvestTask = (tasks, plantId) => tasks.filter(t => t.id !== `harvest_${plantId}`);

// ── Slot helpers ──────────────────────────────────────────────
export const slotTypeLabel = (slot, t = null) => {
    const key = SLOT_TYPE_LABELS[slot?.type] || slot?.type || "Slot";
    return t && typeof t === "function" ? t(key) || key : key;
};
export const slotBaseLabel = (slot) => slot?.label || slot?.name || slot?.type || "Slot";

export const slotSeedPlan = (slot) => {
    if (!slot || !["tunnel_row", "bed_row"].includes(slot.type)) return null;
    const rows = Math.max(1, Math.floor(Number(slot.row_count) || 1));
    const plants = Math.max(0, Math.floor(Number(slot.plant_count) || 0));
    const spacingCm = Math.max(0, Number(slot.spacing_cm) || 0);
    const rowLengthM = Number(slot.row_length_m) > 0
        ? Number(slot.row_length_m)
        : (plants > 1 && spacingCm ? ((Math.ceil(plants / rows) - 1) * spacingCm) / 100 : 0);
    const maxDots = 240;
    const visiblePlants = Math.min(plants, maxDots);
    const perRow = plants > 0 ? Math.max(1, Math.ceil(plants / rows)) : 0;
    const visiblePerRow = visiblePlants > 0 ? Math.max(1, Math.ceil(visiblePlants / rows)) : 0;
    const rowsData = [];
    let remainingVisible = visiblePlants;
    for (let r = 0; r < rows; r++) {
        const plannedCount = plants > 0 ? Math.min(perRow, Math.max(0, plants - (r * perRow))) : 0;
        const drawCount = Math.min(visiblePerRow, remainingVisible);
        const seeds = [];
        for (let c = 0; c < drawCount; c++) {
            seeds.push({ id:`${slot.id}-seed-${r}-${c}`, color:SLOT_SEED_COLORS[(r + c) % SLOT_SEED_COLORS.length] });
        }
        remainingVisible -= drawCount;
        rowsData.push({ index:r, label:`R${r + 1}`, plannedCount, drawCount, hiddenCount:Math.max(0, plannedCount - drawCount), seeds });
    }
    return { rows, plants, perRow, spacingCm, rowLengthM, visiblePlants, hiddenPlants:Math.max(0, plants - visiblePlants), rowsData };
};

export const slotDisplayLabel = (slot, allSlots = []) => {
    if (!slot) return "";
    const parent = slot.parent_type === "slot" ? allSlots.find(s => s.id === slot.parent_id) : null;
    const base = `${SLOT_TYPE_ICONS[slot.type] || "▦"} ${slotBaseLabel(slot)}`;
    const meta = [];
    if (slot.type === "tunnel_row" || slot.type === "bed_row") {
        if (slot.row_count) meta.push(`${slot.row_count} rows`);
        if (slot.spacing_cm) meta.push(`${slot.spacing_cm}cm`);
        if (slot.plant_count) meta.push(`${slot.plant_count} plants`);
    }
    if (slot.type === "greenhouse_tray" && slot.rows && slot.cols) meta.push(`${slot.rows}×${slot.cols}`);
    const suffix = meta.length ? ` · ${meta.join(" · ")}` : "";
    return parent ? `${slotDisplayLabel(parent, allSlots)} › ${base}${suffix}` : `${base}${suffix}`;
};

export const childSlotsFor = (allSlots, parentType, parentId) => {
    const direct = allSlots.filter(s => s.parent_type === parentType && s.parent_id === parentId);
    if (parentType === "struct") {
        const trayChildren = allSlots.filter(s => s.parent_type === "slot" && direct.some(d => d.id === s.parent_id));
        return [...direct, ...trayChildren];
    }
    return direct;
};

// ── Polygon / geometry helpers ────────────────────────────────
export const findFieldAtPoint = (fields, x, y) =>
    fields.find(f => x >= f.x && x <= f.x + f.width && y >= f.y && y <= f.y + f.height) || null;

export const polygonPointsString = (points = []) => points.map(p => `${p.x},${p.y}`).join(" ");

export const polygonArea = (points = []) => {
    if (!points || points.length < 3) return 0;
    let area = 0;
    for (let i = 0; i < points.length; i++) {
        const a = points[i];
        const b = points[(i + 1) % points.length];
        area += (a.x * b.y) - (b.x * a.y);
    }
    return Math.abs(area / 2);
};

export const pointInPolygon = (x, y, points = []) => {
    if (!points || points.length < 3) return false;
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const xi = points[i].x, yi = points[i].y;
        const xj = points[j].x, yj = points[j].y;
        const intersect = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / ((yj - yi) || 1e-9) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
};

export const polygonCentroid = (points = []) => {
    if (!points || points.length === 0) return { x:0, y:0 };
    const sum = points.reduce((acc, p) => ({ x:acc.x + p.x, y:acc.y + p.y }), { x:0, y:0 });
    return { x:sum.x / points.length, y:sum.y / points.length };
};
