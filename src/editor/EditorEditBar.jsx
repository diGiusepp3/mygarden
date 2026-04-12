import { Btn } from "../ui/Btn.jsx";
import { Input } from "../ui/Input.jsx";
import { Sel } from "../ui/Sel.jsx";
import { Textarea } from "../ui/Textarea.jsx";
import { FormRow } from "../ui/FormRow.jsx";
import { T } from "../theme.js";
import { LANG } from "../translations.js";
import { STRUCT_ICONS, ZONE_ICONS, ZONE_TYPES, ZONE_LABEL_K } from "../constants.js";
import { polygonArea } from "../helpers.js";
import { MAINTENANCE_STRUCT_TYPES } from "../gardenMeta.js";
import { renderSlotSeedPlan } from "../slotSeedPlanView.jsx";

/**
 * Bottom edit bar — toont wanneer een item geselecteerd is.
 * Inline bewerkingsformulier voor zones, slots, fields en structures.
 */
export function EditorEditBar({
    selItem, selKind, editForm, setEditForm, saveEdit, dispatch,
    setSelId, setSelKind, fields, slots, plants, garden, lang, navigate,
}) {
    if (!selItem || !editForm) return null;

    const openPlantsForSlot = (slotId) => {
        if (navigate) navigate("plants", { slot: slotId });
    };

    const inlineInput = (value, onChange) => (
        <input
            value={value}
            onChange={onChange}
            style={{ fontFamily:"inherit", fontSize:13, color:T.text, background:T.bg, border:`1.5px solid ${T.border}`, borderRadius:T.rs, padding:"6px 10px", outline:"none", width:"100%" }}
        />
    );

    return (
        <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderTop:"none", borderRadius:`0 0 ${T.r} ${T.r}`, padding:"14px 18px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                <span style={{ fontSize:20 }}>
                    {selKind === "struct" ? (STRUCT_ICONS[selItem.type] || "🏗️")
                     : selKind === "zone" ? (ZONE_ICONS[selItem.type] || "🌿")
                     : selKind === "slot" ? "🌱"
                     : "🟩"}
                </span>
                <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:T.text }}>{selItem.name}</div>
                    <div style={{ fontSize:11, color:T.textMuted }}>
                        {selKind === "zone" ? "Polygon zone" : selKind === "slot" ? "Plantrij" : "Edit inline or type exact values"}
                    </div>
                </div>
                <Btn size="sm" variant="ghost" onClick={() => { setSelId(null); setSelKind(null); }}>✕</Btn>
            </div>

            {selKind === "zone" ? (
                <>
                    <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:8, alignItems:"end" }}>
                        <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                            <label style={{ fontSize:10, fontWeight:700, color:T.textSub, letterSpacing:0.5, textTransform:"uppercase" }}>Name</label>
                            {inlineInput(editForm.name, e => setEditForm(f => ({ ...f, name:e.target.value })))}
                        </div>
                        <Sel label="Type" value={editForm.type} onChange={v => setEditForm(f => ({ ...f, type:v }))}
                            options={ZONE_TYPES.map(z => ({ value:z, label:`${ZONE_ICONS[z]} ${LANG[lang]?.[ZONE_LABEL_K[z]] || LANG.en[ZONE_LABEL_K[z]] || z}` }))} />
                    </div>
                    <div style={{ marginTop:10 }}>
                        <Textarea label="Notes" value={editForm.notes} onChange={v => setEditForm(f => ({ ...f, notes:v }))} rows={2} />
                    </div>
                    <div style={{ marginTop:10, display:"flex", gap:8, alignItems:"center" }}>
                        <Btn size="sm" variant="primary" onClick={saveEdit}>💾 Save Zone</Btn>
                        <span style={{ fontSize:11, color:T.textMuted }}>• {selItem.points?.length || 0} points · {polygonArea(selItem.points || []).toFixed(1)}m²</span>
                        <div style={{ flex:1 }} />
                        <Btn size="sm" variant="danger" onClick={() => {
                            if (window.confirm("Delete this zone?")) {
                                dispatch({ type:"DELETE_ZONE", payload:selItem.id });
                                setSelId(null); setSelKind(null);
                            }
                        }}>Delete Zone</Btn>
                    </div>
                </>
            ) : selKind === "slot" ? (
                <div style={{ display:"grid", gap:10 }}>
                    <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:8, alignItems:"end" }}>
                        <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                            <label style={{ fontSize:10, fontWeight:700, color:T.textSub, letterSpacing:0.5, textTransform:"uppercase" }}>Name</label>
                            {inlineInput(editForm.name, e => setEditForm(f => ({ ...f, name:e.target.value })))}
                        </div>
                        <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                            <label style={{ fontSize:10, fontWeight:700, color:T.textSub, letterSpacing:0.5, textTransform:"uppercase" }}>Label</label>
                            {inlineInput(editForm.label, e => setEditForm(f => ({ ...f, label:e.target.value })))}
                        </div>
                    </div>
                    <FormRow cols={4}>
                        <Input label="Rows" value={editForm.row_count} onChange={e => setEditForm(f => ({ ...f, row_count:e.target.value }))} type="number" min="1" max="24" />
                        <Input label="Spacing (cm)" value={editForm.spacing_cm} onChange={e => setEditForm(f => ({ ...f, spacing_cm:e.target.value }))} type="number" min="1" max="200" />
                        <Input label="Plants" value={editForm.plant_count} onChange={e => setEditForm(f => ({ ...f, plant_count:e.target.value }))} type="number" min="0" max="1000" />
                        <Sel label="Orientation" value={editForm.orientation || "horizontal"} onChange={v => setEditForm(f => ({ ...f, orientation:v }))}
                            options={[{ value:"horizontal", label:"Horizontal" }, { value:"vertical", label:"Vertical (90°)" }]} />
                    </FormRow>
                    <Input label="Row length (m)" value={editForm.row_length_m} onChange={e => setEditForm(f => ({ ...f, row_length_m:e.target.value }))} type="number" min="0.1" max="100" />
                    <Textarea label="Notes" value={editForm.notes} onChange={v => setEditForm(f => ({ ...f, notes:v }))} rows={2} />
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                        <Btn size="sm" variant="primary" onClick={saveEdit}>💾 Save</Btn>
                        <Btn size="sm" variant="secondary" onClick={() => dispatch({ type:"UPDATE_SLOT", payload:{ ...selItem, orientation: selItem.orientation === "vertical" ? "horizontal" : "vertical" } })}>Rotate 90°</Btn>
                        <Btn size="sm" variant="ghost" onClick={() => openPlantsForSlot(selItem.id)}>🌱 Plants</Btn>
                        <Btn size="sm" variant="danger" onClick={() => {
                            if (window.confirm("Delete this row?")) {
                                const childMap = new Map();
                                slots.forEach(s => {
                                    if (!s.parent_id) return;
                                    const list = childMap.get(s.parent_id) || [];
                                    list.push(s);
                                    childMap.set(s.parent_id, list);
                                });
                                const descendants = [];
                                const walk = (id) => { (childMap.get(id) || []).forEach(child => { descendants.push(child); walk(child.id); }); };
                                walk(selItem.id);
                                const slotIds = [selItem.id, ...descendants.map(s => s.id)];
                                plants.filter(p => slotIds.includes(p.slot_id)).forEach(p => dispatch({ type:"DELETE_PLANT", payload:p.id }));
                                slotIds.slice().reverse().forEach(id => dispatch({ type:"DELETE_SLOT", payload:id }));
                                setSelId(null); setSelKind(null);
                            }
                        }}>Delete Row</Btn>
                    </div>
                    <div style={{ fontSize:11, color:T.textMuted }}>
                        {Math.max(1, Math.floor(Number(selItem.row_count) || 1))} rows · {selItem.orientation === "vertical" ? "vertical" : "horizontal"}
                    </div>
                    {renderSlotSeedPlan(selItem, { compact:true })}
                </div>
            ) : (
                <>
                    <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr", gap:8, alignItems:"end" }}>
                        <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                            <label style={{ fontSize:10, fontWeight:700, color:T.textSub, letterSpacing:0.5, textTransform:"uppercase" }}>Name</label>
                            {inlineInput(editForm.name, e => setEditForm(f => ({ ...f, name:e.target.value })))}
                        </div>
                        {[["X (m)","x",0,garden.width],["Y (m)","y",0,garden.height],["W (m)","width",0.1,garden.width],["H (m)","height",0.1,garden.height]].map(([lbl, key, mn, mx]) => (
                            <div key={key} style={{ display:"flex", flexDirection:"column", gap:3 }}>
                                <label style={{ fontSize:10, fontWeight:700, color:T.textSub, letterSpacing:0.5, textTransform:"uppercase" }}>{lbl}</label>
                                <input type="number" value={editForm[key]} min={mn} max={mx} step={0.1}
                                    onChange={e => setEditForm(f => ({ ...f, [key]:e.target.value }))}
                                    style={{ fontFamily:"inherit", fontSize:13, color:T.text, background:T.bg, border:`1.5px solid ${T.border}`, borderRadius:T.rs, padding:"6px 8px", outline:"none", width:"100%" }} />
                            </div>
                        ))}
                    </div>
                    {selKind === "struct" && (
                        <div style={{ marginTop:10 }}>
                            <Sel label="Linked field" value={editForm.linked_field_id || ""}
                                onChange={v => setEditForm(f => ({ ...f, linked_field_id:v }))}
                                options={[
                                    { value:"", label:"No link" },
                                    ...fields.filter(f => f.garden_id === selItem.garden_id).map(f => ({ value:f.id, label:f.name })),
                                ]}
                            />
                        </div>
                    )}
                    {selKind === "struct" && (
                        <div style={{ display:"grid", gap:10, marginTop:10 }}>
                            <Textarea label="Info" value={editForm.info || ""} onChange={v => setEditForm(f => ({ ...f, info:v }))} rows={2} placeholder="Short description shown in details" />
                            {MAINTENANCE_STRUCT_TYPES.has(selItem.type) && (
                                <>
                                    <FormRow cols={2}>
                                        <Input label="Species / type" value={editForm.species || ""} onChange={v => setEditForm(f => ({ ...f, species:v }))} placeholder="Beech, yew, privet..." />
                                        <Input label="Prune interval (weeks)" value={editForm.prune_interval_weeks || ""} onChange={v => setEditForm(f => ({ ...f, prune_interval_weeks:v }))} type="number" min="0" max="52" />
                                    </FormRow>
                                    <Input label="Next prune date" value={editForm.next_prune_date || ""} onChange={v => setEditForm(f => ({ ...f, next_prune_date:v }))} type="date" />
                                    <Textarea label="Maintenance notes" value={editForm.maintenance_notes || ""} onChange={v => setEditForm(f => ({ ...f, maintenance_notes:v }))} rows={2} placeholder="Cut in late spring and after summer growth" />
                                </>
                            )}
                        </div>
                    )}
                    <div style={{ marginTop:10, display:"flex", gap:8, alignItems:"center" }}>
                        <Btn size="sm" variant="primary" onClick={saveEdit}>💾 Save</Btn>
                        <span style={{ fontSize:11, color:T.textMuted }}>· {selItem.width}m × {selItem.height}m = {(selItem.width * selItem.height).toFixed(1)}m²</span>
                        <div style={{ flex:1 }} />
                        {selKind === "field" && <Btn size="sm" variant="danger" onClick={() => { if (window.confirm("Delete this bed?")) { dispatch({ type:"DELETE_FIELD", payload:selItem.id }); setSelId(null); } }}>Delete Bed</Btn>}
                        {selKind === "struct" && <Btn size="sm" variant="danger" onClick={() => { if (window.confirm("Delete this structure?")) { dispatch({ type:"DELETE_STRUCT", payload:selItem.id }); setSelId(null); } }}>Delete Structure</Btn>}
                    </div>
                </>
            )}
        </div>
    );
}
