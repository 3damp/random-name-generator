import useCloseOnEscapeKey from "../hooks/useCloseOnEscapeKey"
import styles from "./PresetsPanel.module.css"

export type Preset<PresetValue> = {
    label: string
    value: PresetValue
}

export type PresetWithVariants<PresetValue> = {
    label: string
    variants: Preset<PresetValue>[]
}

export type BuiltInPreset<PresetValue> =
    | Preset<PresetValue>
    | PresetWithVariants<PresetValue>

function hasVariants<PresetValue>(
    preset: BuiltInPreset<PresetValue>,
): preset is PresetWithVariants<PresetValue> {
    return "variants" in preset
}

export default function PresetsPanel<PresetValue>({
    customPresets,
    builtInPresets,
    onSelect,
    onDeleteCustomPreset,
    onClose,
}: {
    customPresets?: Preset<PresetValue>[]
    builtInPresets: BuiltInPreset<PresetValue>[]
    onSelect: (value: PresetValue, customPresetName: string | null) => void
    onDeleteCustomPreset?: (customPresetName: string) => void
    onClose: () => void
}): JSX.Element {
    useCloseOnEscapeKey(onClose)

    return (
        <>
            <div className={styles["backdrop"]} onClick={onClose} />
            <aside
                className={styles["drawer"]}
                role="dialog"
                aria-modal="true"
                aria-labelledby="presets-panel-title"
            >
                <div className={styles["drawer-header"]}>
                    <h2
                        id="presets-panel-title"
                        className={styles["drawer-title"]}
                    >
                        Presets
                    </h2>
                    <button
                        aria-label="Close presets"
                        className={styles["close-button"]}
                        onClick={onClose}
                    >
                        <svg
                            width="18"
                            height="18"
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
                <div className={styles["scrollable-sections"]}>
                    {customPresets && (
                        <section>
                            <h3 className={styles["section-title"]}>Custom</h3>
                            {customPresets.length === 0 ? (
                                <p className={styles["empty-section-message"]}>
                                    No custom presets yet
                                </p>
                            ) : (
                                <ul className={styles["preset-list"]}>
                                    {customPresets.map((preset) => (
                                        <li
                                            key={preset.label}
                                            className={
                                                styles["custom-preset-row"]
                                            }
                                        >
                                            <button
                                                className={
                                                    styles["preset-button"]
                                                }
                                                onClick={() =>
                                                    onSelect(
                                                        preset.value,
                                                        preset.label,
                                                    )
                                                }
                                            >
                                                {preset.label}
                                            </button>
                                            {onDeleteCustomPreset && (
                                                <button
                                                    className={
                                                        styles[
                                                            "delete-preset-button"
                                                        ]
                                                    }
                                                    aria-label={`Delete preset ${preset.label}`}
                                                    onClick={() =>
                                                        onDeleteCustomPreset(
                                                            preset.label,
                                                        )
                                                    }
                                                >
                                                    <svg
                                                        width="18"
                                                        height="18"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <path d="M3 6h18" />
                                                        <path d="M8 6V4h8v2" />
                                                        <path d="M6 6l1 14h10l1-14" />
                                                        <path d="M10 10v6M14 10v6" />
                                                    </svg>
                                                </button>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    )}
                    <section>
                        <h3 className={styles["section-title"]}>Built-in</h3>
                        <ul className={styles["preset-list"]}>
                            {builtInPresets.map((preset) =>
                                hasVariants(preset) ? (
                                    <li
                                        key={preset.label}
                                        className={
                                            styles["preset-with-variants"]
                                        }
                                    >
                                        <span>{preset.label}</span>
                                        <div
                                            className={
                                                styles["variant-buttons"]
                                            }
                                        >
                                            {preset.variants.map((variant) => (
                                                <button
                                                    key={variant.label}
                                                    className={
                                                        styles["variant-button"]
                                                    }
                                                    aria-label={`${preset.label} – ${variant.label}`}
                                                    onClick={() =>
                                                        onSelect(
                                                            variant.value,
                                                            null,
                                                        )
                                                    }
                                                >
                                                    {variant.label}
                                                </button>
                                            ))}
                                        </div>
                                    </li>
                                ) : (
                                    <li key={preset.label}>
                                        <button
                                            className={styles["preset-button"]}
                                            onClick={() =>
                                                onSelect(preset.value, null)
                                            }
                                        >
                                            {preset.label}
                                        </button>
                                    </li>
                                ),
                            )}
                        </ul>
                    </section>
                </div>
            </aside>
        </>
    )
}
