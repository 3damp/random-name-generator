import { useCallback, useState } from "react"

const useUrlParameters = () => {
    const [params] = useState(new URLSearchParams(location.search))

    const setParam = useCallback(
        (key: string, value: string) => {
            const newParams = new URLSearchParams(params)
            newParams.set(key, value)
            window.history.pushState(
                {},
                "",
                `${window.location.pathname}?${newParams}`,
            )
        },
        [params],
    )

    const getParam = useCallback(
        (key: string): string | null => {
            return params.get(key)
        },
        [params],
    )

    return { params, setParam, getParam }
}

export default useUrlParameters
