import { useCallback, useState } from "react"

const useLocalStorageState = <T extends string>(
    storageKey: string,
    defaultValue: T,
    isValidValue: (value: string) => value is T,
) => {
    const [value, setValue] = useState<T>(() => {
        try {
            const storedValue = localStorage.getItem(storageKey)
            return storedValue !== null && isValidValue(storedValue)
                ? storedValue
                : defaultValue
        } catch {
            return defaultValue
        }
    })

    const setAndStoreValue = useCallback(
        (newValue: T) => {
            setValue(newValue)
            try {
                localStorage.setItem(storageKey, newValue)
            } catch {
                return
            }
        },
        [storageKey],
    )

    return [value, setAndStoreValue] as const
}

export default useLocalStorageState
