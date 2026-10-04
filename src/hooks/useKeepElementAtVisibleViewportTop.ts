import { RefObject, useEffect } from "react"

const useKeepElementAtVisibleViewportTop = (
    elementRef: RefObject<HTMLElement>,
) => {
    useEffect(() => {
        const visibleViewport = window.visualViewport
        if (!visibleViewport) return

        const moveElementToVisibleViewportTop = () => {
            if (!elementRef.current) return
            elementRef.current.style.transform = `translateY(${visibleViewport.offsetTop}px)`
        }

        moveElementToVisibleViewportTop()
        visibleViewport.addEventListener(
            "resize",
            moveElementToVisibleViewportTop,
        )
        visibleViewport.addEventListener(
            "scroll",
            moveElementToVisibleViewportTop,
        )
        return () => {
            visibleViewport.removeEventListener(
                "resize",
                moveElementToVisibleViewportTop,
            )
            visibleViewport.removeEventListener(
                "scroll",
                moveElementToVisibleViewportTop,
            )
        }
    }, [elementRef])
}

export default useKeepElementAtVisibleViewportTop
