import React from "react";
import { T } from "../theme.js";

export function buildJourneyTrack({ user, gardens = [], fields = [], plants = [], structures = [] }) {
    const steps = [
        {
            key: "profile",
            icon: "👤",
            label: "Profiel maken",
            done: !!user,
            helper: user ? `Welkom ${user.name || "tuinier"}.` : "Maak eerst een profiel aan.",
        },
        {
            key: "garden",
            icon: "🌿",
            label: "Eerste tuin",
            done: gardens.length > 0,
            helper: gardens.length > 0
                ? `${gardens.length} tuin${gardens.length === 1 ? "" : "en"} klaar.`
                : "Maak je eerste tuin aan.",
        },
        {
            key: "layout",
            icon: "🛏️",
            label: "Bedden plaatsen",
            done: fields.length > 0,
            helper: fields.length > 0
                ? `${fields.length} bed${fields.length === 1 ? "" : "den"} ingepland.`
                : "Leg de eerste bedden neer.",
        },
        {
            key: "plants",
            icon: "🌱",
            label: "Eerste planten",
            done: plants.length > 0,
            helper: plants.length > 0
                ? `${plants.length} plant${plants.length === 1 ? "" : "en"} toegevoegd.`
                : "Zet de eerste crop in je tuin.",
        },
    ];

    const completed = steps.filter(step => step.done).length;
    const progress = Math.round((completed / steps.length) * 100);
    const nextStep = steps.find(step => !step.done) || steps[steps.length - 1];
    const allOpen = progress === 100;
    const tokens = gardens.length === 0
        ? ["🪴", "🌱", "🧺"]
        : fields.length === 0
            ? ["🛏️", "🪴", "🌿"]
            : plants.length === 0
                ? ["🥕", "🍅", "🌽"]
                : ["🌿", "🥕", "🍓", "🌼"];

    return {
        steps,
        completed,
        progress,
        nextStep,
        tokens,
        headline: allOpen ? "Je tuinwereld is open." : "De volgende missie ligt klaar.",
        reward: allOpen
            ? "Nu draait alles als een kleine tuinwereld."
            : nextStep?.key === "garden"
                ? "Ontgrendelt: kaarten, crops en planning."
                : nextStep?.key === "layout"
                    ? "Ontgrendelt: bedden, vakken en indeling."
                    : nextStep?.key === "plants"
                        ? "Ontgrendelt: echte crops en groei."
                        : "Ontgrendelt: de rest van je tuinwereld.",
    };
}

export function buildProfileJourney({ user, gardens = [], fields = [], plants = [], tasks = [] }) {
    const steps = [
        {
            key: "name",
            icon: "✍️",
            label: "Naam invullen",
            done: !!user?.name,
            helper: user?.name ? `Profiel heet ${user.name}.` : "Kies een duidelijke naam.",
        },
        {
            key: "email",
            icon: "📧",
            label: "E-mail koppelen",
            done: !!user?.email,
            helper: user?.email ? `${user.email} staat gekoppeld.` : "Koppel een e-mailadres.",
        },
        {
            key: "style",
            icon: "🎨",
            label: "Eigen stijl",
            done: !!user?.avatar && !!user?.color,
            helper: user?.avatar ? "Avatar en kleur zijn gekozen." : "Kies een avatar en kleur.",
        },
        {
            key: "garden",
            icon: "🌿",
            label: "Eerste tuin",
            done: gardens.length > 0,
            helper: gardens.length > 0 ? `${gardens.length} tuin${gardens.length === 1 ? "" : "en"} actief.` : "Maak je eerste tuin.",
        },
        {
            key: "bed",
            icon: "🛏️",
            label: "Eerste bed",
            done: fields.length > 0,
            helper: fields.length > 0 ? `${fields.length} bed${fields.length === 1 ? "" : "den"} klaar.` : "Zet een bed of vak neer.",
        },
        {
            key: "plant",
            icon: "🌱",
            label: "Eerste plant",
            done: plants.length > 0,
            helper: plants.length > 0 ? `${plants.length} plant${plants.length === 1 ? "" : "en"} toegevoegd.` : "Voeg je eerste crop toe.",
        },
        {
            key: "task",
            icon: "✅",
            label: "Eerste taak",
            done: tasks.length > 0,
            helper: tasks.length > 0 ? `${tasks.length} taak${tasks.length === 1 ? "" : "en"} ingepland.` : "Plan een kleine taak.",
        },
    ];

    const completed = steps.filter(step => step.done).length;
    const progress = Math.round((completed / steps.length) * 100);
    const nextStep = steps.find(step => !step.done) || steps[steps.length - 1];

    return {
        steps,
        completed,
        progress,
        nextStep,
        tokens: ["👤", "🌿", "🛏️", "🌱", "✅"],
        headline: progress >= 100 ? "Je profiel is helemaal klaar." : "Vul je profiel stap voor stap aan.",
        reward: progress >= 100
            ? "Nu is je tuinprofiel compleet en klaar voor groei."
            : "Meer profielstappen maken de rest van MyGarden opener.",
    };
}

