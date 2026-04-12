import { useState } from "react";
import { PageShell, PageHeader, MetaBadge } from "../layout/PageChrome.jsx";
import { Btn } from "../ui/Btn.jsx";
import { Badge } from "../ui/Badge.jsx";
import { ListRow } from "../ui/ListRow.jsx";
import { Input } from "../ui/Input.jsx";
import { Sel } from "../ui/Sel.jsx";
import { Textarea } from "../ui/Textarea.jsx";
import { Modal } from "../ui/Modal.jsx";
import { EmptyState } from "../ui/EmptyState.jsx";
import { FormRow } from "../ui/FormRow.jsx";
import { FormActions } from "../ui/FormActions.jsx";
import { PillFilter } from "../ui/PillFilter.jsx";
import { T } from "../theme.js";
import { LANG } from "../i18n.js";
import { fmtDate, isOverdue, isSameDay, forUser, gid } from "../helpers.js";
import { TASK_STATUS_K, TASK_STATUS_C, TASK_TYPES, TASK_ICONS } from "../constants.js";

const useT = (lang) => (key) => LANG[lang]?.[key] ?? LANG.en[key] ?? key;
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
// SCREEN: TASKS
// ----
export default function TasksScreen({ state, dispatch, lang }) {
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
        if (fType==="maintenance" && !isMaintenanceTask(t2)) return false;
        if (fType!=="all" && fType!=="maintenance"&&t2.type!==fType) return false;
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
                title={`? ${t("nav_tasks")}`}
                subtitle={`${done}/${tasks.length} complete`}
                meta={[
                    <MetaBadge key="open" value={tasks.length - done} label={t("task_pending")} />,
                    <MetaBadge key="done" value={done} label={t("task_done")} />
                ]}
                actions={[<Btn key="add" variant="primary" icon="+" onClick={()=>setShow(true)}>{t("add_task")}</Btn>]}
            />
            {tasks.length>0 && (
                <div style={{ marginBottom:18 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:T.textSub, marginBottom:5 }}><span>{pct}% {t("task_done")}</span><span>{done}/{tasks.length}</span></div>
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
                <PillFilter value={t("maintenance")} active={fType==="maintenance"} onClick={()=>setFType("maintenance")}/>
                {TASK_TYPES.map(ty => <PillFilter key={ty} value={`${TASK_ICONS[ty]} ${ty}`} active={fType===ty} onClick={()=>setFType(ty)}/>)}
            </div>
            {display.length===0 ? <EmptyState icon="?" title={t("no_tasks")} action={<Btn onClick={()=>setShow(true)} icon="+" variant="primary">{t("add_task")}</Btn>}/> : (
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
                                icon={TASK_ICONS[task.type]||"??"}
                                title={task.title}
                                meta={meta}
                                status={{ label: sc_l, color: sc_.color, bg: sc_.bg }}
                                hint={LinkedHint(task, fields, structures, lang)}
                                actions={[
                                    <Btn key="toggle" size="xs" variant={task.status==="done"?"secondary":"success"} onClick={()=>dispatch({type:"UPDATE_TASK",payload:{...task,status:task.status==="done"?"pending":"done"}})}>{task.status==="done"?t("task_reopen"):t("task_done")}</Btn>,
                                    <Btn key="delete" size="xs" variant="ghost" onClick={()=>{ if(window.confirm("Delete task?")) dispatch({type:"DELETE_TASK",payload:task.id}); }}>?</Btn>
                                ]}
                            />
                        );
                    })}
                </div>
            )}
            {show && (
                <Modal title={`?? ${t("add_task")}`} onClose={()=>{ setShow(false); setForm(ef); }}>
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
        </PageShell>
    );
}

// ----
// SCREEN: GREENHOUSES
