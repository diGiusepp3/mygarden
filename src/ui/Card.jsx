import React, { useState } from "react";
import { T } from "../theme.js";

export function Card({ children, style, onClick, variant="surface" }) {
    const [hov, setHov] = useState(false);
    const backgroundMap = {
        surface: T.surface,
        soft: T.surfaceSoft,
        muted: T.surfaceMuted,
    };
    const bg = backgroundMap[variant] || T.surface;
    const borderColor = variant==="soft" || variant==="muted" ? T.borderSoft : T.border;
    return (
        <div
            onClick={onClick}
            style={{
                background:bg,
                border:`1px solid ${borderColor}`,
                borderRadius:T.radiusLg,
                boxShadow:(hov && onClick) ? T.shMd : T.sh,
                transition:"all 0.2s ease, transform 0.2s ease",
                cursor:onClick?"pointer":"default",
                transform:(hov && onClick) ? "translateY(-3px)" : "none",
                ...style
            }}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
        >
            {children}
        </div>
    );
}
