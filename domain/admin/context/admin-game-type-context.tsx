'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { GameType } from '@/lib/enums/game_type.enum';
import { getStoredGameType, setStoredGameType } from '@/domain/admin/hooks/useAdminGameType';

type AdminGameTypeContextValue = {
    gameType: GameType;
    setGameType: (value: GameType) => void;
};

const AdminGameTypeContext = createContext<AdminGameTypeContextValue | null>(null);

export function AdminGameTypeProvider({
    children,
    defaultGameType = GameType.ArenaBreakout,
}: {
    children: React.ReactNode;
    defaultGameType?: GameType;
}) {
    const [gameType, setGameTypeState] = useState<GameType>(defaultGameType);

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

    const value = useMemo(() => ({ gameType, setGameType }), [gameType]);

    return <AdminGameTypeContext.Provider value={value}>{children}</AdminGameTypeContext.Provider>;
}

export const useAdminGameTypeContext = () => {
    const ctx = useContext(AdminGameTypeContext);
    if (!ctx) {
        throw new Error('useAdminGameTypeContext must be used within AdminGameTypeProvider');
    }
    return ctx;
};
