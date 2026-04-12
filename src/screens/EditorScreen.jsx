import { useEffect, useState } from "react";
import { PageShell, PageHeader, SectionPanel, PanelGroup, MetaBadge } from "../layout/PageChrome.jsx";
import { Btn } from "../ui/Btn.jsx";
import { Badge } from "../ui/Badge.jsx";
import { Card } from "../ui/Card.jsx";
import { EmptyState } from "../ui/EmptyState.jsx";
import { FormRow } from "../ui/FormRow.jsx";
import { FormActions } from "../ui/FormActions.jsx";
import { InfoBanner } from "../ui/InfoBanner.jsx";
import { Input } from "../ui/Input.jsx";
import { Modal } from "../ui/Modal.jsx";
import { Sel } from "../ui/Sel.jsx";
import { Textarea } from "../ui/Textarea.jsx";
import { BedShapePicker } from "../ui/BedShapePicker.jsx";
import { T } from "../theme.js";
import { LANG, useT } from "../translations.js";
import { GARDEN_TYPES, FIELD_TYPES, FIELD_LABEL_K, FIELD_COLORS, STRUCT_TYPES, STRUCT_LABEL_K, STRUCT_ICONS, ZONE_TYPES, ZONE_LABEL_K, ZONE_ICONS, ZONE_FILL, ZONE_STROKE, GH_TYPES } from "../constants.js";
import { forUser, gid, fmtDate, slotDisplayLabel, childSlotsFor, findFieldAtPoint, polygonArea, polygonPointsString, pointInPolygon, polygonCentroid, isInsideGH } from "../helpers.js";
import { normalizeSearchText } from "../utils/text.js";
import { GARDEN_TYPE_LABEL_K, MAINTENANCE_STRUCT_TYPES } from "../gardenMeta.js";

