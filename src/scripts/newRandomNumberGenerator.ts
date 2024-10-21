type Parameters = {
    minLength: number
    maxLength: number
    strictLength: boolean
    startWith: string
    syllables: string
    cannotStartWith: string
}

const DEFAULT_PARAMETERS: Parameters = {
    minLength: 3,
    maxLength: 6,
    strictLength: false,
    startWith: "",
    syllables:
        "a i u e o ka ki ku ke ko sa shi su se so ta chi tsu te to na ni nu ne no ha hi fu he ho ma mi mu me mo ya yu yo ra ri ru re ro wa wo n",
    cannotStartWith: "n",
}

export default class RandomNumberGenerator {
    parameters: Parameters
    syllables: string[]
    startPool: string[]

    constructor() {
        this.parameters = { ...DEFAULT_PARAMETERS }
        this.syllables = stringToArray(this.parameters.syllables)
        this.startPool = [...this.syllables].filter(
            (syllable) => !this.parameters.cannotStartWith.includes(syllable),
        )
    }

    generateName() {
        if (this.parameters.syllables.length < 1 || this.startPool.length < 1)
            return "?"

        const nameLength = Math.floor(
            Math.random() *
                (1 + this.parameters.maxLength - this.parameters.minLength) +
                this.parameters.minLength,
        )
        let result = ""

        result += this.pickRandomFromArray(this.startPool)

        let remainingTries = 100
        while (remainingTries > 0 && result.length < nameLength) {
            remainingTries--
            result += this.pickRandomFromArray(this.syllables)
        }
        if (this.parameters.strictLength) {
            result = result.slice(0, nameLength)
        }

        return result.charAt(0).toUpperCase() + result.slice(1)
    }

    getParameters() {
        return { ...this.parameters }
    }
    setParameters(parameters: Partial<Parameters> = {}) {
        this.parameters = { ...DEFAULT_PARAMETERS, ...parameters }

        this.syllables = stringToArray(this.parameters.syllables)
        const startWithArray = stringToArray(this.parameters.startWith)
        const cannotStartWithArray = stringToArray(
            this.parameters.cannotStartWith,
        )
        if (startWithArray.length > 0) {
            this.startPool = startWithArray
        } else {
            this.startPool = [...this.syllables].filter(
                (syllable) =>
                    !cannotStartWithArray.some(
                        (text) => syllable.startsWith(text) === true,
                    ),
            )
        }
    }

    pickRandomFromArray(array: string[]) {
        return array[Math.floor(Math.random() * array.length)]
    }
}

export function stringToArray(string: string) {
    if (!string) return []
    string = string.replace("\n", " ")
    string = string.trim()
    return string.split(" ")
}
