import { T } from "../theme.js";

export function SidebarFooter({ collapsed, onLogout, onToggleCollapse, t }) {
    return (
        <div style={{ padding:"10px 10px 12px", borderTop:"1px solid rgba(255,255,255,0.10)", display:"flex", flexDirection:"column", gap:6 }}>
            <button
                onClick={onLogout}
                title={collapsed ? t("logout") : undefined}
                style={{
                    display:"flex",
                    alignItems:"center",
                    gap:8,
                    padding:collapsed ? "10px" : "9px 12px",
                    width:"100%",
                    justifyContent:collapsed ? "center" : "flex-start",
                    background:"rgba(255,255,255,0.08)",
                    border:"1px solid rgba(255,255,255,0.08)",
                    borderRadius:16,
                    cursor:"pointer",
                    color:"rgba(255,255,255,0.78)",
                    fontSize:12,
                    fontFamily:"inherit",
                    fontWeight:700,
                    transition:"all 0.15s",
                    boxShadow:"0 8px 18px rgba(0,0,0,0.08)",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.14)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
            >
                <span style={{ fontSize:16 }}>🚪</span>
                {!collapsed && <span>{t("logout")}</span>}
            </button>
            <button
                onClick={onToggleCollapse}
                style={{
                    display:"flex",
                    alignItems:"center",
                    justifyContent:"center",
                    width:"100%",
                    padding:"8px",
                    background:"rgba(255,255,255,0.05)",
                    border:"1px solid rgba(255,255,255,0.08)",
                    borderRadius:16,
                    cursor:"pointer",
                    color:"rgba(255,255,255,0.58)",
                    fontSize:11,
                    fontFamily:"inherit",
                    fontWeight:700,
                }}
            >
                {collapsed ? "→" : "← Inklappen"}
            </button>
        </div>
    );
}
