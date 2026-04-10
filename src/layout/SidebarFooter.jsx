import { T } from "../theme.js";

export function SidebarFooter({ collapsed, onLogout, onToggleCollapse, t }) {
    return (
        <div style={{ padding:"8px 8px 12px", borderTop:"1px solid rgba(255,255,255,0.1)", display:"flex", flexDirection:"column", gap:4 }}>
            <button
                onClick={onLogout}
                title={collapsed ? t("logout") : undefined}
                style={{
                    display:"flex",
                    alignItems:"center",
                    gap:8,
                    padding:collapsed ? "10px" : "8px 11px",
                    width:"100%",
                    justifyContent:collapsed ? "center" : "flex-start",
                    background:"rgba(255,255,255,0.07)",
                    border:"none",
                    borderRadius:T.rs,
                    cursor:"pointer",
                    color:"rgba(255,255,255,0.55)",
                    fontSize:12,
                    fontFamily:"inherit",
                    fontWeight:500,
                    transition:"all 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.14)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
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
                    padding:"7px",
                    background:"rgba(255,255,255,0.06)",
                    border:"none",
                    borderRadius:T.rs,
                    cursor:"pointer",
                    color:"rgba(255,255,255,0.4)",
                    fontSize:11,
                    fontFamily:"inherit",
                }}
            >
                {collapsed ? "→" : "← Collapse"}
            </button>
        </div>
    );
}
