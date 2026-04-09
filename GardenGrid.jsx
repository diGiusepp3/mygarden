import { useState, useEffect, useReducer, useCallback, useMemo, useRef, createContext, useContext } from "react";
import { T, SCALE } from "./src/theme.js";
import { LANG, useT, LOCALE_MAP } from "./src/i18n.js";
import {
    FIELD_TYPES, FIELD_LABEL_K, FIELD_COLORS,
    STRUCT_TYPES, STRUCT_LABEL_K, STRUCT_ICONS, STRUCT_FILL, STRUCT_STROKE,
    ZONE_TYPES, ZONE_LABEL_K, ZONE_ICONS, ZONE_FILL, ZONE_STROKE,
    PLANT_STATUSES, STATUS_K, STATUS_CFG,
    TASK_STATUS_K, TASK_STATUS_C, TASK_TYPES, TASK_ICONS,
    CATEGORIES, CAT_ICONS, GARDEN_TYPES, USER_COLORS, USER_AVATARS, GH_TYPES,
    SLOT_TYPE_LABELS, SLOT_TYPE_ICONS, WEATHER_CODE_LABELS, SLOT_SEED_COLORS,
} from "./src/constants.js";
import { PLANT_LIB } from "./src/plantLibrary.js";
import { SEED } from "./src/seed.js";
import {
    normalizeState, loadState, saveState, resetState, getSession, setSession,
} from "./src/state/persistence.js";
import {
    fmtDate, isSameDay, isOverdue, clamp, forUser, isInsideGH, gid,
    getHarvestTaskForPlant, syncHarvestTask, removeHarvestTask,
    slotTypeLabel, slotBaseLabel, slotSeedPlan, slotDisplayLabel, childSlotsFor,
    findFieldAtPoint, polygonPointsString, polygonArea, pointInPolygon, polygonCentroid,
} from "./src/helpers.js";
import { reducer } from "./src/state/reducer.js";

// ═══════════════════════════════════════
// UI PRIMITIVES
// ═══════════════════════════════════════
function Btn({ children, variant="primary", size="md", onClick, disabled, style, icon, title }) {
    const [hov, setHov] = useState(false);
    const padding = size==="xs" ? "4px 11px" : size==="sm" ? "6px 14px" : size==="lg" ? "12px 26px" : "9px 18px";
    const base = {
        display:"inline-flex",
        alignItems:"center",
        justifyContent:"center",
        gap:icon?6:4,
        fontFamily:"inherit",
        cursor:disabled?"not-allowed":"pointer",
        border:"1px solid transparent",
        borderRadius:T.radiusLg,
        transition:"all 0.2s ease",
        outline:"none",
        opacity:disabled?0.55:1,
        fontWeight:600,
        whiteSpace:"nowrap",
        fontSize:size==="xs"?11:size==="sm"?12:size==="lg"?15:13,
        padding,
        boxShadow:disabled?"none":"0 2px 6px rgba(0,0,0,0.08)"
    };
    const variants = {
        primary:{ background:T.primary, color:"#fff", border:`1px solid ${T.primary}`, hoverBg:T.primaryHov, hoverBorder:`1px solid ${T.primary}` },
        secondary:{ background:T.surface, color:T.text, border:`1px solid ${T.borderSoft}`, hoverBg:T.surfaceAlt, hoverBorder:`1px solid ${T.borderSoft}` },
        accent:{ background:T.accent, color:"#fff", border:`1px solid ${T.accent}`, hoverBg:T.accentHov, hoverBorder:`1px solid ${T.accent}` },
        ghost:{ background:"transparent", color:T.textSub, border:`1px solid transparent`, hoverBg:"rgba(0,0,0,0.04)", hoverBorder:`1px solid transparent` },
        danger:{ background:T.danger, color:"#fff", border:`1px solid ${T.danger}`, hoverBg:"#A32020", hoverBorder:`1px solid ${T.danger}` },
        success:{ background:T.success, color:"#fff", border:`1px solid ${T.success}`, hoverBg:"#1B5E20", hoverBorder:`1px solid ${T.success}` },
        outline:{ background:"transparent", color:T.primary, border:`1px solid ${T.primary}`, hoverBg:T.primaryBg, hoverBorder:`1px solid ${T.primary}` }
    };
    const config = variants[variant] || variants.primary;
    const currentBg = hov && !disabled ? (config.hoverBg || config.background) : config.background;
    const currentBorder = hov && !disabled ? (config.hoverBorder || config.border) : config.border;
    const currentColor = config.color;
    return (
        <button
            style={{ ...base, background:currentBg, color:currentColor, border:currentBorder, ...style }}
            onClick={onClick}
            disabled={disabled}
            title={title}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
        >
            {icon && <span>{icon}</span>}
            {children}
        </button>
    );
}
function Badge({ children, color, bg, style }) {
    return (
        <span style={{
            display:"inline-flex",
            alignItems:"center",
            justifyContent:"center",
            padding:"4px 10px",
            borderRadius:999,
            fontSize:11,
            fontWeight:700,
            letterSpacing:0.3,
            color:color||T.textSub,
            background:bg||T.surfaceAlt,
            border:`1px solid ${T.borderSoft}`,
            boxShadow:"inset 0 1px 0 rgba(255,255,255,0.4)",
            whiteSpace:"nowrap",
            ...style
        }}>{children}</span>
    );
}
function ListRow({ icon, title, meta, status, actions, hint, accent, actionSlot }) {
    return (
        <div style={{
            display:"flex",
            padding:"14px 16px",
            background:T.surfaceSoft,
            border:`1px solid ${T.borderSoft}`,
            borderRadius:T.radiusLg,
            boxShadow:T.sh,
            alignItems:"center",
            gap:14,
            ...accent
        }}>
            {icon && <div style={{
                width:42,
                height:42,
                borderRadius:T.radiusLg,
                background:T.surfaceAlt,
                display:"flex",
                alignItems:"center",
                justifyContent:"center",
                fontSize:20
            }}>{icon}</div>}
            <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"baseline", gap:8, flexWrap:"wrap" }}>
                    <div style={{ fontSize:15, fontWeight:800, color:T.text, fontFamily:"Fraunces, serif" }}>{title}</div>
                    {meta && <div style={{ fontSize:11, color:T.textMuted }}>{meta}</div>}
                    {status && <Badge color={status.color} bg={status.bg}>{status.label}</Badge>}
                </div>
                {hint && <div style={{ fontSize:12, color:T.textSub, marginTop:4 }}>{hint}</div>}
            </div>
            {(actions || actionSlot) && (
                <div style={{ display:"flex", gap:6, flexWrap:"wrap", justifyContent:"flex-end" }}>
                    {actions && actions.map((act, idx) => <span key={idx}>{act}</span>)}
                    {actionSlot}
                </div>
            )}
        </div>
    );
}
function Input({ label, value, onChange, type="text", placeholder, required, style, min, max, step, hint, disabled=false }) {
    const [foc, setFoc] = useState(false);
    return (
        <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            {label && <label style={{ fontSize:11, fontWeight:700, color:T.textSub, letterSpacing:0.5, textTransform:"uppercase" }}>{label}{required&&<span style={{color:T.danger}}> *</span>}</label>}
            <input type={type} value={value??""} onChange={e=>onChange(e.target.value)} placeholder={placeholder} required={required} min={min} max={max} step={step} disabled={disabled}
                   style={{ fontFamily:"inherit", fontSize:13, color:T.text, background:disabled?T.surfaceAlt:T.surface, border:`1.5px solid ${foc?T.primary:T.border}`, borderRadius:T.rs, padding:"8px 11px", outline:"none", transition:"border 0.15s", cursor:disabled?"not-allowed":"auto", ...style }}
                   onFocus={() => setFoc(true)} onBlur={() => setFoc(false)} />
            {hint && <span style={{ fontSize:11, color:T.textMuted }}>{hint}</span>}
        </div>
    );
}
function Sel({ label, value, onChange, options, required, style }) {
    const [foc, setFoc] = useState(false);
    return (
        <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            {label && <label style={{ fontSize:11, fontWeight:700, color:T.textSub, letterSpacing:0.5, textTransform:"uppercase" }}>{label}{required&&<span style={{color:T.danger}}> *</span>}</label>}
            <select value={value??""} onChange={e=>onChange(e.target.value)} required={required}
                    style={{ fontFamily:"inherit", fontSize:13, color:T.text, background:T.surface, border:`1.5px solid ${foc?T.primary:T.border}`, borderRadius:T.rs, padding:"8px 30px 8px 11px", outline:"none", appearance:"none", backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%235E5955'/%3E%3C/svg%3E")`, backgroundRepeat:"no-repeat", backgroundPosition:"right 10px center", transition:"border 0.15s", ...style }}
                    onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}>
                {options.map(o => <option key={o.value??o} value={o.value??o}>{o.label??o}</option>)}
            </select>
        </div>
    );
}
function Textarea({ label, value, onChange, placeholder, rows=3, hint }) {
    const [foc, setFoc] = useState(false);
    return (
        <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            {label && <label style={{ fontSize:11, fontWeight:700, color:T.textSub, letterSpacing:0.5, textTransform:"uppercase" }}>{label}</label>}
            <textarea value={value??""} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows}
                      style={{ fontFamily:"inherit", fontSize:13, color:T.text, background:T.surface, border:`1.5px solid ${foc?T.primary:T.border}`, borderRadius:T.rs, padding:"8px 11px", outline:"none", resize:"vertical", transition:"border 0.15s" }}
                      onFocus={() => setFoc(true)} onBlur={() => setFoc(false)} />
            {hint && <span style={{ fontSize:11, color:T.textMuted }}>{hint}</span>}
        </div>
    );
}
function Modal({ title, onClose, children, width=540 }) {
    return (
        <div style={{ position:"fixed", inset:0, background:"rgba(10,8,6,0.45)", backdropFilter:"blur(3px)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }} onClick={onClose}>
            <div style={{ background:T.surface, borderRadius:T.rl, width:"100%", maxWidth:width, maxHeight:"92vh", overflow:"auto", boxShadow:T.shLg }} onClick={e=>e.stopPropagation()}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 22px 16px", borderBottom:`1px solid ${T.border}`, position:"sticky", top:0, background:T.surface, zIndex:1 }}>
                    <h2 style={{ margin:0, fontSize:16, fontWeight:800, color:T.text, fontFamily:"Fraunces, serif" }}>{title}</h2>
                    <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", fontSize:18, color:T.textMuted, padding:"2px 6px", lineHeight:1, borderRadius:T.rs }}>✕</button>
                </div>
                <div style={{ padding:22 }}>{children}</div>
            </div>
        </div>
    );
}
function EmptyState({ icon="🌱", title, subtitle, action }) {
    return (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12, padding:"60px 24px", textAlign:"center" }}>
            <div style={{ fontSize:52, filter:"saturate(0.8)" }}>{icon}</div>
            <h3 style={{ margin:0, fontSize:18, fontWeight:800, color:T.text, fontFamily:"Fraunces, serif" }}>{title}</h3>
            {subtitle && <p style={{ margin:0, fontSize:13, color:T.textMuted, maxWidth:300, lineHeight:1.6 }}>{subtitle}</p>}
            {action && <div style={{ marginTop:4 }}>{action}</div>}
        </div>
    );
}
function Card({ children, style, onClick, variant="surface" }) {
    const [hov, setHov] = useState(false);
    const backgroundMap = {
        surface: T.surface,
        soft: T.surfaceSoft,
        muted: T.surfaceMuted,
    };
    const bg = backgroundMap[variant] || T.surface;
    const borderColor = variant==="soft" || variant==="muted" ? T.borderSoft : T.border;
    return (
        <div
            onClick={onClick}
            style={{
                background:bg,
                border:`1px solid ${borderColor}`,
                borderRadius:T.radiusLg,
                boxShadow:(hov && onClick) ? T.shMd : T.sh,
                transition:"all 0.2s ease, transform 0.2s ease",
                cursor:onClick?"pointer":"default",
                transform:(hov && onClick) ? "translateY(-3px)" : "none",
                ...style
            }}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
        >
            {children}
        </div>
    );
}
function StatCard({ icon, label, value, color, sub, onClick }) {
    const [hov, setHov] = useState(false);
    return (
        <div onClick={onClick} style={{ background:T.surface, border:`1px solid ${T.border}`, borderTop:`3px solid ${color}`, borderRadius:T.r, padding:"16px 18px", cursor:onClick?"pointer":"default", boxShadow:hov&&onClick?T.shMd:T.sh, transform:hov&&onClick?"translateY(-2px)":"none", transition:"all 0.15s" }}
             onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                <span style={{ fontSize:22 }}>{icon}</span>
                <span style={{ fontSize:11, fontWeight:700, color:T.textMuted, textTransform:"uppercase", letterSpacing:0.5 }}>{label}</span>
            </div>
            <div style={{ fontSize:28, fontWeight:900, color, fontFamily:"Fraunces, serif", lineHeight:1 }}>{value}</div>
            {sub && <div style={{ fontSize:11, color:T.textMuted, marginTop:4 }}>{sub}</div>}
        </div>
    );
}
const SectionHeader = ({ title, sub }) => (
    <div style={{ display:"flex", alignItems:"baseline", gap:10, marginBottom:12 }}>
        <h2 style={{ margin:0, fontSize:16, fontWeight:800, color:T.text, fontFamily:"Fraunces, serif" }}>{title}</h2>
        {sub && <span style={{ fontSize:12, color:T.textMuted }}>{sub}</span>}
    </div>
);
const FormRow = ({ children, cols }) => <div style={{ display:"grid", gridTemplateColumns:`repeat(${cols||children?.length||2},1fr)`, gap:12 }}>{children}</div>;
const FormActions = ({ onCancel, onSave, saveLabel="Save", t }) => (
    <div style={{ display:"flex", justifyContent:"flex-end", gap:8, paddingTop:8, borderTop:`1px solid ${T.border}`, marginTop:4 }}>
        <Btn variant="secondary" onClick={onCancel}>{t?.("cancel")||"Cancel"}</Btn>
        <Btn variant="primary" onClick={onSave}>{saveLabel}</Btn>
    </div>
);
const InfoBanner = ({ children, icon="ℹ️" }) => (
    <div style={{ display:"flex", gap:8, background:T.infoBg, border:`1px solid ${T.info}22`, borderRadius:T.rs, padding:"9px 12px", fontSize:12, color:T.info, lineHeight:1.5 }}>
        <span style={{ flexShrink:0 }}>{icon}</span><span>{children}</span>
    </div>
);
const PillFilter = ({ value, active, onClick, color, bg }) => (
    <button onClick={onClick} style={{
        padding:"6px 14px",
        borderRadius:999,
        border:`1.5px solid ${active?(color||T.primary):T.borderSoft}`,
        background:active?(bg||T.primaryBg):T.surface,
        color:active?(color||T.primary):T.textSub,
        cursor:"pointer",
        fontSize:12,
        fontWeight:700,
        fontFamily:"inherit",
        transition:"all 0.2s ease",
        whiteSpace:"nowrap",
        boxShadow:active?"0 2px 4px rgba(0,0,0,0.08)":"none"
    }}>{value}</button>
);

const PageShell = ({ children, width = 1180 }) => (
    <div style={{ padding:"32px 0 48px", maxWidth:width, margin:"0 auto", display:"flex", flexDirection:"column", gap:26 }}>
        {children}
    </div>
);

const PageHeader = ({ title, subtitle, meta, actions }) => (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:18, flexWrap:"wrap" }}>
            <div>
                <h1 style={{ margin:0, fontSize:30, fontWeight:900, fontFamily:"Fraunces, serif", color:T.text }}>{title}</h1>
                {subtitle && <p style={{ margin:"6px 0 0", fontSize:13, color:T.textMuted }}>{subtitle}</p>}
            </div>
            {actions && <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>{actions}</div>}
        </div>
        {meta && <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>{meta}</div>}
    </div>
);

const SectionPanel = ({ title, subtitle, action, children, style, accent }) => (
    <Card variant={accent?.variant?"soft":"surface"} style={{
        padding:"20px 22px",
        background:accent?.bg||T.surface,
        borderColor:accent?.border||T.cardBorder,
        minHeight:subtitle||action?0:120,
        ...style
    }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:14, marginBottom:subtitle||action?12:8 }}>
            <div>
                <h3 style={{ margin:0, fontSize:15, fontWeight:900, fontFamily:"Fraunces, serif", color:accent?.titleColor||T.text }}>{title}</h3>
                {subtitle && <p style={{ margin:"6px 0 0", fontSize:12, color:accent?.subColor||T.textMuted }}>{subtitle}</p>}
            </div>
            {action && <div>{action}</div>}
        </div>
        {children}
    </Card>
);

const PanelGroup = ({ children, cols = "repeat(auto-fit,minmax(240px,1fr))" }) => (
    <div style={{ display:"grid", gridTemplateColumns:cols, gap:16 }}>{children}</div>
);

const QuickAction = ({ icon, label, helper, onClick }) => (
    <button onClick={onClick} style={{
        border:`1px solid ${T.borderSoft}`,
        borderRadius:T.radiusLg,
        padding:"12px 18px",
        background:T.surfaceSoft,
        display:"flex",
        alignItems:"center",
        gap:12,
        cursor:"pointer",
        fontSize:13,
        fontWeight:600,
        color:T.text,
        boxShadow:T.sh,
        transition:"transform 0.2s ease"
    }}>
        <span style={{ fontSize:20 }}>{icon}</span>
        <div style={{ textAlign:"left" }}>
            <div style={{ fontWeight:700 }}>{label}</div>
            {helper && <div style={{ fontSize:12, color:T.textMuted }}>{helper}</div>}
        </div>
    </button>
);

const MetaBadge = ({ label, value }) => (
    <Badge color={T.textSub} bg={T.surfaceAlt} style={{ fontSize:11, padding:"4px 10px" }}>
        <span style={{ fontWeight:600, color:T.text }}>{value}</span> {label}
    </Badge>
);

