import { useCallback, useState } from "react"

const useLocalStorageState = <T>(
    storageKey: string,
    defaultValue: T,
    isValidValue: (value: unknown) => value is T,
) => {
    const [value, setValue] = useState<T>(() => {
        try {
            const storedJson = localStorage.getItem(storageKey)
            if (storedJson === null) return defaultValue
            const storedValue: unknown = JSON.parse(storedJson)
            return isValidValue(storedValue) ? storedValue : defaultValue
        } catch {
            return defaultValue
        }
    })

    const setAndStoreValue = useCallback(
        (newValue: T) => {
            setValue(newValue)
            try {
                localStorage.setItem(storageKey, JSON.stringify(newValue))
            } catch {
                return
            }
        },
        [storageKey],
    )

    return [value, setAndStoreValue] as const
}

export default useLocalStorageState
