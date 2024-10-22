import { useState } from "react"
import styles from "./NumberInput.module.css"

const TextArea = ({
    name,
    value = "",
    onChange,
    height = "auto",
    error = "",
}: {
    name: string
    value?: string
    onChange?: (value: string) => void
    height?: string | number
    error?: string
}) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className={styles["field"]}>
            <label
                className={styles["label"]}
                onClick={() => {
                    setIsOpen(!isOpen)
                }}
                style={{ width: "100%" }}
            >
                {name}{" "}
                <span className={styles["error"]} style={{ marginRight: 20 }}>
                    {error}
                </span>
            </label>
            <span
                style={{
                    textAlign: "center",
                    width: 20,
                    position: "absolute",
                    top: 10,
                    right: 0,
                }}
            >
                {isOpen ? "-" : "+"}
            </span>
            <div
                className={styles["inner-container"]}
                style={{
                    width: "100%",
                    display: "block",
                    height: isOpen ? height : 0,
                }}
            >
                <textarea
                    className={styles["textarea"]}
                    value={value}
                    onChange={(e) => {
                        if (onChange) onChange(e.target.value)
                    }}
                    style={{ height: "100%" }}
                    spellCheck={false}
                >
                    +
                </textarea>
            </div>
        </div>
    )
}

export default TextArea
