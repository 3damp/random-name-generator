import { useMemo, useState } from "react"
import MarkovNameGenerator, {
    NameLengthRange,
    getNameLengthRange,
    parseNameList,
} from "./scripts/markovNameGenerator"
import styles from "./NameGenerator.module.css"
import NumberInput from "./components/NumberInput"
import TextArea from "./components/TextArea"
import PresetsPanel from "./components/PresetsPanel"
import folderIcon from "./images/folder.png"
import { MARKOV_NAME_PRESET_GROUPS } from "./constants/markovNamePresets"
import useLocalStorageState from "./hooks/useLocalStorageState"

const DEFAULT_CONTEXT_LENGTH = 2
const MAX_CONTEXT_LENGTH = 5
const TRAINING_NAMES_STORAGE_KEY = "markovTrainingNames"
const CONTEXT_LENGTH_STORAGE_KEY = "markovContextLength"
const USER_LENGTH_RANGE_STORAGE_KEY = "markovUserLengthRange"
const DEFAULT_TRAINING_NAMES_TEXT =
    MARKOV_NAME_PRESET_GROUPS[0].presets[0].value.join("\n")

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

function isUserLengthRangeOrNull(
    value: unknown,
): value is NameLengthRange | null {
    if (value === null) return true
    if (typeof value !== "object") return false
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
    const [userLengthRange, setUserLengthRange] =
        useLocalStorageState<NameLengthRange | null>(
            USER_LENGTH_RANGE_STORAGE_KEY,
            null,
            isUserLengthRangeOrNull,
        )
    const [isPresetsPanelOpen, setIsPresetsPanelOpen] = useState(false)
    const [name, setName] = useState("???")

    const trainingNames = useMemo(() => parseNameList(namesText), [namesText])
    const trainingNamesLengthRange = useMemo(
        () => getNameLengthRange(trainingNames),
        [trainingNames],
    )
    const nameGenerator = useMemo(
        () => new MarkovNameGenerator(trainingNames, contextLength),
        [trainingNames, contextLength],
    )
    const lengthRange = userLengthRange ?? trainingNamesLengthRange

    const onClickGenerate = () => {
        setName(
            nameGenerator.generateName(
                lengthRange.minLength,
                lengthRange.maxLength,
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
        setUserLengthRange(newRange)
    }

    const updateContextLength = (value: number) => {
        setContextLength(Math.min(MAX_CONTEXT_LENGTH, Math.max(1, value || 1)))
    }

    const onPresetSelected = (names: string[]) => {
        setNamesText(names.join("\n"))
        setUserLengthRange(null)
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
                <h1>{name}</h1>
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
                        {userLengthRange && (
                            <button
                                onClick={() => setUserLengthRange(null)}
                                style={{
                                    alignSelf: "flex-end",
                                    border: "none",
                                    background: "none",
                                    color: "var(--accent-color-1)",
                                    cursor: "pointer",
                                    fontSize: "0.9em",
                                }}
                            >
                                Use lengths from names (
                                {trainingNamesLengthRange.minLength}-
                                {trainingNamesLengthRange.maxLength})
                            </button>
                        )}
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
                        isInitiallyOpen
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

export default NameGeneratorV3
