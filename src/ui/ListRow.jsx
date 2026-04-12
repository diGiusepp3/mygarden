import React from "react";
import { T } from "../theme.js";
import { Badge } from "./Badge.jsx";

export function ListRow({ icon, title, meta, status, actions, hint, accent, actionSlot }) {
    return (
        <div style={{
            display:"flex",
            padding:"14px 16px",
            background:T.surfaceSoft,
            border:`1px solid ${T.borderSoft}`,
            borderRadius:T.radiusLg,
            boxShadow:T.sh,
            alignItems:"center",
            gap:14,
            ...accent
        }}>
            {icon && <div style={{
                width:42,
                height:42,
                borderRadius:T.radiusLg,
                background:T.surfaceAlt,
                display:"flex",
                alignItems:"center",
                justifyContent:"center",
                fontSize:20
            }}>{icon}</div>}
            <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"baseline", gap:8, flexWrap:"wrap" }}>
                    <div style={{ fontSize:15, fontWeight:800, color:T.text, fontFamily:"Fraunces, serif" }}>{title}</div>
                    {meta && <div style={{ fontSize:11, color:T.textMuted }}>{meta}</div>}
                    {status && <Badge color={status.color} bg={status.bg}>{status.label}</Badge>}
                </div>
                {hint && <div style={{ fontSize:12, color:T.textSub, marginTop:4 }}>{hint}</div>}
            </div>
            {(actions || actionSlot) && (
                <div style={{ display:"flex", gap:6, flexWrap:"wrap", justifyContent:"flex-end" }}>
                    {actions && actions.map((act, idx) => <span key={idx}>{act}</span>)}
                    {actionSlot}
                </div>
            )}
        </div>
    );
}