// SCREEN: GARDEN EDITOR
export default function EditorScreen({ state, dispatch, navigate, lang, GardenEditor }) {
    const t = useT(lang);
    const garden = state.gardens.find(g=>g.id===state.activeGardenId);
    const [showField, setShowField] = useState(false);
    const [showStruct, setShowStruct] = useState(false);
    const ef = { name:"", type:"raised_bed", shape:"rect", x:"", y:"", width:"", height:"", notes:"" };
    const es = { name:"", type:"greenhouse", x:"", y:"", width:"", height:"", notes:"", linked_field_id:"", species:"", info:"", maintenance_notes:"", prune_interval_weeks:"", next_prune_date:"" };
    const [ff, setFf] = useState(ef); const [sf, setSf] = useState(es);
    const setF = k=>v=>setFf(f=>({...f,[k]:v}));
    const setS = k=>v=>setSf(f=>({...f,[k]:v}));
    if (!garden) {
        return (
            <PageShell width={980}>
                <EmptyState
                    icon="???"
                    title={t("editor_no_garden_title")}
                    subtitle={t("editor_no_garden_subtitle")}
                    action={<Btn onClick={()=>navigate("gardens")} variant="primary">{t("editor_no_garden_action")}</Btn>}
                />
            </PageShell>
        );
    }
    const gFields   = state.fields.filter(f=>f.garden_id===garden.id);
    const gStructs  = state.structures.filter(s=>s.garden_id===garden.id);
    const gZones    = state.zones.filter(z=>z.garden_id===garden.id);
    const gPlants   = state.plants.filter(p=>p.garden_id===garden.id);
    const gSlots    = (state.slots||[]).filter(s => s.garden_id===garden.id);
    const linkedPlants = gPlants.filter(p => p.field_id || p.struct_id || p.slot_id).length;
    const unassignedPlants = Math.max(0, gPlants.length - linkedPlants);
    const gardenArea = (garden.width * garden.height).toFixed(1);
    const gardenTypeLabel = LANG[lang]?.[GARDEN_TYPE_LABEL_K[garden.type]] || garden.type;
    const posHint = `${t("editor_position_hint")} ${garden.width}m × ${garden.height}m.`;
    const [gardenForm, setGardenForm] = useState({
        name: garden.name || "",
        type: garden.type || "mixed",
        width: String(garden.width ?? ""),
        height: String(garden.height ?? ""),
        notes: garden.notes || "",
    });
    useEffect(() => {
        setGardenForm({
            name: garden.name || "",
            type: garden.type || "mixed",
            width: String(garden.width ?? ""),
            height: String(garden.height ?? ""),
            notes: garden.notes || "",
        });
    }, [garden.id, garden.name, garden.type, garden.width, garden.height, garden.notes]);
    const summaryCards = [
        { label:t("editor_stats_beds"), value:gFields.length, helper:t("nav_fields") },
        { label:t("editor_stats_structures"), value:gStructs.length, helper:t("nav_greenhouses") },
        { label:t("editor_stats_zones"), value:gZones.length, helper:t("editor_stats_zones") },
        { label:t("editor_stats_plants"), value:gPlants.length, helper:t("nav_plants") },
        { label:t("editor_stats_slots"), value:gSlots.length, helper:t("editor_stats_slots") },
        { label:t("editor_stats_unassigned"), value:unassignedPlants, helper:t("editor_stats_plants") },
    ];
    const saveGarden = () => {
        const nextWidth = Math.max(1, +gardenForm.width || garden.width);
        const nextHeight = Math.max(1, +gardenForm.height || garden.height);
        dispatch({
            type:"UPDATE_GARDEN",
            payload:{
                ...garden,
                name: gardenForm.name.trim() || garden.name,
                type: gardenForm.type || garden.type,
                width: nextWidth,
                height: nextHeight,
                notes: gardenForm.notes || "",
            }
        });
    };
    const quickActions = [
        { icon:"???", label:t("add_bed"), helper:t("editor_add_bed_hint"), onClick:()=>setShowField(true) },
        { icon:"??", label:t("add_structure"), helper:t("editor_add_structure_hint"), onClick:()=>setShowStruct(true) },
        { icon:"??", label:t("editor_open_beds"), helper:t("editor_bed_overview_sub"), onClick:()=>navigate("fields") },
        { icon:"??", label:t("editor_open_plants"), helper:t("editor_position_hint"), onClick:()=>navigate("plants") },
    ];
    const addField  = () => { if (!ff.name||!ff.x||!ff.y||!ff.width||!ff.height) return; dispatch({type:"ADD_FIELD",payload:{id:gid(),garden_id:garden.id,...ff,x:+ff.x,y:+ff.y,width:+ff.width,height:+ff.height}}); setShowField(false); setFf(ef); };
    const addStruct = () => {
        if (!sf.name||!sf.x||!sf.y||!sf.width||!sf.height) return;
        const payload = {
            id:gid(),
            garden_id:garden.id,
            ...sf,
            x:+sf.x,
            y:+sf.y,
            width:+sf.width,
            height:+sf.height,
            ventilated:false,
            temperature:"",
            humidity:"",
            linked_field_id:sf.linked_field_id||"",
        };
        if (MAINTENANCE_STRUCT_TYPES.has(sf.type)) {
            payload.species = sf.species || "";
            payload.info = sf.info || "";
            payload.maintenance_notes = sf.maintenance_notes || "";
            payload.prune_interval_weeks = Math.max(0, +sf.prune_interval_weeks || 0);
            payload.next_prune_date = sf.next_prune_date || "";
        }
        dispatch({type:"ADD_STRUCT",payload});
        setShowStruct(false);
        setSf(es);
    };
    return (
        <PageShell width={1460}>
            <PageHeader
                title={garden.name}
                subtitle={`${gardenTypeLabel} · ${garden.width}m × ${garden.height}m · ${gFields.length} ${t("editor_stats_beds").toLowerCase()} · ${gStructs.length} ${t("editor_stats_structures").toLowerCase()}`}
                meta={[
                    <MetaBadge key="size" value={`${garden.width}×${garden.height}m`} label={t("editor_stats_area")} />,
                    <MetaBadge key="beds" value={gFields.length} label={t("editor_stats_beds")} />,
                    <MetaBadge key="structures" value={gStructs.length} label={t("editor_stats_structures")} />,
                    <MetaBadge key="plants" value={gPlants.length} label={t("editor_stats_plants")} />,
                ]}
                actions={[
                    <Btn key="gardens" size="sm" variant="ghost" onClick={()=>navigate("gardens")} icon="??">{t("editor_open_gardens")}</Btn>,
                    <Btn key="struct" size="sm" variant="secondary" onClick={()=>setShowStruct(true)} icon="??">{t("add_structure")}</Btn>,
                    <Btn key="bed" size="sm" variant="primary" onClick={()=>setShowField(true)} icon="???">{t("add_bed")}</Btn>
                ]}
            />
            <PanelGroup cols="repeat(auto-fit,minmax(250px,1fr))">
                <SectionPanel title={t("editor_summary_title")} subtitle={t("editor_summary_subtitle")} style={{ minHeight:"100%" }}>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(2,minmax(0,1fr))", gap:10 }}>
                        {summaryCards.map(card => (
                            <div key={card.label} style={{ padding:"12px 12px 11px", border:`1px solid ${T.borderSoft}`, borderRadius:18, background:`linear-gradient(180deg, ${T.surfaceSoft} 0%, ${T.surface} 100%)`, boxShadow:"0 8px 18px rgba(20,18,14,0.05)" }}>
                                <div style={{ fontSize:11, fontWeight:800, color:T.textMuted, textTransform:"uppercase", letterSpacing:0.6 }}>{card.label}</div>
                                <div style={{ marginTop:6, fontSize:24, fontWeight:900, fontFamily:"Fraunces, serif", color:T.text }}>{card.value}</div>
                                <div style={{ marginTop:4, fontSize:11, color:T.textSub }}>{card.helper}</div>
                            </div>
                        ))}
                    </div>
                </SectionPanel>
                <SectionPanel title={t("editor_quick_actions")} subtitle={t("editor_quick_actions_subtitle")} style={{ minHeight:"100%" }}>
                    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                        {quickActions.map(action => (
                            <QuickAction key={action.label} icon={action.icon} label={action.label} helper={action.helper} onClick={action.onClick} style={{ width:"100%" }} />
                        ))}
                    </div>
                </SectionPanel>
                <SectionPanel title={t("editor_garden_label")} subtitle={t("editor_position_hint")} style={{ minHeight:"100%" }}>
                    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                            <Badge color={T.primary} bg={T.primaryBg}>{gardenTypeLabel}</Badge>
                            <Badge color={T.textSub} bg={T.surfaceAlt}>{garden.width}m × {garden.height}m</Badge>
                            <Badge color={T.textSub} bg={T.surfaceAlt}>{gardenArea}m²</Badge>
                        </div>
                        <div style={{ display:"grid", gap:10, padding:12, border:`1px solid ${T.borderSoft}`, borderRadius:18, background:T.surfaceSoft }}>
                            <div style={{ fontSize:11, fontWeight:800, color:T.textMuted, textTransform:"uppercase", letterSpacing:0.6 }}>{t("garden_settings")}</div>
                            <Input label={t("name")} value={gardenForm.name} onChange={v=>setGardenForm(f=>({...f, name:v}))} />
                            <Sel
                                label={t("type")}
                                value={gardenForm.type}
                                onChange={v=>setGardenForm(f=>({...f, type:v}))}
                                options={GARDEN_TYPES.map(gt => ({ value:gt, label: LANG[lang]?.[GARDEN_TYPE_LABEL_K[gt]] || gt }))}
                            />
                            <FormRow cols={2}>
                                <Input label={`${t("width")} (m)`} value={gardenForm.width} onChange={v=>setGardenForm(f=>({...f, width:v}))} type="number" min="1" step="0.1" />
                                <Input label={`${t("height")} (m)`} value={gardenForm.height} onChange={v=>setGardenForm(f=>({...f, height:v}))} type="number" min="1" step="0.1" />
                            </FormRow>
                            <Textarea label={t("notes")} value={gardenForm.notes} onChange={v=>setGardenForm(f=>({...f, notes:v}))} rows={2} />
                            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                                <Btn size="sm" variant="primary" onClick={saveGarden}>{t("save_garden")}</Btn>
                            </div>
                        </div>
                        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,minmax(0,1fr))", gap:10 }}>
                            <div style={{ padding:"12px 12px 11px", border:`1px solid ${T.borderSoft}`, borderRadius:18, background:T.surfaceSoft }}>
                                <div style={{ fontSize:11, fontWeight:800, color:T.textMuted, textTransform:"uppercase", letterSpacing:0.6 }}>{t("editor_stats_beds")}</div>
                                <div style={{ marginTop:6, fontSize:22, fontWeight:900, fontFamily:"Fraunces, serif", color:T.text }}>{gFields.length}</div>
                            </div>
                            <div style={{ padding:"12px 12px 11px", border:`1px solid ${T.borderSoft}`, borderRadius:18, background:T.surfaceSoft }}>
                                <div style={{ fontSize:11, fontWeight:800, color:T.textMuted, textTransform:"uppercase", letterSpacing:0.6 }}>{t("editor_stats_structures")}</div>
                                <div style={{ marginTop:6, fontSize:22, fontWeight:900, fontFamily:"Fraunces, serif", color:T.text }}>{gStructs.length}</div>
                            </div>
                            <div style={{ padding:"12px 12px 11px", border:`1px solid ${T.borderSoft}`, borderRadius:18, background:T.surfaceSoft }}>
                                <div style={{ fontSize:11, fontWeight:800, color:T.textMuted, textTransform:"uppercase", letterSpacing:0.6 }}>{t("editor_stats_plants")}</div>
                                <div style={{ marginTop:6, fontSize:22, fontWeight:900, fontFamily:"Fraunces, serif", color:T.text }}>{gPlants.length}</div>
                            </div>
                            <div style={{ padding:"12px 12px 11px", border:`1px solid ${T.borderSoft}`, borderRadius:18, background:T.surfaceSoft }}>
                                <div style={{ fontSize:11, fontWeight:800, color:T.textMuted, textTransform:"uppercase", letterSpacing:0.6 }}>{t("editor_stats_unassigned")}</div>
                                <div style={{ marginTop:6, fontSize:22, fontWeight:900, fontFamily:"Fraunces, serif", color:T.text }}>{unassignedPlants}</div>
                            </div>
                        </div>
                        <div style={{ fontSize:12, color:T.textSub, lineHeight:1.6 }}>
                            {posHint}
                        </div>
                    </div>
                </SectionPanel>
            </PanelGroup>
            <SectionPanel title={t("editor_map_title")} subtitle={t("editor_map_subtitle")} style={{ padding:16 }}>
                <GardenEditor garden={garden} fields={gFields} structures={gStructs} zones={gZones} plants={gPlants} slots={gSlots} dispatch={dispatch} lang={lang} navigate={navigate}/>
            </SectionPanel>
            {showField && (
                <Modal title={`??? ${t("add_bed")}`} onClose={()=>setShowField(false)}>
                    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                        <Input label={t("name")} value={ff.name} onChange={setF("name")} placeholder="e.g. Tomato Raised Bed" required/>
                        <Sel label={t("type")} value={ff.type} onChange={setF("type")} options={FIELD_TYPES.map(ft=>({value:ft,label:LANG[lang]?.[FIELD_LABEL_K[ft]]||ft}))}/>
                        <BedShapePicker value={ff.shape||"rect"} onChange={setF("shape")}/>
                        <InfoBanner icon="??">{posHint}</InfoBanner>
                        <FormRow><Input label="X (m)" value={ff.x} onChange={setF("x")} type="number" step="0.1" min="0" required/><Input label="Y (m)" value={ff.y} onChange={setF("y")} type="number" step="0.1" min="0" required/><Input label={`${t("width")} (m)`} value={ff.width} onChange={setF("width")} type="number" step="0.1" min="0.1" required/><Input label={`${t("height")} (m)`} value={ff.height} onChange={setF("height")} type="number" step="0.1" min="0.1" required/></FormRow>
                        <Textarea label={t("notes")} value={ff.notes} onChange={setF("notes")} rows={2}/>
                        <FormActions onCancel={()=>{ setShowField(false); setFf(ef); }} onSave={addField} saveLabel={t("add_bed")} t={t}/>
                    </div>
                </Modal>
            )}
            {showStruct && (
                <Modal title={`?? ${t("add_structure")}`} onClose={()=>setShowStruct(false)}>
                    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                        <Input label={t("name")} value={sf.name} onChange={setS("name")} placeholder="e.g. Main Greenhouse" required/>
                        <Sel label={t("type")} value={sf.type} onChange={setS("type")} options={STRUCT_TYPES.map(st=>({value:st,label:`${STRUCT_ICONS[st]} ${LANG[lang]?.[STRUCT_LABEL_K[st]]||st}`}))}/>
                        <Sel label="Linked field" value={sf.linked_field_id || ""} onChange={setS("linked_field_id")} options={[{ value:"", label:"No link" }, ...gFields.map(f=>({ value:f.id, label:f.name }))]} />
                        <Textarea label="Info" value={sf.info} onChange={setS("info")} rows={2} placeholder="Short description shown in details" />
                        {MAINTENANCE_STRUCT_TYPES.has(sf.type) && (
                            <>
                                <FormRow cols={2}>
                                    <Input label="Species / type" value={sf.species} onChange={setS("species")} placeholder="Beech, yew, privet..." />
                                    <Input label="Prune interval (weeks)" value={sf.prune_interval_weeks} onChange={setS("prune_interval_weeks")} type="number" min="0" max="52" placeholder="20" />
                                </FormRow>
                                <Input label="Next prune date" value={sf.next_prune_date} onChange={setS("next_prune_date")} type="date" />
                                <Textarea label="Maintenance notes" value={sf.maintenance_notes} onChange={setS("maintenance_notes")} rows={2} placeholder="Cut in late spring and after summer growth" />
                            </>
                        )}
                        <InfoBanner icon="??">{posHint}</InfoBanner>
                        <FormRow><Input label="X (m)" value={sf.x} onChange={setS("x")} type="number" step="0.1" min="0" required/><Input label="Y (m)" value={sf.y} onChange={setS("y")} type="number" step="0.1" min="0" required/><Input label={`${t("width")} (m)`} value={sf.width} onChange={setS("width")} type="number" step="0.1" min="0.1" required/><Input label={`${t("height")} (m)`} value={sf.height} onChange={setS("height")} type="number" step="0.1" min="0.1" required/></FormRow>
                        <Textarea label={t("notes")} value={sf.notes} onChange={setS("notes")} rows={2}/>
                        <FormActions onCancel={()=>{ setShowStruct(false); setSf(es); }} onSave={addStruct} saveLabel={t("add_structure")} t={t}/>
                    </div>
                </Modal>
            )}
        </PageShell>
    );
}

// ----

