import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Btn } from "../ui/Btn.jsx";
import { Badge } from "../ui/Badge.jsx";
import { Card } from "../ui/Card.jsx";
import { Input } from "../ui/Input.jsx";
import { Sel } from "../ui/Sel.jsx";
import { Textarea } from "../ui/Textarea.jsx";
import { Modal } from "../ui/Modal.jsx";
import { EmptyState } from "../ui/EmptyState.jsx";
import { FormRow } from "../ui/FormRow.jsx";
import { InfoBanner } from "../ui/InfoBanner.jsx";
import { BedShapePicker } from "../ui/BedShapePicker.jsx";
import { T } from "../theme.js";
import { LANG, useT } from "../translations.js";
import { FIELD_TYPES, FIELD_LABEL_K, FIELD_COLORS, STRUCT_TYPES, STRUCT_LABEL_K, STRUCT_ICONS, ZONE_TYPES, ZONE_LABEL_K, ZONE_ICONS, ZONE_FILL, ZONE_STROKE, GH_TYPES } from "../constants.js";
import { forUser, gid, fmtDate, slotDisplayLabel, childSlotsFor, findFieldAtPoint, polygonArea, polygonPointsString, pointInPolygon, polygonCentroid, isInsideGH, slotBaseLabel } from "../helpers.js";
import { renderSlotSeedPlan } from "../slotSeedPlanView.jsx";
import { normalizeSearchText } from "../utils/text.js";
import { GARDEN_TYPE_LABEL_K, MAINTENANCE_STRUCT_TYPES } from "../gardenMeta.js";

const SCALE = 62;

