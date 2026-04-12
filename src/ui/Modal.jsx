import React from "react";
import { T } from "../theme.js";

export function Modal({ title, onClose, children, width=540 }) {
    return (
        <div style={{ position:"fixed", inset:0, background:"rgba(10,8,6,0.45)", backdropFilter:"blur(3px)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }} onClick={onClose}>
            <div style={{ background:T.surface, borderRadius:T.rl, width:"100%", maxWidth:width, maxHeight:"92vh", overflow:"auto", boxShadow:T.shLg }} onClick={e=>e.stopPropagation()}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 22px 16px", borderBottom:`1px solid ${T.border}`, position:"sticky", top:0, background:T.surface, zIndex:1 }}>
                    <h2 style={{ margin:0, fontSize:16, fontWeight:800, color:T.text, fontFamily:"Fraunces, serif" }}>{title}</h2>
                    <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", fontSize:18, color:T.textMuted, padding:"2px 6px", lineHeight:1, borderRadius:T.rs }}>✕</button>
                </div>
                <div style={{ padding:22 }}>{children}</div>
            </div>
        </div>
    );
}
