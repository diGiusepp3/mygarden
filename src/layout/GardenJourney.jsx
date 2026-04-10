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
