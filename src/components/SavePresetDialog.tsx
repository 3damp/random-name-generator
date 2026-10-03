import { FormEvent, useEffect, useState } from "react"
import styles from "./SavePresetDialog.module.css"

export default function SavePresetDialog({
    initialPresetName,
    existingPresetNames,
    onSave,
    onClose,
}: {
    initialPresetName: string
    existingPresetNames: string[]
    onSave: (presetName: string) => void
    onClose: () => void
}): JSX.Element {
    const [presetName, setPresetName] = useState(initialPresetName)
    const trimmedPresetName = presetName.trim()
    const isReplacingExistingPreset =
        existingPresetNames.includes(trimmedPresetName)

    useEffect(() => {
        const closeOnEscapeKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose()
        }
        window.addEventListener("keydown", closeOnEscapeKey)
        return () => window.removeEventListener("keydown", closeOnEscapeKey)
    }, [onClose])

    const onSubmit = (event: FormEvent) => {
        event.preventDefault()
        if (trimmedPresetName) onSave(trimmedPresetName)
    }

    return (
        <>
            <div className={styles["backdrop"]} onClick={onClose} />
            <form
                className={styles["dialog"]}
                role="dialog"
                aria-modal="true"
                aria-labelledby="save-preset-dialog-title"
                onSubmit={onSubmit}
            >
                <h2
                    id="save-preset-dialog-title"
                    className={styles["dialog-title"]}
                >
                    Save preset
                </h2>
                <label className={styles["preset-name-label"]}>
                    Preset name
                    <input
                        className={styles["preset-name-input"]}
                        value={presetName}
                        onChange={(event) => setPresetName(event.target.value)}
                        onFocus={(event) => event.target.select()}
                        autoFocus
                    />
                </label>
                <p
                    className={styles["replace-warning"]}
                    style={{
                        visibility: isReplacingExistingPreset
                            ? "visible"
                            : "hidden",
                    }}
                >
                    This will replace the existing preset.
                </p>
                <div className={styles["dialog-buttons"]}>
                    <button
                        type="button"
                        className={styles["cancel-button"]}
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className={styles["save-button"]}
                        disabled={!trimmedPresetName}
                    >
                        Save
                    </button>
                </div>
            </form>
        </>
    )
}
