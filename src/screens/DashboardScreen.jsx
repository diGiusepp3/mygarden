import { PageShell, PageHeader, SectionPanel, PanelGroup, QuickAction, MetaBadge } from "../layout/PageChrome.jsx";
import { JourneyPanel, buildUserQuestProgress } from "../layout/GardenJourney.jsx";
import { Btn } from "../ui/Btn.jsx";
import { Badge } from "../ui/Badge.jsx";
import { ListRow } from "../ui/ListRow.jsx";
import { EmptyState } from "../ui/EmptyState.jsx";
import { Card } from "../ui/Card.jsx";
import { StatCard } from "../ui/StatCard.jsx";
import { T } from "../theme.js";
import { LANG, LOCALE_MAP } from "../i18n.js";
import { GARDEN_TYPE_LABEL_K } from "../gardenTypes.js";
import { fmtDate, isOverdue, isSameDay, forUser } from "../helpers.js";
import { GH_TYPES, TASK_STATUS_C, TASK_STATUS_K, TASK_ICONS, CAT_ICONS } from "../constants.js";

const useT = (lang) => (key) => LANG[lang]?.[key] ?? LANG.en[key] ?? key;
// ----
export default function DashboardScreen({ state, dispatch, navigate, lang }) {
    const t = useT(lang);
    const uid = state.activeUserId;
    const user = state.users.find(u => u.id === uid);
    const gardens = forUser(state.gardens, uid);
    const fields = forUser(state.fields, uid);
    const plants = forUser(state.plants, uid);
    const structures = forUser(state.structures, uid);
    const tasks = forUser(state.tasks, uid);
    const journey = buildUserQuestProgress({ user, gardens, fields, structures, plants, tasks, lang });
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
    const journeyRoute = journey.nextStep?.route || "dashboard";
    const handleQuestStep = (step) => {
        if (step.actionKind === "confirm_email") {
            dispatch({ type:"SET_SETTING", payload:{ email_verified:true } });
            return;
        }
        if (step.route === "gardens" && gardens[0]) {
            dispatch({ type:"SET_ACTIVE_GARDEN", payload: gardens[0].id });
        }
        if ((step.route === "editor" || step.route === "plants" || step.route === "tasks" || step.route === "greenhouses") && state.activeGardenId) {
            dispatch({ type:"SET_ACTIVE_GARDEN", payload: state.activeGardenId });
        }
        navigate(step.route || "dashboard");
    };
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
                    <Btn key="done" size="xs" variant="success" onClick={() => dispatch({ type: "UPDATE_TASK", payload: { ...task, status: "done" } })}>{t("task_done")}</Btn>
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
                hint={plant.quantity ? `×${plant.quantity}` : undefined}
                actionSlot={<Badge color={T.textSub} bg={T.surfaceAlt}>×{plant.quantity || 1}</Badge>}
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
            ? `${t("dashboard_next_prefix")}: ${fmtDate(nextTask.due_date, lang)} · ${nextTask.title}`
            : lastTask
                ? `${t("dashboard_last_prefix")}: ${fmtDate(lastTask.due_date, lang)} · ${lastTask.title}`
                : `${t("dashboard_created_prefix")} ${garden.created_at ? new Date(garden.created_at).toLocaleDateString() : "—"}`;
        const isGreenhouse = garden.type?.toLowerCase().includes("greenhouse");
        return (
            <div key={garden.id} style={{ background:T.surface, border:`1px solid ${T.borderSoft}`, borderRadius:T.radiusLg, padding:16, boxShadow:"0 2px 6px rgba(0,0,0,0.06)", minHeight:190, display:"flex", flexDirection:"column", gap:10 }}>
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:10 }}>
                    <div>
                        <div style={{ fontSize:15, fontWeight:800, color:T.text }}>{garden.name}</div>
                        <div style={{ fontSize:11, color:T.textMuted }}>{garden.width} × {garden.height}m · {t(GARDEN_TYPE_LABEL_K[garden.type] || garden.type) || garden.type}</div>
                    </div>
                    <Badge color={isGreenhouse?T.accent:T.primary} bg={isGreenhouse?T.accentBg:T.primaryBg}>{t(GARDEN_TYPE_LABEL_K[garden.type] || garden.type) || garden.type}</Badge>
                </div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                    <Badge color={T.primary} bg={T.primaryBg}>{bedCount} {t("beds_fields").toLowerCase()}</Badge>
                    <Badge color={T.textSub} bg={T.surfaceAlt}>{structCount} {t("dashboard_structures").toLowerCase()}</Badge>
                    <Badge color={T.textSub} bg={T.surfaceAlt}>{plantCount} {t("plant_varieties").toLowerCase()}</Badge>
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
            icon: "🌿",
            label: nextHarvest ? `${t("harvest")} ${nextHarvest.name}` : t("dashboard_review_harvest"),
            helper: nextHarvest ? `${t("due_date")} ${fmtDate(nextHarvest.harvest_date, lang)}` : t("dashboard_no_harvest_soon"),
            onClick: () => navigate("plants"),
        },
        {
            icon: "🌿",
            label: emptyBeds.length ? `${emptyBeds.length} ${t("dashboard_empty_beds")}` : t("dashboard_all_beds_planted"),
            helper: emptyBeds.length ? t("dashboard_fill_beds") : t("dashboard_keep_beds_full"),
            onClick: () => navigate("fields"),
        },
        {
            icon: "🌱",
            label: greenhouseCount ? `${greenhouseCount} ${t("dashboard_greenhouse_spots")}` : t("dashboard_add_greenhouse"),
            helper: greenhouseCount ? t("dashboard_check_ventilation") : t("dashboard_create_protected"),
            onClick: () => navigate("greenhouses"),
        },
        {
            icon: "🌿",
            label: t("dashboard_seo_hub"),
            helper: t("dashboard_seo_hub_helper"),
            onClick: () => { window.location.href = "/seo/"; },
        },
    ];
    return (
        <PageShell width={1180}>
            <PageHeader
                title={`${t("good_morning")} 🌞`}
                subtitle={todayLabel}
                meta={instructionMeta}
                actions={quickActions}
            />
            <JourneyPanel
                headerLabel={t("dashboard_missions")}
                title={journey.headline || t("dashboard_world_title")}
                subtitle={journey.subtitle || t("dashboard_world_subtitle")}
                progress={journey.progress}
                steps={journey.steps}
                tokens={journey.tokens}
                reward={journey.reward}
                nextStep={journey.nextStep}
                onStepAction={handleQuestStep}
                lang={lang}
                action={
                <Btn size="sm" variant="primary" onClick={() => {
                    const next = journey.nextStep;
                    if (next?.actionKind === "confirm_email") {
                        dispatch({ type:"SET_SETTING", payload:{ email_verified:true } });
                        return;
                    }
                    if (next?.route === "gardens" && gardens[0]) {
                        dispatch({ type:"SET_ACTIVE_GARDEN", payload: gardens[0].id });
                    }
                    if ((next?.route === "editor" || next?.route === "plants" || next?.route === "tasks" || next?.route === "greenhouses") && state.activeGardenId) {
                        dispatch({ type:"SET_ACTIVE_GARDEN", payload: state.activeGardenId });
                    }
                    navigate(journeyRoute);
                }}>
                    {journey.progress >= 100 ? (journey.nextStep?.actionLabel || t("dashboard_open_garden")) : t("dashboard_next_step")}
                </Btn>
            }
        />
            <PanelGroup>
                <StatCard icon="🌱" label={t("gardens")} value={gardens.length} color={T.primary} sub={`${fields.length} ${t("beds_total")}`} onClick={() => navigate("gardens")} />
                <StatCard icon="🌱" label={t("beds_fields")} value={fields.length} color="#558B2F" sub={`${totalArea}m² ${t("total_area")}`} onClick={() => navigate("fields")} />
                <StatCard icon="🌱" label={t("plant_varieties")} value={plants.length} color="#388E3C" sub={`${plants.reduce((sum, p) => sum + (+p.quantity || 0), 0)} plants`} onClick={() => navigate("plants")} />
                <StatCard icon="?" label={t("tasks_pending")} value={pending.length} color={overdue.length > 0 ? T.danger : T.warning} sub={overdue.length > 0 ? `${overdue.length} ${t("overdue_badge")}` : t("all_on_track")} onClick={() => navigate("tasks")} />
                {harvestable.length > 0 && (
                    <StatCard icon="🌱" label={t("ready_to_harvest")} value={harvestable.length} color={T.accent} sub={t("harvestable_badge")} onClick={() => navigate("plants")} />
                )}
            </PanelGroup>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 16 }}>
                <SectionPanel title={`🌱 ${t("today")}`} subtitle={`${todayTasks.length} ${t("tasks_pending").toLowerCase()}`} action={<Btn size="sm" variant="ghost" onClick={() => navigate("tasks")}>{t("view_all")}</Btn>}>
                    {todayTasks.length ? todayTasks.map(renderTaskRow) : (
                        <div style={{ padding: "24px 0", fontSize: 13, color: T.textMuted, minHeight:120 }}>{t("dashboard_no_tasks_today")}</div>
                    )}
                </SectionPanel>
                <SectionPanel title={t("ready_to_harvest")} subtitle={`${harvestable.length} ${t("ready_to_harvest").toLowerCase()}`} accent={{ border: T.accent, titleColor: T.text, subColor: T.textMuted }} action={<Btn size="sm" variant="ghost" onClick={() => navigate("plants")}>{t("view_all")}</Btn>}>
                    {harvestable.length ? harvestable.slice(0, 4).map(renderHarvestRow) : (
                        <div style={{ padding: "24px 0", fontSize: 13, color: T.textMuted, minHeight:120 }}>{t("dashboard_no_harvest")}</div>
                    )}
                </SectionPanel>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 16 }}>
                <SectionPanel title={t("dashboard_attention_title")} subtitle={`${attentionTasks.length} ${t("dashboard_attention_subtitle")}`} accent={{ border: T.danger, titleColor: T.danger }} action={<Btn size="sm" variant="ghost" onClick={() => navigate("tasks")}>{t("view_all")}</Btn>}>
                    {attentionTasks.length ? attentionTasks.map(renderTaskRow) : (
                        <div style={{ padding: "24px 0", fontSize: 13, color: T.textMuted, minHeight:120 }}>{t("dashboard_nothing_urgent")}</div>
                    )}
                </SectionPanel>
                <SectionPanel title={t("dashboard_my_gardens")} subtitle={`${gardens.length} ${t("gardens").toLowerCase()}`} action={<Btn size="sm" variant="ghost" onClick={() => navigate("gardens")}>{t("view_all")}</Btn>}>
                    {gardens.length ? (
                        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:12 }}>
                            {gardens.map(renderGardenCard)}
                        </div>
                    ) : (
                        <div style={{ padding: "24px 0" }}>
                            <EmptyState icon="🌱" title={t("no_gardens")} subtitle={t("dashboard_create_garden_hint")} action={<Btn variant="primary" onClick={() => navigate("gardens")} icon="+">{t("new_garden")}</Btn>} />
                        </div>
                    )}
                </SectionPanel>
            </div>
            <SectionPanel title={t("dashboard_seasonal_suggestions")} subtitle={t("dashboard_smart_tips")} accent={{ border: T.primary, titleColor: T.text, subColor: T.textMuted }}>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {suggestionItems.map(s => (
                        <QuickAction key={s.label} icon={s.icon} label={s.label} helper={s.helper} onClick={s.onClick} />
                    ))}
                </div>
            </SectionPanel>
        </PageShell>
    );
}
// ----
// SCREEN: GARDENS
