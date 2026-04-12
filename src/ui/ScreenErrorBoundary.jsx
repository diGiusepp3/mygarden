import React from "react";
import { T } from "../theme.js";
import { Card } from "./Card.jsx";
import { Btn } from "./Btn.jsx";

export class ScreenErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { error: null };
    }

    static getDerivedStateFromError(error) {
        return { error };
    }

    componentDidCatch(error, info) {
        console.error("GardenGrid screen crashed:", error, info);
    }

    render() {
        if (this.state.error) {
            return (
                <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:24, background:T.bg, color:T.text, fontFamily:"DM Sans, sans-serif" }}>
                    <Card style={{ maxWidth:720, width:"100%", padding:22 }}>
                        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                            <div style={{ fontSize:22, fontWeight:900, fontFamily:"Fraunces, serif" }}>⚠️ Screen crashed</div>
                            <div style={{ fontSize:13, color:T.textSub, lineHeight:1.6 }}>
                                The current screen failed to render. This boundary is here so the app does not disappear into a blank page.
                            </div>
                            <pre style={{ margin:0, padding:14, background:T.surfaceAlt, borderRadius:T.rs, overflow:"auto", fontSize:12, color:T.danger, whiteSpace:"pre-wrap" }}>
                                {String(this.state.error?.message || this.state.error)}
                            </pre>
                            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                                <Btn variant="primary" onClick={this.props.onGoDashboard}>Go to dashboard</Btn>
                                <Btn variant="secondary" onClick={() => { this.setState({ error: null }); this.props.onRetry?.(); }}>Retry screen</Btn>
                            </div>
                        </div>
                    </Card>
                </div>
            );
        }
        return this.props.children;
    }
}
