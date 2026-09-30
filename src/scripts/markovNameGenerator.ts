const NAME_BOUNDARY = "\n"
const MAX_GENERATION_ATTEMPTS = 200

type NextLetterCounts = Record<string, number>
type TransitionTable = Map<string, NextLetterCounts>
type EndableLetterCountsByContext = Map<string, boolean[]>

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

export default class MarkovNameGenerator {
    private readonly trainingNames: Set<string>
    private readonly transitionTable: TransitionTable
    private readonly startContext: string
    private readonly endableLetterCountsByMaxLength = new Map<
        number,
        EndableLetterCountsByContext
    >()

    constructor(
        names: string[],
        private readonly contextLength: number,
    ) {
        this.trainingNames = new Set(names)
        this.transitionTable = buildTransitionTable(names, contextLength)
        this.startContext = NAME_BOUNDARY.repeat(contextLength)
    }

    generateName(minLength: number, maxLength: number): string {
        if (this.trainingNames.size === 0) return "Add some names"

        const endableLetterCountsByContext =
            this.getEndableLetterCountsByContext(maxLength)
        const canStartName = canEndWithinLetterCountRange(
            endableLetterCountsByContext.get(this.startContext),
            minLength,
            maxLength,
        )
        if (!canStartName) return "No name fits"

        let nameMatchingTrainingName = ""
        for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
            const name = this.generateNameWithinLengthRange(
                minLength,
                maxLength,
                endableLetterCountsByContext,
            )
            if (!this.trainingNames.has(name)) return capitalizeName(name)
            nameMatchingTrainingName = name
        }
        return capitalizeName(nameMatchingTrainingName)
    }

    private generateNameWithinLengthRange(
        minLength: number,
        maxLength: number,
        endableLetterCountsByContext: EndableLetterCountsByContext,
    ): string {
        let context = this.startContext
        let name = ""

        while (true) {
            const nameLength = name.length
            const allowedNextLetterCounts = Object.fromEntries(
                Object.entries(this.transitionTable.get(context) ?? {}).filter(
                    ([letter]) =>
                        letter === NAME_BOUNDARY
                            ? nameLength >= minLength
                            : canEndWithinLetterCountRange(
                                  endableLetterCountsByContext.get(
                                      this.appendToContext(context, letter),
                                  ),
                                  minLength - nameLength - 1,
                                  maxLength - nameLength - 1,
                              ),
                ),
            )

            const nextLetter = pickWeightedRandom(allowedNextLetterCounts)
            if (nextLetter === NAME_BOUNDARY) return name
            name += nextLetter
            context = this.appendToContext(context, nextLetter)
        }
    }

    private getEndableLetterCountsByContext(
        maxLength: number,
    ): EndableLetterCountsByContext {
        let endableLetterCountsByContext =
            this.endableLetterCountsByMaxLength.get(maxLength)
        if (!endableLetterCountsByContext) {
            endableLetterCountsByContext = this.buildEndableLetterCountsByContext(
                maxLength,
            )
            this.endableLetterCountsByMaxLength.set(
                maxLength,
                endableLetterCountsByContext,
            )
        }
        return endableLetterCountsByContext
    }

    private buildEndableLetterCountsByContext(
        maxLength: number,
    ): EndableLetterCountsByContext {
        const endableLetterCountsByContext: EndableLetterCountsByContext =
            new Map()
        for (const [context, nextLetterCounts] of this.transitionTable) {
            const canEndAfterLetterCount = new Array<boolean>(
                maxLength + 1,
            ).fill(false)
            canEndAfterLetterCount[0] = NAME_BOUNDARY in nextLetterCounts
            endableLetterCountsByContext.set(context, canEndAfterLetterCount)
        }

        for (let letterCount = 1; letterCount <= maxLength; letterCount++) {
            for (const [context, nextLetterCounts] of this.transitionTable) {
                const canEndAfterLetterCount =
                    endableLetterCountsByContext.get(context)!
                canEndAfterLetterCount[letterCount] = Object.keys(
                    nextLetterCounts,
                ).some(
                    (letter) =>
                        letter !== NAME_BOUNDARY &&
                        endableLetterCountsByContext.get(
                            this.appendToContext(context, letter),
                        )?.[letterCount - 1] === true,
                )
            }
        }
        return endableLetterCountsByContext
    }

    private appendToContext(context: string, letter: string): string {
        return (context + letter).slice(-this.contextLength)
    }
}

function canEndWithinLetterCountRange(
    canEndAfterLetterCount: boolean[] | undefined,
    minLetterCount: number,
    maxLetterCount: number,
): boolean {
    return (
        canEndAfterLetterCount?.some(
            (canEnd, letterCount) =>
                canEnd &&
                letterCount >= minLetterCount &&
                letterCount <= maxLetterCount,
        ) ?? false
    )
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
