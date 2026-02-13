'use client';

import { useState, useMemo } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, PencilIcon, Trash2Icon, InfoIcon } from 'lucide-react';
import { toast } from 'sonner';
import {
    gearAdminControllerGetGearRarityListInfiniteOptions,
    gearAdminControllerRemoveGearRarityMutation,
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
import { CreateRarityDialog } from './components/CreateRarityDialog';
import { EditRarityDialog } from './components/EditRarityDialog';
import { ViewRarityDialog } from './components/ViewRarityDialog';
import type { GearRarityEntity } from '@/lib/api_client/gen/types.gen';

export default function GearRaritiesPage() {
    const queryClient = useQueryClient();
    const { gameType, setGameType } = useAdminGameTypeContext();
    const [searchName, setSearchName] = useState('');
    const limit = 20;

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingRarity, setEditingRarity] = useState<GearRarityEntity | null>(null);
    const [viewingRarity, setViewingRarity] = useState<GearRarityEntity | null>(null);

    // Fetch rarities list with infinite query
    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
        ...gearAdminControllerGetGearRarityListInfiniteOptions({
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
            // lastPage is an array of GetGearRarityListResponseDto
            if (!lastPage || lastPage.data.length === 0) {
                return undefined;
            }
            const responseDto = lastPage.data;
            // Check if we have more pages
            if (!responseDto || responseDto.length < limit) {
                return undefined;
            }
            return allPages.length + 1;
        },
    });

    // Flatten all pages into a single array
    const rarities = useMemo(() => {
        return (data?.pages.flatMap((page) => page?.data ?? []) ?? []) as GearRarityEntity[];
    }, [data]);

    // Delete mutation
    const deleteMutation = useMutation({
        ...gearAdminControllerRemoveGearRarityMutation({
            client: getPublicClient(),
        }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['gearAdminControllerGetGearRarityList'],
                refetchType: 'all',
            });
            toast.success('Редкость успешно удалена');
        },
        onError: () => {
            toast.error('Ошибка при удалении редкости');
        },
    });

    const handleDelete = (id: string) => {
        if (confirm('Вы уверены, что хотите удалить эту редкость?')) {
            deleteMutation.mutate({
                body: { id },
            });
        }
    };

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Управление редкостью</h1>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <PlusIcon />
                    Создать редкость
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
                        onChange={(e) => {
                            setSearchName(e.target.value);
                        }}
                    />
                </div>
                <div className="w-64 space-y-2">
                    <Label htmlFor="game-type">Тип игры</Label>
                    <Select
                        value={gameType}
                        onValueChange={(value) => {
                            setGameType(value as GameType);
                        }}
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
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Название</TableHead>
                            <TableHead>Описание</TableHead>
                            <TableHead>Цвет</TableHead>
                            <TableHead>Вес</TableHead>
                            <TableHead className="w-[200px]">Действия</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    Загрузка...
                                </TableCell>
                            </TableRow>
                        ) : rarities.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    Редкости не найдены
                                </TableCell>
                            </TableRow>
                        ) : (
                            rarities.map((rarity) => (
                                <TableRow key={rarity.id}>
                                    <TableCell className="font-medium">{rarity.name}</TableCell>
                                    <TableCell className="max-w-xs truncate">
                                        {rarity.description}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-6 h-6 rounded border"
                                                style={{ backgroundColor: rarity.color }}
                                            />
                                            <span className="text-sm font-mono">
                                                {rarity.color}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{rarity.weight}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() => setViewingRarity(rarity)}
                                            >
                                                <InfoIcon />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() => setEditingRarity(rarity)}
                                            >
                                                <PencilIcon />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() => handleDelete(rarity.id)}
                                                disabled={deleteMutation.isPending}
                                            >
                                                <Trash2Icon />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
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

            {!hasNextPage && rarities.length > 0 && (
                <div className="text-center text-sm text-muted-foreground">
                    Все редкости загружены
                </div>
            )}

            {/* Dialogs */}
            <CreateRarityDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />

            {editingRarity && (
                <EditRarityDialog
                    open={!!editingRarity}
                    onOpenChange={(open) => !open && setEditingRarity(null)}
                    rarity={editingRarity}
                />
            )}

            {viewingRarity && (
                <ViewRarityDialog
                    open={!!viewingRarity}
                    onOpenChange={(open) => !open && setViewingRarity(null)}
                    rarity={viewingRarity}
                />
            )}
        </div>
    );
}
