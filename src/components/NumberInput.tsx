import styles from "./NumberInput.module.css"

const NumberInput = ({
    name,
    value = 0,
    onChange,
}: {
    name: string
    value?: number
    onChange?: (value: number) => void
}) => {
    const onInputChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (onChange) onChange(parseInt(event.target.value))
    }

    return (
        <div className={styles["field"]}>
            <label className={styles["label"]}>{name}</label>
            <div className={styles["inner-container"]}>
                <button
                    onClick={() => {
                        if (onChange) onChange(value - 1)
                    }}
                >
                    -
                </button>
                <input type="number" value={value} onChange={onInputChanged} />
                <button
                    onClick={() => {
                        if (onChange) onChange(value + 1)
                    }}
                >
                    +
                </button>
            </div>
        </div>
    )
}

export default NumberInput
