import { useEffect, useMemo, useRef, useState } from "react";
import { Btn } from "../ui/Btn.jsx";
import { Badge } from "../ui/Badge.jsx";
import { Card } from "../ui/Card.jsx";
import { EmptyState } from "../ui/EmptyState.jsx";
import { Input } from "../ui/Input.jsx";
import { Sel } from "../ui/Sel.jsx";
import { Textarea } from "../ui/Textarea.jsx";
import { T } from "../theme.js";
import { LANG } from "../i18n.js";
import { PLANT_LIB } from "../plantLibrary.js";
import { CATEGORIES, CAT_ICONS } from "../constants.js";
import { normalizeSearchText } from "../utils/text.js";
import { callAI } from "../api.js";

const useT = (lang) => (key) => LANG[lang]?.[key] ?? LANG.en[key] ?? key;
// SCREEN: DEV (Ollama plant generator)
// ----
const DEV_CATEGORIES = ["Vegetable","Leafy Green","Herb","Fruit","Legume","Root","Flower"];
const DEV_CATEGORY_LABEL_K = {
    Vegetable:"dev_category_vegetable",
    "Leafy Green":"dev_category_leafy_green",
    Herb:"dev_category_herb",
    Fruit:"dev_category_fruit",
    Legume:"dev_category_legume",
    Root:"dev_category_root",
    Flower:"dev_category_flower",
    Other:"dev_category_other",
};

function DevError({ msg }) {
    if (!msg) return null;
    return (
        <div style={{ background:"#FEE2E2", border:"1px solid #FCA5A5", borderRadius:T.radiusMd, padding:"12px 16px", color:"#991B1B", fontSize:13, marginBottom:16 }}>
            ? {msg}
        </div>
    );
}
function AiResult({ children, model }) {
    return (
        <Card style={{ padding:20, marginTop:16 }}>
            {model && <div style={{ fontSize:11, color:T.textMuted, marginBottom:10, display:"flex", alignItems:"center", gap:6 }}><span style={{ background:T.primaryBg, color:T.primary, borderRadius:99, padding:"2px 8px", fontWeight:700 }}>{model}</span></div>}
            {children}
        </Card>
    );
}

