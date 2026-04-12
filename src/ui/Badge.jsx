import React from "react";
import { T } from "../theme.js";

export function Badge({ children, color, bg, style }) {
    return (
        <span style={{
            display:"inline-flex",
            alignItems:"center",
            justifyContent:"center",
            padding:"4px 10px",
            borderRadius:999,
            fontSize:11,
            fontWeight:700,
            letterSpacing:0.3,
            color:color||T.textSub,
            background:bg||T.surfaceAlt,
            border:`1px solid ${T.borderSoft}`,
            boxShadow:"inset 0 1px 0 rgba(255,255,255,0.4)",
            whiteSpace:"nowrap",
            ...style
        }}>{children}</span>
    );
}
