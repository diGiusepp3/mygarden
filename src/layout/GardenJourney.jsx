import React from "react";
import { T } from "../theme.js";

const COPY = {
    en: {
        headerTrack: "Garden missions",
        nextMission: "Next mission",
        allDone: "All done",
        allDoneTitle: "Your garden world is unlocked.",
        allDoneText: "You can continue with AI tips, extra plants and refinement.",
        progressText: (p, d, t) => `${p}% · ${d}/${t} steps`,
        actionDefault: "Open",
        profileTitleOpen: "Your garden world keeps growing.",
        profileTitleDone: "Your garden world is open.",
        profileSubtitleOpen: "Open the next chapter in your garden, step by step.",
        profileSubtitleDone: "The whole garden world is ready for the next move.",
        profileRewardOpen: "More steps make the app feel more alive.",
        profileRewardDone: "Now everything runs like a small garden world.",
        profileLabel: "Profile",
        profileNew: "Create a profile to start.",
        profileDone: name => `Welcome ${name || "gardener"}.`,
        gardenLabel: "First garden",
        gardenNew: "Create your first garden.",
        gardenDone: c => `${c} garden${c === 1 ? "" : "s"} ready.`,
        layoutLabel: "Beds",
        layoutNew: "Lay out your first beds.",
        layoutDone: c => `${c} bed${c === 1 ? "" : "s"} planned.`,
        plantLabel: "First plants",
        plantNew: "Add your first crop.",
        plantDone: c => `${c} plant${c === 1 ? "" : "s"} added.`,
        rewardGarden: "Unlocks: maps, crops and planning.",
        rewardLayout: "Unlocks: beds, plots and layout.",
        rewardPlant: "Unlocks: crops, growth and harvest flow.",
        profileNameLabel: "Name",
        emailLabel: "Email",
        emailDone: "Email is filled in.",
        emailNew: "Add an email address in your profile.",
        emailVerifiedLabel: "Email confirmed",
        emailVerifiedNew: "Confirm your email from your profile.",
        styleLabel: "Avatar and color",
        styleDone: "Avatar and color are set.",
        styleNew: "Give your profile a unique style.",
        firstGardenLabel: "First garden",
        firstGardenNew: "Create your first garden.",
        firstGardenDone: c => `${c} garden${c === 1 ? "" : "s"} active.`,
        openGardenLabel: "Open garden",
        openGardenNew: "Create a garden first.",
        openGardenDone: "Open your garden overview and choose a garden.",
        bedLabel: "First bed",
        bedNew: "Place your first bed in the editor.",
        bedDone: c => `${c} bed${c === 1 ? "" : "s"} ready.`,
        structureLabel: "First greenhouse",
        structureNew: "Place your first greenhouse or structure.",
        structureDone: "Greenhouse or structure added.",
        plantDoneLabel: "First plant",
        plantDoneNew: "Add your first crop.",
        plantDoneReady: c => `${c} plant${c === 1 ? "" : "s"} added.`,
        assignLabel: "Link plant",
        assignNew: "Link a plant to a bed or greenhouse.",
        assignDone: "At least one plant is linked.",
        taskLabel: "First task",
        taskNew: "Plan your first task.",
        taskDone: c => `${c} task${c === 1 ? "" : "s"} planned.`,
        harvestLabel: "Harvest planning",
        harvestNew: "Give a plant a harvest date.",
        harvestDone: "One plant already has a harvest date.",
        gardenPlantsLabel: "Garden filled",
        gardenPlantsNew: "Make your first garden feel alive.",
        gardenPlantsDone: "At least one garden has plants.",
        openProfile: "Open profile",
        openGardens: "Open gardens",
        openEditor: "Open editor",
        openPlants: "Open plants",
        openTasks: "Open tasks",
        openGreenhouses: "Open greenhouses",
        openHarvest: "Open harvest",
        aiHeadline: "Your garden is ready. Ask the AI coach for the next move.",
        aiReward: "The card now switches to smart AI steps.",
        aiTip1: "Ask for a smart plan for your next garden work.",
        aiTip2: "Let AI suggest plant advice or combinations.",
        aiTip3: "Ask for a check of layout, space and balance.",
        aiTip4: "Use AI to plan the coming week.",
        aiAction1: "Open coach",
        aiAction2: "Open plants",
        aiAction3: "Open editor",
        aiAction4: "Open tasks",
        aiLabel1: "AI garden coach",
        aiLabel2: "Smart plant tips",
        aiLabel3: "Garden analysis",
        aiLabel4: "Weather & planning",
        stepsWord: "steps",
    },
    nl: {
        headerTrack: "Tuinmissies",
        nextMission: "Volgende missie",
        allDone: "Alles klaar",
        allDoneTitle: "Je tuinwereld is ontgrendeld.",
        allDoneText: "Je kunt nu verder met AI-tips, extra planten en verfijning.",
        progressText: (p, d, t) => `${p}% · ${d}/${t} stappen`,
        actionDefault: "Open",
        profileTitleOpen: "Je tuinwereld groeit verder.",
        profileTitleDone: "Je tuinwereld staat open.",
        profileSubtitleOpen: "Open de volgende laag van je tuin, stap voor stap.",
        profileSubtitleDone: "De hele tuinwereld staat klaar voor de volgende zet.",
        profileRewardOpen: "Meer stappen maken de app levendiger.",
        profileRewardDone: "Nu draait alles als een kleine tuinwereld.",
        profileLabel: "Profiel",
        profileNew: "Maak een profiel aan om te starten.",
        profileDone: name => `Welkom ${name || "tuinier"}.`,
        gardenLabel: "Eerste tuin",
        gardenNew: "Maak je eerste tuin aan.",
        gardenDone: c => `${c} tuin${c === 1 ? "" : "en"} klaar.`,
        layoutLabel: "Bedden",
        layoutNew: "Leg je eerste bedden neer.",
        layoutDone: c => `${c} bed${c === 1 ? "" : "den"} ingepland.`,
        plantLabel: "Eerste planten",
        plantNew: "Voeg je eerste crop toe.",
        plantDone: c => `${c} plant${c === 1 ? "" : "en"} toegevoegd.`,
        rewardGarden: "Ontgrendelt: kaarten, crops en planning.",
        rewardLayout: "Ontgrendelt: bedden, vakken en indeling.",
        rewardPlant: "Ontgrendelt: echte crops, groei en oogstflow.",
        profileNameLabel: "Naam",
        emailLabel: "E-mail",
        emailDone: "E-mail is ingevuld.",
        emailNew: "Voeg een e-mailadres toe in je profiel.",
        emailVerifiedLabel: "E-mail bevestigd",
        emailVerifiedNew: "Bevestig je e-mail vanuit je profiel.",
        styleLabel: "Avatar en kleur",
        styleDone: "Avatar en kleur zijn gekozen.",
        styleNew: "Geef je profiel een eigen stijl.",
        firstGardenLabel: "Eerste tuin",
        firstGardenNew: "Maak je eerste tuin aan.",
        firstGardenDone: c => `${c} tuin${c === 1 ? "" : "en"} actief.`,
        openGardenLabel: "Tuin openen",
        openGardenNew: "Maak eerst een tuin aan.",
        openGardenDone: "Open je tuinenoverzicht en kies een tuin.",
        bedLabel: "Eerste bed",
        bedNew: "Zet je eerste bed neer in de editor.",
        bedDone: c => `${c} bed${c === 1 ? "" : "den"} klaar.`,
        structureLabel: "Eerste serre",
        structureNew: "Plaats je eerste serre of structuur.",
        structureDone: "Serre of structuur toegevoegd.",
        plantDoneLabel: "Eerste plant",
        plantDoneNew: "Voeg je eerste crop toe.",
        plantDoneReady: c => `${c} plant${c === 1 ? "" : "en"} toegevoegd.`,
        assignLabel: "Plant koppelen",
        assignNew: "Koppel een plant aan een bed of serre.",
        assignDone: "Minstens één plant staat gekoppeld.",
        taskLabel: "Eerste taak",
        taskNew: "Plan je eerste taak.",
        taskDone: c => `${c} taak${c === 1 ? "" : "en"} ingepland.`,
        harvestLabel: "Oogst plannen",
        harvestNew: "Geef een plant een oogstdatum.",
        harvestDone: "Een plant heeft al een oogstdatum.",
        gardenPlantsLabel: "Tuin gevuld",
        gardenPlantsNew: "Zorg dat je eerste tuin echt leeft.",
        gardenPlantsDone: "Ten minste één tuin heeft planten.",
        openProfile: "Open profiel",
        openGardens: "Open tuinen",
        openEditor: "Open editor",
        openPlants: "Open planten",
        openTasks: "Open taken",
        openGreenhouses: "Open serres",
        openHarvest: "Open oogst",
        aiHeadline: "Je tuin is klaar. Vraag de AI-coach om de volgende zet.",
        aiReward: "Nu draait de kaart over naar slimme AI-stappen.",
        aiTip1: "Vraag om een slim plan voor je volgende tuinwerk.",
        aiTip2: "Laat AI een plantadvies of combinatie voorstellen.",
        aiTip3: "Vraag om een check van indeling, ruimte en balans.",
        aiTip4: "Gebruik AI om je komende week slim in te delen.",
        aiAction1: "Open coach",
        aiAction2: "Open planten",
        aiAction3: "Open editor",
        aiAction4: "Open taken",
        aiLabel1: "AI tuincoach",
        aiLabel2: "Slimme planttips",
        aiLabel3: "Tuinanalyse",
        aiLabel4: "Weer & planning",
        stepsWord: "stappen",
    },
};

