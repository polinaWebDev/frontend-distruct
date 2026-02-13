'use client';
import { useEffect, useState } from 'react';
import { GameType, GAME_TYPE_VALUES } from '@/lib/enums/game_type.enum';

const STORAGE_KEY = 'admin_game_type';

const isGameType = (value: string | null): value is GameType =>
    Boolean(value && GAME_TYPE_VALUES.some((item) => item.value === value));

export const getStoredGameType = () => {
    if (typeof window === 'undefined') return null;
    try {
        const value = window.localStorage.getItem(STORAGE_KEY);
        return isGameType(value) ? value : null;
    } catch {
        return null;
    }
};

export const setStoredGameType = (value: GameType) => {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
        // ignore storage errors
    }
};

export const useAdminGameType = (defaultValue: GameType) => {
    const [gameType, setGameTypeState] = useState<GameType>(defaultValue);

    useEffect(() => {
        const stored = getStoredGameType();
        if (stored) {
            setGameTypeState(stored);
        }
    }, []);

    const setGameType = (next: GameType) => {
        setGameTypeState(next);
        setStoredGameType(next);
    };

    return [gameType, setGameType] as const;
};

export const useAdminGameTypeFilter = <TAll extends string>(
    defaultValue: GameType | TAll,
    allValue: TAll
) => {
    const [value, setValueState] = useState<GameType | TAll>(defaultValue);

    useEffect(() => {
        const stored = getStoredGameType();
        if (stored) {
            setValueState(stored);
        }
    }, []);

    const setValue = (next: GameType | TAll) => {
        setValueState(next);
        if (next !== allValue && isGameType(next)) {
            setStoredGameType(next);
        }
    };

    return [value, setValue] as const;
};
