import { useMemo, useState } from "react"
import MarkovNameGenerator, {
    NameLengthRange,
    parseNameList,
} from "./scripts/markovNameGenerator"
import styles from "./NameGenerator.module.css"
import NumberInput from "./components/NumberInput"
import TextArea from "./components/TextArea"
import PresetsPanel from "./components/PresetsPanel"
import folderIcon from "./images/folder.png"
import { MARKOV_NAME_PRESET_GROUPS } from "./constants/markovNamePresets"
import useLocalStorageState from "./hooks/useLocalStorageState"

const DEFAULT_CONTEXT_LENGTH = 3
const MAX_CONTEXT_LENGTH = 5
const TRAINING_NAMES_STORAGE_KEY = "markovTrainingNames"
const CONTEXT_LENGTH_STORAGE_KEY = "markovContextLength"
const LENGTH_RANGE_STORAGE_KEY = "markovLengthRange"
const GENERATE_MULTIPLE_NAMES_STORAGE_KEY = "markovGenerateMultipleNames"
const MULTIPLE_NAMES_COUNT = 6
const DEFAULT_LENGTH_RANGE: NameLengthRange = { minLength: 4, maxLength: 9 }
const DEFAULT_TRAINING_NAMES_TEXT =
    MARKOV_NAME_PRESET_GROUPS[5].presets[2].value.join("\n")

function isBoolean(value: unknown): value is boolean {
    return typeof value === "boolean"
}

function isString(value: unknown): value is string {
    return typeof value === "string"
}

function isValidContextLength(value: unknown): value is number {
    return (
        Number.isInteger(value) &&
        (value as number) >= 1 &&
        (value as number) <= MAX_CONTEXT_LENGTH
    )
}

function isPositiveInteger(value: unknown): value is number {
    return Number.isInteger(value) && (value as number) >= 1
}

function isLengthRange(value: unknown): value is NameLengthRange {
    if (typeof value !== "object" || value === null) return false
    const { minLength, maxLength } = value as Partial<NameLengthRange>
    return (
        isPositiveInteger(minLength) &&
        isPositiveInteger(maxLength) &&
        minLength <= maxLength
    )
}

const NameGeneratorV3: React.FC = () => {
    const [namesText, setNamesText] = useLocalStorageState(
        TRAINING_NAMES_STORAGE_KEY,
        DEFAULT_TRAINING_NAMES_TEXT,
        isString,
    )
    const [contextLength, setContextLength] = useLocalStorageState(
        CONTEXT_LENGTH_STORAGE_KEY,
        DEFAULT_CONTEXT_LENGTH,
        isValidContextLength,
    )
    const [lengthRange, setLengthRange] = useLocalStorageState(
        LENGTH_RANGE_STORAGE_KEY,
        DEFAULT_LENGTH_RANGE,
        isLengthRange,
    )
    const [isGeneratingMultipleNames, setIsGeneratingMultipleNames] =
        useLocalStorageState(
            GENERATE_MULTIPLE_NAMES_STORAGE_KEY,
            false,
            isBoolean,
        )
    const [isPresetsPanelOpen, setIsPresetsPanelOpen] = useState(false)
    const [generatedNames, setGeneratedNames] = useState(["???"])

    const trainingNames = useMemo(() => parseNameList(namesText), [namesText])
    const nameGenerator = useMemo(
        () => new MarkovNameGenerator(trainingNames, contextLength),
        [trainingNames, contextLength],
    )

    const onClickGenerate = () => {
        const nameCount = isGeneratingMultipleNames ? MULTIPLE_NAMES_COUNT : 1
        setGeneratedNames(
            Array.from({ length: nameCount }, () =>
                nameGenerator.generateName(
                    lengthRange.minLength,
                    lengthRange.maxLength,
                ),
            ),
        )
    }

    const updateLengthRange = (changes: Partial<NameLengthRange>) => {
        const newRange = { ...lengthRange, ...changes }
        newRange.minLength = Math.max(1, newRange.minLength || 1)
        newRange.maxLength = Math.max(1, newRange.maxLength || 1)
        if (changes.minLength !== undefined)
            newRange.maxLength = Math.max(
                newRange.maxLength,
                newRange.minLength,
            )
        if (changes.maxLength !== undefined)
            newRange.minLength = Math.min(
                newRange.minLength,
                newRange.maxLength,
            )
        setLengthRange(newRange)
    }

    const updateContextLength = (value: number) => {
        setContextLength(Math.min(MAX_CONTEXT_LENGTH, Math.max(1, value || 1)))
    }

    const onPresetSelected = (names: string[]) => {
        setNamesText(names.join("\n"))
        setIsPresetsPanelOpen(false)
    }

    return (
        <div className={styles["main-container"]}>
            <header className={styles["header"]}>
                {isPresetsPanelOpen && (
                    <PresetsPanel
                        presetGroups={MARKOV_NAME_PRESET_GROUPS}
                        onSelect={onPresetSelected}
                    />
                )}
                <img
                    src={folderIcon}
                    alt="open icon"
                    onClick={() => setIsPresetsPanelOpen(!isPresetsPanelOpen)}
                    style={{
                        filter: "invert(1)",
                        width: "1em",
                        position: "absolute",
                        left: 20,
                        top: 20,
                    }}
                />
                {generatedNames.length === 1 ? (
                    <h1>{generatedNames[0]}</h1>
                ) : (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2, auto)",
                            columnGap: "2em",
                            rowGap: "0.2em",
                            textAlign: "center",
                            fontSize: "1.2em",
                            fontWeight: "bold",
                        }}
                    >
                        {generatedNames.map((generatedName, index) => (
                            <span key={index}>{generatedName}</span>
                        ))}
                    </div>
                )}
            </header>
            <div className={styles["scrollable-container"]}>
                <div className={styles["scrollable-content"]}>
                    <div className={styles["field-container"]}>
                        <NumberInput
                            name="Min Length"
                            value={lengthRange.minLength}
                            onChange={(value) =>
                                updateLengthRange({ minLength: value })
                            }
                        />
                        <NumberInput
                            name="Max Length"
                            value={lengthRange.maxLength}
                            onChange={(value) =>
                                updateLengthRange({ maxLength: value })
                            }
                        />
                        <NumberInput
                            name="Context Letters"
                            value={contextLength}
                            onChange={updateContextLength}
                        />
                    </div>
                    <TextArea
                        name={`Sample names (${trainingNames.length})`}
                        value={namesText}
                        height={300}
                        onChange={setNamesText}
                    />
                    <label
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "10px 0",
                            fontSize: "1.44em",
                        }}
                    >
                        Generate multiple names
                        <input
                            type="checkbox"
                            checked={isGeneratingMultipleNames}
                            onChange={(event) =>
                                setIsGeneratingMultipleNames(
                                    event.target.checked,
                                )
                            }
                            style={{ width: 20, height: 20 }}
                        />
                    </label>
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

export default NameGeneratorV3
