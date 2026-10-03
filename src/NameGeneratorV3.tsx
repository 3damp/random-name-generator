import { useMemo, useState } from "react"
import MarkovNameGenerator, {
    moveNameToTopOfNameListText,
    NameLengthRange,
    NO_FITTING_NAME_MESSAGE,
    NO_SAMPLE_NAMES_MESSAGE,
    parseNameList,
} from "./scripts/markovNameGenerator"
import styles from "./NameGenerator.module.css"
import NumberInput from "./components/NumberInput"
import TextArea from "./components/TextArea"
import TextInput from "./components/TextInput"
import PresetsPanel, { Preset } from "./components/PresetsPanel"
import TextInputDialog from "./components/TextInputDialog"
import { BUILT_IN_MARKOV_NAME_PRESETS } from "./constants/markovNamePresets"
import { NORSE_NAMES } from "./constants/markovNamePresets/norseNames"
import useLocalStorageState from "./hooks/useLocalStorageState"
import folderIcon from "./images/folder.png"

const DEFAULT_BLENDED_CONTEXT_LENGTH = 2
const MAX_BLENDED_CONTEXT_LENGTH = 4
const TRAINING_NAMES_STORAGE_KEY = "markovTrainingNames"
const BLENDED_CONTEXT_LENGTH_STORAGE_KEY = "markovContextLength"
const LENGTH_RANGE_STORAGE_KEY = "markovLengthRange"
const GENERATE_MULTIPLE_NAMES_STORAGE_KEY = "markovGenerateMultipleNames"
const REQUIRED_NAME_START_STORAGE_KEY = "markovRequiredNameStart"
const REQUIRED_NAME_END_STORAGE_KEY = "markovRequiredNameEnd"
const CUSTOM_PRESETS_STORAGE_KEY = "markovCustomPresets"
const LOADED_CUSTOM_PRESET_NAME_STORAGE_KEY = "markovLoadedCustomPresetName"
const MULTIPLE_NAMES_COUNT = 4
const DEFAULT_LENGTH_RANGE: NameLengthRange = { minLength: 5, maxLength: 9 }
const DEFAULT_TRAINING_NAMES_TEXT = NORSE_NAMES.neutral.join("\n")
const GENERATION_FAILURE_MESSAGES = [
    NO_SAMPLE_NAMES_MESSAGE,
    NO_FITTING_NAME_MESSAGE,
]

function isBoolean(value: unknown): value is boolean {
    return typeof value === "boolean"
}

function isString(value: unknown): value is string {
    return typeof value === "string"
}

function isValidBlendedContextLength(value: unknown): value is number {
    return (
        typeof value === "number" &&
        value >= 1 &&
        value <= MAX_BLENDED_CONTEXT_LENGTH
    )
}

function isPositiveInteger(value: unknown): value is number {
    return Number.isInteger(value) && (value as number) >= 1
}

function isStringOrNull(value: unknown): value is string | null {
    return value === null || isString(value)
}

