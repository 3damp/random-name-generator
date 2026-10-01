const NAME_BOUNDARY = "\n"
const MAX_GENERATION_ATTEMPTS = 200

type NextLetterCounts = Record<string, number>
type TransitionTable = Map<string, NextLetterCounts>
type EndableLetterCountsByMatchedEndingLength = boolean[][]
type EndableLetterCountsByContext = Map<
    string,
    EndableLetterCountsByMatchedEndingLength
>

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
    private readonly nameBoundaryContext: string
    private readonly endableLetterCountsByMaxLengthAndEnding = new Map<
        string,
        EndableLetterCountsByContext
    >()

    constructor(
        names: string[],
        private readonly contextLength: number,
    ) {
        this.trainingNames = new Set(names)
        this.transitionTable = buildTransitionTable(names, contextLength)
        this.nameBoundaryContext = NAME_BOUNDARY.repeat(contextLength)
    }

    generateName(
        minLength: number,
        maxLength: number,
        requiredStart = "",
        requiredEnd = "",
    ): string {
        if (this.trainingNames.size === 0) return "Add some names"

        const nameStart = requiredStart.trim().toLowerCase()
        const nameEnd = requiredEnd.trim().toLowerCase()
        const nameStartContext = this.appendToContext(
            this.nameBoundaryContext,
            nameStart,
        )
        const nameStartMatchedEndingLength = Array.from(nameStart).reduce(
            (matchedEndingLength, letter) =>
                getMatchedEndingLengthAfterLetter(
                    nameEnd,
                    matchedEndingLength,
                    letter,
                ),
            0,
        )
        const endableLetterCountsByContext =
            this.getEndableLetterCountsByContext(maxLength, nameEnd)
        const canCompleteName = canEndWithinLetterCountRange(
            endableLetterCountsByContext.get(nameStartContext)?.[
                nameStartMatchedEndingLength
            ],
            minLength - nameStart.length,
            maxLength - nameStart.length,
        )
        if (!canCompleteName) return "No name fits"

        let nameMatchingTrainingName = ""
        for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
            const name = this.generateNameWithinLengthRange(
                nameStart,
                nameStartContext,
                nameStartMatchedEndingLength,
                nameEnd,
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
        nameStart: string,
        nameStartContext: string,
        nameStartMatchedEndingLength: number,
        nameEnd: string,
        minLength: number,
        maxLength: number,
        endableLetterCountsByContext: EndableLetterCountsByContext,
    ): string {
        let context = nameStartContext
        let matchedEndingLength = nameStartMatchedEndingLength
        let name = nameStart

        while (true) {
            const nameLength = name.length
            const allowedNextLetterCounts = Object.fromEntries(
                Object.entries(this.transitionTable.get(context) ?? {}).filter(
                    ([letter]) =>
                        letter === NAME_BOUNDARY
                            ? nameLength >= minLength &&
                              matchedEndingLength === nameEnd.length
                            : canEndWithinLetterCountRange(
                                  endableLetterCountsByContext.get(
                                      this.appendToContext(context, letter),
                                  )?.[
                                      getMatchedEndingLengthAfterLetter(
                                          nameEnd,
                                          matchedEndingLength,
                                          letter,
                                      )
                                  ],
                                  minLength - nameLength - 1,
                                  maxLength - nameLength - 1,
                              ),
                ),
            )

            const nextLetter = pickWeightedRandom(allowedNextLetterCounts)
            if (nextLetter === NAME_BOUNDARY) return name
            name += nextLetter
            context = this.appendToContext(context, nextLetter)
            matchedEndingLength = getMatchedEndingLengthAfterLetter(
                nameEnd,
                matchedEndingLength,
                nextLetter,
            )
        }
    }

    private getEndableLetterCountsByContext(
        maxLength: number,
        nameEnd: string,
    ): EndableLetterCountsByContext {
        const cacheKey = maxLength + NAME_BOUNDARY + nameEnd
        let endableLetterCountsByContext =
            this.endableLetterCountsByMaxLengthAndEnding.get(cacheKey)
        if (!endableLetterCountsByContext) {
            endableLetterCountsByContext = this.buildEndableLetterCountsByContext(
                maxLength,
                nameEnd,
            )
            this.endableLetterCountsByMaxLengthAndEnding.set(
                cacheKey,
                endableLetterCountsByContext,
            )
        }
        return endableLetterCountsByContext
    }

    private buildEndableLetterCountsByContext(
        maxLength: number,
        nameEnd: string,
    ): EndableLetterCountsByContext {
        const endableLetterCountsByContext: EndableLetterCountsByContext =
            new Map()
        for (const [context, nextLetterCounts] of this.transitionTable) {
            const endableLetterCountsByMatchedEndingLength = Array.from(
                { length: nameEnd.length + 1 },
                (_, matchedEndingLength) => {
                    const canEndAfterLetterCount = new Array<boolean>(
                        maxLength + 1,
                    ).fill(false)
                    canEndAfterLetterCount[0] =
                        NAME_BOUNDARY in nextLetterCounts &&
                        matchedEndingLength === nameEnd.length
                    return canEndAfterLetterCount
                },
            )
            endableLetterCountsByContext.set(
                context,
                endableLetterCountsByMatchedEndingLength,
            )
        }

        for (let letterCount = 1; letterCount <= maxLength; letterCount++) {
            for (const [context, nextLetterCounts] of this.transitionTable) {
                const endableLetterCountsByMatchedEndingLength =
                    endableLetterCountsByContext.get(context)!
                endableLetterCountsByMatchedEndingLength.forEach(
                    (canEndAfterLetterCount, matchedEndingLength) => {
                        canEndAfterLetterCount[letterCount] = Object.keys(
                            nextLetterCounts,
                        ).some(
                            (letter) =>
                                letter !== NAME_BOUNDARY &&
                                endableLetterCountsByContext.get(
                                    this.appendToContext(context, letter),
                                )?.[
                                    getMatchedEndingLengthAfterLetter(
                                        nameEnd,
                                        matchedEndingLength,
                                        letter,
                                    )
                                ]?.[letterCount - 1] === true,
                        )
                    },
                )
            }
        }
        return endableLetterCountsByContext
    }

    private appendToContext(context: string, letter: string): string {
        return (context + letter).slice(-this.contextLength)
    }
}

function getMatchedEndingLengthAfterLetter(
    nameEnd: string,
    matchedEndingLength: number,
    letter: string,
): number {
    const matchedText = nameEnd.slice(0, matchedEndingLength) + letter
    for (
        let candidateLength = Math.min(matchedText.length, nameEnd.length);
        candidateLength > 0;
        candidateLength--
    ) {
        if (matchedText.endsWith(nameEnd.slice(0, candidateLength)))
            return candidateLength
    }
    return 0
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