const getCopy = (lang) => COPY[lang] || COPY.en;

export function buildJourneyTrack({ user, gardens = [], fields = [], plants = [], structures = [], lang = "en" }) {
    const c = getCopy(lang);
    const steps = [
        { key: "profile", icon: "👤", label: c.profileLabel, done: !!user, helper: user ? c.profileDone(user.name) : c.profileNew },
        { key: "garden", icon: "🌿", label: c.gardenLabel, done: gardens.length > 0, helper: gardens.length > 0 ? c.gardenDone(gardens.length) : c.gardenNew },
        { key: "layout", icon: "🛏️", label: c.layoutLabel, done: fields.length > 0, helper: fields.length > 0 ? c.layoutDone(fields.length) : c.layoutNew },
        { key: "plants", icon: "🌱", label: c.plantLabel, done: plants.length > 0, helper: plants.length > 0 ? c.plantDone(plants.length) : c.plantNew },
    ];
    const completed = steps.filter(step => step.done).length;
    const progress = Math.round((completed / steps.length) * 100);
    const nextStep = steps.find(step => !step.done) || null;
    const allOpen = progress === 100;
    const tokens = gardens.length === 0 ? ["🪴", "🌱", "🧺"] : fields.length === 0 ? ["🛏️", "🪴", "🌿"] : plants.length === 0 ? ["🥕", "🍅", "🌽"] : ["🌿", "🥕", "🍓", "🌼"];
    return {
        steps,
        completed,
        progress,
        nextStep,
        tokens,
        headline: allOpen ? c.profileTitleDone : c.profileTitleOpen,
        subtitle: allOpen ? c.profileSubtitleDone : c.profileSubtitleOpen,
        reward: allOpen ? c.profileRewardDone : (nextStep?.key === "garden" ? c.rewardGarden : nextStep?.key === "layout" ? c.rewardLayout : nextStep?.key === "plants" ? c.rewardPlant : c.profileRewardOpen),
    };
}

