'use client';

import { useMemo, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ClockIcon, ExternalLinkIcon, UserIcon } from 'lucide-react';

import { challengesAdminControllerGetChallengesProgressListInfiniteOptions } from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { getPublicClient } from '@/lib/api_client/public_client';
import type { ChallengeProgressEntity } from '@/lib/api_client/gen/types.gen';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { GameType, GAME_TYPE_VALUES } from '@/lib/enums/game_type.enum';
import { useAdminGameTypeFilter } from '@/domain/admin/hooks/useAdminGameType';
import {
    ChallengeDifficulty,
    CHALLENGE_DIFFICULTY_VALUES,
} from '@/lib/enums/challenge_difficulty.enum';
import { ChallengeProgressStatus } from './types';
import { ReviewProgressDialog } from './dialogs/review-progress.dialog';
import { getFileUrl } from '@/lib/utils';

const PAGE_LIMIT = 20;

const PROGRESS_STATUS_LABELS: Record<ChallengeProgressStatus, string> = {
    [ChallengeProgressStatus.Started]: 'Начат',
    [ChallengeProgressStatus.Cancelled]: 'Отменён',
    [ChallengeProgressStatus.WaitingForReview]: 'Ожидает проверки',
    [ChallengeProgressStatus.InReview]: 'На проверке',
    [ChallengeProgressStatus.Failed]: 'Отклонен',
    [ChallengeProgressStatus.Completed]: 'Выполнен',
};

const PROGRESS_STATUS_COLORS: Record<ChallengeProgressStatus, string> = {
    [ChallengeProgressStatus.Started]: 'bg-blue-100 text-blue-800',
    [ChallengeProgressStatus.Cancelled]: 'bg-gray-100 text-gray-800',
    [ChallengeProgressStatus.WaitingForReview]: 'bg-yellow-100 text-yellow-800',
    [ChallengeProgressStatus.InReview]: 'bg-purple-100 text-purple-800',
    [ChallengeProgressStatus.Failed]: 'bg-red-100 text-red-800',
    [ChallengeProgressStatus.Completed]: 'bg-green-100 text-green-800',
};

