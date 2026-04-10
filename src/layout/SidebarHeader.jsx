import { T } from "../theme.js";

export function SidebarHeader({ collapsed, activeUser, onOpenAccount, t }) {
    return (
        <div
            onClick={onOpenAccount}
            style={{
                padding: collapsed ? "14px 8px" : "14px 14px 12px",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                cursor: "pointer",
                transition: "background 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
        >
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:34, height:34, borderRadius:99, background:activeUser?.color || T.primary, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0, border:"2px solid rgba(255,255,255,0.3)" }}>
                    {activeUser?.avatar || "🌱"}
                </div>
                {!collapsed && (
                    <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:13, fontWeight:800, color:"#FFF", fontFamily:"Fraunces,serif", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                            {activeUser?.name || "Account"}
                        </div>
                        <div style={{ fontSize:9, color:"rgba(255,255,255,0.45)", marginTop:1 }}>
                            MyGarden · {t("app_subtitle")}
                        </div>
                    </div>
                )}
                {!collapsed && <span style={{ color:"rgba(255,255,255,0.4)", fontSize:11 }}>→</span>}
            </div>
        </div>
    );
}