// ═══════════════════════════════════════
// GARDEN EDITOR (SVG with drag/resize/edit)
// ═══════════════════════════════════════
function GardenEditor({ garden, fields, structures, zones, plants = [], slots = [], dispatch, lang }) {
    const [zoom, setZoom] = useState(1);
    const sc = SCALE * zoom;
    const pad = 44;
    const gW = garden.width * sc, gH = garden.height * sc;
    const svgRef = useRef(null);
    const [selId, setSelId] = useState(null);
    const [selKind, setSelKind] = useState(null);
    const dragRef = useRef(null);
    const resizeRef = useRef(null);
    const [livePos, setLivePos] = useState(null);
    const [editForm, setEditForm] = useState(null);
    const [zoneDraft, setZoneDraft] = useState(null);
    const [structDraft, setStructDraft] = useState(null);
    const [structLinkPrompt, setStructLinkPrompt] = useState(null);
    const [pickMenu, setPickMenu] = useState(null);
    const [panelFilter, setPanelFilter] = useState("all");
    const selItem = selId ? (
        selKind === "field" ? fields.find(f => f.id === selId)
        : selKind === "struct" ? structures.find(s => s.id === selId)
        : zones.find(z => z.id === selId)
    ) : null;
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
        setEditForm({ name:selItem.name, x:selItem.x, y:selItem.y, width:selItem.width, height:selItem.height, notes:selItem.notes||"", linked_field_id:selItem.linked_field_id||"" });
    }, [selId, selKind, fields, structures, zones]);
    const getSvgXY = (e) => {
        const r = svgRef.current.getBoundingClientRect();
        return { x:e.clientX-r.left, y:e.clientY-r.top };
    };
    const startDrag = (e, kind, item) => {
        if (zoneDraft || structDraft || e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();
        const { x, y } = getSvgXY(e);
        dragRef.current = { kind, id:item.id, startX:x, startY:y, origX:item.x, origY:item.y };
        setSelId(item.id);
        setSelKind(kind);
        setLivePos({ id:item.id, x:item.x, y:item.y, width:item.width, height:item.height });
    };
    const startResize = (e, kind, item, handle) => {
        if (zoneDraft || structDraft || e.button !== 0) return;
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
            if (pointInPolygon(wx, wy, z.points || [])) hits.push({ kind:"zone", item:z, label:`${ZONE_ICONS[z.type] || "🗺️"} ${z.name}` });
        });
        fields.forEach(f => {
            const ef_ = eff(f);
            if (wx >= ef_.x && wx <= ef_.x + ef_.width && wy >= ef_.y && wy <= ef_.y + ef_.height) {
                hits.push({ kind:"field", item:f, label:`🛏️ ${f.name}` });
            }
        });
        structures.forEach(s => {
            const es_ = eff(s);
            if (wx >= es_.x && wx <= es_.x + es_.width && wy >= es_.y && wy <= es_.y + es_.height) {
                hits.push({ kind:"struct", item:s, label:`${STRUCT_ICONS[s.type] || "🏗️"} ${s.name}` });
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
        if (structDraft) return placeStructAt(e);
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
        if (structDraft) return placeStructAt(e);
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
    const placeStructAt = (e) => {
        if (!structDraft) return;
        const { x, y } = getSvgXY(e);
        const cx = clamp((x - pad) / sc, 0, garden.width);
        const cy = clamp((y - pad) / sc, 0, garden.height);
        const type = structDraft.type || "greenhouse";
        const defaults = {
            greenhouse: { width: 5.5, height: 4.5 },
            tunnel_greenhouse: { width: 6.5, height: 1.2 },
            compost_zone: { width: 2.5, height: 2.0 },
            water_point: { width: 0.8, height: 0.8 },
            shed: { width: 2.4, height: 2.0 },
            path: { width: 1.0, height: 4.0 },
            fence: { width: 0.4, height: 4.0 },
            animal_enclosure: { width: 4.0, height: 4.0 },
        }[type] || { width: 4.0, height: 3.0 };
        const width = defaults.width;
        const height = defaults.height;
        const xPos = clamp(cx - width / 2, 0, Math.max(0, garden.width - width));
        const yPos = clamp(cy - height / 2, 0, Math.max(0, garden.height - height));
        const candidateField = findFieldAtPoint(fields, cx, cy);
        const createStruct = (linkedFieldId = "") => {
            dispatch({
            type:"ADD_STRUCT",
            payload:{
                id: gid(),
                garden_id: garden.id,
                name: structDraft.name.trim() || (type === "greenhouse" ? "New Greenhouse" : "New Structure"),
                type,
                x: Math.round(xPos * 10) / 10,
                y: Math.round(yPos * 10) / 10,
                width,
                height,
                notes: structDraft.notes || "",
                ventilated: false,
                temperature: "",
                humidity: "",
                linked_field_id: linkedFieldId || "",
            }
            });
            setStructDraft(null);
            setStructLinkPrompt(null);
        };
        if (candidateField) {
            setStructLinkPrompt({
                field: candidateField,
                create: createStruct,
                name: structDraft.name,
                type,
            });
            return;
        }
        createStruct("");
    };
    const beginZoneDraft = () => {
        setZoneDraft({ name:"New Zone", type:"grass", notes:"", points:[] });
        setSelId(null);
        setSelKind(null);
    };
    const cancelZoneDraft = () => setZoneDraft(null);
    const beginStructDraft = () => {
        setStructDraft({ name:"New Greenhouse", type:"greenhouse", notes:"" });
        setSelId(null);
        setSelKind(null);
    };
    const cancelStructDraft = () => setStructDraft(null);
    const cancelStructLinkPrompt = () => setStructLinkPrompt(null);
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
        const x = clamp(+editForm.x, 0, garden.width - 0.1);
        const y = clamp(+editForm.y, 0, garden.height - 0.1);
        const width = clamp(+editForm.width, 0.1, garden.width - x);
        const height = clamp(+editForm.height, 0.1, garden.height - y);
        dispatch({
            type: selKind==="field" ? "UPDATE_FIELD" : "UPDATE_STRUCT",
            payload:{
                ...selItem,
                name:editForm.name,
                x,
                y,
                width,
                height,
                notes:editForm.notes,
                linked_field_id: selKind==="struct" ? editForm.linked_field_id || "" : selItem.linked_field_id || "",
            }
        });
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
                        {ZONE_ICONS[zone.type] || "🗺️"} {zone.name}
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
                    📐 {garden.width}m × {garden.height}m · <span style={{ color:T.primary }}>Drag</span> to move · <span style={{ color:T.accent }}>Handles</span> to resize · Click to edit
                </span>
                <Btn size="sm" variant={zoneDraft ? "danger" : "accent"} onClick={zoneDraft ? cancelZoneDraft : beginZoneDraft}>
                    {zoneDraft ? "Cancel Zone" : "Add Zone"}
                </Btn>
                <Btn size="sm" variant={structDraft ? "danger" : "secondary"} onClick={structDraft ? cancelStructDraft : beginStructDraft}>
                    {structDraft ? "Cancel Place" : "Place Structure"}
                </Btn>
                {zoneDraft && <Btn size="sm" variant="primary" onClick={finishZoneDraft} disabled={zoneDraft.points.length < 3}>Finish Zone</Btn>}
                <Btn size="sm" variant="secondary" onClick={() => setZoom(z => Math.max(0.35, +(z-0.15).toFixed(2)))}>−</Btn>
                <span style={{ fontSize:12, color:T.textSub, minWidth:38, textAlign:"center", fontWeight:700 }}>{Math.round(zoom*100)}%</span>
                <Btn size="sm" variant="secondary" onClick={() => setZoom(z => Math.min(2.5, +(z+0.15).toFixed(2)))}>+</Btn>
                <Btn size="sm" variant="ghost" onClick={() => setZoom(1)}>Reset</Btn>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"minmax(0,1fr) 300px", gap:12, alignItems:"start" }}>
                <div style={{ overflow:"auto", background:"#F2EDE4", minHeight:320, border:`1px solid ${T.border}`, borderTop:"none" }}>
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
                        return (
                            <g key={st.id}>
                                <rect x={sx} y={sy} width={sw} height={sh} fill={STRUCT_FILL[st.type] || "rgba(128,128,128,0.2)"} stroke={isSel ? T.accent : (STRUCT_STROKE[st.type] || "#888")} strokeWidth={isSel ? 2.5 : (isGH ? 2 : 1.2)} strokeDasharray={isGH ? "8,4" : "none"} rx={isGH ? 5 : 3} style={{ cursor:"move" }} onMouseDown={e => startDrag(e, "struct", st)} onClick={e => handleItemPick("struct", st, e)} />
                                <text x={sx+sw/2} y={sy+sh/2-fs*0.3} textAnchor="middle" fontSize={Math.min(fs+1,15)} fontFamily="DM Sans,sans-serif" fill={STRUCT_STROKE[st.type] || "#555"} fontWeight={700} style={{ pointerEvents:"none" }}>{STRUCT_ICONS[st.type]}</text>
                                {sh > sc*0.6 && <text x={sx+sw/2} y={sy+sh/2+fs*0.9} textAnchor="middle" fontSize={clamp(fs,7,11)} fontFamily="DM Sans,sans-serif" fill={STRUCT_STROKE[st.type] || "#555"} fontWeight={600} style={{ pointerEvents:"none" }}>{st.name}</text>}
                                {sh > sc*1.0 && plantCount > 0 && <text x={sx+sw/2} y={sy+sh/2+fs*2.55} textAnchor="middle" fontSize={8} fontFamily="DM Sans,sans-serif" fill={T.primary} fontWeight={700} style={{ pointerEvents:"none" }}>{plantCount} plants</text>}
                                {sh > sc*1.2 && <text x={sx+sw/2} y={sy+sh/2+fs*1.9} textAnchor="middle" fontSize={8} fontFamily="DM Sans,sans-serif" fill={STRUCT_STROKE[st.type] || "#888"} style={{ pointerEvents:"none" }}>{e_.width}×{e_.height}m</text>}
                                {isSel && renderHandles("struct", st)}
                            </g>
                        );
                    })}
                    {fields.map(f => {
                        const e_ = eff(f), fx = pad + e_.x*sc, fy = pad + e_.y*sc, fw = e_.width*sc, fh = e_.height*sc;
                        const fc = FIELD_COLORS[f.type] || T.primary;
                        const fs = getFontSize(e_.width, e_.height, f.name);
                        const isSel = selId === f.id;
                        return (
                            <g key={f.id}>
                                <rect x={fx} y={fy} width={fw} height={fh} fill={fc+"28"} stroke={isSel ? T.accent : fc} strokeWidth={isSel ? 2.5 : 2} rx={3} style={{ cursor:"move" }} onMouseDown={e => startDrag(e, "field", f)} onClick={e => handleItemPick("field", f, e)} />
                                <rect x={fx} y={fy} width={fw} height={Math.min(fh,4)} fill={fc} opacity={0.7} style={{ pointerEvents:"none" }} />
                                <text x={fx+fw/2} y={fy+fh/2+fs*0.4} textAnchor="middle" fontSize={clamp(fs,7,13)} fontFamily="DM Sans,sans-serif" fill={fc} fontWeight={800} style={{ pointerEvents:"none" }}>{f.name}</text>
                                {fh > sc*0.8 && <text x={fx+fw/2} y={fy+fh/2+fs*1.5} textAnchor="middle" fontSize={8} fontFamily="DM Sans,sans-serif" fill={fc+"AA"} style={{ pointerEvents:"none" }}>{e_.width}×{e_.height}m</text>}
                                {isSel && renderHandles("field", f)}
                            </g>
                        );
                    })}
                    <rect x={pad} y={pad} width={gW} height={gH} fill="none" stroke={T.primary} strokeWidth={2.5} rx={3} style={{ pointerEvents:"none" }} />
                    <text x={pad+gW-6} y={pad+16} textAnchor="end" fontSize={14} fill={T.primary} fontFamily="Fraunces,serif" fontWeight={800}>N↑</text>
                    <g transform={`translate(${pad},${pad+gH+16})`}>
                        <rect x={0} y={0} width={sc} height={5} fill={T.primary} opacity={0.4} rx={2} />
                        <text x={sc/2} y={17} textAnchor="middle" fontSize={9} fill={T.textSub} fontFamily="DM Sans,sans-serif">1 metre</text>
                    </g>
                    </svg>
                </div>
                <Card style={{ padding:14, position:"sticky", top:12, alignSelf:"start", maxHeight:"calc(100vh - 140px)", overflow:"auto" }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, marginBottom:10 }}>
                        <div>
                            <div style={{ fontSize:12, fontWeight:800, color:T.text }}>Quick panel</div>
                            <div style={{ fontSize:11, color:T.textMuted }}>{fields.length} beds · {structures.length} structures · {zones.length} zones</div>
                        </div>
                    </div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:10 }}>
                        {["all","fields","structs","greenhouses","zones"].map(k => (
                            <Btn key={k} size="sm" variant={panelFilter===k ? "primary" : "secondary"} onClick={()=>setPanelFilter(k)} style={{ flex:"1 1 110px", justifyContent:"center" }}>
                                {k === "all" ? "All" : k === "fields" ? "Beds" : k === "structs" ? "Structs" : k === "greenhouses" ? "Greenhouses" : "Zones"}
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
                                            <div style={{ fontSize:11, color:T.textMuted }}>{LANG[lang]?.[FIELD_LABEL_K[f.type]] || f.type} · {f.width}×{f.height}m</div>
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
                                                    <div style={{ fontSize:12, fontWeight:800, color:T.text }}>{STRUCT_ICONS[st.type] || "🏗️"} {st.name}</div>
                                                    <div style={{ fontSize:11, color:T.textMuted }}>{LANG[lang]?.[STRUCT_LABEL_K[st.type]] || st.type} · {st.width}×{st.height}m</div>
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
                                            <div style={{ fontSize:12, fontWeight:800, color:T.text }}>{ZONE_ICONS[z.type] || "🗺️"} {z.name}</div>
                                            <div style={{ fontSize:11, color:T.textMuted }}>{LANG[lang]?.[ZONE_LABEL_K[z.type]] || z.type} · {polygonArea(z.points||[]).toFixed(1)}m²</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
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
            {structDraft && (
                <div style={{ background:T.surfaceAlt, border:`1px solid ${T.border}`, borderTop:"none", borderRadius:`0 0 ${T.r} ${T.r}`, padding:"12px 18px", fontSize:12, color:T.textSub, display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
                    <strong style={{ color:T.primary }}>Place structure</strong>
                    <span>Click on the map to drop a greenhouse or other structure.</span>
                    <div style={{ marginLeft:"auto", display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                        <Sel label="Type" value={structDraft.type} onChange={v=>setStructDraft(d=>({ ...(d||{}), type:v }))} options={STRUCT_TYPES.map(st => ({ value:st, label:`${STRUCT_ICONS[st]} ${LANG[lang]?.[STRUCT_LABEL_K[st]] || st}` }))} />
                        <Input label="Name" value={structDraft.name} onChange={v=>setStructDraft(d=>({ ...(d||{}), name:v }))} placeholder="Main Greenhouse" />
                    </div>
                </div>
            )}
            {structLinkPrompt && (
                <Modal title={`🔗 Link structure to field?`} onClose={cancelStructLinkPrompt} width={520}>
                    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                        <InfoBanner icon="🔗">
                            You dropped <strong>{structLinkPrompt.name || "this structure"}</strong> on <strong>{structLinkPrompt.field.name}</strong>.
                            Link them so the greenhouse/tunnel stays associated with that field?
                        </InfoBanner>
                        <div style={{ display:"flex", gap:8, justifyContent:"flex-end", flexWrap:"wrap" }}>
                            <Btn variant="secondary" onClick={() => structLinkPrompt.create("")}>No link</Btn>
                            <Btn variant="primary" onClick={() => structLinkPrompt.create(structLinkPrompt.field.id)}>Link to field</Btn>
                        </div>
                    </div>
                </Modal>
            )}
            {selItem && editForm && (
                <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderTop:"none", borderRadius:`0 0 ${T.r} ${T.r}`, padding:"14px 18px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                        <span style={{ fontSize:20 }}>{selKind==="struct" ? (STRUCT_ICONS[selItem.type]||"🏗️") : selKind==="zone" ? (ZONE_ICONS[selItem.type]||"🗺️") : "🛏️"}</span>
                        <div style={{ flex:1 }}>
                            <div style={{ fontSize:13, fontWeight:700, color:T.text }}>{selItem.name}</div>
                            <div style={{ fontSize:11, color:T.textMuted }}>{selKind==="zone" ? "Polygon zone" : "Edit inline or type exact values"}</div>
                        </div>
                        <Btn size="sm" variant="ghost" onClick={() => { setSelId(null); setSelKind(null); }}>✕</Btn>
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
                                <Btn size="sm" variant="primary" onClick={saveEdit}>💾 Save Zone</Btn>
                                <span style={{ fontSize:11, color:T.textMuted }}>· {selItem.points?.length || 0} points · {polygonArea(selItem.points||[]).toFixed(1)}m²</span>
                                <div style={{ flex:1 }} />
                                <Btn size="sm" variant="danger" onClick={() => { if (window.confirm("Delete this zone?")) { dispatch({ type:"DELETE_ZONE", payload:selItem.id }); setSelId(null); setSelKind(null); } }}>Delete Zone</Btn>
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
                            <div style={{ marginTop:10, display:"flex", gap:8, alignItems:"center" }}>
                                <Btn size="sm" variant="primary" onClick={saveEdit}>💾 Save</Btn>
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

// ═══════════════════════════════════════
// LOGIN SCREEN
// ═══════════════════════════════════════
function LoginScreen({ state, dispatch, onLogin }) {
    const [mode, setMode] = useState("login"); // "login" | "register"
    const [lang, setLang] = useState("nl");
    const t = useT(lang);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [confirmPw, setConfirmPw] = useState("");
    const [avatar, setAvatar] = useState("🌱");
    const [color, setColor] = useState(USER_COLORS[0]);
    const [error, setError] = useState("");
    const [shake, setShake] = useState(false);

    const doShake = () => { setShake(true); setTimeout(() => setShake(false), 500); };

    const handleLogin = () => {
        setError("");
        const user = state.users.find(u => u.email?.toLowerCase() === email.toLowerCase() && u.password === password);
        if (!user) { setError(t("wrong_password")); doShake(); return; }
        dispatch({ type:"SET_ACTIVE_USER", payload: user.id });
        setSession(user.id);
        onLogin(user.id);
    };

    const handleRegister = () => {
        setError("");
        if (!name.trim() || !email.trim() || !password) { setError("Please fill in all required fields."); doShake(); return; }
        if (password !== confirmPw) { setError(t("passwords_no_match")); doShake(); return; }
        if (state.users.find(u => u.email?.toLowerCase() === email.toLowerCase())) { setError(t("email_taken")); doShake(); return; }
        const newUser = { id:gid(), name:name.trim(), email:email.trim().toLowerCase(), password, avatar, color, settings:{ lang }, created_at:new Date().toISOString() };
        dispatch({ type:"ADD_USER", payload: newUser });
        setSession(newUser.id);
        onLogin(newUser.id);
    };

    const LANGS = [["en","🇬🇧"],["nl","🇧🇪"],["fr","🇫🇷"],["de","🇩🇪"]];

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;0,9..144,800;0,9..144,900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        html, body { margin:0; padding:0; font-family:'DM Sans',system-ui,sans-serif; background:#F5F0E8; }
        @keyframes gg-shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }
        .gg-shake { animation: gg-shake 0.45s ease; }
      `}</style>
            <div style={{ minHeight:"100vh", background:`linear-gradient(160deg, #1E4A08 0%, #2B5C10 40%, #F5F0E8 100%)`, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
                <div style={{ width:"100%", maxWidth:420 }}>
                    {/* Logo */}
                    <div style={{ textAlign:"center", marginBottom:32 }}>
                        <div style={{ fontSize:56, marginBottom:8 }}>🌱</div>
                        <div style={{ fontSize:28, fontWeight:900, color:"#FFF", fontFamily:"Fraunces,serif", letterSpacing:-0.5 }}>MyGarden</div>
                        <div style={{ fontSize:13, color:"rgba(255,255,255,0.65)", marginTop:4 }}>{t("app_subtitle")}</div>
                        {/* Lang picker */}
                        <div style={{ display:"flex", gap:6, justifyContent:"center", marginTop:12 }}>
                            {LANGS.map(([code,flag]) => (
                                <button key={code} onClick={()=>setLang(code)} style={{ background:lang===code?"rgba(255,255,255,0.25)":"rgba(255,255,255,0.08)", border:`1.5px solid ${lang===code?"rgba(255,255,255,0.6)":"transparent"}`, borderRadius:T.rs, padding:"4px 10px", cursor:"pointer", fontSize:16, color:"#FFF", transition:"all 0.15s" }}>{flag}</button>
                            ))}
                        </div>
                    </div>

                    {/* Card */}
                    <div className={shake?"gg-shake":""} style={{ background:T.surface, borderRadius:T.rl, padding:"28px 30px", boxShadow:T.shLg }}>
                        <h2 style={{ margin:"0 0 4px", fontSize:20, fontWeight:900, color:T.text, fontFamily:"Fraunces,serif" }}>
                            {mode==="login" ? t("login_title") : t("register_title")}
                        </h2>
                        <p style={{ margin:"0 0 20px", fontSize:13, color:T.textMuted }}>{mode==="login" ? t("login_sub") : t("register_sub")}</p>

                        {error && <div style={{ background:T.dangerBg, border:`1px solid ${T.danger}33`, borderRadius:T.rs, padding:"9px 12px", fontSize:13, color:T.danger, marginBottom:14 }}>⚠️ {error}</div>}

                        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                            {mode==="register" && (
                                <>
                                    <Input label={t("display_name")} value={name} onChange={setName} placeholder="e.g. Marie" required/>
                                    <div>
                                        <label style={{ fontSize:11, fontWeight:700, color:T.textSub, letterSpacing:0.5, textTransform:"uppercase", display:"block", marginBottom:6 }}>Avatar</label>
                                        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                                            {USER_AVATARS.map(a => <button key={a} onClick={()=>setAvatar(a)} style={{ width:36, height:36, borderRadius:T.rs, border:`2px solid ${avatar===a?T.primary:T.border}`, background:avatar===a?T.primaryBg:T.surface, fontSize:18, cursor:"pointer" }}>{a}</button>)}
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize:11, fontWeight:700, color:T.textSub, letterSpacing:0.5, textTransform:"uppercase", display:"block", marginBottom:6 }}>{t("colour")}</label>
                                        <div style={{ display:"flex", gap:6 }}>
                                            {USER_COLORS.map(c => <button key={c} onClick={()=>setColor(c)} style={{ width:26, height:26, borderRadius:99, background:c, border:`3px solid ${color===c?"#fff":"transparent"}`, outline:`2px solid ${color===c?c:"transparent"}`, cursor:"pointer" }}/>)}
                                        </div>
                                    </div>
                                </>
                            )}
                            <Input label={t("email")} value={email} onChange={setEmail} type="email" placeholder="naam@example.com" required/>
                            <Input label={t("password")} value={password} onChange={setPassword} type="password" placeholder="••••••••" required/>
                            {mode==="register" && <Input label={t("confirm_password")} value={confirmPw} onChange={setConfirmPw} type="password" placeholder="••••••••" required/>}
                        </div>

                        <Btn variant="primary" size="lg" style={{ width:"100%", marginTop:18, justifyContent:"center" }} onClick={mode==="login"?handleLogin:handleRegister}>
                            {mode==="login" ? t("login") : t("register")}
                        </Btn>

                        <div style={{ textAlign:"center", marginTop:16, fontSize:13, color:T.textMuted }}>
                            {mode==="login" ? t("no_account") : t("have_account")}{" "}
                            <button onClick={()=>{ setMode(mode==="login"?"register":"login"); setError(""); }} style={{ background:"none", border:"none", color:T.primary, fontWeight:700, cursor:"pointer", fontSize:13, fontFamily:"inherit" }}>
                                {mode==="login" ? t("register") : t("login")}
                            </button>
                        </div>
                    </div>

                    {/* Demo hint */}
                    <div style={{ textAlign:"center", marginTop:14, fontSize:12, color:"rgba(255,255,255,0.45)" }}>
                        Demo accounts: alex@gardengrid.app / garden123 &nbsp;·&nbsp; sam@gardengrid.app / moestuin1
                    </div>
                </div>
            </div>
        </>
    );
}

// ═══════════════════════════════════════
// ACCOUNT SCREEN
// ═══════════════════════════════════════
function AccountScreen({ state, dispatch, lang, onLogout }) {
    const t = useT(lang);
    const uid = state.activeUserId;
    const user = state.users.find(u => u.id === uid);
    if (!user) return null;

    const [tab, setTab] = useState("profile"); // "profile" | "password" | "stats"
    const [saved, setSaved] = useState(false);
    const showSaved = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

    // Profile form
    const [pName, setPName] = useState(user.name);
    const [pEmail, setPEmail] = useState(user.email||"");
    const [pAvatar, setPAvatar] = useState(user.avatar);
    const [pColor, setPColor] = useState(user.color);
    const [profileError, setProfileError] = useState("");

    const saveProfile = () => {
        setProfileError("");
        if (!pName.trim()) { setProfileError("Display name is required."); return; }
        const emailTaken = state.users.find(u => u.id!==uid && u.email?.toLowerCase()===pEmail.toLowerCase());
        if (pEmail && emailTaken) { setProfileError(t("email_taken")); return; }
        dispatch({ type:"UPDATE_USER", payload:{ ...user, name:pName.trim(), email:pEmail.trim(), avatar:pAvatar, color:pColor } });
        showSaved();
    };

    // Password form
    const [curPw, setCurPw] = useState("");
    const [newPw, setNewPw] = useState("");
    const [confPw, setConfPw] = useState("");
    const [pwError, setPwError] = useState("");

    const savePassword = () => {
        setPwError("");
        if (curPw !== user.password) { setPwError(t("wrong_current")); return; }
        if (newPw !== confPw) { setPwError(t("passwords_no_match")); return; }
        if (!newPw) { setPwError("New password cannot be empty."); return; }
        dispatch({ type:"UPDATE_USER", payload:{ ...user, password:newPw } });
        setCurPw(""); setNewPw(""); setConfPw("");
        showSaved();
    };

    // Stats
    const myGardens = forUser(state.gardens, uid);
    const myPlants  = forUser(state.plants, uid);
    const myTasks   = forUser(state.tasks, uid);
    const joined    = user.created_at ? new Date(user.created_at).toLocaleDateString(LOCALE_MAP[lang]||"en-GB",{day:"numeric",month:"long",year:"numeric"}) : "—";

    const TABS = [["profile","👤",t("edit_profile")],["password","🔑",t("change_password")],["stats","📊",t("your_stats")]];

    return (
        <div style={{ padding:28, maxWidth:600, margin:"0 auto" }}>
            <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:28 }}>
                <div style={{ width:64, height:64, borderRadius:99, background:user.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, flexShrink:0, boxShadow:T.shMd }}>{user.avatar}</div>
                <div style={{ flex:1 }}>
                    <h1 style={{ margin:0, fontSize:22, fontWeight:900, fontFamily:"Fraunces,serif", color:T.text }}>{user.name}</h1>
                    <div style={{ fontSize:13, color:T.textMuted, marginTop:2 }}>{user.email} · {t("joined")} {joined}</div>
                </div>
                {saved && <Badge color={T.success} bg={T.successBg}>✓ {t("account_saved")}</Badge>}
                <Btn variant="ghost" onClick={onLogout} icon="🚪">{t("logout")}</Btn>
            </div>

            {/* Tab bar */}
            <div style={{ display:"flex", gap:2, marginBottom:20, background:T.surfaceAlt, padding:4, borderRadius:T.r }}>
                {TABS.map(([id,icon,label]) => (
                    <button key={id} onClick={()=>setTab(id)} style={{ flex:1, padding:"9px 12px", borderRadius:T.rs, border:"none", background:tab===id?T.surface:"transparent", color:tab===id?T.text:T.textMuted, cursor:"pointer", fontFamily:"inherit", fontWeight:tab===id?700:500, fontSize:13, transition:"all 0.15s", display:"flex", alignItems:"center", justifyContent:"center", gap:6, boxShadow:tab===id?T.sh:"none" }}>
                        <span>{icon}</span><span>{label}</span>
                    </button>
                ))}
            </div>

            {/* Profile tab */}
            {tab==="profile" && (
                <Card style={{ padding:22 }}>
                    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                        {profileError && <div style={{ background:T.dangerBg, borderRadius:T.rs, padding:"9px 12px", fontSize:13, color:T.danger }}>⚠️ {profileError}</div>}
                        <Input label={t("display_name")} value={pName} onChange={setPName} required/>
                        <Input label={t("email")} value={pEmail} onChange={setPEmail} type="email"/>
                        <div>
                            <label style={{ fontSize:11, fontWeight:700, color:T.textSub, letterSpacing:0.5, textTransform:"uppercase", display:"block", marginBottom:8 }}>Avatar</label>
                            <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
                                {USER_AVATARS.map(a => <button key={a} onClick={()=>setPAvatar(a)} style={{ width:42, height:42, borderRadius:T.rs, border:`2.5px solid ${pAvatar===a?T.primary:T.border}`, background:pAvatar===a?T.primaryBg:T.surface, fontSize:22, cursor:"pointer", transition:"all 0.15s" }}>{a}</button>)}
                            </div>
                        </div>
                        <div>
                            <label style={{ fontSize:11, fontWeight:700, color:T.textSub, letterSpacing:0.5, textTransform:"uppercase", display:"block", marginBottom:8 }}>{t("colour")}</label>
                            <div style={{ display:"flex", gap:8 }}>
                                {USER_COLORS.map(c => <button key={c} onClick={()=>setPColor(c)} style={{ width:32, height:32, borderRadius:99, background:c, border:`3px solid ${pColor===c?"#fff":"transparent"}`, outline:`2.5px solid ${pColor===c?c:"transparent"}`, cursor:"pointer", transition:"all 0.15s" }}/>)}
                            </div>
                        </div>
                        {/* Preview */}
                        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:T.surfaceAlt, borderRadius:T.rs }}>
                            <div style={{ width:38, height:38, borderRadius:99, background:pColor, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{pAvatar}</div>
                            <div>
                                <div style={{ fontWeight:700, color:T.text, fontSize:14 }}>{pName||"…"}</div>
                                <div style={{ fontSize:11, color:T.textMuted }}>{pEmail||"no email"}</div>
                            </div>
                        </div>
                        <Btn variant="primary" onClick={saveProfile} icon="💾">{t("save")}</Btn>
                    </div>
                </Card>
            )}

            {/* Password tab */}
            {tab==="password" && (
                <Card style={{ padding:22 }}>
                    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                        {pwError && <div style={{ background:T.dangerBg, borderRadius:T.rs, padding:"9px 12px", fontSize:13, color:T.danger }}>⚠️ {pwError}</div>}
                        <Input label={t("current_password")} value={curPw} onChange={setCurPw} type="password" placeholder="••••••••" required/>
                        <Input label={t("new_password")} value={newPw} onChange={setNewPw} type="password" placeholder="••••••••" required/>
                        <Input label={t("confirm_new")} value={confPw} onChange={setConfPw} type="password" placeholder="••••••••" required/>
                        <div style={{ fontSize:12, color:T.textMuted, padding:"8px 12px", background:T.surfaceAlt, borderRadius:T.rs }}>
                            🔒 Wachtwoorden worden lokaal opgeslagen in je browser. MyGarden verstuurt geen gegevens naar een server.
                        </div>
                        <Btn variant="primary" onClick={savePassword} icon="🔑">{t("change_password")}</Btn>
                    </div>
                </Card>
            )}

            {/* Stats tab */}
            {tab==="stats" && (
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                        <StatCard icon="🌿" label={t("gardens")} value={myGardens.length} color={T.primary}/>
                        <StatCard icon="🌱" label={t("plant_varieties")} value={myPlants.length} color="#388E3C"/>            <StatCard icon="✅" label={t("tasks_pending")} value={myTasks.filter(t2=>t2.status==="pending").length} color={T.warning}/>
                        <StatCard icon="🧺" label={t("ready_to_harvest")} value={myPlants.filter(p=>p.status==="harvestable").length} color={T.accent}/>
                    </div>
                    <Card style={{ padding:16 }}>
                        <div style={{ fontSize:12, color:T.textMuted, display:"flex", flexDirection:"column", gap:6 }}>
                            <div>📅 {t("joined")}: <strong style={{color:T.text}}>{joined}</strong></div>
                            <div>🌱 Total plants in garden: <strong style={{color:T.text}}>{myPlants.reduce((s,p)=>s+(+p.quantity||0),0)}</strong></div>
                            <div>🛏️ Total bed area: <strong style={{color:T.text}}>{forUser(state.fields,uid).reduce((s,f)=>s+f.width*f.height,0).toFixed(1)}m²</strong></div>
                            <div>✓ Tasks completed: <strong style={{color:T.success}}>{myTasks.filter(t2=>t2.status==="done").length}</strong></div>
                        </div>
                    </Card>
                    {/* Danger zone */}
                    <Card style={{ padding:16, border:`1px solid ${T.danger}44` }}>
                        <div style={{ fontSize:13, fontWeight:700, color:T.danger, marginBottom:8 }}>⚠️ {t("danger_zone")}</div>
                        <div style={{ fontSize:12, color:T.textSub, marginBottom:12 }}>{t("delete_account_confirm")}</div>
                        <Btn variant="danger" onClick={() => {
                            if (window.confirm(t("delete_account_confirm"))) {
                                // Remove this user's data
                                dispatch({ type:"DELETE_USER", payload: uid });
                                setSession(null);
                                onLogout();
                            }
                        }}>{t("delete_account")}</Btn>
                    </Card>
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════
// SIDEBAR
// ═══════════════════════════════════════
function Sidebar({ screen, setScreen, pendingTasks, collapsed, setCollapsed, state, dispatch, lang, onLogout }) {
    const t = useT(lang);
    const uid = state.activeUserId;
    const activeUser = state.users.find(u => u.id === uid);
    const NAV = [
        { id:"dashboard",   icon:"🏡", key:"nav_dashboard" },
        { id:"gardens",     icon:"🌿", key:"nav_gardens" },
        { id:"editor",      icon:"📐", key:"nav_editor" },
        { id:"fields",      icon:"🛏️",  key:"nav_fields" },
        { id:"plants",      icon:"🌱", key:"nav_plants" },
        { id:"tasks",       icon:"✅", key:"nav_tasks" },
        { id:"greenhouses", icon:"🏡", key:"nav_greenhouses" },
        { id:"account",     icon:"👤", key:"account" },
        { id:"settings",    icon:"⚙️", key:"nav_settings" },
        ...(activeUser?.is_dev ? [{ id:"dev", icon:"⚡", key:"dev" }] : []),
    ];
    return (
        <nav style={{ width:collapsed?64:220, flexShrink:0, background:`linear-gradient(175deg,#1E4A08 0%,#2B5C10 60%,#3D7A1A 100%)`, display:"flex", flexDirection:"column", height:"100vh", position:"sticky", top:0, transition:"width 0.2s", overflow:"hidden", zIndex:10 }}>
            {/* User header — click to go to Account */}
            <div onClick={() => setScreen("account")} style={{ padding:collapsed?"14px 8px":"14px 14px 12px", borderBottom:"1px solid rgba(255,255,255,0.1)", cursor:"pointer", transition:"background 0.15s" }}
                 onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.07)"}
                 onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:34, height:34, borderRadius:99, background:activeUser?.color||T.primary, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0, border:"2px solid rgba(255,255,255,0.3)" }}>{activeUser?.avatar||"🌱"}</div>
                    {!collapsed && (
                        <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:13, fontWeight:800, color:"#FFF", fontFamily:"Fraunces,serif", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{activeUser?.name||"Account"}</div>
                            <div style={{ fontSize:9, color:"rgba(255,255,255,0.45)", marginTop:1 }}>MyGarden · {t("app_subtitle")}</div>
                        </div>
                    )}
                    {!collapsed && <span style={{ color:"rgba(255,255,255,0.4)", fontSize:11 }}>→</span>}
                </div>
            </div>
            {/* Nav */}
            <div style={{ flex:1, padding:"8px 8px", display:"flex", flexDirection:"column", gap:2, overflowY:"auto" }}>
                {NAV.map(item => {
                    const active = screen===item.id;
                    return (
                        <button key={item.id} onClick={() => setScreen(item.id)} title={collapsed?t(item.key):undefined}
                                style={{ display:"flex", alignItems:"center", gap:10, padding:collapsed?"10px":"9px 11px", borderRadius:T.rs, background:active?"rgba(255,255,255,0.18)":"transparent", border:"none", cursor:"pointer", color:active?"#FFF":"rgba(255,255,255,0.62)", fontSize:13, fontWeight:active?700:500, fontFamily:"inherit", transition:"all 0.15s", width:"100%", justifyContent:collapsed?"center":"flex-start" }}
                                onMouseEnter={e=>!active&&(e.currentTarget.style.background="rgba(255,255,255,0.1)")}
                                onMouseLeave={e=>!active&&(e.currentTarget.style.background="transparent")}>
                            <span style={{ fontSize:18, flexShrink:0 }}>{item.icon}</span>
                            {!collapsed && <span style={{ flex:1, textAlign:"left" }}>{t(item.key)}</span>}
                            {!collapsed && item.id==="tasks" && pendingTasks>0 && <span style={{ background:T.accent, color:"#FFF", borderRadius:99, fontSize:10, fontWeight:800, padding:"1px 7px" }}>{pendingTasks}</span>}
                        </button>
                    );
                })}
            </div>
            {/* Bottom: collapse + logout */}
            <div style={{ padding:"8px 8px 12px", borderTop:"1px solid rgba(255,255,255,0.1)", display:"flex", flexDirection:"column", gap:4 }}>
                <button onClick={onLogout} title={collapsed?t("logout"):undefined}
                        style={{ display:"flex", alignItems:"center", gap:8, padding:collapsed?"10px":"8px 11px", width:"100%", justifyContent:collapsed?"center":"flex-start", background:"rgba(255,255,255,0.07)", border:"none", borderRadius:T.rs, cursor:"pointer", color:"rgba(255,255,255,0.55)", fontSize:12, fontFamily:"inherit", fontWeight:500, transition:"all 0.15s" }}
                        onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.14)"}
                        onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.07)"}>
                    <span style={{ fontSize:16 }}>🚪</span>
                    {!collapsed && <span>{t("logout")}</span>}
                </button>
                <button onClick={() => setCollapsed(c=>!c)} style={{ display:"flex", alignItems:"center", justifyContent:"center", width:"100%", padding:"7px", background:"rgba(255,255,255,0.06)", border:"none", borderRadius:T.rs, cursor:"pointer", color:"rgba(255,255,255,0.4)", fontSize:11, fontFamily:"inherit" }}>
                    {collapsed?"→":"← Collapse"}
                </button>
            </div>
        </nav>
    );
}

// ═══════════════════════════════════════
// SCREEN: DASHBOARD
// ═══════════════════════════════════════
function DashboardScreen({ state, dispatch, navigate, lang }) {
    const t = useT(lang);
    const uid = state.activeUserId;
    const gardens = forUser(state.gardens, uid);
    const fields = forUser(state.fields, uid);
    const plants = forUser(state.plants, uid);
    const structures = forUser(state.structures, uid);
    const tasks = forUser(state.tasks, uid);
    const pending = tasks.filter(task => task.status !== "done");
    const overdue = pending.filter(task => isOverdue(task.due_date, task.status));
    const harvestable = plants.filter(p => p.status === "harvestable");
    const todayDate = new Date(new Date().toDateString());
    const upcoming = [...pending].sort((a, b) => {
        const da = a.due_date ? new Date(a.due_date + "T00:00:00") : new Date(8640000000000000);
        const db = b.due_date ? new Date(b.due_date + "T00:00:00") : new Date(8640000000000000);
        return da - db;
    });
    const todayTasks = upcoming.filter(task => isSameDay(task.due_date, todayDate)).slice(0, 5);
    const soonTasks = upcoming.filter(task => {
        if (!task.due_date) return false;
        const diff = new Date(task.due_date + "T00:00:00") - todayDate;
        return diff > 0 && diff <= 5 * 24 * 60 * 60 * 1000;
    }).slice(0, 4);
    const emptyBeds = fields.filter(field => !plants.some(p => p.field_id === field.id));
    const nextHarvest = plants.filter(p => p.harvest_date).sort((a, b) => new Date(a.harvest_date + "T00:00:00") - new Date(b.harvest_date + "T00:00:00"))[0];
    const greenhouseCount = structures.filter(s => GH_TYPES.includes(s.type)).length;
    const totalArea = fields.reduce((sum, field) => sum + ((+field.width || 0) * (+field.height || 0)), 0).toFixed(1);
    const todayLabel = todayDate.toLocaleDateString(LOCALE_MAP[lang] || "en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const instructionMeta = [
        <MetaBadge key="gardens" value={gardens.length} label={t("gardens")} />,
        <MetaBadge key="beds" value={fields.length} label={t("beds_fields")} />,
        <MetaBadge key="area" value={`${totalArea}m²`} label={t("total_area")} />,
        <MetaBadge key="tasks" value={pending.length} label={t("tasks_pending")} />,
    ];
    const quickActions = [
        <Btn key="tasks" variant="secondary" size="sm" onClick={() => navigate("tasks")}>{t("upcoming_tasks")}</Btn>,
        <Btn key="editor" variant="secondary" size="sm" onClick={() => navigate("editor")}>{t("nav_editor")}</Btn>,
        <Btn key="fields" variant="ghost" size="sm" onClick={() => navigate("fields")}>{t("beds_fields")}</Btn>,
        <Btn key="plants" variant="primary" size="sm" icon="+" onClick={() => navigate("plants")}>{t("add_plant")}</Btn>,
    ];
    const attentionTasks = overdue.length > 0 ? overdue.slice(0, 4) : soonTasks;
    const renderTaskRow = (task) => {
        const statusCfg = TASK_STATUS_C[task.status] || TASK_STATUS_C.pending;
        const due = task.due_date ? fmtDate(task.due_date, lang) : t("nothing_ready");
        const linkedField = fields.find(f => f.id === task.field_id)?.name;
        const linkedStruct = structures.find(s => s.id === task.struct_id)?.name;
        const metaParts = [due, task.type];
        if (linkedField) metaParts.push(linkedField);
        if (linkedStruct) metaParts.push(linkedStruct);
        return (
            <ListRow
                key={task.id}
                icon={TASK_ICONS[task.type] || "📋"}
                title={task.title}
                meta={metaParts.join(" · ")}
                status={{ label: t(TASK_STATUS_K[task.status]) || task.status, color: statusCfg.color, bg: statusCfg.bg }}
                actions={[
                    <Btn key="done" size="xs" variant="success" onClick={() => dispatch({ type: "UPDATE_TASK", payload: { ...task, status: "done" } })}>✓ Done</Btn>
                ]}
                hint={task.notes}
            />
        );
    };
    const renderHarvestRow = (plant) => {
        const bed = fields.find(f => f.id === plant.field_id);
        const struct = structures.find(s => s.id === plant.struct_id);
        return (
            <ListRow
                key={plant.id}
                icon={CAT_ICONS[plant.category] || "🌿"}
                title={`${plant.name}${plant.variety ? ` (${plant.variety})` : ""}`}
                meta={`${fmtDate(plant.harvest_date, lang)} · ${bed?.name || struct?.name || t("unassigned")}`}
                hint={plant.quantity ? `${plant.quantity} pcs` : undefined}
                actionSlot={<Badge color={T.textSub} bg={T.surfaceAlt}>{plant.quantity || 1}×</Badge>}
            />
        );
    };
    const renderGardenCard = (garden) => {
        const gardenFields = fields.filter(f => f.garden_id === garden.id);
        const gardenStructs = structures.filter(s => s.garden_id === garden.id);
        const gardenPlants = plants.filter(p => p.garden_id === garden.id);
        const bedCount = gardenFields.length;
        const structCount = gardenStructs.length;
        const plantCount = gardenPlants.reduce((sum, p) => sum + Math.max(1, +p.quantity || 1), 0);
        const gardenTasks = tasks.filter(t2 => t2.garden_id === garden.id);
        const nextTask = gardenTasks.filter(t2 => t2.status !== "done" && t2.due_date).sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0];
        const lastTask = gardenTasks.sort((a, b) => new Date(b.due_date || 0) - new Date(a.due_date || 0))[0];
        const activityLabel = nextTask
            ? `Next: ${fmtDate(nextTask.due_date, lang)} · ${nextTask.title}`
            : lastTask
                ? `Last: ${fmtDate(lastTask.due_date, lang)} · ${lastTask.title}`
                : `Created ${garden.created_at ? new Date(garden.created_at).toLocaleDateString() : "—"}`;
        const isGreenhouse = garden.type?.toLowerCase().includes("greenhouse");
        return (
            <div key={garden.id} style={{ background:T.surface, border:`1px solid ${T.borderSoft}`, borderRadius:T.radiusLg, padding:16, boxShadow:"0 2px 6px rgba(0,0,0,0.06)", minHeight:190, display:"flex", flexDirection:"column", gap:10 }}>
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:10 }}>
                    <div>
                        <div style={{ fontSize:15, fontWeight:800, color:T.text }}>{garden.name}</div>
                        <div style={{ fontSize:11, color:T.textMuted }}>{garden.width}×{garden.height}m · {garden.type}</div>
                    </div>
                    <Badge color={isGreenhouse?T.accent:T.primary} bg={isGreenhouse?T.accentBg:T.primaryBg}>{garden.type}</Badge>
                </div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                    <Badge color={T.primary} bg={T.primaryBg}>{bedCount} beds</Badge>
                    <Badge color={T.textSub} bg={T.surfaceAlt}>{structCount} structures</Badge>
                    <Badge color={T.textSub} bg={T.surfaceAlt}>{plantCount} plants</Badge>
                </div>
                <div style={{ fontSize:12, color:T.textMuted }}>{activityLabel}</div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:"auto" }}>
                    <Btn size="sm" variant="primary" onClick={() => { dispatch({ type: "SET_ACTIVE_GARDEN", payload: garden.id }); navigate("editor"); }}>{t("open_editor")}</Btn>
                    <Btn size="sm" variant="secondary" onClick={() => { dispatch({ type: "SET_ACTIVE_GARDEN", payload: garden.id }); navigate("fields"); }}>{t("beds_fields")}</Btn>
                    <Btn size="sm" variant="ghost" onClick={() => { dispatch({ type: "SET_ACTIVE_GARDEN", payload: garden.id }); navigate("plants"); }}>{t("plant_varieties")}</Btn>
                </div>
            </div>
        );
    };
    const suggestionItems = [
        {
            icon: "🧺",
            label: nextHarvest ? `${t("harvest")} ${nextHarvest.name}` : "Review harvest",
            helper: nextHarvest ? `Due ${fmtDate(nextHarvest.harvest_date, lang)}` : "No harvest scheduled soon",
            onClick: () => navigate("plants"),
        },
        {
            icon: "🪴",
            label: emptyBeds.length ? `${emptyBeds.length} empty beds` : "All beds planted",
            helper: emptyBeds.length ? "Fill them with quick greens" : "Great job keeping beds full",
            onClick: () => navigate("fields"),
        },
        {
            icon: "🌡️",
            label: greenhouseCount ? `${greenhouseCount} greenhouse spots` : "Add a greenhouse",
            helper: greenhouseCount ? "Check ventilation logs" : "Create a protected structure",
            onClick: () => navigate("greenhouses"),
        },
    ];
    return (
        <PageShell width={1180}>
            <PageHeader
                title={`${t("good_morning")} 🌤️`}
                subtitle={todayLabel}
                meta={instructionMeta}
                actions={quickActions}
            />
            <PanelGroup>
                <StatCard icon="🌿" label={t("gardens")} value={gardens.length} color={T.primary} sub={`${fields.length} ${t("beds_total")}`} onClick={() => navigate("gardens")} />
                <StatCard icon="🛏️" label={t("beds_fields")} value={fields.length} color="#558B2F" sub={`${totalArea}m² ${t("total_area")}`} onClick={() => navigate("fields")} />
                <StatCard icon="🌱" label={t("plant_varieties")} value={plants.length} color="#388E3C" sub={`${plants.reduce((sum, p) => sum + (+p.quantity || 0), 0)} plants`} onClick={() => navigate("plants")} />
                <StatCard icon="✅" label={t("tasks_pending")} value={pending.length} color={overdue.length > 0 ? T.danger : T.warning} sub={overdue.length > 0 ? `${overdue.length} ${t("overdue_badge")}` : t("all_on_track")} onClick={() => navigate("tasks")} />
                {harvestable.length > 0 && (
                    <StatCard icon="🧺" label={t("ready_to_harvest")} value={harvestable.length} color={T.accent} sub={t("harvestable_badge")} onClick={() => navigate("plants")} />
                )}
            </PanelGroup>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 16 }}>
                <SectionPanel title={`📅 ${t("today")}`} subtitle={`${todayTasks.length} ${t("tasks_pending").toLowerCase()}`} action={<Btn size="sm" variant="ghost" onClick={() => navigate("tasks")}>{t("view_all")}</Btn>}>
                    {todayTasks.length ? todayTasks.map(renderTaskRow) : (
                        <div style={{ padding: "24px 0", fontSize: 13, color: T.textMuted, minHeight:120 }}>No tasks scheduled for today. Add a quick task or pick from your to-do list.</div>
                    )}
                </SectionPanel>
                <SectionPanel title={t("ready_to_harvest")} subtitle={`${harvestable.length} ${t("ready_to_harvest").toLowerCase()}`} accent={{ border: T.accent, titleColor: T.text, subColor: T.textMuted }} action={<Btn size="sm" variant="ghost" onClick={() => navigate("plants")}>{t("view_all")}</Btn>}>
                    {harvestable.length ? harvestable.slice(0, 4).map(renderHarvestRow) : (
                        <div style={{ padding: "24px 0", fontSize: 13, color: T.textMuted, minHeight:120 }}>No crops marked as harvestable yet.</div>
                    )}
                </SectionPanel>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 16 }}>
                <SectionPanel title="Aandacht nodig" subtitle={`${attentionTasks.length} focus items`} accent={{ border: T.danger, titleColor: T.danger }} action={<Btn size="sm" variant="ghost" onClick={() => navigate("tasks")}>{t("view_all")}</Btn>}>
                    {attentionTasks.length ? attentionTasks.map(renderTaskRow) : (
                        <div style={{ padding: "24px 0", fontSize: 13, color: T.textMuted, minHeight:120 }}>Nothing urgent for now. Keep up the steady pace.</div>
                    )}
                </SectionPanel>
                <SectionPanel title="Mijn tuin(en)" subtitle={`${gardens.length} ${t("gardens").toLowerCase()}`} action={<Btn size="sm" variant="ghost" onClick={() => navigate("gardens")}>{t("view_all")}</Btn>}>
                    {gardens.length ? (
                        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:12 }}>
                            {gardens.map(renderGardenCard)}
                        </div>
                    ) : (
                        <div style={{ padding: "24px 0" }}>
                            <EmptyState icon="🌱" title={t("no_gardens")} subtitle="Create a garden to unlock these insights." action={<Btn variant="primary" onClick={() => navigate("gardens")} icon="+">{t("new_garden")}</Btn>} />
                        </div>
                    )}
                </SectionPanel>
            </div>
            <SectionPanel title="Seizoenssuggesties" subtitle="Slimme tips op basis van jouw tuin" accent={{ border: T.primary, titleColor: T.text, subColor: T.textMuted }}>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {suggestionItems.map(s => (
                        <QuickAction key={s.label} icon={s.icon} label={s.label} helper={s.helper} onClick={s.onClick} />
                    ))}
                </div>
            </SectionPanel>
        </PageShell>
    );
}
// ═══════════════════════════════════════
// SCREEN: GARDENS
// ═══════════════════════════════════════
function GardensScreen({ state, dispatch, navigate, lang }) {
    const t = useT(lang);
    const uid = state.activeUserId;
    const gardens = forUser(state.gardens, uid);
    const fields  = forUser(state.fields, uid);
    const tasks = forUser(state.tasks, uid);
    const [show, setShow] = useState(false);
    const ef = { name:"", width:"", height:"", unit:"m", type:"mixed", notes:"" };
    const [form, setForm] = useState(ef);
    const set = k => v => setForm(f=>({...f,[k]:v}));
    const create = () => {
        if (!form.name.trim()||!form.width||!form.height) return;
        dispatch({ type:"ADD_GARDEN", payload:{ id:gid(), name:form.name, width:+form.width, height:+form.height, unit:form.unit, type:form.type, notes:form.notes, created_at:new Date().toISOString() }});
        setShow(false); setForm(ef);
    };
    const totalArea = fields.reduce((sum, field) => sum + ((+field.width || 0) * (+field.height || 0)), 0).toFixed(1);
    const metaBadges = [
        <MetaBadge key="beds" value={fields.length} label={t("beds_fields")} />,
        <MetaBadge key="area" value={`${totalArea}m²`} label={t("total_area")} />,
    ];
    return (
        <PageShell width={1040}>
            <PageHeader
                title={`🌿 ${t("nav_gardens")}`}
                subtitle={`${gardens.length} ${t("gardens").toLowerCase()}`}
                meta={metaBadges}
                actions={[<Btn key="new" icon="+" variant="primary" onClick={()=>setShow(true)}>{t("new_garden")}</Btn>]}
            />
            {gardens.length===0 ? (
                <SectionPanel title={t("nav_gardens")} subtitle="Start by creating your first garden" action={<Btn size="sm" icon="+" variant="primary" onClick={()=>setShow(true)}>{t("create_garden")}</Btn>}>
                    <EmptyState icon="🌱" title={t("no_gardens")} subtitle="Create your first kitchen garden and start planning." />
                </SectionPanel>
            ) : (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:16 }}>
                    {gardens.map(g => {
                        const gf = fields.filter(f=>f.garden_id===g.id);
                        const gStructs = state.structures.filter(s=>s.garden_id===g.id);
                        const gPlants = state.plants.filter(p=>p.garden_id===g.id);
                        const gardenTasks = tasks.filter(t2 => t2.garden_id === g.id);
                        const lastTask = gardenTasks.sort((a,b) => new Date(b.due_date || 0) - new Date(a.due_date || 0))[0];
                        return (
                            <Card key={g.id} variant="muted" style={{ padding:20, minHeight:240, display:"flex", flexDirection:"column", gap:10, boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
                                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
                                    <div>
                                        <div style={{ fontSize:17, fontWeight:900, color:T.text }}>{g.name}</div>
                                        <div style={{ fontSize:12, color:T.textMuted }}>{g.width}m × {g.height}m · {(g.width * g.height).toFixed(1)}m² total</div>
                                    </div>
                                    <Badge color={T.primary} bg={T.primaryBg}>{g.type}</Badge>
                                </div>
                                <div style={{ fontSize:12, color:T.textSub, lineHeight:1.5, minHeight:30 }}>
                                    {g.notes || "No extra notes yet. Capture what matters in this garden."}
                                </div>
                                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                                    <Badge color={T.primary} bg={T.primaryBg}>{gf.length} beds</Badge>
                                    <Badge color={T.textSub} bg={T.surfaceAlt}>{gStructs.length} structures</Badge>
                                    <Badge color={T.textSub} bg={T.surfaceAlt}>{gPlants.length} plants</Badge>
                                </div>
                                <div style={{ fontSize:12, color:T.textMuted }}>
                                    {lastTask ? `Next task: ${fmtDate(lastTask.due_date, lang)} · ${lastTask.title}` : "No task activity yet."}
                                </div>
                                <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:"auto" }}>
                                    <Btn size="sm" variant="primary" onClick={()=>{ dispatch({type:"SET_ACTIVE_GARDEN",payload:g.id}); navigate("editor"); }}>{t("open_editor")}</Btn>
                                    <Btn size="sm" variant="secondary" onClick={()=>{ dispatch({type:"SET_ACTIVE_GARDEN",payload:g.id}); navigate("fields"); }}>{t("beds_fields")}</Btn>
                                    <Btn size="sm" variant="ghost" onClick={()=>{ dispatch({type:"SET_ACTIVE_GARDEN",payload:g.id}); navigate("plants"); }}>{t("plant_varieties")}</Btn>
                                    <Btn size="sm" variant="ghost" onClick={()=>{ dispatch({type:"SET_ACTIVE_GARDEN",payload:g.id}); navigate("settings"); }}>{t("nav_settings")}</Btn>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
            {show && (
                <Modal title={`🌿 ${t("create_garden")}`} onClose={()=>setShow(false)}>
                    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                        <Input label={t("name")} value={form.name} onChange={set("name")} placeholder="e.g. Backyard Kitchen Garden" required/>
                        <FormRow cols={3}>
                            <Input label={`${t("width")} (m)`} value={form.width} onChange={set("width")} type="number" placeholder="12" min="1" max="2000" required/>
                            <Input label={`${t("height")} (m)`} value={form.height} onChange={set("height")} type="number" placeholder="8" min="1" max="2000" required/>
                            <Sel label="Unit" value={form.unit} onChange={set("unit")} options={[{value:"m",label:"Metres"},{value:"ft",label:"Feet"}]}/>
                        </FormRow>
                        <Sel label={t("type")} value={form.type} onChange={set("type")} options={GARDEN_TYPES.map(gt=>({ value:gt, label:gt.charAt(0).toUpperCase()+gt.slice(1) }))}/>
                        <Textarea label={t("notes")} value={form.notes} onChange={set("notes")} rows={2}/>
                        <FormActions onCancel={()=>{ setShow(false); setForm(ef); }} onSave={create} saveLabel={t("create_garden")} t={t}/>
                    </div>
                </Modal>
            )}
        </PageShell>
    );
}

// ═══════════════════════════════════════
// SCREEN: GARDEN EDITOR
// ═══════════════════════════════════════
function EditorScreen({ state, dispatch, navigate, lang }) {
    const t = useT(lang);
    const uid = state.activeUserId;
    const garden = state.gardens.find(g=>g.id===state.activeGardenId);
    const [activeMode, setActiveMode] = useState("select");
    const [panelView, setPanelView] = useState("all");
    const modeLabels = {
        select: "Select",
        add_bed: t("add_bed"),
        add_structure: t("add_structure"),
        add_zone: "Add zone",
        move_resize: "Move / Resize"
    };
    const modeTips = {
        select: "Pick beds, structures or zones to nudge them around.",
        add_bed: "Drag out a new bed directly on the canvas.",
        add_structure: "Drop a greenhouse or compost area and link it.",
        add_zone: "Trace a freeform zone with at least three points.",
        move_resize: "Use handles to pinch / widen an existing item."
    };
    const [showField, setShowField] = useState(false);
    const [showStruct, setShowStruct] = useState(false);
    const ef = { name:"", type:"raised_bed", x:"", y:"", width:"", height:"", notes:"" };
    const es = { name:"", type:"greenhouse", x:"", y:"", width:"", height:"", notes:"", linked_field_id:"" };
    const [ff, setFf] = useState(ef); const [sf, setSf] = useState(es);
    const setF = k=>v=>setFf(f=>({...f,[k]:v}));
    const setS = k=>v=>setSf(f=>({...f,[k]:v}));
    if (!garden) return <div style={{ padding:28 }}><EmptyState icon="🗺️" title="No garden selected" subtitle="Select a garden first." action={<Btn onClick={()=>navigate("gardens")} variant="primary">{t("nav_gardens")}</Btn>}/></div>;
    const gFields   = state.fields.filter(f=>f.garden_id===garden.id);
    const gStructs  = state.structures.filter(s=>s.garden_id===garden.id);
    const gZones    = state.zones.filter(z=>z.garden_id===garden.id);
    const panelTabs = [
        { id:"all", label:"Alles", count: gFields.length + gStructs.length + gZones.length },
        { id:"beds", label:"Bedden", count: gFields.length },
        { id:"structures", label:"Structuren", count: gStructs.length },
        { id:"greenhouses", label:"Kassen", count: gStructs.filter(s => GH_TYPES.includes(s.type)).length },
        { id:"zones", label:"Zones", count: gZones.length },
    ];
    const mapFieldItem = (field) => {
        const color = FIELD_COLORS[field.type] || T.primary;
        const area = ((+field.width || 0) * (+field.height || 0)).toFixed(1);
        const label = LANG[lang]?.[FIELD_LABEL_K[field.type]] || field.type;
        return {
            id: field.id,
            icon: "🛏️",
            title: field.name,
            meta: `${field.width}×${field.height}m · ${area}m²`,
            hint: `Pos (${field.x}m, ${field.y}m)`,
            status: { label, color, bg: `${color}22` },
        };
    };
    const mapStructItem = (struct) => {
        const color = STRUCT_STROKE[struct.type] || T.primary;
        const bg = STRUCT_FILL[struct.type] || T.surfaceAlt;
        const label = t(STRUCT_LABEL_K[struct.type]) || struct.type;
        return {
            id: struct.id,
            icon: STRUCT_ICONS[struct.type] || "🏡",
            title: struct.name,
            meta: `${struct.width}×${struct.height}m`,
            hint: struct.notes,
            status: { label, color, bg },
        };
    };
    const mapZoneItem = (zone) => {
        const color = ZONE_STROKE[zone.type] || T.textMuted;
        const bg = ZONE_FILL[zone.type] || T.surfaceAlt;
        const label = zone.name || LANG[lang]?.[ZONE_LABEL_K[zone.type]] || zone.type;
        return {
            id: zone.id,
            icon: ZONE_ICONS[zone.type] || "🗺️",
            title: label,
            meta: `${(zone.points?.length || 0)} pts`,
            hint: zone.notes,
            status: { label, color, bg },
        };
    };
    const getFieldItems = () => gFields
        .slice()
        .sort((a,b) => (b.width*b.height) - (a.width*a.height))
        .map(mapFieldItem)
        .slice(0,3);
    const getStructItems = (onlyGh=false) => {
        const source = onlyGh ? gStructs.filter(s => GH_TYPES.includes(s.type)) : gStructs;
        return source
            .slice()
            .sort((a,b) => (b.width*b.height) - (a.width*a.height))
            .map(mapStructItem)
            .slice(0,3);
    };
    const getZoneItems = () => gZones
        .slice()
        .map(mapZoneItem)
        .slice(0,3);
    const getPanelItems = () => {
        switch(panelView) {
            case "beds": return getFieldItems();
            case "structures": return getStructItems();
            case "greenhouses": return getStructItems(true);
            case "zones": return getZoneItems();
            default: return [...getFieldItems(), ...getStructItems(), ...getZoneItems()].slice(0,5);
        }
    };
    const panelItems = getPanelItems();
    const addField  = () => { if (!ff.name||!ff.x||!ff.y||!ff.width||!ff.height) return; dispatch({type:"ADD_FIELD",payload:{id:gid(),garden_id:garden.id,...ff,x:+ff.x,y:+ff.y,width:+ff.width,height:+ff.height}}); setShowField(false); setFf(ef); };
    const addStruct = () => { if (!sf.name||!sf.x||!sf.y||!sf.width||!sf.height) return; dispatch({type:"ADD_STRUCT",payload:{id:gid(),garden_id:garden.id,...sf,x:+sf.x,y:+sf.y,width:+sf.width,height:+sf.height,ventilated:false,temperature:"",humidity:"",linked_field_id:sf.linked_field_id||""}}); setShowStruct(false); setSf(es); };
    const posHint = `Garden is ${garden.width}m × ${garden.height}m. Position from top-left (0, 0).`;
    return (
        <PageShell width={1220}>
            <PageHeader
                title={garden.name}
                subtitle={`${garden.width}m × ${garden.height}m · ${gFields.length} beds · ${gStructs.length} structures · ${gZones.length} zones`}
                meta={[
                    <MetaBadge key="size" value={`${garden.width}×${garden.height}m`} label="Size" />,
                    <MetaBadge key="beds" value={gFields.length} label={t("nav_fields")} />,
                    <MetaBadge key="structures" value={gStructs.length} label={t("nav_greenhouses")} />,
                ]}
                actions={[
                    <Btn key="struct" size="sm" variant="secondary" onClick={()=>setShowStruct(true)} icon="🏡">{t("add_structure")}</Btn>,
                    <Btn key="bed" size="sm" variant="primary" onClick={()=>setShowField(true)} icon="🛏️">{t("add_bed")}</Btn>
                ]}
            />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 360px", gap:18 }}>
                <div>
                    <Card style={{ padding:12 }}>
                        <GardenEditor garden={garden} fields={gFields} structures={gStructs} zones={gZones} plants={forUser(state.plants, uid)} slots={forUser(state.slots||[], uid)} dispatch={dispatch} lang={lang}/>
                    </Card>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                    <SectionPanel title="Editor modes" subtitle="Choose your current focus">
                        <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:8 }}>
                            {Object.keys(modeLabels).map(key => (
                                <Btn
                                    key={key}
                                    variant={activeMode===key?"primary":"secondary"}
                                    size="xs"
                                    onClick={()=>setActiveMode(key)}
                                >{modeLabels[key]}</Btn>
                            ))}
                        </div>
                        <div style={{ fontSize:12, color:T.textMuted }}>{modeTips[activeMode]}</div>
                    </SectionPanel>
                    <SectionPanel title="Canvas overzicht" subtitle="Snelle inventaris" action={<Badge color={T.textSub} bg={T.surfaceAlt}>{panelTabs.find(tab=>tab.id===panelView)?.count||0} items</Badge>}>
                        <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:10 }}>
                            {panelTabs.map(tab => (
                                <Btn key={tab.id} size="xs" variant={panelView===tab.id?"primary":"ghost"} onClick={()=>setPanelView(tab.id)}>
                                    {tab.label} <span style={{ fontWeight:700 }}>{tab.count}</span>
                                </Btn>
                            ))}
                        </div>
                        {panelItems.length ? (
                            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                                {panelItems.map(item => (
                                    <ListRow
                                        key={item.id}
                                        icon={item.icon}
                                        title={item.title}
                                        meta={item.meta}
                                        status={item.status}
                                        hint={item.hint}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div style={{ fontSize:12, color:T.textMuted }}>No items found for this selection. Create a new bed, structure or zone to see it appear here.</div>
                        )}
                    </SectionPanel>
                    <SectionPanel title="Garden summary" subtitle="Quick insights for this plot">
                        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                            <ListRow
                                icon="🛏️"
                                title={`${gFields.length} beds`}
                                meta={`${gFields.reduce((sum,f)=>sum + (+f.width * +f.height || 0), 0).toFixed(1)}m² planned`}
                                hint="Arrange beds to match rotations"
                            />
                            <ListRow
                                icon="🏡"
                                title={`${gStructs.length} structures`}
                                meta={`${gStructs.reduce((sum,s)=>sum + (s.width * s.height), 0).toFixed(1)}m² shelter`}
                                hint={`${gStructs.filter(s=>GH_TYPES.includes(s.type)).length} greenhouse or tunnel`}
                            />
                            <ListRow
                                icon="🗺️"
                                title={`${gZones.length} zones`}
                                meta={`Capture paths, borders, shade`}
                                hint="Draw to layer special areas"
                            />
                        </div>
                    </SectionPanel>
                    {gStructs.length>0 && (
                        <SectionPanel title="Structuren" subtitle={`${gStructs.length} op deze tuin`} action={<Btn size="sm" variant="ghost" onClick={()=>navigate("greenhouses")}>{t("nav_greenhouses")}</Btn>}>
                            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                                {gStructs.map(st => {
                                    const linked = gFields.find(f=>f.id===st.linked_field_id);
                                    const plantSum = gPlants.filter(p=>p.struct_id===st.id).reduce((sum,p)=>sum + Math.max(1, +p.quantity || 1), 0);
                                    return (
                                        <ListRow
                                            key={st.id}
                                            icon={STRUCT_ICONS[st.type]||"🏗️"}
                                            title={st.name}
                                            meta={`${st.width}×${st.height}m · ${LANG[lang]?.[STRUCT_LABEL_K[st.type]] || st.type}`}
                                            hint={plantSum ? `${plantSum} plants inside` : "No plants yet"}
                                            status={linked ? { label: `Linked to ${linked.name}`, color:T.primary, bg:T.primaryBg } : undefined}
                                            actions={[
                                                <Btn key="focus" size="xs" variant="secondary" onClick={()=>{ dispatch({type:"SET_ACTIVE_GARDEN",payload:garden.id}); navigate("greenhouses"); }}>Focus</Btn>,
                                                <Btn key="delete" size="xs" variant="ghost" onClick={()=>{ if(window.confirm(t("delete_struct"))) dispatch({type:"DELETE_STRUCT",payload:st.id}); }}>Delete</Btn>
                                            ]}
                                        />
                                    );
                                })}
                            </div>
                        </SectionPanel>
                    )}
                    {gZones.length>0 && (
                        <SectionPanel title="Zones" subtitle={`${gZones.length} zones`} accent={{ border:T.border, titleColor:T.text, subColor:T.textMuted }}>
                            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                                {gZones.map(z => (
                                    <ListRow
                                        key={z.id}
                                        icon={ZONE_ICONS[z.type]||"🗺️"}
                                        title={z.name}
                                        meta={`${(polygonArea(z.points||[])).toFixed(1)}m² · ${LANG[lang]?.[ZONE_LABEL_K[z.type]] || z.type}`}
                                        hint={z.notes}
                                        actions={[
                                            <Btn key="open" size="xs" variant="secondary" onClick={()=>navigate("editor")}>Open</Btn>,
                                            <Btn key="delete" size="xs" variant="ghost" onClick={()=>{ if(window.confirm("Delete this zone?")) dispatch({type:"DELETE_ZONE",payload:z.id}); }}>Delete</Btn>
                                        ]}
                                    />
                                ))}
                            </div>
                        </SectionPanel>
                    )}
                    <SectionPanel title="Editor hints" subtitle="Hover over a field to see dimensions">
                        <div style={{ fontSize:12, color:T.textMuted, lineHeight:1.6 }}>
                            Use the canvas to drag, resize and link beds, structures and zones. Selected items show details in the bottom panel for quick edits.
                        </div>
                    </SectionPanel>
                </div>
            </div>
            {gFields.length>0 && (
                <SectionPanel title={`🛏️ ${t("nav_fields")}`} subtitle={`${gFields.length} beds`}>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:12 }}>
                        {gFields.map(f => {
                            const fc=FIELD_COLORS[f.type]||T.primary;
                            return (
                                <div key={f.id} style={{ background:T.surface, border:`1px solid ${T.border}`, borderLeft:`4px solid ${fc}`, borderRadius:T.rs, padding:12 }}>
                                    <div style={{ fontWeight:700, fontSize:13, color:T.text }}>{f.name}</div>
                                    <div style={{ fontSize:11, color:T.textMuted, marginTop:2 }}>{LANG[lang]?.[FIELD_LABEL_K[f.type]]||f.type} · {f.width}m × {f.height}m</div>
                                    {f.notes && <div style={{ fontSize:11, color:T.textSub, marginTop:4 }}>{f.notes}</div>}
                                    <div style={{ marginTop:8, display:"flex", gap:6 }}>
                                        <Btn size="sm" variant="secondary" onClick={()=>navigate("fields")}>Details</Btn>
                                        <Btn size="sm" variant="ghost" onClick={()=>{ if(window.confirm(t("delete_bed"))) dispatch({type:"DELETE_FIELD",payload:f.id}); }}>✕</Btn>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </SectionPanel>
            )}
            {showField && (
                <Modal title={`🛏️ ${t("add_bed")}`} onClose={()=>setShowField(false)}>
                    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                        <Input label={t("name")} value={ff.name} onChange={setF("name")} placeholder="e.g. Tomato Raised Bed" required/>
                        <Sel label={t("type")} value={ff.type} onChange={setF("type")} options={FIELD_TYPES.map(ft=>({value:ft,label:LANG[lang]?.[FIELD_LABEL_K[ft]]||ft}))}/>
                        <InfoBanner icon="📐">{posHint}</InfoBanner>
                        <FormRow><Input label="X (m)" value={ff.x} onChange={setF("x")} type="number" step="0.1" min="0" required/><Input label="Y (m)" value={ff.y} onChange={setF("y")} type="number" step="0.1" min="0" required/><Input label={`${t("width")} (m)`} value={ff.width} onChange={setF("width")} type="number" step="0.1" min="0.1" required/><Input label={`${t("height")} (m)`} value={ff.height} onChange={setF("height")} type="number" step="0.1" min="0.1" required/></FormRow>
                        <Textarea label={t("notes")} value={ff.notes} onChange={setF("notes")} rows={2}/>
                        <FormActions onCancel={()=>{ setShowField(false); setFf(ef); }} onSave={addField} saveLabel={t("add_bed")} t={t}/>
                    </div>
                </Modal>
            )}
            {showStruct && (
                <Modal title={`🏡 ${t("add_structure")}`} onClose={()=>setShowStruct(false)}>
                    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                        <Input label={t("name")} value={sf.name} onChange={setS("name")} placeholder="e.g. Main Greenhouse" required/>
                        <Sel label={t("type")} value={sf.type} onChange={setS("type")} options={STRUCT_TYPES.map(st=>({value:st,label:`${STRUCT_ICONS[st]} ${LANG[lang]?.[STRUCT_LABEL_K[st]]||st}`}))}/>
                        <Sel label="Linked field" value={sf.linked_field_id || ""} onChange={setS("linked_field_id")} options={[{ value:"", label:"No link" }, ...gFields.map(f=>({ value:f.id, label:f.name }))]} />
                        <InfoBanner icon="📐">{posHint}</InfoBanner>
                        <FormRow><Input label="X (m)" value={sf.x} onChange={setS("x")} type="number" step="0.1" min="0" required/><Input label="Y (m)" value={sf.y} onChange={setS("y")} type="number" step="0.1" min="0" required/><Input label={`${t("width")} (m)`} value={sf.width} onChange={setS("width")} type="number" step="0.1" min="0.1" required/><Input label={`${t("height")} (m)`} value={sf.height} onChange={setS("height")} type="number" step="0.1" min="0.1" required/></FormRow>
                        <Textarea label={t("notes")} value={sf.notes} onChange={setS("notes")} rows={2}/>
                        <FormActions onCancel={()=>{ setShowStruct(false); setSf(es); }} onSave={addStruct} saveLabel={t("add_structure")} t={t}/>
                    </div>
                </Modal>
            )}
        </PageShell>
    );
}

// ═══════════════════════════════════════
// SCREEN: BEDS & FIELDS
// ═══════════════════════════════════════
function FieldsScreen({ state, dispatch, navigate, lang }) {
    const t = useT(lang);
    const uid = state.activeUserId;
    const gardens = forUser(state.gardens, uid);
    const plants  = forUser(state.plants, uid);
    const structures = forUser(state.structures, uid);
    const tasks = forUser(state.tasks, uid);
    const slots   = forUser(state.slots||[], uid).filter(s => s.parent_type==="field");
    const [filterGarden, setFilterGarden] = useState(state.activeGardenId||"all");
    const [show, setShow] = useState(false);
    const [showSlot, setShowSlot] = useState(false);
    const [slotField, setSlotField] = useState(null);
    const [editSlot, setEditSlot] = useState(null);
    const [editSlotForm, setEditSlotForm] = useState(null);
    const [gardenSel, setGardenSel] = useState(state.activeGardenId||gardens[0]?.id||"");
    const ef = { name:"", type:"raised_bed", x:"", y:"", width:"", height:"", notes:"" };
    const esl = { name:"", label:"", type:"bed_row", row_count:"1", spacing_cm:"", plant_count:"", row_length_m:"", notes:"" };
    const [form, setForm] = useState(ef);
    const [slotForm, setSlotForm] = useState(esl);
    const set = k=>v=>setForm(f=>({...f,[k]:v}));
    const setSlot = k=>v=>setSlotForm(f=>({...f,[k]:v}));
    const allFields = forUser(state.fields, uid);
    const display = filterGarden==="all" ? allFields : allFields.filter(f=>f.garden_id===filterGarden);
    const displayArea = display.reduce((sum, f) => sum + ((+f.width || 0) * (+f.height || 0)), 0).toFixed(1);
    const garden = gardens.find(g=>g.id===gardenSel);
    const create = () => {
        if (!form.name||!form.x||!form.y||!form.width||!form.height||!gardenSel) return;
        dispatch({type:"ADD_FIELD",payload:{id:gid(),garden_id:gardenSel,...form,x:+form.x,y:+form.y,width:+form.width,height:+form.height}});
        setShow(false); setForm(ef);
    };
    const openSlotModal = (field) => {
        const count = slots.filter(s => s.parent_id===field.id).length + 1;
        setSlotField(field);
        setSlotForm({ name:`${field.name} Row ${count}`, label:`R${count}`, type:"bed_row", row_count:"1", spacing_cm:"", plant_count:"", row_length_m:"", notes:"" });
        setShowSlot(true);
    };
    const createSlot = () => {
        if (!slotField || !slotForm.name.trim()) return;
        dispatch({
            type:"ADD_SLOT",
            payload:{
                id:gid(),
                garden_id:slotField.garden_id,
                parent_type:"field",
                parent_id:slotField.id,
                ...slotForm,
                row_count: slotForm.type==="bed_row" ? (+slotForm.row_count || 1) : undefined,
                spacing_cm: slotForm.type==="bed_row" ? (+slotForm.spacing_cm || 0) : undefined,
                plant_count: slotForm.type==="bed_row" ? (+slotForm.plant_count || 0) : undefined,
                row_length_m: slotForm.type==="bed_row" ? (+slotForm.row_length_m || 0) : undefined,
                label:(slotForm.label||slotForm.name).trim(),
            }
        });
        setShowSlot(false);
        setSlotField(null);
        setSlotForm(esl);
    };
    const openEditSlot = (slot) => {
        setEditSlot(slot);
        setEditSlotForm({
            name: slot.name || "",
            label: slot.label || "",
            row_count: String(slot.row_count || 1),
            spacing_cm: slot.spacing_cm ? String(slot.spacing_cm) : "",
            plant_count: slot.plant_count ? String(slot.plant_count) : "",
            row_length_m: slot.row_length_m ? String(slot.row_length_m) : "",
            notes: slot.notes || "",
        });
    };
    const deleteSlotTree = (slot) => {
        if (!slot) return;
        const childMap = new Map();
        allSlots.forEach(s => {
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
        walk(slot.id);
        const slotIds = [slot.id, ...descendants.map(s => s.id)];
        const plantsToRemove = allPlants.filter(p => slotIds.includes(p.slot_id)).map(p => p.id);
        plantsToRemove.forEach(id => dispatch({ type:"DELETE_PLANT", payload:id }));
        slotIds.slice().reverse().forEach(id => dispatch({ type:"DELETE_SLOT", payload:id }));
    };
    const saveEditSlot = () => {
        if (!editSlot || !editSlotForm?.name.trim()) return;
        const next = {
            ...editSlot,
            name: editSlotForm.name.trim(),
            label: (editSlotForm.label || editSlotForm.name).trim(),
            notes: editSlotForm.notes || "",
        };
        if (editSlot.type === "tunnel_row" || editSlot.type === "bed_row") {
            next.row_count = Math.max(1, +editSlotForm.row_count || 1);
            next.spacing_cm = Math.max(0, +editSlotForm.spacing_cm || 0);
            next.plant_count = Math.max(0, +editSlotForm.plant_count || 0);
            next.row_length_m = Math.max(0, +editSlotForm.row_length_m || 0);
        }
        dispatch({ type:"UPDATE_SLOT", payload: next });
        setEditSlot(null);
        setEditSlotForm(null);
    };
    return (
        <PageShell width={1120}>
            <PageHeader
                title={`🛏️ ${t("nav_fields")}`}
                subtitle={`${display.length} ${t("beds_total")} · ${displayArea}m² planned`}
                meta={[
                    <MetaBadge key="beds" value={display.length} label={t("beds_fields")} />,
                    <MetaBadge key="area" value={`${displayArea}m²`} label={t("total_area")} />
                ]}
                actions={[<Btn key="add" variant="primary" icon="+" onClick={()=>setShow(true)}>{t("add_bed")}</Btn>]}
            />
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap", marginBottom:18 }}>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                    <Sel value={filterGarden} onChange={setFilterGarden} options={[{value:"all",label:t("all")},...gardens.map(g=>({value:g.id,label:g.name}))]} style={{ minWidth:160 }}/>
                    <Badge color={T.textSub} bg={T.surfaceAlt}>{display.length} beds</Badge>
                </div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    <Btn size="sm" variant="secondary" icon="🗺️" onClick={()=>navigate("editor")} title="Open editor">Editor</Btn>
                    <Btn size="sm" variant="secondary" onClick={()=>navigate("gardens")} title="Go to gardens">Gardens</Btn>
                </div>
            </div>

            {display.length===0 ? (
                <SectionPanel title={`🛏️ ${t("nav_fields")}`} subtitle={t("no_beds")} action={<Btn size="sm" variant="primary" onClick={()=>setShow(true)}>{t("add_bed")}</Btn>}>
                    <EmptyState icon="🛏️" title={t("no_beds")} subtitle="Add beds or fields to start planning." />
                </SectionPanel>
            ) : (
                <SectionPanel title="Bed overzicht" subtitle="Compacte status per bed" style={{ padding:0 }}>
                    <div style={{ display:"flex", flexDirection:"column", gap:12, padding:18 }}>
                        {display.map(f => {
                            const fp = plants.filter(p=>p.field_id===f.id);
                            const fs = slots.filter(s=>s.parent_id===f.id);
                            const fc = FIELD_COLORS[f.type] || T.primary;
                            const slotCount = fs.length;
                            const plantCount = fp.reduce((sum,p)=>sum + Math.max(1, +p.quantity || 1), 0);
                            const typeLabel = LANG[lang]?.[FIELD_LABEL_K[f.type]] || f.type;
                            const nextTask = tasks.filter(t => t.field_id === f.id && t.status !== "done" && t.due_date)
                                .sort((a, b) => (a.due_date||"").localeCompare(b.due_date||""))[0];
                            const nextLabel = nextTask ? `Next: ${fmtDate(nextTask.due_date, lang)} · ${nextTask.title}` : "No upcoming tasks";
                            return (
                                <ListRow
                                    key={f.id}
                                    icon="🛏️"
                                    title={f.name}
                                    meta={`${f.width}m × ${f.height}m · ${typeLabel}`}
                                    hint={`Area ${(f.width*f.height).toFixed(1)}m² · Pos (${f.x}m, ${f.y}m) · ${nextLabel}`}
                                    status={{ label:typeLabel, color:fc, bg:fc+"22" }}
                                    actionSlot={<div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                                        <Badge color={T.textSub} bg={T.surfaceAlt}>{slotCount} slots</Badge>
                                        <Badge color={T.textSub} bg={T.surfaceAlt}>{plantCount} plants</Badge>
                                    </div>}
                                    actions={[
                                        <Btn key="slot" size="xs" variant="secondary" onClick={()=>openSlotModal(f)}>+ Row</Btn>,
                                        <Btn key="map" size="xs" variant="secondary" onClick={()=>{ dispatch({type:"SET_ACTIVE_GARDEN",payload:f.garden_id}); navigate("editor"); }}>Map</Btn>,
                                        <Btn key="del" size="xs" variant="ghost" onClick={()=>{ if(window.confirm(t("delete_bed"))) dispatch({type:"DELETE_FIELD",payload:f.id}); }}>✕</Btn>,
                                    ]}
                                />
                            );
                        })}
                    </div>
                </SectionPanel>
            )}

            {show && (
                <Modal title={`🛏️ ${t("add_bed")}`} onClose={()=>setShow(false)}>
                    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                        {gardens.length>1 && <Sel label={t("gardens")} value={gardenSel} onChange={setGardenSel} options={gardens.map(g=>({value:g.id,label:g.name}))} required/>}
                        <Input label={t("name")} value={form.name} onChange={set("name")} placeholder="e.g. Tomato Raised Bed" required/>
                        <Sel label={t("type")} value={form.type} onChange={set("type")} options={FIELD_TYPES.map(ft=>({value:ft,label:LANG[lang]?.[FIELD_LABEL_K[ft]]||ft}))}/>
                        {garden && <InfoBanner icon="📐">Garden is {garden.width}m × {garden.height}m. Position from top-left (0, 0).</InfoBanner>}
                        <FormRow><Input label="X (m)" value={form.x} onChange={set("x")} type="number" step="0.1" min="0" required/><Input label="Y (m)" value={form.y} onChange={set("y")} type="number" step="0.1" min="0" required/><Input label={`${t("width")} (m)`} value={form.width} onChange={set("width")} type="number" step="0.1" min="0.1" required/><Input label={`${t("height")} (m)`} value={form.height} onChange={set("height")} type="number" step="0.1" min="0.1" required/></FormRow>
                        <Textarea label={t("notes")} value={form.notes} onChange={set("notes")} rows={2}/>
                        <FormActions onCancel={()=>{ setShow(false); setForm(ef); }} onSave={create} saveLabel={t("add_bed")} t={t}/>
                    </div>
                </Modal>
            )}
            {showSlot && slotField && (
                <Modal title={`🪴 Add Row In ${slotField.name}`} onClose={()=>{ setShowSlot(false); setSlotField(null); setSlotForm(esl); }}>
                    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                        <InfoBanner icon="🪴">Rows are internal locations inside a bed. Existing plants without a row stay valid.</InfoBanner>
                        <FormRow cols={2}>
                            <Input label="Name" value={slotForm.name} onChange={setSlot("name")} placeholder="e.g. North Row" required/>
                            <Input label="Label" value={slotForm.label} onChange={setSlot("label")} placeholder="R1" required/>
                        </FormRow>
                        <Sel label="Type" value={slotForm.type} onChange={setSlot("type")} options={[{ value:"bed_row", label:"Row" }, { value:"bed_section", label:"Section" }]}/>
                        {(slotForm.type==="bed_row") && (
                            <FormRow cols={3}>
                                <Input label="Rows" value={slotForm.row_count} onChange={setSlot("row_count")} type="number" min="1" max="24" placeholder="4"/>
                                <Input label="Spacing (cm)" value={slotForm.spacing_cm} onChange={setSlot("spacing_cm")} type="number" min="1" max="200" placeholder="13"/>
                                <Input label="Plants" value={slotForm.plant_count} onChange={setSlot("plant_count")} type="number" min="1" max="1000" placeholder="80"/>
                            </FormRow>
                        )}
                        {(slotForm.type==="bed_row") && (
                            <>
                                <Input label="Row length (m)" value={slotForm.row_length_m} onChange={setSlot("row_length_m")} type="number" min="0.1" max="100" placeholder="2.6"/>
                                {renderSlotSeedPlan({ ...slotForm, id: slotField?.id || "preview", type:"bed_row" }, { compact:true })}
                            </>
                        )}
                        <Textarea label={t("notes")} value={slotForm.notes} onChange={setSlot("notes")} rows={2}/>
                        <FormActions onCancel={()=>{ setShowSlot(false); setSlotField(null); setSlotForm(esl); }} onSave={createSlot} saveLabel="Add Row" t={t}/>
                    </div>
                </Modal>
            )}
            {editSlot && editSlotForm && (
                <Modal title={`✏️ Edit ${editSlot.name}`} onClose={()=>{ setEditSlot(null); setEditSlotForm(null); }}>
                    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                        <InfoBanner icon="ℹ️">Existing rows can be adjusted here. The preview updates from row count, spacing and plant count.</InfoBanner>
                        <FormRow cols={2}>
                            <Input label="Name" value={editSlotForm.name} onChange={v=>setEditSlotForm(f=>({...f,name:v}))} required/>
                            <Input label="Label" value={editSlotForm.label} onChange={v=>setEditSlotForm(f=>({...f,label:v}))} required/>
                        </FormRow>
                        <Input label="Type" value={slotTypeLabel(editSlot, t)} disabled/>
                        {(editSlot.type === "tunnel_row" || editSlot.type === "bed_row") && (
                            <>
                                <FormRow cols={3}>
                                    <Input label="Rows" value={editSlotForm.row_count} onChange={v=>setEditSlotForm(f=>({...f,row_count:v}))} type="number" min="1" max="24"/>
                                    <Input label="Spacing (cm)" value={editSlotForm.spacing_cm} onChange={v=>setEditSlotForm(f=>({...f,spacing_cm:v}))} type="number" min="1" max="200"/>
                                    <Input label="Plants" value={editSlotForm.plant_count} onChange={v=>setEditSlotForm(f=>({...f,plant_count:v}))} type="number" min="0" max="1000"/>
                                </FormRow>
                                <Input label="Row length (m)" value={editSlotForm.row_length_m} onChange={v=>setEditSlotForm(f=>({...f,row_length_m:v}))} type="number" min="0.1" max="100"/>
                                {renderSlotSeedPlan({ ...editSlot, ...editSlotForm, row_count: editSlotForm.row_count, spacing_cm: editSlotForm.spacing_cm, plant_count: editSlotForm.plant_count, row_length_m: editSlotForm.row_length_m })}
                            </>
                        )}
                        <Textarea label={t("notes")} value={editSlotForm.notes} onChange={v=>setEditSlotForm(f=>({...f,notes:v}))} rows={2}/>
                        <FormActions onCancel={()=>{ setEditSlot(null); setEditSlotForm(null); }} onSave={saveEditSlot} saveLabel={t("save")} t={t}/>
                        <Btn
                            variant="danger"
                            onClick={() => {
                                if (window.confirm(`Delete ${editSlot.name}? This also removes any nested slots and linked plants.`)) {
                                    deleteSlotTree(editSlot);
                                    setEditSlot(null);
                                    setEditSlotForm(null);
                                }
                            }}
                        >
                            {t("delete")}
                        </Btn>
                    </div>
                </Modal>
            )}
            {editSlot && editSlotForm && (
                <Modal title={`✏️ Edit ${editSlot.name}`} onClose={()=>{ setEditSlot(null); setEditSlotForm(null); }}>
                    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                        <InfoBanner icon="ℹ️">Existing bed rows can be adjusted here. The preview reflects row count, spacing and plant count.</InfoBanner>
                        <FormRow cols={2}>
                            <Input label="Name" value={editSlotForm.name} onChange={v=>setEditSlotForm(f=>({...f,name:v}))} required/>
                            <Input label="Label" value={editSlotForm.label} onChange={v=>setEditSlotForm(f=>({...f,label:v}))} required/>
                        </FormRow>
                        <Input label="Type" value={slotTypeLabel(editSlot, t)} disabled/>
                        {editSlot.type === "bed_row" && (
                            <>
                                <FormRow cols={3}>
                                    <Input label="Rows" value={editSlotForm.row_count} onChange={v=>setEditSlotForm(f=>({...f,row_count:v}))} type="number" min="1" max="24"/>
                                    <Input label="Spacing (cm)" value={editSlotForm.spacing_cm} onChange={v=>setEditSlotForm(f=>({...f,spacing_cm:v}))} type="number" min="1" max="200"/>
                                    <Input label="Plants" value={editSlotForm.plant_count} onChange={v=>setEditSlotForm(f=>({...f,plant_count:v}))} type="number" min="0" max="1000"/>
                                </FormRow>
                                <Input label="Row length (m)" value={editSlotForm.row_length_m} onChange={v=>setEditSlotForm(f=>({...f,row_length_m:v}))} type="number" min="0.1" max="100"/>
                                {renderSlotSeedPlan({ ...editSlot, ...editSlotForm, row_count: editSlotForm.row_count, spacing_cm: editSlotForm.spacing_cm, plant_count: editSlotForm.plant_count, row_length_m: editSlotForm.row_length_m })}
                            </>
                        )}
                        <Textarea label={t("notes")} value={editSlotForm.notes} onChange={v=>setEditSlotForm(f=>({...f,notes:v}))} rows={2}/>
                        <FormActions onCancel={()=>{ setEditSlot(null); setEditSlotForm(null); }} onSave={saveEditSlot} saveLabel={t("save")} t={t}/>
                    </div>
                </Modal>
            )}
        </PageShell>
    );
}

// ═══════════════════════════════════════
// MODAL: QUICK ADD PLANT
// ═══════════════════════════════════════
function QuickAddPlantModal({ onClose, gardens, fields, lang, dispatch, uid }) {
    const t = useT(lang);
    const [search, setSearch] = useState("");
    const [selectedLib, setSelectedLib] = useState(null);
    const [stage, setStage] = useState("zaailing");
    const [quantity, setQuantity] = useState("1");
    const [showLocation, setShowLocation] = useState(false);
    const [gardenId, setGardenId] = useState(gardens[0]?.id || "");
    const [fieldId, setFieldId] = useState("");
    const [harvestDate, setHarvestDate] = useState("");

    const searchResults = search.trim()
        ? PLANT_LIB.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).slice(0, 6)
        : [];

    const selectPlant = (lib) => {
        setSelectedLib(lib);
        setSearch("");
        // Auto-calculate harvest date
        const today = new Date();
        const daysLeft = stage === "zaailing" ? lib.days_to_harvest
                       : stage === "jonge_plant" ? Math.round(lib.days_to_harvest * 0.6)
                       : Math.round(lib.days_to_harvest * 0.2);
        const harvest = new Date(today.getTime() + daysLeft * 86400000).toISOString().slice(0, 10);
        setHarvestDate(harvest);
    };

    const handleStageChange = (newStage) => {
        setStage(newStage);
        if (selectedLib) {
            const today = new Date();
            const daysLeft = newStage === "zaailing" ? selectedLib.days_to_harvest
                           : newStage === "jonge_plant" ? Math.round(selectedLib.days_to_harvest * 0.6)
                           : Math.round(selectedLib.days_to_harvest * 0.2);
            const harvest = new Date(today.getTime() + daysLeft * 86400000).toISOString().slice(0, 10);
            setHarvestDate(harvest);
        }
    };

    const handleSave = () => {
        if (!selectedLib || !quantity) return;

        const today = new Date().toISOString().slice(0, 10);
        const statusMap = { zaailing: "sown", jonge_plant: "planted", volwassen: "growing" };
        const sowDate = stage === "zaailing" ? today : "";
        const plantDateVal = stage === "zaailing" ? "" : today;

        const payload = {
            id: gid(),
            user_id: uid,
            name: selectedLib.name,
            variety: selectedLib.varieties[0] || "",
            category: selectedLib.category,
            status: statusMap[stage],
            quantity: Math.max(1, parseInt(quantity) || 1),
            sow_date: sowDate,
            plant_date: plantDateVal,
            harvest_date: harvestDate,
            garden_id: gardenId,
            field_id: gardenId && fieldId ? fieldId : "",
            struct_id: "",
            slot_id: "",
            notes: ""
        };

        dispatch({ type: "ADD_PLANT", payload });
        onClose();
    };

    const gardenFields = gardenId ? fields.filter(f => f.garden_id === gardenId) : [];
    const harvestDateObj = harvestDate ? new Date(harvestDate + "T00:00:00") : null;
    const harvestLabel = harvestDateObj
        ? harvestDateObj.toLocaleDateString(LOCALE_MAP[lang] || "en-GB", { day: "numeric", month: "short", year: "numeric" })
        : "";

    return (
        <Modal title="🌱 Plant toevoegen" onClose={onClose} width={500}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Search & Autocomplete */}
                <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: T.textSub, marginBottom: 6, letterSpacing: 0.5, textTransform: "uppercase" }}>Plant</div>
                    <div style={{ position: "relative" }}>
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Zoek plant..."
                            style={{
                                width: "100%",
                                fontFamily: "inherit",
                                fontSize: 13,
                                color: T.text,
                                background: T.surface,
                                border: `1.5px solid ${T.border}`,
                                borderRadius: T.radiusLg,
                                padding: "10px 14px",
                                outline: "none",
                                boxSizing: "border-box"
                            }}
                        />
                        {searchResults.length > 0 && (
                            <div style={{
                                position: "absolute",
                                top: "100%",
                                left: 0,
                                right: 0,
                                background: T.surface,
                                border: `1px solid ${T.border}`,
                                borderTop: "none",
                                borderRadius: `0 0 ${T.radiusLg} ${T.radiusLg}`,
                                zIndex: 10,
                                maxHeight: 200,
                                overflowY: "auto"
                            }}>
                                {searchResults.map(lib => (
                                    <div
                                        key={lib.name}
                                        onClick={() => selectPlant(lib)}
                                        style={{
                                            padding: "10px 14px",
                                            cursor: "pointer",
                                            borderBottom: `1px solid ${T.borderSoft}`,
                                            fontSize: 13,
                                            color: T.text,
                                            transition: "background 0.15s"
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = T.surfaceAlt}
                                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                    >
                                        {lib.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {selectedLib && (
                    <>
                        {/* Stage Selector */}
                        <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: T.textSub, marginBottom: 6, letterSpacing: 0.5, textTransform: "uppercase" }}>Groeifase</div>
                            <div style={{ display: "flex", gap: 6 }}>
                                <PillFilter value="🌰 Zaailing" active={stage === "zaailing"} onClick={() => handleStageChange("zaailing")} color={T.primary} bg={stage === "zaailing" ? T.primaryBg : T.surfaceAlt} />
                                <PillFilter value="🌿 Jonge plant" active={stage === "jonge_plant"} onClick={() => handleStageChange("jonge_plant")} color={T.primary} bg={stage === "jonge_plant" ? T.primaryBg : T.surfaceAlt} />
                                <PillFilter value="🌳 Volwassen" active={stage === "volwassen"} onClick={() => handleStageChange("volwassen")} color={T.primary} bg={stage === "volwassen" ? T.primaryBg : T.surfaceAlt} />
                            </div>
                        </div>

                        {/* Harvest Date Preview */}
                        {harvestLabel && (
                            <div style={{
                                background: T.infoBg,
                                color: T.info,
                                border: `1px solid ${T.info}`,
                                borderRadius: T.rs,
                                padding: "10px 12px",
                                fontSize: 12
                            }}>
                                📅 Geschatte oogst: <strong>{harvestLabel}</strong>
                            </div>
                        )}

                        {/* Quantity */}
                        <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: T.textSub, marginBottom: 6, letterSpacing: 0.5, textTransform: "uppercase" }}>Aantal</div>
                            <input
                                type="number"
                                value={quantity}
                                onChange={e => setQuantity(e.target.value)}
                                min="1"
                                style={{
                                    width: "100%",
                                    fontFamily: "inherit",
                                    fontSize: 13,
                                    color: T.text,
                                    background: T.surface,
                                    border: `1.5px solid ${T.border}`,
                                    borderRadius: T.radiusLg,
                                    padding: "10px 14px",
                                    outline: "none",
                                    boxSizing: "border-box"
                                }}
                            />
                        </div>

                        {/* Location Toggle */}
                        <div>
                            <button
                                onClick={() => setShowLocation(!showLocation)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: T.primary,
                                    cursor: "pointer",
                                    fontSize: 13,
                                    fontWeight: 600,
                                    padding: 0,
                                    fontFamily: "inherit"
                                }}
                            >
                                {showLocation ? "− Locatie verwijderen" : "+ Locatie toewijzen"}
                            </button>

                            {showLocation && (
                                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
                                    <div>
                                        <div style={{ fontSize: 12, fontWeight: 700, color: T.textSub, marginBottom: 6, letterSpacing: 0.5, textTransform: "uppercase" }}>Tuin</div>
                                        <select
                                            value={gardenId}
                                            onChange={e => { setGardenId(e.target.value); setFieldId(""); }}
                                            style={{
                                                width: "100%",
                                                fontFamily: "inherit",
                                                fontSize: 13,
                                                color: T.text,
                                                background: T.surface,
                                                border: `1.5px solid ${T.border}`,
                                                borderRadius: T.radiusLg,
                                                padding: "10px 14px",
                                                outline: "none",
                                                boxSizing: "border-box"
                                            }}
                                        >
                                            <option value="">-- Selecteer --</option>
                                            {gardens.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                        </select>
                                    </div>

                                    {gardenFields.length > 0 && (
                                        <div>
                                            <div style={{ fontSize: 12, fontWeight: 700, color: T.textSub, marginBottom: 6, letterSpacing: 0.5, textTransform: "uppercase" }}>Bed / Veld</div>
                                            <select
                                                value={fieldId}
                                                onChange={e => setFieldId(e.target.value)}
                                                style={{
                                                    width: "100%",
                                                    fontFamily: "inherit",
                                                    fontSize: 13,
                                                    color: T.text,
                                                    background: T.surface,
                                                    border: `1.5px solid ${T.border}`,
                                                    borderRadius: T.radiusLg,
                                                    padding: "10px 14px",
                                                    outline: "none",
                                                    boxSizing: "border-box"
                                                }}
                                            >
                                                <option value="">-- Selecteer --</option>
                                                {gardenFields.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                            <Btn variant="primary" onClick={handleSave}>Toevoegen</Btn>
                            <Btn variant="secondary" onClick={onClose}>Annuleren</Btn>
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
}

// ═══════════════════════════════════════
// SCREEN: PLANTS
// ═══════════════════════════════════════
function PlantsScreen({ state, dispatch, lang }) {
    const t = useT(lang);
    const uid = state.activeUserId;
    const gardens = forUser(state.gardens, uid);
    const fields  = forUser(state.fields, uid);
    const structures = forUser(state.structures, uid).filter(s => GH_TYPES.includes(s.type));
    const slots   = forUser(state.slots||[], uid);
    const plants  = forUser(state.plants, uid);
    const [showQuick, setShowQuick] = useState(false);
    const [show, setShow] = useState(false);
    const [showLib, setShowLib] = useState(false);
    const [editing, setEditing] = useState(null);
    const [bulkPrompt, setBulkPrompt] = useState(null);
    const [fStatus, setFStatus] = useState("all");
    const [fCat, setFCat] = useState("all");
    const [search, setSearch] = useState("");
    const [libSearch, setLibSearch] = useState("");
    const [libCat, setLibCat] = useState("all");
    const ep = { name:"", variety:"", category:"Vegetable", status:"planned", quantity:"1", garden_id:gardens[0]?.id||"", placement_type:"field", field_id:"", struct_id:"", slot_id:"", row_count:"", sow_spacing_cm:"", row_plant_count:"", row_length_m:"", sow_date:"", plant_date:"", harvest_date:"", notes:"" };
    const [form, setForm] = useState(ep);
    const set = k=>v=>setForm(f=>({...f,[k]:v}));
    const placeOptions = form.placement_type==="struct"
        ? structures.filter(s=>s.garden_id===form.garden_id).map(s=>({value:s.id,label:s.name}))
        : fields.filter(f=>f.garden_id===form.garden_id).map(f=>({value:f.id,label:f.name}));
    const slotTargetId = form.placement_type==="struct" ? form.struct_id : form.field_id;
    const slotTargetType = form.placement_type==="struct" ? "struct" : "field";
    const slotOptions = [
        { value:"", label:"No sub-location" },
        ...childSlotsFor(slots, slotTargetType, slotTargetId).map(s => ({ value:s.id, label:slotDisplayLabel(s, slots) })),
    ];
    const selectedSlot = slots.find(s => s.id === form.slot_id);
    const selectedSlotIsRow = selectedSlot && ["bed_row","tunnel_row"].includes(selectedSlot.type);
    const rowCountValue = selectedSlotIsRow ? Math.max(1, +form.row_count || +selectedSlot.row_count || 1) : 1;
    const quantityValue = Math.max(1, +form.quantity || 1);
    const rowPlantValue = selectedSlotIsRow ? Math.max(1, +form.row_plant_count || Math.ceil(quantityValue / rowCountValue)) : quantityValue;
    const filtered = plants.filter(p => {
        if (fStatus!=="all"&&p.status!==fStatus) return false;
        if (fCat!=="all"&&p.category!==fCat) return false;
        if (search&&!p.name.toLowerCase().includes(search.toLowerCase())&&!(p.variety||"").toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });
    const libFiltered = PLANT_LIB.filter(p => {
        if (libCat!=="all"&&p.category!==libCat) return false;
        if (libSearch&&!p.name.toLowerCase().includes(libSearch.toLowerCase())) return false;
        return true;
    });
    const openEdit = (p) => {
        setForm({
            ...ep,
            ...p,
            quantity:String(p.quantity||1),
            garden_id:p.garden_id||"",
            placement_type:p.struct_id ? "struct" : "field",
            field_id:p.field_id||"",
            struct_id:p.struct_id||"",
            slot_id:p.slot_id||"",
            row_count:p.row_count ? String(p.row_count) : "",
            sow_spacing_cm:p.sow_spacing_cm ? String(p.sow_spacing_cm) : "",
            row_plant_count:p.row_plant_count ? String(p.row_plant_count) : "",
            row_length_m:p.row_length_m ? String(p.row_length_m) : "",
        });
        setEditing(p);
        setShow(true);
    };
    const close = () => { setShow(false); setEditing(null); setForm(ep); };
    const applySave = (payload) => {
        if (editing) dispatch({type:"UPDATE_PLANT",payload:{...editing,...payload}});
        else dispatch({type:"ADD_PLANT",payload:{id:gid(),...payload}});
        close();
    };
    const save = () => {
        if (!form.name||!form.garden_id) return;
        const rowCount = selectedSlotIsRow ? Math.max(1, +form.row_count || +selectedSlot?.row_count || 1) : 1;
        const quantity = Math.max(1, +form.quantity || 1);
        const rowPlantCount = selectedSlotIsRow ? Math.max(1, +form.row_plant_count || Math.ceil(quantity / rowCount)) : "";
        const payload = {
            ...form,
            quantity,
            field_id: form.placement_type==="field" ? form.field_id : "",
            struct_id: form.placement_type==="struct" ? form.struct_id : "",
            row_count: selectedSlotIsRow && rowCount > 1 ? rowCount : "",
            sow_spacing_cm: form.sow_spacing_cm ? +form.sow_spacing_cm : "",
            row_plant_count: selectedSlotIsRow && rowCount > 1 ? rowPlantCount : (form.row_plant_count ? +form.row_plant_count : ""),
            row_length_m: form.row_length_m ? +form.row_length_m : "",
        };
        if (!editing && selectedSlotIsRow && quantity > 1 && rowCount > 1) {
            setBulkPrompt({
                rowCount,
                rowPlantCount,
                quantity,
                slotName: slotDisplayLabel(selectedSlot, slots),
                payload,
            });
            return;
        }
        applySave(payload);
    };
    const saveAsSimplePlant = () => {
        if (!bulkPrompt) return;
        const payload = {
            ...bulkPrompt.payload,
            row_count: "",
            row_plant_count: "",
        };
        setBulkPrompt(null);
        applySave(payload);
    };
    const saveAsRowPlan = () => {
        if (!bulkPrompt) return;
        const payload = {
            ...bulkPrompt.payload,
            row_count: bulkPrompt.rowCount,
            row_plant_count: bulkPrompt.rowPlantCount,
        };
        setBulkPrompt(null);
        applySave(payload);
    };
    const pickFromLib = (plant) => {
        setForm(f=>({...f, name:plant.name, category:plant.category, variety:plant.varieties[0]||""}));
        setShowLib(false); setShow(true);
    };
    return (
        <PageShell width={1100}>
            <PageHeader
                title={`🌱 ${t("nav_plants")}`}
                subtitle={`${filtered.length}/${plants.length} plants`}
                meta={[
                    <MetaBadge key="gardens" value={gardens.length} label={t("gardens")} />,
                    <MetaBadge key="fields" value={fields.length} label={t("beds_fields")} />
                ]}
                actions={[
                    <Btn key="lib" variant="secondary" onClick={()=>setShowLib(true)}>{t("add_from_library")}</Btn>,
                    <Btn key="add" variant="primary" onClick={()=>setShowQuick(true)} icon="+">{t("add_plant")}</Btn>
                ]}
            />
            <Card variant="muted" style={{ padding:18, display:"flex", flexDirection:"column", gap:14, marginBottom:20, boxShadow:"0 1px 6px rgba(0,0,0,0.05)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                    <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={`🔍 ${t("search")}`} style={{ flex:1, minWidth:220, fontFamily:"inherit", fontSize:13, color:T.text, background:T.surface, border:`1.5px solid ${T.border}`, borderRadius:T.radiusLg, padding:"10px 14px", outline:"none" }}/>
                    <span style={{ fontSize:12, color:T.textMuted }}>{filtered.length} / {plants.length} plants</span>
                </div>
                <div>
                    <div style={{ fontSize:12, color:T.textSub, fontWeight:700, letterSpacing:0.5, textTransform:"uppercase", marginBottom:6 }}>Status</div>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                        <PillFilter value={t("all_statuses")} active={fStatus==="all"} onClick={()=>setFStatus("all")}/>
                        {PLANT_STATUSES.map(s => <PillFilter key={s} value={t(STATUS_K[s])||s} active={fStatus===s} onClick={()=>setFStatus(s)} color={STATUS_CFG[s]?.color} bg={STATUS_CFG[s]?.bg}/>)}
                    </div>
                </div>
                <div>
                    <div style={{ fontSize:12, color:T.textSub, fontWeight:700, letterSpacing:0.5, textTransform:"uppercase", marginBottom:6 }}>Categorie</div>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                        <PillFilter value={t("all_categories")} active={fCat==="all"} onClick={()=>setFCat("all")}/>
                        {CATEGORIES.map(c => <PillFilter key={c} value={`${CAT_ICONS[c]} ${c}`} active={fCat===c} onClick={()=>setFCat(c)}/>)}
                    </div>
                </div>
            </Card>
            {filtered.length===0 ? (
                <EmptyState icon="🌱" title={plants.length===0?t("no_plants"):"No plants match filters"} action={plants.length===0?<Btn onClick={()=>setShowQuick(true)} icon="+" variant="primary">{t("add_plant")}</Btn>:<Btn onClick={()=>{ setFStatus("all"); setFCat("all"); setSearch(""); }}>Clear Filters</Btn>}/>
            ) : (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))", gap:14 }}>
                    {filtered.map(p => {
                        const sc_=STATUS_CFG[p.status]||STATUS_CFG.planned;
                        const sc_l=t(STATUS_K[p.status])||p.status;
                        const bed=fields.find(f=>f.id===p.field_id);
                        const greenhouse=structures.find(s=>s.id===p.struct_id);
                        const slot=slots.find(s=>s.id===p.slot_id);
                        return (
                            <Card key={p.id} style={{ padding:16 }}>
                                <div style={{ display:"flex", alignItems:"start", justifyContent:"space-between", marginBottom:10 }}>
                                    <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                                        <div style={{ fontSize:28, lineHeight:1 }}>{CAT_ICONS[p.category]||"🌿"}</div>
                                        <div><div style={{ fontSize:15, fontWeight:800, color:T.text, lineHeight:1.2 }}>{p.name}</div><div style={{ fontSize:11, color:T.textMuted, marginTop:2 }}>{p.variety||"—"}</div></div>
                                    </div>
                                    <Badge color={sc_.color} bg={sc_.bg}>{sc_l}</Badge>
                                </div>
                                <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:10 }}>
                                    <Badge color={T.textSub} bg={T.surfaceAlt}>×{p.quantity}</Badge>
                                    <Badge color={T.textSub} bg={T.surfaceAlt}>{p.category}</Badge>
                                    {bed && <Badge color={T.primary} bg={T.primaryBg}>{bed.name}</Badge>}
                                    {greenhouse && <Badge color={STRUCT_STROKE[greenhouse.type]||T.info} bg={STRUCT_FILL[greenhouse.type]||T.infoBg}>{greenhouse.name}</Badge>}
                                {slot && <Badge color={T.accent} bg={T.accentBg}>{slotDisplayLabel(slot, slots)}</Badge>}
                                </div>
                                {slot && ["bed_row","tunnel_row"].includes(slot.type) && (p.sow_spacing_cm || p.row_plant_count || p.row_length_m) && (
                                    <div style={{ fontSize:11, color:T.textMuted, marginBottom:8, display:"flex", gap:8, flexWrap:"wrap" }}>
                                        {p.row_count && <span>🧵 {p.row_count} rows</span>}
                                        {p.sow_spacing_cm && <span>↔ {p.sow_spacing_cm} cm</span>}
                                        {p.row_plant_count && <span>🌱 {p.row_plant_count} plants</span>}
                                        {p.row_length_m && <span>📏 {p.row_length_m} m</span>}
                                    </div>
                                )}
                                {(p.sow_date||p.plant_date||p.harvest_date) && (
                                    <div style={{ fontSize:11, color:T.textMuted, marginBottom:8, display:"flex", gap:8, flexWrap:"wrap" }}>
                                        {p.sow_date && <span>🌱 {fmtDate(p.sow_date,lang)}</span>}
                                        {p.plant_date && <span>🌿 {fmtDate(p.plant_date,lang)}</span>}
                                        {p.harvest_date && <span>🧺 {fmtDate(p.harvest_date,lang)}</span>}
                                    </div>
                                )}
                                {p.notes && <div style={{ fontSize:12, color:T.textSub, marginBottom:10, lineHeight:1.5, borderLeft:`2px solid ${T.border}`, paddingLeft:8 }}>{p.notes}</div>}
                                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                                    <Btn size="sm" variant="secondary" onClick={()=>openEdit(p)}>{t("edit")}</Btn>
                                    {(p.status==="growing"||p.status==="harvestable") && <Btn size="sm" variant="accent" onClick={()=>dispatch({type:"UPDATE_PLANT",payload:{...p,status:"harvested"}})}>✓ {t("harvest")}</Btn>}
                                    {p.status==="planned" && <Btn size="sm" variant="success" onClick={()=>dispatch({type:"UPDATE_PLANT",payload:{...p,status:"sown",sow_date:p.sow_date||new Date().toISOString().slice(0,10)}})}>{t("mark_sown")}</Btn>}
                                    <Btn size="sm" variant="ghost" onClick={()=>{ if(window.confirm(t("delete_plant"))) dispatch({type:"DELETE_PLANT",payload:p.id}); }}>✕</Btn>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
            {/* Add / Edit modal */}
            {show && (
                <Modal title={editing?`✏️ Edit Plant`:`🌱 ${t("add_plant")}`} onClose={close}>
                    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                        <FormRow>
                            <Input label={t("name")} value={form.name} onChange={set("name")} placeholder="e.g. Tomato" required/>
                            <Input label={t("variety")} value={form.variety} onChange={set("variety")} placeholder="e.g. Roma"/>
                        </FormRow>
                        <FormRow cols={3}>
                            <Sel label={t("category")} value={form.category} onChange={set("category")} options={CATEGORIES}/>
                            <Sel label="Status" value={form.status} onChange={set("status")} options={PLANT_STATUSES.map(s=>({value:s,label:t(STATUS_K[s])||s}))}/>
                            <Input label={t("quantity")} value={form.quantity} onChange={set("quantity")} type="number" min="1"/>
                        </FormRow>
                        <FormRow cols={4}>
                            <Sel label={t("nav_gardens")} value={form.garden_id} onChange={v=>setForm(f=>({...f,garden_id:v,field_id:"",struct_id:"",slot_id:""}))} options={[{value:"",label:t("select_garden")},...gardens.map(g=>({value:g.id,label:g.name}))]} required/>
                            <Sel label="Placement" value={form.placement_type} onChange={v=>setForm(f=>({...f,placement_type:v,field_id:"",struct_id:"",slot_id:""}))} options={[{value:"field",label:"Bed / Field"},{value:"struct",label:"Greenhouse"}]}/>
                            <Sel label={form.placement_type==="struct"?"Greenhouse":"Bed / Field"} value={form.placement_type==="struct"?form.struct_id:form.field_id} onChange={v=>setForm(f=>({...f,[f.placement_type==="struct"?"struct_id":"field_id"]:v,slot_id:""}))} options={[{value:"",label:t("unassigned")},...placeOptions]}/>
                            <Sel label="Row / Pot" value={form.slot_id} onChange={set("slot_id")} options={slotOptions}/>
                        </FormRow>
                        {selectedSlotIsRow && (
                            <FormRow cols={3}>
                                <Input label="Rows" value={form.row_count} onChange={set("row_count")} type="number" min="1" max="24" placeholder={String(selectedSlot?.row_count || 1)} />
                                <Input label="Spacing (cm)" value={form.sow_spacing_cm} onChange={set("sow_spacing_cm")} type="number" min="1" max="200" placeholder="35" />
                                <Input label="Plants in row" value={form.row_plant_count} onChange={set("row_plant_count")} type="number" min="1" max="1000" placeholder="24" />
                            </FormRow>
                        )}
                        {selectedSlotIsRow && (
                            <Input label="Row length (m)" value={form.row_length_m} onChange={set("row_length_m")} type="number" min="0.1" max="100" placeholder="8.4" />
                        )}
                        {selectedSlotIsRow && quantityValue > 1 && rowCountValue > 1 && (
                            <InfoBanner icon="🌱">
                                This can be saved as a row plan: {rowCountValue} rows × {rowPlantValue} plants in {slotDisplayLabel(selectedSlot, slots)}.
                            </InfoBanner>
                        )}
                        <FormRow cols={3}>
                            <Input label={t("sow_date")} value={form.sow_date} onChange={set("sow_date")} type="date"/>
                            <Input label={t("plant_date")} value={form.plant_date} onChange={set("plant_date")} type="date"/>
                            <Input label={t("harvest_date")} value={form.harvest_date} onChange={set("harvest_date")} type="date"/>
                        </FormRow>
                        <Textarea label={t("notes")} value={form.notes} onChange={set("notes")} rows={2}/>
                        <FormActions onCancel={close} onSave={save} saveLabel={editing?t("save"):t("add_plant")} t={t}/>
                    </div>
                </Modal>
            )}
            {/* Library modal */}
            {showLib && (
                <Modal title={t("library_title")} onClose={()=>setShowLib(false)} width={780}>
                    <p style={{ margin:"0 0 14px", fontSize:13, color:T.textMuted }}>{t("library_sub")}</p>
                    <div style={{ display:"flex", gap:8, marginBottom:14, alignItems:"center", flexWrap:"wrap" }}>
                        <input value={libSearch} onChange={e=>setLibSearch(e.target.value)} placeholder={`🔍 ${t("search")}`} style={{ fontFamily:"inherit", fontSize:13, color:T.text, background:T.surface, border:`1.5px solid ${T.border}`, borderRadius:T.rs, padding:"7px 12px", outline:"none", minWidth:180 }}/>
                        <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                            <PillFilter value={t("all")} active={libCat==="all"} onClick={()=>setLibCat("all")}/>
                            {CATEGORIES.map(c => <PillFilter key={c} value={`${CAT_ICONS[c]}`} active={libCat===c} onClick={()=>setLibCat(c)} title={c}/>)}
                        </div>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:10, maxHeight:400, overflowY:"auto" }}>
                        {libFiltered.map(p => (
                            <div key={p.name} onClick={()=>pickFromLib(p)}
                                 style={{ padding:"10px 12px", border:`1.5px solid ${T.border}`, borderRadius:T.r, cursor:"pointer", transition:"all 0.15s", background:T.surface }}
                                 onMouseEnter={e=>{ e.currentTarget.style.borderColor=T.primary; e.currentTarget.style.background=T.primaryBg; }}
                                 onMouseLeave={e=>{ e.currentTarget.style.borderColor=T.border; e.currentTarget.style.background=T.surface; }}>
                                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                                    <span style={{ fontSize:22 }}>{CAT_ICONS[p.category]||"🌿"}</span>
                                    <div>
                                        <div style={{ fontSize:13, fontWeight:700, color:T.text }}>{p.name}</div>
                                        <div style={{ fontSize:10, color:T.textMuted }}>{p.category}</div>
                                    </div>
                                </div>
                                <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                                    {p.varieties.slice(0,3).map(v => <Badge key={v} color={T.primary} bg={T.primaryBg} style={{fontSize:9,padding:"1px 6px"}}>{v}</Badge>)}
                                    {p.varieties.length>3 && <Badge color={T.textMuted} bg={T.surfaceAlt} style={{fontSize:9,padding:"1px 6px"}}>+{p.varieties.length-3}</Badge>}
                                </div>
                            </div>
                        ))}
                    </div>
                </Modal>
            )}
            {bulkPrompt && (
                <Modal title="🌱 Save as row plan?" onClose={()=>setBulkPrompt(null)} width={520}>
                    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                        <InfoBanner icon="🧭">
                            {bulkPrompt.quantity} plants in {bulkPrompt.slotName} can be stored as a row plan: {bulkPrompt.rowCount} rows × {bulkPrompt.rowPlantCount} plants.
                        </InfoBanner>
                        <div style={{ fontSize:13, color:T.textSub, lineHeight:1.5 }}>
                            Keep it as one plant card, or save the row structure so the tunnel preview and counts stay readable.
                        </div>
                        <FormActions
                            onCancel={()=>setBulkPrompt(null)}
                            onSave={saveAsRowPlan}
                            saveLabel={`Save as ${bulkPrompt.rowCount} rows`}
                            t={t}
                        />
                        <Btn variant="ghost" onClick={saveAsSimplePlant}>Keep as one item</Btn>
                    </div>
                </Modal>
            )}
        </PageShell>
    );
}

const LinkedHint = (task, fields, structures) => {
    const parts = [];
    const field = fields.find(f => f.id === task.field_id);
    const struct = structures.find(s => s.id === task.struct_id);
    if (field) parts.push(field.name);
    if (struct) parts.push(struct.name);
    if (task.notes) parts.push(task.notes);
    return parts.length ? parts.join(" · ") : undefined;
};

// ═══════════════════════════════════════
// SCREEN: TASKS
// ═══════════════════════════════════════
function TasksScreen({ state, dispatch, lang }) {
    const t = useT(lang);
    const uid = state.activeUserId;
    const gardens = forUser(state.gardens, uid);
    const fields  = forUser(state.fields, uid);
    const structures = forUser(state.structures, uid);
    const tasks   = forUser(state.tasks, uid);
    const todayDate = new Date(new Date().toDateString());
    const overdueTasks = tasks.filter(task => isOverdue(task.due_date, task.status) && task.status !== "done");
    const [fStatus, setFStatus] = useState("all");
    const [fType, setFType] = useState("all");
    const [show, setShow] = useState(false);
    const ef = { title:"", type:"general", status:"pending", due_date:"", linked_type:"garden", linked_id:gardens[0]?.id||"", notes:"" };
    const [form, setForm] = useState(ef);
    const set = k=>v=>setForm(f=>({...f,[k]:v}));
    const display = tasks.filter(t2 => {
        if (fStatus!=="all"&&t2.status!==fStatus) return false;
        if (fType!=="all"&&t2.type!==fType) return false;
        return true;
    }).sort((a,b) => {
        if (a.status==="done"&&b.status!=="done") return 1;
        if (b.status==="done"&&a.status!=="done") return -1;
        const ao=isOverdue(a.due_date,a.status), bo=isOverdue(b.due_date,b.status);
        if (ao&&!bo) return -1; if (bo&&!ao) return 1;
        return (a.due_date||"").localeCompare(b.due_date||"");
    });
    const todayOnly = display.filter(task => task.status !== "done" && isSameDay(task.due_date, todayDate));
    const weekOnly = display.filter(task => {
        if (!task.due_date) return false;
        const due = new Date(task.due_date + "T00:00:00");
        const diff = due - todayDate;
        return diff > 0 && diff <= 7 * 24 * 60 * 60 * 1000;
    });
    const done = tasks.filter(t2=>t2.status==="done").length;
    const pct = tasks.length ? Math.round(done/tasks.length*100) : 0;
    const linkedOptions = () => {
        if (form.linked_type==="garden") return gardens.map(g=>({value:g.id,label:g.name}));
        if (form.linked_type==="field")  return fields.map(f=>({value:f.id,label:f.name}));
        return forUser(state.structures,uid).map(s=>({value:s.id,label:s.name}));
    };
    const create = () => { if (!form.title) return; dispatch({type:"ADD_TASK",payload:{id:gid(),...form}}); setShow(false); setForm(ef); };
    return (
        <PageShell width={960}>
            <PageHeader
                title={`✅ ${t("nav_tasks")}`}
                subtitle={`${done}/${tasks.length} complete`}
                meta={[
                    <MetaBadge key="open" value={tasks.length - done} label="Open" />,
                    <MetaBadge key="done" value={done} label="Done" />
                ]}
                actions={[<Btn key="add" variant="primary" icon="+" onClick={()=>setShow(true)}>{t("add_task")}</Btn>]}
            />
            {tasks.length>0 && (
                <div style={{ marginBottom:18 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:T.textSub, marginBottom:5 }}><span>{pct}% complete</span><span>{done}/{tasks.length}</span></div>
                    <div style={{ height:6, background:T.borderLight, borderRadius:99 }}><div style={{ height:"100%", width:`${pct}%`, background:T.success, borderRadius:99, transition:"width 0.4s" }}/></div>
                </div>
            )}
            <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:10 }}>
                <Badge color={T.danger} bg={T.dangerBg}>{overdueTasks.length} overdue</Badge>
                <Badge color={T.primary} bg={T.primaryBg}>{todayOnly.length} today</Badge>
                <Badge color={T.accent} bg={T.accentBg}>{weekOnly.length} this week</Badge>
            </div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:14 }}>
                <PillFilter value={t("all_statuses")} active={fStatus==="all"} onClick={()=>setFStatus("all")}/>
                {Object.entries(TASK_STATUS_K).map(([k,lk]) => <PillFilter key={k} value={t(lk)||k} active={fStatus===k} onClick={()=>setFStatus(k)} color={TASK_STATUS_C[k]?.color} bg={TASK_STATUS_C[k]?.bg}/>)}
                <span style={{ width:1, background:T.border, margin:"0 4px" }}/>
                <PillFilter value="All Types" active={fType==="all"} onClick={()=>setFType("all")}/>
                {TASK_TYPES.map(ty => <PillFilter key={ty} value={`${TASK_ICONS[ty]} ${ty}`} active={fType===ty} onClick={()=>setFType(ty)}/>)}
            </div>
            {display.length===0 ? <EmptyState icon="✅" title={t("no_tasks")} action={<Btn onClick={()=>setShow(true)} icon="+" variant="primary">{t("add_task")}</Btn>}/> : (
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    {display.map(task => {
                        const od=isOverdue(task.due_date,task.status);
                        const sc_=TASK_STATUS_C[task.status]||TASK_STATUS_C.pending;
                        const sc_l=t(TASK_STATUS_K[task.status])||task.status;
                        const meta = `${od&&task.status!=="done"?`${t("overdue")} · `:""}${fmtDate(task.due_date,lang)} · ${task.type}`;
                        const toggleLabel = task.status==="done"?t("tasks_pending"):"Complete";
                        return (
                            <ListRow
                                key={task.id}
                                icon={TASK_ICONS[task.type]||"📋"}
                                title={task.title}
                                meta={meta}
                                status={{ label: sc_l, color: sc_.color, bg: sc_.bg }}
                                hint={LinkedHint(task, fields, structures, lang)}
                                actions={[
                                    <Btn key="toggle" size="xs" variant={task.status==="done"?"secondary":"success"} onClick={()=>dispatch({type:"UPDATE_TASK",payload:{...task,status:task.status==="done"?"pending":"done"}})}>{task.status==="done"?"Reopen":"Done"}</Btn>,
                                    <Btn key="delete" size="xs" variant="ghost" onClick={()=>{ if(window.confirm("Delete task?")) dispatch({type:"DELETE_TASK",payload:task.id}); }}>✕</Btn>
                                ]}
                            />
                        );
                    })}
                </div>
            )}
            {show && (
                <Modal title={`📋 ${t("add_task")}`} onClose={()=>{ setShow(false); setForm(ef); }}>
                    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                        <Input label={t("name")} value={form.title} onChange={set("title")} placeholder="e.g. Water the tomatoes" required/>
                        <FormRow>
                            <Sel label="Type" value={form.type} onChange={set("type")} options={TASK_TYPES.map(ty=>({value:ty,label:`${TASK_ICONS[ty]} ${ty}`}))}/>
                            <Sel label="Status" value={form.status} onChange={set("status")} options={Object.keys(TASK_STATUS_K).map(k=>({value:k,label:t(TASK_STATUS_K[k])||k}))}/>
                            <Input label={t("due_date")} value={form.due_date} onChange={set("due_date")} type="date"/>
                        </FormRow>
                        <FormRow>
                            <Sel label={t("linked_to")} value={form.linked_type} onChange={v=>{ set("linked_type")(v); set("linked_id")(""); }} options={[{value:"garden",label:"Garden"},{value:"field",label:"Bed/Field"},{value:"struct",label:"Structure"}]}/>
                            <Sel label="Item" value={form.linked_id} onChange={set("linked_id")} options={linkedOptions()}/>
                        </FormRow>
                        <Textarea label={t("notes")} value={form.notes} onChange={set("notes")} rows={2}/>
                        <FormActions onCancel={()=>{ setShow(false); setForm(ef); }} onSave={create} saveLabel={t("add_task")} t={t}/>
                    </div>
                </Modal>
            )}
            {showQuick && <QuickAddPlantModal onClose={() => setShowQuick(false)} gardens={gardens} fields={fields} lang={lang} dispatch={dispatch} uid={uid} />}
        </PageShell>
    );
}

// ═══════════════════════════════════════
// SCREEN: GREENHOUSES
// ═══════════════════════════════════════
function GreenhouseScreen({ state, dispatch, navigate, lang }) {
    const t = useT(lang);
    const uid = state.activeUserId;
    const gardens    = forUser(state.gardens, uid);
    const allFields  = forUser(state.fields, uid);
    const allPlants  = forUser(state.plants, uid);
    const allSlots   = forUser(state.slots||[], uid);
    const structSlots = allSlots.filter(s => s.parent_type==="struct");
    const traySlots = structSlots.filter(s => s.type==="greenhouse_tray");
    const structures = forUser(state.structures, uid).filter(s => GH_TYPES.includes(s.type));
    const [editGh, setEditGh] = useState(null);
    const [slotStruct, setSlotStruct] = useState(null);
    const [showSlot, setShowSlot] = useState(false);
    const [editSlot, setEditSlot] = useState(null);
    const [editSlotForm, setEditSlotForm] = useState(null);
    const [tempVal, setTempVal] = useState("");
    const [humVal, setHumVal]   = useState("");
    const [slotForm, setSlotForm] = useState({ name:"", label:"", type:"greenhouse_pot", rows:"4", cols:"6", row_count:"", spacing_cm:"", plant_count:"", row_length_m:"", notes:"" });
    const greenhousePlantsCount = allPlants.filter(p => p.struct_id || p.slot_id).reduce((sum, p) => sum + Math.max(1, +p.quantity || 1), 0);
    const totalSlots = structSlots.length;
    const ventilatedCount = structures.filter(s => s.ventilated).length;
    useEffect(() => {
        if (editGh) { setTempVal(editGh.temperature||""); setHumVal(editGh.humidity||""); }
    }, [editGh]);
    const saveGhMeta = () => {
        if (!editGh) return;
        dispatch({ type:"UPDATE_STRUCT", payload:{...editGh, temperature:tempVal, humidity:humVal} });
        setEditGh(null);
    };
    const toggleVent = (st) => dispatch({ type:"UPDATE_STRUCT", payload:{...st, ventilated:!st.ventilated} });
    const openEditSlot = (slot) => {
        setEditSlot(slot);
        setEditSlotForm({
            name: slot.name || "",
            label: slot.label || "",
            rows: String(slot.rows || 4),
            cols: String(slot.cols || 6),
            row_count: String(slot.row_count || 1),
            spacing_cm: slot.spacing_cm ? String(slot.spacing_cm) : "",
            plant_count: slot.plant_count ? String(slot.plant_count) : "",
            row_length_m: slot.row_length_m ? String(slot.row_length_m) : "",
            notes: slot.notes || "",
        });
    };
    const saveEditSlot = () => {
        if (!editSlot || !editSlotForm?.name.trim()) return;
        const next = {
            ...editSlot,
            name: editSlotForm.name.trim(),
            label: (editSlotForm.label || editSlotForm.name).trim(),
            notes: editSlotForm.notes || "",
        };
        if (editSlot.type === "greenhouse_tray") {
            next.rows = Math.max(1, +editSlotForm.rows || 4);
            next.cols = Math.max(1, +editSlotForm.cols || 6);
        }
        if (editSlot.type === "tunnel_row" || editSlot.type === "bed_row") {
            next.row_count = Math.max(1, +editSlotForm.row_count || 1);
            next.spacing_cm = Math.max(0, +editSlotForm.spacing_cm || 0);
            next.plant_count = Math.max(0, +editSlotForm.plant_count || 0);
            next.row_length_m = Math.max(0, +editSlotForm.row_length_m || 0);
        }
        dispatch({ type:"UPDATE_SLOT", payload: next });
        setEditSlot(null);
        setEditSlotForm(null);
    };
    const openSlotModal = (st) => {
        const nextType = st.type === "tunnel_greenhouse" ? "tunnel_row" : "greenhouse_pot";
        const count = structSlots.filter(s => s.parent_id===st.id && s.type===nextType).length + 1;
        setSlotStruct(st);
        const defaultType = st.type === "tunnel_greenhouse" ? "tunnel_row" : "greenhouse_pot";
        setSlotForm({
            name: defaultType === "tunnel_row" ? `${st.name} Row ${count}` : `${st.name} Pot ${count}`,
            label: defaultType === "tunnel_row" ? `R${count}` : `P${count}`,
            type: defaultType,
            rows:"4",
            cols:"6",
            row_count: defaultType === "tunnel_row" ? "4" : "",
            spacing_cm:"",
            plant_count:"",
            row_length_m:"",
            notes:"",
        });
        setShowSlot(true);
    };
    const createSlot = () => {
        if (!slotStruct || !slotForm.name.trim()) return;
        const trayId = gid();
        const common = {
            garden_id: slotStruct.garden_id,
            parent_type: "struct",
            parent_id: slotStruct.id,
            name: slotForm.name.trim(),
            label: (slotForm.label || slotForm.name).trim(),
            type: slotForm.type,
            notes: slotForm.notes || "",
        };
        const extra = {};
        if (slotForm.type === "greenhouse_tray") {
            extra.rows = +slotForm.rows || 4;
            extra.cols = +slotForm.cols || 6;
        }
        if (slotForm.type === "tunnel_row" || slotForm.type === "bed_row") {
            extra.row_count = +slotForm.row_count || 1;
            extra.spacing_cm = +slotForm.spacing_cm || 0;
            extra.plant_count = +slotForm.plant_count || 0;
            extra.row_length_m = +slotForm.row_length_m || 0;
        }
        dispatch({ type:"ADD_SLOT", payload:{ id:slotForm.type==="greenhouse_tray" ? trayId : gid(), ...common, ...extra } });
        if (slotForm.type === "greenhouse_tray") {
            const rows = Math.max(1, +slotForm.rows || 4);
            const cols = Math.max(1, +slotForm.cols || 6);
            const trayCells = [];
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    trayCells.push({
                        id: gid(),
                        garden_id: slotStruct.garden_id,
                        parent_type: "slot",
                        parent_id: trayId,
                        name: `Cell ${r + 1}-${c + 1}`,
                        label: `R${r + 1}C${c + 1}`,
                        type: "tray_cell",
                        notes: "",
                        row_index: r,
                        col_index: c,
                    });
                }
            }
            trayCells.forEach(cell => dispatch({ type:"ADD_SLOT", payload: cell }));
        }
        setShowSlot(false);
        setSlotStruct(null);
        setSlotForm({ name:"", label:"", type:"greenhouse_pot", rows:"4", cols:"6", row_count:"", spacing_cm:"", plant_count:"", row_length_m:"", notes:"" });
    };
    return (
        <PageShell width={1040}>
            <PageHeader
                title={`🏡 ${t("greenhouses")}`}
                subtitle={`${structures.length} structures across ${gardens.length} gardens`}
                meta={[
                    <MetaBadge key="gardens" value={gardens.length} label={t("gardens")} />,
                    <MetaBadge key="structures" value={structures.length} label={t("greenhouses")} />
                ]}
                actions={[<Btn key="editor" variant="secondary" onClick={()=>navigate("editor")}>{t("nav_editor")}</Btn>]}
            />
            <PanelGroup>
                <StatCard icon="🏡" label="Structures" value={structures.length} color={T.primary} sub={`${gardens.length} gardens`} />
                <StatCard icon="🫙" label="Slots" value={totalSlots} color="#558B2F" sub="Trays / Rows / Pots" />
                <StatCard icon="🌱" label="GH Plants" value={greenhousePlantsCount} color="#388E3C" sub="Inside structures" />
                <StatCard icon="🌬️" label="Ventilated" value={`${ventilatedCount}/${structures.length}`} color={ventilatedCount===structures.length?T.success:T.warning} sub="vents open" />
            </PanelGroup>
            {structures.length===0 ? (
                <SectionPanel title={t("greenhouses")} subtitle={t("no_greenhouses")} action={<Btn size="sm" variant="primary" onClick={()=>navigate("editor")}>{t("nav_editor")}</Btn>}>
                    <EmptyState icon="🏡" title={t("no_greenhouses")} subtitle={t("no_gh_sub")} />
                </SectionPanel>
            ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
                        {structures.map(st => {
                            const garden = gardens.find(g=>g.id===st.garden_id);
                            const linkedField = allFields.find(f => f.id===st.linked_field_id);
                            const insideBeds = allFields.filter(f => f.garden_id===st.garden_id && isInsideGH(f,st));
                            const insidePlants = allPlants.filter(p => insideBeds.some(b=>b.id===p.field_id));
                            const structPlants = allPlants.filter(p => p.struct_id===st.id);
                            const structDirectSlots = structSlots.filter(s => s.parent_id===st.id);
                            const trayChildren = allSlots.filter(s => s.parent_type==="slot" && structDirectSlots.some(d => d.id===s.parent_id));
                            const greenhouseSlotIds = new Set([...structDirectSlots.map(s=>s.id), ...trayChildren.map(s=>s.id)]);
                            const allGreenhousePlants = [...insidePlants, ...structPlants, ...allPlants.filter(p => greenhouseSlotIds.has(p.slot_id))];
                            const greenhousePlantQty = allGreenhousePlants.reduce((sum, p) => sum + Math.max(1, +p.quantity || 1), 0);
                            const slotCount = structDirectSlots.length;
                            const trayChildrenByParent = trayChildren.reduce((acc, slot) => {
                                (acc[slot.parent_id] ||= []).push(slot);
                                return acc;
                            }, {});
                            const isTunnel = st.type==="tunnel_greenhouse";
                            const stroke = STRUCT_STROKE[st.type]||"#00838F";
                            return (
                                <Card key={st.id} style={{ overflow:"hidden" }}>
                                    {/* Header stripe */}
                                    <div style={{ height:4, background:stroke }}/>
                                    <div style={{ padding:"16px 20px" }}>
                                        <div style={{ display:"flex", alignItems:"flex-start", gap:14, marginBottom:16 }}>
                                        <div style={{ width:52, height:52, borderRadius:T.r, background:STRUCT_FILL[st.type]||"rgba(0,131,143,0.15)", border:`2px solid ${stroke}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, flexShrink:0 }}>
                                            {isTunnel?"⛺":"🏡"}
                                        </div>
                                        <div style={{ flex:1 }}>
                                            <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                                                <h2 style={{ margin:0, fontSize:18, fontWeight:800, color:T.text, fontFamily:"Fraunces, serif" }}>{st.name}</h2>
                                                <Badge color={stroke} bg={stroke+"20"}>{t(STRUCT_LABEL_K[st.type])||st.type}</Badge>
                                                {garden && <Badge color={T.textSub} bg={T.surfaceAlt}>{garden.name}</Badge>}
                                                {linkedField && <Badge color={T.accent} bg={T.accentBg}>🔗 {linkedField.name}</Badge>}
                                            </div>
                                            <div style={{ fontSize:12, color:T.textMuted, marginTop:4 }}>{st.width}m × {st.height}m = {(st.width*st.height).toFixed(1)}m² · Position ({st.x}m, {st.y}m)</div>
                                            {st.notes && <div style={{ fontSize:12, color:T.textSub, marginTop:4, lineHeight:1.5 }}>{st.notes}</div>}
                                        </div>
                                        {/* Ventilation toggle */}
                                        <button onClick={()=>toggleVent(st)} style={{ padding:"8px 16px", borderRadius:T.rs, border:`2px solid ${st.ventilated?T.success:T.textMuted}`, background:st.ventilated?T.successBg:T.surfaceAlt, color:st.ventilated?T.success:T.textMuted, cursor:"pointer", fontFamily:"inherit", fontWeight:700, fontSize:12, transition:"all 0.15s", flexShrink:0, whiteSpace:"nowrap" }}>
                                            {st.ventilated ? t("ventilated") : t("closed")}
                                        </button>
                                        </div>
                                        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:12 }}>
                                            <Badge color={T.textSub} bg={T.surfaceAlt}>{greenhousePlantQty} plants</Badge>
                                            <Badge color={T.textSub} bg={T.surfaceAlt}>{slotCount} slots</Badge>
                                            <Badge color={st.ventilated?T.success:T.warning} bg={st.ventilated?T.successBg:T.warningBg}>{st.ventilated ? t("ventilated") : t("closed")}</Badge>
                                        </div>
                                        {/* Climate row */}
                                        <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
                                            <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 14px", background:T.surfaceAlt, borderRadius:T.rs, flex:1, minWidth:180 }}>
                                            <span style={{ fontSize:18 }}>🌡️</span>
                                            <div style={{ flex:1 }}>
                                                <div style={{ fontSize:10, fontWeight:700, color:T.textMuted, textTransform:"uppercase", letterSpacing:0.5 }}>{t("temp")}</div>
                                                <div style={{ fontSize:14, fontWeight:700, color:T.text }}>{st.temperature||"—"}</div>
                                            </div>
                                            <Btn size="sm" variant="ghost" onClick={()=>setEditGh(st)}>Edit</Btn>
                                        </div>
                                        <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 14px", background:T.surfaceAlt, borderRadius:T.rs, flex:1, minWidth:180 }}>
                                            <span style={{ fontSize:18 }}>💧</span>
                                            <div style={{ flex:1 }}>
                                                <div style={{ fontSize:10, fontWeight:700, color:T.textMuted, textTransform:"uppercase", letterSpacing:0.5 }}>{t("humidity")}</div>
                                                <div style={{ fontSize:14, fontWeight:700, color:T.text }}>{st.humidity ? `${st.humidity}%` : "—"}</div>
                                            </div>
                                        </div>
                                        <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 14px", background:T.surfaceAlt, borderRadius:T.rs }}>
                                            <span style={{ fontSize:18 }}>🛏️</span>
                                            <div>
                                                <div style={{ fontSize:10, fontWeight:700, color:T.textMuted, textTransform:"uppercase", letterSpacing:0.5 }}>{t("inside_beds")}</div>
                                                <div style={{ fontSize:14, fontWeight:700, color:T.primary }}>{insideBeds.length}</div>
                                            </div>
                                        </div>
                                        <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 14px", background:T.surfaceAlt, borderRadius:T.rs }}>
                                            <span style={{ fontSize:18 }}>🫙</span>
                                            <div>
                                                <div style={{ fontSize:10, fontWeight:700, color:T.textMuted, textTransform:"uppercase", letterSpacing:0.5 }}>Pots / Trays / Rows</div>
                                            <div style={{ fontSize:14, fontWeight:700, color:T.primary }}>{structDirectSlots.length}</div>
                                        </div>
                                    </div>
                                </div>
                                    {structDirectSlots.length>0 && (
                                        <div style={{ marginBottom:12 }}>
                                            <div style={{ fontSize:12, fontWeight:700, color:T.textSub, marginBottom:8, textTransform:"uppercase", letterSpacing:0.5 }}>🫙 Pots, Trays & Rows</div>
                                            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                                                {structDirectSlots.map(slot => {
                                                    const slotPlants = allPlants.filter(p => p.slot_id===slot.id);
                                                    const slotPlantQty = slotPlants.reduce((sum, p) => sum + Math.max(1, +p.quantity || 1), 0);
                                                    const isTray = slot.type === "greenhouse_tray";
                                                    const trayCellsForSlot = trayChildrenByParent[slot.id] || [];
                                                    return (
                                                        <div key={slot.id} style={{ padding:"8px 12px", background:T.surfaceAlt, border:`1px solid ${T.border}`, borderRadius:T.rs, minWidth:isTray?260:170, flex:"1 1 240px" }}>
                                                            <div style={{ display:"flex", alignItems:"start", justifyContent:"space-between", gap:8 }}>
                                                                <div>
                                                                    <div style={{ fontSize:13, fontWeight:700, color:T.text }}>{slotDisplayLabel(slot, allSlots)}</div>
                                                                    <div style={{ fontSize:11, color:T.textMuted }}>{slotTypeLabel(slot, t)}{isTray && slot.rows && slot.cols ? ` · ${slot.rows}×${slot.cols}` : ""}{(slot.type==="tunnel_row"||slot.type==="bed_row") && slot.spacing_cm ? ` · ${slot.spacing_cm}cm spacing` : ""}{(slot.type==="tunnel_row"||slot.type==="bed_row") && slot.plant_count ? ` · ${slot.plant_count} plants` : ""}</div>
                                                                    <div style={{ fontSize:11, color:T.textSub, marginTop:2 }}>{slotPlantQty} plant{slotPlantQty!==1?"s":""}</div>
                                                                </div>
                                                                <Btn size="sm" variant="ghost" onClick={()=>openEditSlot(slot)}>Edit</Btn>
                                                            </div>
                                                            {isTray && trayCellsForSlot.length>0 && (
                                                                <div style={{ marginTop:8, display:"grid", gridTemplateColumns:`repeat(${slot.cols || 6}, minmax(0, 1fr))`, gap:4 }}>
                                                                    {trayCellsForSlot.sort((a,b)=>(a.row_index-b.row_index)||(a.col_index-b.col_index)).map(cell => {
                                                                        const cellPlants = allPlants.filter(p => p.slot_id===cell.id);
                                                                        return (
                                                                            <div key={cell.id} style={{ border:`1px solid ${T.border}`, borderRadius:6, padding:"6px 5px", background:T.surface, minHeight:42, display:"flex", flexDirection:"column", gap:3 }}>
                                                                                <div style={{ fontSize:9, fontWeight:800, color:T.textMuted }}>{cell.label}</div>
                                                                                <div style={{ fontSize:10, color:T.textSub, lineHeight:1.2 }}>{cellPlants.length ? `${cellPlants.length} plant${cellPlants.length!==1?"s":""}` : "empty"}</div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                            {(slot.type==="tunnel_row"||slot.type==="bed_row") && renderSlotSeedPlan(slot)}
                                                            {slotPlants.length>0 && (
                                                                <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginTop:5 }}>
                                                                    {slotPlants.map(p => <Badge key={p.id} color={STATUS_CFG[p.status]?.color||T.textSub} bg={STATUS_CFG[p.status]?.bg||T.surfaceAlt}>{CAT_ICONS[p.category]||"🌿"} {p.name} ×{Math.max(1, +p.quantity || 1)}</Badge>)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                    {/* Inside beds */}
                                    {insideBeds.length>0 && (
                                        <div style={{ marginBottom:12 }}>
                                            <div style={{ fontSize:12, fontWeight:700, color:T.textSub, marginBottom:8, textTransform:"uppercase", letterSpacing:0.5 }}>🛏️ {t("inside_beds")}</div>
                                            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                                                {insideBeds.map(bed => {
                                                    const fc=FIELD_COLORS[bed.type]||T.primary;
                                                    const bp=insidePlants.filter(p=>p.field_id===bed.id);
                                                    return (
                                                        <div key={bed.id} style={{ padding:"8px 12px", background:fc+"12", border:`1.5px solid ${fc}`, borderRadius:T.rs, minWidth:160 }}>
                                                            <div style={{ fontSize:13, fontWeight:700, color:T.text }}>{bed.name}</div>
                                                            <div style={{ fontSize:11, color:T.textMuted }}>{bed.width}m × {bed.height}m · {LANG[lang]?.[FIELD_LABEL_K[bed.type]]||bed.type}</div>
                                                            {bp.length>0 && (
                                                                <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginTop:5 }}>
                                                                    {bp.map(p => <Badge key={p.id} color={STATUS_CFG[p.status]?.color||T.textSub} bg={STATUS_CFG[p.status]?.bg||T.surfaceAlt}>{CAT_ICONS[p.category]||"🌿"} {p.name}</Badge>)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                    {/* Inside plants summary */}
                                    {allGreenhousePlants.length>0 && (
                                        <div>
                                            <div style={{ fontSize:12, fontWeight:700, color:T.textSub, marginBottom:8, textTransform:"uppercase", letterSpacing:0.5 }}>🌱 {t("inside_plants")} ({greenhousePlantQty})</div>
                                            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                                                {allGreenhousePlants.map(p => {
                                                    const sc_=STATUS_CFG[p.status]||STATUS_CFG.planned;
                                                    const sc_l=t(STATUS_K[p.status])||p.status;
                                                    const slot=allSlots.find(s => s.id===p.slot_id);
                                                    return (
                                                        <div key={p.id} style={{ padding:"6px 10px", background:T.surface, border:`1px solid ${T.border}`, borderRadius:T.rs, display:"flex", alignItems:"center", gap:6 }}>
                                                            <span style={{ fontSize:16 }}>{CAT_ICONS[p.category]||"🌿"}</span>
                                                            <div>
                                                                <div style={{ fontSize:12, fontWeight:700, color:T.text }}>{p.name}</div>
                                                                <div style={{ fontSize:10, color:T.textMuted }}>{p.variety} · ×{Math.max(1, +p.quantity || 1)}{slot ? ` · ${slot.name}` : ""}{p.row_count ? ` · ${p.row_count} rows` : ""}{p.row_plant_count ? ` · ${p.row_plant_count}/row` : ""}</div>
                                                            </div>
                                                            <Badge color={sc_.color} bg={sc_.bg} style={{fontSize:9}}>{sc_l}</Badge>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                    {insideBeds.length===0 && (
                                        <div style={{ padding:"12px 16px", background:T.surfaceAlt, borderRadius:T.rs, fontSize:12, color:T.textMuted, textAlign:"center" }}>
                                            No beds detected inside this {isTunnel?"tunnel":"greenhouse"}. Move or resize beds in the Garden Editor to place them inside.
                                        </div>
                                    )}
                                    {/* Actions */}
                                    <div style={{ display:"flex", gap:8, marginTop:14, flexWrap:"wrap" }}>
                                        <Btn size="sm" variant="secondary" onClick={()=>openSlotModal(st)}>🫙 Add {isTunnel ? "Row" : "Pot / Tray / Row"}</Btn>
                                        <Btn size="sm" variant="primary" onClick={()=>{ dispatch({type:"SET_ACTIVE_GARDEN",payload:st.garden_id}); navigate("editor"); }}>📐 {t("nav_editor")}</Btn>
                                        <Btn size="sm" variant={st.ventilated?"ghost":"success"} onClick={()=>toggleVent(st)}>
                                            {st.ventilated ? `🔒 ${t("close_vents")}` : `🌬️ ${t("ventilate")}`}
                                        </Btn>
                                        <Btn size="sm" variant="secondary" onClick={()=>setEditGh(st)}>🌡️ Log Climate</Btn>
                                        <Btn size="sm" variant="danger" onClick={()=>{ if(window.confirm(t("delete_struct"))) dispatch({type:"DELETE_STRUCT",payload:st.id}); }}>✕ {t("delete")}</Btn>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
            {showSlot && slotStruct && (
            <Modal title={`🫙 Add ${slotStruct.type==="tunnel_greenhouse" ? "Row" : "Pot"} In ${slotStruct.name}`} onClose={()=>{ setShowSlot(false); setSlotStruct(null); setSlotForm({ name:"", label:"", type:"greenhouse_pot", rows:"4", cols:"6", row_count:"", spacing_cm:"", plant_count:"", row_length_m:"", notes:"" }); }}>
                    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                        <InfoBanner icon="🫙">
                            {slotStruct.type==="tunnel_greenhouse"
                                ? "Tunnel layouts work best as rows. Add row counts, spacing and plants per row."
                                : "Pots, trays, tables and rows are optional internal locations inside a greenhouse."}
                        </InfoBanner>
                        <FormRow cols={2}>
                            <Input label="Name" value={slotForm.name} onChange={v=>setSlotForm(f=>({...f,name:v}))} placeholder="e.g. Tomato Pot Bench" required/>
                            <Input label="Label" value={slotForm.label} onChange={v=>setSlotForm(f=>({...f,label:v}))} placeholder="P1" required/>
                        </FormRow>
                        {slotStruct.type==="tunnel_greenhouse" ? (
                            <Input label="Type" value="Row" disabled />
                        ) : (
                            <Sel label="Type" value={slotForm.type} onChange={v=>setSlotForm(f=>({...f,type:v}))} options={[
                                { value:"greenhouse_pot", label:"Pot" },
                                { value:"greenhouse_tray", label:"Tray" },
                                { value:"greenhouse_table", label:"Table" },
                            ]}/>
                        )}
                        {(slotForm.type==="greenhouse_tray") && (
                            <FormRow cols={2}>
                                <Input label="Rows" value={slotForm.rows} onChange={v=>setSlotForm(f=>({...f,rows:v}))} type="number" min="1" max="24" required/>
                                <Input label="Cols" value={slotForm.cols} onChange={v=>setSlotForm(f=>({...f,cols:v}))} type="number" min="1" max="24" required/>
                            </FormRow>
                        )}
                        {(slotStruct.type==="tunnel_greenhouse" || slotForm.type==="tunnel_row" || slotForm.type==="bed_row") && (
                            <>
                                <FormRow cols={3}>
                                    <Input label="Rows" value={slotForm.row_count} onChange={v=>setSlotForm(f=>({...f,row_count:v}))} type="number" min="1" max="24" placeholder="4"/>
                                    <Input label="Spacing (cm)" value={slotForm.spacing_cm} onChange={v=>setSlotForm(f=>({...f,spacing_cm:v}))} type="number" min="1" max="200" placeholder="35"/>
                                    <Input label="Plants" value={slotForm.plant_count} onChange={v=>setSlotForm(f=>({...f,plant_count:v}))} type="number" min="1" max="1000" placeholder="24"/>
                                </FormRow>
                                <Input label="Row length (m)" value={slotForm.row_length_m} onChange={v=>setSlotForm(f=>({...f,row_length_m:v}))} type="number" min="0.1" max="100" placeholder="8.4"/>
                            </>
                        )}
                        <Textarea label={t("notes")} value={slotForm.notes} onChange={v=>setSlotForm(f=>({...f,notes:v}))} rows={2}/>
                        <FormActions onCancel={()=>{ setShowSlot(false); setSlotStruct(null); setSlotForm({ name:"", label:"", type:"greenhouse_pot", rows:"4", cols:"6", row_count:"", spacing_cm:"", plant_count:"", row_length_m:"", notes:"" }); }} onSave={createSlot} saveLabel="Add Pot" t={t}/>
                    </div>
                </Modal>
            )}
            {editSlot && editSlotForm && (
                <Modal title={`✏️ Edit ${editSlot.name}`} onClose={()=>{ setEditSlot(null); setEditSlotForm(null); }}>
                    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                        <InfoBanner icon="ℹ️">This edits an existing slot. Row count and spacing control the scale preview only for row-based slots.</InfoBanner>
                        <FormRow cols={2}>
                            <Input label="Name" value={editSlotForm.name} onChange={v=>setEditSlotForm(f=>({...f,name:v}))} required/>
                            <Input label="Label" value={editSlotForm.label} onChange={v=>setEditSlotForm(f=>({...f,label:v}))} required/>
                        </FormRow>
                        <Input label="Type" value={slotTypeLabel(editSlot, t)} disabled/>
                        {editSlot.type === "greenhouse_tray" && (
                            <FormRow cols={2}>
                                <Input label="Rows" value={editSlotForm.rows} onChange={v=>setEditSlotForm(f=>({...f,rows:v}))} type="number" min="1" max="24"/>
                                <Input label="Cols" value={editSlotForm.cols} onChange={v=>setEditSlotForm(f=>({...f,cols:v}))} type="number" min="1" max="24"/>
                            </FormRow>
                        )}
                        {(editSlot.type === "tunnel_row" || editSlot.type === "bed_row") && (
                            <>
                                <FormRow cols={3}>
                                    <Input label="Rows" value={editSlotForm.row_count} onChange={v=>setEditSlotForm(f=>({...f,row_count:v}))} type="number" min="1" max="24"/>
                                    <Input label="Spacing (cm)" value={editSlotForm.spacing_cm} onChange={v=>setEditSlotForm(f=>({...f,spacing_cm:v}))} type="number" min="1" max="200"/>
                                    <Input label="Plants" value={editSlotForm.plant_count} onChange={v=>setEditSlotForm(f=>({...f,plant_count:v}))} type="number" min="0" max="1000"/>
                                </FormRow>
                                <Input label="Row length (m)" value={editSlotForm.row_length_m} onChange={v=>setEditSlotForm(f=>({...f,row_length_m:v}))} type="number" min="0.1" max="100"/>
                                {renderSlotSeedPlan({ ...editSlot, ...editSlotForm, row_count: editSlotForm.row_count, spacing_cm: editSlotForm.spacing_cm, plant_count: editSlotForm.plant_count, row_length_m: editSlotForm.row_length_m })}
                            </>
                        )}
                        <Textarea label={t("notes")} value={editSlotForm.notes} onChange={v=>setEditSlotForm(f=>({...f,notes:v}))} rows={2}/>
                        <FormActions onCancel={()=>{ setEditSlot(null); setEditSlotForm(null); }} onSave={saveEditSlot} saveLabel={t("save")} t={t}/>
                    </div>
                </Modal>
            )}
            {editGh && (
                <Modal title={`🌡️ Climate Log — ${editGh.name}`} onClose={()=>setEditGh(null)} width={400}>
                    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                        <Input label={`🌡️ ${t("temp")} (e.g. 22°C)`} value={tempVal} onChange={setTempVal} placeholder="22°C"/>
                        <Input label={`💧 ${t("humidity")} (0-100%)`} value={humVal} onChange={setHumVal} type="number" min="0" max="100" placeholder="65"/>
                        <FormActions onCancel={()=>setEditGh(null)} onSave={saveGhMeta} saveLabel={t("save")} t={t}/>
                    </div>
                </Modal>
            )}
        </PageShell>
    );
}

// ═══════════════════════════════════════
// SCREEN: SETTINGS
// ═══════════════════════════════════════
function SettingsScreen({ state, dispatch, lang }) {
    const t = useT(lang);
    const uid = state.activeUserId;
    const activeUser = state.users.find(u=>u.id===uid);
    const [weatherForm, setWeatherForm] = useState({
        location_name: "",
        latitude: "",
        longitude: "",
        sms_phone: "",
        sms_alerts_enabled: false,
    });
    const [weather, setWeather] = useState(null);
    const [weatherLoading, setWeatherLoading] = useState(false);
    const [weatherError, setWeatherError] = useState("");
    useEffect(() => {
        const settings = activeUser?.settings || {};
        setWeatherForm({
            location_name: settings.weather_location_name || "",
            latitude: settings.weather_latitude || "",
            longitude: settings.weather_longitude || "",
            sms_phone: settings.sms_phone || "",
            sms_alerts_enabled: Boolean(settings.sms_alerts_enabled),
        });
    }, [activeUser]);
    const exportData = () => {
        const blob = new Blob([JSON.stringify(state,null,2)],{type:"application/json"});
        const a = document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="gardengrid-export.json"; a.click();
    };
    const resetData = async () => {
        if (window.confirm(t("reset_confirm"))) {
            await resetState();
            window.location.reload();
        }
    };
    const refreshWeather = useCallback(async (latitude = weatherForm.latitude, longitude = weatherForm.longitude) => {
        if (!latitude || !longitude) return;
        setWeatherLoading(true);
        setWeatherError("");
        try {
            const data = await apiJson(`/api/weather.php?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}`);
            setWeather(data);
        } catch {
            setWeatherError("Weather data could not be loaded.");
        } finally {
            setWeatherLoading(false);
        }
    }, [weatherForm.latitude, weatherForm.longitude]);
    useEffect(() => {
        if (weatherForm.latitude && weatherForm.longitude) {
            refreshWeather(weatherForm.latitude, weatherForm.longitude);
        } else {
            setWeather(null);
        }
    }, [weatherForm.latitude, weatherForm.longitude, refreshWeather]);
    const saveWeatherSettings = () => {
        dispatch({
            type:"SET_SETTING",
            payload:{
                weather_location_name: weatherForm.location_name.trim(),
                weather_latitude: weatherForm.latitude.trim(),
                weather_longitude: weatherForm.longitude.trim(),
                sms_phone: weatherForm.sms_phone.trim(),
                sms_alerts_enabled: weatherForm.sms_alerts_enabled,
            }
        });
    };
    const LANGS = [["en","🇬🇧","English"],["nl","🇧🇪","Nederlands"],["fr","🇫🇷","Français"],["de","🇩🇪","Deutsch"]];
    return (
        <div style={{ padding:28, maxWidth:640, margin:"0 auto" }}>
            <h1 style={{ margin:"0 0 24px", fontSize:24, fontWeight:900, fontFamily:"Fraunces, serif", color:T.text }}>⚙️ {t("nav_settings")}</h1>
            <Card style={{ marginBottom:16 }}>
                <div style={{ padding:"14px 18px 12px", borderBottom:`1px solid ${T.border}` }}>
                    <h2 style={{ margin:0, fontSize:14, fontWeight:800, color:T.text, fontFamily:"Fraunces, serif" }}>🌍 {t("language")}</h2>
                </div>
                <div style={{ padding:18, display:"flex", flexDirection:"column", gap:8 }}>
                    {LANGS.map(([code,flag,name]) => (
                        <label key={code} style={{ display:"flex", alignItems:"center", gap:12, cursor:"pointer", padding:"11px 14px", borderRadius:T.rs, background:lang===code?T.primaryBg:T.surface, border:`1.5px solid ${lang===code?T.primary:T.border}`, transition:"all 0.15s" }}>
                            <input type="radio" name="lang" checked={lang===code} onChange={()=>dispatch({type:"SET_SETTING",payload:{lang:code}})} style={{ accentColor:T.primary }}/>
                            <span style={{ fontSize:18 }}>{flag}</span>
                            <span style={{ fontSize:13, fontWeight:700, color:lang===code?T.primary:T.text, flex:1 }}>{name}</span>
                            <Badge color={lang===code?T.success:T.textMuted} bg={lang===code?T.successBg:T.surfaceAlt}>{lang===code?"Active":"✓"}</Badge>
                        </label>
                    ))}
                </div>
            </Card>
            <Card style={{ marginBottom:16 }}>
                <div style={{ padding:"14px 18px 12px", borderBottom:`1px solid ${T.border}` }}>
                    <h2 style={{ margin:0, fontSize:14, fontWeight:800, color:T.text, fontFamily:"Fraunces, serif" }}>👥 {t("your_profile")}</h2>
                </div>
                <div style={{ padding:18 }}>
                    <div style={{ display:"flex", gap:14, alignItems:"center", marginBottom:16 }}>
                        <div style={{ width:52, height:52, borderRadius:99, background:activeUser?.color||T.primary, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, flexShrink:0 }}>{activeUser?.avatar||"🌱"}</div>
                        <div><div style={{ fontSize:16, fontWeight:800, color:T.text }}>{activeUser?.name||"User"}</div><div style={{ fontSize:12, color:T.textMuted }}>{forUser(state.gardens,uid).length} gardens · {forUser(state.plants,uid).length} plants · {forUser(state.tasks,uid).filter(t2=>t2.status==="pending").length} pending tasks</div></div>
                    </div>
                    <div style={{ fontSize:13, color:T.textSub }}>Manage profiles using the user switcher in the sidebar header.</div>
                </div>
            </Card>
            <Card style={{ marginBottom:16 }}>
                <div style={{ padding:"14px 18px 12px", borderBottom:`1px solid ${T.border}` }}>
                    <h2 style={{ margin:0, fontSize:14, fontWeight:800, color:T.text, fontFamily:"Fraunces, serif" }}>🌦️ Weather & Storm Alerts</h2>
                </div>
                <div style={{ padding:18, display:"flex", flexDirection:"column", gap:14 }}>
                    <FormRow cols={2}>
                        <Input label="Location name" value={weatherForm.location_name} onChange={v=>setWeatherForm(f=>({...f,location_name:v}))} placeholder="e.g. Aarschot garden"/>
                        <Input label="SMS phone" value={weatherForm.sms_phone} onChange={v=>setWeatherForm(f=>({...f,sms_phone:v}))} placeholder="+32478118430"/>
                    </FormRow>
                    <FormRow cols={2}>
                        <Input label="Latitude" value={weatherForm.latitude} onChange={v=>setWeatherForm(f=>({...f,latitude:v}))} placeholder="50.9841"/>
                        <Input label="Longitude" value={weatherForm.longitude} onChange={v=>setWeatherForm(f=>({...f,longitude:v}))} placeholder="4.8365"/>
                    </FormRow>
                    <label style={{ display:"flex", alignItems:"center", gap:10, fontSize:13, color:T.text, cursor:"pointer" }}>
                        <input type="checkbox" checked={weatherForm.sms_alerts_enabled} onChange={e=>setWeatherForm(f=>({...f,sms_alerts_enabled:e.target.checked}))} style={{ accentColor:T.primary }}/>
                        Enable SMS alerts when a storm is forecast
                    </label>
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                        <Btn variant="primary" onClick={saveWeatherSettings}>Save Weather Settings</Btn>
                        <Btn variant="secondary" onClick={()=>refreshWeather()} disabled={!weatherForm.latitude || !weatherForm.longitude || weatherLoading}>
                            {weatherLoading ? "Loading..." : "Refresh Live Weather"}
                        </Btn>
                    </div>
                    <div style={{ fontSize:12, color:T.textMuted, lineHeight:1.6 }}>
                        Free live weather uses Open-Meteo. SMS alerts can be sent through an Android SMS gateway that uses your own SIM card and phone number when storm risk is detected.
                    </div>
                    {weatherError && <div style={{ background:T.dangerBg, color:T.danger, borderRadius:T.rs, padding:"9px 12px", fontSize:12 }}>{weatherError}</div>}
                    {weather?.current && (
                        <div style={{ background:T.surfaceAlt, borderRadius:T.r, padding:14, display:"flex", flexDirection:"column", gap:8 }}>
                            <div style={{ display:"flex", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
                                <div>
                                    <div style={{ fontSize:12, color:T.textMuted }}>Current weather</div>
                                    <div style={{ fontSize:18, fontWeight:800, color:T.text }}>
                                        {weather.current.temperature_2m}°C · {WEATHER_CODE_LABELS[weather.current.weather_code] || `Code ${weather.current.weather_code}`}
                                    </div>
                                </div>
                                <div style={{ fontSize:12, color:T.textSub }}>
                                    Wind {weather.current.wind_speed_10m} km/h · Gusts {weather.current.wind_gusts_10m} km/h
                                </div>
                            </div>
                            <div style={{ fontSize:12, color:weather.storm?.active ? T.danger : T.success }}>
                                {weather.storm?.active
                                    ? `Storm warning: ${weather.storm.reason} expected around ${weather.storm.starts_at}.`
                                    : `No storm forecast right now. Max gust in forecast: ${Math.round(weather.storm?.max_gust_kmh || 0)} km/h.`}
                            </div>
                        </div>
                    )}
                </div>
            </Card>
            <Card style={{ marginBottom:16 }}>
                <div style={{ padding:"14px 18px 12px", borderBottom:`1px solid ${T.border}` }}>
                    <h2 style={{ margin:0, fontSize:14, fontWeight:800, color:T.text, fontFamily:"Fraunces, serif" }}>💾 {t("data_mgmt")}</h2>
                </div>
                <div style={{ padding:18, display:"flex", flexDirection:"column", gap:12 }}>
                    <div style={{ fontSize:13, color:T.textSub, lineHeight:1.6, background:T.surfaceAlt, borderRadius:T.rs, padding:12 }}>
                        🔒 Your garden data is now stored securely on the server in MySQL so it stays available across devices and sessions.
                    </div>
                    <div style={{ display:"flex", gap:8 }}>
                        <Btn variant="secondary" onClick={exportData} icon="📤">{t("export_backup")}</Btn>
                        <Btn variant="danger" onClick={resetData} icon="🗑️">{t("reset_all")}</Btn>
                    </div>
                    <div style={{ fontSize:11, color:T.textMuted }}>
                        {state.users.length} profiles · {state.gardens.length} gardens · {state.fields.length} beds · {state.plants.length} plants · {state.tasks.length} tasks
                    </div>
                </div>
            </Card>
            <Card>
                <div style={{ padding:24, textAlign:"center" }}>
                    <div style={{ fontSize:48, marginBottom:10 }}>🌱</div>
                    <div style={{ fontSize:20, fontWeight:900, color:T.text, fontFamily:"Fraunces, serif" }}>MyGarden</div>
                    <div style={{ fontSize:12, color:T.textMuted, marginTop:4, lineHeight:1.7 }}>
                        v2.0.0 · {t("app_subtitle")}<br/>
                        Multi-user · 4 languages · 60+ plant library<br/>
                        Greenhouse tracking · Offline-first
                    </div>
                    <div style={{ marginTop:14, display:"flex", justifyContent:"center", gap:8, flexWrap:"wrap" }}>
                        {["Multi-user","EN/NL/FR/DE","Plant Library","Greenhouse Tracker","Drag & Resize Editor"].map(f=><Badge key={f} color={T.primary} bg={T.primaryBg}>{f}</Badge>)}
                    </div>
                </div>
            </Card>
        </div>
    );
}

// ═══════════════════════════════════════
// SCREEN: DEV
// ═══════════════════════════════════════
function DevScreen() {
    const t = useT("en");
    const [count, setCount] = useState(5);
    const [category, setCategory] = useState("vegetable");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [plants, setPlants] = useState([]);

    const generatePlants = async () => {
        setLoading(true);
        setStatus({ type: "loading", msg: `Generating ${count} plants... (CPU-only server, may take 1-3 minutes)` });
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 330000);

            const res = await fetch("/api/generate-plants.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ count: parseInt(count), category }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            const data = await res.json();
            if (data.error) {
                setStatus({ type: "error", msg: data.error });
            } else {
                setStatus({ type: "success", msg: `Saved ${data.saved} plants!` });
                setPlants(data.plants || []);
            }
        } catch (e) {
            if (e.name === "AbortError") {
                setStatus({ type: "error", msg: "Request timed out - Ollama is taking too long" });
            } else {
                setStatus({ type: "error", msg: e.message });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: 28, maxWidth: 900, margin: "0 auto" }}>
            <h1 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 900, fontFamily: "Fraunces, serif", color: T.text }}>⚡ Dev Panel</h1>
            <p style={{ margin: "0 0 24px", fontSize: 12, color: T.textSub }}>Generate plants using Ollama + Gemma4</p>

            <Card style={{ marginBottom: 16 }}>
                <div style={{ padding: "14px 18px 12px", borderBottom: `1px solid ${T.border}` }}>
                    <h2 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: T.text, fontFamily: "Fraunces, serif" }}>🌱 Plant Generator</h2>
                </div>
                <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
                    <FormRow cols={2}>
                        <Input label="Count" value={count} onChange={c => setCount(Math.min(50, Math.max(1, parseInt(c) || 1)))} type="number" min="1" max="50" />
                        <Sel label="Category" value={category} onChange={setCategory} options={[
                            { label: "Vegetable", value: "vegetable" },
                            { label: "Fruit", value: "fruit" },
                            { label: "Herb", value: "herb" },
                            { label: "Flower", value: "flower" },
                            { label: "Grass", value: "grass" },
                            { label: "Tree", value: "tree" },
                            { label: "Shrub", value: "shrub" },
                            { label: "Groundcover", value: "groundcover" },
                        ]} />
                    </FormRow>
                    <Btn variant="primary" onClick={generatePlants} disabled={loading}>{loading ? "Generating..." : "Generate Plants"}</Btn>
                    {status && (
                        <div style={{
                            padding: "12px 16px",
                            borderRadius: T.rs,
                            background: status.type === "success" ? T.successBg : status.type === "error" ? T.dangerBg : T.infoBg,
                            color: status.type === "success" ? T.success : status.type === "error" ? T.danger : T.info,
                            fontSize: 13
                        }}>
                            {status.msg}
                        </div>
                    )}
                </div>
            </Card>

            {plants.length > 0 && (
                <Card>
                    <div style={{ padding: "14px 18px 12px", borderBottom: `1px solid ${T.border}` }}>
                        <h2 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: T.text, fontFamily: "Fraunces, serif" }}>Generated Plants</h2>
                    </div>
                    <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
                        {plants.map((p, i) => (
                            <div key={i} style={{ border: `1px solid ${T.borderSoft}`, borderRadius: T.rs, padding: 12, background: T.surfaceSoft }}>
                                <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 4 }}>{p.icon} {p.name}</div>
                                <div style={{ fontSize: 12, color: T.textSub, marginBottom: 6 }}>
                                    {p.sunlight} · {p.water_needs} water · {p.days_to_maturity} days
                                </div>
                                <div style={{ fontSize: 12, color: T.textSub, marginBottom: 6 }}>{p.description}</div>
                                {p.varieties && p.varieties.length > 0 && (
                                    <div style={{ fontSize: 11, color: T.textMuted }}>Varieties: {p.varieties.join(", ")}</div>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
}

// ═══════════════════════════════════════
// APP ROOT
// ═══════════════════════════════════════
export default function GardenGridApp() {
    const [state, dispatch] = useReducer(reducer, SEED);
    const [loggedInUid, setLoggedInUid] = useState(null);
    const [screen, setScreen] = useState("dashboard");
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const harvestSyncRef = useRef("");
    const [booted, setBooted] = useState(false);

    useEffect(() => {
        let active = true;
        (async () => {
            const [remoteState, sessionUid] = await Promise.all([loadState(), getSession()]);
            if (!active) return;
            if (remoteState) {
                dispatch({ type:"HYDRATE_STATE", payload: remoteState });
            }
            setLoggedInUid(sessionUid);
            setBooted(true);
        })();
        return () => { active = false; };
    }, []);
    useEffect(() => {
        if (!booted) return;
        saveState(state).catch(() => {});
    }, [state, booted]);
    useEffect(() => {
        if (!booted) return;
        const uid = state.activeUserId;
        if (!uid) return;
        const stamp = `${uid}:${forUser(state.plants, uid).length}:${forUser(state.tasks, uid).filter(t => String(t.id).startsWith("harvest_")).length}`;
        if (harvestSyncRef.current === stamp) return;
        harvestSyncRef.current = stamp;
        dispatch({ type:"SYNC_HARVEST_TASKS" });
    }, [state.activeUserId, state.plants, state.tasks, booted]);

    // Keep activeUserId in sync with session
    useEffect(() => {
        if (loggedInUid && loggedInUid !== state.activeUserId) {
            dispatch({ type:"SET_ACTIVE_USER", payload: loggedInUid });
        }
    }, [loggedInUid]);

    const handleLogin = async (uid) => {
        setLoggedInUid(uid);
        await setSession(uid);
        setScreen("dashboard");
    };

    const handleLogout = async () => {
        await setSession(null);
        setLoggedInUid(null);
        dispatch({ type:"SET_ACTIVE_USER", payload: null });
        setScreen("dashboard");
    };

    const navigate = useCallback(s => setScreen(s), []);
    const uid = loggedInUid;
    const activeUser = state.users.find(u => u.id === uid);
    const lang = activeUser?.settings?.lang || "nl";
    const pendingTasks = forUser(state.tasks, uid||"").filter(t => t.status==="pending").length;
    const props = { state, dispatch, navigate, lang };

    if (!booted) {
        return (
            <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#F5F0E8", color:T.text, fontFamily:"DM Sans, sans-serif" }}>
                        Loading MyGarden...
            </div>
        );
    }

    // Not logged in → show login screen
    if (!loggedInUid || !activeUser) {
        return <LoginScreen state={state} dispatch={dispatch} onLogin={handleLogin}/>;
    }

    const STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;0,9..144,800;0,9..144,900;1,9..144,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
    *, *::before, *::after { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    body { font-family: 'DM Sans', system-ui, sans-serif; background: #F5F0E8; color: #1A1916; }
    input, select, textarea, button { font-family: 'DM Sans', system-ui, sans-serif; }
    * { -webkit-font-smoothing: antialiased; }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: #EDE8DF; }
    ::-webkit-scrollbar-thumb { background: #C8C0B4; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: #B0A89C; }
  `;

    return (
        <>
            <style>{STYLES}</style>
            <div style={{ display:"flex", minHeight:"100vh", background:"#F5F0E8" }}>
                <Sidebar screen={screen} setScreen={setScreen} pendingTasks={pendingTasks} collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} state={state} dispatch={dispatch} lang={lang} onLogout={handleLogout}/>
                <main style={{ flex:1, minHeight:"100vh", overflow:"auto" }}>
                    {screen==="dashboard"   && <DashboardScreen   {...props}/>}
                    {screen==="gardens"     && <GardensScreen     {...props}/>}
                    {screen==="editor"      && <EditorScreen      {...props}/>}
                    {screen==="fields"      && <FieldsScreen      {...props}/>}
                    {screen==="plants"      && <PlantsScreen      {...props}/>}
                    {screen==="tasks"       && <TasksScreen       {...props}/>}
                    {screen==="greenhouses" && <GreenhouseScreen  {...props}/>}
                    {screen==="account"     && <AccountScreen     {...props} onLogout={handleLogout}/>}
                    {screen==="settings"    && <SettingsScreen    {...props}/>}
                    {screen==="dev"         && <DevScreen         {...props}/>}
                </main>
            </div>
        </>
    );
}
