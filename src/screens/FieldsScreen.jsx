import { useState } from "react";
import { PageShell, PageHeader, SectionPanel, PanelGroup, MetaBadge } from "../layout/PageChrome.jsx";
import { Btn } from "../ui/Btn.jsx";
import { Badge } from "../ui/Badge.jsx";
import { Card } from "../ui/Card.jsx";
import { EmptyState } from "../ui/EmptyState.jsx";
import { ListRow } from "../ui/ListRow.jsx";
import { Input } from "../ui/Input.jsx";
import { Sel } from "../ui/Sel.jsx";
import { Textarea } from "../ui/Textarea.jsx";
import { Modal } from "../ui/Modal.jsx";
import { FormRow } from "../ui/FormRow.jsx";
import { FormActions } from "../ui/FormActions.jsx";
import { PillFilter } from "../ui/PillFilter.jsx";
import { T } from "../theme.js";
import { LANG, useT } from "../translations.js";
import { FIELD_TYPES, FIELD_LABEL_K, FIELD_COLORS, STRUCT_TYPES, STRUCT_LABEL_K, STRUCT_ICONS, GARDEN_TYPES, GH_TYPES } from "../constants.js";
import { forUser, gid, fmtDate, slotDisplayLabel, childSlotsFor, findFieldAtPoint, polygonArea, polygonPointsString, pointInPolygon, polygonCentroid, isInsideGH } from "../helpers.js";
import { normalizeSearchText } from "../utils/text.js";
import { GARDEN_TYPE_LABEL_K, MAINTENANCE_STRUCT_TYPES } from "../gardenMeta.js";

