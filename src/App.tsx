import { useState } from "react"
import "./App.css"
import NameGenerator from "./NameGenerator"
import NameGeneratorV2 from "./NameGeneratorV2"

function App() {
    const [useV2, setUseV2] = useState(true)

    const getButtonStyle = (isActive: boolean) => ({
        fontWeight: isActive ? "bold" : "normal",
        opacity: isActive ? 1 : 0.5,
        border: "none",
        borderRadius: 4,
        padding: "6px 10px",
        background: "var(--background-color, #131313)",
        color: "inherit",
    })

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    padding: "8px",
                    gap: "8px",
                    flexShrink: 0,
                }}
            >
                <button
                    className="version-toggle-button"
                    onClick={() => setUseV2(false)}
                    style={getButtonStyle(!useV2)}
                >
                    V1
                </button>
                <button
                    className="version-toggle-button"
                    onClick={() => setUseV2(true)}
                    style={getButtonStyle(useV2)}
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