export function buildProfileJourney({ user, gardens = [], fields = [], plants = [], tasks = [], lang = "en" }) {
    const c = getCopy(lang);
    const steps = [
        { key: "name", icon: "✍️", label: c.profileNameLabel, done: !!user?.name, helper: user?.name ? c.profileDone(user.name) : c.profileNew },
        { key: "email", icon: "📧", label: c.emailLabel, done: !!user?.email, helper: user?.email ? c.emailDone : c.emailNew },
        { key: "style", icon: "🎨", label: c.styleLabel, done: !!user?.avatar && !!user?.color, helper: user?.avatar ? c.styleDone : c.styleNew },
        { key: "garden", icon: "🌿", label: c.firstGardenLabel, done: gardens.length > 0, helper: gardens.length > 0 ? c.firstGardenDone(gardens.length) : c.firstGardenNew },
        { key: "bed", icon: "🛏️", label: c.bedLabel, done: fields.length > 0, helper: fields.length > 0 ? c.bedDone(fields.length) : c.bedNew },
        { key: "plant", icon: "🌱", label: c.plantDoneLabel, done: plants.length > 0, helper: plants.length > 0 ? c.plantDoneReady(plants.length) : c.plantDoneNew },
        { key: "task", icon: "✅", label: c.taskLabel, done: tasks.length > 0, helper: tasks.length > 0 ? c.taskDone(tasks.length) : c.taskNew },
    ];
    const completed = steps.filter(step => step.done).length;
    const progress = Math.round((completed / steps.length) * 100);
    const nextStep = steps.find(step => !step.done) || null;
    return { steps, completed, progress, nextStep, tokens: ["👤", "🌿", "🛏️", "🌱", "✅"], headline: progress >= 100 ? c.profileTitleDone : c.profileTitleOpen, subtitle: progress >= 100 ? c.profileSubtitleDone : c.profileSubtitleOpen, reward: progress >= 100 ? c.profileRewardDone : c.profileRewardOpen };
}

