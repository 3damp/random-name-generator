import "./App.css"
import useLocalStorageState from "./hooks/useLocalStorageState"
import NameGenerator from "./NameGenerator"
import NameGeneratorV2 from "./NameGeneratorV2"
import NameGeneratorV3 from "./NameGeneratorV3"

const GENERATOR_VERSIONS = {
    V1: {
        component: NameGenerator,
        description:
            "Letter by letter from weighted rules.",
    },
    V2: {
        component: NameGeneratorV2,
        description:
            "Creates syllables from weighted consonant and vowel pools.",
    },
    V3: {
        component: NameGeneratorV3,
        description:
            "Learns patterns from sample names (Markov chain).",
    },
}

type GeneratorVersion = keyof typeof GENERATOR_VERSIONS

const SELECTED_VERSION_STORAGE_KEY = "selectedGeneratorVersion"

function isGeneratorVersion(value: unknown): value is GeneratorVersion {
    return typeof value === "string" && value in GENERATOR_VERSIONS
}

function App() {
    const [selectedVersion, setSelectedVersion] = useLocalStorageState(
        SELECTED_VERSION_STORAGE_KEY,
        "V1",
        isGeneratorVersion,
    )

    const getButtonStyle = (isActive: boolean) => ({
        fontWeight: isActive ? "bold" : "normal",
        opacity: isActive ? 1 : 0.5,
        border: "none",
        borderRadius: 4,
        padding: "6px 10px",
        background: "var(--background-color, #131313)",
        color: "inherit",
    })

    const SelectedNameGenerator =
        GENERATOR_VERSIONS[selectedVersion].component

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
            <p
                style={{
                    margin: 0,
                    padding: "0 8px 8px",
                    textAlign: "center",
                    fontSize: "0.7em",
                    opacity: 0.6,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    flexShrink: 0,
                }}
            >
                {GENERATOR_VERSIONS[selectedVersion].description}
            </p>
            <div style={{ flex: 1, minHeight: 0 }}>
                <SelectedNameGenerator />
            </div>
        </div>
    )
}

export default App
