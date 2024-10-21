type Parameters = {
    minLength: number
    maxLength: number
    startWith: string
    cannotStartWith: string
    lettersAfter: Record<string, string>
}

const DEFAULT_PARAMETERS: Parameters = {
    minLength: 3,
    maxLength: 6,
    startWith: "",
    cannotStartWith: "",
    lettersAfter: {
        a: "eioubbccddffgghhjjkkllmmnnppqqrrssttvvwwxxyyzz",
        b: "aeiou",
        c: "aaaeeeiiiooouuuhrnk",
        d: "aeiou",
        e: "aibbccddffgghhjjkkllmmnnppqqrrssttvvwwxxyyzz",
        f: "aeiou",
        g: "aeiou",
        h: "aeiou",
        i: "aeobbccddffggjjkkllmmnnppqqrrssttvvwwxxyyzz",
        j: "aeiou",
        k: "aeiou",
        l: "aeiou",
        m: "aeiou",
        n: "aeiou",
        o: "aeibbccddffgghhjjkkllmmnnppqqrrssttvvwwxxyyzz",
        p: "aeiou",
        q: "u",
        r: "aaaaeeeeiiiioooouuuutrpmnbcsl",
        s: "aaaeeeiiiooouuusctp",
        t: "aeiou",
        u: "aibbccddffgghhjjkkllmmnnppqqrrssttvvwwyyzz",
        v: "aeiou",
        w: "aeiou",
        x: "aeiou",
        y: "aeou",
        z: "aaaeeeiiiooouuuyrh",
    },
}

export default class RandomNumberGenerator {
    #parameters: Parameters = DEFAULT_PARAMETERS
    #startPool: string = ""

    constructor() {
        this.setParameters(DEFAULT_PARAMETERS)
    }

    generateName() {
        const nameLength = Math.floor(
            Math.random() *
                (1 + this.#parameters.maxLength - this.#parameters.minLength) +
                this.#parameters.minLength,
        )
        let result = this.#parameters.startWith

        if (result.length === 0) result += pickRandomChar(this.#startPool)

        let maxTries = 100

        while (maxTries > 0 && result.length < nameLength) {
            const lastChar = result.charAt(result.length - 1)
            const possibleChars = this.#parameters.lettersAfter[lastChar]
            if (possibleChars) {
                result += pickRandomChar(possibleChars)
            }
            maxTries--
        }

        return result.charAt(0).toUpperCase() + result.slice(1)
    }

    getParameters() {
        return {
            ...this.#parameters,
            lettersAfter: { ...this.#parameters.lettersAfter },
        }
    }
    setParameters(parameters: Partial<Parameters> = {}) {
        this.#parameters = { ...this.#parameters, ...parameters }

        if (this.#parameters.minLength < 1) this.#parameters.minLength = 1
        if (this.#parameters.maxLength < 1) this.#parameters.maxLength = 1
        if (this.#parameters.minLength > this.#parameters.maxLength)
            this.#parameters.minLength = this.#parameters.maxLength

        if (this.#parameters.startWith.length <= 0) {
            let allLetters = Object.keys(this.#parameters.lettersAfter).join("")
            for (const letter of this.#parameters.cannotStartWith) {
                allLetters = allLetters.replace(letter, "")
            }
            this.#startPool = cleanCharacters(allLetters)
        }
    }
}

function pickRandomChar(string: string) {
    return string.charAt(Math.floor(Math.random() * string.length))
}

function cleanCharacters(characters: string) {
    return characters.replace(/[\s\r\t]/gi, "")
}