export const ProgressPage = () => {
    const [status, setStatus] = useState<ChallengeProgressStatus>(
        ChallengeProgressStatus.WaitingForReview
    );
    const [search, setSearch] = useState<string>('');
    const [gameType, setGameType] = useAdminGameTypeFilter<GameType | 'all'>(
        GameType.ArenaBreakout,
        'all'
    );
    const [difficulty, setDifficulty] = useState<ChallengeDifficulty | 'all'>('all');

    const [reviewingProgress, setReviewingProgress] = useState<ChallengeProgressEntity | null>(
        null
    );

    const queryPayload = useMemo(
        () => ({
            page: 1,
            limit: PAGE_LIMIT,
            status: status,
            search: search || undefined,
            game_type: gameType === 'all' ? undefined : gameType,
            difficulty: difficulty === 'all' ? undefined : difficulty,
        }),
        [status, search, gameType, difficulty]
    );

    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
        useInfiniteQuery({
            ...challengesAdminControllerGetChallengesProgressListInfiniteOptions({
                client: getPublicClient(),
                query: queryPayload,
            }),
            initialPageParam: 1,
            getNextPageParam: (lastPage, allPages) => {
                const pageData = lastPage ?? [];
                if (!pageData.length || pageData.length < PAGE_LIMIT) {
                    return undefined;
                }
                return allPages.length + 1;
            },
        });

    const progressList = useMemo(() => {
        return (data?.pages.flatMap((page) => page ?? []) ?? []) as ChallengeProgressEntity[];
    }, [data]);

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

    const getGameLabel = (value: string) =>
        GAME_TYPE_VALUES.find((item) => item.value === value)?.label ?? value;

    return (
        <div className="container mx-auto py-8 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Прогресс челленджей</h1>
            </div>

            <div className="flex gap-4 flex-wrap items-end">
                <div className="flex-1 min-w-[220px] space-y-2">
                    <Label htmlFor="search">Поиск (пользователь, челлендж)</Label>
                    <Input
                        id="search"
                        placeholder="Введите имя пользователя или название..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                </div>

                <div className="w-56 space-y-2">
                    <Label htmlFor="status-filter">Статус</Label>
                    <Select
                        value={status}
                        onValueChange={(value) => setStatus(value as ChallengeProgressStatus)}
                    >
                        <SelectTrigger id="status-filter" className="w-full">
                            <SelectValue placeholder="Выберите статус" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(PROGRESS_STATUS_LABELS).map(([key, label]) => (
                                <SelectItem key={key} value={key}>
                                    {label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="w-48 space-y-2">
                    <Label htmlFor="game-filter">Игра</Label>
                    <Select
                        value={gameType}
                        onValueChange={(value) => setGameType(value as GameType | 'all')}
                    >
                        <SelectTrigger id="game-filter" className="w-full">
                            <SelectValue placeholder="Все игры" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Все</SelectItem>
                            {GAME_TYPE_VALUES.map((item) => (
                                <SelectItem key={item.value} value={item.value}>
                                    {item.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="w-48 space-y-2">
                    <Label htmlFor="difficulty-filter">Сложность</Label>
                    <Select
                        value={difficulty}
                        onValueChange={(value) =>
                            setDifficulty(value as ChallengeDifficulty | 'all')
                        }
                    >
                        <SelectTrigger id="difficulty-filter" className="w-full">
                            <SelectValue placeholder="Любая" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Любая</SelectItem>
                            {CHALLENGE_DIFFICULTY_VALUES.map((item) => (
                                <SelectItem key={item.value} value={item.value}>
                                    {item.adjective}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="border rounded-lg">
                {isLoading && !data ? (
                    <div className="p-8 text-center text-muted-foreground">Загрузка...</div>
                ) : progressList.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">Записи не найдены</div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Пользователь</TableHead>
                                <TableHead>Челлендж</TableHead>
                                <TableHead>Игра</TableHead>
                                <TableHead>Статус</TableHead>
                                <TableHead>Обновлено</TableHead>
                                <TableHead>Доказательство</TableHead>
                                <TableHead className="text-right">Действия</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {progressList.map((progress) => (
                                <TableRow key={progress.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <UserIcon className="w-4 h-4 text-muted-foreground" />
                                            <span className="font-medium">
                                                {progress.user?.username || '—'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-xs">
                                        <div className="font-medium">
                                            {progress.challenge?.title || '—'}
                                        </div>
                                        <div className="text-xs text-muted-foreground line-clamp-1">
                                            {progress.challenge?.short_description}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {progress.challenge?.game_type
                                            ? getGameLabel(progress.challenge.game_type)
                                            : '—'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={`${PROGRESS_STATUS_COLORS[progress.status as ChallengeProgressStatus] || ''} border-0`}
                                        >
                                            {PROGRESS_STATUS_LABELS[
                                                progress.status as ChallengeProgressStatus
                                            ] || progress.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <ClockIcon className="w-3 h-3" />
                                            {formatDate(progress.updatedAt)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {progress.upload_url ? (
                                            <a
                                                href={getFileUrl(progress.upload_url)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-primary hover:underline text-sm"
                                            >
                                                <ExternalLinkIcon className="w-3 h-3" />
                                                Файл
                                            </a>
                                        ) : (
                                            <span className="text-muted-foreground text-sm">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            size="sm"
                                            variant={
                                                progress.status ===
                                                ChallengeProgressStatus.WaitingForReview
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                            onClick={() => setReviewingProgress(progress)}
                                        >
                                            {progress.status ===
                                            ChallengeProgressStatus.WaitingForReview
                                                ? 'Проверить'
                                                : 'Подробнее'}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            {hasNextPage && (
                <div className="flex justify-center">
                    <Button
                        variant="outline"
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                    >
                        {isFetchingNextPage ? 'Загрузка...' : 'Загрузить ещё'}
                    </Button>
                </div>
            )}

            <ReviewProgressDialog
                refetch={refetch}
                open={!!reviewingProgress}
                onOpenChange={(open) => !open && setReviewingProgress(null)}
                progress={reviewingProgress}
            />
        </div>
    );
};
