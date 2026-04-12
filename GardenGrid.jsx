import React, { useState, useEffect, useReducer, useCallback, useRef } from "react";
import { SCREEN_NAMES, getRouteFromHash, formatScreenHash } from "./src/routes.js";
import { ScreenErrorBoundary } from "./src/ui/ScreenErrorBoundary.jsx";
import DashboardScreen from "./src/screens/DashboardScreen.jsx";
import GardensScreen from "./src/screens/GardensScreen.jsx";
import PlantsScreen from "./src/screens/PlantsScreen.jsx";
import TasksScreen from "./src/screens/TasksScreen.jsx";
import GreenhouseScreen from "./src/screens/GreenhouseScreen.jsx";
import SettingsScreen from "./src/screens/SettingsScreen.jsx";
import LoginScreen from "./src/screens/LoginScreen.jsx";
import AccountScreen from "./src/screens/AccountScreen.jsx";
import EditorScreen from "./src/screens/EditorScreen.jsx";
import FieldsScreen from "./src/screens/FieldsScreen.jsx";
import DevScreen from "./src/screens/DevScreen.jsx";
import GardenEditor from "./src/screens/GardenEditor.jsx";
import { useT } from "./src/translations.js";
import { T } from "./src/theme.js";
import { SEED } from "./src/seed.js";
import { reducer } from "./src/state/reducer.js";
import { loadState, saveState, getSession, setSession } from "./src/state/persistence.js";
import { forUser } from "./src/helpers.js";

const Sidebar = React.lazy(() => import("./src/layout/Sidebar.jsx"));

