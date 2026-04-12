import React from "react";
import { T } from "../theme.js";

export function EmptyState({ icon="🌱", title, subtitle, action }) {
    return (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12, padding:"60px 24px", textAlign:"center" }}>
            <div style={{ fontSize:52, filter:"saturate(0.8)" }}>{icon}</div>
            <h3 style={{ margin:0, fontSize:18, fontWeight:800, color:T.text, fontFamily:"Fraunces, serif" }}>{title}</h3>
            {subtitle && <p style={{ margin:0, fontSize:13, color:T.textMuted, maxWidth:300, lineHeight:1.6 }}>{subtitle}</p>}
            {action && <div style={{ marginTop:4 }}>{action}</div>}
        </div>
    );
}
