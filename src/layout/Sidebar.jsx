import { useMobile } from "../hooks/useMobile.js";
import { T } from "../theme.js";
import { SidebarHeader } from "./SidebarHeader.jsx";
import { SidebarFooter } from "./SidebarFooter.jsx";

// Primary nav items (shown in bottom bar on mobile)
const NAV_MAIN = [
    { id:"dashboard", icon:"🏡", key:"nav_dashboard" },
    { id:"plants",    icon:"🌱", key:"nav_plants" },
    { id:"tasks",     icon:"✅", key:"nav_tasks" },
    { id:"editor",    icon:"📐", key:"nav_editor" },
];
const NAV_ALL = [
    ...NAV_MAIN,
    { id:"gardens",     icon:"🌿", key:"nav_gardens" },
    { id:"fields",      icon:"🛏️", key:"nav_fields" },
    { id:"greenhouses", icon:"🏡", key:"nav_greenhouses" },
    { id:"account",     icon:"👤", key:"account" },
    { id:"settings",    icon:"⚙️", key:"nav_settings" },
];

function BottomNav({ screen, setScreen, pendingTasks, t, state }) {
    const uid = state.activeUserId;
    const activeUser = state.users.find(u => u.id === uid);
    const allNav = [
        ...NAV_ALL,
        ...(activeUser?.is_dev ? [{ id:"dev", icon:"⚡", key:"dev" }] : []),
    ];
    // Show 4 primary + "more" (last active item if outside primary)
    const primaryIds = NAV_MAIN.map(n => n.id);
    const inPrimary = primaryIds.includes(screen);
    const tabs = inPrimary
        ? [...NAV_MAIN, { id:"__more", icon:"⋯", key:"nav_more" }]
        : [
            ...NAV_MAIN.slice(0, 3),
            allNav.find(n => n.id === screen) || NAV_MAIN[3],
            { id:"__more", icon:"⋯", key:"nav_more" },
          ];

    return (
        <nav style={{
            position:"fixed", bottom:0, left:0, right:0, zIndex:100,
            background:"linear-gradient(180deg, #1B3E09 0%, #244F0D 100%)",
            borderTop:"1px solid rgba(255,255,255,0.12)",
            display:"flex",
            height:62,
            paddingBottom:"env(safe-area-inset-bottom, 0px)",
            boxShadow:"0 -6px 24px rgba(0,0,0,0.22)",
        }}>
            {tabs.map(item => {
                const active = screen === item.id;
                if (item.id === "__more") {
                    return (
                        <button key="more"
                            onClick={() => {
                                // cycle through "more" items
                                const moreIdx = allNav.findIndex(n => !primaryIds.includes(n.id) && n.id !== screen);
                                if (moreIdx >= 0) setScreen(allNav[moreIdx].id);
                            }}
                            style={{ flex:1, background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:2, color:"rgba(255,255,255,0.55)", fontFamily:"inherit" }}
                        >
                            <span style={{ fontSize:20 }}>≡</span>
                            <span style={{ fontSize:9, fontWeight:700, textTransform:"uppercase", letterSpacing:0.5 }}>{t("nav_more") || "Meer"}</span>
                        </button>
                    );
                }
                return (
                    <button key={item.id}
                        onClick={() => setScreen(item.id)}
                        style={{
                            flex:1, background:"none", border:"none", cursor:"pointer",
                            display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:2,
                            color: active ? "#FFF" : "rgba(255,255,255,0.55)",
                            fontFamily:"inherit",
                            borderTop: active ? `2.5px solid ${T.accent}` : "2.5px solid transparent",
                            transition:"color 0.15s",
                        }}
                    >
                        <span style={{ fontSize:20, position:"relative" }}>
                            {item.icon}
                            {item.id === "tasks" && pendingTasks > 0 && (
                                <span style={{ position:"absolute", top:-4, right:-8, background:T.accent, color:"#FFF", borderRadius:999, fontSize:9, fontWeight:800, padding:"1px 5px" }}>{pendingTasks}</span>
                            )}
                        </span>
                        <span style={{ fontSize:9, fontWeight:active ? 800 : 600, textTransform:"uppercase", letterSpacing:0.5 }}>{t(item.key)}</span>
                    </button>
                );
            })}
        </nav>
    );
}

