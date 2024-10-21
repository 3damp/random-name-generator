import { useEffect, useState } from "react"
import RandomNameGenerator from "./scripts/newRandomNumberGenerator"
import styles from "./NameGenerator.module.css"
import NumberInput from "./components/NumberInput"
import TextInput from "./components/TextInput"
import useUrlParameters from "./hooks/useUrlParameters"

const nameGenerator = new RandomNameGenerator()

const NameGenerator: React.FC = () => {
    const { setParam, getParam } = useUrlParameters()

    const [parameters, setParameters] = useState(() => {
        const params = getParam("settings")
        if (params) {
            try {
                const newParams = JSON.parse(params)
                nameGenerator.setParameters(newParams)
                return newParams
            } catch (e) {
                console.error(e)
            }
        }
        return nameGenerator.getParameters()
    })

    const [advancedParameters, setAdvancedParameters] = useState(
        JSON.stringify(parameters, null, "\t"),
    )

    const [advancedParametersError, setAdvancedParametersError] = useState("")
    const [name, setName] = useState(nameGenerator.generateName())

    useEffect(() => {
        setAdvancedParameters(JSON.stringify(parameters, null, "\t"))
        setParam("settings", JSON.stringify(parameters))
        nameGenerator.setParameters(parameters)
    }, [parameters, setParam])

    const onClickGenerate = () => {
        setName(nameGenerator.generateName())
    }

    const onAdvancedParametersChange = (value: string) => {
        setAdvancedParameters(value)
        try {
            setParameters(JSON.parse(value))
            setAdvancedParametersError("")
        } catch (e) {
            setAdvancedParametersError("⚠️Invalid JSON")
            console.error(e)
        }
    }

    return (
        <div className={styles["main-container"]}>
            <header className={styles["header"]}>
                <h1>{name}</h1>
            </header>
            <div className={styles["scrollable-container"]}>
                <div className={styles["scrollable-content"]}>
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
                        <TextInput
                            name="Start with (optional)"
                            value={parameters.startWith}
                            onChange={(value) =>
                                setParameters({
                                    ...parameters,
                                    startWith: value,
                                })
                            }
                        />
                    </div>
                    <TextInput
                        name="Advanced settings"
                        value={advancedParameters}
                        textarea
                        height={300}
                        onChange={onAdvancedParametersChange}
                        error={advancedParametersError}
                    />
                </div>
            </div>
            <footer className={styles["footer"]}>
                <button
                    className={styles["generate-button"]}
                    onClick={onClickGenerate}
                >
                    GENERATE
                </button>
            </footer>
        </div>
    )
}

export default NameGenerator
