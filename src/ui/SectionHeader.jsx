import React from "react";
import { T } from "../theme.js";

export function SectionHeader({ title, sub }) {
    return (
        <div style={{ display:"flex", alignItems:"baseline", gap:10, marginBottom:12 }}>
            <h2 style={{ margin:0, fontSize:16, fontWeight:800, color:T.text, fontFamily:"Fraunces, serif" }}>{title}</h2>
            {sub && <span style={{ fontSize:12, color:T.textMuted }}>{sub}</span>}
        </div>
    );
}
