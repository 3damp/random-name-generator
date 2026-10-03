import {
    BuiltInPreset,
    Preset,
    PresetWithVariants,
} from "src/components/PresetsPanel"
import { NameLengthRange } from "src/scripts/markovNameGenerator"
import { JAPANESE_NAMES } from "./japaneseNames"
import { ENGLISH_NAMES } from "./englishNames"
import { NORSE_NAMES } from "./norseNames"
import { LATIN_NAMES } from "./latinNames"
import { GREEK_NAMES } from "./greekNames"
import { FANTASY_NAMES } from "./fantasyNames"
import { ELVISH_NAMES } from "./elvishNames"
import { MORDOR_NAMES } from "./mordorNames"
import { SPANISH_WORDS } from "./spanishWords"
import { ENGLISH_WORDS } from "./englishWords"

export type MarkovNamePresetSettings = {
    sampleNames: string[]
    lengthRange?: NameLengthRange
    blendedContextLength?: number
    requiredNameStart?: string
    requiredNameEnd?: string
}

export type NamesByGender = {
    male: string[]
    female: string[]
    neutral: string[]
}

function buildPresetWithGenderVariants(
    label: string,
    { male, female, neutral }: NamesByGender,
): PresetWithVariants<MarkovNamePresetSettings> {
    return {
        label,
        variants: [
            { label: "Male", value: { sampleNames: male } },
            { label: "Female", value: { sampleNames: female } },
            { label: "Neutral", value: { sampleNames: neutral } },
        ],
    }
}

export const BUILT_IN_MARKOV_NAME_PRESETS: BuiltInPreset<MarkovNamePresetSettings>[] =
    [
        { label: "English words", value: { sampleNames: ENGLISH_WORDS } },
        { label: "Spanish words", value: { sampleNames: SPANISH_WORDS } },
        buildPresetWithGenderVariants("English names", ENGLISH_NAMES),
        buildPresetWithGenderVariants("Fantasy names", FANTASY_NAMES),
        buildPresetWithGenderVariants("Elvish names", ELVISH_NAMES),
        buildPresetWithGenderVariants("Mordor names", MORDOR_NAMES),
        buildPresetWithGenderVariants("Norse names", NORSE_NAMES),
        buildPresetWithGenderVariants("Japanese names", JAPANESE_NAMES),
        buildPresetWithGenderVariants("Greek names", GREEK_NAMES),
        buildPresetWithGenderVariants("Latin names", LATIN_NAMES),
    ]

export const DEFAULT_CUSTOM_MARKOV_NAME_PRESETS: Preset<MarkovNamePresetSettings>[] =
    [
        {
            label: "Funny Spanish",
            value: {
                sampleNames: SPANISH_WORDS,
                lengthRange: { minLength: 10, maxLength: 12 },
                blendedContextLength: 2.5,
                requiredNameStart: "",
                requiredNameEnd: "",
            },
        },
    ]
