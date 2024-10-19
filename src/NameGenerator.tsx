import { useEffect, useState } from "react"
// import RandomNameGenerator from "./scripts/randomNameGenerator"
import RandomNameGenerator from "./scripts/newRandomNumberGenerator"
import styles from "./NameGenerator.module.css"
import NumberInput from "./components/NumberInput"
import TextInput from "./components/TextInput"

const nameGenerator = new RandomNameGenerator()

const NameGenerator: React.FC = () => {
    const [name, setName] = useState(nameGenerator.generateName())

    const [parameters, setParameters] = useState(nameGenerator.getParameters())

    useEffect(() => {
        nameGenerator.setParameters(parameters)
    }, [parameters])

    const onButtonClick = () => {
        setName(nameGenerator.generateName())
    }

    return (
        <div className={styles["main-container"]}>
            <header className={styles["header"]}>
                <h1>{name}</h1>
            </header>
            <div className={styles["scrollable-container"]}>
                <div className={styles["scrollable-content"]}>
                    <TextInput
                        name="Syllables"
                        value={parameters.syllables}
                        textarea
                        height={140}
                        onChange={(value) =>
                            setParameters({
                                ...parameters,
                                syllables: value,
                            })
                        }
                    />
                    <TextInput
                        name="Start with (optional)"
                        value={parameters.startWith}
                        textarea
                        height={50}
                        onChange={(value) =>
                            setParameters({
                                ...parameters,
                                startWith: value,
                            })
                        }
                    />

                    <TextInput
                        name="Cannot start with (optional)"
                        value={parameters.cannotStartWith}
                        textarea
                        height={50}
                        onChange={(value) =>
                            setParameters({
                                ...parameters,
                                cannotStartWith: value,
                            })
                        }
                    />

                    <div className={styles["field-container"]}>
                        <NumberInput
                            name="Min Length"
                            value={parameters.minLength}
                            onChange={(value) =>
                                setParameters({
                                    ...parameters,
                                    minLength: value,
                                })
                            }
                        />
                        <NumberInput
                            name="Max Length"
                            value={parameters.maxLength}
                            onChange={(value) =>
                                setParameters({
                                    ...parameters,
                                    maxLength: value,
                                })
                            }
                        />
                        <label>
                            Force length
                            <input
                                type="checkbox"
                                checked={parameters.strictLength}
                                onChange={(e) => {
                                    setParameters({
                                        ...parameters,
                                        strictLength: e.target.checked,
                                    })
                                }}
                            />
                        </label>
                    </div>
                </div>
            </div>
            <footer className={styles["footer"]}>
                <button
                    className={styles["generate-button"]}
                    onClick={onButtonClick}
                >
                    GENERATE
                </button>
            </footer>
        </div>
    )
}

export default NameGenerator
