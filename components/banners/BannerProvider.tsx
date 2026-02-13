'use client';

import { createContext, useContext, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { bannersControllerGetBannersOptions } from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { getPublicClient } from '@/lib/api_client/public_client';
import type { BannerPublicSlotDto, BannerSlotPage } from '@/lib/api_client/gen/types.gen';

export type BannerContextValue = {
    page: BannerSlotPage;
    slots: BannerPublicSlotDto[];
    slotsByKey: Record<string, BannerPublicSlotDto>;
    isLoading: boolean;
    isError: boolean;
};

const BannerContext = createContext<BannerContextValue | null>(null);

export function BannerProvider({
    page,
    children,
}: {
    page: BannerSlotPage;
    children: React.ReactNode;
}) {
    const { data, isLoading, isError } = useQuery({
        ...bannersControllerGetBannersOptions({
            client: getPublicClient(),
            query: { page },
        }),
        staleTime: 30_000,
    });

    const slots = (data ?? []) as BannerPublicSlotDto[];

    const slotsByKey = useMemo(() => {
        return Object.fromEntries(slots.map((slot) => [slot.slotKey, slot]));
    }, [slots]);

    const value = useMemo<BannerContextValue>(
        () => ({
            page,
            slots,
            slotsByKey,
            isLoading,
            isError,
        }),
        [page, slots, slotsByKey, isLoading, isError]
    );

    return <BannerContext.Provider value={value}>{children}</BannerContext.Provider>;
}

export function useBannerContext() {
    const ctx = useContext(BannerContext);
    if (!ctx) {
        throw new Error('useBannerContext must be used inside BannerProvider');
    }
    return ctx;
}
