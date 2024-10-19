
export const allLetters = 'abcdefghijklmnopqrstuvwxyz';
export const vowels = 'aeiou';
export const consonants = 'bcdfghjklmnpqrstvwxyz';

export default class RandomNameGenerator {
    parameters = {
        // defaults
        // aaeeiioouu   aaaeeeiiiooouuu
        // bbccddffgghhjjkkllmmnnppqqrrssttvvwwxxyyzz
        minLength: 4,
        maxLength: 7,
        firstLetters: 'abcdefghijklmnopqrstuvwxyz',
        lettersAfter: {
            a: 'eioubbccddffgghhjjkkllmmnnppqqrrssttvvwwxxyyzz',
            b: 'aeiou',
            c: 'aaaeeeiiiooouuuhrnk',
            d: 'aeiou',
            e: 'aibbccddffgghhjjkkllmmnnppqqrrssttvvwwxxyyzz',
            f: 'aeiou',
            g: 'aeiou',
            h: 'aeiou',
            i: 'aeobbccddffggjjkkllmmnnppqqrrssttvvwwxxyyzz',
            j: 'aeiou',
            k: 'aeiou',
            l: 'aeiou',
            m: 'aeiou',
            n: 'aeiou',
            o: 'aeibbccddffgghhjjkkllmmnnppqqrrssttvvwwxxyyzz',
            p: 'aeiou',
            q: 'u',
            r: 'aaaaeeeeiiiioooouuuutrpmnbcsl',
            s: 'aaaeeeiiiooouuusctp',
            t: 'aeiou',
            u: 'aibbccddffgghhjjkkllmmnnppqqrrssttvvwwyyzz',
            v: 'aeiou',
            w: 'aeiou',
            x: 'aeiou',
            y: 'aeou',
            z: 'aaaeeeiiiooouuuyrh',
        }
    }

    getEmptyParams() {
        const result = {
            minLength: 4,
            maxLength: 7,
            firstLetters: 'abcdefghijklmnopqrstuvwxyz',
            lettersAfter: {}
        };
        for (let i = 0; i < allLetters.length; i++) {
            result.lettersAfter[allLetters[i]] = ''
        }
        return result;
    }

    generateName() {
        const nameLength = Math.floor(Math.random() * (1 + this.parameters.maxLength - this.parameters.minLength) + this.parameters.minLength);
        let result = '';
        for (let i = 0; i < nameLength; i++) {
            result += this.pickNextLetter(result.charAt(result.length - 1));
        }
        return result.charAt(0).toUpperCase() + result.slice(1);
    }

    pickNextLetter(letter) {
        if (letter) {
            const index = Math.floor(Math.random() * this.parameters.lettersAfter[letter].length);
            return this.parameters.lettersAfter[letter].charAt(index);
        } else {
            const index = Math.floor(Math.random() * this.parameters.firstLetters.length);
            return this.parameters.firstLetters.charAt(index);
        }
    }

    getJsonParams() {
        return JSON.stringify(this.parameters);
    }

    setJsonParams(jsonString) {
        let jsonObj = {};

        try {
            jsonObj = JSON.parse(jsonString);

        } catch (e) {
            console.log('invalid json');
        } finally {
            let result = this.getEmptyParams();
            for (const key in jsonObj) {
                if (jsonObj.hasOwnProperty(key)) {
                    result[key] = jsonObj[key];
                }
            }
            this.parameters = result;
        }
    }
}