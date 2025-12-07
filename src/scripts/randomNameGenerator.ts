import { DEFAULT_PARAMETERS } from "src/constants/predefinedParameters"

export type GraphemePool = Record<string, number>
export type GraphemeArray = string[]

export type Parameters = {
    minLength: number
    maxLength: number
    mustStartWith: string
    mustEndWith: string
    mustHaveInFirstTwoLetters: GraphemeArray
    cannotStartWith: GraphemeArray
    canEndWith: GraphemePool
    cannotEndWith: GraphemeArray
    lettersAfter: Record<string, GraphemePool>
}

export default class RandomNumberGenerator {
    private parameters: Parameters = DEFAULT_PARAMETERS
    private startPool: GraphemePool = {}
    private lastLetterCanBe: GraphemePool = {}
    private secondToLastLetterCanBe: GraphemePool = {}
    private validParameters: boolean = true

    constructor() {
        this.setParameters(DEFAULT_PARAMETERS)
    }

    generateName() {
        if (!this.validParameters) return "Invalid parameters"

        const totalNameLength = this.calculateNameLength()
        const nameLength = totalNameLength - this.parameters.mustEndWith.length

        let result = this.parameters.mustStartWith
        let previousLetter = result.charAt(result.length - 1)
        let secondToLastLetter = ""
        let hasVowelInFirstTwo = false
        if (result.length === 0) {
            const newLetter = pickRandomLetter(this.startPool)
            if (this.parameters.mustHaveInFirstTwoLetters.includes(newLetter)) hasVowelInFirstTwo = true
            result += newLetter
            previousLetter = result
        }

        let maxTries = 100
        while (maxTries > 0 && result.length < nameLength) {
            const remainingLength = totalNameLength - result.length
            const possibleChars = this.calculateLetterPoolAfter(
                previousLetter,
                remainingLength,
            )
            if (Object.keys(possibleChars).length > 0) {
                const newLetter = pickRandomLetter(possibleChars)
                if (result.length <= 1 && this.parameters.mustHaveInFirstTwoLetters.includes(newLetter)) {
                    hasVowelInFirstTwo = true
                }
                if (hasVowelInFirstTwo === false && result.length === 1) {
                    continue
                }
                result += newLetter
                secondToLastLetter = previousLetter
                previousLetter = newLetter
            } else {
                result = result.slice(0, result.length - previousLetter.length)
                previousLetter = secondToLastLetter
            }
            maxTries--
        }

        return this.capitalizeName(result + this.parameters.mustEndWith)
    }

    private calculateLetterPoolAfter(
        letter: string,
        remainingLength: number,
    ): GraphemePool {
        if (!letter) letter = pickRandomLetter(this.startPool)
        const isCanEndWithDefined = Object.keys(this.lastLetterCanBe).length > 0

        const pool = Object.entries(
            this.parameters.lettersAfter[letter],
        ).reduce<GraphemePool>((acc, [letter, weight]) => {
            if (letter.length < remainingLength) {
                if (
                    isCanEndWithDefined &&
                    letter.length + 1 >= remainingLength
                ) {
                    if (
                        Object.keys(this.secondToLastLetterCanBe).includes(
                            letter,
                        )
                    ) {
                        acc[letter] = weight
                    }
                } else {
                    acc[letter] = weight
                }
                return acc
            }
            if (letter.length >= remainingLength) {
                if (isCanEndWithDefined && this.lastLetterCanBe[letter]) {
                    acc[letter] = weight
                } else if (
                    !isCanEndWithDefined &&
                    !this.parameters.cannotEndWith.includes(letter)
                ) {
                    acc[letter] = weight
                }
                return acc
            }
            return acc
        }, {})

        return pool
    }

