'use client';

import { useState, useMemo } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, PencilIcon, Trash2Icon, InfoIcon } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import {
    gearAdminControllerGetGearListInfiniteOptions,
    gearAdminControllerRemoveGearMutation,
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
import { useAdminGameTypeContext } from '@/domain/admin/context/admin-game-type-context';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { GearEntity } from '@/lib/api_client/gen/types.gen';
import { CreateGearDialog } from './components/CreateGearDialog';
import { EditGearDialog } from './components/EditGearDialog';
import { ViewGearDialog } from './components/ViewGearDialog';
import { getFileUrl } from '@/lib/utils';

export default function GearPage() {
    const queryClient = useQueryClient();
    const { gameType, setGameType } = useAdminGameTypeContext();
    const [searchName, setSearchName] = useState('');
    const limit = 20;

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingGear, setEditingGear] = useState<GearEntity | null>(null);
    const [viewingGear, setViewingGear] = useState<GearEntity | null>(null);

    // Fetch gear list with infinite query
    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
        ...gearAdminControllerGetGearListInfiniteOptions({
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
    const gearItems = useMemo(() => {
        return (data?.pages.flatMap((page) => page?.data ?? []) ?? []) as GearEntity[];
    }, [data]);

    // Delete mutation
    const deleteMutation = useMutation({
        ...gearAdminControllerRemoveGearMutation({
            client: getPublicClient(),
        }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['gearAdminControllerGetGearList'],
                refetchType: 'all',
            });
            toast.success('Предмет успешно удалён');
        },
        onError: () => {
            toast.error('Ошибка при удалении предмета');
        },
    });

    const handleDelete = (id: string) => {
        if (confirm('Вы уверены, что хотите удалить этот предмет?')) {
            deleteMutation.mutate({
                body: { id },
            });
        }
    };

    return (
        <div className="container mx-auto py-8 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Предметы</h1>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Создать предмет
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
                ) : gearItems.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">Предметы не найдены</div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Изображение</TableHead>
                                <TableHead>Название</TableHead>
                                <TableHead>Описание</TableHead>
                                <TableHead>Уровень</TableHead>
                                <TableHead>Вес</TableHead>
                                <TableHead>Категория</TableHead>
                                <TableHead>Редкость</TableHead>
                                <TableHead>Тип</TableHead>
                                <TableHead className="text-right">Действия</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {gearItems.map((gear) => (
                                <TableRow key={gear.id}>
                                    <TableCell>
                                        {gear.image_url ? (
                                            <Image
                                                src={getFileUrl(gear.image_url)}
                                                alt={gear.name}
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
                                    <TableCell className="font-medium">{gear.name}</TableCell>
                                    <TableCell className="max-w-xs truncate">
                                        {gear.description}
                                    </TableCell>
                                    <TableCell>{gear.tier}</TableCell>
                                    <TableCell>{gear.weight}</TableCell>
                                    <TableCell>{gear.category?.name || 'N/A'}</TableCell>
                                    <TableCell>{gear.rarity?.name || 'N/A'}</TableCell>
                                    <TableCell>{gear.type?.name || 'N/A'}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setViewingGear(gear)}
                                                title="Просмотр"
                                            >
                                                <InfoIcon className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setEditingGear(gear)}
                                                title="Редактировать"
                                            >
                                                <PencilIcon className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(gear.id)}
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

            {!hasNextPage && gearItems.length > 0 && (
                <div className="text-center text-sm text-muted-foreground">
                    Все предметы загружены
                </div>
            )}

            <CreateGearDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />

            {editingGear && (
                <EditGearDialog
                    open={!!editingGear}
                    onOpenChange={(open) => !open && setEditingGear(null)}
                    gear={editingGear}
                />
            )}

            {viewingGear && (
                <ViewGearDialog
                    open={!!viewingGear}
                    onOpenChange={(open) => !open && setViewingGear(null)}
                    gear={viewingGear}
                />
            )}
        </div>
    );
}
