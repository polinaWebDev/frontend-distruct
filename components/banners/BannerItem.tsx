'use client';

import { useMemo } from 'react';
import type { BannerPublicItemDto } from '@/lib/api_client/gen/types.gen';
import { getFileUrl } from '@/lib/utils';
import { cn } from '@/lib/utils';

export type BannerItemProps = {
    banner: BannerPublicItemDto;
    className?: string;
    onEnded?: () => void;
    onError?: () => void;
    onClick?: () => void;
};

export function BannerItem({ banner, className, onEnded, onError, onClick }: BannerItemProps) {
    const fileUrl = useMemo(() => getFileUrl(banner.fileUrl), [banner.fileUrl]);

    const content =
        banner.type === 'video' ? (
            <video
                className={cn('h-full w-full object-contain', className)}
                src={fileUrl}
                poster={banner.previewUrl ? getFileUrl(banner.previewUrl) : undefined}
                muted
                autoPlay
                playsInline
                preload="metadata"
                onEnded={onEnded}
                onError={onError}
            />
        ) : (
            <img
                className={cn('h-full w-full object-contain', className)}
                src={fileUrl}
                alt={banner.id}
                onError={onError}
            />
        );

    if (banner.linkUrl) {
        return (
            <a
                href={banner.linkUrl}
                target="_blank"
                rel="nofollow noopener"
                className="block h-full w-full"
                onClick={onClick}
            >
                {content}
            </a>
        );
    }

    return content;
}
