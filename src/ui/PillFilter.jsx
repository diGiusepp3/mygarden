import React, { useState } from "react";
import { T } from "../theme.js";

export function PillFilter({ value, active, onClick, color, bg }) {
    const [foc, setFoc] = useState(false);
    return (
        <button onClick={onClick} style={{
            padding:"7px 15px",
            borderRadius:999,
            border:`1.5px solid ${foc?(color||T.primary):active?(color||T.primary):T.borderSoft}`,
            background:active?(bg||T.primaryBg):T.surface,
            color:active?(color||T.primary):T.textSub,
            cursor:"pointer",
            fontSize:12,
            fontWeight:700,
            fontFamily:"inherit",
            transition:`all ${T.transitionFast}`,
            whiteSpace:"nowrap",
            outline:"none",
            boxShadow:foc?`0 0 0 2px ${(color||T.primary)}33`:active?"0 2px 4px rgba(0,0,0,0.08)":"none"
        }} onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}>{value}</button>
    );
}
