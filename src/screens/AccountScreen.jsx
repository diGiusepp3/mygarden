import { useState } from "react";
import { JourneyPanel, buildUserQuestProgress } from "../layout/GardenJourney.jsx";
import { Badge } from "../ui/Badge.jsx";
import { Btn } from "../ui/Btn.jsx";
import { Card } from "../ui/Card.jsx";
import { Input } from "../ui/Input.jsx";
import { StatCard } from "../ui/StatCard.jsx";
import { T } from "../theme.js";
import { LANG, LOCALE_MAP, useT } from "../translations.js";
import { USER_COLORS, USER_AVATARS } from "../constants.js";
import { forUser } from "../helpers.js";

// ACCOUNT SCREENexport default function AccountScreen({ state, dispatch, navigate, lang, onLogout }) {
    const t = useT(lang);
    const uid = state.activeUserId;
    const user = state.users.find(u => u.id === uid);
    if (!user) return null;

    const [tab, setTab] = useState("profile"); // "profile" | "password" | "stats"
    const [saved, setSaved] = useState(false);
    const showSaved = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

    // Profile form
    const [pName, setPName] = useState(user.name);
    const [pEmail, setPEmail] = useState(user.email||"");
    const [pAvatar, setPAvatar] = useState(user.avatar);
    const [pColor, setPColor] = useState(user.color);
    const [profileError, setProfileError] = useState("");

    const saveProfile = () => {
        setProfileError("");
        if (!pName.trim()) { setProfileError("Display name is required."); return; }
        const emailTaken = state.users.find(u => u.id!==uid && u.email?.toLowerCase()===pEmail.toLowerCase());
        if (pEmail && emailTaken) { setProfileError(t("email_taken")); return; }
        dispatch({ type:"UPDATE_USER", payload:{ ...user, name:pName.trim(), email:pEmail.trim(), avatar:pAvatar, color:pColor } });
        showSaved();
    };

    // Password form
    const [curPw, setCurPw] = useState("");
    const [newPw, setNewPw] = useState("");
    const [confPw, setConfPw] = useState("");
    const [pwError, setPwError] = useState("");

    const savePassword = () => {
        setPwError("");
        if (curPw !== user.password) { setPwError(t("wrong_current")); return; }
        if (newPw !== confPw) { setPwError(t("passwords_no_match")); return; }
        if (!newPw) { setPwError("New password cannot be empty."); return; }
        dispatch({ type:"UPDATE_USER", payload:{ ...user, password:newPw } });
        setCurPw(""); setNewPw(""); setConfPw("");
        showSaved();
    };

    // Stats
    const myGardens = forUser(state.gardens, uid);
    const myPlants  = forUser(state.plants, uid);
    const myTasks   = forUser(state.tasks, uid);
    const myFields  = forUser(state.fields, uid);
    const questBoard = buildUserQuestProgress({ user, gardens: myGardens, fields: myFields, structures: forUser(state.structures, uid), plants: myPlants, tasks: myTasks, lang });
    const joined    = user.created_at ? new Date(user.created_at).toLocaleDateString(LOCALE_MAP[lang]||"en-GB",{day:"numeric",month:"long",year:"numeric"}) : "—";

    const TABS = [["profile","??",t("edit_profile")],["password","??",t("change_password")],["stats","??",t("your_stats")]];
    const handleQuestStep = (step) => {
        if (step.actionKind === "confirm_email") {
            dispatch({ type:"SET_SETTING", payload:{ email_verified:true } });
            return;
        }
        if (step.route) {
            if (step.route === "gardens" && myGardens[0]) {
                dispatch({ type:"SET_ACTIVE_GARDEN", payload: myGardens[0].id });
            }
            if (step.route === "editor" && state.activeGardenId) {
                dispatch({ type:"SET_ACTIVE_GARDEN", payload: state.activeGardenId });
            }
            if (step.route === "plants" && state.activeGardenId) {
                dispatch({ type:"SET_ACTIVE_GARDEN", payload: state.activeGardenId });
            }
            navigate?.(step.route);
        }
    };

    return (
        <div style={{ padding:28, maxWidth:600, margin:"0 auto" }}>
            <JourneyPanel
                headerLabel={t("your_profile")}
                title={questBoard.headline}
                subtitle={questBoard.subtitle}
                progress={questBoard.progress}
                steps={questBoard.steps}
                tokens={questBoard.tokens}
                reward={questBoard.reward}
                nextStep={questBoard.nextStep}
                onStepAction={handleQuestStep}
                lang={lang}
                action={saved ? <Badge color={T.success} bg={T.successBg}>? {t("account_saved")}</Badge> : null}
            />

            <div style={{ display:"flex", alignItems:"center", gap:16, margin:"22px 0 28px" }}>
                <div style={{ width:64, height:64, borderRadius:99, background:user.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, flexShrink:0, boxShadow:T.shMd }}>{user.avatar}</div>
                <div style={{ flex:1 }}>
                    <h1 style={{ margin:0, fontSize:22, fontWeight:900, fontFamily:"Fraunces,serif", color:T.text }}>{user.name}</h1>
                    <div style={{ fontSize:13, color:T.textMuted, marginTop:2 }}>{user.email} · {t("joined")} {joined}</div>
                </div>
                <Btn variant="ghost" onClick={onLogout} icon="??">{t("logout")}</Btn>
            </div>

            {/* Tab bar */}
            <div style={{ display:"flex", gap:2, marginBottom:20, background:T.surfaceAlt, padding:4, borderRadius:T.r }}>
                {TABS.map(([id,icon,label]) => (
                    <button key={id} onClick={()=>setTab(id)} style={{ flex:1, padding:"9px 12px", borderRadius:T.rs, border:"none", background:tab===id?T.surface:"transparent", color:tab===id?T.text:T.textMuted, cursor:"pointer", fontFamily:"inherit", fontWeight:tab===id?700:500, fontSize:13, transition:"all 0.15s", display:"flex", alignItems:"center", justifyContent:"center", gap:6, boxShadow:tab===id?T.sh:"none" }}>
                        <span>{icon}</span><span>{label}</span>
                    </button>
                ))}
            </div>

            {/* Profile tab */}
            {tab==="profile" && (
                <Card style={{ padding:22 }}>
                    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                        {profileError && <div style={{ background:T.dangerBg, borderRadius:T.rs, padding:"9px 12px", fontSize:13, color:T.danger }}>?? {profileError}</div>}
                        <Input label={t("display_name")} value={pName} onChange={setPName} required/>
                        <Input label={t("email")} value={pEmail} onChange={setPEmail} type="email"/>
                        <div>
                            <label style={{ fontSize:11, fontWeight:700, color:T.textSub, letterSpacing:0.5, textTransform:"uppercase", display:"block", marginBottom:8 }}>Avatar</label>
                            <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
                                {USER_AVATARS.map(a => <button key={a} onClick={()=>setPAvatar(a)} style={{ width:42, height:42, borderRadius:T.rs, border:`2.5px solid ${pAvatar===a?T.primary:T.border}`, background:pAvatar===a?T.primaryBg:T.surface, fontSize:22, cursor:"pointer", transition:"all 0.15s" }}>{a}</button>)}
                            </div>
                        </div>
                        <div>
                            <label style={{ fontSize:11, fontWeight:700, color:T.textSub, letterSpacing:0.5, textTransform:"uppercase", display:"block", marginBottom:8 }}>{t("colour")}</label>
                            <div style={{ display:"flex", gap:8 }}>
                                {USER_COLORS.map(c => <button key={c} onClick={()=>setPColor(c)} style={{ width:32, height:32, borderRadius:99, background:c, border:`3px solid ${pColor===c?"#fff":"transparent"}`, outline:`2.5px solid ${pColor===c?c:"transparent"}`, cursor:"pointer", transition:"all 0.15s" }}/>)}
                            </div>
                        </div>
                        {/* Preview */}
                        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:T.surfaceAlt, borderRadius:T.rs }}>
                            <div style={{ width:38, height:38, borderRadius:99, background:pColor, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{pAvatar}</div>
                            <div>
                                <div style={{ fontWeight:700, color:T.text, fontSize:14 }}>{pName||"…"}</div>
                                <div style={{ fontSize:11, color:T.textMuted }}>{pEmail||"no email"}</div>
                            </div>
                        </div>
                        <Btn variant="primary" onClick={saveProfile} icon="??">{t("save")}</Btn>
                    </div>
                </Card>
            )}

            {/* Password tab */}
            {tab==="password" && (
                <Card style={{ padding:22 }}>
                    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                        {pwError && <div style={{ background:T.dangerBg, borderRadius:T.rs, padding:"9px 12px", fontSize:13, color:T.danger }}>?? {pwError}</div>}
                        <Input label={t("current_password")} value={curPw} onChange={setCurPw} type="password" placeholder="••••••••" required/>
                        <Input label={t("new_password")} value={newPw} onChange={setNewPw} type="password" placeholder="••••••••" required/>
                        <Input label={t("confirm_new")} value={confPw} onChange={setConfPw} type="password" placeholder="••••••••" required/>
                        <div style={{ fontSize:12, color:T.textMuted, padding:"8px 12px", background:T.surfaceAlt, borderRadius:T.rs }}>
                            ?? Wachtwoorden worden lokaal opgeslagen in je browser. MyGarden verstuurt geen gegevens naar een server.
                        </div>
                        <Btn variant="primary" onClick={savePassword} icon="??">{t("change_password")}</Btn>
                    </div>
                </Card>
            )}

            {/* Stats tab */}
            {tab==="stats" && (
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                        <StatCard icon="??" label={t("gardens")} value={myGardens.length} color={T.primary}/>
                        <StatCard icon="??" label={t("plant_varieties")} value={myPlants.length} color="#388E3C"/>
                        <StatCard icon="?" label={t("tasks_pending")} value={myTasks.filter(t2=>t2.status==="pending").length} color={T.warning}/>
                        <StatCard icon="??" label={t("ready_to_harvest")} value={myPlants.filter(p=>p.status==="harvestable").length} color={T.accent}/>
                    </div>
                    <Card style={{ padding:16 }}>
                        <div style={{ fontSize:12, color:T.textMuted, display:"flex", flexDirection:"column", gap:6 }}>
                            <div>?? {t("joined")}: <strong style={{color:T.text}}>{joined}</strong></div>
                            <div>?? Total plants in garden: <strong style={{color:T.text}}>{myPlants.reduce((s,p)=>s+(+p.quantity||0),0)}</strong></div>
                            <div>??? Total bed area: <strong style={{color:T.text}}>{forUser(state.fields,uid).reduce((s,f)=>s+f.width*f.height,0).toFixed(1)}m²</strong></div>
                            <div>? Tasks completed: <strong style={{color:T.success}}>{myTasks.filter(t2=>t2.status==="done").length}</strong></div>
                        </div>
                    </Card>
                    {/* Danger zone */}
                    <Card style={{ padding:16, border:`1px solid ${T.danger}44` }}>
                        <div style={{ fontSize:13, fontWeight:700, color:T.danger, marginBottom:8 }}>?? {t("danger_zone")}</div>
                        <div style={{ fontSize:12, color:T.textSub, marginBottom:12 }}>{t("delete_account_confirm")}</div>
                        <Btn variant="danger" onClick={() => {
                            if (window.confirm(t("delete_account_confirm"))) {
                                // Remove this user's data
                                dispatch({ type:"DELETE_USER", payload: uid });
                                setSession(null);
                                onLogout();
                            }
                        }}>{t("delete_account")}</Btn>
                    </Card>
                </div>
            )}
        </div>
    );
}
// ----

