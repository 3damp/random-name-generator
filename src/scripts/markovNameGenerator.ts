const NAME_BOUNDARY = "\n"
const MAX_GENERATION_ATTEMPTS = 200

type NextLetterCounts = Record<string, number>
type TransitionTable = Map<string, NextLetterCounts>

export type NameLengthRange = {
    minLength: number
    maxLength: number
}

export function parseNameList(text: string): string[] {
    return text
        .split(/[\n,]/)
        .map((name) => name.trim().toLowerCase())
        .filter((name) => name.length > 0)
}

export function getNameLengthRange(names: string[]): NameLengthRange {
    if (names.length === 0) return { minLength: 1, maxLength: 1 }
    const lengths = names.map((name) => name.length)
    return {
        minLength: Math.min(...lengths),
        maxLength: Math.max(...lengths),
    }
}

export default class MarkovNameGenerator {
    private readonly trainingNames: Set<string>
    private readonly transitionTablesByContextLength: TransitionTable[] = []

    constructor(
        names: string[],
        private readonly contextLength: number,
    ) {
        this.trainingNames = new Set(names)
        for (let length = 1; length <= contextLength; length++) {
            this.transitionTablesByContextLength[length] = buildTransitionTable(
                names,
                length,
            )
        }
    }

    generateName(minLength: number, maxLength: number): string {
        if (this.trainingNames.size === 0) return "Add some names"

        let nameMatchingTrainingName = ""
        for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
            const name = this.tryGenerateName(minLength, maxLength)
            if (!name) continue
            if (!this.trainingNames.has(name)) return capitalizeName(name)
            nameMatchingTrainingName = name
        }

        if (nameMatchingTrainingName)
            return capitalizeName(nameMatchingTrainingName)
        return "No name fits"
    }

    private tryGenerateName(minLength: number, maxLength: number): string {
        let paddedName = NAME_BOUNDARY.repeat(this.contextLength)
        const startPaddingLength = paddedName.length

        while (true) {
            const nameLength = paddedName.length - startPaddingLength
            const nextLetterCounts = this.findNextLetterCounts(
                paddedName,
                (letter) =>
                    letter === NAME_BOUNDARY
                        ? nameLength >= minLength
                        : nameLength < maxLength,
            )
            if (!nextLetterCounts) return ""

            const nextLetter = pickWeightedRandom(nextLetterCounts)
            if (nextLetter === NAME_BOUNDARY)
                return paddedName.slice(startPaddingLength)
            paddedName += nextLetter
        }
    }

    private findNextLetterCounts(
        paddedName: string,
        isLetterAllowed: (letter: string) => boolean,
    ): NextLetterCounts | undefined {
        for (let length = this.contextLength; length >= 1; length--) {
            const context = paddedName.slice(-length)
            const counts =
                this.transitionTablesByContextLength[length].get(context)
            if (!counts) continue

            const allowedCounts = Object.fromEntries(
                Object.entries(counts).filter(([letter]) =>
                    isLetterAllowed(letter),
                ),
            )
            if (Object.keys(allowedCounts).length > 0) return allowedCounts
        }
        return undefined
    }
}

function buildTransitionTable(
    names: string[],
    contextLength: number,
): TransitionTable {
    const table: TransitionTable = new Map()
    for (const name of names) {
        const paddedName =
            NAME_BOUNDARY.repeat(contextLength) + name + NAME_BOUNDARY
        for (let i = contextLength; i < paddedName.length; i++) {
            const context = paddedName.slice(i - contextLength, i)
            const nextLetter = paddedName[i]
            const counts = table.get(context) ?? {}
            counts[nextLetter] = (counts[nextLetter] ?? 0) + 1
            table.set(context, counts)
        }
    }
    return table
}

function pickWeightedRandom(counts: NextLetterCounts): string {
    const entries = Object.entries(counts)
    const totalWeight = entries.reduce((sum, [, weight]) => sum + weight, 0)
    let remainingWeight = Math.random() * totalWeight
    for (const [letter, weight] of entries) {
        remainingWeight -= weight
        if (remainingWeight < 0) return letter
    }
    return entries[entries.length - 1][0]
}

function capitalizeName(name: string): string {
    return name.replace(
        /(^|[\s-])(\S)/g,
        (_, separator, letter) => separator + letter.toUpperCase(),
    )
}