// GARDEN EDITOR (SVG with drag/resize/edit)
// ----
export default function GardenEditor({ garden, fields, structures, zones, plants = [], slots = [], dispatch, lang, navigate }) {
    const [zoom, setZoom] = useState(1);
    const [fitZoom, setFitZoom] = useState(1);
    const [viewMode, setViewMode] = useState("2d");
    const pad = 44;
    const sc = SCALE * zoom * fitZoom;
    const gW = garden.width * sc, gH = garden.height * sc;
    const svgRef = useRef(null);
    const canvasWrapRef = useRef(null);
    const [selId, setSelId] = useState(null);
    const [selKind, setSelKind] = useState(null);
    const dragRef = useRef(null);
    const resizeRef = useRef(null);
    const [livePos, setLivePos] = useState(null);
    const [editForm, setEditForm] = useState(null);
    const [zoneDraft, setZoneDraft] = useState(null);
    const [pickMenu, setPickMenu] = useState(null);
    const [panelFilter, setPanelFilter] = useState("all");
    const selItem = selId ? (
        selKind === "field" ? fields.find(f => f.id === selId)
        : selKind === "struct" ? structures.find(s => s.id === selId)
        : selKind === "zone" ? zones.find(z => z.id === selId)
        : slots.find(s => s.id === selId)
    ) : null;
    const renameSlot = useCallback((slot) => {
        const nextName = window.prompt("Rename row", slot.name || slot.label || "");
        if (!nextName || !nextName.trim()) return;
        dispatch({
            type:"UPDATE_SLOT",
            payload:{
                ...slot,
                name: nextName.trim(),
                label: (slot.label || nextName).trim(),
            }
        });
    }, [dispatch]);
    useEffect(() => {
        const updateFitZoom = () => {
            const wrap = canvasWrapRef.current;
            if (!wrap) return;
            const availableWidth = Math.max(320, wrap.clientWidth - 24);
            const naturalWidth = Math.max(1, garden.width * SCALE + pad * 2);
            const nextFit = clamp(availableWidth / naturalWidth, 0.35, 1);
            setFitZoom(nextFit);
        };
        updateFitZoom();
        const wrap = canvasWrapRef.current;
        let observer = null;
        if (wrap && typeof ResizeObserver !== "undefined") {
            observer = new ResizeObserver(updateFitZoom);
            observer.observe(wrap);
        }
        window.addEventListener("resize", updateFitZoom);
        return () => {
            observer?.disconnect?.();
            window.removeEventListener("resize", updateFitZoom);
        };
    }, [garden.width, garden.height]);
    useEffect(() => {
        if (!selItem) {
            setEditForm(null);
            return;
        }
        if (selKind === "zone") {
            setEditForm({
                name: selItem.name,
                type: selItem.type || "grass",
                notes: selItem.notes || "",
            });
            return;
        }
        if (selKind === "slot") {
            setEditForm({
                name: selItem.name || "",
                label: selItem.label || "",
                row_count: String(selItem.row_count || 1),
                spacing_cm: selItem.spacing_cm ? String(selItem.spacing_cm) : "",
                plant_count: selItem.plant_count ? String(selItem.plant_count) : "",
                row_length_m: selItem.row_length_m ? String(selItem.row_length_m) : "",
                orientation: selItem.orientation || "horizontal",
                notes: selItem.notes || "",
            });
            return;
        }
        setEditForm({
            name:selItem.name,
            x:selItem.x,
            y:selItem.y,
            width:selItem.width,
            height:selItem.height,
            notes:selItem.notes||"",
            linked_field_id:selItem.linked_field_id||"",
            shape: selItem.shape || "rect",
            species: selItem.species || "",
            info: selItem.info || "",
            maintenance_notes: selItem.maintenance_notes || "",
            prune_interval_weeks: selItem.prune_interval_weeks ? String(selItem.prune_interval_weeks) : "",
            next_prune_date: selItem.next_prune_date || "",
        });
    }, [selId, selKind, fields, structures, zones, slots]);

    // Keyboard shortcuts
    const allItems = useMemo(() => [
        ...fields.map(f=>({kind:"field",item:f})),
        ...structures.map(s=>({kind:"struct",item:s})),
        ...zones.map(z=>({kind:"zone",item:z})),
    ], [fields, structures, zones]);
    useEffect(() => {
        const onKey = (e) => {
            // Ignore when typing in an input
            if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT")) return;
            if (e.key === "Escape") {
                setSelId(null); setSelKind(null); setZoneDraft(null); setPickMenu(null);
            }
            if ((e.key === "Delete" || e.key === "Backspace") && selId && selKind) {
                e.preventDefault();
                if (selKind === "field")  { dispatch({type:"DELETE_FIELD",  payload:selId}); setSelId(null); setSelKind(null); }
                if (selKind === "struct") { dispatch({type:"DELETE_STRUCT", payload:selId}); setSelId(null); setSelKind(null); }
                if (selKind === "zone")   { dispatch({type:"DELETE_ZONE",   payload:selId}); setSelId(null); setSelKind(null); }
            }
            if (e.key === "Tab" && allItems.length > 0) {
                e.preventDefault();
                const idx = allItems.findIndex(h => h.item.id === selId);
                const next = allItems[(idx + (e.shiftKey ? -1 : 1) + allItems.length) % allItems.length];
                setSelId(next.item.id); setSelKind(next.kind);
            }
            // Arrow keys: nudge selected item by 0.1m (or 0.5m with Shift)
            if (selId && selKind && selKind !== "zone" && ["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(e.key)) {
                e.preventDefault();
                const step = e.shiftKey ? 0.5 : 0.1;
                const dx = e.key==="ArrowLeft" ? -step : e.key==="ArrowRight" ? step : 0;
                const dy = e.key==="ArrowUp"   ? -step : e.key==="ArrowDown"  ? step : 0;
                const type = selKind==="field" ? "UPDATE_FIELD" : "UPDATE_STRUCT";
                const list = selKind==="field" ? fields : structures;
                const item = list.find(i=>i.id===selId);
                if (item) dispatch({ type, payload:{ ...item, x:Math.max(0,+(item.x+dx).toFixed(1)), y:Math.max(0,+(item.y+dy).toFixed(1)) } });
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [selId, selKind, allItems, dispatch, fields, structures]);

    const getSvgXY = (e) => {
        const r = svgRef.current.getBoundingClientRect();
        return { x:e.clientX-r.left, y:e.clientY-r.top };
    };
    const startDrag = (e, kind, item) => {
        if (zoneDraft || e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();
        const { x, y } = getSvgXY(e);
        dragRef.current = { kind, id:item.id, startX:x, startY:y, origX:item.x, origY:item.y };
        setSelId(item.id);
        setSelKind(kind);
        setLivePos({ id:item.id, x:item.x, y:item.y, width:item.width, height:item.height });
    };
    const startResize = (e, kind, item, handle) => {
        if (zoneDraft || e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();
        const { x, y } = getSvgXY(e);
        resizeRef.current = { kind, id:item.id, handle, startX:x, startY:y, origX:item.x, origY:item.y, origW:item.width, origH:item.height };
        setSelId(item.id);
        setSelKind(kind);
        setLivePos({ id:item.id, x:item.x, y:item.y, width:item.width, height:item.height });
    };
    const handleMouseMove = useCallback((e) => {
        if (!dragRef.current && !resizeRef.current) return;
        const r = svgRef.current?.getBoundingClientRect();
        if (!r) return;
        const cx = e.clientX - r.left;
        const cy = e.clientY - r.top;
        if (dragRef.current) {
            const { startX, startY, origX, origY, id } = dragRef.current;
            const dx = (cx - startX) / sc;
            const dy = (cy - startY) / sc;
            const item = [...fields, ...structures].find(i => i.id === id);
            if (!item) return;
            setLivePos(p => ({ ...p, x:Math.round(clamp(origX+dx,0,garden.width-item.width)*10)/10, y:Math.round(clamp(origY+dy,0,garden.height-item.height)*10)/10 }));
        }
        if (resizeRef.current) {
            const { startX, startY, origX, origY, origW, origH, handle } = resizeRef.current;
            const dx = (cx - startX) / sc;
            const dy = (cy - startY) / sc;
            let nx = origX, ny = origY, nw = origW, nh = origH;
            if (handle.includes("e")) nw = Math.max(0.5, origW + dx);
            if (handle.includes("s")) nh = Math.max(0.5, origH + dy);
            if (handle.includes("w")) { nx = clamp(origX + dx, 0, origX + origW - 0.5); nw = origW - (nx - origX); }
            if (handle.includes("n")) { ny = clamp(origY + dy, 0, origY + origH - 0.5); nh = origH - (ny - origY); }
            nw = Math.min(nw, garden.width - nx);
            nh = Math.min(nh, garden.height - ny);
            setLivePos({ id:resizeRef.current.id, x:Math.round(nx*10)/10, y:Math.round(ny*10)/10, width:Math.round(nw*10)/10, height:Math.round(nh*10)/10 });
        }
    }, [sc, fields, structures, garden]);
    const commitChange = useCallback(() => {
        const ref = dragRef.current || resizeRef.current;
        if (ref && livePos && livePos.id === ref.id) {
            const { kind, id } = ref;
            if (kind === "field") {
                const item = fields.find(f => f.id === id);
                if (item) dispatch({ type:"UPDATE_FIELD", payload:{ ...item, ...livePos } });
            } else if (kind === "struct") {
                const item = structures.find(s => s.id === id);
                if (item) dispatch({ type:"UPDATE_STRUCT", payload:{ ...item, ...livePos } });
            }
        }
        dragRef.current = null;
        resizeRef.current = null;
    }, [livePos, fields, structures, dispatch]);
    useEffect(() => {
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", commitChange);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", commitChange);
        };
    }, [handleMouseMove, commitChange]);
    const eff = (item) => (livePos && livePos.id === item.id) ? { ...item, ...livePos } : item;
    const pickTargetsAt = useCallback((wx, wy) => {
        const hits = [];
        zones.forEach(z => {
            if (pointInPolygon(wx, wy, z.points || [])) hits.push({ kind:"zone", item:z, label:`${ZONE_ICONS[z.type] || "???"} ${z.name}` });
        });
        fields.forEach(f => {
            const ef_ = eff(f);
            if (wx >= ef_.x && wx <= ef_.x + ef_.width && wy >= ef_.y && wy <= ef_.y + ef_.height) {
                hits.push({ kind:"field", item:f, label:`??? ${f.name}` });
            }
        });
        structures.forEach(s => {
            const es_ = eff(s);
            if (wx >= es_.x && wx <= es_.x + es_.width && wy >= es_.y && wy <= es_.y + es_.height) {
                hits.push({ kind:"struct", item:s, label:`${STRUCT_ICONS[s.type] || "???"} ${s.name}` });
            }
        });
        const unique = new Map();
        hits.forEach(hit => unique.set(`${hit.kind}:${hit.item.id}`, hit));
        return [...unique.values()].sort((a, b) => {
            const order = { struct: 0, field: 1, zone: 2 };
            return (order[a.kind] ?? 9) - (order[b.kind] ?? 9);
        });
    }, [fields, structures, zones, livePos]);
    const handleItemPick = (kind, item, e) => {
        if (zoneDraft) return addZonePoint(e);
        e.stopPropagation();
        const { x, y } = getSvgXY(e);
        const wx = (x - pad) / sc;
        const wy = (y - pad) / sc;
        const hits = pickTargetsAt(wx, wy);
        if (hits.length > 1) {
            setPickMenu({ x:e.clientX, y:e.clientY, hits });
            return;
        }
        setPickMenu(null);
        setSelId(item.id);
        setSelKind(kind);
    };
    const handleCanvasPick = (e) => {
        if (zoneDraft) return addZonePoint(e);
        setPickMenu(null);
        setSelId(null);
        setSelKind(null);
    };
    const HS = 8;
    const HCURSORS = { n:"ns-resize", ne:"nesw-resize", e:"ew-resize", se:"nwse-resize", s:"ns-resize", sw:"nesw-resize", w:"ew-resize", nw:"nwse-resize" };
    const menuLeft = pickMenu ? Math.max(12, Math.min(pickMenu.x + 8, (typeof window !== "undefined" ? window.innerWidth : 1200) - 260)) : 12;
    const menuTop = pickMenu ? Math.max(12, Math.min(pickMenu.y + 8, (typeof window !== "undefined" ? window.innerHeight : 900) - 240)) : 12;
    const panelFields = panelFilter === "all" || panelFilter === "fields" ? fields : [];
    const panelStructs = panelFilter === "all" || panelFilter === "structs" || panelFilter === "greenhouses" ? structures : [];
    const panelZones = panelFilter === "all" || panelFilter === "zones" ? zones : [];
    const structSlotIndex = useMemo(() => {
        const index = {};
        const direct = slots.filter(s => s.parent_type === "struct");
        direct.forEach(slot => {
            (index[slot.parent_id] ||= []).push(slot.id);
        });
        slots.filter(s => s.parent_type === "slot").forEach(slot => {
            direct.filter(parent => parent.id === slot.parent_id).forEach(parent => {
                (index[parent.parent_id] ||= []).push(slot.id);
            });
        });
        return index;
    }, [slots]);
    const countPlantsForStruct = useCallback((st) => {
        const insideBeds = fields.filter(f => f.garden_id === st.garden_id && isInsideGH(f, st)).map(f => f.id);
        const slotIds = new Set(structSlotIndex[st.id] || []);
        return plants.reduce((sum, p) => {
            const inStruct = p.struct_id === st.id || insideBeds.includes(p.field_id) || slotIds.has(p.slot_id);
            return inStruct ? sum + Math.max(1, +p.quantity || 1) : sum;
        }, 0);
    }, [fields, plants, structSlotIndex]);
    const fieldSlotIndex = useMemo(() => {
        const index = {};
        slots.filter(s => s.parent_type === "field").forEach(slot => {
            (index[slot.parent_id] ||= []).push(slot);
        });
        Object.values(index).forEach(list => {
            list.sort((a, b) => {
                const ra = (a.type === "bed_row" || a.type === "tunnel_row") ? 0 : 1;
                const rb = (b.type === "bed_row" || b.type === "tunnel_row") ? 0 : 1;
                if (ra !== rb) return ra - rb;
                return (slotBaseLabel(a) || "").localeCompare(slotBaseLabel(b) || "");
            });
        });
        return index;
    }, [slots]);
    const structRowIndex = useMemo(() => {
        const index = {};
        slots.filter(s => s.parent_type === "struct" && (s.type === "bed_row" || s.type === "tunnel_row")).forEach(slot => {
            (index[slot.parent_id] ||= []).push(slot);
        });
        return index;
    }, [slots]);
    const renderRowSlotOverlay = useCallback((rowSlots, fx, fy, fw, fh) => {
        if (!rowSlots || !rowSlots.length) return null;
        const padX = Math.max(4, Math.min(10, fw * 0.05));
        const padY = Math.max(4, Math.min(10, fh * 0.08));
        const usableX = fx + padX;
        const usableY = fy + padY;
        const usableW = Math.max(0, fw - padX * 2);
        const usableH = Math.max(0, fh - padY * 2);
        const horizontalSlots = rowSlots.filter(slot => slot.orientation !== "vertical");
        const verticalSlots = rowSlots.filter(slot => slot.orientation === "vertical");
        const gap = rowSlots.length > 1 ? Math.max(3, Math.min(8, Math.min(fw, fh) * 0.03)) : 0;
        return (
            <g>
                {horizontalSlots.map((slot, idx) => {
                    const rowColor = slot.type === "bed_row" ? T.primary : T.accent;
                    const bandH = Math.max(14, Math.min(24, (usableH - gap * (horizontalSlots.length - 1)) / Math.max(1, horizontalSlots.length)));
                    const horizontalTop = fy + Math.max(padY, (fh - (horizontalSlots.length * bandH + gap * (horizontalSlots.length - 1))) / 2) + idx * (bandH + gap);
                    const rows = Math.max(1, Math.floor(Number(slot.row_count) || 1));
                    const rowGap = rows > 1 ? (bandH - 14) / Math.max(1, rows - 1) : 0;
                    const selected = selId === slot.id && selKind === "slot";
                    return (
                        <g key={slot.id} style={{ cursor:"pointer" }} onClick={e => { e.stopPropagation(); setSelId(slot.id); setSelKind("slot"); setPickMenu(null); }} onDoubleClick={e => { e.stopPropagation(); renameSlot(slot); }}>
                            <rect x={usableX} y={horizontalTop} width={usableW} height={bandH} rx={3} fill={rowColor + "14"} stroke={selected ? T.accent : rowColor + "9A"} strokeWidth={selected ? 2 : 1} strokeDasharray="3,3" />
                            <text x={usableX + 5} y={horizontalTop + 10} fontSize={8} fontFamily="DM Sans,sans-serif" fontWeight={800} fill={rowColor}>{slotBaseLabel(slot)}</text>
                            <text x={usableX + usableW - 5} y={horizontalTop + 10} textAnchor="end" fontSize={8} fontFamily="DM Sans,sans-serif" fontWeight={700} fill={T.textMuted}>{rows} rows · 0?</text>
                            {Array.from({ length: rows }).map((_, r) => {
                                const ry = rows === 1 ? horizontalTop + bandH / 2 : horizontalTop + 14 + r * rowGap;
                                return (
                                    <line
                                        key={`${slot.id}-${r}`}
                                        x1={usableX + 6}
                                        y1={ry}
                                        x2={usableX + usableW - 6}
                                        y2={ry}
                                        stroke={rowColor}
                                        strokeWidth={1.4}
                                        opacity={0.7}
                                    />
                                );
                            })}
                            {slot.plant_count ? <text x={usableX + usableW - 5} y={horizontalTop + bandH - 4} textAnchor="end" fontSize={7.5} fontFamily="DM Sans,sans-serif" fontWeight={700} fill={T.textSub}>{slot.plant_count} plants</text> : null}
                        </g>
                    );
                })}
                {verticalSlots.map((slot, idx) => {
                    const rowColor = slot.type === "bed_row" ? T.primary : T.accent;
                    const bandW = Math.max(18, Math.min(30, (usableW - gap * (verticalSlots.length - 1)) / Math.max(1, verticalSlots.length)));
                    const verticalLeft = fx + Math.max(padX, (fw - (verticalSlots.length * bandW + gap * (verticalSlots.length - 1))) / 2) + idx * (bandW + gap);
                    const rows = Math.max(1, Math.floor(Number(slot.row_count) || 1));
                    const rowGap = rows > 1 ? (bandW - 14) / Math.max(1, rows - 1) : 0;
                    const selected = selId === slot.id && selKind === "slot";
                    return (
                        <g key={slot.id} style={{ cursor:"pointer" }} onClick={e => { e.stopPropagation(); setSelId(slot.id); setSelKind("slot"); setPickMenu(null); }} onDoubleClick={e => { e.stopPropagation(); renameSlot(slot); }}>
                            <rect x={verticalLeft} y={usableY} width={bandW} height={usableH} rx={3} fill={rowColor + "14"} stroke={selected ? T.accent : rowColor + "9A"} strokeWidth={selected ? 2 : 1} strokeDasharray="3,3" />
                            <text x={verticalLeft + 5} y={usableY + 10} fontSize={8} fontFamily="DM Sans,sans-serif" fontWeight={800} fill={rowColor}>{slotBaseLabel(slot)}</text>
                            <text x={verticalLeft + bandW - 5} y={usableY + 10} textAnchor="end" fontSize={8} fontFamily="DM Sans,sans-serif" fontWeight={700} fill={T.textMuted}>{rows} rows · 90?</text>
                            {Array.from({ length: rows }).map((_, r) => {
                                const rx = rows === 1 ? verticalLeft + bandW / 2 : verticalLeft + 14 + r * rowGap;
                                return (
                                    <line
                                        key={`${slot.id}-${r}`}
                                        x1={rx}
                                        y1={usableY + 6}
                                        x2={rx}
                                        y2={usableY + usableH - 6}
                                        stroke={rowColor}
                                        strokeWidth={1.4}
                                        opacity={0.7}
                                    />
                                );
                            })}
                            {slot.plant_count ? <text x={verticalLeft + bandW - 5} y={usableY + usableH - 4} textAnchor="end" fontSize={7.5} fontFamily="DM Sans,sans-serif" fontWeight={700} fill={T.textSub}>{slot.plant_count} plants</text> : null}
                        </g>
                    );
                })}
            </g>
        );
    }, [renameSlot, selId, selKind]);
    const renderBedRowOverlay = useCallback((field, fx, fy, fw, fh) => {
        const bedSlots = (fieldSlotIndex[field.id] || []).filter(slot => slot.type === "bed_row" || slot.type === "tunnel_row");
        if (!bedSlots.length) return null;
        return renderRowSlotOverlay(bedSlots, fx, fy, fw, fh);
    }, [fieldSlotIndex, renderRowSlotOverlay]);
    const renderHandles = (kind, item) => {
        const {x, y, width, height} = eff(item);
        const fx = pad + x*sc, fy = pad + y*sc, fw = width*sc, fh = height*sc;
        const hps = { n:[fx+fw/2-HS/2,fy-HS/2], ne:[fx+fw-HS/2,fy-HS/2], e:[fx+fw-HS/2,fy+fh/2-HS/2], se:[fx+fw-HS/2,fy+fh-HS/2], s:[fx+fw/2-HS/2,fy+fh-HS/2], sw:[fx-HS/2,fy+fh-HS/2], w:[fx-HS/2,fy+fh/2-HS/2], nw:[fx-HS/2,fy-HS/2] };
        return Object.entries(hps).map(([h, [hx, hy]]) => (
            <rect key={h} x={hx} y={hy} width={HS} height={HS} fill="white" stroke={T.accent} strokeWidth={1.5} rx={2} style={{ cursor:HCURSORS[h] }} onMouseDown={e => startResize(e, kind, item, h)} />
        ));
    };
    const addZonePoint = (e) => {
        if (!zoneDraft) return;
        const { x, y } = getSvgXY(e);
        const gx = clamp((x - pad) / sc, 0, garden.width);
        const gy = clamp((y - pad) / sc, 0, garden.height);
        setZoneDraft(d => ({ ...d, points: [...d.points, { x:Math.round(gx*10)/10, y:Math.round(gy*10)/10 }] }));
        setSelId(null);
        setSelKind(null);
        setEditForm(null);
    };
    const beginZoneDraft = () => {
        setZoneDraft({ name:"New Zone", type:"grass", notes:"", points:[] });
        setSelId(null);
        setSelKind(null);
    };
    const cancelZoneDraft = () => setZoneDraft(null);
    const finishZoneDraft = () => {
        if (!zoneDraft || zoneDraft.points.length < 3) return;
        dispatch({
            type:"ADD_ZONE",
            payload:{
                id: gid(),
                garden_id: garden.id,
                name: zoneDraft.name.trim() || "Zone",
                type: zoneDraft.type,
                notes: zoneDraft.notes || "",
                points: zoneDraft.points,
            }
        });
        setZoneDraft(null);
    };
    const saveEdit = () => {
        if (!selItem || !editForm) return;
        if (selKind === "zone") {
            dispatch({ type:"UPDATE_ZONE", payload:{ ...selItem, name:editForm.name, type:editForm.type, notes:editForm.notes } });
            return;
        }
        if (selKind === "slot") {
            const next = {
                ...selItem,
                name: editForm.name,
                label: (editForm.label || editForm.name || selItem.label || selItem.name || "").trim(),
                notes: editForm.notes || "",
                orientation: editForm.orientation || "horizontal",
            };
            if (selItem.type === "tunnel_row" || selItem.type === "bed_row") {
                next.row_count = Math.max(1, +editForm.row_count || 1);
                next.spacing_cm = Math.max(0, +editForm.spacing_cm || 0);
                next.plant_count = Math.max(0, +editForm.plant_count || 0);
                next.row_length_m = Math.max(0, +editForm.row_length_m || 0);
            }
            dispatch({ type:"UPDATE_SLOT", payload: next });
            return;
        }
        const x = clamp(+editForm.x, 0, garden.width - 0.1);
        const y = clamp(+editForm.y, 0, garden.height - 0.1);
        const width = clamp(+editForm.width, 0.1, garden.width - x);
        const height = clamp(+editForm.height, 0.1, garden.height - y);
        const nextStruct = {
            ...selItem,
            name:editForm.name,
            x,
            y,
            width,
            height,
            notes:editForm.notes,
            linked_field_id: selKind==="struct" ? editForm.linked_field_id || "" : selItem.linked_field_id || "",
            ...(selKind === "field" ? { shape: editForm.shape || "rect" } : {}),
        };
        if (selKind === "struct" && MAINTENANCE_STRUCT_TYPES.has(selItem.type)) {
            nextStruct.species = editForm.species || "";
            nextStruct.info = editForm.info || "";
            nextStruct.maintenance_notes = editForm.maintenance_notes || "";
            nextStruct.prune_interval_weeks = Math.max(0, +editForm.prune_interval_weeks || 0);
            nextStruct.next_prune_date = editForm.next_prune_date || "";
        }
        dispatch({
            type: selKind==="field" ? "UPDATE_FIELD" : "UPDATE_STRUCT",
            payload: nextStruct
        });
    };
    const openPlantsForSlot = (slotId) => {
        if (!navigate) return;
        navigate("plants", { slot: slotId });
    };
    const gridLines = [];
    for (let x = 0; x <= garden.width; x++) {
        const m = x === 0 || x === garden.width;
        gridLines.push(<line key={`gx${x}`} x1={pad+x*sc} y1={pad} x2={pad+x*sc} y2={pad+gH} stroke={m?"#BDBDBD":"#E8E0D5"} strokeWidth={m?1.5:0.75} />);
    }
    for (let y = 0; y <= garden.height; y++) {
        const m = y === 0 || y === garden.height;
        gridLines.push(<line key={`gy${y}`} x1={pad} y1={pad+y*sc} x2={pad+garden.width*sc} y2={pad+y*sc} stroke={m?"#BDBDBD":"#E8E0D5"} strokeWidth={m?1.5:0.75} />);
    }
    const labels = [];
    for (let x = 0; x <= garden.width; x += (garden.width > 20 ? 5 : garden.width > 10 ? 2 : 1)) labels.push(<text key={`lx${x}`} x={pad+x*sc} y={pad-8} textAnchor="middle" fontSize={9} fill={T.textMuted} fontFamily="DM Sans,sans-serif">{x}m</text>);
    for (let y = 0; y <= garden.height; y += (garden.height > 20 ? 5 : garden.height > 10 ? 2 : 1)) labels.push(<text key={`ly${y}`} x={pad-8} y={pad+y*sc+4} textAnchor="end" fontSize={9} fill={T.textMuted} fontFamily="DM Sans,sans-serif">{y}m</text>);
    const getFontSize = (w, h, name) => clamp(Math.min(w*sc/Math.max(name.length,4)*1.4, h*sc/3.5), 7, 13);
    const renderZone = (zone) => {
        const pts = zone.points || [];
        const area = polygonArea(pts);
        const center = polygonCentroid(pts);
        const isSel = selId === zone.id;
        const labelSize = clamp(area > 0 ? Math.sqrt(area) * sc * 0.09 : 11, 10, 14);
        const zoneFill = ZONE_FILL[zone.type] || "rgba(127,127,127,0.2)";
        const zoneStroke = ZONE_STROKE[zone.type] || T.textMuted;
        return (
            <g key={zone.id}>
                <polygon
                    points={polygonPointsString(pts)}
                    fill={zoneFill}
                    stroke={isSel ? T.accent : zoneStroke}
                    strokeWidth={isSel ? 2.5 : 1.6}
                    strokeDasharray={zone.type === "path" ? "6,4" : "none"}
                    style={{ cursor:"pointer" }}
                    onClick={e => handleItemPick("zone", zone, e)}
                />
                {pts.map((pt, idx) => (
                    <circle key={idx} cx={pad + pt.x*sc} cy={pad + pt.y*sc} r={isSel ? 3.5 : 2.5} fill={zoneStroke} opacity={0.95} style={{ pointerEvents:"none" }} />
                ))}
                {pts.length >= 3 && (
                    <text
                        x={pad + center.x*sc}
                        y={pad + center.y*sc}
                        textAnchor="middle"
                        fontSize={labelSize}
                        fontFamily="DM Sans,sans-serif"
                        fill={zoneStroke}
                        fontWeight={800}
                        style={{ pointerEvents:"none" }}
                    >
                        {ZONE_ICONS[zone.type] || "???"} {zone.name}
                    </text>
                )}
            </g>
        );
    };
    const renderDraft = () => {
        if (!zoneDraft) return null;
        const pts = zoneDraft.points || [];
        if (!pts.length) return null;
        const fill = ZONE_FILL[zoneDraft.type] || "rgba(127,127,127,0.16)";
        const stroke = ZONE_STROKE[zoneDraft.type] || T.accent;
        return (
            <g>
                {pts.length >= 2 && <polyline points={polygonPointsString(pts)} fill="none" stroke={stroke} strokeWidth={2.2} strokeDasharray="6,4" />}
                {pts.length >= 3 && <polygon points={polygonPointsString(pts)} fill={fill} stroke={stroke} strokeWidth={2.2} strokeDasharray="6,4" opacity={0.95} />}
                {pts.map((pt, idx) => (
                    <circle key={idx} cx={pad + pt.x*sc} cy={pad + pt.y*sc} r={4} fill={stroke} stroke="#fff" strokeWidth={1.2} />
                ))}
            </g>
        );
    };
    return (
        <div>
            <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 14px", background:T.surfaceAlt, borderRadius:`${T.r} ${T.r} 0 0`, borderBottom:`1px solid ${T.border}`, flexWrap:"wrap" }}>
                <span style={{ fontSize:12, color:T.textSub, flex:"1 1 320px", fontWeight:600 }}>
                    ?? {garden.width}m × {garden.height}m · <span style={{ color:T.primary }}>Drag</span> to move · <span style={{ color:T.accent }}>Handles</span> to resize · Click to edit
                </span>
                <Btn size="sm" variant={zoneDraft ? "danger" : "accent"} onClick={zoneDraft ? cancelZoneDraft : beginZoneDraft}>
                    {zoneDraft ? "Cancel Zone" : "Add Zone"}
                </Btn>
                {zoneDraft && <Btn size="sm" variant="primary" onClick={finishZoneDraft} disabled={zoneDraft.points.length < 3}>Finish Zone</Btn>}
                <Btn size="sm" variant={viewMode === "3d" ? "primary" : "secondary"} onClick={() => setViewMode(v => v === "3d" ? "2d" : "3d")}>
                    {viewMode === "3d" ? "2D" : "3D"}
                </Btn>
                <Btn size="sm" variant="secondary" onClick={() => setZoom(z => Math.max(0.35, +(z-0.15).toFixed(2)))}>-</Btn>
                <span style={{ fontSize:12, color:T.textSub, minWidth:38, textAlign:"center", fontWeight:700 }}>{Math.round(zoom * fitZoom * 100)}%</span>
                <Btn size="sm" variant="secondary" onClick={() => setZoom(z => Math.min(2.5, +(z+0.15).toFixed(2)))}>+</Btn>
                <Btn size="sm" variant="ghost" onClick={() => setZoom(1)}>Reset</Btn>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"minmax(0,1fr) 280px", gap:12, alignItems:"start" }}>
                <div ref={canvasWrapRef} style={{ overflow:"auto", background:"#F2EDE4", minHeight:320, border:`1px solid ${T.border}`, borderTop:"none" }}>
                    {viewMode === "3d" ? (
                        <React.Suspense fallback={<div style={{ minHeight:460, display:"flex", alignItems:"center", justifyContent:"center", color:T.textMuted, fontSize:13, fontWeight:700 }}>Loading 3D scene…</div>}>
                            <Garden3DScene garden={garden} fields={fields} structures={structures} zones={zones} plants={plants} />
                        </React.Suspense>
                    ) : (
                    <svg ref={svgRef} width={pad*2+gW} height={pad*2+gH} style={{ display:"block", userSelect:"none" }}>
                    <defs>
                        <pattern id="soil" patternUnits="userSpaceOnUse" width="8" height="8">
                            <rect width="8" height="8" fill="#F5F0E3" />
                            <circle cx="2" cy="3" r="0.6" fill="#D9CEB5" opacity="0.5" />
                            <circle cx="6" cy="6" r="0.5" fill="#D9CEB5" opacity="0.4" />
                        </pattern>
                    </defs>
                    <rect
                        x={pad}
                        y={pad}
                        width={gW}
                        height={gH}
                        fill="url(#soil)"
                        onClick={handleCanvasPick}
                    />
                    {gridLines}
                    {labels}
                    {zones.map(renderZone)}
                    {renderDraft()}
                    {structures.map(st => {
                        const e_ = eff(st);
                        const sx = pad + e_.x*sc, sy = pad + e_.y*sc, sw = e_.width*sc, sh = e_.height*sc;
                        const isGH = st.type === "greenhouse" || st.type === "tunnel_greenhouse";
                        const fs = getFontSize(e_.width, e_.height, st.name);
                        const isSel = selId === st.id;
                        const plantCount = countPlantsForStruct(st);
                        const rowSlots = structRowIndex[st.id] || [];
                        const depth = Math.max(8, Math.min(sw, sh) * 0.22);
                        const roofRise = Math.max(10, depth * 0.75);
                        const faceFill = STRUCT_FILL[st.type] || "rgba(128,128,128,0.2)";
                        const faceStroke = STRUCT_STROKE[st.type] || "#888";
                        if (viewMode === "3d" && isGH) {
                            const topY = sy - roofRise;
                            const rightX = sx + depth;
                            const rightY = sy + depth * 0.45;
                            return (
                                <g key={st.id}>
                                    <polygon
                                        points={`${sx},${sy} ${sx + sw},${sy} ${sx + sw},${sy + sh} ${sx},${sy + sh}`}
                                        fill={faceFill}
                                        stroke={isSel ? T.accent : faceStroke}
                                        strokeWidth={isSel ? 2.5 : 1.4}
                                        style={{ cursor:"move" }}
                                        onMouseDown={e => startDrag(e, "struct", st)}
                                        onClick={e => handleItemPick("struct", st, e)}
                                    />
                                    <polygon
                                        points={`${sx},${sy} ${sx + depth},${sy - roofRise} ${sx + sw + depth},${sy - roofRise} ${sx + sw},${sy}`}
                                        fill={faceFill}
                                        opacity={0.96}
                                        stroke={isSel ? T.accent : faceStroke}
                                        strokeWidth={isSel ? 2.2 : 1.2}
                                        onMouseDown={e => startDrag(e, "struct", st)}
                                        onClick={e => handleItemPick("struct", st, e)}
                                    />
                                    <polygon
                                        points={`${sx + sw},${sy} ${sx + sw + depth},${sy - roofRise} ${sx + sw + depth},${sy + sh - roofRise * 0.15} ${sx + sw},${sy + sh}`}
                                        fill={faceFill}
                                        opacity={0.72}
                                        stroke={isSel ? T.accent : faceStroke}
                                        strokeWidth={isSel ? 2 : 1}
                                        onMouseDown={e => startDrag(e, "struct", st)}
                                        onClick={e => handleItemPick("struct", st, e)}
                                    />
                                    <polygon
                                        points={`${sx},${sy} ${sx + depth},${sy - roofRise} ${sx + depth},${sy + sh - roofRise * 0.15} ${sx},${sy + sh}`}
                                        fill="#ffffff"
                                        opacity={0.08}
                                        stroke="none"
                                    />
                                    <rect
                                        x={sx + depth * 0.15}
                                        y={topY + roofRise * 0.2}
                                        width={sw}
                                        height={sh}
                                        fill="none"
                                        stroke={isSel ? T.accent : faceStroke}
                                        strokeWidth={isSel ? 2.5 : 1.3}
                                        strokeDasharray="8,4"
                                        rx={isGH ? 6 : 3}
                                        style={{ cursor:"move" }}
                                        onMouseDown={e => startDrag(e, "struct", st)}
                                        onClick={e => handleItemPick("struct", st, e)}
                                    />
                                    <text x={sx + sw/2 + depth * 0.5} y={sy + sh/2 - fs*0.3 - roofRise * 0.18} textAnchor="middle" fontSize={Math.min(fs+1,15)} fontFamily="DM Sans,sans-serif" fill={faceStroke} fontWeight={800} style={{ pointerEvents:"none" }}>{STRUCT_ICONS[st.type]}</text>
                                    {sh > sc*0.55 && <text x={sx + sw/2 + depth * 0.5} y={sy + sh/2 + fs*0.85 - roofRise * 0.18} textAnchor="middle" fontSize={clamp(fs,7,11)} fontFamily="DM Sans,sans-serif" fill={faceStroke} fontWeight={700} style={{ pointerEvents:"none" }}>{st.name}</text>}
                                    {sh > sc*0.95 && plantCount > 0 && <text x={sx + sw/2 + depth * 0.5} y={sy + sh/2 + fs*2.35 - roofRise * 0.18} textAnchor="middle" fontSize={8} fontFamily="DM Sans,sans-serif" fill={T.primary} fontWeight={700} style={{ pointerEvents:"none" }}>{plantCount} plants</text>}
                                    {sh > sc*1.1 && <text x={sx + sw/2 + depth * 0.5} y={sy + sh/2 + fs*1.65 - roofRise * 0.18} textAnchor="middle" fontSize={8} fontFamily="DM Sans,sans-serif" fill={faceStroke} style={{ pointerEvents:"none" }}>{e_.width} × {e_.height}m</text>}
                                    {rowSlots.length > 0 && <g transform={`translate(${depth * 0.5}, ${-roofRise * 0.15})`}>{renderRowSlotOverlay(rowSlots, sx, sy, sw, sh)}</g>}
                                    {isSel && renderHandles("struct", st)}
                                </g>
                            );
                        }
                        return (
                            <g key={st.id}>
                                <rect x={sx} y={sy} width={sw} height={sh} fill={STRUCT_FILL[st.type] || "rgba(128,128,128,0.2)"} stroke={isSel ? T.accent : (STRUCT_STROKE[st.type] || "#888")} strokeWidth={isSel ? 2.5 : (isGH ? 2 : 1.2)} strokeDasharray={isGH ? "8,4" : "none"} rx={isGH ? 5 : 3} style={{ cursor:"move" }} onMouseDown={e => startDrag(e, "struct", st)} onClick={e => handleItemPick("struct", st, e)} />
                                {rowSlots.length > 0 && renderRowSlotOverlay(rowSlots, sx, sy, sw, sh)}
                                <text x={sx+sw/2} y={sy+sh/2-fs*0.3} textAnchor="middle" fontSize={Math.min(fs+1,15)} fontFamily="DM Sans,sans-serif" fill={STRUCT_STROKE[st.type] || "#555"} fontWeight={700} style={{ pointerEvents:"none" }}>{STRUCT_ICONS[st.type]}</text>
                                {sh > sc*0.6 && <text x={sx+sw/2} y={sy+sh/2+fs*0.9} textAnchor="middle" fontSize={clamp(fs,7,11)} fontFamily="DM Sans,sans-serif" fill={STRUCT_STROKE[st.type] || "#555"} fontWeight={600} style={{ pointerEvents:"none" }}>{st.name}</text>}
                                {sh > sc*1.0 && plantCount > 0 && <text x={sx+sw/2} y={sy+sh/2+fs*2.55} textAnchor="middle" fontSize={8} fontFamily="DM Sans,sans-serif" fill={T.primary} fontWeight={700} style={{ pointerEvents:"none" }}>{plantCount} plants</text>}
                                {sh > sc*1.2 && <text x={sx+sw/2} y={sy+sh/2+fs*1.9} textAnchor="middle" fontSize={8} fontFamily="DM Sans,sans-serif" fill={STRUCT_STROKE[st.type] || "#888"} style={{ pointerEvents:"none" }}>{e_.width} × {e_.height}m</text>}
                                {isSel && renderHandles("struct", st)}
                            </g>
                        );
                    })}
                    {fields.map(f => {
                        const e_ = eff(f), fx = pad + e_.x*sc, fy = pad + e_.y*sc, fw = e_.width*sc, fh = e_.height*sc;
                        const fc = FIELD_COLORS[f.type] || T.primary;
                        const fs = getFontSize(e_.width, e_.height, f.name);
                        const isSel = selId === f.id;
                        const shape = f.shape || "rect";
                        const rowSlots = (fieldSlotIndex[f.id] || []).filter(slot => slot.type === "bed_row" || slot.type === "tunnel_row");
                        const sharedSvgProps = { fill:fc+"28", stroke:isSel?T.accent:fc, strokeWidth:isSel?2.5:2, style:{cursor:"move"}, onMouseDown:e=>startDrag(e,"field",f), onClick:e=>handleItemPick("field",f,e) };
                        // Text center adjusted per shape
                        const [tx, ty] = shape==="semi_n" ? [fx+fw/2, fy+fh*0.38] : shape==="semi_s" ? [fx+fw/2, fy+fh*0.62] : shape==="semi_e" ? [fx+fw*0.65, fy+fh/2] : shape==="semi_w" ? [fx+fw*0.35, fy+fh/2] : [fx+fw/2, fy+fh/2];
                        return (
                            <g key={f.id}>
                                {shape==="circle" && <ellipse cx={fx+fw/2} cy={fy+fh/2} rx={fw/2} ry={fh/2} {...sharedSvgProps}/>}
                                {shape==="semi_n" && <path d={`M ${fx} ${fy+fh} A ${fw/2} ${fh} 0 0 0 ${fx+fw} ${fy+fh} Z`} {...sharedSvgProps}/>}
                                {shape==="semi_s" && <path d={`M ${fx} ${fy} A ${fw/2} ${fh} 0 0 1 ${fx+fw} ${fy} Z`} {...sharedSvgProps}/>}
                                {shape==="semi_e" && <path d={`M ${fx} ${fy} A ${fw} ${fh/2} 0 0 1 ${fx} ${fy+fh} Z`} {...sharedSvgProps}/>}
                                {shape==="semi_w" && <path d={`M ${fx+fw} ${fy} A ${fw} ${fh/2} 0 0 0 ${fx+fw} ${fy+fh} Z`} {...sharedSvgProps}/>}
                                {(!shape || shape==="rect") && <>
                                    <rect x={fx} y={fy} width={fw} height={fh} {...sharedSvgProps} rx={3}/>
                                    <rect x={fx} y={fy} width={fw} height={Math.min(fh,4)} fill={fc} opacity={0.7} style={{pointerEvents:"none"}}/>
                                </>}
                                {rowSlots.length > 0 && renderBedRowOverlay(f, fx, fy, fw, fh)}
                                <text x={tx} y={ty+fs*0.4} textAnchor="middle" fontSize={clamp(fs,7,13)} fontFamily="DM Sans,sans-serif" fill={fc} fontWeight={800} style={{ pointerEvents:"none" }}>{f.name}</text>
                                {fh > sc*0.8 && <text x={tx} y={ty+fs*1.5} textAnchor="middle" fontSize={8} fontFamily="DM Sans,sans-serif" fill={fc+"AA"} style={{ pointerEvents:"none" }}>{e_.width} × {e_.height}m</text>}
                                {isSel && renderHandles("field", f)}
                            </g>
                        );
                    })}
                    <rect x={pad} y={pad} width={gW} height={gH} fill="none" stroke={T.primary} strokeWidth={2.5} rx={3} style={{ pointerEvents:"none" }} />
                    <text x={pad+gW-6} y={pad+16} textAnchor="end" fontSize={14} fill={T.primary} fontFamily="Fraunces,serif" fontWeight={800}>N?</text>
                    <g transform={`translate(${pad},${pad+gH+16})`}>
                        <rect x={0} y={0} width={sc} height={5} fill={T.primary} opacity={0.4} rx={2} />
                        <text x={sc/2} y={17} textAnchor="middle" fontSize={9} fill={T.textSub} fontFamily="DM Sans,sans-serif">1 metre</text>
                    </g>
                    </svg>
                    )}
                </div>
                <Card style={{ padding:14, position:"sticky", top:12, alignSelf:"start", maxHeight:"calc(100vh - 140px)", overflow:"auto" }}>
                    {selItem && editForm ? (
                        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8 }}>
                                <div>
                                    <div style={{ fontSize:12, fontWeight:800, color:T.textMuted, textTransform:"uppercase", letterSpacing:0.5 }}>Selected</div>
                                    <div style={{ fontSize:15, fontWeight:900, color:T.text, fontFamily:"Fraunces, serif" }}>{selItem.name}</div>
                                    <div style={{ fontSize:11, color:T.textMuted }}>{selKind==="zone" ? "Zone" : selKind==="struct" ? "Structure" : "Bed"}</div>
                                </div>
                                <Btn size="sm" variant="ghost" onClick={() => { setSelId(null); setSelKind(null); }}>?</Btn>
                            </div>
                            {selKind === "zone" ? (
                                <div style={{ display:"grid", gap:10 }}>
                                    <Sel label="Type" value={editForm.type} onChange={v=>setEditForm(f=>({...f,type:v}))} options={ZONE_TYPES.map(z => ({ value:z, label:`${ZONE_ICONS[z]} ${LANG[lang]?.[ZONE_LABEL_K[z]] || LANG.en[ZONE_LABEL_K[z]] || z}` }))} />
                                    <Input label="Name" value={editForm.name} onChange={e=>setEditForm(f=>({...f,name:e}))} />
                                    <Textarea label="Notes" value={editForm.notes} onChange={v=>setEditForm(f=>({...f,notes:v}))} rows={2} />
                                    <div style={{ display:"flex", gap:8 }}>
                                        <Btn size="sm" variant="primary" onClick={saveEdit}>Save</Btn>
                                        <Btn size="sm" variant="danger" onClick={() => { if (window.confirm("Delete this zone?")) { dispatch({ type:"DELETE_ZONE", payload:selItem.id }); setSelId(null); setSelKind(null); } }}>Delete</Btn>
                                    </div>
                                    <div style={{ fontSize:11, color:T.textMuted }}>Area: {polygonArea(selItem.points||[]).toFixed(1)}m²</div>
                                </div>
                            ) : (
                                <div style={{ display:"grid", gap:10 }}>
                                    <Input label="Name" value={editForm.name} onChange={e=>setEditForm(f=>({...f,name:e}))} />
                                    {selKind === "field" && (
                                        <BedShapePicker value={editForm.shape||"rect"} onChange={v=>setEditForm(f=>({...f,shape:v}))}/>
                                    )}
                                    <FormRow cols={2}>
                                        <Input label="X (m)" value={editForm.x} onChange={e=>setEditForm(f=>({...f,x:e}))} type="number" min="0" step="0.1" />
                                        <Input label="Y (m)" value={editForm.y} onChange={e=>setEditForm(f=>({...f,y:e}))} type="number" min="0" step="0.1" />
                                        <Input label="W (m)" value={editForm.width} onChange={e=>setEditForm(f=>({...f,width:e}))} type="number" min="0.1" step="0.1" />
                                        <Input label="H (m)" value={editForm.height} onChange={e=>setEditForm(f=>({...f,height:e}))} type="number" min="0.1" step="0.1" />
                                    </FormRow>
                                    {selKind === "struct" && (
                                        <Sel
                                            label="Linked field"
                                            value={editForm.linked_field_id || ""}
                                            onChange={v=>setEditForm(f=>({...f, linked_field_id:v}))}
                                            options={[
                                                { value:"", label:"No link" },
                                                ...fields.filter(f=>f.garden_id===selItem.garden_id).map(f=>({ value:f.id, label:f.name })),
                                            ]}
                                        />
                                    )}
                                    {selKind === "struct" && (
                                        <div style={{ display:"grid", gap:10 }}>
                                            <Textarea label="Info" value={editForm.info || ""} onChange={v=>setEditForm(f=>({...f,info:v}))} rows={2} placeholder="Short description shown in details" />
                                    {MAINTENANCE_STRUCT_TYPES.has(selItem.type) && (
                                        <>
                                            <FormRow cols={2}>
                                                <Input label="Species / type" value={editForm.species || ""} onChange={v=>setEditForm(f=>({...f,species:v}))} placeholder="Beech, yew, privet..." />
                                                <Input label="Prune interval (weeks)" value={editForm.prune_interval_weeks || ""} onChange={v=>setEditForm(f=>({...f,prune_interval_weeks:v}))} type="number" min="0" max="52" />
                                                    </FormRow>
                                                    <Input label="Next prune date" value={editForm.next_prune_date || ""} onChange={v=>setEditForm(f=>({...f,next_prune_date:v}))} type="date" />
                                                    <Textarea label="Maintenance notes" value={editForm.maintenance_notes || ""} onChange={v=>setEditForm(f=>({...f,maintenance_notes:v}))} rows={2} placeholder="Cut in late spring and after summer growth" />
                                                </>
                                            )}
                                        </div>
                                    )}
                                    <Textarea label="Notes" value={editForm.notes} onChange={v=>setEditForm(f=>({...f,notes:v}))} rows={2} />
                                    {selKind === "field" && (fieldSlotIndex[selItem.id] || []).some(slot => slot.type === "bed_row" || slot.type === "tunnel_row") && (
                                        <div style={{ display:"grid", gap:8, marginTop:2 }}>
                                            <div style={{ fontSize:11, fontWeight:800, color:T.textMuted, textTransform:"uppercase", letterSpacing:0.5 }}>Plantrijen</div>
                                            {(fieldSlotIndex[selItem.id] || [])
                                                .filter(slot => slot.type === "bed_row" || slot.type === "tunnel_row")
                                                .map(slot => (
                                                    <div key={slot.id} style={{ padding:10, border:`1px solid ${selId===slot.id&&selKind==="slot"?T.primary:T.border}`, borderRadius:T.rs, background:selId===slot.id&&selKind==="slot"?T.primaryBg:T.surfaceAlt, cursor:"pointer" }} onClick={() => { setSelId(slot.id); setSelKind("slot"); }}>
                                                        <div style={{ display:"flex", justifyContent:"space-between", gap:8, alignItems:"center", marginBottom:6 }}>
                                                            <div style={{ fontSize:12, fontWeight:800, color:T.text }}>{slotBaseLabel(slot)}</div>
                                                            <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
                                                                <Badge color={slot.type === "bed_row" ? T.primary : T.accent} bg={slot.type === "bed_row" ? T.primaryBg : T.accentBg}>
                                                                    {Math.max(1, Math.floor(Number(slot.row_count) || 1))} rows
                                                                </Badge>
                                                                <Badge color={T.textSub} bg={T.surface}>{slot.orientation === "vertical" ? "90?" : "0?"}</Badge>
                                                                <Btn
                                                                    size="xs"
                                                                    variant="secondary"
                                                                    onClick={(e) => { e.stopPropagation(); dispatch({ type:"UPDATE_SLOT", payload:{ ...slot, orientation: slot.orientation === "vertical" ? "horizontal" : "vertical" } }); }}
                                                                >
                                                                    Rotate 90?
                                                                </Btn>
                                                            </div>
                                                        </div>
                                                        <div style={{ fontSize:11, color:T.textMuted, marginBottom:8 }}>
                                                            {slot.plant_count ? `${slot.plant_count} plants` : "No plant count set yet"}
                                                            {slot.spacing_cm ? ` · ${slot.spacing_cm} cm spacing` : ""}
                                                            {slot.row_length_m ? ` · ${slot.row_length_m} m` : ""}
                                                        </div>
                                                        {renderSlotSeedPlan(slot, { compact: true })}
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                    <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                                        <Btn size="sm" variant="primary" onClick={saveEdit}>Save</Btn>
                                        <Btn size="sm" variant="danger" onClick={() => {
                                            if (window.confirm(selKind === "field" ? "Delete this bed?" : "Delete this structure?")) {
                                                dispatch({type: selKind==="field" ? "DELETE_FIELD" : "DELETE_STRUCT", payload:selItem.id});
                                                setSelId(null);
                                                setSelKind(null);
                                            }
                                        }}>Delete</Btn>
                                    </div>
                                    <div style={{ fontSize:11, color:T.textMuted }}>{selItem.width}m × {selItem.height}m</div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                            <div>
                                <div style={{ fontSize:12, fontWeight:800, color:T.textMuted, textTransform:"uppercase", letterSpacing:0.5 }}>Context</div>
                                <div style={{ fontSize:15, fontWeight:900, color:T.text, fontFamily:"Fraunces, serif" }}>Objects</div>
                                <div style={{ fontSize:11, color:T.textMuted }}>{fields.length} beds · {structures.length} structures · {zones.length} zones</div>
                            </div>
                            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                                {["all","fields","structs","greenhouses","zones"].map(k => (
                                    <Btn key={k} size="sm" variant={panelFilter===k ? "primary" : "secondary"} onClick={()=>setPanelFilter(k)} style={{ flex:"1 1 96px", justifyContent:"center" }}>
                                        {k === "all" ? "All" : k === "fields" ? "Beds" : k === "structs" ? "Structs" : k === "greenhouses" ? "GH" : "Zones"}
                                    </Btn>
                                ))}
                            </div>
                            <div style={{ display:"grid", gap:10 }}>
                                {panelFields.length>0 && (
                                    <div>
                                        <div style={{ fontSize:11, fontWeight:800, color:T.textMuted, textTransform:"uppercase", letterSpacing:0.5, marginBottom:6 }}>Beds</div>
                                        <div style={{ display:"grid", gap:6 }}>
                                            {panelFields.map(f => (
                                                <button key={f.id} onClick={()=>{ setSelId(f.id); setSelKind("field"); }} style={{ textAlign:"left", border:`1px solid ${selId===f.id&&selKind==="field"?T.primary:T.border}`, background:selId===f.id&&selKind==="field"?T.primaryBg:T.surface, borderRadius:T.rs, padding:"8px 10px", cursor:"pointer", fontFamily:"inherit" }}>
                                                    <div style={{ fontSize:12, fontWeight:800, color:T.text }}>{f.name}</div>
                                                    <div style={{ fontSize:11, color:T.textMuted }}>{LANG[lang]?.[FIELD_LABEL_K[f.type]] || f.type} · {f.width} × {f.height}m</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {panelStructs.length>0 && (
                                    <div>
                                        <div style={{ fontSize:11, fontWeight:800, color:T.textMuted, textTransform:"uppercase", letterSpacing:0.5, marginBottom:6 }}>Structures</div>
                                        <div style={{ display:"grid", gap:6 }}>
                                            {panelStructs.map(st => (
                                                <button key={st.id} onClick={()=>{ setSelId(st.id); setSelKind("struct"); }} style={{ textAlign:"left", border:`1px solid ${selId===st.id&&selKind==="struct"?T.accent:T.border}`, background:selId===st.id&&selKind==="struct"?T.accentBg:T.surface, borderRadius:T.rs, padding:"8px 10px", cursor:"pointer", fontFamily:"inherit" }}>
                                                    <div style={{ display:"flex", justifyContent:"space-between", gap:8, alignItems:"start" }}>
                                                        <div>
                                                            <div style={{ fontSize:12, fontWeight:800, color:T.text }}>{STRUCT_ICONS[st.type] || "???"} {st.name}</div>
                                                            <div style={{ fontSize:11, color:T.textMuted }}>{LANG[lang]?.[STRUCT_LABEL_K[st.type]] || st.type} · {st.width} × {st.height}m</div>
                                                        </div>
                                                        {st.linked_field_id && <Badge color={T.accent} bg={T.accentBg}>linked</Badge>}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {panelZones.length>0 && (
                                    <div>
                                        <div style={{ fontSize:11, fontWeight:800, color:T.textMuted, textTransform:"uppercase", letterSpacing:0.5, marginBottom:6 }}>Zones</div>
                                        <div style={{ display:"grid", gap:6 }}>
                                            {panelZones.map(z => (
                                                <button key={z.id} onClick={()=>{ setSelId(z.id); setSelKind("zone"); }} style={{ textAlign:"left", border:`1px solid ${selId===z.id&&selKind==="zone"?T.primary:T.border}`, background:selId===z.id&&selKind==="zone"?T.primaryBg:T.surface, borderRadius:T.rs, padding:"8px 10px", cursor:"pointer", fontFamily:"inherit" }}>
                                                    <div style={{ fontSize:12, fontWeight:800, color:T.text }}>{ZONE_ICONS[z.type] || "???"} {z.name}</div>
                                                    <div style={{ fontSize:11, color:T.textMuted }}>{LANG[lang]?.[ZONE_LABEL_K[z.type]] || z.type} · {polygonArea(z.points||[]).toFixed(1)}m²</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </Card>
            </div>
            {pickMenu && (
                <div style={{ position:"fixed", inset:0, zIndex:1200 }} onClick={() => setPickMenu(null)}>
                    <div
                        style={{
                            position:"fixed",
                            left:menuLeft,
                            top:menuTop,
                            width:240,
                            background:T.surface,
                            border:`1px solid ${T.border}`,
                            borderRadius:T.rs,
                            boxShadow:T.shLg,
                            padding:10,
                            display:"flex",
                            flexDirection:"column",
                            gap:8,
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ fontSize:11, fontWeight:800, color:T.textMuted, textTransform:"uppercase", letterSpacing:0.5 }}>Pick item</div>
                        {pickMenu.hits.map(hit => (
                            <Btn
                                key={`${hit.kind}:${hit.item.id}`}
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                    setSelId(hit.item.id);
                                    setSelKind(hit.kind);
                                    setPickMenu(null);
                                }}
                                style={{ justifyContent:"flex-start", width:"100%" }}
                            >
                                {hit.label}
                            </Btn>
                        ))}
                    </div>
                </div>
            )}
            {zoneDraft && (
                <div style={{ background:T.primaryBg, border:`1px solid ${T.primary}33`, borderTop:"none", borderRadius:`0 0 ${T.r} ${T.r}`, padding:"12px 18px", fontSize:12, color:T.primary, display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
                    <strong>Zone tool</strong>
                    <span>Click to place points. Minimum 3 points. Finish to save a freeform zone.</span>
                    <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
                        <Btn size="sm" variant="secondary" onClick={() => setZoneDraft(d => d ? ({ ...d, points: [] }) : d)} disabled={!zoneDraft.points.length}>Clear points</Btn>
                    </div>
                </div>
            )}
            {selItem && editForm && (
                <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderTop:"none", borderRadius:`0 0 ${T.r} ${T.r}`, padding:"14px 18px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                        <span style={{ fontSize:20 }}>{selKind==="struct" ? (STRUCT_ICONS[selItem.type]||"???") : selKind==="zone" ? (ZONE_ICONS[selItem.type]||"???") : selKind==="slot" ? "??" : "???"}</span>
                        <div style={{ flex:1 }}>
                            <div style={{ fontSize:13, fontWeight:700, color:T.text }}>{selItem.name}</div>
                            <div style={{ fontSize:11, color:T.textMuted }}>{selKind==="zone" ? "Polygon zone" : selKind==="slot" ? "Plantrij" : "Edit inline or type exact values"}</div>
                        </div>
                        <Btn size="sm" variant="ghost" onClick={() => { setSelId(null); setSelKind(null); }}>?</Btn>
                    </div>
                    {selKind === "zone" ? (
                        <>
                            <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:8, alignItems:"end" }}>
                                <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                                    <label style={{ fontSize:10, fontWeight:700, color:T.textSub, letterSpacing:0.5, textTransform:"uppercase" }}>Name</label>
                                    <input value={editForm.name} onChange={e=>setEditForm(f=>({...f,name:e.target.value}))} style={{ fontFamily:"inherit", fontSize:13, color:T.text, background:T.bg, border:`1.5px solid ${T.border}`, borderRadius:T.rs, padding:"6px 10px", outline:"none", width:"100%" }} />
                                </div>
                                <Sel label="Type" value={editForm.type} onChange={v=>setEditForm(f=>({...f,type:v}))} options={ZONE_TYPES.map(z => ({ value:z, label:`${ZONE_ICONS[z]} ${LANG[lang]?.[ZONE_LABEL_K[z]] || LANG.en[ZONE_LABEL_K[z]] || z}` }))} />
                            </div>
                            <div style={{ marginTop:10 }}>
                                <Textarea label="Notes" value={editForm.notes} onChange={v=>setEditForm(f=>({...f,notes:v}))} rows={2} />
                            </div>
                            <div style={{ marginTop:10, display:"flex", gap:8, alignItems:"center" }}>
                                <Btn size="sm" variant="primary" onClick={saveEdit}>?? Save Zone</Btn>
                                <span style={{ fontSize:11, color:T.textMuted }}>• {selItem.points?.length || 0} points · {polygonArea(selItem.points||[]).toFixed(1)}m²</span>
                                <div style={{ flex:1 }} />
                                <Btn size="sm" variant="danger" onClick={() => { if (window.confirm("Delete this zone?")) { dispatch({ type:"DELETE_ZONE", payload:selItem.id }); setSelId(null); setSelKind(null); } }}>Delete Zone</Btn>
                            </div>
                        </>
                    ) : selKind === "slot" ? (
                        <>
                            <div style={{ display:"grid", gap:10 }}>
                                <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:8, alignItems:"end" }}>
                                    <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                                        <label style={{ fontSize:10, fontWeight:700, color:T.textSub, letterSpacing:0.5, textTransform:"uppercase" }}>Name</label>
                                        <input value={editForm.name} onChange={e=>setEditForm(f=>({...f,name:e.target.value}))} style={{ fontFamily:"inherit", fontSize:13, color:T.text, background:T.bg, border:`1.5px solid ${T.border}`, borderRadius:T.rs, padding:"6px 10px", outline:"none", width:"100%" }} />
                                    </div>
                                    <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                                        <label style={{ fontSize:10, fontWeight:700, color:T.textSub, letterSpacing:0.5, textTransform:"uppercase" }}>Label</label>
                                        <input value={editForm.label} onChange={e=>setEditForm(f=>({...f,label:e.target.value}))} style={{ fontFamily:"inherit", fontSize:13, color:T.text, background:T.bg, border:`1.5px solid ${T.border}`, borderRadius:T.rs, padding:"6px 10px", outline:"none", width:"100%" }} />
                                    </div>
                                </div>
                                <FormRow cols={4}>
                                    <Input label="Rows" value={editForm.row_count} onChange={e=>setEditForm(f=>({...f,row_count:e.target.value}))} type="number" min="1" max="24" />
                                    <Input label="Spacing (cm)" value={editForm.spacing_cm} onChange={e=>setEditForm(f=>({...f,spacing_cm:e.target.value}))} type="number" min="1" max="200" />
                                    <Input label="Plants" value={editForm.plant_count} onChange={e=>setEditForm(f=>({...f,plant_count:e.target.value}))} type="number" min="0" max="1000" />
                                    <Sel label="Orientation" value={editForm.orientation || "horizontal"} onChange={v=>setEditForm(f=>({...f,orientation:v}))} options={[{ value:"horizontal", label:"Horizontal" }, { value:"vertical", label:"Vertical (90°)" }]} />
                                </FormRow>
                                <Input label="Row length (m)" value={editForm.row_length_m} onChange={e=>setEditForm(f=>({...f,row_length_m:e.target.value}))} type="number" min="0.1" max="100" />
                                <Textarea label="Notes" value={editForm.notes} onChange={v=>setEditForm(f=>({...f,notes:v}))} rows={2} />
                                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                                    <Btn size="sm" variant="primary" onClick={saveEdit}>?? Save</Btn>
                                    <Btn size="sm" variant="secondary" onClick={() => dispatch({ type:"UPDATE_SLOT", payload:{ ...selItem, orientation: selItem.orientation === "vertical" ? "horizontal" : "vertical" } })}>Rotate 90?</Btn>
                                    <Btn size="sm" variant="ghost" onClick={() => openPlantsForSlot(selItem.id)}>?? Plants</Btn>
                                    <Btn size="sm" variant="danger" onClick={() => {
                                        if (window.confirm("Delete this row?")) {
                                            const childMap = new Map();
                                            slots.forEach(s => {
                                                if (!s.parent_id) return;
                                                const list = childMap.get(s.parent_id) || [];
                                                list.push(s);
                                                childMap.set(s.parent_id, list);
                                            });
                                            const descendants = [];
                                            const walk = (id) => {
                                                (childMap.get(id) || []).forEach(child => {
                                                    descendants.push(child);
                                                    walk(child.id);
                                                });
                                            };
                                            walk(selItem.id);
                                            const slotIds = [selItem.id, ...descendants.map(s => s.id)];
                                            const plantsToRemove = plants.filter(p => slotIds.includes(p.slot_id)).map(p => p.id);
                                            plantsToRemove.forEach(id => dispatch({ type:"DELETE_PLANT", payload:id }));
                                            slotIds.slice().reverse().forEach(id => dispatch({ type:"DELETE_SLOT", payload:id }));
                                            setSelId(null);
                                            setSelKind(null);
                                        }
                                    }}>Delete Row</Btn>
                                </div>
                                <div style={{ fontSize:11, color:T.textMuted }}>{Math.max(1, Math.floor(Number(selItem.row_count) || 1))} rows · {selItem.orientation === "vertical" ? "vertical" : "horizontal"}</div>
                                {renderSlotSeedPlan(selItem, { compact: true })}
                            </div>
                        </>
                    ) : (
                        <>
                            <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr", gap:8, alignItems:"end" }}>
                                <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                                    <label style={{ fontSize:10, fontWeight:700, color:T.textSub, letterSpacing:0.5, textTransform:"uppercase" }}>Name</label>
                                    <input value={editForm.name} onChange={e=>setEditForm(f=>({...f,name:e.target.value}))} style={{ fontFamily:"inherit", fontSize:13, color:T.text, background:T.bg, border:`1.5px solid ${T.border}`, borderRadius:T.rs, padding:"6px 10px", outline:"none", width:"100%" }} />
                                </div>
                                {[["X (m)","x",0,garden.width],["Y (m)","y",0,garden.height],["W (m)","width",0.1,garden.width],["H (m)","height",0.1,garden.height]].map(([lbl,key,mn,mx]) => (
                                    <div key={key} style={{ display:"flex", flexDirection:"column", gap:3 }}>
                                        <label style={{ fontSize:10, fontWeight:700, color:T.textSub, letterSpacing:0.5, textTransform:"uppercase" }}>{lbl}</label>
                                        <input type="number" value={editForm[key]} min={mn} max={mx} step={0.1} onChange={e=>setEditForm(f=>({...f,[key]:e.target.value}))} style={{ fontFamily:"inherit", fontSize:13, color:T.text, background:T.bg, border:`1.5px solid ${T.border}`, borderRadius:T.rs, padding:"6px 8px", outline:"none", width:"100%" }} />
                                    </div>
                                ))}
                            </div>
                            {selKind === "struct" && (
                                <div style={{ marginTop:10 }}>
                                    <Sel
                                        label="Linked field"
                                        value={editForm.linked_field_id || ""}
                                        onChange={v=>setEditForm(f=>({...f, linked_field_id:v}))}
                                        options={[
                                            { value:"", label:"No link" },
                                            ...fields.filter(f=>f.garden_id===selItem.garden_id).map(f=>({ value:f.id, label:f.name })),
                                        ]}
                                    />
                                </div>
                            )}
                            {selKind === "struct" && (
                                <div style={{ display:"grid", gap:10, marginTop:10 }}>
                                    <Textarea label="Info" value={editForm.info || ""} onChange={v=>setEditForm(f=>({...f,info:v}))} rows={2} placeholder="Short description shown in details" />
                                    {MAINTENANCE_STRUCT_TYPES.has(selItem.type) && (
                                        <>
                                            <FormRow cols={2}>
                                                <Input label="Species / type" value={editForm.species || ""} onChange={v=>setEditForm(f=>({...f,species:v}))} placeholder="Beech, yew, privet..." />
                                                <Input label="Prune interval (weeks)" value={editForm.prune_interval_weeks || ""} onChange={v=>setEditForm(f=>({...f,prune_interval_weeks:v}))} type="number" min="0" max="52" />
                                            </FormRow>
                                            <Input label="Next prune date" value={editForm.next_prune_date || ""} onChange={v=>setEditForm(f=>({...f,next_prune_date:v}))} type="date" />
                                            <Textarea label="Maintenance notes" value={editForm.maintenance_notes || ""} onChange={v=>setEditForm(f=>({...f,maintenance_notes:v}))} rows={2} placeholder="Cut in late spring and after summer growth" />
                                        </>
                                    )}
                                </div>
                            )}
                            <div style={{ marginTop:10, display:"flex", gap:8, alignItems:"center" }}>
                                <Btn size="sm" variant="primary" onClick={saveEdit}>?? Save</Btn>
                                <span style={{ fontSize:11, color:T.textMuted }}>· {selItem.width}m × {selItem.height}m = {(selItem.width*selItem.height).toFixed(1)}m²</span>
                                <div style={{ flex:1 }} />
                                {selKind === "field" && <Btn size="sm" variant="danger" onClick={() => { if(window.confirm("Delete this bed?")) { dispatch({type:"DELETE_FIELD",payload:selItem.id}); setSelId(null); } }}>Delete Bed</Btn>}
                                {selKind === "struct" && <Btn size="sm" variant="danger" onClick={() => { if(window.confirm("Delete this structure?")) { dispatch({type:"DELETE_STRUCT",payload:selItem.id}); setSelId(null); } }}>Delete Structure</Btn>}
                            </div>
                        </>
                    )}
                </div>
            )}
            {(fields.length>0 || structures.length>0 || zones.length>0) && (
                <div style={{ display:"flex", gap:10, flexWrap:"wrap", padding:"10px 4px 0" }}>
                    {Object.entries(FIELD_LABEL_K).filter(([k]) => fields.some(f=>f.type===k)).map(([k,lk]) => (
                        <div key={k} style={{ display:"flex", alignItems:"center", gap:5 }}><div style={{ width:10, height:10, borderRadius:2, background:FIELD_COLORS[k], flexShrink:0 }}/><span style={{ fontSize:10, color:T.textSub }}>{LANG.en[lk]}</span></div>
                    ))}
                    {Object.entries(STRUCT_LABEL_K).filter(([k]) => structures.some(s=>s.type===k)).map(([k,lk]) => (
                        <div key={k} style={{ display:"flex", alignItems:"center", gap:5 }}><span style={{ fontSize:11 }}>{STRUCT_ICONS[k]}</span><span style={{ fontSize:10, color:T.textSub }}>{LANG.en[lk]}</span></div>
                    ))}
                    {Object.entries(ZONE_LABEL_K).filter(([k]) => zones.some(z=>z.type===k)).map(([k,lk]) => (
                        <div key={k} style={{ display:"flex", alignItems:"center", gap:5 }}><span style={{ fontSize:11 }}>{ZONE_ICONS[k]}</span><span style={{ fontSize:10, color:T.textSub }}>{LANG[lang]?.[lk] || LANG.en[lk] || k}</span></div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ----

// ----
