import {
    DEFAULT_PARAMETERS,
    JAPANESE_PARAMETERS,
} from "src/constants/predefinedParameters"
import { Parameters } from "src/scripts/randomNameGenerator"

export default function DefaultsPanel({
    onSelect,
}: {
    onSelect: (params: Parameters) => void
}): JSX.Element {
    const buttonStyles: React.CSSProperties = {
        padding: 10,
        margin: 10,
        borderRadius: 5,
        backgroundColor: "#666",
        color: "white",
        border: "none",
        cursor: "pointer",
        fontWeight: "bold",
        fontSize: "1.1em",
    }

    return (
        <>
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: "#000",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    opacity: 0.95,
                }}
            ></div>
            <div
                style={{
                    width: "95%",
                    backgroundColor: "#444",
                    borderRadius: 10,
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    opacity: 1,
                }}
            >
                <div
                    style={{
                        padding: 10,
                        fontWeight: "bold",
                        textAlign: "center",
                        fontSize: "1.3em",
                    }}
                >
                    Presets
                </div>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                    }}
                >
                    <button
                        style={buttonStyles}
                        onClick={() => onSelect(DEFAULT_PARAMETERS)}
                    >
                        Default
                    </button>
                    <button
                        style={buttonStyles}
                        onClick={() => onSelect(JAPANESE_PARAMETERS)}
                    >
                        Japenese
                    </button>
                </div>
            </div>
        </>
    )
}
