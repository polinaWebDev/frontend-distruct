'use client';

import { useState, useMemo } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, PencilIcon, Trash2Icon, InfoIcon } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import {
    gearAdminControllerGetGearCategoryListInfiniteOptions,
    gearAdminControllerRemoveGearCategoryMutation,
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
import { GameType, GAME_TYPE_VALUES } from '@/lib/enums/game_type.enum';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { GearCategoryEntity } from '@/lib/api_client/gen/types.gen';
import { CreateCategoryDialog } from './components/CreateCategoryDialog';
import { EditCategoryDialog } from './components/EditCategoryDialog';
import { ViewCategoryDialog } from './components/ViewCategoryDialog';
import { getFileUrl } from '@/lib/utils';
import { useAdminGameTypeContext } from '@/domain/admin/context/admin-game-type-context';

export default function GearCategoriesPage() {
    const queryClient = useQueryClient();
    const { gameType, setGameType } = useAdminGameTypeContext();
    const [searchName, setSearchName] = useState('');
    const limit = 20;

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<GearCategoryEntity | null>(null);
    const [viewingCategory, setViewingCategory] = useState<GearCategoryEntity | null>(null);

    // Fetch gear categories list with infinite query
    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
        ...gearAdminControllerGetGearCategoryListInfiniteOptions({
            client: getPublicClient(),
            query: {
                page: 1,
                limit,
                game_type: gameType,
                name: searchName || '',
            },
        }),
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
    const gearCategories = useMemo(() => {
        return (data?.pages.flatMap((page) => page?.data ?? []) ?? []) as GearCategoryEntity[];
    }, [data]);

    // Delete mutation
    const deleteMutation = useMutation({
        ...gearAdminControllerRemoveGearCategoryMutation({
            client: getPublicClient(),
        }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['gearAdminControllerGetGearCategoryList'],
                refetchType: 'all',
            });
            toast.success('Категория успешно удалена');
        },
        onError: () => {
            toast.error('Ошибка при удалении категории');
        },
    });

    const handleDelete = (id: string) => {
        if (confirm('Вы уверены, что хотите удалить эту категорию?')) {
            deleteMutation.mutate({
                body: { id },
            });
        }
    };

    return (
        <div className="container mx-auto py-8 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Категории предметов</h1>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Создать категорию
                </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 items-end">
                <div className="flex-1 space-y-2">
                    <Label htmlFor="search">Поиск по названию</Label>
                    <Input
                        id="search"
                        placeholder="Введите название..."
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                    />
                </div>
                <div className="w-64 space-y-2">
                    <Label htmlFor="game-type">Тип игры</Label>
                    <Select
                        value={gameType}
                        onValueChange={(value) => setGameType(value as GameType)}
                    >
                        <SelectTrigger id="game-type" className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
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
                ) : gearCategories.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        Категории не найдены
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Порядок</TableHead>
                                <TableHead>Изображение</TableHead>
                                <TableHead>Название</TableHead>
                                <TableHead>Описание</TableHead>
                                <TableHead>Длинный слот</TableHead>
                                <TableHead>Исключённые категории</TableHead>
                                <TableHead className="text-right">Действия</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {gearCategories.map((category) => (
                                <TableRow key={category.id}>
                                    <TableCell>{category.order}</TableCell>
                                    <TableCell>
                                        {category.image_url ? (
                                            <Image
                                                src={getFileUrl(category.image_url)}
                                                alt={category.name}
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
                                    <TableCell className="font-medium">{category.name}</TableCell>
                                    <TableCell className="max-w-xs truncate">
                                        {category.description}
                                    </TableCell>
                                    <TableCell>{category.is_long_slot ? 'Да' : 'Нет'}</TableCell>
                                    <TableCell>
                                        {category.excluded_categories &&
                                        category.excluded_categories.length > 0
                                            ? `${category.excluded_categories.length} шт.`
                                            : 'Нет'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setViewingCategory(category)}
                                                title="Просмотр"
                                            >
                                                <InfoIcon className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setEditingCategory(category)}
                                                title="Редактировать"
                                            >
                                                <PencilIcon className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(category.id)}
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
                        {isFetchingNextPage ? 'Загрузка...' : 'Загрузить ещё'}
                    </Button>
                </div>
            )}

            {!hasNextPage && gearCategories.length > 0 && (
                <div className="text-center text-sm text-muted-foreground">
                    Все категории загружены
                </div>
            )}

            <CreateCategoryDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />

            {editingCategory && (
                <EditCategoryDialog
                    open={!!editingCategory}
                    onOpenChange={(open) => !open && setEditingCategory(null)}
                    category={editingCategory}
                />
            )}

            {viewingCategory && (
                <ViewCategoryDialog
                    open={!!viewingCategory}
                    onOpenChange={(open) => !open && setViewingCategory(null)}
                    category={viewingCategory}
                />
            )}
        </div>
    );
}