export function buildUserQuestProgress({ user, gardens = [], fields = [], structures = [], plants = [], tasks = [] }) {
    const settings = user?.settings || {};
    const hasGarden = gardens.length > 0;
    const hasField = fields.length > 0;
    const hasStructure = structures.length > 0;
    const hasPlant = plants.length > 0;
    const hasAssignedPlant = plants.some(plant => plant.field_id || plant.struct_id);
    const hasTask = tasks.length > 0;
    const hasHarvestDate = plants.some(plant => !!plant.harvest_date);
    const hasGardenWithPlants = gardens.some(garden => plants.some(plant => plant.garden_id === garden.id));
    const hasSecondStep = settings?.email_verified || settings?.email_confirmed;

    const steps = [
        {
            key: "profile_name",
            icon: "✍️",
            label: "Naam invullen",
            done: !!user?.name,
            route: "account",
            actionLabel: "Open profiel",
            helper: user?.name ? `Profiel heet ${user.name}.` : "Kies een duidelijke naam.",
        },
        {
            key: "email",
            icon: "📧",
            label: "E-mail invullen",
            done: !!user?.email,
            route: "account",
            actionLabel: "Open profiel",
            helper: user?.email ? `${user.email} staat ingevuld.` : "Voeg een e-mail toe in je profiel.",
        },
        {
            key: "email_verified",
            icon: "✅",
            label: "E-mail bevestigd",
            done: !!settings.email_verified || !!settings.email_confirmed,
            route: "account",
            actionLabel: "Bevestig e-mail",
            helper: (settings.email_verified || settings.email_confirmed)
                ? "E-mail is bevestigd."
                : "Bevestig je e-mail vanuit je profiel.",
            actionKind: "confirm_email",
        },
        {
            key: "style",
            icon: "🎨",
            label: "Avatar en kleur",
            done: !!user?.avatar && !!user?.color,
            route: "account",
            actionLabel: "Kies stijl",
            helper: user?.avatar ? "Avatar en kleur zijn gekozen." : "Geef je profiel een eigen stijl.",
        },
        {
            key: "garden",
            icon: "🌿",
            label: "Eerste tuin",
            done: hasGarden,
            route: "gardens",
            actionLabel: "Ga naar tuinen",
            helper: hasGarden ? `${gardens.length} tuin${gardens.length === 1 ? "" : "en"} actief.` : "Maak je eerste tuin aan.",
        },
        {
            key: "garden_open",
            icon: "🗺️",
            label: "Tuin openen",
            done: hasGarden && !!gardens[0],
            route: "gardens",
            actionLabel: "Open tuinen",
            helper: hasGarden ? "Open je tuinenoverzicht en kies een tuin." : "Eerst een tuin aanmaken.",
        },
        {
            key: "field",
            icon: "🛏️",
            label: "Eerste bed",
            done: hasField,
            route: "editor",
            actionLabel: "Open editor",
            helper: hasField ? `${fields.length} bed${fields.length === 1 ? "" : "den"} klaar.` : "Zet je eerste bed neer in de editor.",
        },
        {
            key: "structure",
            icon: "🏡",
            label: "Eerste serre",
            done: hasStructure,
            route: "greenhouses",
            actionLabel: "Open serres",
            helper: hasStructure ? "Serre of structuur is toegevoegd." : "Plaats je eerste serre of structuur.",
        },
        {
            key: "plant",
            icon: "🌱",
            label: "Eerste plant",
            done: hasPlant,
            route: "plants",
            actionLabel: "Open planten",
            helper: hasPlant ? `${plants.length} plant${plants.length === 1 ? "" : "en"} toegevoegd.` : "Voeg je eerste crop toe.",
        },
        {
            key: "assign",
            icon: "🔗",
            label: "Plant koppelen",
            done: hasAssignedPlant,
            route: "plants",
            actionLabel: "Koppel plant",
            helper: hasAssignedPlant ? "Minstens één plant staat gekoppeld." : "Koppel een plant aan een bed of serre.",
        },
        {
            key: "task",
            icon: "📋",
            label: "Eerste taak",
            done: hasTask,
            route: "tasks",
            actionLabel: "Open taken",
            helper: hasTask ? `${tasks.length} taak${tasks.length === 1 ? "" : "en"} ingepland.` : "Plan je eerste taak.",
        },
        {
            key: "harvest",
            icon: "🧺",
            label: "Oogst plannen",
            done: hasHarvestDate,
            route: "plants",
            actionLabel: "Open oogst",
            helper: hasHarvestDate ? "Een plant heeft al een oogstdatum." : "Geef een plant een oogstdatum.",
        },
        {
            key: "garden_plants",
            icon: "🌼",
            label: "Tuin gevuld",
            done: hasGardenWithPlants,
            route: "gardens",
            actionLabel: "Bekijk tuin",
            helper: hasGardenWithPlants ? "Ten minste één tuin heeft planten." : "Zorg dat je eerste tuin echt leeft.",
        },
    ];

    const completed = steps.filter(step => step.done).length;
    const progress = Math.round((completed / steps.length) * 100);
    const nextStep = steps.find(step => !step.done) || steps[steps.length - 1];
    const aiSteps = [
        {
            key: "ai_tip_1",
            icon: "🧠",
            label: "AI tuincoach",
            done: true,
            helper: "Vraag om een slim plan voor je volgende tuinwerk.",
            route: "dev",
            actionLabel: "Open coach",
        },
        {
            key: "ai_tip_2",
            icon: "✨",
            label: "Slimme plant tips",
            done: true,
            helper: "Laat AI een plantadvies of combinatie voorstellen.",
            route: "plants",
            actionLabel: "Open planten",
        },
        {
            key: "ai_tip_3",
            icon: "📐",
            label: "Tuinanalyse",
            done: true,
            helper: "Vraag om een check van indeling, ruimte en balans.",
            route: "editor",
            actionLabel: "Open editor",
        },
        {
            key: "ai_tip_4",
            icon: "🌦️",
            label: "Weer & planning",
            done: true,
            helper: "Gebruik AI om je komende week slim in te delen.",
            route: "tasks",
            actionLabel: "Open taken",
        },
    ];

    return {
        steps: progress >= 100 ? aiSteps : steps,
        completed,
        progress,
        nextStep: progress >= 100 ? aiSteps[0] : nextStep,
        tokens: progress >= 100 ? ["🧠", "✨", "📐", "🌦️"] : ["👤", "🌿", "🛏️", "🏡", "🌱", "🔗", "📋", "🧺"],
        headline: progress >= 100 ? "Je tuin is klaar. Vraag de AI-coach om de volgende zet." : "Vul je tuinwereld stap voor stap aan.",
        reward: progress >= 100
            ? "Nu draait de kaart over naar slimme AI-stappen."
            : "Meer stappen maken de app speelser en duidelijker.",
    };
}

