import styles from "./NumberInput.module.css"

const TextInput = ({
    name,
    value = "",
    onChange,
    height = "auto",
    textarea = false,
}: {
    name: string
    value?: string
    onChange?: (value: string) => void
    height?: string | number
    textarea?: boolean
}) => {
    const onInputChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (onChange) onChange(event.target.value)
    }

    return (
        <label className={styles["label"]}>
            {name}
            <div
                className={styles["inner-container"]}
                style={{ width: textarea ? "100%" : "auto" }}
            >
                {textarea ? (
                    <textarea
                        className={styles["textarea"]}
                        value={value}
                        onChange={(e) => {
                            if (onChange) onChange(e.target.value)
                        }}
                        style={{ height }}
                    >
                        +
                    </textarea>
                ) : (
                    <input
                        type="text"
                        value={value}
                        onChange={onInputChanged}
                        style={{ width: 120 }}
                    />
                )}
            </div>
        </label>
    )
}

export default TextInput
