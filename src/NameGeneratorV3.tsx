import { useCallback, useEffect, useMemo, useState } from "react"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
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
import ConfirmationDialog from "./components/ConfirmationDialog"
import {
    BUILT_IN_MARKOV_NAME_PRESETS,
    buildPresetSettingsWithDefaultGenerationSettings,
    DEFAULT_CUSTOM_MARKOV_NAME_PRESETS,
    DEFAULT_GENERATION_SETTINGS,
    MarkovNamePresetSettings,
} from "./constants/markovNamePresets"
import { NORSE_NAMES } from "./constants/markovNamePresets/norseNames"
import useLocalStorageState from "./hooks/useLocalStorageState"
import folderIcon from "./images/folder.png"
import shareIcon from "./images/share.png"
import {
    compressJsonToUrlSafeText,
    decompressJsonFromUrlSafeText,
} from "./scripts/compressedUrlText"

const MAX_BLENDED_CONTEXT_LENGTH = 4
const TRAINING_NAMES_STORAGE_KEY = "markovTrainingNames"
const BLENDED_CONTEXT_LENGTH_STORAGE_KEY = "markovContextLength"
const LENGTH_RANGE_STORAGE_KEY = "markovLengthRange"
const GENERATE_MULTIPLE_NAMES_STORAGE_KEY = "markovGenerateMultipleNames"
const REQUIRED_NAME_START_STORAGE_KEY = "markovRequiredNameStart"
const REQUIRED_NAME_END_STORAGE_KEY = "markovRequiredNameEnd"
const CUSTOM_PRESETS_STORAGE_KEY = "markovCustomPresets"
const LOADED_CUSTOM_PRESET_NAME_STORAGE_KEY = "markovLoadedCustomPresetName"
const HAS_ADDED_DEFAULT_CUSTOM_PRESETS_STORAGE_KEY =
    "markovHasAddedDefaultCustomPresets"
const SHARED_PRESET_URL_HASH_KEY = "preset"
const SHARE_LINK_LENGTH_WARNING_THRESHOLD = 8000
const MULTIPLE_NAMES_COUNT = 4
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

function isStringList(value: unknown): value is string[] {
    return Array.isArray(value) && value.every(isString)
}

function isMarkovNamePresetSettings(
    value: unknown,
): value is MarkovNamePresetSettings {
    if (typeof value !== "object" || value === null) return false
    const {
        sampleNames,
        lengthRange,
        blendedContextLength,
        requiredNameStart,
        requiredNameEnd,
    } = value as Partial<MarkovNamePresetSettings>
    return (
        isStringList(sampleNames) &&
        isLengthRange(lengthRange) &&
        isValidBlendedContextLength(blendedContextLength) &&
        isString(requiredNameStart) &&
        isString(requiredNameEnd)
    )
}

type StoredCustomPreset = Preset<MarkovNamePresetSettings | string[]>

function isStoredCustomPresetList(
    value: unknown,
): value is StoredCustomPreset[] {
    return (
        Array.isArray(value) &&
        value.every(
            (preset) =>
                isString(preset?.label) &&
                (isStringList(preset?.value) ||
                    isMarkovNamePresetSettings(preset?.value)),
        )
    )
}

function convertSampleNameOnlyPresets(
    storedCustomPresets: StoredCustomPreset[],
): Preset<MarkovNamePresetSettings>[] {
    return storedCustomPresets.map(({ label, value }) => ({
        label,
        value: isStringList(value)
            ? buildPresetSettingsWithDefaultGenerationSettings(value)
            : value,
    }))
}

type SharedPreset = {
    presetName: string | null
    settings: MarkovNamePresetSettings
}

function isSharedPreset(value: unknown): value is SharedPreset {
    if (typeof value !== "object" || value === null) return false
    const { presetName, settings } = value as Partial<SharedPreset>
    return isStringOrNull(presetName) && isMarkovNamePresetSettings(settings)
}

