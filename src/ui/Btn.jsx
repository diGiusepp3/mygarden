import React, { useState } from "react";
import { T } from "../theme.js";

export function Btn({ children, variant="primary", size="md", onClick, disabled, style, icon, title }) {
    const [hov, setHov] = useState(false);
    const padding = size==="xs" ? "4px 11px" : size==="sm" ? "6px 14px" : size==="lg" ? "12px 26px" : "9px 18px";
    const base = {
        display:"inline-flex",
        alignItems:"center",
        justifyContent:"center",
        gap:icon?6:4,
        fontFamily:"inherit",
        cursor:disabled?"not-allowed":"pointer",
        border:"1px solid transparent",
        borderRadius:T.radiusLg,
        transition:"all 0.2s ease",
        outline:"none",
        opacity:disabled?0.55:1,
        fontWeight:600,
        whiteSpace:"nowrap",
        fontSize:size==="xs"?11:size==="sm"?12:size==="lg"?15:13,
        padding,
        boxShadow:disabled?"none":"0 2px 6px rgba(0,0,0,0.08)"
    };
    const variants = {
        primary:{ background:T.primary, color:"#fff", border:`1px solid ${T.primary}`, hoverBg:T.primaryHov, hoverBorder:`1px solid ${T.primary}` },
        secondary:{ background:T.surface, color:T.text, border:`1px solid ${T.borderSoft}`, hoverBg:T.surfaceAlt, hoverBorder:`1px solid ${T.borderSoft}` },
        accent:{ background:T.accent, color:"#fff", border:`1px solid ${T.accent}`, hoverBg:T.accentHov, hoverBorder:`1px solid ${T.accent}` },
        ghost:{ background:"transparent", color:T.textSub, border:`1px solid transparent`, hoverBg:"rgba(0,0,0,0.04)", hoverBorder:`1px solid transparent` },
        danger:{ background:T.danger, color:"#fff", border:`1px solid ${T.danger}`, hoverBg:"#A32020", hoverBorder:`1px solid ${T.danger}` },
        success:{ background:T.success, color:"#fff", border:`1px solid ${T.success}`, hoverBg:"#1B5E20", hoverBorder:`1px solid ${T.success}` },
        outline:{ background:"transparent", color:T.primary, border:`1px solid ${T.primary}`, hoverBg:T.primaryBg, hoverBorder:`1px solid ${T.primary}` }
    };
    const config = variants[variant] || variants.primary;
    const currentBg = hov && !disabled ? (config.hoverBg || config.background) : config.background;
    const currentBorder = hov && !disabled ? (config.hoverBorder || config.border) : config.border;
    const currentColor = config.color;
    return (
        <button
            style={{ ...base, background:currentBg, color:currentColor, border:currentBorder, ...style }}
            onClick={onClick}
            disabled={disabled}
            title={title}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
        >
            {icon && <span>{icon}</span>}
            {children}
        </button>
    );
}
