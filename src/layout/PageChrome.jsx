import React from "react";
import { T } from "../theme.js";

export function PageShell({ children, width = 1180 }) {
    return (
        <div style={{ padding:"32px 0 48px", maxWidth:width, margin:"0 auto", display:"flex", flexDirection:"column", gap:26 }}>
            {children}
        </div>
    );
}

export function PageHeader({ title, subtitle, meta, actions }) {
    return (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:18, flexWrap:"wrap" }}>
                <div>
                    <h1 style={{ margin:0, fontSize:30, fontWeight:900, fontFamily:"Fraunces, serif", color:T.text }}>{title}</h1>
                    {subtitle && <p style={{ margin:"6px 0 0", fontSize:13, color:T.textMuted }}>{subtitle}</p>}
                </div>
                {actions && <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>{actions}</div>}
            </div>
            {meta && <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>{meta}</div>}
        </div>
    );
}

export function SectionPanel({ title, subtitle, action, children, style, accent, Card }) {
    return (
        <div style={{
            padding:"20px 22px",
            background:accent?.bg || T.surface,
            border:`1px solid ${accent?.border || T.cardBorder}`,
            borderRadius:T.radiusLg,
            boxShadow:T.sh,
            minHeight:subtitle || action ? 0 : 120,
            ...style
        }}>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:14, marginBottom:subtitle||action ? 12 : 8 }}>
                <div>
                    <h3 style={{ margin:0, fontSize:15, fontWeight:900, fontFamily:"Fraunces, serif", color:accent?.titleColor || T.text }}>{title}</h3>
                    {subtitle && <p style={{ margin:"6px 0 0", fontSize:12, color:accent?.subColor || T.textMuted }}>{subtitle}</p>}
            </div>
            {action && <div>{action}</div>}
        </div>
        {children}
        </div>
    );
}

export function PanelGroup({ children, cols = "repeat(auto-fit,minmax(240px,1fr))" }) {
    return <div style={{ display:"grid", gridTemplateColumns:cols, gap:16 }}>{children}</div>;
}

export function QuickAction({ icon, label, helper, onClick }) {
    return (
        <button onClick={onClick} style={{
            border:`1px solid ${T.borderSoft}`,
            borderRadius:T.radiusLg,
            padding:"12px 18px",
            background:T.surfaceSoft,
            display:"flex",
            alignItems:"center",
            gap:12,
            cursor:"pointer",
            fontSize:13,
            fontWeight:600,
            color:T.text,
            boxShadow:T.sh,
            transition:"transform 0.2s ease"
        }}>
            <span style={{ fontSize:20 }}>{icon}</span>
            <div style={{ textAlign:"left" }}>
                <div style={{ fontWeight:700 }}>{label}</div>
                {helper && <div style={{ fontSize:12, color:T.textMuted }}>{helper}</div>}
            </div>
        </button>
    );
}

export function MetaBadge({ label, value }) {
    return (
        <span style={{ display:"inline-flex", alignItems:"center", gap:4, color:T.textSub, background:T.surfaceAlt, border:`1px solid ${T.borderSoft}`, borderRadius:T.radiusRound, fontSize:11, padding:"4px 10px", whiteSpace:"nowrap" }}>
            <span style={{ fontWeight:600, color:T.text }}>{value}</span> {label}
        </span>
    );
}