export function buildUserQuestProgress({ user, gardens = [], fields = [], structures = [], plants = [], tasks = [], lang = "en" }) {
    const c = getCopy(lang);
    const settings = user?.settings || {};
    const hasGarden = gardens.length > 0;
    const hasField = fields.length > 0;
    const hasStructure = structures.length > 0;
    const hasPlant = plants.length > 0;
    const hasAssignedPlant = plants.some(plant => plant.field_id || plant.struct_id);
    const hasTask = tasks.length > 0;
    const hasHarvestDate = plants.some(plant => !!plant.harvest_date);
    const hasGardenWithPlants = gardens.some(garden => plants.some(plant => plant.garden_id === garden.id));
    const steps = [
        { key: "profile_name", icon: "✍️", label: c.profileNameLabel, done: !!user?.name, route: "account", actionLabel: c.openProfile, helper: user?.name ? c.profileDone(user.name) : c.profileNew },
        { key: "email", icon: "📧", label: c.emailLabel, done: !!user?.email, route: "account", actionLabel: c.openProfile, helper: user?.email ? c.emailDone : c.emailNew },
        { key: "email_verified", icon: "✅", label: c.emailVerifiedLabel, done: !!settings.email_verified || !!settings.email_confirmed, route: "account", actionLabel: c.emailVerifiedLabel, helper: (settings.email_verified || settings.email_confirmed) ? c.emailDone : c.emailVerifiedNew, actionKind: "confirm_email" },
        { key: "style", icon: "🎨", label: c.styleLabel, done: !!user?.avatar && !!user?.color, route: "account", actionLabel: c.styleLabel, helper: user?.avatar ? c.styleDone : c.styleNew },
        { key: "garden", icon: "🌿", label: c.firstGardenLabel, done: hasGarden, route: "gardens", actionLabel: c.openGardens, helper: hasGarden ? c.firstGardenDone(gardens.length) : c.firstGardenNew },
        { key: "garden_open", icon: "🗺️", label: c.openGardenLabel, done: hasGarden && !!gardens[0], route: "gardens", actionLabel: c.openGardens, helper: hasGarden ? c.openGardenDone : c.openGardenNew },
        { key: "field", icon: "🛏️", label: c.bedLabel, done: hasField, route: "editor", actionLabel: c.openEditor, helper: hasField ? c.bedDone(fields.length) : c.bedNew },
        { key: "structure", icon: "🏡", label: c.structureLabel, done: hasStructure, route: "greenhouses", actionLabel: c.openGreenhouses, helper: hasStructure ? c.structureDone : c.structureNew },
        { key: "plant", icon: "🌱", label: c.plantDoneLabel, done: hasPlant, route: "plants", actionLabel: c.openPlants, helper: hasPlant ? c.plantDoneReady(plants.length) : c.plantDoneNew },
        { key: "assign", icon: "🔗", label: c.assignLabel, done: hasAssignedPlant, route: "plants", actionLabel: c.assignLabel, helper: hasAssignedPlant ? c.assignDone : c.assignNew },
        { key: "task", icon: "📋", label: c.taskLabel, done: hasTask, route: "tasks", actionLabel: c.openTasks, helper: hasTask ? c.taskDone(tasks.length) : c.taskNew },
        { key: "harvest", icon: "🧺", label: c.harvestLabel, done: hasHarvestDate, route: "plants", actionLabel: c.openHarvest, helper: hasHarvestDate ? c.harvestDone : c.harvestNew },
        { key: "garden_plants", icon: "🌼", label: c.gardenPlantsLabel, done: hasGardenWithPlants, route: "gardens", actionLabel: c.openGardens, helper: hasGardenWithPlants ? c.gardenPlantsDone : c.gardenPlantsNew },
    ];
    const completed = steps.filter(step => step.done).length;
    const progress = Math.round((completed / steps.length) * 100);
    const nextStep = steps.find(step => !step.done) || null;
    const aiSteps = [
        { key: "ai_tip_1", icon: "🧠", label: c.aiLabel1, done: true, helper: c.aiTip1, route: "dev", actionLabel: c.aiAction1 },
        { key: "ai_tip_2", icon: "✨", label: c.aiLabel2, done: true, helper: c.aiTip2, route: "plants", actionLabel: c.aiAction2 },
        { key: "ai_tip_3", icon: "📐", label: c.aiLabel3, done: true, helper: c.aiTip3, route: "editor", actionLabel: c.aiAction3 },
        { key: "ai_tip_4", icon: "🌦️", label: c.aiLabel4, done: true, helper: c.aiTip4, route: "tasks", actionLabel: c.aiAction4 },
    ];
    return {
        steps: progress >= 100 ? aiSteps : steps,
        completed,
        progress,
        nextStep: progress >= 100 ? aiSteps[0] : nextStep,
        tokens: progress >= 100 ? ["🧠", "✨", "📐", "🌦️"] : ["👤", "🌿", "🛏️", "🏡", "🌱", "🔗", "📋", "🧺"],
        headline: progress >= 100 ? c.aiHeadline : c.profileTitleOpen,
        subtitle: progress >= 100 ? c.profileSubtitleDone : c.profileSubtitleOpen,
        reward: progress >= 100 ? c.aiReward : c.profileRewardOpen,
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
    lang = "en",
}) {
    const c = getCopy(lang);
    const doneCount = steps.filter(step => step.done).length;
    const totalCount = Math.max(steps.length, 1);
    const displayProgress = Math.max(0, Math.min(100, Math.round(progress)));
    const isComplete = displayProgress >= 100;
    const nextBanner = nextStep || null;
    const ringDegrees = displayProgress * 3.6;

    return (
        <div style={{ position: "relative", overflow: "hidden", border: `1px solid ${T.borderSoft}`, borderRadius: 24, padding: 20, background: isComplete ? "linear-gradient(180deg, #FFF9ED 0%, #F2F8E5 100%)" : "linear-gradient(180deg, rgba(255,253,248,0.98) 0%, rgba(243,248,235,0.98) 100%)", boxShadow: "0 18px 40px rgba(20,18,14,0.08)", display: "flex", flexDirection: "column", gap: 16 }}>
            <div aria-hidden="true" style={{ position: "absolute", inset: "-36px -36px auto auto", width: 180, height: 180, borderRadius: "50%", background: isComplete ? "radial-gradient(circle, rgba(201,161,67,0.18) 0%, rgba(201,161,67,0.06) 44%, transparent 72%)" : "radial-gradient(circle, rgba(42,90,17,0.14) 0%, rgba(42,90,17,0.04) 44%, transparent 72%)", pointerEvents: "none" }} />
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, flexWrap: "wrap", position: "relative" }}>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <div style={{ width: 62, height: 62, borderRadius: 20, background: isComplete ? "linear-gradient(180deg, #E9D08C 0%, #D0A44A 100%)" : "linear-gradient(180deg, #E7F2D8 0%, #BFD99B 100%)", border: `1px solid ${isComplete ? "rgba(173,131,43,0.28)" : "rgba(42,90,17,0.14)"}`, boxShadow: "0 10px 20px rgba(20,18,14,0.10)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>
                        {isComplete ? "🏆" : "🌿"}
                    </div>
                    <div>
                        <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: 1, textTransform: "uppercase", color: T.primary }}>{headerLabel}</div>
                        <h3 style={{ margin: "4px 0 6px", fontSize: 22, fontWeight: 900, fontFamily: "Fraunces, serif", color: T.text }}>{title}</h3>
                        {subtitle && <div style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.65, maxWidth: 720 }}>{subtitle}</div>}
                    </div>
                </div>
                {action && <div style={{ alignSelf: "flex-start" }}>{action}</div>}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 16, alignItems: "center" }}>
                <div style={{ width: 74, height: 74, borderRadius: "50%", background: `conic-gradient(${T.primary} 0deg ${ringDegrees}deg, ${T.borderLight} ${ringDegrees}deg 360deg)`, display: "grid", placeItems: "center", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.68), 0 10px 22px rgba(20,18,14,0.08)" }}>
                    <div style={{ width: 54, height: 54, borderRadius: "50%", background: T.surface, display: "grid", placeItems: "center", fontWeight: 900, color: T.text, fontFamily: "Fraunces, serif" }}>
                        {displayProgress}%
                    </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ height: 14, background: "rgba(255,255,255,0.75)", border: `1px solid ${T.borderSoft}`, borderRadius: 999, overflow: "hidden", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.04)" }}>
                        <div style={{ width: `${displayProgress}%`, height: "100%", borderRadius: 999, background: isComplete ? "linear-gradient(90deg, #C9A13B 0%, #DDBB68 100%)" : "linear-gradient(90deg, #2A5A11 0%, #7FAF46 100%)", transition: "width 0.2s ease", boxShadow: "0 2px 10px rgba(42,90,17,0.20)" }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", fontSize: 12, color: T.textMuted }}>
                        <span>{c.progressText(displayProgress, doneCount, totalCount)}</span>
                        <span style={{ fontWeight: 800, color: isComplete ? "#9B6C13" : T.textSub }}>{reward || c.profileRewardOpen}</span>
                    </div>
                </div>
            </div>

            {tokens.length > 0 && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {tokens.map((token, idx) => (
                        <span key={`${token}-${idx}`} style={{ minWidth: 40, height: 40, padding: "0 12px", borderRadius: 999, display: "inline-flex", alignItems: "center", justifyContent: "center", background: isComplete ? "rgba(255,255,255,0.84)" : T.surface, border: `1px solid ${T.borderSoft}`, boxShadow: "0 6px 14px rgba(20,18,14,0.05)", fontSize: 18 }}>{token}</span>
                    ))}
                </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10 }}>
                {steps.map(step => (
                    <div key={step.key} style={{ position: "relative", padding: "13px 14px 12px 16px", borderRadius: 18, border: `1px solid ${step.done ? "rgba(42,90,17,0.18)" : T.borderSoft}`, background: step.done ? "linear-gradient(180deg, rgba(228,240,214,0.95) 0%, rgba(255,255,255,0.90) 100%)" : "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(249,245,238,0.96) 100%)", boxShadow: step.done ? "0 10px 20px rgba(42,90,17,0.06)" : "0 8px 18px rgba(20,18,14,0.05)", display: "flex", flexDirection: "column", gap: 6, minHeight: 98 }}>
                        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, borderTopLeftRadius: 18, borderBottomLeftRadius: 18, background: step.done ? "linear-gradient(180deg, #2A5A11 0%, #84B14C 100%)" : "linear-gradient(180deg, rgba(31,46,26,0.18) 0%, rgba(31,46,26,0.08) 100%)" }} />
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontSize: 18, width: 30, height: 30, display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: 12, background: step.done ? T.primaryBg : T.surfaceAlt }}>{step.icon}</span>
                                <span style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{step.label}</span>
                            </div>
                            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.5, textTransform: "uppercase", color: step.done ? T.primary : T.textMuted }}>{step.done ? "klaar" : "open"}</span>
                        </div>
                        {step.helper && <div style={{ fontSize: 12, lineHeight: 1.5, color: T.textMuted }}>{step.helper}</div>}
                        {onStepAction && !step.done && (step.route || step.actionKind) && (
                            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
                                <button type="button" onClick={() => onStepAction(step)} style={{ border: `1px solid ${T.primaryBg}`, background: T.surface, color: T.primary, borderRadius: T.radiusRound, padding: "6px 10px", fontSize: 11, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                                    {step.actionLabel || c.actionDefault}
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {nextBanner ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", padding: "14px 15px", borderRadius: 20, background: isComplete ? "linear-gradient(180deg, rgba(201,161,59,0.12) 0%, rgba(255,255,255,0.94) 100%)" : "rgba(255,255,255,0.82)", border: `1px dashed ${isComplete ? "rgba(201,161,59,0.52)" : "rgba(42,90,17,0.28)"}`, boxShadow: "0 10px 24px rgba(20,18,14,0.05)" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.5, textTransform: "uppercase", color: T.primary }}>{c.nextMission}</div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{nextBanner.icon} {nextBanner.label}</div>
                    </div>
                    <div style={{ fontSize: 12, color: T.textMuted, textAlign: "right", maxWidth: 280 }}>{nextBanner.helper}</div>
                </div>
            ) : (
                <div style={{ padding: "14px 15px", borderRadius: 20, background: "linear-gradient(180deg, rgba(201,161,59,0.12) 0%, rgba(255,255,255,0.94) 100%)", border: "1px solid rgba(201,161,59,0.35)", boxShadow: "0 10px 24px rgba(20,18,14,0.05)", display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.5, textTransform: "uppercase", color: "#9B6C13" }}>{c.allDone}</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{c.allDoneTitle}</div>
                    <div style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.5 }}>{reward || c.allDoneText}</div>
                </div>
            )}
        </div>
    );
}