// SCREEN: BEDS & FIELDSexport default function FieldsScreen({ state, dispatch, navigate, lang }) {
    const t = useT(lang);
    const uid = state.activeUserId;
    const gardens = forUser(state.gardens, uid);
    const allPlants = forUser(state.plants, uid);
    const structures = forUser(state.structures, uid);
    const tasks = forUser(state.tasks, uid);
    const allSlots = forUser(state.slots||[], uid);
    const slots   = allSlots.filter(s => s.parent_type==="field");
    const [filterGarden, setFilterGarden] = useState(state.activeGardenId||"all");
    const [show, setShow] = useState(false);
    const [showSlot, setShowSlot] = useState(false);
    const [slotField, setSlotField] = useState(null);
    const [editSlot, setEditSlot] = useState(null);
    const [editSlotForm, setEditSlotForm] = useState(null);
    const [gardenSel, setGardenSel] = useState(state.activeGardenId||gardens[0]?.id||"");
    const ef = { name:"", type:"raised_bed", shape:"rect", x:"", y:"", width:"", height:"", notes:"" };
    const esl = { name:"", label:"", type:"bed_row", row_count:"1", spacing_cm:"", plant_count:"", row_length_m:"", orientation:"horizontal", notes:"" };
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
        setSlotForm({ name:`${field.name} Row ${count}`, label:`R${count}`, type:"bed_row", row_count:"1", spacing_cm:"", plant_count:"", row_length_m:"", orientation:"horizontal", notes:"" });
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
                orientation: slotForm.type==="bed_row" ? (slotForm.orientation || "horizontal") : undefined,
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
            orientation: slot.orientation || "horizontal",
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
            next.orientation = editSlotForm.orientation || "horizontal";
        }
        dispatch({ type:"UPDATE_SLOT", payload: next });
        setEditSlot(null);
        setEditSlotForm(null);
    };
    return (
        <PageShell width={1120}>
            <PageHeader
                title={`🌱? ${t("nav_fields")}`}
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
                    <Btn size="sm" variant="secondary" icon="🌱" onClick={()=>navigate("editor")} title="Open editor">Editor</Btn>
                    <Btn size="sm" variant="secondary" onClick={()=>navigate("gardens")} title="Go to gardens">Gardens</Btn>
                </div>
            </div>

            {display.length===0 ? (
                <SectionPanel title={`🌱? ${t("nav_fields")}`} subtitle={t("no_beds")} action={<Btn size="sm" variant="primary" onClick={()=>setShow(true)}>{t("add_bed")}</Btn>}>
                    <EmptyState icon="🌱" title={t("no_beds")} subtitle="Add beds or fields to start planning." />
                </SectionPanel>
            ) : (
                <SectionPanel title="Bed overzicht" subtitle="Compacte status per bed" style={{ padding:0 }}>
                    <div style={{ display:"flex", flexDirection:"column", gap:12, padding:18 }}>
                        {display.map(f => {
                            const fp = allPlants.filter(p=>p.field_id===f.id);
                            const fs = slots.filter(s=>s.parent_id===f.id);
                            const fc = FIELD_COLORS[f.type] || T.primary;
                            const slotCount = fs.length;
                            const plantCount = fp.reduce((sum,p)=>sum + Math.max(1, +p.quantity || 1), 0);
                            const typeLabel = LANG[lang]?.[FIELD_LABEL_K[f.type]] || f.type;
                            const nextTask = tasks.filter(t => t.field_id === f.id && t.status !== "done" && t.due_date)
                                .sort((a, b) => (a.due_date||"").localeCompare(b.due_date||""))[0];
    const nextLabel = nextTask ? `${t("dashboard_next_prefix")}: ${fmtDate(nextTask.due_date, lang)} · ${nextTask.title}` : t("dashboard_no_upcoming_tasks");
                            return (
                                <ListRow
                                    key={f.id}
                                    icon="🌱"
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
                                        <Btn key="del" size="xs" variant="ghost" onClick={()=>{ if(window.confirm(t("delete_bed"))) dispatch({type:"DELETE_FIELD",payload:f.id}); }}>?</Btn>,
                                    ]}
                                />
                            );
                        })}
                    </div>
                </SectionPanel>
            )}

            {show && (
                <Modal title={`🌱? ${t("add_bed")}`} onClose={()=>setShow(false)}>
                    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                        {gardens.length>1 && <Sel label={t("gardens")} value={gardenSel} onChange={setGardenSel} options={gardens.map(g=>({value:g.id,label:g.name}))} required/>}
                        <Input label={t("name")} value={form.name} onChange={set("name")} placeholder="e.g. Tomato Raised Bed" required/>
                        <Sel label={t("type")} value={form.type} onChange={set("type")} options={FIELD_TYPES.map(ft=>({value:ft,label:LANG[lang]?.[FIELD_LABEL_K[ft]]||ft}))}/>
                        <BedShapePicker value={form.shape||"rect"} onChange={set("shape")}/>
                        {garden && <InfoBanner icon="🌱">Garden is {garden.width}m × {garden.height}m. Position from top-left (0, 0).</InfoBanner>}
                        <FormRow><Input label="X (m)" value={form.x} onChange={set("x")} type="number" step="0.1" min="0" required/><Input label="Y (m)" value={form.y} onChange={set("y")} type="number" step="0.1" min="0" required/><Input label={`${t("width")} (m)`} value={form.width} onChange={set("width")} type="number" step="0.1" min="0.1" required/><Input label={`${t("height")} (m)`} value={form.height} onChange={set("height")} type="number" step="0.1" min="0.1" required/></FormRow>
                        <Textarea label={t("notes")} value={form.notes} onChange={set("notes")} rows={2}/>
                        <FormActions onCancel={()=>{ setShow(false); setForm(ef); }} onSave={create} saveLabel={t("add_bed")} t={t}/>
                    </div>
                </Modal>
            )}
            {showSlot && slotField && (
                <Modal title={`🌱 Add Row In ${slotField.name}`} onClose={()=>{ setShowSlot(false); setSlotField(null); setSlotForm(esl); }}>
                    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                        <InfoBanner icon="🌱">Rows are internal locations inside a bed. Existing plants without a row stay valid.</InfoBanner>
                        <FormRow cols={2}>
                            <Input label="Name" value={slotForm.name} onChange={setSlot("name")} placeholder="e.g. North Row" required/>
                            <Input label="Label" value={slotForm.label} onChange={setSlot("label")} placeholder="R1" required/>
                        </FormRow>
                        <Sel label="Type" value={slotForm.type} onChange={setSlot("type")} options={[{ value:"bed_row", label:"Row" }, { value:"bed_section", label:"Section" }]}/>
                        {(slotForm.type==="bed_row") && (
                            <FormRow cols={4}>
                                <Input label="Rows" value={slotForm.row_count} onChange={setSlot("row_count")} type="number" min="1" max="24" placeholder="4"/>
                                <Input label="Spacing (cm)" value={slotForm.spacing_cm} onChange={setSlot("spacing_cm")} type="number" min="1" max="200" placeholder="13"/>
                                <Input label="Plants" value={slotForm.plant_count} onChange={setSlot("plant_count")} type="number" min="1" max="1000" placeholder="80"/>
                                <Sel label="Orientation" value={slotForm.orientation || "horizontal"} onChange={setSlot("orientation")} options={[{ value:"horizontal", label:"Horizontal" }, { value:"vertical", label:"Vertical (90°)" }]} />
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
                <Modal title={`🌱 Edit ${editSlot.name}`} onClose={()=>{ setEditSlot(null); setEditSlotForm(null); }}>
                    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                        <InfoBanner icon="🌱">Existing rows can be adjusted here. The preview updates from row count, spacing and plant count.</InfoBanner>
                        <FormRow cols={2}>
                            <Input label="Name" value={editSlotForm.name} onChange={v=>setEditSlotForm(f=>({...f,name:v}))} required/>
                            <Input label="Label" value={editSlotForm.label} onChange={v=>setEditSlotForm(f=>({...f,label:v}))} required/>
                        </FormRow>
                        <Input label="Type" value={slotTypeLabel(editSlot, t)} disabled/>
                        {(editSlot.type === "tunnel_row" || editSlot.type === "bed_row") && (
                            <>
                                <FormRow cols={4}>
                                    <Input label="Rows" value={editSlotForm.row_count} onChange={v=>setEditSlotForm(f=>({...f,row_count:v}))} type="number" min="1" max="24"/>
                                    <Input label="Spacing (cm)" value={editSlotForm.spacing_cm} onChange={v=>setEditSlotForm(f=>({...f,spacing_cm:v}))} type="number" min="1" max="200"/>
                                    <Input label="Plants" value={editSlotForm.plant_count} onChange={v=>setEditSlotForm(f=>({...f,plant_count:v}))} type="number" min="0" max="1000"/>
                                    <Sel label="Orientation" value={editSlotForm.orientation || "horizontal"} onChange={v=>setEditSlotForm(f=>({...f,orientation:v}))} options={[{ value:"horizontal", label:"Horizontal" }, { value:"vertical", label:"Vertical (90°)" }]} />
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
        </PageShell>
    );
}
// ----
// QUICK ADD PLANT MODAL
// ----
function QuickAddPlantModal({ onClose, gardens, fields, structures, lang, dispatch, uid }) {
    const t = useT(lang);
    const [query, setQuery] = useState("");
    const [libEntry, setLibEntry] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [stage, setStage] = useState("jonge_plant");
    const [quantity, setQuantity] = useState("1");
    const [placementType, setPlacementType] = useState("field");
    const [gardenId, setGardenId] = useState(gardens[0]?.id || "");
    const [fieldId, setFieldId] = useState("");
    const [structId, setStructId] = useState("");
    const inputRef = useRef(null);

    const hits = query.length >= 1
        ? PLANT_LIB.filter(p =>
            normalizeSearchText(p.name).includes(normalizeSearchText(query)) ||
            p.varieties.some(v => normalizeSearchText(v).includes(normalizeSearchText(query)))
          ).slice(0, 6)
        : [];

    const selectEntry = (entry) => {
        setLibEntry(entry);
        setQuery(entry.name);
        setShowDropdown(false);
    };

    const harvestDate = useMemo(() => {
        if (!libEntry?.days_to_harvest) return "";
        const days = stage === "zaailing"
            ? libEntry.days_to_harvest
            : stage === "jonge_plant"
            ? Math.round(libEntry.days_to_harvest * 0.6)
            : Math.round(libEntry.days_to_harvest * 0.2);
        const d = new Date();
        d.setDate(d.getDate() + days);
        return d.toISOString().slice(0, 10);
    }, [libEntry, stage]);

    const statusMap = { zaailing:"sown", jonge_plant:"planted", volwassen:"growing" };
    const today = new Date().toISOString().slice(0, 10);

    const save = () => {
        const name = libEntry?.name || query.trim();
        if (!name) return;
        dispatch({
            type: "ADD_PLANT",
            payload: {
                id: gid(),
                user_id: uid,
                name,
                variety: libEntry?.varieties[0] || "",
                category: libEntry?.category || "Vegetable",
                status: statusMap[stage],
                quantity: Math.max(1, parseInt(quantity) || 1),
                garden_id: gardenId || "",
                field_id: placementType === "field" ? fieldId || "" : "",
                struct_id: placementType === "struct" ? structId || "" : "",
                sow_date: stage === "zaailing" ? today : "",
                plant_date: stage !== "zaailing" ? today : "",
                harvest_date: harvestDate,
                notes: "",
            }
        });
        onClose();
    };

    const bedOptions = fields
        .filter(f => f.garden_id === gardenId)
        .map(f => ({ value: f.id, label: f.name }));
    const structOptions = structures
        .filter(s => s.garden_id === gardenId && GH_TYPES.includes(s.type))
        .map(s => ({ value: s.id, label: s.name }));
    const targetLabel = placementType === "struct" ? "Serre" : "Bed";
    const targetOptions = placementType === "struct" ? structOptions : bedOptions;

    const stages = [
        { id:"zaailing",    label:"🌱 Zaailing",     hint:"Net gezaaid" },
        { id:"jonge_plant", label:"🪴 Jonge plant",  hint:"Al een beetje gegroeid" },
        { id:"volwassen",   label:"🌿 Volwassen",    hint:"Bijna oogstbaar" },
    ];

    return (
        <Modal title="🌱 Plant toevoegen" onClose={onClose} width={480}>
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                {/* Search */}
                <div style={{ position:"relative" }}>
                    <label style={{ fontSize:11, fontWeight:700, color:T.textSub, letterSpacing:0.5, textTransform:"uppercase", display:"block", marginBottom:4 }}>Plant</label>
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={e => { setQuery(e.target.value); setLibEntry(null); setShowDropdown(true); }}
                        onFocus={() => query && setShowDropdown(true)}
                        placeholder="Zoek op naam… bijv. Tomaat, Basilicum"
                        autoFocus
                        style={{ width:"100%", fontFamily:"inherit", fontSize:14, color:T.text, background:T.surface, border:`1.5px solid ${T.borderSoft}`, borderRadius:T.radiusMd, padding:"10px 14px", outline:"none", boxSizing:"border-box" }}
                    />
                    {showDropdown && hits.length > 0 && (
                        <div style={{ position:"absolute", top:"100%", left:0, right:0, background:T.surface, border:`1.5px solid ${T.borderSoft}`, borderRadius:T.radiusMd, boxShadow:T.shMd, zIndex:10, overflow:"hidden", marginTop:4 }}>
                            {hits.map(h => (
                                <button key={h.name} onClick={() => selectEntry(h)} style={{ display:"flex", alignItems:"center", gap:10, width:"100%", padding:"10px 14px", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:13, color:T.text, textAlign:"left", borderBottom:`1px solid ${T.borderLight}` }}
                                    onMouseEnter={e => e.currentTarget.style.background = T.surfaceSoft}
                                    onMouseLeave={e => e.currentTarget.style.background = "none"}>
                                    <span style={{ fontSize:18 }}>{CAT_ICONS[plant.category] || "🌿"}</span>
                                    <div>
                                        <div style={{ fontWeight:700 }}>{h.name}</div>
                                        <div style={{ fontSize:11, color:T.textMuted }}>{h.category}{h.varieties.length ? ` · ${h.varieties[0]}` : ""}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Stage */}
                <div>
                    <label style={{ fontSize:11, fontWeight:700, color:T.textSub, letterSpacing:0.5, textTransform:"uppercase", display:"block", marginBottom:8 }}>Groeifase</label>
                    <div style={{ display:"flex", gap:8 }}>
                        {stages.map(s => (
                            <button key={s.id} onClick={() => setStage(s.id)} style={{ flex:1, padding:"10px 8px", borderRadius:T.radiusMd, border:`1.5px solid ${stage===s.id ? T.primary : T.borderSoft}`, background:stage===s.id ? T.primaryBg : T.surface, color:stage===s.id ? T.primary : T.textSub, cursor:"pointer", fontFamily:"inherit", fontSize:12, fontWeight:700, transition:`all ${T.transitionFast}`, outline:"none", textAlign:"center" }}>
                                <div>{s.label}</div>
                                <div style={{ fontWeight:400, fontSize:10, marginTop:2, opacity:0.8 }}>{s.hint}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Harvest preview */}
                {harvestDate && (
                    <InfoBanner icon="🌱">
                        Geschatte oogst: <strong>{new Date(harvestDate + "T00:00:00").toLocaleDateString(lang === "nl" ? "nl-BE" : "en-GB", { day:"numeric", month:"long", year:"numeric" })}</strong>
                    </InfoBanner>
                )}

                {/* Quantity */}
                <Input label="Aantal" value={quantity} onChange={setQuantity} type="number" min="1" max="999" />

                <div style={{ display:"flex", flexDirection:"column", gap:10, background:T.surfaceSoft, borderRadius:T.radiusMd, padding:"12px 14px", border:`1px solid ${T.borderMuted}` }}>
                    <div style={{ fontSize:11, fontWeight:700, color:T.textSub, letterSpacing:0.5, textTransform:"uppercase" }}>Locatie</div>
                    <Sel
                        label="Tuin"
                        value={gardenId}
                        onChange={v => { setGardenId(v); setFieldId(""); setStructId(""); }}
                        options={gardens.map(g => ({ value:g.id, label:g.name }))}
                    />
                    <Sel
                        label="Koppelen aan"
                        value={placementType}
                        onChange={v => { setPlacementType(v); setFieldId(""); setStructId(""); }}
                        options={[
                            { value:"field", label:"Bed" },
                            { value:"struct", label:"Serre" },
                        ]}
                    />
                    {targetOptions.length > 0 ? (
                        <Sel
                            label={targetLabel}
                            value={placementType === "struct" ? structId : fieldId}
                            onChange={placementType === "struct" ? setStructId : setFieldId}
                            options={[{ value:"", label:`- Kies een ${targetLabel.toLowerCase()} -` }, ...targetOptions]}
                        />
                    ) : (
                        <InfoBanner icon="🌱">
                            Er is geen {targetLabel.toLowerCase()} gevonden in deze tuin.
                        </InfoBanner>
                    )}
                </div>
                <FormActions onCancel={onClose} onSave={save} saveLabel="Toevoegen ?" t={t} />
            </div>
        </Modal>
    );
}

// ----

