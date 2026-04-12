import { useMemo, useRef, useState } from "react";
import { PageShell, PageHeader, MetaBadge } from "../layout/PageChrome.jsx";
import { Btn } from "../ui/Btn.jsx";
import { Badge } from "../ui/Badge.jsx";
import { ListRow } from "../ui/ListRow.jsx";
import { Input } from "../ui/Input.jsx";
import { Sel } from "../ui/Sel.jsx";
import { Textarea } from "../ui/Textarea.jsx";
import { Modal } from "../ui/Modal.jsx";
import { EmptyState } from "../ui/EmptyState.jsx";
import { Card } from "../ui/Card.jsx";
import { FormRow } from "../ui/FormRow.jsx";
import { InfoBanner } from "../ui/InfoBanner.jsx";
import { PillFilter } from "../ui/PillFilter.jsx";
import { BedShapePicker } from "../ui/BedShapePicker.jsx";
import { T } from "../theme.js";
import { LANG } from "../i18n.js";
import { PLANT_LIB } from "../plantLibrary.js";
import { CATEGORIES, CAT_ICONS, PLANT_STATUSES, STATUS_K, STATUS_CFG, GH_TYPES, STRUCT_STROKE, STRUCT_FILL, TASK_STATUS_K } from "../constants.js";
import { fmtDate, forUser, gid, slotDisplayLabel, childSlotsFor } from "../helpers.js";
import { normalizeSearchText } from "../utils/text.js";

const useT = (lang) => (key) => LANG[lang]?.[key] ?? LANG.en[key] ?? key;
export default function PlantsScreen({ state, dispatch, lang, routeParams = {}, navigate }) {
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
    const slotFilterId = routeParams.slot || "";
    const slotFilter = slotFilterId ? slots.find(s => s.id === slotFilterId) : null;
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
        if (slotFilterId && p.slot_id !== slotFilterId) return false;
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
                subtitle={slotFilter ? `${filtered.length}/${plants.length} plants · ${slotDisplayLabel(slotFilter, slots)}` : `${filtered.length}/${plants.length} plants`}
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
                {slotFilter && (
                    <InfoBanner icon="🌱">
                        Filtering plants in {slotDisplayLabel(slotFilter, slots)}.
                        <Btn size="xs" variant="ghost" onClick={() => navigate && navigate("plants")}>Clear filter</Btn>
                    </InfoBanner>
                )}
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
                <EmptyState icon="🌱" title={plants.length===0?t("no_plants"):"No plants match filters"} action={plants.length===0?<Btn onClick={()=>setShow(true)} icon="+" variant="primary">{t("add_plant")}</Btn>:<Btn onClick={()=>{ setFStatus("all"); setFCat("all"); setSearch(""); }}>Clear Filters</Btn>}/>
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
                                        {p.row_count && <span>📏 {p.row_count} rows</span>}
                                        {p.sow_spacing_cm && <span>↔ {p.sow_spacing_cm} cm</span>}
                                        {p.row_plant_count && <span>🌱 {p.row_plant_count} plants</span>}
                                        {p.row_length_m && <span>📐 {p.row_length_m} m</span>}
                                    </div>
                                )}
                                {(p.sow_date||p.plant_date||p.harvest_date) && (
                                    <div style={{ fontSize:11, color:T.textMuted, marginBottom:8, display:"flex", gap:8, flexWrap:"wrap" }}>
                                        {p.sow_date && <span>🌱 {fmtDate(p.sow_date,lang)}</span>}
                                        {p.plant_date && <span>🪴 {fmtDate(p.plant_date,lang)}</span>}
                                        {p.harvest_date && <span>🧺 {fmtDate(p.harvest_date,lang)}</span>}
                                    </div>
                                )}
                                {p.notes && <div style={{ fontSize:12, color:T.textSub, marginBottom:10, lineHeight:1.5, borderLeft:`2px solid ${T.border}`, paddingLeft:8 }}>{p.notes}</div>}
                                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                                    <Btn size="sm" variant="secondary" onClick={()=>openEdit(p)}>{t("edit")}</Btn>
                                    {(p.status==="growing"||p.status==="harvestable") && <Btn size="sm" variant="accent" onClick={()=>dispatch({type:"UPDATE_PLANT",payload:{...p,status:"harvested"}})}>?>🧺 {t("harvest")}/Btn>}
                                    {p.status==="planned" && <Btn size="sm" variant="success" onClick={()=>dispatch({type:"UPDATE_PLANT",payload:{...p,status:"sown",sow_date:p.sow_date||new Date().toISOString().slice(0,10)}})}>{t("mark_sown")}</Btn>}
                                    <Btn size="sm" variant="ghost" onClick={()=>{ if(window.confirm(t("delete_plant"))) dispatch({type:"DELETE_PLANT",payload:p.id}); }}>?</Btn>
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
            {showQuick && (
                <QuickAddPlantModal
                    onClose={() => setShowQuick(false)}
                    gardens={gardens}
                    fields={fields}
                    structures={structures}
                    lang={lang}
                    dispatch={dispatch}
                    uid={state.activeUserId}
                />
            )}
            {bulkPrompt && (
                <Modal title="📋 Save as row plan?" onClose={()=>setBulkPrompt(null)} width={520}>
                    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                        <InfoBanner icon="🌱">
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
const isMaintenanceTask = (task) => String(task.id || "").startsWith("maint_") || (task.linked_type === "struct" && ["pruning","repair","cleaning"].includes(task.type));

// ----
// SCREEN: TASKS
// ----
