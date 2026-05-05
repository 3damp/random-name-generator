import { useState } from "react"
import SyllableNameGenerator, {
    DEFAULT_V2_DATA,
    NameGeneratorV2Data,
} from "./scripts/syllableNameGenerator"
import styles from "./NameGenerator.module.css"
import NumberInput from "./components/NumberInput"
import TextArea from "./components/TextArea"

const nameGenerator = new SyllableNameGenerator()

const NameGeneratorV2: React.FC = () => {
    const [data, setData] = useState<NameGeneratorV2Data>(DEFAULT_V2_DATA)
    const [advancedJson, setAdvancedJson] = useState(
        JSON.stringify(DEFAULT_V2_DATA, null, "\t"),
    )
    const [advancedJsonError, setAdvancedJsonError] = useState("")
    const [styleName, setStyleName] = useState(
        () => Object.keys(DEFAULT_V2_DATA.styles)[0] ?? "",
    )
    const [syllableCount, setSyllableCount] = useState(0)
    const [name, setName] = useState("???")

    const styleNames = Object.keys(data.styles)

    const onClickGenerate = () => {
        setName(nameGenerator.generateName(syllableCount, styleName))
    }

    const onAdvancedJsonChange = (value: string) => {
        setAdvancedJson(value)
        try {
            const parsed: NameGeneratorV2Data = JSON.parse(value)
            nameGenerator.setData(parsed)
            setData(parsed)
            const newStyles = Object.keys(parsed.styles)
            if (!newStyles.includes(styleName)) setStyleName(newStyles[0] ?? "")
            setAdvancedJsonError("")
        } catch {
            setAdvancedJsonError("⚠️Invalid JSON")
        }
    }

    const updateSyllableCount = (value: number) => {
        setSyllableCount(Math.max(0, value))
    }

    return (
        <div className={styles["main-container"]}>
            <header className={styles["header"]}>
                <h1>{name}</h1>
            </header>
            <div className={styles["scrollable-container"]}>
                <div className={styles["scrollable-content"]}>
                    <div className={styles["field-container"]}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            <label>Style</label>
                            <select
                                value={styleName}
                                onChange={(e) => setStyleName(e.target.value)}
                                style={{
                                    fontSize: "1em",
                                    padding: "4px 8px",
                                    borderRadius: 4,
                                    border: "1px solid var(--accent-color-1)",
                                    background: "var(--background-color, #1e1e1e)",
                                    color: "inherit",
                                }}
                            >
                                {styleNames.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <NumberInput
                            name="Syllable Count (0 = random)"
                            value={syllableCount}
                            onChange={updateSyllableCount}
                        />
                    </div>
                    <TextArea
                        name="Advanced settings (JSON)"
                        value={advancedJson}
                        height={300}
                        onChange={onAdvancedJsonChange}
                        error={advancedJsonError}
                    />
                </div>
            </div>
            <footer className={styles["footer"]}>
                <button
                    className={styles["generate-button"]}
                    onClick={onClickGenerate}
                >
                    GENERATE
                </button>
            </footer>
        </div>
    )
}

export default NameGeneratorV2
