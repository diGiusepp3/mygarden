import { T } from "../theme.js";
import { LANG } from "../translations.js";
import { FIELD_LABEL_K, FIELD_COLORS, STRUCT_LABEL_K, STRUCT_ICONS, ZONE_LABEL_K, ZONE_ICONS } from "../constants.js";

/**
 * Kleurenlegenda onderaan de garden editor.
 * Toont welke kleuren en iconen bij welke types horen.
 */
export function EditorLegend({ fields, structures, zones, lang }) {
    if (!fields.length && !structures.length && !zones.length) return null;
    return (
        <div style={{ display:"flex", gap:10, flexWrap:"wrap", padding:"10px 4px 0" }}>
            {Object.entries(FIELD_LABEL_K).filter(([k]) => fields.some(f => f.type === k)).map(([k, lk]) => (
                <div key={k} style={{ display:"flex", alignItems:"center", gap:5 }}>
                    <div style={{ width:10, height:10, borderRadius:2, background:FIELD_COLORS[k], flexShrink:0 }}/>
                    <span style={{ fontSize:10, color:T.textSub }}>{LANG.en[lk]}</span>
                </div>
            ))}
            {Object.entries(STRUCT_LABEL_K).filter(([k]) => structures.some(s => s.type === k)).map(([k, lk]) => (
                <div key={k} style={{ display:"flex", alignItems:"center", gap:5 }}>
                    <span style={{ fontSize:11 }}>{STRUCT_ICONS[k]}</span>
                    <span style={{ fontSize:10, color:T.textSub }}>{LANG.en[lk]}</span>
                </div>
            ))}
            {Object.entries(ZONE_LABEL_K).filter(([k]) => zones.some(z => z.type === k)).map(([k, lk]) => (
                <div key={k} style={{ display:"flex", alignItems:"center", gap:5 }}>
                    <span style={{ fontSize:11 }}>{ZONE_ICONS[k]}</span>
                    <span style={{ fontSize:10, color:T.textSub }}>{LANG[lang]?.[lk] || LANG.en[lk] || k}</span>
                </div>
            ))}
        </div>
    );
}
