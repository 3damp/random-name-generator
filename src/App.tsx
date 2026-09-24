import { useState } from "react"
import "./App.css"
import NameGenerator from "./NameGenerator"
import NameGeneratorV2 from "./NameGeneratorV2"
import NameGeneratorV3 from "./NameGeneratorV3"

const GENERATOR_VERSIONS = {
    V1: NameGenerator,
    V2: NameGeneratorV2,
    V3: NameGeneratorV3,
}

type GeneratorVersion = keyof typeof GENERATOR_VERSIONS

function App() {
    const [selectedVersion, setSelectedVersion] =
        useState<GeneratorVersion>("V1")

    const getButtonStyle = (isActive: boolean) => ({
        fontWeight: isActive ? "bold" : "normal",
        opacity: isActive ? 1 : 0.5,
        border: "none",
        borderRadius: 4,
        padding: "6px 10px",
        background: "var(--background-color, #131313)",
        color: "inherit",
    })

    const SelectedNameGenerator = GENERATOR_VERSIONS[selectedVersion]

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
                {(Object.keys(GENERATOR_VERSIONS) as GeneratorVersion[]).map(
                    (version) => (
                        <button
                            key={version}
                            className="version-toggle-button"
                            onClick={() => setSelectedVersion(version)}
                            style={getButtonStyle(version === selectedVersion)}
                        >
                            {version}
                        </button>
                    ),
                )}
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
                <SelectedNameGenerator />
            </div>
        </div>
    )
}

export default App
