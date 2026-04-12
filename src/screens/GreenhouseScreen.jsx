import { useEffect, useState } from "react";
import { PageShell, PageHeader, PanelGroup, MetaBadge, SectionPanel } from "../layout/PageChrome.jsx";
import { Btn } from "../ui/Btn.jsx";
import { Badge } from "../ui/Badge.jsx";
import { Card } from "../ui/Card.jsx";
import { EmptyState } from "../ui/EmptyState.jsx";
import { StatCard } from "../ui/StatCard.jsx";
import { FormRow } from "../ui/FormRow.jsx";
import { Input } from "../ui/Input.jsx";
import { Sel } from "../ui/Sel.jsx";
import { Textarea } from "../ui/Textarea.jsx";
import { Modal } from "../ui/Modal.jsx";
import { InfoBanner } from "../ui/InfoBanner.jsx";
import { T } from "../theme.js";
import { LANG } from "../i18n.js";
import { forUser, gid, fmtDate, isInsideGH, slotTypeLabel } from "../helpers.js";
import { GH_TYPES, STRUCT_FILL, STRUCT_LABEL_K, STRUCT_STROKE } from "../constants.js";
import { renderSlotSeedPlan } from "../slotSeedPlanView.jsx";

const useT = (lang) => (key) => LANG[lang]?.[key] ?? LANG.en[key] ?? key;
// SCREEN: GREENHOUSES
// ----
export default function GreenhouseScreen({ state, dispatch, navigate, lang }) {
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
    const [slotForm, setSlotForm] = useState({ name:"", label:"", type:"greenhouse_pot", rows:"4", cols:"6", row_count:"", spacing_cm:"", plant_count:"", row_length_m:"", orientation:"horizontal", notes:"" });
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
            orientation: slot.orientation || "horizontal",
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
            next.orientation = editSlotForm.orientation || "horizontal";
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
            orientation:"horizontal",
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
            extra.orientation = slotForm.orientation || "horizontal";
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
        setSlotForm({ name:"", label:"", type:"greenhouse_pot", rows:"4", cols:"6", row_count:"", spacing_cm:"", plant_count:"", row_length_m:"", orientation:"horizontal", notes:"" });
    };
    return (
        <PageShell width={1040}>
            <PageHeader
                title={`🌱 ${t("greenhouses")}`}
                subtitle={`${structures.length} structures across ${gardens.length} gardens`}
                meta={[
                    <MetaBadge key="gardens" value={gardens.length} label={t("gardens")} />,
                    <MetaBadge key="structures" value={structures.length} label={t("greenhouses")} />
                ]}
                actions={[<Btn key="editor" variant="secondary" onClick={()=>navigate("editor")}>{t("nav_editor")}</Btn>]}
            />
            <PanelGroup>
                <StatCard icon="🌱" label="Structures" value={structures.length} color={T.primary} sub={`${gardens.length} gardens`} />
                <StatCard icon="🌱" label="Slots" value={totalSlots} color="#558B2F" sub="Trays / Rows / Pots" />
                <StatCard icon="🌱" label="GH Plants" value={greenhousePlantsCount} color="#388E3C" sub="Inside structures" />
                <StatCard icon="🌱" label="Ventilated" value={`${ventilatedCount}/${structures.length}`} color={ventilatedCount===structures.length?T.success:T.warning} sub="vents open" />
            </PanelGroup>
            {structures.length===0 ? (
                <SectionPanel title={t("greenhouses")} subtitle={t("no_greenhouses")} action={<Btn size="sm" variant="primary" onClick={()=>navigate("editor")}>{t("nav_editor")}</Btn>}>
                    <EmptyState icon="🌱" title={t("no_greenhouses")} subtitle={t("no_gh_sub")} />
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
                                                {linkedField && <Badge color={T.accent} bg={T.accentBg}>{linkedField.name}</Badge>}
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
                                            <span style={{ fontSize:18 }}>🌡️</span>
                                            <div>
                                                <div style={{ fontSize:10, fontWeight:700, color:T.textMuted, textTransform:"uppercase", letterSpacing:0.5 }}>{t("inside_beds")}</div>
                                                <div style={{ fontSize:14, fontWeight:700, color:T.primary }}>{insideBeds.length}</div>
                                            </div>
                                        </div>
                                        <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 14px", background:T.surfaceAlt, borderRadius:T.rs }}>
                                            <span style={{ fontSize:18 }}>💧</span>
                                            <div>
                                                <div style={{ fontSize:10, fontWeight:700, color:T.textMuted, textTransform:"uppercase", letterSpacing:0.5 }}>Pots / Trays / Rows</div>
                                            <div style={{ fontSize:14, fontWeight:700, color:T.primary }}>{structDirectSlots.length}</div>
                                        </div>
                                    </div>
                                </div>
                                    {structDirectSlots.length>0 && (
                                        <div style={{ marginBottom:12 }}>
                                            <div style={{ fontSize:12, fontWeight:700, color:T.textSub, marginBottom:8, textTransform:"uppercase", letterSpacing:0.5 }}>?? Pots, Trays & Rows</div>
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
                                                                    <div style={{ fontSize:11, color:T.textMuted }}>{slotTypeLabel(slot, t)}{isTray && slot.rows && slot.cols ? ` · ${slot.rows} x ${slot.cols}` : ""}{(slot.type==="tunnel_row"||slot.type==="bed_row") && slot.spacing_cm ? ` · ${slot.spacing_cm}cm spacing` : ""}{(slot.type==="tunnel_row"||slot.type==="bed_row") && slot.plant_count ? ` · ${slot.plant_count} plants` : ""}</div>
                                                                    <div style={{ fontSize:11, color:T.textSub, marginTop:2 }}>{slotPlantQty} plant{slotPlantQty!==1?"s":""}</div>
                                                                </div>
                                                                <div style={{ display:"flex", gap:6, flexWrap:"wrap", justifyContent:"flex-end" }}>
                                                                    {(slot.type==="tunnel_row" || slot.type==="bed_row") && (
                                                                        <Btn
                                                                            size="sm"
                                                                            variant="secondary"
                                                                            onClick={() => dispatch({ type:"UPDATE_SLOT", payload:{ ...slot, orientation: slot.orientation === "vertical" ? "horizontal" : "vertical" } })}
                                                                        >
                                                                            Rotate 90?
                                                                        </Btn>
                                                                    )}
                                                                    <Btn size="sm" variant="ghost" onClick={()=>openEditSlot(slot)}>Edit</Btn>
                                                                </div>
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
                                                                    {slotPlants.map(p => <Badge key={p.id} color={STATUS_CFG[p.status]?.color||T.textSub} bg={STATUS_CFG[p.status]?.bg||T.surfaceAlt}>{CAT_ICONS[p.category]||"🌿"} {p.name} · ×{Math.max(1, +p.quantity || 1)}</Badge>)}
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
                                            <div style={{ fontSize:12, fontWeight:700, color:T.textSub, marginBottom:8, textTransform:"uppercase", letterSpacing:0.5 }}>??? {t("inside_beds")}</div>
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
                                            <div style={{ fontSize:12, fontWeight:700, color:T.textSub, marginBottom:8, textTransform:"uppercase", letterSpacing:0.5 }}>?? {t("inside_plants")} ({greenhousePlantQty})</div>
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
                                        <Btn size="sm" variant="secondary" onClick={()=>openSlotModal(st)}>➕ Add {isTunnel ? "Row" : "Pot / Tray / Row"}</Btn>
                                        <Btn size="sm" variant="primary" onClick={()=>{ dispatch({type:"SET_ACTIVE_GARDEN",payload:st.garden_id}); navigate("editor"); }}>?? {t("nav_editor")}</Btn>
                                        <Btn size="sm" variant={st.ventilated?"ghost":"success"} onClick={()=>toggleVent(st)}>
                                            {st.ventilated ? `?? ${t("close_vents")}` : `??? ${t("ventilate")}`}
                                        </Btn>
                                        <Btn size="sm" variant="secondary" onClick={()=>setEditGh(st)}>📊 Log Climate</Btn>
                                        <Btn size="sm" variant="danger" onClick={()=>{ if(window.confirm(t("delete_struct"))) dispatch({type:"DELETE_STRUCT",payload:st.id}); }}>? {t("delete")}</Btn>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
            {showSlot && slotStruct && (
            <Modal title={`🌱 Add ${slotStruct.type==="tunnel_greenhouse" ? "Row" : "Pot"} In ${slotStruct.name}`} onClose={()=>{ setShowSlot(false); setSlotStruct(null); setSlotForm({ name:"", label:"", type:"greenhouse_pot", rows:"4", cols:"6", row_count:"", spacing_cm:"", plant_count:"", row_length_m:"", orientation:"horizontal", notes:"" }); }}>
                    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                        <InfoBanner icon="🌱">
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
                                <FormRow cols={4}>
                                    <Input label="Rows" value={slotForm.row_count} onChange={v=>setSlotForm(f=>({...f,row_count:v}))} type="number" min="1" max="24" placeholder="4"/>
                                    <Input label="Spacing (cm)" value={slotForm.spacing_cm} onChange={v=>setSlotForm(f=>({...f,spacing_cm:v}))} type="number" min="1" max="200" placeholder="35"/>
                                    <Input label="Plants" value={slotForm.plant_count} onChange={v=>setSlotForm(f=>({...f,plant_count:v}))} type="number" min="1" max="1000" placeholder="24"/>
                                    <Sel label="Orientation" value={slotForm.orientation || "horizontal"} onChange={v=>setSlotForm(f=>({...f,orientation:v}))} options={[{ value:"horizontal", label:"Horizontal" }, { value:"vertical", label:"Vertical (90°)" }]} />
                                </FormRow>
                                <Input label="Row length (m)" value={slotForm.row_length_m} onChange={v=>setSlotForm(f=>({...f,row_length_m:v}))} type="number" min="0.1" max="100" placeholder="8.4"/>
                            </>
                        )}
                        <Textarea label={t("notes")} value={slotForm.notes} onChange={v=>setSlotForm(f=>({...f,notes:v}))} rows={2}/>
                        <FormActions onCancel={()=>{ setShowSlot(false); setSlotStruct(null); setSlotForm({ name:"", label:"", type:"greenhouse_pot", rows:"4", cols:"6", row_count:"", spacing_cm:"", plant_count:"", row_length_m:"", orientation:"horizontal", notes:"" }); }} onSave={createSlot} saveLabel="Add Pot" t={t}/>
                    </div>
                </Modal>
            )}
            {editSlot && editSlotForm && (
                <Modal title={`🌱 Edit ${editSlot.name}`} onClose={()=>{ setEditSlot(null); setEditSlotForm(null); }}>
                    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                        <InfoBanner icon="🌱">This edits an existing slot. Row count and spacing control the scale preview only for row-based slots.</InfoBanner>
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
                    </div>
                </Modal>
            )}
            {editGh && (
                <Modal title={`🌱? Climate Log — ${editGh.name}`} onClose={()=>setEditGh(null)} width={400}>
                    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                        <Input label={`??? ${t("temp")} (e.g. 22°C)`} value={tempVal} onChange={setTempVal} placeholder="22°C"/>
                        <Input label={`?? ${t("humidity")} (0-100%)`} value={humVal} onChange={setHumVal} type="number" min="0" max="100" placeholder="65"/>
                        <FormActions onCancel={()=>setEditGh(null)} onSave={saveGhMeta} saveLabel={t("save")} t={t}/>
                    </div>
                </Modal>
            )}
        </PageShell>
    );
}

// ----
// SCREEN: SETTINGS
