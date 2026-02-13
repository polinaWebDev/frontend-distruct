'use client';

import { useMemo } from 'react';
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
    const [gameType, setGameType] = useAdminGameTypeFilter<GameType | 'all'>(
        GameType.ArenaBreakout,
        'all'
    );
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
        return (data?.pages.flatMap((page) => page?.data ?? []) ?? []) as NewsEntity[];
    }, [data]);

    // Delete mutation
    const deleteMutation = useMutation({
        ...newsAdminControllerRemoveNewsMutation({
            client: getPublicClient(),
        }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['newsControllerGetAllNews'],
                refetchType: 'all',
            });
            toast.success('Новость успешно удалена');
        },
        onError: () => {
            toast.error('Ошибка при удалении новости');
        },
    });

    const handleDelete = (id: string) => {
        if (confirm('Вы уверены, что хотите удалить эту новость?')) {
            deleteMutation.mutate({
                body: { id },
            });
        }
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
            <div className="flex gap-4 items-end">
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
                                        {new Date(news.createdAt).toLocaleDateString()}
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
