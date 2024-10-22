import styles from "./NumberInput.module.css"

const TextInput = ({
    name,
    value = "",
    onChange,
    error = "",
}: {
    name: string
    value?: string
    onChange?: (value: string) => void
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
                <input
                    type="text"
                    value={value}
                    onChange={onInputChanged}
                    style={{ width: "100%", textAlign: "left" }}
                />
            </div>
        </div>
    )
}

export default TextInput
