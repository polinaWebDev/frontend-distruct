'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppSkeleton } from '@/ui/AppSkeleton/AppSkeleton';
import { BannerItem } from './BannerItem';
import { useBannerContext } from './BannerProvider';
import type { BannerPublicItemDto } from '@/lib/api_client/gen/types.gen';
import { cn } from '@/lib/utils';
import { bannersControllerTrackEvent } from '@/lib/api_client/gen/sdk.gen';
import { getPublicClient } from '@/lib/api_client/public_client';

const IMAGE_ROTATION_MS = 7000;

export function BannerSlot({ slotKey, className }: { slotKey: string; className?: string }) {
    const { page, slotsByKey, isLoading, isError } = useBannerContext();
    const slot = slotsByKey[slotKey];

    const banners = useMemo(() => {
        if (!slot?.banners) return [];
        return slot.banners.filter((banner) => !!banner.fileUrl);
    }, [slot]);

    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (!slot || banners.length <= 1) return;
        const safeIndex = index % banners.length;
        const current = banners[safeIndex];
        if (!current) return;
        if (current.type !== 'image') return;

        const timeout = window.setTimeout(() => {
            setIndex((prev) => (prev + 1) % banners.length);
        }, IMAGE_ROTATION_MS);

        return () => window.clearTimeout(timeout);
    }, [banners, index, slot]);

    const handleNext = () => {
        if (banners.length <= 1) return;
        setIndex((prev) => (prev + 1) % banners.length);
    };

    const safeIndex = banners.length > 0 ? index % banners.length : 0;
    const currentBanner = banners[safeIndex] as BannerPublicItemDto | undefined;

    const trackEvent = useCallback(
        async (eventType: 'view' | 'click', bannerId?: string) => {
            if (!bannerId) return;
            try {
                await bannersControllerTrackEvent({
                    client: getPublicClient(),
                    body: {
                        banner_id: bannerId,
                        event_type: eventType,
                        page,
                    },
                });
            } catch {
                // Silent fail: tracking must not break banner rendering/navigation.
            }
        },
        [page]
    );

    useEffect(() => {
        if (!currentBanner?.id || !slot?.slot_key) return;
        void trackEvent('view', currentBanner.id);
    }, [currentBanner?.id, index, slot?.slot_key, trackEvent]);

    if (isError) {
        return null;
    }

    const slotStyle = slot
        ? {
              width: '100%',
              maxWidth: slot.width,
              aspectRatio: `${slot.width} / ${slot.height}`,
          }
        : undefined;

    if (isLoading && !slot) {
        return (
            <div className={cn('rounded-lg overflow-hidden', className)} style={{ height: 120 }}>
                <AppSkeleton />
            </div>
        );
    }

    if (!slot) {
        return null;
    }

    if (isLoading) {
        return (
            <div className={cn('rounded-lg overflow-hidden', className)} style={slotStyle}>
                <AppSkeleton />
            </div>
        );
    }

    if (banners.length === 0) {
        return null;
    }

    if (!currentBanner) {
        return null;
    }

    return (
        <div
            className={cn('relative overflow-hidden rounded-lg bg-black/10', className)}
            style={slotStyle}
        >
            <BannerItem
                banner={currentBanner}
                onEnded={handleNext}
                onError={handleNext}
                onClick={() => {
                    void trackEvent('click', currentBanner.id);
                }}
            />
        </div>
    );
}
