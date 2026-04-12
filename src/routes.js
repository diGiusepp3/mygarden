const SCREEN_ROUTES = {
    login:       "/login",
    dashboard:   "/dashboard",
    gardens:     "/gardens",
    editor:      "/editor",
    fields:      "/fields",
    plants:      "/plants",
    tasks:       "/tasks",
    greenhouses: "/greenhouses",
    account:     "/account",
    settings:    "/settings",
    dev:         "/dev",
};

const SCREEN_NAMES = new Set(Object.keys(SCREEN_ROUTES));

const SCREEN_TITLES = {
    login:       "Inloggen — MyGarden",
    dashboard:   "Dashboard — MyGarden",
    gardens:     "Tuinen — MyGarden",
    editor:      "Tuin bewerken — MyGarden",
    fields:      "Bedden — MyGarden",
    plants:      "Planten — MyGarden",
    tasks:       "Taken — MyGarden",
    greenhouses: "Kassen — MyGarden",
    account:     "Account — MyGarden",
    settings:    "Instellingen — MyGarden",
    dev:         "Dev — MyGarden",
};

const getRouteFromPath = () => {
    if (typeof window === "undefined") return { screen:"dashboard", params:{} };
    const raw = window.location.pathname.replace(/^\//, "").split("?")[0];
    const search = window.location.search;
    const screen = raw.match(/^[a-z-]+/i)?.[0] || "dashboard";
    return {
        screen: SCREEN_NAMES.has(screen) ? screen : "dashboard",
        params: Object.fromEntries(new URLSearchParams(search).entries()),
    };
};

const formatScreenPath = (screen, params = {}) => {
    const base = SCREEN_ROUTES[screen] || SCREEN_ROUTES.dashboard;
    const search = new URLSearchParams(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
    ).toString();
    return search ? `${base}?${search}` : base;
};

const updateDocTitle = (screen) => {
    if (typeof document !== "undefined") {
        document.title = SCREEN_TITLES[screen] || "MyGarden";
    }
};

export { SCREEN_ROUTES, SCREEN_NAMES, SCREEN_TITLES, getRouteFromPath, formatScreenPath, updateDocTitle };
