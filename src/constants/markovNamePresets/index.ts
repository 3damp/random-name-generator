import { PresetGroup } from "src/components/PresetsPanel"
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

function buildStylePresetGroup(
    styleLabel: string,
    { male, female, neutral }: NamesByGender,
): PresetGroup<string[]> {
    return {
        label: styleLabel,
        presets: [
            { label: "Male", value: male },
            { label: "Female", value: female },
            { label: "Neutral", value: neutral },
        ],
    }
}

export const MARKOV_NAME_PRESET_GROUPS: PresetGroup<string[]>[] = [
    {
        label: "Words",
        presets: [
            { label: "English", value: ENGLISH_WORDS },
            { label: "Spanish", value: SPANISH_WORDS },
        ],
    },
    buildStylePresetGroup("English names", ENGLISH_NAMES),
    buildStylePresetGroup("Fantasy names", FANTASY_NAMES),
    buildStylePresetGroup("Elvish names", ELVISH_NAMES),
    buildStylePresetGroup("Mordor names", MORDOR_NAMES),
    buildStylePresetGroup("Norse names", NORSE_NAMES),
    buildStylePresetGroup("Japanese names", JAPANESE_NAMES),
    buildStylePresetGroup("Greek names", GREEK_NAMES),
    buildStylePresetGroup("Latin names", LATIN_NAMES),
]
