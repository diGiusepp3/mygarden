const SCREEN_ROUTES = {
    dashboard: "#/dashboard",
    gardens: "#/gardens",
    editor: "#/editor",
    fields: "#/fields",
    plants: "#/plants",
    tasks: "#/tasks",
    greenhouses: "#/greenhouses",
    account: "#/account",
    settings: "#/settings",
    dev: "#/dev",
};

const SCREEN_NAMES = new Set(Object.keys(SCREEN_ROUTES));

const getRouteFromHash = () => {
    if (typeof window === "undefined") return { screen:"dashboard", params:{} };
    const raw = window.location.hash.replace(/^#\/?/, "");
    const [path, query = ""] = raw.split("?");
    const screen = (path || "dashboard").match(/^[a-z-]+/i)?.[0] || "dashboard";
    return {
        screen: SCREEN_NAMES.has(screen) ? screen : "dashboard",
        params: Object.fromEntries(new URLSearchParams(query).entries()),
    };
};

const formatScreenHash = (screen, params = {}) => {
    const base = SCREEN_ROUTES[screen] || SCREEN_ROUTES.dashboard;
    const search = new URLSearchParams(
        Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
    ).toString();
    return search ? `${base}?${search}` : base;
};

export { SCREEN_ROUTES, SCREEN_NAMES, getRouteFromHash, formatScreenHash };
