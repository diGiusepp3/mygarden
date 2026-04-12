import React from "react";
import { T } from "../theme.js";
import { Btn } from "./Btn.jsx";

export function FormActions({ onCancel, onSave, saveLabel="Save", t }) {
    return (
        <div style={{ display:"flex", justifyContent:"flex-end", gap:8, paddingTop:8, borderTop:`1px solid ${T.border}`, marginTop:4 }}>
            <Btn variant="secondary" onClick={onCancel}>{t?.("cancel")||"Cancel"}</Btn>
            <Btn variant="primary" onClick={onSave}>{saveLabel}</Btn>
        </div>
    );
}