function isCustomPresetList(value: unknown): value is Preset<string[]>[] {
    return (
        Array.isArray(value) &&
        value.every(
            (preset) =>
                isString(preset?.label) &&
                Array.isArray(preset?.value) &&
                preset.value.every(isString),
        )
    )
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
    const [blendedContextLength, setBlendedContextLength] =
        useLocalStorageState(
            BLENDED_CONTEXT_LENGTH_STORAGE_KEY,
            DEFAULT_BLENDED_CONTEXT_LENGTH,
            isValidBlendedContextLength,
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
    const [requiredNameStart, setRequiredNameStart] = useLocalStorageState(
        REQUIRED_NAME_START_STORAGE_KEY,
        "",
        isString,
    )
    const [requiredNameEnd, setRequiredNameEnd] = useLocalStorageState(
        REQUIRED_NAME_END_STORAGE_KEY,
        "",
        isString,
    )
    const [customPresets, setCustomPresets] = useLocalStorageState(
        CUSTOM_PRESETS_STORAGE_KEY,
        [],
        isCustomPresetList,
    )
    const [loadedCustomPresetName, setLoadedCustomPresetName] =
        useLocalStorageState(
            LOADED_CUSTOM_PRESET_NAME_STORAGE_KEY,
            null,
            isStringOrNull,
        )
    const [isPresetsPanelOpen, setIsPresetsPanelOpen] = useState(false)
    const [isSavePresetDialogOpen, setIsSavePresetDialogOpen] = useState(false)
    const [generatedNames, setGeneratedNames] = useState<string[]>([])
    const [nameToAddAsSample, setNameToAddAsSample] = useState<string | null>(
        null,
    )

    const trainingNames = useMemo(() => parseNameList(namesText), [namesText])
    const nameGenerator = useMemo(
        () => new MarkovNameGenerator(trainingNames, blendedContextLength),
        [trainingNames, blendedContextLength],
    )

    const onClickGenerate = () => {
        const nameCount = isGeneratingMultipleNames ? MULTIPLE_NAMES_COUNT : 1
        setGeneratedNames(
            Array.from({ length: nameCount }, () =>
                nameGenerator.generateName(
                    lengthRange.minLength,
                    lengthRange.maxLength,
                    requiredNameStart,
                    requiredNameEnd,
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

    const onPresetSelected = (
        names: string[],
        customPresetName: string | null,
    ) => {
        setNamesText(names.join("\n"))
        setLoadedCustomPresetName(customPresetName)
        setIsPresetsPanelOpen(false)
    }

    const saveCustomPreset = (presetName: string) => {
        const savedPreset = { label: presetName, value: trainingNames }
        const isReplacingExistingPreset = customPresets.some(
            (preset) => preset.label === presetName,
        )
        setCustomPresets(
            isReplacingExistingPreset
                ? customPresets.map((preset) =>
                      preset.label === presetName ? savedPreset : preset,
                  )
                : [...customPresets, savedPreset],
        )
        setLoadedCustomPresetName(presetName)
        setIsSavePresetDialogOpen(false)
    }

    const addSampleName = (sampleName: string) => {
        setNamesText(moveNameToTopOfNameListText(namesText, sampleName))
        setNameToAddAsSample(null)
    }

    const renderGeneratedName = (generatedName: string) => (
        <span className={styles["generated-name"]}>
            {generatedName}
            {!GENERATION_FAILURE_MESSAGES.includes(generatedName) && (
                <button
                    className={styles["add-as-sample-button"]}
                    aria-label={`Add ${generatedName} as sample name`}
                    onClick={() => setNameToAddAsSample(generatedName)}
                >
                    +
                </button>
            )}
        </span>
    )

    return (
        <div className={styles["main-container"]}>
            <header className={styles["app-header"]}>
                <div className={styles["header-icon-buttons"]}>
                    <button
                        className={styles["header-icon-button"]}
                        aria-label="Open presets"
                        onClick={() =>
                            setIsPresetsPanelOpen(!isPresetsPanelOpen)
                        }
                    >
                        <img
                            src={folderIcon}
                            alt=""
                            className={styles["presets-button-icon"]}
                        />
                    </button>
                    <button
                        className={styles["header-icon-button"]}
                        aria-label="Save preset"
                        onClick={() => setIsSavePresetDialogOpen(true)}
                    >
                        <svg
                            className={styles["save-button-icon"]}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinejoin="round"
                        >
                            <path d="M5 3h11l5 5v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
                            <path d="M7 3v5h8V3" />
                            <rect x="7" y="13" width="10" height="8" />
                        </svg>
                    </button>
                </div>
                <button
                    className={styles["header-generate-button"]}
                    onClick={onClickGenerate}
                >
                    GENERATE
                </button>
            </header>
            {isPresetsPanelOpen && (
                <PresetsPanel
                    customPresets={customPresets}
                    builtInPresets={BUILT_IN_MARKOV_NAME_PRESETS}
                    onSelect={onPresetSelected}
                    onClose={() => setIsPresetsPanelOpen(false)}
                />
            )}
            {isSavePresetDialogOpen && (
                <TextInputDialog
                    title="Save preset"
                    inputLabel="Preset name"
                    initialText={loadedCustomPresetName ?? ""}
                    submitButtonLabel="Save"
                    getWarningMessage={(presetName) =>
                        customPresets.some(
                            (preset) => preset.label === presetName,
                        )
                            ? "This will replace the existing preset."
                            : null
                    }
                    onSubmit={saveCustomPreset}
                    onClose={() => setIsSavePresetDialogOpen(false)}
                />
            )}
            {nameToAddAsSample !== null && (
                <TextInputDialog
                    title="Add as sample name:"
                    initialText={nameToAddAsSample}
                    submitButtonLabel="Add"
                    onSubmit={addSampleName}
                    onClose={() => setNameToAddAsSample(null)}
                />
            )}
            <section className={styles["generated-names-display"]}>
                {generatedNames.length === 0 ? (
                    <h1>???</h1>
                ) : generatedNames.length === 1 ? (
                    <h1>{renderGeneratedName(generatedNames[0])}</h1>
                ) : (
                    <div
                        style={{
                            display: "grid",
                            rowGap: "0.2em",
                            textAlign: "center",
                            fontSize: "1.2em",
                            fontWeight: "bold",
                        }}
                    >
                        {generatedNames.map((generatedName, index) => (
                            <span key={index}>
                                {renderGeneratedName(generatedName)}
                            </span>
                        ))}
                    </div>
                )}
            </section>
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
                        <label
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 4,
                                padding: "10px 0",
                                fontSize: "1.44em",
                            }}
                        >
                            <span
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                }}
                            >
                                Similarity to samples
                                <span style={{ opacity: 0.6 }}>
                                    {blendedContextLength.toFixed(1)}
                                </span>
                            </span>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    fontSize: "0.7em",
                                }}
                            >
                                Random
                                <input
                                    type="range"
                                    min={1}
                                    max={MAX_BLENDED_CONTEXT_LENGTH}
                                    step={0.1}
                                    value={blendedContextLength}
                                    onChange={(event) =>
                                        setBlendedContextLength(
                                            Number(event.target.value),
                                        )
                                    }
                                    style={{
                                        flexGrow: 1,
                                        accentColor: "var(--accent-color-1)",
                                    }}
                                />
                                Strict
                            </div>
                        </label>
                    </div>
                    <div style={{ display: "flex", gap: 20 }}>
                        <TextInput
                            name="Start with"
                            value={requiredNameStart}
                            onChange={setRequiredNameStart}
                        />
                        <TextInput
                            name="End with"
                            value={requiredNameEnd}
                            onChange={setRequiredNameEnd}
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
        </div>
    )
}

export default NameGeneratorV3
