import { useEffect } from "react"

const useCloseOnEscapeKey = (
    onClose: () => void,
    { blocksEscapeKeyForLayersBelow = false } = {},
) => {
    useEffect(() => {
        const closeOnEscapeKey = (event: KeyboardEvent) => {
            if (event.key !== "Escape") return
            if (blocksEscapeKeyForLayersBelow) event.stopPropagation()
            onClose()
        }
        window.addEventListener(
            "keydown",
            closeOnEscapeKey,
            blocksEscapeKeyForLayersBelow,
        )
        return () =>
            window.removeEventListener(
                "keydown",
                closeOnEscapeKey,
                blocksEscapeKeyForLayersBelow,
            )
    }, [onClose, blocksEscapeKeyForLayersBelow])
}

export default useCloseOnEscapeKey
