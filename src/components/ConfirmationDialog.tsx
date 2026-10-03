import { useId } from "react"
import useCloseOnEscapeKey from "../hooks/useCloseOnEscapeKey"
import styles from "./Dialog.module.css"

export default function ConfirmationDialog({
    title,
    message,
    confirmButtonLabel,
    onConfirm,
    onClose,
}: {
    title: string
    message: string
    confirmButtonLabel: string
    onConfirm: () => void
    onClose: () => void
}): JSX.Element {
    const titleId = useId()
    useCloseOnEscapeKey(onClose, { blocksEscapeKeyForLayersBelow: true })

    return (
        <>
            <div className={styles["backdrop"]} onClick={onClose} />
            <div
                className={styles["dialog"]}
                role="alertdialog"
                aria-modal="true"
                aria-labelledby={titleId}
            >
                <h2 id={titleId} className={styles["dialog-title"]}>
                    {title}
                </h2>
                <p className={styles["dialog-message"]}>{message}</p>
                <div className={styles["dialog-buttons"]}>
                    <button
                        type="button"
                        className={styles["cancel-button"]}
                        onClick={onClose}
                        autoFocus
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className={styles["danger-button"]}
                        onClick={onConfirm}
                    >
                        {confirmButtonLabel}
                    </button>
                </div>
            </div>
        </>
    )
}
