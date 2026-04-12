import React from "react";
import { T } from "../theme.js";

const BED_SHAPES = [
    { v:"rect",   label:"Rechthoek", d:<rect x="2" y="4" width="20" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/> },
    { v:"circle", label:"Cirkel",    d:<ellipse cx="12" cy="12" rx="10" ry="8" fill="none" stroke="currentColor" strokeWidth="2"/> },
    { v:"semi_n", label:"Halve ↑",   d:<path d="M 2 20 A 10 16 0 0 0 22 20 Z" fill="none" stroke="currentColor" strokeWidth="2"/> },
    { v:"semi_s", label:"Halve ↓",   d:<path d="M 2 4 A 10 16 0 0 1 22 4 Z" fill="none" stroke="currentColor" strokeWidth="2"/> },
    { v:"semi_e", label:"Halve →",   d:<path d="M 2 4 A 20 8 0 0 1 2 20 Z" fill="none" stroke="currentColor" strokeWidth="2"/> },
    { v:"semi_w", label:"Halve ←",   d:<path d="M 22 4 A 20 8 0 0 0 22 20 Z" fill="none" stroke="currentColor" strokeWidth="2"/> },
];

export function BedShapePicker({ value, onChange }) {
    return (
        <div>
            <div style={{ fontSize:11, fontWeight:700, color:T.textSub, letterSpacing:0.5, textTransform:"uppercase", marginBottom:7 }}>Vorm</div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                {BED_SHAPES.map(opt => {
                    const active = (value||"rect") === opt.v;
                    return (
                        <button key={opt.v} title={opt.label} onClick={()=>onChange(opt.v)}
                            style={{ width:42, height:36, border:`2px solid ${active?T.primary:T.border}`, borderRadius:T.radiusSm, background:active?T.primaryBg:T.surface, cursor:"pointer", color:active?T.primary:T.textMuted, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:2, padding:2 }}>
                            <svg width="22" height="22" viewBox="0 0 24 24">{opt.d}</svg>
                            <span style={{ fontSize:8, fontFamily:"inherit", lineHeight:1 }}>{opt.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
