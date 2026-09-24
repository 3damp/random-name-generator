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
}: {
    presetGroups: PresetGroup<PresetValue>[]
    onSelect: (value: PresetValue) => void
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
                    maxHeight: "90%",
                    overflowY: "auto",
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
                        padding: "0 10px 10px",
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
