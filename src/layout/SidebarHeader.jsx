import { T } from "../theme.js";

export function SidebarHeader({ collapsed, activeUser, onOpenAccount, t }) {
    return (
        <div
            onClick={onOpenAccount}
            style={{
                padding: collapsed ? "14px 8px" : "16px 14px 14px",
                borderBottom: "1px solid rgba(255,255,255,0.10)",
                cursor: "pointer",
                transition: "background 0.15s, transform 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
        >
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{
                    width: collapsed ? 36 : 42,
                    height: collapsed ? 36 : 42,
                    borderRadius:18,
                    background:`linear-gradient(180deg, ${activeUser?.color || T.primary} 0%, ${T.primaryActive} 100%)`,
                    display:"flex",
                    alignItems:"center",
                    justifyContent:"center",
                    fontSize: collapsed ? 18 : 20,
                    flexShrink:0,
                    border:"1px solid rgba(255,255,255,0.28)",
                    boxShadow:"0 8px 16px rgba(0,0,0,0.18)",
                }}>
                    {activeUser?.avatar || "🌱"}
                </div>
                {!collapsed && (
                    <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:14, fontWeight:900, color:"#FFF", fontFamily:"Fraunces,serif", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                            {activeUser?.name || "Account"}
                        </div>
                        <div style={{ fontSize:10, color:"rgba(255,255,255,0.65)", marginTop:2 }}>
                            MyGarden · {t("app_subtitle")}
                        </div>
                    </div>
                )}
                {!collapsed && <span style={{ color:"rgba(255,255,255,0.45)", fontSize:12, marginLeft:2 }}>→</span>}
            </div>
        </div>
    );
}
