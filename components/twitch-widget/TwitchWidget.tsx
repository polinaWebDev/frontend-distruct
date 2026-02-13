'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import styles from './TwitchWidget.module.css';
import { getPublicClient } from '@/lib/api_client/public_client';
import { twitchControllerGetWidgetStatusOptions } from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { X } from 'lucide-react';

type Position = { x: number; y: number };

type TwitchWidgetProps = {
    channel: string;
    refreshMs?: number;
    defaultPosition?: Position;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const STORAGE_KEY = 'twitch_widget_state_v1';

export const TwitchWidget = ({
    channel,
    refreshMs = 30000,
    defaultPosition = { x: 24, y: 120 },
}: TwitchWidgetProps) => {
    const widgetRef = useRef<HTMLDivElement | null>(null);
    const dragRef = useRef({
        active: false,
        pointerId: -1,
        offsetX: 0,
        offsetY: 0,
    });

    const [position, setPosition] = useState<Position>(defaultPosition);
    const [closed, setClosed] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw) as { x?: number; y?: number };
            if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
                setPosition({ x: parsed.x, y: parsed.y });
            }
        } catch {
            // ignore malformed storage
        }
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const payload = JSON.stringify({ x: position.x, y: position.y });
        window.localStorage.setItem(STORAGE_KEY, payload);
    }, [position]);
    const {
        data,
        isLoading: loading,
        error,
    } = useQuery({
        ...twitchControllerGetWidgetStatusOptions({
            client: getPublicClient(),
            query: { channel },
        }),
        enabled: Boolean(channel),
        refetchInterval: refreshMs,
    });

    const thumbnailUrl = useMemo(() => {
        if (!data?.thumbnailUrl) return null;
        return data.thumbnailUrl.replace('{width}', '320').replace('{height}', '180');
    }, [data?.thumbnailUrl]);

    const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        if (event.button !== 0) return;
        const widget = widgetRef.current;
        if (!widget) return;

        const rect = widget.getBoundingClientRect();
        dragRef.current = {
            active: true,
            pointerId: event.pointerId,
            offsetX: event.clientX - rect.left,
            offsetY: event.clientY - rect.top,
        };
        event.currentTarget.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        if (!dragRef.current.active) return;
        const widget = widgetRef.current;
        if (!widget) return;

        const width = widget.offsetWidth;
        const height = widget.offsetHeight;
        const maxX = window.innerWidth - width - 8;
        const maxY = window.innerHeight - height - 8;

        const nextX = clamp(event.clientX - dragRef.current.offsetX, 8, maxX);
        const nextY = clamp(event.clientY - dragRef.current.offsetY, 8, maxY);

        setPosition({ x: nextX, y: nextY });
    };

    const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
        if (!dragRef.current.active) return;
        dragRef.current.active = false;
        event.currentTarget.releasePointerCapture(event.pointerId);
    };

    if (closed) {
        return null;
    }

    return (
        <div
            ref={widgetRef}
            className={styles.widget}
            style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
        >
            <div
                className={styles.header}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
            >
                <div className={styles.title}>Twitch</div>
                <div className={styles.dragHint}>перетащить</div>
                <button
                    className={styles.close}
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={(event) => {
                        event.stopPropagation();
                        setClosed(true);
                    }}
                    aria-label="Закрыть виджет"
                >
                    <X />
                </button>
            </div>

            <div className={styles.body}>
                <div className={styles.preview}>
                    {thumbnailUrl ? (
                        <img src={thumbnailUrl} alt="Stream preview" loading="lazy" />
                    ) : (
                        <div className={styles.previewPlaceholder} />
                    )}
                </div>
                <div className={styles.channel}>@{channel}</div>
                {loading && <div className={styles.statusMuted}>Загрузка…</div>}
                {!loading && error && (
                    <div className={styles.statusError}>
                        Ошибка: {error instanceof Error ? error.message : 'Unknown error'}
                    </div>
                )}
                {!loading && !error && (
                    <>
                        <div className={data?.isLive ? styles.live : styles.offline}>
                            {data?.isLive ? 'В эфире' : 'Оффлайн'}
                        </div>
                        <div className={styles.meta}>
                            <span>{data?.title ?? 'Нет трансляции'}</span>
                            {data?.gameName && <span>• {data.gameName}</span>}
                            {typeof data?.viewerCount === 'number' && (
                                <span>• {data.viewerCount.toLocaleString('ru-RU')} зрителей</span>
                            )}
                        </div>
                        <div className={styles.updated}>
                            Обновлено:{' '}
                            {data?.checkedAt
                                ? new Date(data.checkedAt).toLocaleTimeString('ru-RU')
                                : '-'}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
