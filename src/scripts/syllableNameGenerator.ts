const HISTORY_SIZE = 3

export type WeightedPool = Record<string, number>

export type StyleData = {
    onsets: WeightedPool
    onsetProbability: number
    nuclei: WeightedPool
    codas: WeightedPool
    codaProbability: number
    finalCodaProbability: number
    finalCodas: WeightedPool
    minSyllables: number
    maxSyllables: number
}

export type NameGeneratorV2Data = {
    styles: Record<string, StyleData>
}

export const DEFAULT_V2_DATA: NameGeneratorV2Data = {
    styles: {
        Fantasy: {
            onsetProbability: 0.7,
            onsets: {
                b: 5, c: 5, d: 5, f: 3, g: 5, h: 3, k: 5, l: 5,
                m: 5, n: 5, r: 5, s: 5, t: 5, v: 3, w: 3, z: 2,
            },
            nuclei: {
                a: 10, e: 10, i: 8, o: 10, u: 5,
            },
            codaProbability: 0.2,
            finalCodaProbability: 0.6,
            codas: {
                n: 8, r: 8, l: 7, s: 5, m: 4,
            },
            finalCodas: {
                n: 8, r: 8, t: 5, k: 4, m: 4,
            },
            minSyllables: 2,
            maxSyllables: 3,
        },
        Japanese: {
            onsetProbability: 0.8,
            onsets: {
                b: 5, d: 5, f: 3, g: 5, h: 5, k: 5,
                m: 5, n: 5, r: 5, s: 5, t: 5, w: 3, z: 3,
            },
            nuclei: {
                a: 10, e: 10, i: 8, o: 10, u: 5,
            },
            codaProbability: 0.1,
            finalCodaProbability: 0.1,
            codas: {
                n: 10, u: 1,
            },
            finalCodas: {
                n: 8,
            },
            minSyllables: 2,
            maxSyllables: 3,
        },
    },
}

export default class SyllableNameGenerator {
    private data: NameGeneratorV2Data = DEFAULT_V2_DATA

    constructor(data?: NameGeneratorV2Data) {
        if (data) this.data = data
    }

    getData(): NameGeneratorV2Data {
        return this.data
    }

    setData(data: NameGeneratorV2Data) {
        this.data = data
    }

    getStyles(): string[] {
        return Object.keys(this.data.styles)
    }

    generateName(syllableCount = 0, styleName = ""): string {
        const styles = this.data.styles
        if (!styleName) styleName = Object.keys(styles)[0] ?? ""

        const key = Object.keys(styles).find(
            (k) => k.toLowerCase() === styleName.toLowerCase(),
        )
        if (!key) return "Error: Unknown Style"
        const style = styles[key]

        if (syllableCount <= 0) {
            syllableCount =
                Math.floor(
                    Math.random() * (style.maxSyllables - style.minSyllables + 1),
                ) + style.minSyllables
        }

        let name = ""
        const codaHistory: string[] = []

        for (let i = 0; i < syllableCount; i++) {
            const isLastSyllable = i === syllableCount - 1
            const isFirstSyllable = i === 0

            let onset = getWeightedRandom(style.onsets, syllableCount === 1 ? 1 : style.onsetProbability)
            const nucleus = getWeightedRandom(style.nuclei)
            const coda = isLastSyllable
                ? getWeightedRandom(style.finalCodas, syllableCount === 1 ? 1 : style.finalCodaProbability)
                : getWeightedRandom(style.codas, style.codaProbability)

            if (!isFirstSyllable) {
                let retries = 0
                while (
                    retries++ < 10 &&
                    codaHistory[codaHistory.length - 1] === "" &&
                    onset === ""
                ) {
                    onset = getWeightedRandom(style.onsets, style.onsetProbability)
                }
            }

            trackHistory(codaHistory, coda)
            name += onset + nucleus + coda
        }

        // Remove triple consecutive characters
        name = name.replace(/(.)\1\1/g, "$1$1")
        // Trim leading/trailing apostrophes
        name = name.replace(/^'+|'+$/g, "")

        if (!name) return "Awa"

        return name.charAt(0).toUpperCase() + name.slice(1)
    }
}

function getWeightedRandom(items: WeightedPool, probability: number = 1): string {
    if (Math.random() >= probability) return ""
    
    const entries = Object.entries(items)
    if (entries.length === 0) return ""

    const totalWeight = entries.reduce((sum, [, w]) => sum + w, 0)
    if (totalWeight <= 0) return entries[0][0]

    let randomValue = Math.random() * totalWeight
    for (const [key, weight] of entries) {
        randomValue -= weight
        if (randomValue < 0) return key
    }
    return entries[0][0]
}

function trackHistory(history: string[], value: string) {
    if (history.length >= HISTORY_SIZE) history.shift()
    history.push(value)
}
