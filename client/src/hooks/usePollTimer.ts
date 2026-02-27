import { useState, useEffect, useRef, useCallback } from 'react';

interface UsePollTimerOptions {
    remainingTime: number;
    isActive: boolean;
    startedAt?: string;
    timerDuration?: number;
    onExpire?: () => void;
}

export const usePollTimer = ({ remainingTime, isActive, startedAt, timerDuration, onExpire }: UsePollTimerOptions) => {
    // Calculate precise remaining time based on when the poll started
    const getTrueRemaining = useCallback(() => {
        if (!startedAt || !timerDuration || !isActive) return Math.max(0, Math.floor(remainingTime));
        const startMs = new Date(startedAt).getTime();
        const elapsedSec = (Date.now() - startMs) / 1000;
        return Math.max(0, Math.floor(timerDuration - elapsedSec));
    }, [remainingTime, startedAt, timerDuration, isActive]);

    const [timeLeft, setTimeLeft] = useState<number>(getTrueRemaining());
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const onExpireRef = useRef(onExpire);
    onExpireRef.current = onExpire;

    // Sync with server time whenever props change
    useEffect(() => {
        setTimeLeft(getTrueRemaining());
    }, [remainingTime, startedAt, timerDuration, isActive, getTrueRemaining]);

    useEffect(() => {
        if (!isActive) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        // Run tick every second
        intervalRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    intervalRef.current = null;
                    onExpireRef.current?.();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [isActive]);

    const formatTime = useCallback((seconds: number): string => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    }, []);

    return {
        timeLeft,
        formatted: formatTime(timeLeft),
        isExpired: timeLeft <= 0,
        percentage: remainingTime > 0 ? (timeLeft / remainingTime) * 100 : 0,
    };
};
