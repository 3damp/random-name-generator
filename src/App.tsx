import { useState } from "react"
import "./App.css"
import NameGenerator from "./NameGenerator"
import NameGeneratorV2 from "./NameGeneratorV2"

function App() {
    const [useV2, setUseV2] = useState(true)

    return (
        <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "center", padding: "8px", gap: "8px", flexShrink: 0 }}>
                <button
                    onClick={() => setUseV2(false)}
                    style={{ fontWeight: useV2 ? "normal" : "bold", opacity: useV2 ? 0.5 : 1, border: "1px solid var(--accent-color-1)", borderRadius: 4, padding: "4px 8px", background: "var(--background-color, #1e1e1e)", color: "inherit" }}
                >
                    V1
                </button>
                <button
                    onClick={() => setUseV2(true)}
                    style={{ fontWeight: useV2 ? "bold" : "normal", opacity: useV2 ? 1 : 0.5, border: "1px solid var(--accent-color-1)", borderRadius: 4, padding: "4px 8px", background: "var(--background-color, #1e1e1e)", color: "inherit" }}
                >
                    V2
                </button>
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
                {useV2 ? <NameGeneratorV2 /> : <NameGenerator />}
            </div>
        </div>
    )
}

export default App
