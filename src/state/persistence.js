export const SK = "gardengrid_v4";
export const SESSION_KEY = "gardengrid_session";

export const normalizeState = (state) =>
    state ? { ...state, slots: state.slots || [], zones: state.zones || [] } : null;

const apiJson = async (url, options = {}) => {
    const res = await fetch(url, {
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", ...(options.headers || {}) },
        ...options,
    });
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return res.json();
};

const getLegacyState = () => {
    try {
        const raw = localStorage.getItem(SK);
        return raw ? normalizeState(JSON.parse(raw)) : null;
    } catch {
        return null;
    }
};

const clearLegacyStorage = () => {
    try {
        localStorage.removeItem(SK);
        localStorage.removeItem(SESSION_KEY);
    } catch {}
};

export const loadState = async () => {
    try {
        const payload = await apiJson("/api/state.php");
        if (payload?.state) {
            clearLegacyStorage();
            return normalizeState(payload.state);
        }
    } catch {}
    const legacy = getLegacyState();
    if (legacy) {
        await saveState(legacy);
        clearLegacyStorage();
        return legacy;
    }
    return null;
};

export const saveState = async (state) => {
    await apiJson("/api/state.php", {
        method: "POST",
        body: JSON.stringify({ state }),
    });
};

export const resetState = async () => {
    await apiJson("/api/state.php", { method: "DELETE" });
    clearLegacyStorage();
};

export const getSession = async () => {
    try {
        const payload = await apiJson("/api/session.php");
        if (payload?.uid) {
            try { localStorage.removeItem(SESSION_KEY); } catch {}
            return payload.uid;
        }
    } catch {}
    try {
        const legacyUid = localStorage.getItem(SESSION_KEY) || null;
        if (legacyUid) {
            await setSession(legacyUid);
            localStorage.removeItem(SESSION_KEY);
            return legacyUid;
        }
    } catch {}
    return null;
};

export const setSession = async (uid) => {
    if (uid) {
        await apiJson("/api/session.php", {
            method: "POST",
            body: JSON.stringify({ uid }),
        });
    } else {
        await apiJson("/api/session.php", { method: "DELETE" });
    }
};