// ----
// APP ROOT
// ----
export default function GardenGridApp() {
    const [state, dispatch] = useReducer(reducer, SEED);
    const [loggedInUid, setLoggedInUid] = useState(null);
    const initialRoute = getRouteFromHash();
    const [screen, setScreen] = useState(initialRoute.screen);
    const [routeParams, setRouteParams] = useState(initialRoute.params);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const harvestSyncRef = useRef("");
    const structureSyncRef = useRef("");
    const [booted, setBooted] = useState(false);
    const readyToSave = useRef(false);

    useEffect(() => {
        let active = true;
        (async () => {
            const [remoteState, sessionUid] = await Promise.all([loadState(), getSession()]);
            if (!active) return;
            if (remoteState) {
                dispatch({ type:"HYDRATE_STATE", payload: remoteState });
            }
            setLoggedInUid(sessionUid);
            setBooted(true);
        })();
        return () => { active = false; };
    }, []);
    useEffect(() => {
        if (!booted) return;
        if (!readyToSave.current) { readyToSave.current = true; return; }
        saveState(state).catch(() => {});
    }, [state, booted]);
    useEffect(() => {
        if (!booted) return;
        const uid = state.activeUserId;
        if (!uid) return;
        const stamp = `${uid}:${forUser(state.plants, uid).length}:${forUser(state.tasks, uid).filter(t => String(t.id).startsWith("harvest_")).length}`;
        if (harvestSyncRef.current === stamp) return;
        harvestSyncRef.current = stamp;
        dispatch({ type:"SYNC_HARVEST_TASKS" });
    }, [state.activeUserId, state.plants, state.tasks, booted]);
    useEffect(() => {
        if (!booted) return;
        const uid = state.activeUserId;
        if (!uid) return;
        const hedgeStamp = `${uid}:${forUser(state.structures, uid).filter(s => ["hedge","trellis","windbreak","orchard_row"].includes(s.type)).length}:${forUser(state.tasks, uid).filter(t => String(t.id).startsWith("maint_")).length}`;
        if (structureSyncRef.current === hedgeStamp) return;
        structureSyncRef.current = hedgeStamp;
        dispatch({ type:"SYNC_STRUCTURE_TASKS" });
    }, [state.activeUserId, state.structures, state.tasks, booted]);
    useEffect(() => {
        if (!booted || typeof window === "undefined") return;
        const handleHashChange = () => {
            const next = getRouteFromHash();
            setScreen(prev => (prev === next.screen ? prev : next.screen));
            setRouteParams(prev => {
                const same = JSON.stringify(prev) === JSON.stringify(next.params);
                return same ? prev : next.params;
            });
        };
        window.addEventListener("hashchange", handleHashChange);
        handleHashChange();
        return () => window.removeEventListener("hashchange", handleHashChange);
    }, [booted]);
    useEffect(() => {
        if (!booted || typeof window === "undefined") return;
        const target = formatScreenHash(screen, routeParams);
        if (window.location.hash !== target) {
            window.location.hash = target;
        }
    }, [screen, routeParams, booted]);

    useEffect(() => {
        if (loggedInUid && loggedInUid !== state.activeUserId) {
            dispatch({ type:"SET_ACTIVE_USER", payload: loggedInUid });
        }
    }, [loggedInUid]);

    const handleLogin = async (uid) => {
        setLoggedInUid(uid);
        await setSession(uid);
        setRouteParams({});
        setScreen("dashboard");
    };

    const handleLogout = async () => {
        await setSession(null);
        setLoggedInUid(null);
        dispatch({ type:"SET_ACTIVE_USER", payload: null });
        setRouteParams({});
        setScreen("dashboard");
    };

    const navigate = useCallback((s, params = {}) => {
        const next = SCREEN_NAMES.has(s) ? s : "dashboard";
        setScreen(next);
        setRouteParams(params);
        if (typeof window !== "undefined") {
            const target = formatScreenHash(next, params);
            if (window.location.hash !== target) {
                window.location.hash = target;
            }
        }
    }, []);

    const uid = loggedInUid;
    const activeUser = state.users.find(u => u.id === uid);
    const lang = activeUser?.settings?.lang || "nl";
    const t = useT(lang);
    const pendingTasks = forUser(state.tasks, uid || "").filter(t => t.status === "pending").length;
    const props = { state, dispatch, navigate, lang, routeParams };

    if (!booted) {
        return (
            <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#F5F0E8", color:T.text, fontFamily:"DM Sans, sans-serif" }}>
                Loading MyGarden...
            </div>
        );
    }

    if (!loggedInUid || !activeUser) {
        return <LoginScreen state={state} dispatch={dispatch} onLogin={handleLogin}/>;
    }

    const STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;0,9..144,800;0,9..144,900;1,9..144,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
    *, *::before, *::after { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    body { font-family: 'DM Sans', system-ui, sans-serif; background: #F5F0E8; color: #1A1916; }
    input, select, textarea, button { font-family: 'DM Sans', system-ui, sans-serif; }
    * { -webkit-font-smoothing: antialiased; }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: #EDE8DF; }
    ::-webkit-scrollbar-thumb { background: #C8C0B4; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: #B0A89C; }
  `;

    return (
        <ScreenErrorBoundary key={screen} onGoDashboard={() => navigate("dashboard")} onRetry={() => navigate(screen)}>
            <>
                <style>{STYLES}</style>
                <div style={{ display:"flex", minHeight:"100vh", background:"#F5F0E8" }}>
                    <React.Suspense fallback={<div style={{ width: sidebarCollapsed ? 64 : 220, background:"linear-gradient(175deg,#1E4A08 0%,#2B5C10 60%,#3D7A1A 100%)" }} />}>
                        <Sidebar screen={screen} setScreen={navigate} pendingTasks={pendingTasks} collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} state={state} onLogout={handleLogout} t={t}/>
                    </React.Suspense>
                    <main style={{ flex:1, minHeight:"100vh", overflow:"auto" }}>
                        {screen==="dashboard"   && <DashboardScreen   {...props}/>}
                        {screen==="gardens"     && <GardensScreen     {...props}/>}
                        {screen==="editor"      && <EditorScreen      {...props} GardenEditor={GardenEditor}/>}
                        {screen==="fields"      && <FieldsScreen      {...props}/>}
                        {screen==="plants"      && <PlantsScreen      {...props}/>}
                        {screen==="tasks"       && <TasksScreen       {...props}/>}
                        {screen==="greenhouses" && <GreenhouseScreen  {...props}/>}
                        {screen==="account"     && <AccountScreen     {...props} onLogout={handleLogout}/>}
                        {screen==="settings"    && <SettingsScreen    {...props}/>}
                        {screen==="dev" && activeUser?.is_dev && <DevScreen {...props}/>}
                    </main>
                </div>
            </>
        </ScreenErrorBoundary>
    );
}
