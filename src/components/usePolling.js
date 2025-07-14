import { useEffect, useRef } from 'react';

/**
 * usePolling - Custom hook for polling a callback at a given interval.
 * @param {Function} callback - The function to call at each interval.
 * @param {number} interval - The interval in milliseconds.
 * @param {boolean} enabled - Whether polling is enabled.
 */
export function usePolling(callback, interval = 30000, enabled = true) {
    const savedCallback = useRef();

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        if (!enabled) return;
        function tick() {
            if (savedCallback.current) savedCallback.current();
        }
        const id = setInterval(tick, interval);
        return () => clearInterval(id);
    }, [interval, enabled]);
}