    getParameters() {
        return {
            ...this.parameters,
            lettersAfter: { ...this.parameters.lettersAfter },
        }
    }
    setParameters(newParameters: Partial<Parameters> = {}) {
        this.parameters = { ...this.parameters, ...newParameters }

        // Cap length values
        if (this.parameters.minLength < 1) this.parameters.minLength = 1
        if (this.parameters.maxLength < 1) this.parameters.maxLength = 1
        if (this.parameters.minLength > this.parameters.maxLength)
            this.parameters.minLength = this.parameters.maxLength

        // Build start pool
        if (this.parameters.mustStartWith.length <= 0) {
            let allLetters = Object.keys(this.parameters.lettersAfter)
            for (const cannotStartWithLetter of this.parameters
                .cannotStartWith) {
                allLetters = allLetters.filter(
                    (letter) => letter !== cannotStartWithLetter,
                )
            }
            this.startPool = allLetters.reduce<GraphemePool>((acc, letter) => {
                acc[letter] = 1
                return acc
            }, {})
        }

        // Build last letter pool
        if (this.parameters.mustEndWith.length <= 0) {
            this.lastLetterCanBe = buildLastLetterPool(this.parameters)
            this.secondToLastLetterCanBe = buildSecondToLastLetterPool(
                this.parameters,
                this.lastLetterCanBe,
            )
        }
        // Validate lettersAfter
        const [error] = validateLettersAfter(this.parameters.lettersAfter)
        this.validParameters = !error

        return [error]
    }

    private calculateNameLength() {
        return Math.floor(
            Math.random() *
                (1 + this.parameters.maxLength - this.parameters.minLength) +
                this.parameters.minLength,
        )
    }

    private capitalizeName(name: string) {
        return name.charAt(0).toUpperCase() + name.slice(1)
    }
}

function buildLastLetterPool(parameters: Parameters): GraphemePool {
    if (
        Object.keys(parameters.canEndWith).length > 0 &&
        parameters.cannotEndWith.length > 0
    ) {
        const filteredChars = filterGraphemePool(
            parameters.canEndWith,
            parameters.cannotEndWith,
        )
        return filteredChars
    } else if (Object.keys(parameters.canEndWith).length > 0) {
        return parameters.canEndWith
    } else {
        return {}
    }
}
function buildSecondToLastLetterPool(
    parameters: Parameters,
    lastLetterPool: GraphemePool,
): GraphemePool {
    return Object.keys(lastLetterPool).reduce<GraphemePool>(
        (acc, lastLetter) => {
            for (const [letter, pool] of Object.entries(
                parameters.lettersAfter,
            )) {
                if (pool[lastLetter]) {
                    acc[letter] = pool[lastLetter]
                }
            }
            return acc
        },
        {},
    )
}

function pickRandomLetter(pool: GraphemePool) {
    let sum = 0
    const totalWeight = Object.values(pool).reduce(
        (acc, weight) => acc + weight,
        0,
    )
    const randomNum = Math.random() * totalWeight
    for (const [char, weight] of Object.entries(pool)) {
        sum += weight
        if (randomNum < sum) return char
    }
    return ""
}

function validateLettersAfter(lettersAfter: Record<string, GraphemePool>) {
    const missingLetters: string[] = []
    const allUniqueLetters = Object.values(lettersAfter).reduce<string[]>(
        (acc, currentPool) => {
            for (const letter of Object.keys(currentPool)) {
                if (!acc.includes(letter)) acc.push(letter)
            }
            return acc
        },
        [],
    )
    const allDefinedLetters = Object.keys(lettersAfter)
    for (const letter of allUniqueLetters) {
        if (!allDefinedLetters.includes(letter)) {
            missingLetters.push(letter)
        }
    }
    if (missingLetters.length > 0) {
        return [
            new Error(
                `The following characters are missing from the "lettersAfter": "${missingLetters.join('", "')}"`,
            ),
        ]
    }
    return []
}

function filterGraphemePool(obj: GraphemePool, keysToRemove: string[]) {
    return Object.keys(obj).reduce<GraphemePool>((acc, key) => {
        if (!keysToRemove.includes(key)) acc[key] = obj[key]
        return acc
    }, {})
}
