export type Parameters = {
    minLength: number
    maxLength: number
    startWith: string
    cannotStartWith: string
    canEndWith: string
    cannotEndWith: string
    lettersAfter: Record<string, string>
}

const DEFAULT_PARAMETERS: Parameters = {
    minLength: 3,
    maxLength: 6,
    startWith: "",
    cannotStartWith: "",
    canEndWith: "",
    cannotEndWith: "",
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
    private parameters: Parameters = DEFAULT_PARAMETERS
    private startPool: string = ""
    private canEndWith: string = ""
    private validParameters: boolean = true

    constructor() {
        this.setParameters(DEFAULT_PARAMETERS)
    }

    generateName() {
        if (!this.validParameters) return "Invalid parameters"

        const nameLength = this.calculateNameLength()

        let result = this.parameters.startWith
        if (result.length === 0) result += pickRandomChar(this.startPool)

        let maxTries = 100
        while (maxTries > 0 && result.length < nameLength) {
            const isLastChar = result.length === nameLength - 1
            const previousChar = result.charAt(result.length - 1)
            const possibleChars = this.calculateLetterPoolAfter(
                previousChar,
                isLastChar,
            )
            if (possibleChars) {
                result += pickRandomChar(possibleChars)
            } else {
                result = result.slice(0, -1) // remove last char
            }
            maxTries--
        }

        return this.capitalizeName(result)
    }

    private calculateLetterPoolAfter(
        char: string,
        isLastChar: boolean,
    ): string {
        if (isLastChar) {
            if (this.canEndWith.length > 0) {
                const allChars = this.parameters.lettersAfter[char]
                const filteredChars = allChars.split("").filter((letter) => {
                    return this.canEndWith.includes(letter)
                })
                return filteredChars.join("")
            }
            if (this.parameters.cannotEndWith.length > 0) {
                const allChars = this.parameters.lettersAfter[char]
                const filteredChars = allChars.split("").filter((letter) => {
                    return !this.parameters.cannotEndWith.includes(letter)
                })
                return filteredChars.join("")
            }
            return this.parameters.lettersAfter[char]
        } else {
            return this.parameters.lettersAfter[char]
        }
    }

    getParameters() {
        return {
            ...this.parameters,
            lettersAfter: { ...this.parameters.lettersAfter },
        }
    }
    setParameters(newParameters: Partial<Parameters> = {}) {
        this.parameters = { ...this.parameters, ...newParameters }

        if (this.parameters.minLength < 1) this.parameters.minLength = 1
        if (this.parameters.maxLength < 1) this.parameters.maxLength = 1
        if (this.parameters.minLength > this.parameters.maxLength)
            this.parameters.minLength = this.parameters.maxLength

        if (this.parameters.startWith.length <= 0) {
            let allLetters = Object.keys(this.parameters.lettersAfter).join("")
            for (const letter of this.parameters.cannotStartWith) {
                allLetters = allLetters.replace(letter, "")
            }
            this.startPool = sanitizeCharacterString(allLetters)
        }
        if (
            this.parameters.canEndWith.length > 0 &&
            this.parameters.cannotEndWith.length > 0
        ) {
            const filteredChars = this.parameters.canEndWith
                .split("")
                .filter((char) => {
                    return !this.parameters.cannotEndWith.includes(char)
                })
            this.canEndWith = filteredChars.join("")
        }

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

function pickRandomChar(string: string) {
    const randomNum = Math.random()
    const randomIndex = Math.floor(randomNum * string.length)
    return string.charAt(randomIndex)
}

function sanitizeCharacterString(characters: string) {
    return characters.replace(/[\s\r\t]/gi, "")
}

function validateLettersAfter(charsAfter: Record<string, string>) {
    const missingChars: string[] = []
    const allUniqueChars = Object.values(charsAfter).reduce(
        (acc, charString) => {
            for (const char of charString) {
                if (!acc.includes(char)) acc += char
            }
            return acc
        },
        "",
    )
    const allDefinedChars = Object.keys(charsAfter).join("")
    for (const char of allUniqueChars) {
        if (!allDefinedChars.includes(char)) {
            missingChars.push(char)
        }
    }
    if (missingChars.length > 0) {
        return [
            new Error(
                `The following characters are missing from the "lettersAfter": "${missingChars.join('", "')}"`,
            ),
        ]
    }
    return []
}