export function JourneyPanel({
    title,
    subtitle,
    progress = 0,
    steps = [],
    tokens = [],
    reward,
    nextStep,
    action,
    headerLabel = "Tuinreis",
    onStepAction,
}) {
    const doneCount = steps.filter(step => step.done).length;
    const totalCount = Math.max(steps.length, 1);
    const displayProgress = Math.max(0, Math.min(100, Math.round(progress)));

    return (
        <div style={{
            border:`1px solid ${T.borderSoft}`,
            borderRadius:T.radiusLg,
            padding:18,
            background:`linear-gradient(180deg, #FFFDF8 0%, #F4F8EC 100%)`,
            boxShadow:T.sh,
            display:"flex",
            flexDirection:"column",
            gap:14,
        }}>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
                <div>
                    <div style={{ fontSize:11, fontWeight:800, letterSpacing:0.8, textTransform:"uppercase", color:T.primary }}>
                        {headerLabel}
                    </div>
                    <h3 style={{ margin:"4px 0 6px", fontSize:20, fontWeight:900, fontFamily:"Fraunces, serif", color:T.text }}>
                        {title}
                    </h3>
                    {subtitle && <div style={{ fontSize:13, color:T.textMuted, lineHeight:1.6 }}>{subtitle}</div>}
                </div>
                {action && <div>{action}</div>}
            </div>

            <div style={{
                background:T.surface,
                border:`1px solid ${T.borderSoft}`,
                borderRadius:T.radiusRound,
                overflow:"hidden",
                height:12,
                boxShadow:"inset 0 1px 2px rgba(0,0,0,0.04)",
            }}>
                <div style={{
                    width:`${displayProgress}%`,
                    height:"100%",
                    borderRadius:T.radiusRound,
                    background:"linear-gradient(90deg, #3A7318 0%, #7FB24B 100%)",
                    transition:"width 0.2s ease",
                }} />
            </div>

            <div style={{ display:"flex", justifyContent:"space-between", gap:12, flexWrap:"wrap", fontSize:12, color:T.textMuted }}>
                <span>{displayProgress}% klaar · {doneCount}/{totalCount} stappen</span>
                <span style={{ fontWeight:700, color:T.textSub }}>{reward || "Nieuwe dingen worden hier ontgrendeld."}</span>
            </div>

            {tokens.length > 0 && (
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    {tokens.map((token, idx) => (
                        <span key={`${token}-${idx}`} style={{
                            minWidth:40,
                            height:40,
                            padding:"0 12px",
                            borderRadius:999,
                            display:"inline-flex",
                            alignItems:"center",
                            justifyContent:"center",
                            background:T.surface,
                            border:`1px solid ${T.borderSoft}`,
                            boxShadow:"0 1px 3px rgba(0,0,0,0.05)",
                            fontSize:18,
                        }}>{token}</span>
                    ))}
                </div>
            )}

            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:10 }}>
                {steps.map(step => (
                    <div key={step.key} style={{
                        padding:"12px 13px",
                        borderRadius:T.radiusMd,
                        border:`1px solid ${step.done ? T.primaryBg : T.borderSoft}`,
                        background:step.done ? T.primaryBgLight : T.surface,
                        display:"flex",
                        flexDirection:"column",
                        gap:6,
                        minHeight:98,
                    }}>
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
                            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                                <span style={{ fontSize:18 }}>{step.icon}</span>
                                <span style={{ fontSize:13, fontWeight:800, color:T.text }}>{step.label}</span>
                            </div>
                            <span style={{
                                fontSize:10,
                                fontWeight:800,
                                letterSpacing:0.5,
                                textTransform:"uppercase",
                                color:step.done ? T.primary : T.textMuted,
                            }}>
                                {step.done ? "klaar" : "open"}
                            </span>
                        </div>
                        {step.helper && <div style={{ fontSize:12, lineHeight:1.5, color:T.textMuted }}>{step.helper}</div>}
                        {onStepAction && !step.done && (step.route || step.actionKind) && (
                            <div style={{ display:"flex", justifyContent:"flex-end", marginTop:4 }}>
                                <button
                                    type="button"
                                    onClick={() => onStepAction(step)}
                                    style={{
                                        border:`1px solid ${T.primaryBg}`,
                                        background:T.surface,
                                        color:T.primary,
                                        borderRadius:T.radiusRound,
                                        padding:"6px 10px",
                                        fontSize:11,
                                        fontWeight:800,
                                        cursor:"pointer",
                                        fontFamily:"inherit",
                                    }}
                                >
                                    {step.actionLabel || "Open"}
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {nextStep && (
                <div style={{
                    display:"flex",
                    alignItems:"center",
                    justifyContent:"space-between",
                    gap:12,
                    flexWrap:"wrap",
                    padding:"12px 14px",
                    borderRadius:T.radiusMd,
                    background:T.surface,
                    border:`1px dashed ${T.primary}44`,
                }}>
                    <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                        <div style={{ fontSize:11, fontWeight:800, letterSpacing:0.5, textTransform:"uppercase", color:T.primary }}>
                            Volgende missie
                        </div>
                        <div style={{ fontSize:13, fontWeight:800, color:T.text }}>
                            {nextStep.icon} {nextStep.label}
                        </div>
                    </div>
                    <div style={{ fontSize:12, color:T.textMuted, textAlign:"right", maxWidth:280 }}>
                        {nextStep.helper}
                    </div>
                </div>
            )}
        </div>
    );
}
