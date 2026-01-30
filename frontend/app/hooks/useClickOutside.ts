import { useEffect, RefObject, useCallback } from "react";

/**
 * Custom hook to detect clicks outside a referenced element.
 * Useful for closing modals, dropdowns, and other overlay components.
 *
 * @param ref - React ref to the element to monitor
 * @param callback - Function to call when a click outside is detected
 * @param isActive - Whether the listener should be active (default: true)
 *
 * @example
 * const modalRef = useRef<HTMLDivElement>(null);
 * useClickOutside(modalRef, () => setIsOpen(false), isOpen);
 */
export function useClickOutside<T extends HTMLElement>(
    ref: RefObject<T | null>,
    callback: () => void,
    isActive: boolean = true
): void {
    // Memoize the callback to prevent unnecessary re-attachments
    const handleClickOutside = useCallback(
        (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                callback();
            }
        },
        [ref, callback]
    );

    useEffect(() => {
        if (!isActive) return;

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isActive, handleClickOutside]);
}
