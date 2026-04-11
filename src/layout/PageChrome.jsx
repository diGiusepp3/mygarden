import React from "react";
import { T } from "../theme.js";

export function PageShell({ children, width = 1180 }) {
    return (
        <div style={{
            position:"relative",
            padding:"30px 0 48px",
            minHeight:"100vh",
            overflow:"hidden",
        }}>
            <div aria-hidden="true" style={{
                position:"absolute",
                inset:"-10% -8% auto auto",
                width:420,
                height:420,
                borderRadius:"50%",
                background:"radial-gradient(circle, rgba(42,90,17,0.12) 0%, rgba(42,90,17,0.03) 50%, transparent 70%)",
                filter:"blur(10px)",
                pointerEvents:"none",
            }} />
            <div aria-hidden="true" style={{
                position:"absolute",
                inset:"auto auto -8% -6%",
                width:360,
                height:360,
                borderRadius:"50%",
                background:"radial-gradient(circle, rgba(185,95,37,0.12) 0%, rgba(185,95,37,0.03) 55%, transparent 72%)",
                filter:"blur(12px)",
                pointerEvents:"none",
            }} />
            <div style={{ position:"relative", maxWidth:width, margin:"0 auto", display:"flex", flexDirection:"column", gap:22, padding:"0 22px" }}>
                {children}
            </div>
        </div>
    );
}

export function PageHeader({ title, subtitle, meta, actions }) {
    return (
        <div style={{
            position:"relative",
            overflow:"hidden",
            border:`1px solid ${T.borderSoft}`,
            borderRadius:24,
            padding:"22px 22px 20px",
            background:`linear-gradient(180deg, rgba(255,253,249,0.96) 0%, rgba(243,238,228,0.96) 100%)`,
            boxShadow:"0 14px 34px rgba(20,18,14,0.07)",
        }}>
            <div aria-hidden="true" style={{
                position:"absolute",
                inset:"-40px -60px auto auto",
                width:180,
                height:180,
                borderRadius:"50%",
                background:"radial-gradient(circle, rgba(42,90,17,0.08) 0%, rgba(42,90,17,0.02) 56%, transparent 74%)",
                pointerEvents:"none",
            }} />
            <div style={{ display:"flex", flexDirection:"column", gap:14, position:"relative" }}>
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:18, flexWrap:"wrap" }}>
                    <div style={{ maxWidth:760 }}>
                        <div style={{ fontSize:11, fontWeight:900, letterSpacing:1.2, textTransform:"uppercase", color:T.primary, marginBottom:8 }}>
                            MyGarden
                        </div>
                        <h1 style={{ margin:0, fontSize:"clamp(28px, 3vw, 42px)", lineHeight:1.02, fontWeight:900, fontFamily:"Fraunces, serif", color:T.text }}>
                            {title}
                        </h1>
                        {subtitle && <p style={{ margin:"10px 0 0", fontSize:14, color:T.textMuted, lineHeight:1.6, maxWidth:700 }}>{subtitle}</p>}
                    </div>
                    {actions && <div style={{ display:"flex", gap:10, flexWrap:"wrap", justifyContent:"flex-end" }}>{actions}</div>}
                </div>
                {meta && <div style={{ display:"flex", gap:10, flexWrap:"wrap", paddingTop:2 }}>{meta}</div>}
            </div>
        </div>
    );
}

export function SectionPanel({ title, subtitle, action, children, style, accent, Card }) {
    return (
        <div style={{
            position:"relative",
            overflow:"hidden",
            padding:"22px 22px 20px",
            background:accent?.bg || `linear-gradient(180deg, ${T.surface} 0%, ${T.surfaceSoft} 100%)`,
            border:`1px solid ${accent?.border || T.cardBorder}`,
            borderRadius:24,
            boxShadow:"0 12px 28px rgba(20,18,14,0.06)",
            minHeight:subtitle || action ? 0 : 120,
            ...style
        }}>
            <div aria-hidden="true" style={{
                position:"absolute",
                inset:0,
                background:"linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 36%)",
                pointerEvents:"none",
            }} />
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:14, marginBottom:subtitle || action ? 12 : 8 }}>
                <div>
                    <h3 style={{ margin:0, fontSize:16, fontWeight:900, fontFamily:"Fraunces, serif", color:accent?.titleColor || T.text }}>{title}</h3>
                    {subtitle && <p style={{ margin:"6px 0 0", fontSize:13, color:accent?.subColor || T.textMuted, lineHeight:1.55 }}>{subtitle}</p>}
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

export function QuickAction({ icon, label, helper, onClick, style }) {
    return (
        <button onClick={onClick} style={{
            border:`1px solid ${T.borderSoft}`,
            borderRadius:22,
            padding:"14px 18px",
            background:`linear-gradient(180deg, ${T.surfaceSoft} 0%, ${T.surface} 100%)`,
            display:"flex",
            alignItems:"center",
            gap:12,
            cursor:"pointer",
            fontSize:13,
            fontWeight:600,
            color:T.text,
            boxShadow:"0 8px 22px rgba(20,18,14,0.06)",
            transition:"transform 0.2s ease, box-shadow 0.2s ease",
            width:"100%",
            ...style,
        }}>
            <span style={{ fontSize:22, width:38, height:38, borderRadius:16, display:"inline-flex", alignItems:"center", justifyContent:"center", background:T.primaryBg, flexShrink:0 }}>{icon}</span>
            <div style={{ textAlign:"left" }}>
                <div style={{ fontWeight:700 }}>{label}</div>
                {helper && <div style={{ fontSize:12, color:T.textMuted, lineHeight:1.4 }}>{helper}</div>}
            </div>
        </button>
    );
}

export function MetaBadge({ label, value }) {
    return (
        <span style={{
            display:"inline-flex",
            alignItems:"center",
            gap:6,
            color:T.textSub,
            background:"rgba(255,255,255,0.72)",
            border:`1px solid ${T.borderSoft}`,
            borderRadius:999,
            fontSize:11,
            padding:"5px 12px",
            whiteSpace:"nowrap",
            boxShadow:"0 4px 12px rgba(20,18,14,0.05)",
        }}>
            <span style={{ fontWeight:800, color:T.text }}>{value}</span> {label}
        </span>
    );
}
