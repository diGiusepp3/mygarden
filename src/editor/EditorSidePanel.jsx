import { useState } from "react";
import { Btn } from "../ui/Btn.jsx";
import { Badge } from "../ui/Badge.jsx";
import { Card } from "../ui/Card.jsx";
import { T } from "../theme.js";
import { LANG } from "../translations.js";
import { FIELD_LABEL_K, STRUCT_LABEL_K, STRUCT_ICONS, ZONE_LABEL_K, ZONE_ICONS } from "../constants.js";
import { polygonArea } from "../helpers.js";

/**
 * Rechterpaneel van de garden editor.
 * Toont een gefilterde lijst van beds, structures en zones.
 * Wanneer er een item geselecteerd is, wordt dit paneel vervangen
 * door het edit formulier (doorgegeven als children).
 */
export function EditorSidePanel({ fields, structures, zones, selId, selKind, setSelId, setSelKind, lang, children }) {
    const [panelFilter, setPanelFilter] = useState("all");

    // Als er een item geselecteerd is en editForm aanwezig: toon het edit formulier
    if (children) {
        return (
            <Card style={{ padding:14, position:"sticky", top:12, alignSelf:"start", maxHeight:"calc(100vh - 140px)", overflow:"auto" }}>
                {children}
            </Card>
        );
    }

    const panelFields  = panelFilter === "all" || panelFilter === "fields" ? fields : [];
    const panelStructs = panelFilter === "all" || panelFilter === "structs" || panelFilter === "greenhouses" ? structures : [];
    const panelZones   = panelFilter === "all" || panelFilter === "zones" ? zones : [];

    return (
        <Card style={{ padding:14, position:"sticky", top:12, alignSelf:"start", maxHeight:"calc(100vh - 140px)", overflow:"auto" }}>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                <div>
                    <div style={{ fontSize:12, fontWeight:800, color:T.textMuted, textTransform:"uppercase", letterSpacing:0.5 }}>Context</div>
                    <div style={{ fontSize:15, fontWeight:900, color:T.text, fontFamily:"Fraunces, serif" }}>Objects</div>
                    <div style={{ fontSize:11, color:T.textMuted }}>{fields.length} beds · {structures.length} structures · {zones.length} zones</div>
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {["all","fields","structs","greenhouses","zones"].map(k => (
                        <Btn key={k} size="sm" variant={panelFilter === k ? "primary" : "secondary"} onClick={() => setPanelFilter(k)} style={{ flex:"1 1 96px", justifyContent:"center" }}>
                            {k === "all" ? "All" : k === "fields" ? "Beds" : k === "structs" ? "Structs" : k === "greenhouses" ? "GH" : "Zones"}
                        </Btn>
                    ))}
                </div>
                <div style={{ display:"grid", gap:10 }}>
                    {panelFields.length > 0 && (
                        <div>
                            <div style={{ fontSize:11, fontWeight:800, color:T.textMuted, textTransform:"uppercase", letterSpacing:0.5, marginBottom:6 }}>Beds</div>
                            <div style={{ display:"grid", gap:6 }}>
                                {panelFields.map(f => (
                                    <button key={f.id} onClick={() => { setSelId(f.id); setSelKind("field"); }} style={{ textAlign:"left", border:`1px solid ${selId===f.id&&selKind==="field"?T.primary:T.border}`, background:selId===f.id&&selKind==="field"?T.primaryBg:T.surface, borderRadius:T.rs, padding:"8px 10px", cursor:"pointer", fontFamily:"inherit" }}>
                                        <div style={{ fontSize:12, fontWeight:800, color:T.text }}>{f.name}</div>
                                        <div style={{ fontSize:11, color:T.textMuted }}>{LANG[lang]?.[FIELD_LABEL_K[f.type]] || f.type} · {f.width} × {f.height}m</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {panelStructs.length > 0 && (
                        <div>
                            <div style={{ fontSize:11, fontWeight:800, color:T.textMuted, textTransform:"uppercase", letterSpacing:0.5, marginBottom:6 }}>Structures</div>
                            <div style={{ display:"grid", gap:6 }}>
                                {panelStructs.map(st => (
                                    <button key={st.id} onClick={() => { setSelId(st.id); setSelKind("struct"); }} style={{ textAlign:"left", border:`1px solid ${selId===st.id&&selKind==="struct"?T.accent:T.border}`, background:selId===st.id&&selKind==="struct"?T.accentBg:T.surface, borderRadius:T.rs, padding:"8px 10px", cursor:"pointer", fontFamily:"inherit" }}>
                                        <div style={{ display:"flex", justifyContent:"space-between", gap:8, alignItems:"start" }}>
                                            <div>
                                                <div style={{ fontSize:12, fontWeight:800, color:T.text }}>{STRUCT_ICONS[st.type] || "🏗️"} {st.name}</div>
                                                <div style={{ fontSize:11, color:T.textMuted }}>{LANG[lang]?.[STRUCT_LABEL_K[st.type]] || st.type} · {st.width} × {st.height}m</div>
                                            </div>
                                            {st.linked_field_id && <Badge color={T.accent} bg={T.accentBg}>linked</Badge>}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {panelZones.length > 0 && (
                        <div>
                            <div style={{ fontSize:11, fontWeight:800, color:T.textMuted, textTransform:"uppercase", letterSpacing:0.5, marginBottom:6 }}>Zones</div>
                            <div style={{ display:"grid", gap:6 }}>
                                {panelZones.map(z => (
                                    <button key={z.id} onClick={() => { setSelId(z.id); setSelKind("zone"); }} style={{ textAlign:"left", border:`1px solid ${selId===z.id&&selKind==="zone"?T.primary:T.border}`, background:selId===z.id&&selKind==="zone"?T.primaryBg:T.surface, borderRadius:T.rs, padding:"8px 10px", cursor:"pointer", fontFamily:"inherit" }}>
                                        <div style={{ fontSize:12, fontWeight:800, color:T.text }}>{ZONE_ICONS[z.type] || "🌿"} {z.name}</div>
                                        <div style={{ fontSize:11, color:T.textMuted }}>{LANG[lang]?.[ZONE_LABEL_K[z.type]] || z.type} · {polygonArea(z.points || []).toFixed(1)}m²</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}
