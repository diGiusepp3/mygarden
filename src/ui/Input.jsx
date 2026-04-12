import React, { useState } from "react";
import { T } from "../theme.js";

export function Input({ label, value, onChange, type="text", placeholder, required, style, min, max, step, hint, disabled=false }) {
    const [foc, setFoc] = useState(false);
    return (
        <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            {label && <label style={{ fontSize:11, fontWeight:700, color:T.textSub, letterSpacing:0.5, textTransform:"uppercase" }}>{label}{required&&<span style={{color:T.danger}}> *</span>}</label>}
            <input type={type} value={value ?? ""} onChange={e=>onChange(e.target.value)} placeholder={placeholder} required={required} min={min} max={max} step={step} disabled={disabled}
                   style={{ fontFamily:"inherit", fontSize:13, color:T.text, background:disabled?T.surfaceAlt:T.surface, border:`1.5px solid ${foc?T.primary:T.border}`, borderRadius:T.rs, padding:"8px 11px", outline:"none", transition:"border 0.15s", cursor:disabled?"not-allowed":"auto", ...style }}
                   onFocus={() => setFoc(true)} onBlur={() => setFoc(false)} />
            {hint && <span style={{ fontSize:11, color:T.textMuted }}>{hint}</span>}
        </div>
    );
}
