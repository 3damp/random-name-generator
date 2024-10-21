import styles from "./NumberInput.module.css"

const TextInput = ({
    name,
    value = "",
    onChange,
    height = "auto",
    textarea = false,
    error = "",
}: {
    name: string
    value?: string
    onChange?: (value: string) => void
    height?: string | number
    textarea?: boolean
    error?: string
}) => {
    const onInputChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (onChange) onChange(event.target.value)
    }

    return (
        <div className={styles["field"]}>
            <label className={styles["label"]}>
                {name} <span className={styles["error"]}>{error}</span>
            </label>
            <div
                className={styles["inner-container"]}
                style={{ width: "100%", display: "block" }}
            >
                {textarea ? (
                    <textarea
                        className={styles["textarea"]}
                        value={value}
                        onChange={(e) => {
                            if (onChange) onChange(e.target.value)
                        }}
                        style={{ height }}
                        spellCheck={false}
                    >
                        +
                    </textarea>
                ) : (
                    <input
                        type="text"
                        value={value}
                        onChange={onInputChanged}
                        style={{ width: "100%", textAlign: "left" }}
                    />
                )}
            </div>
        </div>
    )
}

export default TextInput
