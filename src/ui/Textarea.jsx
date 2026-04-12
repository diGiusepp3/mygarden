import React, { useState } from "react";
import { T } from "../theme.js";

export function Textarea({ label, value, onChange, placeholder, rows=3, hint }) {
    const [foc, setFoc] = useState(false);
    return (
        <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            {label && <label style={{ fontSize:11, fontWeight:700, color:T.textSub, letterSpacing:0.5, textTransform:"uppercase" }}>{label}</label>}
            <textarea value={value ?? ""} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows}
                      style={{ fontFamily:"inherit", fontSize:13, color:T.text, background:T.surface, border:`1.5px solid ${foc?T.primary:T.border}`, borderRadius:T.rs, padding:"8px 11px", outline:"none", resize:"vertical", transition:"border 0.15s" }}
                      onFocus={() => setFoc(true)} onBlur={() => setFoc(false)} />
            {hint && <span style={{ fontSize:11, color:T.textMuted }}>{hint}</span>}
        </div>
    );
}
