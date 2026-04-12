import { normalizeState } from "./persistence.js";
import { syncHarvestTask, removeHarvestTask, getHarvestTaskForPlant, getStructureMaintenanceTask } from "../helpers.js";

export function reducer(state, { type, payload }) {
    const uid = state.activeUserId;
    const inj = (p) => ({ ...p, user_id: uid });
    switch (type) {
        case "ADD_USER":          return { ...state, users: [...state.users, payload] };
        case "UPDATE_USER":       return { ...state, users: state.users.map(u => u.id===payload.id ? payload : u) };
        case "DELETE_USER":       return { ...state, users: state.users.filter(u => u.id!==payload), activeUserId: state.activeUserId===payload ? (state.users.find(u=>u.id!==payload)?.id||null) : state.activeUserId };
        case "SET_ACTIVE_USER": {
            const nextGardenId = state.gardens.find(g => g.user_id === payload)?.id || null;
            return { ...state, activeUserId: payload, activeGardenId: nextGardenId };
        }
        case "ADD_GARDEN":        return { ...state, gardens: [...state.gardens, inj(payload)], activeGardenId: payload.id };
        case "UPDATE_GARDEN":     return { ...state, gardens: state.gardens.map(g => g.id===payload.id ? payload : g) };
        case "DELETE_GARDEN":     return { ...state, gardens: state.gardens.filter(g => g.id!==payload), activeGardenId: state.activeGardenId===payload ? (state.gardens.find(g=>g.user_id===uid&&g.id!==payload)?.id||null) : state.activeGardenId };
        case "SET_ACTIVE_GARDEN": return { ...state, activeGardenId: payload };
        case "ADD_FIELD":         return { ...state, fields: [...state.fields, inj(payload)] };
        case "UPDATE_FIELD":      return { ...state, fields: state.fields.map(f => f.id===payload.id ? payload : f) };
        case "DELETE_FIELD":      return { ...state, fields: state.fields.filter(f => f.id!==payload) };
        case "ADD_STRUCT":        return { ...state, structures: [...state.structures, inj(payload)] };
        case "UPDATE_STRUCT":     return { ...state, structures: state.structures.map(s => s.id===payload.id ? payload : s) };
        case "DELETE_STRUCT":     return { ...state, structures: state.structures.filter(s => s.id!==payload) };
        case "ADD_SLOT":          return { ...state, slots: [...(state.slots||[]), inj(payload)] };
        case "UPDATE_SLOT":       return { ...state, slots: (state.slots||[]).map(s => s.id===payload.id ? payload : s) };
        case "DELETE_SLOT":       return { ...state, slots: (state.slots||[]).filter(s => s.id!==payload) };
        case "ADD_ZONE":          return { ...state, zones: [...(state.zones||[]), inj(payload)] };
        case "UPDATE_ZONE":       return { ...state, zones: (state.zones||[]).map(z => z.id===payload.id ? payload : z) };
        case "DELETE_ZONE":       return { ...state, zones: (state.zones||[]).filter(z => z.id!==payload) };
        case "ADD_PLANT": {
            const plant = inj(payload);
            return { ...state, plants: [...state.plants, plant], tasks: syncHarvestTask(state.tasks, plant, uid) };
        }
        case "UPDATE_PLANT": {
            const plant = payload;
            return { ...state, plants: state.plants.map(p => p.id===payload.id ? payload : p), tasks: syncHarvestTask(state.tasks, plant, uid) };
        }
        case "DELETE_PLANT":      return { ...state, plants: state.plants.filter(p => p.id!==payload), tasks: removeHarvestTask(state.tasks, payload) };
        case "ADD_TASK":          return { ...state, tasks: [...state.tasks, inj(payload)] };
        case "UPDATE_TASK":       return { ...state, tasks: state.tasks.map(t => t.id===payload.id ? payload : t) };
        case "DELETE_TASK":       return { ...state, tasks: state.tasks.filter(t => t.id!==payload) };
        case "SYNC_HARVEST_TASKS": {
            const syncedPlants = state.plants.filter(p => !p.user_id || p.user_id===uid);
            const untouchedTasks = state.tasks.filter(t => !String(t.id).startsWith("harvest_"));
            const harvestTasks = syncedPlants.map(p => getHarvestTaskForPlant(p, uid)).filter(Boolean);
            return { ...state, tasks: [...untouchedTasks, ...harvestTasks] };
        }
        case "SYNC_STRUCTURE_TASKS": {
            const syncedStructs = state.structures.filter(s => !s.user_id || s.user_id === uid);
            let nextTasks = state.tasks.filter(t => !String(t.id).startsWith("maint_"));
            syncedStructs.forEach(struct => {
                const task = getStructureMaintenanceTask(struct, uid);
                if (task) nextTasks.push(task);
            });
            return { ...state, tasks: nextTasks };
        }
        case "HYDRATE_STATE":     return normalizeState(payload) || state;
        case "SET_SETTING":       return { ...state, users: state.users.map(u => u.id===uid ? {...u, settings:{...u.settings,...payload}} : u) };
        default: return state;
    }
}