export function Sidebar({ screen, setScreen, pendingTasks, collapsed, setCollapsed, state, onLogout, t }) {
    const isMobile = useMobile();
    const uid = state.activeUserId;
    const activeUser = state.users.find(u => u.id === uid);
    const nav = [
        ...NAV_ALL,
        ...(activeUser?.is_dev ? [{ id:"dev", icon:"⚡", key:"dev" }] : []),
    ];

    if (isMobile) {
        return <BottomNav screen={screen} setScreen={setScreen} pendingTasks={pendingTasks} t={t} state={state} />;
    }

    return (
        <nav style={{
            width:collapsed ? 78 : 268,
            flexShrink:0,
            position:"sticky",
            top:0,
            height:"100vh",
            overflow:"hidden",
            zIndex:10,
            background:`radial-gradient(circle at 20% 0%, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0) 28%), linear-gradient(180deg, #173609 0%, #244F0D 35%, #2E6614 100%)`,
            borderRight:"1px solid rgba(255,255,255,0.08)",
            boxShadow:"12px 0 30px rgba(20,18,14,0.18)",
            display:"flex",
            flexDirection:"column",
            transition:"width 0.2s ease",
        }}>
            <SidebarHeader collapsed={collapsed} activeUser={activeUser} onOpenAccount={() => setScreen("account")} t={t} />
            <div style={{ flex:1, padding:"12px 10px 10px", display:"flex", flexDirection:"column", gap:8, overflowY:"auto" }}>
                {!collapsed && (
                    <div style={{
                        margin:"0 4px 8px",
                        padding:"12px 12px 10px",
                        borderRadius:18,
                        background:"rgba(255,255,255,0.08)",
                        border:"1px solid rgba(255,255,255,0.08)",
                        color:"rgba(255,255,255,0.9)",
                        boxShadow:"0 8px 18px rgba(0,0,0,0.08)",
                    }}>
                        <div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:1, fontWeight:900, color:"rgba(255,255,255,0.7)" }}>
                            Tuinwereld
                        </div>
                        <div style={{ fontSize:15, fontWeight:900, fontFamily:"Fraunces,serif", marginTop:4 }}>
                            {pendingTasks} open taken
                        </div>
                        <div style={{ fontSize:11, color:"rgba(255,255,255,0.68)", lineHeight:1.5, marginTop:4 }}>
                            Open vandaag je tuin, missies en planten in één overzicht.
                        </div>
                    </div>
                )}
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
                                gap:12,
                                padding:collapsed ? "12px" : "11px 13px",
                                borderRadius:18,
                                background:active ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.04)",
                                border:`1px solid ${active ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.06)"}`,
                                cursor:"pointer",
                                color:active ? "#FFF" : "rgba(255,255,255,0.72)",
                                fontSize:13,
                                fontWeight:active ? 800 : 600,
                                fontFamily:"inherit",
                                transition:"all 0.15s",
                                width:"100%",
                                justifyContent:collapsed ? "center" : "flex-start",
                                boxShadow:active ? "0 10px 18px rgba(0,0,0,0.10)" : "none",
                                backdropFilter:"blur(4px)",
                            }}
                            onMouseEnter={e => !active && (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
                            onMouseLeave={e => !active && (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                        >
                            <span style={{
                                fontSize:18,
                                flexShrink:0,
                                width:30,
                                height:30,
                                borderRadius:12,
                                display:"inline-flex",
                                alignItems:"center",
                                justifyContent:"center",
                                background:active ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.05)",
                            }}>{item.icon}</span>
                            {!collapsed && <span style={{ flex:1, textAlign:"left" }}>{t(item.key)}</span>}
                            {!collapsed && item.id === "tasks" && pendingTasks > 0 && (
                                <span style={{ background:T.accent, color:"#FFF", borderRadius:999, fontSize:10, fontWeight:800, padding:"2px 8px", boxShadow:"0 4px 10px rgba(0,0,0,0.12)" }}>{pendingTasks}</span>
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
