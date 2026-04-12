import { useState } from "react";
import { JourneyPanel, buildJourneyTrack } from "../layout/GardenJourney.jsx";
import { Btn } from "../ui/Btn.jsx";
import { Badge } from "../ui/Badge.jsx";
import { Card } from "../ui/Card.jsx";
import { Input } from "../ui/Input.jsx";
import { Sel } from "../ui/Sel.jsx";
import { T } from "../theme.js";
import { LANG, useT } from "../translations.js";
import { USER_COLORS, USER_AVATARS } from "../constants.js";
import { gid } from "../helpers.js";
import { setSession } from "../state/persistence.js";

// LOGIN SCREENexport default function LoginScreen({ state, dispatch, onLogin }) {
    const [mode, setMode] = useState("login"); // "login" | "register"
    const [lang, setLang] = useState("nl");
    const t = useT(lang);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [confirmPw, setConfirmPw] = useState("");
    const [avatar, setAvatar] = useState("??");
    const [color, setColor] = useState(USER_COLORS[0]);
    const [error, setError] = useState("");
    const [shake, setShake] = useState(false);
    const onboardingJourneyBase = buildJourneyTrack({ user: null, gardens: [], fields: [], plants: [], structures: [], lang });
    const onboardingJourney = {
        ...onboardingJourneyBase,
        title: onboardingJourneyBase.headline,
        subtitle: onboardingJourneyBase.subtitle,
        progress: mode === "register" ? 12 : 0,
    };

    const doShake = () => { setShake(true); setTimeout(() => setShake(false), 500); };

    const handleLogin = () => {
        setError("");
        const user = state.users.find(u => u.email?.toLowerCase() === email.toLowerCase() && u.password === password);
        if (!user) { setError(t("wrong_password")); doShake(); return; }
        dispatch({ type:"SET_ACTIVE_USER", payload: user.id });
        setSession(user.id);
        onLogin(user.id);
    };

    const handleRegister = () => {
        setError("");
        if (!name.trim() || !email.trim() || !password) { setError("Please fill in all required fields."); doShake(); return; }
        if (password !== confirmPw) { setError(t("passwords_no_match")); doShake(); return; }
        if (state.users.find(u => u.email?.toLowerCase() === email.toLowerCase())) { setError(t("email_taken")); doShake(); return; }
        const newUser = { id:gid(), name:name.trim(), email:email.trim().toLowerCase(), password, avatar, color, settings:{ lang }, created_at:new Date().toISOString() };
        dispatch({ type:"ADD_USER", payload: newUser });
        dispatch({ type:"SET_ACTIVE_USER", payload: newUser.id });
        setSession(newUser.id);
        onLogin(newUser.id);
    };

    const LANGS = [["en","????"],["nl","????"],["fr","????"],["de","????"]];

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;0,9..144,800;0,9..144,900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        html, body { margin:0; padding:0; font-family:'DM Sans',system-ui,sans-serif; background:#F5F0E8; }
        @keyframes gg-shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }
        .gg-shake { animation: gg-shake 0.45s ease; }
      `}</style>
            <div style={{ minHeight:"100vh", background:`linear-gradient(160deg, #1E4A08 0%, #2B5C10 40%, #F5F0E8 100%)`, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
                <div style={{ width:"100%", maxWidth:420 }}>
                    {/* Logo */}
                    <div style={{ textAlign:"center", marginBottom:32 }}>
                        <div style={{ fontSize:56, marginBottom:8 }}>??</div>
                        <div style={{ fontSize:28, fontWeight:900, color:"#FFF", fontFamily:"Fraunces,serif", letterSpacing:-0.5 }}>MyGarden</div>
                        <div style={{ fontSize:13, color:"rgba(255,255,255,0.65)", marginTop:4 }}>{t("app_subtitle")}</div>
                        {/* Lang picker */}
                        <div style={{ display:"flex", gap:6, justifyContent:"center", marginTop:12 }}>
                            {LANGS.map(([code,flag]) => (
                                <button key={code} onClick={()=>setLang(code)} style={{ background:lang===code?"rgba(255,255,255,0.25)":"rgba(255,255,255,0.08)", border:`1.5px solid ${lang===code?"rgba(255,255,255,0.6)":"transparent"}`, borderRadius:T.rs, padding:"4px 10px", cursor:"pointer", fontSize:16, color:"#FFF", transition:"all 0.15s" }}>{flag}</button>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginBottom:16 }}>
            <JourneyPanel
                headerLabel={t("dashboard_missions")}
                title={onboardingJourney.title}
                subtitle={onboardingJourney.subtitle}
                progress={onboardingJourney.progress}
                steps={onboardingJourney.steps}
                tokens={onboardingJourney.tokens}
                reward={onboardingJourney.reward}
                nextStep={onboardingJourney.nextStep}
                lang={lang}
            />
                    </div>

                    {/* Card */}
                    <div className={shake?"gg-shake":""} style={{ background:T.surface, borderRadius:T.rl, padding:"28px 30px", boxShadow:T.shLg }}>
                        <h2 style={{ margin:"0 0 4px", fontSize:20, fontWeight:900, color:T.text, fontFamily:"Fraunces,serif" }}>
                            {mode==="login" ? t("login_title") : t("register_title")}
                        </h2>
                        <p style={{ margin:"0 0 20px", fontSize:13, color:T.textMuted }}>{mode==="login" ? t("login_sub") : t("register_sub")}</p>

                        {error && <div style={{ background:T.dangerBg, border:`1px solid ${T.danger}33`, borderRadius:T.rs, padding:"9px 12px", fontSize:13, color:T.danger, marginBottom:14 }}>?? {error}</div>}

                        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                            {mode==="register" && (
                                <>
                                    <Input label={t("display_name")} value={name} onChange={setName} placeholder="e.g. Marie" required/>
                                    <div>
                                        <label style={{ fontSize:11, fontWeight:700, color:T.textSub, letterSpacing:0.5, textTransform:"uppercase", display:"block", marginBottom:6 }}>Avatar</label>
                                        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                                            {USER_AVATARS.map(a => <button key={a} onClick={()=>setAvatar(a)} style={{ width:36, height:36, borderRadius:T.rs, border:`2px solid ${avatar===a?T.primary:T.border}`, background:avatar===a?T.primaryBg:T.surface, fontSize:18, cursor:"pointer" }}>{a}</button>)}
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize:11, fontWeight:700, color:T.textSub, letterSpacing:0.5, textTransform:"uppercase", display:"block", marginBottom:6 }}>{t("colour")}</label>
                                        <div style={{ display:"flex", gap:6 }}>
                                            {USER_COLORS.map(c => <button key={c} onClick={()=>setColor(c)} style={{ width:26, height:26, borderRadius:99, background:c, border:`3px solid ${color===c?"#fff":"transparent"}`, outline:`2px solid ${color===c?c:"transparent"}`, cursor:"pointer" }}/>)}
                                        </div>
                                    </div>
                                </>
                            )}
                            <Input label={t("email")} value={email} onChange={setEmail} type="email" placeholder="naam@example.com" required/>
                            <Input label={t("password")} value={password} onChange={setPassword} type="password" placeholder="••••••••" required/>
                            {mode==="register" && <Input label={t("confirm_password")} value={confirmPw} onChange={setConfirmPw} type="password" placeholder="••••••••" required/>}
                        </div>

                        <Btn variant="primary" size="lg" style={{ width:"100%", marginTop:18, justifyContent:"center" }} onClick={mode==="login"?handleLogin:handleRegister}>
                            {mode==="login" ? t("login") : t("register")}
                        </Btn>

                        <div style={{ textAlign:"center", marginTop:16, fontSize:13, color:T.textMuted }}>
                            {mode==="login" ? t("no_account") : t("have_account")}{" "}
                            <button onClick={()=>{ setMode(mode==="login"?"register":"login"); setError(""); }} style={{ background:"none", border:"none", color:T.primary, fontWeight:700, cursor:"pointer", fontSize:13, fontFamily:"inherit" }}>
                                {mode==="login" ? t("register") : t("login")}
                            </button>
                        </div>
                    </div>

                    {/* Demo hint */}
                    <div style={{ textAlign:"center", marginTop:14, fontSize:12, color:"rgba(255,255,255,0.45)" }}>
                        Demo accounts: alex@gardengrid.app / garden123 &nbsp;?&nbsp; sam@gardengrid.app / moestuin1
                    </div>
                </div>
            </div>
        </>
    );
}

// ----

