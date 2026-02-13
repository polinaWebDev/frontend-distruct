'use client';

import { useEffect, useMemo, useState } from 'react';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { InfoIcon, PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';

import {
    challengesAdminControllerRemoveChallengeMutation,
    challengesClientControllerGetAvailableChallengesInfiniteOptions,
    challengeSeasonAdminControllerGetListOptions,
} from '@/lib/api_client/gen/@tanstack/react-query.gen';
import type {
    ChallengeSeason,
    ChallengesClientControllerGetAvailableChallengesData,
    GetAllChallengesResponseItemDto,
} from '@/lib/api_client/gen/types.gen';
import { getPublicClient } from '@/lib/api_client/public_client';
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
import { GameType, GAME_TYPE_VALUES } from '@/lib/enums/game_type.enum';
import { useAdminGameTypeFilter } from '@/domain/admin/hooks/useAdminGameType';
import { useAdminGameTypeContext } from '@/domain/admin/context/admin-game-type-context';
import {
    ChallengeDifficulty,
    CHALLENGE_DIFFICULTY_VALUES,
} from '@/lib/enums/challenge_difficulty.enum';
import { ChallengeFormDialog } from './components/ChallengeFormDialog';
import { ViewChallengeDialog } from './components/ViewChallengeDialog';

const PAGE_LIMIT = 15;

export const ChallengesAdminPage = () => {
    const queryClient = useQueryClient();
    const { setGameType } = useAdminGameTypeContext();
    const [searchName, setSearchName] = useState('');
    const [gameTypeFilter, setGameTypeFilter] = useAdminGameTypeFilter<GameType | ''>(
        GameType.ArenaBreakout,
        ''
    );
    const [difficultyFilter, setDifficultyFilter] = useState<ChallengeDifficulty | ''>('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingChallenge, setEditingChallenge] =
        useState<GetAllChallengesResponseItemDto | null>(null);
    const [viewingChallenge, setViewingChallenge] =
        useState<GetAllChallengesResponseItemDto | null>(null);

    const { data: seasonsData } = useQuery({
        ...challengeSeasonAdminControllerGetListOptions({
            client: getPublicClient(),
            query: {
                search: '',
                active: null,
            },
        }),
    });
    const seasons = (seasonsData || []) as ChallengeSeason[];

    const queryPayload = useMemo(
        () =>
            ({
                page: 1,
                limit: PAGE_LIMIT,
                search: searchName || undefined,
                game_type: gameTypeFilter || undefined,
                difficulty: difficultyFilter || undefined,
            }) as unknown as ChallengesClientControllerGetAvailableChallengesData['query'],
        [searchName, gameTypeFilter, difficultyFilter]
    );

    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
        ...challengesClientControllerGetAvailableChallengesInfiniteOptions({
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

    const challenges = useMemo(() => {
        return (data?.pages.flatMap((page) => page ?? []) ??
            []) as GetAllChallengesResponseItemDto[];
    }, [data]);

    const deleteMutation = useMutation({
        ...challengesAdminControllerRemoveChallengeMutation({
            client: getPublicClient(),
        }),
        onSuccess: async () => {
            window.location.reload();
            toast.success('Челлендж удалён');
        },
        onError: () => {
            toast.error('Ошибка при удалении челленджа');
        },
    });

    const handleDelete = (id: string) => {
        if (!confirm('Вы уверены, что хотите удалить этот челлендж?')) {
            return;
        }
        deleteMutation.mutate({ body: { id } });
    };

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

    const getGameLabel = (value: GameType) =>
        GAME_TYPE_VALUES.find((item) => item.value === value)?.label ?? value;

    const getDifficultyLabel = (value: ChallengeDifficulty) =>
        CHALLENGE_DIFFICULTY_VALUES.find((item) => item.value === value)?.adjective ?? value;

    useEffect(() => {
        if (gameTypeFilter) {
            setGameType(gameTypeFilter as GameType);
        }
    }, [gameTypeFilter, setGameType]);

    return (
        <div className="container mx-auto py-8 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Челленджи</h1>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Создать челлендж
                </Button>
            </div>

            <div className="flex gap-4 flex-wrap items-end">
                <div className="flex-1 min-w-[220px] space-y-2">
                    <Label htmlFor="search">Поиск по названию</Label>
                    <Input
                        id="search"
                        placeholder="Введите название..."
                        value={searchName}
                        onChange={(event) => setSearchName(event.target.value)}
                    />
                </div>

                <div className="w-56 space-y-2">
                    <Label htmlFor="game-filter">Игра</Label>
                    <Select
                        value={gameTypeFilter || 'all'}
                        onValueChange={(value) => {
                            if (value === 'all') {
                                setGameTypeFilter('');
                                return;
                            }
                            setGameTypeFilter(value as GameType);
                        }}
                    >
                        <SelectTrigger id="game-filter" className="w-full">
                            <SelectValue placeholder="Фильтр по игре" />
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

                <div className="w-56 space-y-2">
                    <Label htmlFor="difficulty-filter">Сложность</Label>
                    <Select
                        value={difficultyFilter || 'all'}
                        onValueChange={(value) => {
                            if (value === 'all') {
                                setDifficultyFilter('');
                                return;
                            }
                            setDifficultyFilter(value as ChallengeDifficulty);
                        }}
                    >
                        <SelectTrigger id="difficulty-filter" className="w-full">
                            <SelectValue placeholder="Выберите сложность" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Все</SelectItem>
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
                ) : challenges.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        Челленджи не найдены
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Название</TableHead>
                                <TableHead>Игра</TableHead>
                                <TableHead>Сложность</TableHead>
                                <TableHead>Уровень</TableHead>
                                <TableHead>Приз</TableHead>
                                <TableHead>Старт</TableHead>
                                <TableHead>Окончание</TableHead>
                                <TableHead>Сезон</TableHead>
                                <TableHead className="text-right">Статус</TableHead>
                                <TableHead className="text-right">Действия</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {challenges.map((challenge) => {
                                const season = seasons.find(
                                    (item) => item.id === challenge.season_id
                                );
                                return (
                                    <TableRow key={challenge.id}>
                                        <TableCell className="max-w-xs">
                                            <div className="font-medium">{challenge.title}</div>
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                {challenge.short_description}
                                            </p>
                                        </TableCell>
                                        <TableCell>
                                            {getGameLabel(challenge.game_type as GameType)}
                                        </TableCell>
                                        <TableCell>
                                            {getDifficultyLabel(
                                                challenge.difficulty as ChallengeDifficulty
                                            )}
                                        </TableCell>
                                        <TableCell>{challenge.challenge_level}</TableCell>

                                        <TableCell>{challenge.prize_amount}</TableCell>
                                        <TableCell>{formatDate(challenge.start_date)}</TableCell>
                                        <TableCell>
                                            {formatDate(challenge.end_date?.toString())}
                                        </TableCell>
                                        <TableCell>{season?.name ?? challenge.season_id}</TableCell>
                                        <TableCell className="text-right">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    challenge.active
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}
                                            >
                                                {challenge.active ? 'Активен' : 'Не активен'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setViewingChallenge(challenge)}
                                                    title="Просмотр"
                                                >
                                                    <InfoIcon className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setEditingChallenge(challenge)}
                                                    title="Редактировать"
                                                >
                                                    <PencilIcon className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(challenge.id)}
                                                    title="Удалить"
                                                >
                                                    <Trash2Icon className="w-4 h-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
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

            {!hasNextPage && challenges.length > 0 && (
                <div className="text-center text-sm text-muted-foreground">
                    Все челленджи загружены
                </div>
            )}

            <ChallengeFormDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                seasons={seasons}
            />

            {editingChallenge && (
                <ChallengeFormDialog
                    open={!!editingChallenge}
                    onOpenChange={(open) => !open && setEditingChallenge(null)}
                    challenge={editingChallenge}
                    seasons={seasons}
                />
            )}

            <ViewChallengeDialog
                open={!!viewingChallenge}
                onOpenChange={(open) => !open && setViewingChallenge(null)}
                challenge={viewingChallenge}
                seasons={seasons}
            />
        </div>
    );
};
