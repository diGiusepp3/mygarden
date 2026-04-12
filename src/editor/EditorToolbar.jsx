import { Btn } from "../ui/Btn.jsx";
import { T } from "../theme.js";

/**
 * Toolbar bovenaan de garden editor.
 * Bevat zoom controls, 2D/3D toggle, zone tool en wall tool.
 */
export function EditorToolbar({
    garden, zoom, fitZoom, viewMode, zoneDraft, wallDraft, setZoom, setViewMode,
    onBeginZone, onCancelZone, onFinishZone,
    onBeginWall, onCancelWall, onFinishWall,
}) {
    const activeDraft = zoneDraft ? "zone" : wallDraft ? "wall" : null;

    return (
        <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 14px", background:T.surfaceAlt, borderRadius:`${T.r} ${T.r} 0 0`, borderBottom:`1px solid ${T.border}`, flexWrap:"wrap" }}>
            <span style={{ fontSize:12, color:T.textSub, flex:"1 1 320px", fontWeight:600 }}>
                🗺️ {garden.width}m × {garden.height}m · <span style={{ color:T.primary }}>Drag</span> to move · <span style={{ color:T.accent }}>Handles</span> to resize · Click to edit
            </span>
            {/* Zone tool */}
            <Btn size="sm" variant={activeDraft === "zone" ? "danger" : "accent"}
                onClick={activeDraft === "zone" ? onCancelZone : onBeginZone}
                disabled={activeDraft === "wall"}
            >
                {activeDraft === "zone" ? "Cancel Zone" : "Add Zone"}
            </Btn>
            {activeDraft === "zone" && (
                <Btn size="sm" variant="primary" onClick={onFinishZone} disabled={zoneDraft.points.length < 3}>
                    Finish Zone
                </Btn>
            )}
            {/* Wall tool */}
            <Btn size="sm" variant={activeDraft === "wall" ? "danger" : "secondary"}
                onClick={activeDraft === "wall" ? onCancelWall : onBeginWall}
                disabled={activeDraft === "zone"}
                style={{ gap:4 }}
            >
                🧱 {activeDraft === "wall" ? "Cancel Wall" : "Add Wall"}
            </Btn>
            {activeDraft === "wall" && (
                <Btn size="sm" variant="primary" onClick={onFinishWall} disabled={wallDraft.points.length < 2}>
                    Finish Wall
                </Btn>
            )}
            {/* View & zoom */}
            <Btn size="sm" variant={viewMode === "3d" ? "primary" : "secondary"} onClick={() => setViewMode(v => v === "3d" ? "2d" : "3d")}>
                {viewMode === "3d" ? "2D" : "3D"}
            </Btn>
            <Btn size="sm" variant="secondary" onClick={() => setZoom(z => Math.max(0.35, +(z - 0.15).toFixed(2)))}>-</Btn>
            <span style={{ fontSize:12, color:T.textSub, minWidth:38, textAlign:"center", fontWeight:700 }}>
                {Math.round(zoom * fitZoom * 100)}%
            </span>
            <Btn size="sm" variant="secondary" onClick={() => setZoom(z => Math.min(2.5, +(z + 0.15).toFixed(2)))}>+</Btn>
            <Btn size="sm" variant="ghost" onClick={() => setZoom(1)}>Reset</Btn>
        </div>
    );
}
