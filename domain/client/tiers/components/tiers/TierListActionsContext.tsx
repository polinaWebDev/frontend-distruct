'use client';
import { createContext, useContext } from 'react';
import type { TierListResponseDto } from '@/lib/api_client/gen';

export type TierListActionsContextValue = {
    saved: TierListResponseDto;
    draft: TierListResponseDto;
    setDraft: React.Dispatch<React.SetStateAction<TierListResponseDto>>;
    save: () => Promise<void>;
    updatePrivacy: (isPublic: boolean) => Promise<void>;
    resetDraft: () => void;
    isSaving: boolean;
    hasChanges: boolean;
};

const TierListActionsContext = createContext<TierListActionsContextValue | null>(null);

export function useTierListActions() {
    const ctx = useContext(TierListActionsContext);
    if (!ctx) {
        throw new Error('useTierListActions must be used inside TierListActionsProvider');
    }
    return ctx;
}

export function TierListActionsProvider({
    value,
    children,
}: {
    value: TierListActionsContextValue;
    children: React.ReactNode;
}) {
    return (
        <TierListActionsContext.Provider value={value}>{children}</TierListActionsContext.Provider>
    );
}
