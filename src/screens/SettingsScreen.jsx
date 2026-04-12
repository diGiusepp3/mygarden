import { useCallback, useEffect, useState } from "react";
import { Card } from "../ui/Card.jsx";
import { Badge } from "../ui/Badge.jsx";
import { Btn } from "../ui/Btn.jsx";
import { FormRow } from "../ui/FormRow.jsx";
import { Input } from "../ui/Input.jsx";
import { T } from "../theme.js";
import { LANG, LOCALE_MAP } from "../i18n.js";
import { WEATHER_CODE_LABELS } from "../constants.js";
import { forUser } from "../helpers.js";
import { apiJson } from "../api.js";
import { resetState } from "../state/persistence.js";

const useT = (lang) => (key) => LANG[lang]?.[key] ?? LANG.en[key] ?? key;
// SCREEN: SETTINGS
// ----
export default function SettingsScreen({ state, dispatch, lang }) {
    const t = useT(lang);
    const uid = state.activeUserId;
    const activeUser = state.users.find(u=>u.id===uid);
    const [weatherForm, setWeatherForm] = useState({
        location_name: "",
        latitude: "",
        longitude: "",
        sms_phone: "",
        sms_alerts_enabled: false,
    });
    const [weather, setWeather] = useState(null);
    const [weatherLoading, setWeatherLoading] = useState(false);
    const [weatherError, setWeatherError] = useState("");
    useEffect(() => {
        const settings = activeUser?.settings || {};
        setWeatherForm({
            location_name: settings.weather_location_name || "",
            latitude: settings.weather_latitude || "",
            longitude: settings.weather_longitude || "",
            sms_phone: settings.sms_phone || "",
            sms_alerts_enabled: Boolean(settings.sms_alerts_enabled),
        });
    }, [activeUser]);
    const exportData = () => {
        const blob = new Blob([JSON.stringify(state,null,2)],{type:"application/json"});
        const a = document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="gardengrid-export.json"; a.click();
    };
    const resetData = async () => {
        if (window.confirm(t("reset_confirm"))) {
            await resetState();
            window.location.reload();
        }
    };
    const refreshWeather = useCallback(async (latitude = weatherForm.latitude, longitude = weatherForm.longitude) => {
        if (!latitude || !longitude) return;
        setWeatherLoading(true);
        setWeatherError("");
        try {
            const data = await apiJson(`/api/weather.php?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}`);
            setWeather(data);
        } catch {
            setWeatherError("Weather data could not be loaded.");
        } finally {
            setWeatherLoading(false);
        }
    }, [weatherForm.latitude, weatherForm.longitude]);
    useEffect(() => {
        if (weatherForm.latitude && weatherForm.longitude) {
            refreshWeather(weatherForm.latitude, weatherForm.longitude);
        } else {
            setWeather(null);
        }
    }, [weatherForm.latitude, weatherForm.longitude, refreshWeather]);
    const saveWeatherSettings = () => {
        dispatch({
            type:"SET_SETTING",
            payload:{
                weather_location_name: weatherForm.location_name.trim(),
                weather_latitude: weatherForm.latitude.trim(),
                weather_longitude: weatherForm.longitude.trim(),
                sms_phone: weatherForm.sms_phone.trim(),
                sms_alerts_enabled: weatherForm.sms_alerts_enabled,
            }
        });
    };
    const LANGS = [["en","????","English"],["nl","????","Nederlands"],["fr","????","Français"],["de","????","Deutsch"]];
    return (
        <div style={{ padding:28, maxWidth:640, margin:"0 auto" }}>
            <h1 style={{ margin:"0 0 24px", fontSize:24, fontWeight:900, fontFamily:"Fraunces, serif", color:T.text }}>?? {t("nav_settings")}</h1>
            <Card style={{ marginBottom:16 }}>
                <div style={{ padding:"14px 18px 12px", borderBottom:`1px solid ${T.border}` }}>
                    <h2 style={{ margin:0, fontSize:14, fontWeight:800, color:T.text, fontFamily:"Fraunces, serif" }}>?? {t("language")}</h2>
                </div>
                <div style={{ padding:18, display:"flex", flexDirection:"column", gap:8 }}>
                    {LANGS.map(([code,flag,name]) => (
                        <label key={code} style={{ display:"flex", alignItems:"center", gap:12, cursor:"pointer", padding:"11px 14px", borderRadius:T.rs, background:lang===code?T.primaryBg:T.surface, border:`1.5px solid ${lang===code?T.primary:T.border}`, transition:"all 0.15s" }}>
                            <input type="radio" name="lang" checked={lang===code} onChange={()=>dispatch({type:"SET_SETTING",payload:{lang:code}})} style={{ accentColor:T.primary }}/>
                            <span style={{ fontSize:18 }}>{flag}</span>
                            <span style={{ fontSize:13, fontWeight:700, color:lang===code?T.primary:T.text, flex:1 }}>{name}</span>
                            <Badge color={lang===code?T.success:T.textMuted} bg={lang===code?T.successBg:T.surfaceAlt}>{lang===code?"Active":"?"}</Badge>
                        </label>
                    ))}
                </div>
            </Card>
            <Card style={{ marginBottom:16 }}>
                <div style={{ padding:"14px 18px 12px", borderBottom:`1px solid ${T.border}` }}>
                    <h2 style={{ margin:0, fontSize:14, fontWeight:800, color:T.text, fontFamily:"Fraunces, serif" }}>?? {t("your_profile")}</h2>
                </div>
                <div style={{ padding:18 }}>
                    <div style={{ display:"flex", gap:14, alignItems:"center", marginBottom:16 }}>
                        <div style={{ width:52, height:52, borderRadius:99, background:activeUser?.color||T.primary, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, flexShrink:0 }}>{activeUser?.avatar||"??"}</div>
                        <div><div style={{ fontSize:16, fontWeight:800, color:T.text }}>{activeUser?.name||"User"}</div><div style={{ fontSize:12, color:T.textMuted }}>{forUser(state.gardens,uid).length} gardens · {forUser(state.plants,uid).length} plants · {forUser(state.tasks,uid).filter(t2=>t2.status==="pending").length} pending tasks</div></div>
                    </div>
                    <div style={{ fontSize:13, color:T.textSub }}>Manage profiles using the user switcher in the sidebar header.</div>
                </div>
            </Card>
            <Card style={{ marginBottom:16 }}>
                <div style={{ padding:"14px 18px 12px", borderBottom:`1px solid ${T.border}` }}>
                    <h2 style={{ margin:0, fontSize:14, fontWeight:800, color:T.text, fontFamily:"Fraunces, serif" }}>??? Weather & Storm Alerts</h2>
                </div>
                <div style={{ padding:18, display:"flex", flexDirection:"column", gap:14 }}>
                    <FormRow cols={2}>
                        <Input label="Location name" value={weatherForm.location_name} onChange={v=>setWeatherForm(f=>({...f,location_name:v}))} placeholder="e.g. Aarschot garden"/>
                        <Input label="SMS phone" value={weatherForm.sms_phone} onChange={v=>setWeatherForm(f=>({...f,sms_phone:v}))} placeholder="+32478118430"/>
                    </FormRow>
                    <FormRow cols={2}>
                        <Input label="Latitude" value={weatherForm.latitude} onChange={v=>setWeatherForm(f=>({...f,latitude:v}))} placeholder="50.9841"/>
                        <Input label="Longitude" value={weatherForm.longitude} onChange={v=>setWeatherForm(f=>({...f,longitude:v}))} placeholder="4.8365"/>
                    </FormRow>
                    <label style={{ display:"flex", alignItems:"center", gap:10, fontSize:13, color:T.text, cursor:"pointer" }}>
                        <input type="checkbox" checked={weatherForm.sms_alerts_enabled} onChange={e=>setWeatherForm(f=>({...f,sms_alerts_enabled:e.target.checked}))} style={{ accentColor:T.primary }}/>
                        Enable SMS alerts when a storm is forecast
                    </label>
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                        <Btn variant="primary" onClick={saveWeatherSettings}>Save Weather Settings</Btn>
                        <Btn variant="secondary" onClick={()=>refreshWeather()} disabled={!weatherForm.latitude || !weatherForm.longitude || weatherLoading}>
                            {weatherLoading ? "Loading..." : "Refresh Live Weather"}
                        </Btn>
                    </div>
                    <div style={{ fontSize:12, color:T.textMuted, lineHeight:1.6 }}>
                        Free live weather uses Open-Meteo. SMS alerts can be sent through an Android SMS gateway that uses your own SIM card and phone number when storm risk is detected.
                    </div>
                    {weatherError && <div style={{ background:T.dangerBg, color:T.danger, borderRadius:T.rs, padding:"9px 12px", fontSize:12 }}>{weatherError}</div>}
                    {weather?.current && (
                        <div style={{ background:T.surfaceAlt, borderRadius:T.r, padding:14, display:"flex", flexDirection:"column", gap:8 }}>
                            <div style={{ display:"flex", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
                                <div>
                                    <div style={{ fontSize:12, color:T.textMuted }}>Current weather</div>
                                    <div style={{ fontSize:18, fontWeight:800, color:T.text }}>
                                        {weather.current.temperature_2m}°C · {WEATHER_CODE_LABELS[weather.current.weather_code] || `Code ${weather.current.weather_code}`}
                                    </div>
                                </div>
                                <div style={{ fontSize:12, color:T.textSub }}>
                                    Wind {weather.current.wind_speed_10m} km/h · Gusts {weather.current.wind_gusts_10m} km/h
                                </div>
                            </div>
                            <div style={{ fontSize:12, color:weather.storm?.active ? T.danger : T.success }}>
                                {weather.storm?.active
                                    ? `Storm warning: ${weather.storm.reason} expected around ${weather.storm.starts_at}.`
                                    : `No storm forecast right now. Max gust in forecast: ${Math.round(weather.storm?.max_gust_kmh || 0)} km/h.`}
                            </div>
                        </div>
                    )}
                </div>
            </Card>
            <Card style={{ marginBottom:16 }}>
                <div style={{ padding:"14px 18px 12px", borderBottom:`1px solid ${T.border}` }}>
                    <h2 style={{ margin:0, fontSize:14, fontWeight:800, color:T.text, fontFamily:"Fraunces, serif" }}>?? {t("data_mgmt")}</h2>
                </div>
                <div style={{ padding:18, display:"flex", flexDirection:"column", gap:12 }}>
                    <div style={{ fontSize:13, color:T.textSub, lineHeight:1.6, background:T.surfaceAlt, borderRadius:T.rs, padding:12 }}>
                        ?? Your garden data is now stored securely on the server in MySQL so it stays available across devices and sessions.
                    </div>
                    <div style={{ display:"flex", gap:8 }}>
                        <Btn variant="secondary" onClick={exportData} icon="??">{t("export_backup")}</Btn>
                        <Btn variant="danger" onClick={resetData} icon="???">{t("reset_all")}</Btn>
                    </div>
                    <div style={{ fontSize:11, color:T.textMuted }}>
                        {state.users.length} profiles · {state.gardens.length} gardens · {state.fields.length} beds · {state.plants.length} plants · {state.tasks.length} tasks
                    </div>
                </div>
            </Card>
            <Card>
                <div style={{ padding:24, textAlign:"center" }}>
                    <div style={{ fontSize:48, marginBottom:10 }}>??</div>
                    <div style={{ fontSize:20, fontWeight:900, color:T.text, fontFamily:"Fraunces, serif" }}>MyGarden</div>
                    <div style={{ fontSize:12, color:T.textMuted, marginTop:4, lineHeight:1.7 }}>
                        v2.0.0 · {t("app_subtitle")}<br/>
                        Multi-user · 4 languages · 60+ plant library<br/>
                        Greenhouse tracking · Offline-first
                    </div>
                    <div style={{ marginTop:14, display:"flex", justifyContent:"center", gap:8, flexWrap:"wrap" }}>
                        {["Multi-user","EN/NL/FR/DE","Plant Library","Greenhouse Tracker","Drag & Resize Editor"].map(f=><Badge key={f} color={T.primary} bg={T.primaryBg}>{f}</Badge>)}
                    </div>
                </div>
            </Card>
        </div>
    );
}

// ----
// SCREEN: DEV (Ollama plant generator)
