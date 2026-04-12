import { useState } from "react";
import { PageShell, PageHeader, SectionPanel } from "../layout/PageChrome.jsx";
import { JourneyPanel, buildJourneyTrack } from "../layout/GardenJourney.jsx";
import { Btn } from "../ui/Btn.jsx";
import { Badge } from "../ui/Badge.jsx";
import { Card } from "../ui/Card.jsx";
import { EmptyState } from "../ui/EmptyState.jsx";
import { MetaBadge } from "../layout/PageChrome.jsx";
import { FormRow } from "../ui/FormRow.jsx";
import { Input } from "../ui/Input.jsx";
import { Sel } from "../ui/Sel.jsx";
import { Textarea } from "../ui/Textarea.jsx";
import { Modal } from "../ui/Modal.jsx";
import { T } from "../theme.js";
import { LANG } from "../i18n.js";
import { GARDEN_TYPE_LABEL_K } from "../gardenTypes.js";
import { gid, fmtDate, forUser } from "../helpers.js";
import { GARDEN_TYPES } from "../constants.js";

const useT = (lang) => (key) => LANG[lang]?.[key] ?? LANG.en[key] ?? key;
export default function GardensScreen({ state, dispatch, navigate, lang }) {
    const t = useT(lang);
    const uid = state.activeUserId;
    const gardens = forUser(state.gardens, uid);
    const fields  = forUser(state.fields, uid);
    const plants  = forUser(state.plants, uid);
    const structures = forUser(state.structures, uid);
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
    const user = state.users.find(u => u.id === uid);
    const journey = buildJourneyTrack({ user, gardens, fields, plants, structures, lang });
    const metaBadges = [
        <MetaBadge key="beds" value={fields.length} label={t("beds_fields")} />,
        <MetaBadge key="area" value={`${totalArea}m²`} label={t("total_area")} />,
    ];
    return (
        <PageShell width={1040}>
            <PageHeader
                title={`?? ${t("nav_gardens")}`}
                subtitle={`${gardens.length} ${t("gardens").toLowerCase()}`}
                meta={metaBadges}
                actions={[<Btn key="new" icon="+" variant="primary" onClick={()=>setShow(true)}>{t("new_garden")}</Btn>]}
            />
            <JourneyPanel
                headerLabel={t("dashboard_missions")}
                title={journey.headline}
                subtitle={journey.subtitle}
                progress={journey.progress}
                steps={journey.steps}
                tokens={journey.tokens}
                reward={journey.reward}
                nextStep={journey.nextStep}
                lang={lang}
                action={<Btn size="sm" variant="primary" icon="+" onClick={()=>setShow(true)}>{t("create_garden")}</Btn>}
            />
            {gardens.length===0 ? (
                <SectionPanel title={t("nav_gardens")} subtitle="Start by creating your first garden" action={<Btn size="sm" icon="+" variant="primary" onClick={()=>setShow(true)}>{t("create_garden")}</Btn>}>
                    <EmptyState icon="??" title={t("no_gardens")} subtitle="Create your first kitchen garden and start planning." />
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
                <Modal title={`?? ${t("create_garden")}`} onClose={()=>setShow(false)}>
                    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                        <Input label={t("name")} value={form.name} onChange={set("name")} placeholder="e.g. Backyard Kitchen Garden" required/>
                        <FormRow cols={3}>
                            <Input label={`${t("width")} (m)`} value={form.width} onChange={set("width")} type="number" placeholder="12" min="1" max="2000" required/>
                            <Input label={`${t("height")} (m)`} value={form.height} onChange={set("height")} type="number" placeholder="8" min="1" max="2000" required/>
                            <Sel label="Unit" value={form.unit} onChange={set("unit")} options={[{value:"m",label:"Metres"},{value:"ft",label:"Feet"}]}/>
                        </FormRow>
                        <Sel label={t("type")} value={form.type} onChange={set("type")} options={GARDEN_TYPES.map(gt=>({ value:gt, label:t(GARDEN_TYPE_LABEL_K[gt]) || gt }))}/>
                        <Textarea label={t("notes")} value={form.notes} onChange={set("notes")} rows={2}/>
                        <FormActions onCancel={()=>{ setShow(false); setForm(ef); }} onSave={create} saveLabel={t("create_garden")} t={t}/>
                    </div>
                </Modal>
            )}
        </PageShell>
    );
}

// ----
// SCREEN: GARDEN EDITOR
// ----
