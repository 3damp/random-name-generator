import { useState } from "react"

const useUrlParameters = () => {
    const [params] = useState(new URLSearchParams(location.search))

    const setParam = (key: string, value: string) => {
        const newParams = new URLSearchParams(params)
        newParams.set(key, value)
        window.history.pushState(
            {},
            "",
            `${window.location.pathname}?${newParams}`,
        )
    }

    const getParam = (key: string): string | null => {
        return params.get(key)
    }

    return { params, setParam, getParam }
}

export default useUrlParameters
