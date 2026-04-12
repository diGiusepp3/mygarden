import React, { useState } from "react";
import { T } from "../theme.js";

export function Sel({ label, value, onChange, options, required, style }) {
    const [foc, setFoc] = useState(false);
    return (
        <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            {label && <label style={{ fontSize:11, fontWeight:700, color:T.textSub, letterSpacing:0.5, textTransform:"uppercase" }}>{label}{required&&<span style={{color:T.danger}}> *</span>}</label>}
            <select value={value ?? ""} onChange={e=>onChange(e.target.value)} required={required}
                    style={{ fontFamily:"inherit", fontSize:13, color:T.text, background:T.surface, border:`1.5px solid ${foc?T.primary:T.border}`, borderRadius:T.rs, padding:"8px 30px 8px 11px", outline:"none", appearance:"none", backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%235E5955'/%3E%3C/svg%3E")`, backgroundRepeat:"no-repeat", backgroundPosition:"right 10px center", transition:"border 0.15s", ...style }}
                    onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}>
                {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
            </select>
        </div>
    );
}
