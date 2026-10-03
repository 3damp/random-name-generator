import { BuiltInPreset, PresetWithVariants } from "src/components/PresetsPanel"
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

export type NamesByGender = {
    male: string[]
    female: string[]
    neutral: string[]
}

function buildPresetWithGenderVariants(
    label: string,
    { male, female, neutral }: NamesByGender,
): PresetWithVariants<string[]> {
    return {
        label,
        variants: [
            { label: "Male", value: male },
            { label: "Female", value: female },
            { label: "Neutral", value: neutral },
        ],
    }
}

export const BUILT_IN_MARKOV_NAME_PRESETS: BuiltInPreset<string[]>[] = [
    { label: "English words", value: ENGLISH_WORDS },
    { label: "Spanish words", value: SPANISH_WORDS },
    buildPresetWithGenderVariants("English names", ENGLISH_NAMES),
    buildPresetWithGenderVariants("Fantasy names", FANTASY_NAMES),
    buildPresetWithGenderVariants("Elvish names", ELVISH_NAMES),
    buildPresetWithGenderVariants("Mordor names", MORDOR_NAMES),
    buildPresetWithGenderVariants("Norse names", NORSE_NAMES),
    buildPresetWithGenderVariants("Japanese names", JAPANESE_NAMES),
    buildPresetWithGenderVariants("Greek names", GREEK_NAMES),
    buildPresetWithGenderVariants("Latin names", LATIN_NAMES),
]
