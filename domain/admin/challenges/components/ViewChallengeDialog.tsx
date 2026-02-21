'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { GAME_TYPE_VALUES, type GameType } from '@/lib/enums/game_type.enum';
import {
    ChallengeDifficulty,
    CHALLENGE_DIFFICULTY_VALUES,
} from '@/lib/enums/challenge_difficulty.enum';
import type { ChallengeSeason } from '@/lib/api_client/gen/types.gen';
import type { ChallengeAdminRow } from '../types';
import { getFileUrl } from '@/lib/utils';

interface ViewChallengeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    challenge: ChallengeAdminRow | null;
    seasons: ChallengeSeason[];
}

const formatDate = (value?: string | Date | null) => {
    if (!value) return '—';
    const date = typeof value === 'string' ? new Date(value) : value;
    return new Intl.DateTimeFormat('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};

const getGameTypeLabel = (value: GameType) =>
    GAME_TYPE_VALUES.find((element) => element.value === value)?.label ?? value;

const getDifficultyLabel = (difficulty: string) => {
    const match = CHALLENGE_DIFFICULTY_VALUES.find(
        (item) => item.value === (difficulty as ChallengeDifficulty)
    );
    return match?.label(1) ?? difficulty;
};

const getChallengePrizeImage = (challenge: ChallengeAdminRow): string | null => {
    const prize = challenge.prize_cosmetic_id;
    if (!prize || typeof prize !== 'object') return null;

    const record = prize as Record<string, unknown>;
    const direct = record.asset_url;
    if (typeof direct === 'string' && direct.trim()) return direct;

    const nested = record.prize_cosmetic;
    if (nested && typeof nested === 'object') {
        const nestedRecord = nested as Record<string, unknown>;
        const nestedAsset = nestedRecord.asset_url;
        if (typeof nestedAsset === 'string' && nestedAsset.trim()) return nestedAsset;
    }

    return null;
};

export function ViewChallengeDialog({
    open,
    onOpenChange,
    challenge,
    seasons,
}: ViewChallengeDialogProps) {
    const season = challenge ? seasons.find((item) => item.id === challenge.season_id) : null;
    const prizeImage = challenge ? getChallengePrizeImage(challenge) : null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{challenge?.title || 'Челлендж'}</DialogTitle>
                    <DialogDescription>Информация о челлендже</DialogDescription>
                </DialogHeader>

                {challenge ? (
                    <div className="space-y-5">
                        {prizeImage && (
                            <div>
                                <Label className="text-muted-foreground">Превью награды</Label>
                                <div className="mt-2">
                                    <Image
                                        src={getFileUrl(prizeImage)}
                                        alt={challenge.title}
                                        width={200}
                                        height={200}
                                        className="object-cover rounded"
                                    />
                                </div>
                            </div>
                        )}
                        <div>
                            <Label className="text-muted-foreground">Описание</Label>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {challenge.description}
                            </p>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                            <div>
                                <Label className="text-muted-foreground">Игра</Label>
                                <p className="mt-1">
                                    {getGameTypeLabel(challenge.game_type as GameType)}
                                </p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Сложность</Label>
                                <p className="mt-1">{getDifficultyLabel(challenge.difficulty)}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Уровень</Label>
                                <p className="mt-1">{challenge.challenge_level}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Приз</Label>
                                <p className="mt-1">{challenge.prize_amount}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Статус</Label>
                                <p className="mt-1">
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            challenge.active
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                        }`}
                                    >
                                        {challenge.active ? 'Активен' : 'Не активен'}
                                    </span>
                                </p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Сезон</Label>
                                <p className="mt-1">{season?.name ?? challenge.season_id}</p>
                            </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                            <div>
                                <Label className="text-muted-foreground">Старт</Label>
                                <p className="mt-1">{formatDate(challenge.start_date)}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Окончание</Label>
                                <p className="mt-1">{formatDate(challenge.end_date)}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Лимит времени</Label>
                                <p className="mt-1">
                                    {challenge.time_limit_in_seconds
                                        ? `${challenge.time_limit_in_seconds} сек`
                                        : 'Не задан'}
                                </p>
                            </div>
                        </div>

                        <div>
                            <Label className="text-muted-foreground">Дополнительные условия</Label>
                            {challenge.additional_conditions.length === 0 ? (
                                <p className="mt-1 text-sm text-muted-foreground">Нет условий</p>
                            ) : (
                                <ul className="mt-2 space-y-1 text-sm">
                                    {challenge.additional_conditions.map((condition, index) => (
                                        <li
                                            key={`${condition}-${index}`}
                                            className="flex items-center gap-2"
                                        >
                                            • <span>{condition}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div>
                            <Label className="text-muted-foreground">Связанные предметы</Label>
                            {challenge.gears.length === 0 ? (
                                <p className="mt-1 text-sm text-muted-foreground">
                                    С предметами не связан
                                </p>
                            ) : (
                                <ul className="mt-2 space-y-1 text-sm">
                                    {challenge.gears.map((gear) => (
                                        <li key={gear.id} className="flex items-center gap-2">
                                            • {gear.name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                        Выберите челлендж, чтобы увидеть детали
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
