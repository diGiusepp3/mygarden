import React from "react";

export function FormRow({ children, cols }) {
    return (
        <div style={{ display:"grid", gridTemplateColumns:`repeat(${cols||children?.length||2},1fr)`, gap:12 }}>
            {children}
        </div>
    );
}
