import React from "react";
import { Badge } from "./ui/Badge.jsx";
import { T } from "./theme.js";
import { slotSeedPlan } from "./helpers.js";

export const renderSlotSeedPlan = (slot, { compact = false } = {}) => {
    const plan = slotSeedPlan(slot);
    if (!plan || plan.plants <= 0) return null;
    const dotSize = compact ? 8 : 10;
    const dotGap = compact ? 3 : 4;
    const isVertical = plan.orientation === "vertical";
    return (
        <div style={{ marginTop:8, display:"flex", flexDirection:isVertical ? "row" : "column", gap:6, flexWrap:isVertical ? "wrap" : "nowrap" }}>
            {plan.rowsData.map(row => (
                <div
                    key={row.label}
                    style={{
                        display:"flex",
                        flexDirection:isVertical ? "column" : "row",
                        alignItems:isVertical ? "stretch" : "center",
                        gap:8,
                        minWidth:isVertical ? 54 : 0,
                        flex:isVertical ? "1 1 54px" : "unset",
                    }}
                >
                    <Badge color={T.primary} bg={T.primaryBg} style={{ flexShrink:0, alignSelf:isVertical ? "flex-start" : "auto" }}>{row.label}</Badge>
                    <div
                        style={{
                            display:"flex",
                            flexDirection:isVertical ? "column" : "row",
                            alignItems:"center",
                            gap:dotGap,
                            flexWrap:"nowrap",
                            overflowX:isVertical ? "hidden" : "auto",
                            overflowY:isVertical ? "auto" : "hidden",
                            minWidth:0,
                            minHeight:isVertical ? 0 : "unset",
                            flex:1,
                            paddingBottom:isVertical ? 0 : 2,
                            paddingRight:isVertical ? 2 : 0,
                        }}
                    >
                        {row.seeds.map(seed => (
                            <span
                                key={seed.id}
                                title={`${row.label} seed`}
                                style={{
                                    width:dotSize,
                                    height:dotSize,
                                    borderRadius:"50%",
                                    background:seed.color,
                                    flexShrink:0,
                                    boxShadow:"inset 0 0 0 1px rgba(255,255,255,0.55), 0 0 0 1px rgba(0,0,0,0.08)",
                                }}
                            />
                        ))}
                        {row.hiddenCount > 0 && <span style={{ fontSize:11, color:T.textMuted, whiteSpace:"nowrap" }}>+{row.hiddenCount}</span>}
                    </div>
                </div>
            ))}
            {plan.hiddenPlants > 0 && <div style={{ fontSize:11, color:T.textMuted }}>+{plan.hiddenPlants} more seedlings hidden for performance</div>}
        </div>
    );
};