function readSharedPresetTextFromUrlHash(): string | null {
    return new URLSearchParams(window.location.hash.slice(1)).get(
        SHARED_PRESET_URL_HASH_KEY,
    )
}

function removeHashFromUrl() {
    window.history.replaceState(
        window.history.state,
        "",
        window.location.pathname + window.location.search,
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
            DEFAULT_GENERATION_SETTINGS.blendedContextLength,
            isValidBlendedContextLength,
        )
    const [lengthRange, setLengthRange] = useLocalStorageState(
        LENGTH_RANGE_STORAGE_KEY,
        DEFAULT_GENERATION_SETTINGS.lengthRange,
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
        DEFAULT_GENERATION_SETTINGS.requiredNameStart,
        isString,
    )
    const [requiredNameEnd, setRequiredNameEnd] = useLocalStorageState(
        REQUIRED_NAME_END_STORAGE_KEY,
        DEFAULT_GENERATION_SETTINGS.requiredNameEnd,
        isString,
    )
    const [storedCustomPresets, setCustomPresets] = useLocalStorageState(
        CUSTOM_PRESETS_STORAGE_KEY,
        [],
        isStoredCustomPresetList,
    )
    const [hasAddedDefaultCustomPresets, setHasAddedDefaultCustomPresets] =
        useLocalStorageState(
            HAS_ADDED_DEFAULT_CUSTOM_PRESETS_STORAGE_KEY,
            false,
            isBoolean,
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
    const [presetNameToDelete, setPresetNameToDelete] = useState<string | null>(
        null,
    )
    const [nameToAddAsSample, setNameToAddAsSample] = useState<string | null>(
        null,
    )
    const [
        sharedPresetNameToSaveAsCustomPreset,
        setSharedPresetNameToSaveAsCustomPreset,
    ] = useState<string | null>(null)

    const customPresets = useMemo(
        () => convertSampleNameOnlyPresets(storedCustomPresets),
        [storedCustomPresets],
    )
    const trainingNames = useMemo(() => parseNameList(namesText), [namesText])

    useEffect(() => {
        if (hasAddedDefaultCustomPresets) return
        const missingDefaultCustomPresets =
            DEFAULT_CUSTOM_MARKOV_NAME_PRESETS.filter(
                (defaultPreset) =>
                    !customPresets.some(
                        (preset) => preset.label === defaultPreset.label,
                    ),
            )
        setCustomPresets([...missingDefaultCustomPresets, ...customPresets])
        setHasAddedDefaultCustomPresets(true)
    }, [
        hasAddedDefaultCustomPresets,
        customPresets,
        setCustomPresets,
        setHasAddedDefaultCustomPresets,
    ])
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

    const applyPresetSettings = useCallback(
        (
            presetSettings: MarkovNamePresetSettings,
            customPresetName: string | null,
        ) => {
            setNamesText(presetSettings.sampleNames.join("\n"))
            setLengthRange(presetSettings.lengthRange)
            setBlendedContextLength(presetSettings.blendedContextLength)
            setRequiredNameStart(presetSettings.requiredNameStart)
            setRequiredNameEnd(presetSettings.requiredNameEnd)
            setLoadedCustomPresetName(customPresetName)
        },
        [
            setNamesText,
            setLengthRange,
            setBlendedContextLength,
            setRequiredNameStart,
            setRequiredNameEnd,
            setLoadedCustomPresetName,
        ],
    )

    useEffect(() => {
        const importSharedPresetFromUrlHash = async () => {
            const sharedPresetText = readSharedPresetTextFromUrlHash()
            if (sharedPresetText === null) return
            removeHashFromUrl()
            try {
                const sharedPreset =
                    await decompressJsonFromUrlSafeText(sharedPresetText)
                if (!isSharedPreset(sharedPreset))
                    throw new Error("Invalid shared preset")
                applyPresetSettings(sharedPreset.settings, null)
                setSharedPresetNameToSaveAsCustomPreset(
                    sharedPreset.presetName ?? "",
                )
            } catch {
                toast.error("This share link is invalid or incomplete.")
            }
        }
        importSharedPresetFromUrlHash()
        window.addEventListener("hashchange", importSharedPresetFromUrlHash)
        return () =>
            window.removeEventListener(
                "hashchange",
                importSharedPresetFromUrlHash,
            )
    }, [applyPresetSettings])

    const onPresetSelected = (
        presetSettings: MarkovNamePresetSettings,
        customPresetName: string | null,
    ) => {
        applyPresetSettings(presetSettings, customPresetName)
        setIsPresetsPanelOpen(false)
    }

    const copyShareLink = async () => {
        try {
            const sharedPreset: SharedPreset = {
                presetName: loadedCustomPresetName,
                settings: {
                    sampleNames: trainingNames,
                    lengthRange,
                    blendedContextLength,
                    requiredNameStart,
                    requiredNameEnd,
                },
            }
            const hashParameters = new URLSearchParams({
                [SHARED_PRESET_URL_HASH_KEY]:
                    await compressJsonToUrlSafeText(sharedPreset),
            })
            const shareLink = `${window.location.origin}${window.location.pathname}#${hashParameters}`
            await navigator.clipboard.writeText(shareLink)
            if (shareLink.length > SHARE_LINK_LENGTH_WARNING_THRESHOLD)
                toast.warning(
                    `Link copied, but it is long (${shareLink.length} characters). Some apps may cut it off.`,
                )
            else toast.success("Share link copied!")
        } catch {
            toast.error("Could not copy the share link.")
        }
    }

    const saveCustomPreset = (presetName: string) => {
        const savedPreset = {
            label: presetName,
            value: {
                sampleNames: trainingNames,
                lengthRange,
                blendedContextLength,
                requiredNameStart,
                requiredNameEnd,
            },
        }
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

    const deleteCustomPreset = (presetName: string) => {
        setCustomPresets(
            customPresets.filter((preset) => preset.label !== presetName),
        )
        if (loadedCustomPresetName === presetName)
            setLoadedCustomPresetName(null)
        setPresetNameToDelete(null)
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
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    >
                        <line x1="7" y1="2" x2="7" y2="12" />
                        <line x1="2" y1="7" x2="12" y2="7" />
                    </svg>
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
                            className={styles["header-image-icon"]}
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
                    <button
                        className={styles["header-icon-button"]}
                        aria-label="Copy share link"
                        onClick={copyShareLink}
                    >
                        <img
                            src={shareIcon}
                            alt=""
                            className={styles["header-image-icon"]}
                        />
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
                    onDeleteCustomPreset={setPresetNameToDelete}
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
            {sharedPresetNameToSaveAsCustomPreset !== null && (
                <TextInputDialog
                    title="Save shared preset"
                    inputLabel="Preset name"
                    initialText={sharedPresetNameToSaveAsCustomPreset}
                    submitButtonLabel="Save"
                    getWarningMessage={(presetName) =>
                        customPresets.some(
                            (preset) => preset.label === presetName,
                        )
                            ? "This will replace the existing preset."
                            : null
                    }
                    onSubmit={(presetName) => {
                        saveCustomPreset(presetName)
                        setSharedPresetNameToSaveAsCustomPreset(null)
                    }}
                    onClose={() =>
                        setSharedPresetNameToSaveAsCustomPreset(null)
                    }
                />
            )}
            {presetNameToDelete !== null && (
                <ConfirmationDialog
                    title="Delete preset"
                    message={`Delete the preset "${presetNameToDelete}"? This cannot be undone.`}
                    confirmButtonLabel="Delete"
                    onConfirm={() => deleteCustomPreset(presetNameToDelete)}
                    onClose={() => setPresetNameToDelete(null)}
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
            <ToastContainer
                position="top-center"
                autoClose={3000}
                hideProgressBar
            />
        </div>
    )
}

export default NameGeneratorV3
