import React from "react";
import { T } from "../theme.js";

export function InfoBanner({ children, icon="ℹ️" }) {
    return (
        <div style={{ display:"flex", gap:8, background:T.infoBg, border:`1px solid ${T.info}22`, borderRadius:T.rs, padding:"9px 12px", fontSize:12, color:T.info, lineHeight:1.5 }}>
            <span style={{ flexShrink:0 }}>{icon}</span><span>{children}</span>
        </div>
    );
}
