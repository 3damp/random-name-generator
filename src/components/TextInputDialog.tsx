import { FormEvent, useEffect, useId, useState } from "react"
import styles from "./TextInputDialog.module.css"

export default function TextInputDialog({
    title,
    inputLabel,
    initialText,
    submitButtonLabel,
    getWarningMessage,
    onSubmit,
    onClose,
}: {
    title: string
    inputLabel?: string
    initialText: string
    submitButtonLabel: string
    getWarningMessage?: (trimmedText: string) => string | null
    onSubmit: (trimmedText: string) => void
    onClose: () => void
}): JSX.Element {
    const titleId = useId()
    const [text, setText] = useState(initialText)
    const trimmedText = text.trim()
    const warningMessage = getWarningMessage?.(trimmedText) ?? null

    useEffect(() => {
        const closeOnEscapeKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose()
        }
        window.addEventListener("keydown", closeOnEscapeKey)
        return () => window.removeEventListener("keydown", closeOnEscapeKey)
    }, [onClose])

    const onFormSubmit = (event: FormEvent) => {
        event.preventDefault()
        if (trimmedText) onSubmit(trimmedText)
    }

    return (
        <>
            <div className={styles["backdrop"]} onClick={onClose} />
            <form
                className={styles["dialog"]}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                onSubmit={onFormSubmit}
            >
                <h2 id={titleId} className={styles["dialog-title"]}>
                    {title}
                </h2>
                <label className={styles["text-input-label"]}>
                    {inputLabel}
                    <input
                        className={styles["text-input"]}
                        aria-labelledby={inputLabel ? undefined : titleId}
                        value={text}
                        onChange={(event) => setText(event.target.value)}
                        onFocus={(event) => event.target.select()}
                        autoFocus
                    />
                </label>
                {getWarningMessage && (
                    <p
                        className={styles["warning-message"]}
                        style={{
                            visibility: warningMessage ? "visible" : "hidden",
                        }}
                    >
                        {warningMessage ?? " "}
                    </p>
                )}
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
                        className={styles["submit-button"]}
                        disabled={!trimmedText}
                    >
                        {submitButtonLabel}
                    </button>
                </div>
            </form>
        </>
    )
}
