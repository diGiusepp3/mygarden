import React, { useState } from "react";
import { T } from "../theme.js";

export function StatCard({ icon, label, value, color, sub, onClick }) {
    const [hov, setHov] = useState(false);
    return (
        <div onClick={onClick} style={{ background:T.surface, border:`1px solid ${T.border}`, borderTop:`3px solid ${color}`, borderRadius:T.r, padding:"16px 18px", cursor:onClick?"pointer":"default", boxShadow:hov&&onClick?T.shMd:T.sh, transform:hov&&onClick?"translateY(-2px)":"none", transition:"all 0.15s" }}
             onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                <span style={{ fontSize:22 }}>{icon}</span>
                <span style={{ fontSize:11, fontWeight:700, color:T.textMuted, textTransform:"uppercase", letterSpacing:0.5 }}>{label}</span>
            </div>
            <div style={{ fontSize:28, fontWeight:900, color, fontFamily:"Fraunces, serif", lineHeight:1 }}>{value}</div>
            {sub && <div style={{ fontSize:11, color:T.textMuted, marginTop:4 }}>{sub}</div>}
        </div>
    );
}
