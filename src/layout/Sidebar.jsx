import { T } from "../theme.js";
import { SidebarHeader } from "./SidebarHeader.jsx";
import { SidebarFooter } from "./SidebarFooter.jsx";

export function Sidebar({ screen, setScreen, pendingTasks, collapsed, setCollapsed, state, onLogout, t }) {
    const uid = state.activeUserId;
    const activeUser = state.users.find(u => u.id === uid);
    const nav = [
        { id:"dashboard", icon:"🏡", key:"nav_dashboard" },
        { id:"gardens", icon:"🌿", key:"nav_gardens" },
        { id:"editor", icon:"📐", key:"nav_editor" },
        { id:"fields", icon:"🛏️", key:"nav_fields" },
        { id:"plants", icon:"🌱", key:"nav_plants" },
        { id:"tasks", icon:"✅", key:"nav_tasks" },
        { id:"greenhouses", icon:"🏡", key:"nav_greenhouses" },
        { id:"account", icon:"👤", key:"account" },
        { id:"settings", icon:"⚙️", key:"nav_settings" },
        ...(activeUser?.is_dev ? [{ id:"dev", icon:"⚡", key:"dev" }] : []),
    ];

    return (
        <nav style={{ width:collapsed ? 64 : 220, flexShrink:0, background:`linear-gradient(175deg,#1E4A08 0%,#2B5C10 60%,#3D7A1A 100%)`, display:"flex", flexDirection:"column", height:"100vh", position:"sticky", top:0, transition:"width 0.2s", overflow:"hidden", zIndex:10 }}>
            <SidebarHeader collapsed={collapsed} activeUser={activeUser} onOpenAccount={() => setScreen("account")} t={t} />
            <div style={{ flex:1, padding:"8px 8px", display:"flex", flexDirection:"column", gap:2, overflowY:"auto" }}>
                {nav.map(item => {
                    const active = screen === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setScreen(item.id)}
                            title={collapsed ? t(item.key) : undefined}
                            style={{
                                display:"flex",
                                alignItems:"center",
                                gap:10,
                                padding:collapsed ? "10px" : "9px 11px",
                                borderRadius:T.rs,
                                background:active ? "rgba(255,255,255,0.18)" : "transparent",
                                border:"none",
                                cursor:"pointer",
                                color:active ? "#FFF" : "rgba(255,255,255,0.62)",
                                fontSize:13,
                                fontWeight:active ? 700 : 500,
                                fontFamily:"inherit",
                                transition:"all 0.15s",
                                width:"100%",
                                justifyContent:collapsed ? "center" : "flex-start",
                            }}
                            onMouseEnter={e => !active && (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                            onMouseLeave={e => !active && (e.currentTarget.style.background = "transparent")}
                        >
                            <span style={{ fontSize:18, flexShrink:0 }}>{item.icon}</span>
                            {!collapsed && <span style={{ flex:1, textAlign:"left" }}>{t(item.key)}</span>}
                            {!collapsed && item.id === "tasks" && pendingTasks > 0 && (
                                <span style={{ background:T.accent, color:"#FFF", borderRadius:99, fontSize:10, fontWeight:800, padding:"1px 7px" }}>{pendingTasks}</span>
                            )}
                        </button>
                    );
                })}
            </div>
            <SidebarFooter collapsed={collapsed} onLogout={onLogout} onToggleCollapse={() => setCollapsed(c => !c)} t={t} />
        </nav>
    );
}

export default Sidebar;
