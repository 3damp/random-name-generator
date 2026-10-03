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
    private readonly shorterContextLength: number
    private readonly longerContextLength: number
    private readonly longerContextProbability: number
    private readonly shorterContextTransitionTable: TransitionTable
    private readonly longerContextTransitionTable: TransitionTable
    private readonly nameBoundaryContext: string
    private readonly endableLetterCountsByMaxLengthAndEnding = new Map<
        string,
        EndableLetterCountsByContext
    >()

    constructor(names: string[], blendedContextLength: number) {
        this.trainingNames = new Set(names)
        this.shorterContextLength = Math.floor(blendedContextLength)
        this.longerContextLength = Math.ceil(blendedContextLength)
        this.longerContextProbability =
            blendedContextLength - this.shorterContextLength
        this.shorterContextTransitionTable = buildTransitionTable(
            names,
            this.shorterContextLength,
        )
        this.longerContextTransitionTable =
            this.longerContextLength === this.shorterContextLength
                ? this.shorterContextTransitionTable
                : buildTransitionTable(names, this.longerContextLength)
        this.nameBoundaryContext = NAME_BOUNDARY.repeat(
            this.longerContextLength,
        )
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
            const keepAllowedNextLetters = (
                nextLetterCounts: NextLetterCounts,
            ): NextLetterCounts =>
                Object.fromEntries(
                    Object.entries(nextLetterCounts).filter(([letter]) =>
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

            const [preferredNextLetterCounts, fallbackNextLetterCounts] =
                this.getNextLetterCountsInRandomContextLengthOrder(context)
            const preferredAllowedNextLetterCounts = keepAllowedNextLetters(
                preferredNextLetterCounts,
            )
            const allowedNextLetterCounts =
                Object.keys(preferredAllowedNextLetterCounts).length > 0
                    ? preferredAllowedNextLetterCounts
                    : keepAllowedNextLetters(fallbackNextLetterCounts)

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
            endableLetterCountsByContext =
                this.buildEndableLetterCountsByContext(maxLength, nameEnd)
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
        for (const context of this.longerContextTransitionTable.keys()) {
            const canEndAtContext =
                this.getPossibleNextLetters(context).includes(NAME_BOUNDARY)
            const endableLetterCountsByMatchedEndingLength = Array.from(
                { length: nameEnd.length + 1 },
                (_, matchedEndingLength) => {
                    const canEndAfterLetterCount = new Array<boolean>(
                        maxLength + 1,
                    ).fill(false)
                    canEndAfterLetterCount[0] =
                        canEndAtContext &&
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
            for (const context of this.longerContextTransitionTable.keys()) {
                const possibleNextLetters = this.getPossibleNextLetters(context)
                const endableLetterCountsByMatchedEndingLength =
                    endableLetterCountsByContext.get(context)!
                endableLetterCountsByMatchedEndingLength.forEach(
                    (canEndAfterLetterCount, matchedEndingLength) => {
                        canEndAfterLetterCount[letterCount] =
                            possibleNextLetters.some(
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

    private getShorterContextNextLetterCounts(
        context: string,
    ): NextLetterCounts {
        return (
            this.shorterContextTransitionTable.get(
                context.slice(-this.shorterContextLength),
            ) ?? {}
        )
    }

    private getLongerContextNextLetterCounts(
        context: string,
    ): NextLetterCounts {
        return this.longerContextTransitionTable.get(context) ?? {}
    }

    private getNextLetterCountsInRandomContextLengthOrder(
        context: string,
    ): [NextLetterCounts, NextLetterCounts] {
        const shorterContextNextLetterCounts =
            this.getShorterContextNextLetterCounts(context)
        const longerContextNextLetterCounts =
            this.getLongerContextNextLetterCounts(context)
        return Math.random() < this.longerContextProbability
            ? [longerContextNextLetterCounts, shorterContextNextLetterCounts]
            : [shorterContextNextLetterCounts, longerContextNextLetterCounts]
    }

    private getPossibleNextLetters(context: string): string[] {
        return Array.from(
            new Set([
                ...Object.keys(this.getShorterContextNextLetterCounts(context)),
                ...Object.keys(this.getLongerContextNextLetterCounts(context)),
            ]),
        )
    }

    private appendToContext(context: string, letter: string): string {
        return (context + letter).slice(-this.longerContextLength)
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