// ----
function DevCodexPlantBuilder({ lang = "en" }) {
    const t = useT(lang);
    const [category, setCategory] = useState("Vegetable");
    const [count, setCount]       = useState(8);
    const [brief, setBrief]       = useState(() => t("dev_prompt_placeholder") || "More easy-to-grow crops for a mixed kitchen garden.");
    const [varieties, setVarieties] = useState(() => t("dev_varieties_placeholder") || "Tomato, Cherry Tomato, Cluster Tomato");
    const [search, setSearch]     = useState("");
    const [library, setLibrary]   = useState([]);
    const [libraryLoading, setLibraryLoading] = useState(false);
    const [loading, setLoading]   = useState(false);
    const [result, setResult]     = useState(null);
    const [error, setError]       = useState(null);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                setLibraryLoading(true);
                const res = await fetch("/api/plants-library.php?limit=300");
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Could not load plant library");
                if (active) setLibrary(Array.isArray(data.plants) ? data.plants : []);
            } catch (e) {
                if (active) setError(e.message);
            } finally {
                if (active) setLibraryLoading(false);
            }
        })();
        return () => { active = false; };
    }, []);

    const presets = [
        { label: t("dev_presets_easy"), text: t("dev_presets_easy_text") },
        { label: t("dev_presets_pollinators"), text: t("dev_presets_pollinators_text") },
        { label: t("dev_presets_greenhouse"), text: t("dev_presets_greenhouse_text") },
        { label: t("dev_presets_autumn"), text: t("dev_presets_autumn_text") },
    ];
    const categoryOptions = DEV_CATEGORIES.map(value => ({ value, label: t(DEV_CATEGORY_LABEL_K[value]) || value }));

    async function handleGenerate() {
        setLoading(true);
        setResult(null);
        setError(null);
        try {
            const res = await fetch("/api/generate-plants.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ count, category, prompt: `${brief}\nExisting varieties to consider: ${varieties}` }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Server error");
            setResult(data);
            const refreshed = await fetch("/api/plants-library.php?limit=300");
            const refreshedData = await refreshed.json();
            if (refreshed.ok && Array.isArray(refreshedData.plants)) {
                setLibrary(refreshedData.plants);
            }
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div style={{ fontSize:13, color:T.textMuted, marginBottom:20, lineHeight:1.6 }}>
                {t("dev_intro")}
            </div>
            <Card style={{ padding:24, marginBottom:4 }}>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:14, alignItems:"end" }}>
                    <Sel label={t("dev_category")} value={category} onChange={v=>setCategory(v)} options={categoryOptions}/>
                    <Input label={t("dev_count")} type="number" value={count} min={1} max={30} onChange={e=>setCount(Number(e.target.value) || 1)}/>
                    <Btn variant="primary" onClick={handleGenerate} disabled={loading} style={{ minWidth:170, height:38, justifySelf:"start" }}>
                        {loading ? t("dev_generate_loading") : t("dev_generate")}
                    </Btn>
                </div>
                <div style={{ marginTop:14 }}>
                    <Input
                        label={t("dev_varieties")}
                        value={varieties}
                        onChange={setVarieties}
                        placeholder={t("dev_varieties_placeholder")}
                        hint={t("dev_varieties_hint")}
                    />
                </div>
                <div style={{ marginTop:14, display:"flex", gap:8, flexWrap:"wrap" }}>
                    {presets.map(p => (
                        <button
                            key={p.label}
                            onClick={() => setBrief(p.text)}
                            style={{
                                border:`1px solid ${T.borderSoft}`,
                                background:T.surfaceSoft,
                                color:T.text,
                                borderRadius:T.radiusRound,
                                padding:"7px 11px",
                                fontSize:12,
                                fontWeight:700,
                                cursor:"pointer",
                            }}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
                <div style={{ marginTop:14 }}>
                    <Textarea
                        label={t("dev_prompt")}
                        value={brief}
                        onChange={setBrief}
                        rows={4}
                        placeholder={t("dev_prompt_placeholder")}
                        hint={t("dev_prompt_hint")}
                    />
                </div>
            </Card>
            <Card style={{ padding:24, marginTop:16 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, marginBottom:12 }}>
                    <div>
                        <div style={{ fontSize:16, fontWeight:900, fontFamily:"Fraunces, serif", color:T.text }}>{t("dev_library_title")}</div>
                        <div style={{ fontSize:12, color:T.textMuted }}>
                            {libraryLoading ? t("dev_library_loading") : `${library.length} ${t("dev_library_found")}`}
                        </div>
                    </div>
                    <Input label={t("dev_library_search")} value={search} onChange={setSearch} placeholder={t("dev_library_search_placeholder")} />
                </div>
                <div style={{ maxHeight:420, overflow:"auto", borderTop:`1px solid ${T.border}`, paddingTop:12 }}>
                    {library
                        .filter(p => {
                            const q = normalizeSearchText(search);
                            if (!q) return true;
                            const hay = `${p.name} ${p.category} ${(p.varieties || []).join(" ")} ${p.description || ""}`;
                            return normalizeSearchText(hay).includes(q);
                        })
                        .slice(0, 80)
                        .map(item => (
                            <div key={item.id} style={{ padding:"10px 0", borderBottom:`1px solid ${T.borderLight}`, display:"flex", flexDirection:"column", gap:5 }}>
                                <div style={{ display:"flex", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
                                    <div style={{ fontWeight:800, color:T.text }}>{item.icon || "??"} {item.name}</div>
                                    <Badge color={T.primary} bg={T.primaryBg}>{t(DEV_CATEGORY_LABEL_K[item.category] || item.category) || item.category}</Badge>
                                </div>
                                <div style={{ fontSize:12, color:T.textMuted, lineHeight:1.5 }}>{item.description || t("dev_library_none")}</div>
                                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                                    {(item.varieties || []).map(v => <Badge key={v} color={T.textSub} bg={T.surfaceAlt}>{v}</Badge>)}
                                </div>
                            </div>
                        ))}
                </div>
            </Card>
            <DevError msg={error}/>
            {result && (
                <AiResult model={result.model}>
                    <div style={{ fontWeight:700, marginBottom:12, color:T.primary }}>
                        ? {result.saved ?? 0} {t("dev_library_saved")} · {result.updated ?? 0} {t("dev_library_updated")}
                    </div>
                    {Array.isArray(result.plants) && result.plants.map((p, i) => (
                        <div key={i} style={{ padding:"8px 0", borderBottom: i < result.plants.length-1 ? `1px solid ${T.border}` : "none", fontSize:13 }}>
                            <span style={{ fontWeight:600 }}>{p.name}</span>
                            {p.description ? <span style={{ color:T.textMuted, marginLeft:8 }}>{p.description}</span> : null}
                            {p.days_to_maturity ? <span style={{ color:T.textMuted, marginLeft:8 }}>?? {p.days_to_maturity}d</span> : null}
                        </div>
                    ))}
                </AiResult>
            )}
        </>
    );
}

// ----
function DevGardenAdvisor({ state }) {
    const uid = state.activeUserId;
    const myPlants  = forUser(state.plants, uid);
    const myGardens = forUser(state.gardens, uid);
    const [focus, setFocus] = useState("algemeen");
    const [loading, setLoading] = useState(false);
    const [result, setResult]   = useState(null);
    const [error, setError]     = useState(null);
    const FOCI = [
        { v:"algemeen",    label:"?? Algemeen" },
        { v:"bemesting",   label:"?? Bemesting" },
        { v:"ongedierte",  label:"?? Plagen & ziekten" },
        { v:"seizoen",     label:"?? Seizoensadvies" },
        { v:"watergeven",  label:"?? Water" },
    ];

    async function handleAdvise() {
        setLoading(true); setResult(null); setError(null);
        const plantNames = myPlants.slice(0,25).map(p => `${p.name}${p.quantity>1?" (x"+p.quantity+")":""}`).join(", ") || "geen planten nog";
        const gardenDesc = myGardens.length > 0 ? myGardens.map(g=>g.name).join(", ") : "1 tuin";
        const prompt = `Je bent een ervaren Belgische tuinadviseur. Mijn tuin (${gardenDesc}) bevat momenteel deze planten: ${plantNames}.

Geef me 5 concrete, praktische tips gefocust op: ${focus}.
Wees specifiek over mijn planten waar relevant. Geen algemene flauwekul.
Antwoord in het Nederlands. Gebruik een genummerde lijst.`;
        try {
            const data = await callAI(prompt);
            setResult(data);
        } catch(e) { setError(e.message); }
        finally { setLoading(false); }
    }

    return (
        <>
            <div style={{ fontSize:13, color:T.textMuted, marginBottom:20 }}>
                AI analyseert jouw tuin ({myPlants.length} planten) en geeft gepersonaliseerd advies.
            </div>
            <Card style={{ padding:24, marginBottom:4 }}>
                <div style={{ marginBottom:14 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:T.textSub, letterSpacing:0.5, textTransform:"uppercase", marginBottom:8 }}>Focus</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                        {FOCI.map(f => (
                            <PillFilter key={f.v} value={f.label} active={focus===f.v} onClick={()=>setFocus(f.v)}/>
                        ))}
                    </div>
                </div>
                <Btn variant="primary" onClick={handleAdvise} disabled={loading || myPlants.length===0} style={{ minWidth:180 }}>
                    {loading ? "? Analyseren..." : "?? Analyseer mijn tuin"}
                </Btn>
                {myPlants.length === 0 && <div style={{ fontSize:12, color:T.textMuted, marginTop:8 }}>Voeg eerst planten toe aan je tuin.</div>}
            </Card>
            <DevError msg={error}/>
            {result && (
                <AiResult model={result.model}>
                    <div style={{ fontSize:14, lineHeight:1.7, color:T.text, whiteSpace:"pre-wrap" }}>{result.response}</div>
                </AiResult>
            )}
        </>
    );
}

// ----
function DevCompanions({ state }) {
    const uid = state.activeUserId;
    const myPlants = forUser(state.plants, uid);
    const [plantName, setPlantName] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult]   = useState(null);
    const [error, setError]     = useState(null);

    // Autocomplete from user's plants + PLANT_LIB
    const suggestions = useMemo(() => {
        const q = normalizeSearchText(plantName);
        if (!q || q.length < 2) return [];
        const fromMine = myPlants.map(p=>p.name);
        const fromLib  = PLANT_LIB.flatMap(p => [p.name, ...(p.varieties || [])]);
        return [...new Set([...fromMine, ...fromLib])].filter(n => normalizeSearchText(n).includes(q)).slice(0,6);
    }, [plantName, myPlants]);

    async function handleCheck() {
        if (!plantName.trim()) return;
        setLoading(true); setResult(null); setError(null);
        const prompt = `Je bent een tuinexpert. Geef compagnonsplanten advies voor: ${plantName}.

Geef:
1. Top 5 GOEDE gezelschapsplanten (met korte uitleg waarom)
2. Top 3 planten om NIET naast te zetten (met korte uitleg waarom)

Antwoord in het Nederlands. Wees praktisch en bondig.`;
        try {
            const data = await callAI(prompt);
            setResult(data);
        } catch(e) { setError(e.message); }
        finally { setLoading(false); }
    }

    return (
        <>
            <div style={{ fontSize:13, color:T.textMuted, marginBottom:20 }}>
                Zoek welke planten goed samengaan (of juist niet) via AI.
            </div>
            <Card style={{ padding:24, marginBottom:4 }}>
                <div style={{ position:"relative", marginBottom:16 }}>
                    <Input
                        label="Plant"
                        value={plantName}
                        onChange={e=>setPlantName(e.target.value)}
                        placeholder="bijv. Tomaat, Wortel, Basilicum..."
                        onKeyDown={e=>{ if(e.key==="Enter") handleCheck(); }}
                    />
                    {suggestions.length > 0 && (
                        <div style={{ position:"absolute", top:"100%", left:0, right:0, background:T.surface, border:`1px solid ${T.border}`, borderRadius:T.radiusMd, boxShadow:T.shMd, zIndex:20, marginTop:2 }}>
                            {suggestions.map(s => (
                                <div key={s} onClick={()=>{ setPlantName(s); }}
                                    style={{ padding:"8px 12px", cursor:"pointer", fontSize:13, borderBottom:`1px solid ${T.borderLight}` }}
                                    onMouseEnter={e=>e.currentTarget.style.background=T.surfaceAlt}
                                    onMouseLeave={e=>e.currentTarget.style.background=T.surface}>
                                    {s}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <Btn variant="primary" onClick={handleCheck} disabled={loading || !plantName.trim()} style={{ minWidth:180 }}>
                    {loading ? "? Opzoeken..." : "?? Check compagnons"}
                </Btn>
            </Card>
            <DevError msg={error}/>
            {result && (
                <AiResult model={result.model}>
                    <div style={{ fontSize:14, lineHeight:1.7, color:T.text, whiteSpace:"pre-wrap" }}>{result.response}</div>
                </AiResult>
            )}
        </>
    );
}

// ----
function DevSowCalendar() {
    const MONTHS = ["Januari","Februari","Maart","April","Mei","Juni","Juli","Augustus","September","Oktober","November","December"];
    const currentMonth = new Date().getMonth(); // 0-indexed
    const [month, setMonth]     = useState(String(currentMonth));
    const [extra, setExtra]     = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult]   = useState(null);
    const [error, setError]     = useState(null);

    async function handleGenerate() {
        setLoading(true); setResult(null); setError(null);
        const monthName = MONTHS[Number(month)];
        const extraPart = extra.trim() ? ` Ik focus op: ${extra}.` : "";
        const prompt = `Je bent een Belgische tuinkalender-expert (klimaatzone 8a). Maak een beknopte, praktische zaai- en tuinagenda voor de maand ${monthName}.${extraPart}

Structureer je antwoord als:
?? BINNENSHUIS ZAAIEN: [lijst]
?? BUITEN ZAAIEN / PLANTEN: [lijst]
?? VERPLANTEN / OOGSTEN: [lijst]
?? TIPS VOOR ${monthName.toUpperCase()}: [2-3 praktische tips]

Antwoord in het Nederlands. Wees specifiek met plantnamen.`;
        try {
            const data = await callAI(prompt);
            setResult(data);
        } catch(e) { setError(e.message); }
        finally { setLoading(false); }
    }

    return (
        <>
            <div style={{ fontSize:13, color:T.textMuted, marginBottom:20 }}>
                Genereer een maandelijkse zaai- en tuinagenda op basis van het Belgische klimaat.
            </div>
            <Card style={{ padding:24, marginBottom:4 }}>
                <div style={{ display:"flex", gap:16, flexWrap:"wrap", alignItems:"flex-end" }}>
                    <div style={{ flex:1, minWidth:160 }}>
                        <Sel label="Maand" value={month} onChange={v=>setMonth(v)} options={MONTHS.map((m,i)=>({ value:String(i), label:m }))}/>
                    </div>
                    <div style={{ flex:2, minWidth:200 }}>
                        <Input label="Focus (optioneel)" value={extra} onChange={e=>setExtra(e.target.value)} placeholder="bijv. groenten, kruiden, exoten..."/>
                    </div>
                </div>
                <div style={{ marginTop:16 }}>
                    <Btn variant="primary" onClick={handleGenerate} disabled={loading} style={{ minWidth:180 }}>
                        {loading ? "? Genereren..." : "?? Genereer zaaiplan"}
                    </Btn>
                </div>
            </Card>
            <DevError msg={error}/>
            {result && (
                <AiResult model={result.model}>
                    <div style={{ fontSize:14, lineHeight:1.8, color:T.text, whiteSpace:"pre-wrap" }}>{result.response}</div>
                </AiResult>
            )}
        </>
    );
}

// ----
function DevFreeChat() {
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult]   = useState(null);
    const [error, setError]     = useState(null);

    async function handleSend() {
        if (!prompt.trim()) return;
        setLoading(true); setResult(null); setError(null);
        try {
            const data = await callAI(prompt + "\n\nAntwoord in het Nederlands.");
            setResult(data);
        } catch(e) { setError(e.message); }
        finally { setLoading(false); }
    }

    return (
        <>
            <div style={{ fontSize:13, color:T.textMuted, marginBottom:20 }}>
                Stel elke tuingerelateerde vraag rechtstreeks aan de AI.
            </div>
            <Card style={{ padding:24, marginBottom:4 }}>
                <Textarea
                    label="Vraag / prompt"
                    value={prompt}
                    onChange={e=>setPrompt(e.target.value)}
                    placeholder="Bijv: Wat is het verschil tussen determinante en indeterminante tomaten?"
                    rows={4}
                />
                <div style={{ marginTop:12 }}>
                    <Btn variant="primary" onClick={handleSend} disabled={loading || !prompt.trim()} style={{ minWidth:160 }}>
                        {loading ? "? Nadenken..." : "?? Vraag stellen"}
                    </Btn>
                </div>
            </Card>
            <DevError msg={error}/>
            {result && (
                <AiResult model={result.model}>
                    <div style={{ fontSize:14, lineHeight:1.7, color:T.text, whiteSpace:"pre-wrap" }}>{result.response}</div>
                </AiResult>
            )}
        </>
    );
}

// ----
function DevKnowledgeBase({ lang }) {
    const t = useT(lang);
    const cards = [
        {
            badge: "1",
            title: t("dev_tests_soil_title"),
            subtitle: t("dev_tests_subtitle"),
            intro: t("dev_tests_soil_intro"),
            steps: [
                t("dev_tests_soil_step1"),
                t("dev_tests_soil_step2"),
                t("dev_tests_soil_step3"),
                t("dev_tests_soil_step4"),
                t("dev_tests_soil_step5"),
            ],
            note: t("dev_tests_soil_note"),
        },
        {
            badge: "2",
            title: t("dev_tests_moisture_title"),
            subtitle: t("dev_tests_moisture_subtitle"),
            intro: t("dev_tests_moisture_intro"),
            steps: [
                t("dev_tests_moisture_step1"),
                t("dev_tests_moisture_step2"),
                t("dev_tests_moisture_step3"),
                t("dev_tests_moisture_step4"),
            ],
            note: t("dev_tests_moisture_note"),
        },
    ];

    return (
        <div style={{ display:"grid", gap:16 }}>
            <Card style={{ padding:24 }}>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    <div style={{ fontSize:13, fontWeight:800, color:T.textMuted, textTransform:"uppercase", letterSpacing:0.6 }}>
                        {t("dev_tests_title")}
                    </div>
                    <div style={{ fontSize:22, fontWeight:900, fontFamily:"Fraunces, serif", color:T.text }}>
                        {t("dev_tests_soil_title")}
                    </div>
                    <div style={{ fontSize:13, color:T.textMuted, lineHeight:1.6 }}>
                        {t("dev_tests_subtitle")}
                    </div>
                </div>
            </Card>
            <Card style={{ padding:24 }}>
                <div style={{ display:"grid", gap:14 }}>
                    {cards.map(card => (
                        <div key={card.title} style={{ display:"grid", gap:10, padding:16, border:`1px solid ${T.borderSoft}`, borderRadius:18, background:T.surfaceSoft }}>
                            <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                                <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                                    <div style={{ width:28, height:28, borderRadius:999, display:"flex", alignItems:"center", justifyContent:"center", background:T.primaryBg, color:T.primary, fontSize:12, fontWeight:900 }}>{card.badge}</div>
                                    <div style={{ fontSize:16, fontWeight:900, color:T.text }}>{card.title}</div>
                                </div>
                                <div style={{ fontSize:12, color:T.textMuted, lineHeight:1.6 }}>{card.subtitle}</div>
                            </div>
                            <div style={{ fontSize:13, fontWeight:800, color:T.text }}>{card.intro}</div>
                            <div style={{ display:"grid", gap:8 }}>
                                {card.steps.map((step, idx) => (
                                    <div key={`${card.badge}-${idx}`} style={{ display:"flex", gap:12, alignItems:"flex-start", padding:12, border:`1px solid ${T.borderSoft}`, borderRadius:16, background:T.surface }}>
                                        <div style={{ width:28, height:28, flex:"0 0 28px", borderRadius:999, display:"flex", alignItems:"center", justifyContent:"center", background:T.primaryBg, color:T.primary, fontSize:12, fontWeight:900 }}>
                                            {idx + 1}
                                        </div>
                                        <div style={{ fontSize:13, lineHeight:1.6, color:T.text }}>{step}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ padding:12, borderRadius:16, background:T.accentBg, color:T.text, fontSize:12, lineHeight:1.6 }}>
                                {card.note}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}

// ----
export default function DevScreen({ state, dispatch, lang }) {
    const t = useT(lang);
    const [tab, setTab] = useState("plants");
    const TABS = [
        { id:"plants",   icon:"??", label:t("dev_tab_plants") },
        { id:"codex",    icon:"??", label:t("dev_tab_codex") },
        { id:"advisor",  icon:"??", label:t("dev_tab_advisor") },
        { id:"companions", icon:"??", label:t("dev_tab_companions") },
        { id:"calendar", icon:"??", label:t("dev_tab_calendar") },
        { id:"knowledge", icon:"??", label:t("dev_tab_knowledge") },
        { id:"chat",     icon:"??", label:t("dev_tab_chat") },
    ];

    return (
        <div style={{ padding:"32px 24px", maxWidth:760, margin:"0 auto" }}>
            <div style={{ marginBottom:24 }}>
                <div style={{ fontSize:24, fontWeight:900, fontFamily:"Fraunces, serif", color:T.primary, marginBottom:4 }}>
                    {t("dev_ai_dashboard")}
                </div>
                <div style={{ fontSize:13, color:T.textMuted }}>{t("dev_ai_subtitle")}</div>
            </div>

            {/* Tab bar */}
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:24, padding:"4px", background:T.surfaceAlt, borderRadius:T.radiusMd, border:`1px solid ${T.border}` }}>
                {TABS.map(t2 => (
                    <button key={t2.id} onClick={()=>setTab(t2.id)}
                        style={{ flex:"1 1 auto", padding:"8px 12px", border:"none", borderRadius:T.radiusSm, cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:tab===t2.id?700:500, background:tab===t2.id?T.surface:"transparent", color:tab===t2.id?T.primary:T.textMuted, boxShadow:tab===t2.id?T.sh:"none", transition:"all 0.15s" }}>
                        {t2.icon} {t2.label}
                    </button>
                ))}
            </div>

            {tab === "plants"     && <DevCodexPlantBuilder lang={lang}/>}
            {tab === "codex"      && <DevCodexPlantBuilder lang={lang}/>}
            {tab === "advisor"    && <DevGardenAdvisor state={state}/>}
            {tab === "companions" && <DevCompanions state={state}/>}
            {tab === "calendar"   && <DevSowCalendar/>}
            {tab === "knowledge"  && <DevKnowledgeBase lang={lang}/>}
            {tab === "chat"       && <DevFreeChat/>}
        </div>
    );
}

// ----
// APP ROOT
