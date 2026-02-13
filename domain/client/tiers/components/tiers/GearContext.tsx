'use client';

import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { PublicGearDto } from '@/lib/api_client/gen';

type GearContextValue = {
    gearById: Record<string, PublicGearDto>;
};

const GearContext = createContext<GearContextValue | null>(null);

export function GearProvider({
    gearById,
    children,
}: {
    gearById: Record<string, PublicGearDto>;
    children: ReactNode;
}) {
    return <GearContext.Provider value={{ gearById }}>{children}</GearContext.Provider>;
}

export function useGearById() {
    const ctx = useContext(GearContext);
    if (!ctx) {
        throw new Error('useGearById must be used inside GearProvider');
    }
    return ctx.gearById;
}
