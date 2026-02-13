'use client';

import { useEffect, useMemo, useState } from 'react';
import { AppSkeleton } from '@/ui/AppSkeleton/AppSkeleton';
import { BannerItem } from './BannerItem';
import { useBannerContext } from './BannerProvider';
import type { BannerPublicItemDto } from '@/lib/api_client/gen/types.gen';
import { cn } from '@/lib/utils';

const IMAGE_ROTATION_MS = 7000;

export function BannerSlot({ slotKey, className }: { slotKey: string; className?: string }) {
    const { slotsByKey, isLoading, isError } = useBannerContext();
    const slot = slotsByKey[slotKey];

    const banners = useMemo(() => {
        if (!slot?.banners) return [];
        return slot.banners.filter((banner) => !!banner.fileUrl);
    }, [slot]);

    const [index, setIndex] = useState(0);

    useEffect(() => {
        setIndex(0);
    }, [banners.length]);

    useEffect(() => {
        if (!slot || banners.length <= 1) return;
        const current = banners[index];
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

    const currentBanner = banners[index] as BannerPublicItemDto | undefined;

    if (!currentBanner) {
        return null;
    }

    return (
        <div
            className={cn('relative overflow-hidden rounded-lg bg-black/10', className)}
            style={slotStyle}
        >
            <BannerItem banner={currentBanner} onEnded={handleNext} onError={handleNext} />
        </div>
    );
}
