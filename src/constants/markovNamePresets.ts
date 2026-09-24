import { PresetGroup } from "src/components/PresetsPanel"

type NamesByGender = {
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

const JAPANESE_NAMES: NamesByGender = {
    male: [
        "Akihiro", "Daichi", "Daisuke", "Haruto", "Hayato", "Hideki",
        "Hiroshi", "Isamu", "Itsuki", "Kaito", "Katsuro", "Kazuki", "Kenji",
        "Kenta", "Kiyoshi", "Mamoru", "Masaru", "Minato", "Naoki", "Nobuo",
        "Osamu", "Riku", "Ryota", "Satoshi", "Shota", "Souta", "Takeshi",
        "Takumi", "Tatsuya", "Yamato", "Yoshiro", "Yusuke",
    ],
    female: [
        "Akane", "Asuka", "Ayaka", "Ayame", "Chiharu", "Emiko", "Fumiko",
        "Hanako", "Haruka", "Hotaru", "Kaede", "Kanon", "Keiko", "Kotone",
        "Mei", "Michiko", "Midori", "Misaki", "Momoko", "Natsumi", "Nozomi",
        "Rina", "Sachiko", "Sakura", "Sayuri", "Shiori", "Tomoko", "Yui",
        "Yumiko", "Yuna",
    ],
    neutral: [
        "Akira", "Aoi", "Asahi", "Chihiro", "Haru", "Hikaru", "Hinata",
        "Hiromi", "Izumi", "Kaoru", "Kazumi", "Kei", "Makoto", "Masumi",
        "Michi", "Minori", "Mizuki", "Nagisa", "Nao", "Natsu", "Ren", "Rin",
        "Shinobu", "Sora", "Tomomi", "Tsubasa", "Yuki", "Yuu",
    ],
}

const ENGLISH_NAMES: NamesByGender = {
    male: [
        "Albert", "Alfred", "Arthur", "Benjamin", "Charles", "Daniel",
        "Edgar", "Edmund", "Edward", "Frederick", "Geoffrey", "George",
        "Gilbert", "Harold", "Henry", "Hugh", "James", "John", "Leonard",
        "Nathaniel", "Oliver", "Oswald", "Philip", "Richard", "Robert",
        "Samuel", "Thomas", "Timothy", "Walter", "William",
    ],
    female: [
        "Abigail", "Agatha", "Alice", "Amelia", "Beatrice", "Catherine",
        "Charlotte", "Clara", "Dorothy", "Edith", "Eleanor", "Elizabeth",
        "Emily", "Evelyn", "Florence", "Grace", "Harriet", "Hazel", "Isabel",
        "Jane", "Lucy", "Mabel", "Margaret", "Matilda", "Rosalind", "Rose",
        "Sophia", "Victoria", "Violet", "Winifred",
    ],
    neutral: [
        "Alex", "Avery", "Bailey", "Blake", "Cameron", "Casey", "Charlie",
        "Dakota", "Drew", "Eden", "Emerson", "Finley", "Harper", "Hayden",
        "Jamie", "Jordan", "Jules", "Kendall", "Logan", "Morgan", "Parker",
        "Peyton", "Quinn", "Reese", "Riley", "River", "Robin", "Rowan",
        "Sage", "Sawyer", "Skyler", "Taylor",
    ],
}

const NORSE_MALE_NAMES = [
    "Arne", "Asger", "Bjorn", "Eirik", "Einar", "Frode", "Gorm", "Gunnar",
    "Hakon", "Halfdan", "Halvard", "Harald", "Ivar", "Ketil", "Knut", "Leif",
    "Magnus", "Olaf", "Orm", "Ragnar", "Rolf", "Sigurd", "Steinar", "Sten",
    "Sven", "Thorvald", "Toke", "Torstein", "Ulf", "Vidar",
]
const NORSE_FEMALE_NAMES = [
    "Alfhild", "Aslaug", "Astrid", "Bodil", "Brynja", "Dagny", "Estrid",
    "Freya", "Gudrun", "Gunhild", "Gyda", "Helga", "Hervor", "Hilda",
    "Ingrid", "Liv", "Ragna", "Ragnhild", "Runa", "Sif", "Signy", "Sigrid",
    "Solveig", "Svanhild", "Thora", "Thyra", "Tove", "Valdis", "Ylva",
    "Yngvild",
]
const NORSE_NAMES: NamesByGender = {
    male: NORSE_MALE_NAMES,
    female: NORSE_FEMALE_NAMES,
    neutral: [...NORSE_MALE_NAMES, ...NORSE_FEMALE_NAMES],
}

const LATIN_MALE_NAMES = [
    "Aulus", "Aurelius", "Brutus", "Caius", "Cassius", "Cornelius",
    "Decimus", "Flavius", "Gaius", "Gnaeus", "Hadrianus", "Horatius",
    "Julius", "Lucius", "Marcellus", "Marcus", "Maximus", "Octavius",
    "Publius", "Quintus", "Remus", "Rufus", "Septimus", "Servius", "Sextus",
    "Tiberius", "Titus", "Tullius", "Valerius", "Varro",
]
const LATIN_FEMALE_NAMES = [
    "Aelia", "Agrippina", "Antonia", "Aurelia", "Calpurnia", "Camilla",
    "Claudia", "Cornelia", "Domitia", "Drusilla", "Fabia", "Flavia",
    "Hortensia", "Julia", "Junia", "Lavinia", "Livia", "Lucilla", "Marcia",
    "Octavia", "Paulina", "Petronia", "Porcia", "Priscilla", "Sabina",
    "Severina", "Silvia", "Tullia", "Valeria", "Vibia",
]
const LATIN_NAMES: NamesByGender = {
    male: LATIN_MALE_NAMES,
    female: LATIN_FEMALE_NAMES,
    neutral: [...LATIN_MALE_NAMES, ...LATIN_FEMALE_NAMES],
}

const GREEK_MALE_NAMES = [
    "Achilles", "Alexandros", "Andreas", "Aristides", "Christos", "Damon",
    "Demetrios", "Dimitris", "Evangelos", "Georgios", "Ilias",
    "Konstantinos", "Kostas", "Leonidas", "Lysandros", "Michalis",
    "Nikolaos", "Odysseus", "Panagiotis", "Pericles", "Petros", "Sokratis",
    "Spyridon", "Stavros", "Stefanos", "Thanos", "Theodoros", "Vasilios",
    "Xenophon", "Yannis",
]
const GREEK_FEMALE_NAMES = [
    "Anastasia", "Ariadne", "Athena", "Calliope", "Chrysanthe", "Daphne",
    "Despina", "Dimitra", "Eirini", "Eleni", "Helena", "Ioanna", "Kallisto",
    "Kassandra", "Katerina", "Lysandra", "Maria", "Melina", "Niki",
    "Olympia", "Penelope", "Persephone", "Phoebe", "Rhea", "Sofia", "Thalia",
    "Theodora", "Vasiliki", "Xanthe", "Zoe",
]
const GREEK_NAMES: NamesByGender = {
    male: GREEK_MALE_NAMES,
    female: GREEK_FEMALE_NAMES,
    neutral: [...GREEK_MALE_NAMES, ...GREEK_FEMALE_NAMES],
}

const FANTASY_NAMES: NamesByGender = {
    male: [
        "Alaric", "Aldric", "Arannis", "Baelgar", "Belros", "Corvin",
        "Daelor", "Dravek", "Eldrin", "Faelar", "Galadrin", "Gorvath",
        "Halvric", "Ithron", "Kaelen", "Korrin", "Malric", "Orinthal",
        "Quenril", "Thalion", "Tormund", "Valdren", "Varian", "Zarek",
    ],
    female: [
        "Aerith", "Althea", "Ariwyn", "Celestra", "Elandra", "Elowen",
        "Elyndra", "Faelwen", "Isara", "Isolde", "Lirael", "Lunara",
        "Lyssara", "Maelis", "Myrelle", "Nerissa", "Nimue", "Seraphel",
        "Sylvara", "Thessaly", "Vaelora", "Yllana", "Yseult", "Zephyrine",
    ],
    neutral: [
        "Aeris", "Ash", "Aurel", "Caelith", "Ciel", "Elin", "Ember", "Fenn",
        "Idris", "Kael", "Lark", "Lior", "Nyx", "Onyx", "Quill", "Ren",
        "Riven", "Rowan", "Rune", "Sable", "Saelwyn", "Shae", "Sol", "Sorin",
        "Tamsin", "Tirael", "Vale", "Wren",
    ],
}

export const MARKOV_NAME_PRESET_GROUPS: PresetGroup<string[]>[] = [
    buildStylePresetGroup("Japanese", JAPANESE_NAMES),
    buildStylePresetGroup("English", ENGLISH_NAMES),
    buildStylePresetGroup("Norse", NORSE_NAMES),
    buildStylePresetGroup("Latin", LATIN_NAMES),
    buildStylePresetGroup("Greek", GREEK_NAMES),
    buildStylePresetGroup("Fantasy", FANTASY_NAMES),
]
