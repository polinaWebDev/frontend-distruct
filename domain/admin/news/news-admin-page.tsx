'use client';

import { useMemo, useRef, useState } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
    newsControllerGetAllNewsInfiniteOptions,
    newsAdminControllerRemoveNewsMutation,
} from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { getPublicClient } from '@/lib/api_client/public_client';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GameType, GAME_TYPE_VALUES } from '@/lib/enums/game_type.enum';
import { useAdminGameTypeFilter } from '@/domain/admin/hooks/useAdminGameType';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { NewsEntity } from '@/lib/api_client/gen/types.gen';
import { getFileUrl } from '@/lib/utils';

export const NewsAdminPage = () => {
    const queryClient = useQueryClient();
    const router = useRouter();
    const pendingDeletesRef = useRef(
        new Map<
            string,
            { timeoutId: ReturnType<typeof setTimeout>; snapshot: Array<[unknown, unknown]> }
        >()
    );
    const [gameType, setGameType] = useAdminGameTypeFilter<GameType | 'all'>(
        GameType.ArenaBreakout,
        'all'
    );
    const [sortField, setSortField] = useState<'createdAt' | 'publish_at' | 'status'>('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const limit = 20;

    // Fetch news list with infinite query
    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
        ...newsControllerGetAllNewsInfiniteOptions({
            client: getPublicClient(),
            query: {
                page: 1,
                limit,
                game_type: gameType === 'all' ? undefined : (gameType as any),
            },
        }),
        staleTime: 1000,
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
            if (!lastPage || lastPage.data.length === 0) {
                return undefined;
            }
            const responseDto = lastPage.data;
            if (!responseDto || responseDto.length < limit) {
                return undefined;
            }
            return allPages.length + 1;
        },
    });

    // Flatten all pages into a single array
    const newsItems = useMemo(() => {
        const items = (data?.pages.flatMap((page) => page?.data ?? []) ?? []) as NewsEntity[];
        return items.sort((a, b) => {
            const direction = sortOrder === 'asc' ? 1 : -1;
            if (sortField === 'status') {
                const aStatus = a.is_published ? 1 : 0;
                const bStatus = b.is_published ? 1 : 0;
                return direction * (aStatus - bStatus);
            }
            if (sortField === 'publish_at') {
                const aDate = a.publish_at ? new Date(a.publish_at).getTime() : 0;
                const bDate = b.publish_at ? new Date(b.publish_at).getTime() : 0;
                return direction * (aDate - bDate);
            }
            const aCreated = new Date(a.createdAt).getTime();
            const bCreated = new Date(b.createdAt).getTime();
            return direction * (aCreated - bCreated);
        });
    }, [data, sortField, sortOrder]);

    // Delete mutation
    const newsQueryPredicate = (query: { queryKey?: unknown[] }) =>
        (query.queryKey?.[0] as { _id?: string } | undefined)?._id === 'newsControllerGetAllNews';

    const removeFromCache = (deletedId: string) => {
        queryClient.setQueriesData({ predicate: newsQueryPredicate }, (oldData: any) => {
            if (!oldData?.pages) {
                return oldData;
            }
            return {
                ...oldData,
                pages: oldData.pages.map((page: any) => {
                    if (!page?.data) return page;
                    return {
                        ...page,
                        data: page.data.filter((item: NewsEntity) => item.id !== deletedId),
                    };
                }),
            };
        });
    };

    const restoreSnapshot = (snapshot: Array<[unknown, unknown]>) => {
        snapshot.forEach(([key, data]) => {
            queryClient.setQueryData(key, data);
        });
    };

    const deleteMutation = useMutation({
        ...newsAdminControllerRemoveNewsMutation({
            client: getPublicClient(),
        }),
        onSuccess: async (_data, variables) => {
            const deletedId = variables?.body?.id;
            if (deletedId) {
                pendingDeletesRef.current.delete(deletedId);
            }
            await queryClient.invalidateQueries({
                predicate: newsQueryPredicate,
                refetchType: 'all',
            });
            toast.success('Новость успешно удалена');
        },
        onError: () => {
            toast.error('Ошибка при удалении новости');
        },
    });

    const undoDelete = (id: string) => {
        const pending = pendingDeletesRef.current.get(id);
        if (!pending) return;
        clearTimeout(pending.timeoutId);
        restoreSnapshot(pending.snapshot);
        pendingDeletesRef.current.delete(id);
        toast.success('Удаление отменено');
    };

    const handleDelete = (id: string) => {
        if (confirm('Вы уверены, что хотите удалить эту новость?')) {
            if (pendingDeletesRef.current.has(id)) {
                return;
            }
            const snapshot = queryClient.getQueriesData({
                predicate: newsQueryPredicate,
            });
            removeFromCache(id);
            const timeoutId = setTimeout(() => {
                deleteMutation.mutate({
                    body: { id },
                });
            }, 5000);
            pendingDeletesRef.current.set(id, { timeoutId, snapshot });
            toast('Новость будет удалена', {
                duration: 5000,
                action: {
                    label: 'Отменить',
                    onClick: () => undoDelete(id),
                },
            });
        }
    };

    const formatPublishAt = (news: NewsEntity) => {
        const createdDate = new Date(news.createdAt);
        if (!news.publish_at) {
            return news.is_published ? `Опубликовано: ${createdDate.toLocaleString()}` : '—';
        }

        const publishDate = new Date(news.publish_at);
        const isImmediate = Math.abs(publishDate.getTime() - createdDate.getTime()) < 60_000;
        if (isImmediate) {
            return news.is_published ? `Опубликовано: ${createdDate.toLocaleString()}` : '—';
        }
        const isFuture = publishDate.getTime() > Date.now();
        const label = isFuture ? 'Запланировано' : 'Опубликовано';
        return `${label}: ${publishDate.toLocaleString()}`;
    };

    return (
        <div className="container mx-auto py-8 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Новости</h1>
                <Button onClick={() => router.push('/admin/news/create')}>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Создать новость
                </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 items-end flex-wrap">
                <div className="w-64 space-y-2">
                    <Label htmlFor="game-type">Тип игры</Label>
                    <Select
                        value={gameType}
                        onValueChange={(value) => setGameType(value as GameType | 'all')}
                    >
                        <SelectTrigger id="game-type" className="w-full">
                            <SelectValue placeholder="Все игры" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Все игры</SelectItem>
                            {GAME_TYPE_VALUES.map((gt) => (
                                <SelectItem key={gt.value} value={gt.value}>
                                    {gt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="w-64 space-y-2">
                    <Label htmlFor="sort-field">Сортировка</Label>
                    <Select
                        value={sortField}
                        onValueChange={(value) =>
                            setSortField(value as 'createdAt' | 'publish_at' | 'status')
                        }
                    >
                        <SelectTrigger id="sort-field" className="w-full">
                            <SelectValue placeholder="Поле сортировки" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="createdAt">Дата создания</SelectItem>
                            <SelectItem value="publish_at">Дата публикации</SelectItem>
                            <SelectItem value="status">Статус</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="w-48 space-y-2">
                    <Label htmlFor="sort-order">Порядок</Label>
                    <Select
                        value={sortOrder}
                        onValueChange={(value) => setSortOrder(value as 'asc' | 'desc')}
                    >
                        <SelectTrigger id="sort-order" className="w-full">
                            <SelectValue placeholder="Порядок" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="desc">По убыванию</SelectItem>
                            <SelectItem value="asc">По возрастанию</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Table */}
            <div className="border rounded-lg">
                {isLoading ? (
                    <div className="p-8 text-center text-muted-foreground">Загрузка...</div>
                ) : newsItems.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">Новости не найдены</div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Изображение</TableHead>
                                <TableHead>Заголовок</TableHead>
                                <TableHead>Тип игры</TableHead>
                                <TableHead>Статус</TableHead>
                                <TableHead>Публикация</TableHead>
                                <TableHead>Дата создания</TableHead>
                                <TableHead className="text-right">Действия</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {newsItems.map((news) => (
                                <TableRow key={news.id}>
                                    <TableCell>
                                        {news.image_url ? (
                                            <Image
                                                src={getFileUrl(news.image_url)}
                                                alt={news.title}
                                                width={48}
                                                height={48}
                                                className="object-cover h-[48px] rounded"
                                            />
                                        ) : (
                                            <span className="text-muted-foreground text-sm">
                                                Нет изображения
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">{news.title}</TableCell>
                                    <TableCell>
                                        {GAME_TYPE_VALUES.find((g) => g.value === news.game_type)
                                            ?.label ||
                                            news.game_type ||
                                            'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={news.is_published ? 'default' : 'secondary'}
                                        >
                                            {news.is_published ? 'Опубликовано' : 'Черновик'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <span
                                            className="text-sm text-muted-foreground"
                                            suppressHydrationWarning
                                        >
                                            {formatPublishAt(news)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span suppressHydrationWarning>
                                            {new Date(news.createdAt).toLocaleDateString()}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    router.push(`/admin/news/edit/${news.id}`)
                                                }
                                                title="Редактировать"
                                            >
                                                <PencilIcon className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(news.id)}
                                                title="Удалить"
                                            >
                                                <Trash2Icon className="w-4 h-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            {/* Load More */}
            {hasNextPage && (
                <div className="flex justify-center">
                    <Button
                        variant="outline"
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                    >
                        {isFetchingNextPage ? 'Загрузка...' : 'Загрузить еще'}
                    </Button>
                </div>
            )}

            {!hasNextPage && newsItems.length > 0 && (
                <div className="text-center text-sm text-muted-foreground">
                    Все новости загружены
                </div>
            )}
        </div>
    );
};
