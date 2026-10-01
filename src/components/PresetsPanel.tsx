export type Preset<PresetValue> = {
    label: string
    value: PresetValue
}

export type PresetGroup<PresetValue> = {
    label?: string
    presets: Preset<PresetValue>[]
}

export default function PresetsPanel<PresetValue>({
    presetGroups,
    onSelect,
    onClose,
}: {
    presetGroups: PresetGroup<PresetValue>[]
    onSelect: (value: PresetValue) => void
    onClose: () => void
}): JSX.Element {
    const buttonStyles: React.CSSProperties = {
        flex: 1,
        padding: 10,
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
                    backgroundColor: "#000",
                    position: "fixed",
                    inset: 0,
                    opacity: 0.95,
                    zIndex: 10,
                }}
            ></div>
            <div
                style={{
                    backgroundColor: "#444",
                    borderRadius: 10,
                    position: "fixed",
                    inset: 16,
                    zIndex: 11,
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <div
                    style={{
                        position: "relative",
                        padding: 10,
                        fontWeight: "bold",
                        textAlign: "center",
                        fontSize: "1.3em",
                    }}
                >
                    Presets
                    <button
                        aria-label="Close presets"
                        onClick={onClose}
                        style={{
                            position: "absolute",
                            top: 10,
                            left: 10,
                            width: 32,
                            height: 32,
                            padding: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "transparent",
                            color: "white",
                            border: "none",
                            cursor: "pointer",
                        }}
                    >
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 16 16"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                        >
                            <line x1="2" y1="2" x2="14" y2="14" />
                            <line x1="14" y1="2" x2="2" y2="14" />
                        </svg>
                    </button>
                </div>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                        padding: "0 10px 10px",
                        overflowY: "auto",
                        minHeight: 0,
                    }}
                >
                    {presetGroups.map((group, groupIndex) => (
                        <div key={group.label ?? groupIndex}>
                            {group.label && (
                                <div
                                    style={{
                                        fontWeight: "bold",
                                        marginBottom: 4,
                                    }}
                                >
                                    {group.label}
                                </div>
                            )}
                            <div style={{ display: "flex", gap: 10 }}>
                                {group.presets.map((preset) => (
                                    <button
                                        key={preset.label}
                                        style={buttonStyles}
                                        onClick={() => onSelect(preset.value)}
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}
