import { useEffect, useState } from "react"
import RandomNameGenerator, { Parameters } from "./scripts/randomNameGenerator"
import styles from "./NameGenerator.module.css"
import NumberInput from "./components/NumberInput"
import TextInput from "./components/TextInput"
import useUrlParameters from "./hooks/useUrlParameters"
import TextArea from "./components/TextArea"
import shareIcon from "./images/share.png"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const nameGenerator = new RandomNameGenerator()

const NameGenerator: React.FC = () => {
    const { setParam, getParam, clearParams } = useUrlParameters()

    const [parameters, setParameters] = useState<Parameters>(() => {
        const params = getParam("settings")
        if (params) {
            try {
                const newParams = JSON.parse(params)
                nameGenerator.setParameters(newParams)
                clearParams()
                return newParams
            } catch (e) {
                throw e as Error
            }
        }
        return nameGenerator.getParameters()
    })

    const [advancedParameters, setAdvancedParameters] = useState(
        JSON.stringify(parameters, null, "\t"),
    )

    const [advancedParametersError, setAdvancedParametersError] = useState("")
    const [name, setName] = useState("???")

    useEffect(() => {
        setAdvancedParameters(JSON.stringify(parameters, null, "\t"))
        const [error] = nameGenerator.setParameters(parameters)
        if (error) {
            setAdvancedParametersError(error.message)
        }
    }, [parameters, setParam])

    const onClickGenerate = () => {
        setName(nameGenerator.generateName())
    }

    const onAdvancedParametersChange = (value: string) => {
        setAdvancedParameters(value)
        try {
            const newParams = JSON.parse(value)
            setParameters(newParams)
            setAdvancedParametersError("")
        } catch (e) {
            setAdvancedParametersError("⚠️Invalid JSON")
            throw e as Error
        }
    }

    const updateParameters = (params: Partial<Parameters>) => {
        if (params.minLength !== undefined && params.minLength < 1)
            params.minLength = 1
        if (params.maxLength !== undefined && params.maxLength < 1)
            params.maxLength = 1
        if (params.minLength && params.minLength > parameters.maxLength)
            params.maxLength = params.minLength
        if (params.maxLength && params.maxLength < parameters.minLength)
            params.minLength = params.maxLength

        setParameters({ ...parameters, ...params })
    }

    function onClickShare(): void {
        navigator.clipboard.writeText(
            `${window.location.origin}${window.location.pathname}?settings=${encodeURIComponent(
                JSON.stringify(parameters),
            )}`,
        )
        toast.success("Link with settings copied!", { closeOnClick: true })
    }

    return (
        <div className={styles["main-container"]}>
            <header className={styles["header"]}>
                <h1>{name}</h1>
                <img
                    src={shareIcon}
                    alt="share icon"
                    onClick={onClickShare}
                    style={{
                        filter: "invert(1)",
                        width: "1em",
                        position: "absolute",
                        right: 20,
                        top: 20,
                    }}
                />
            </header>
            <div className={styles["scrollable-container"]}>
                <div className={styles["scrollable-content"]}>
                    <div className={styles["field-container"]}>
                        <NumberInput
                            name="Min Length"
                            value={parameters.minLength}
                            onChange={(value) =>
                                updateParameters({
                                    minLength: value,
                                })
                            }
                        />
                        <NumberInput
                            name="Max Length"
                            value={parameters.maxLength}
                            onChange={(value) =>
                                updateParameters({
                                    maxLength: value,
                                })
                            }
                        />
                        <TextInput
                            name="Start with (optional)"
                            value={parameters.mustStartWith}
                            onChange={(value) =>
                                updateParameters({
                                    mustStartWith: value,
                                })
                            }
                        />
                    </div>
                    <TextArea
                        name="Advanced settings"
                        value={advancedParameters}
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
            <ToastContainer
                position="top-center"
                autoClose={2000}
                hideProgressBar
                style={{ bottom: "100px" }}
            />
        </div>
    )
}

export default NameGenerator
