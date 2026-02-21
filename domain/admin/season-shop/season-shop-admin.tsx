'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, PencilIcon, Trash2Icon, InfoIcon } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import {
    challengeSeasonAdminControllerGetListOptions,
    challengesShopAdminControllerGetListOptions,
    challengesShopAdminControllerRemoveMutation,
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ChallengeShopItemEntity, ChallengeSeason } from '@/lib/api_client/gen/types.gen';

import { getFileUrl } from '@/lib/utils';
import { CreateChallengeShopItemDialog } from './components/CreateChallengeShopItemDialog';
import { EditChallengeShopItemDialog } from './components/EditChallengeShopItemDialog';
import { ViewChallengeShopItemDialog } from './components/ViewChallengeShopItemDialog';

const getSeasonShopPreview = (item: ChallengeShopItemEntity): string | null => {
    const record = item as unknown as Record<string, unknown>;
    const prize = record.prize_cosmetic;
    if (prize && typeof prize === 'object') {
        const prizeRecord = prize as Record<string, unknown>;
        const asset = prizeRecord.asset_url;
        if (typeof asset === 'string' && asset.trim()) {
            return asset;
        }
    }
    return item.image_url ?? null;
};

export const SeasonShopAdmin = () => {
    const queryClient = useQueryClient();
    const [seasonId, setSeasonId] = useState<string>('');
    const [searchName, setSearchName] = useState('');

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ChallengeShopItemEntity | null>(null);
    const [viewingItem, setViewingItem] = useState<ChallengeShopItemEntity | null>(null);

    // Fetch seasons for filter
    const { data: seasonsData } = useQuery({
        ...challengeSeasonAdminControllerGetListOptions({
            client: getPublicClient(),
            query: {},
        }),
    });

    const seasons = (seasonsData || []) as ChallengeSeason[];

    // Fetch shop items
    const { data: itemsData, isLoading } = useQuery({
        ...challengesShopAdminControllerGetListOptions({
            client: getPublicClient(),
            query: {
                season_id: seasonId || null,
                search: searchName || null,
            },
        }),
    });

    const shopItems = useMemo(() => {
        return (itemsData || []) as ChallengeShopItemEntity[];
    }, [itemsData]);

    // Delete mutation
    const deleteMutation = useMutation({
        ...challengesShopAdminControllerRemoveMutation({
            client: getPublicClient(),
        }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['challengesShopAdminControllerGetList'],
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
                <h1 className="text-3xl font-bold">Предметы магазина сезонов</h1>
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
                    <Label htmlFor="season">Сезон</Label>
                    <Select value={seasonId} onValueChange={setSeasonId}>
                        <SelectTrigger id="season" className="w-full">
                            <SelectValue placeholder="Все сезоны" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem
                                //@ts-ignore
                                value={null}
                            >
                                Все сезоны
                            </SelectItem>
                            {seasons.map((season) => (
                                <SelectItem key={season.id} value={season.id}>
                                    {season.name}
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
                ) : shopItems.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">Предметы не найдены</div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Изображение</TableHead>
                                <TableHead>Название</TableHead>
                                <TableHead>Описание</TableHead>
                                <TableHead>Цена</TableHead>
                                <TableHead>Бесконечный</TableHead>
                                <TableHead>Активен</TableHead>
                                <TableHead>Порядок</TableHead>
                                <TableHead>Количество</TableHead>
                                <TableHead className="text-right">Действия</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {shopItems.map((item) => {
                                const preview = getSeasonShopPreview(item);
                                return (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            {preview ? (
                                                <Image
                                                    src={getFileUrl(preview)}
                                                    alt={item.name}
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
                                        <TableCell className="font-medium">{item.name}</TableCell>
                                        <TableCell className="max-w-xs truncate">
                                            {item.description}
                                        </TableCell>
                                        <TableCell>{item.price}</TableCell>
                                        <TableCell>{item.is_infinite ? 'Да' : 'Нет'}</TableCell>
                                        <TableCell>{item.is_active ? 'Да' : 'Нет'}</TableCell>
                                        <TableCell>{item.order}</TableCell>
                                        <TableCell>{item.quantity}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setViewingItem(item)}
                                                    title="Просмотр"
                                                >
                                                    <InfoIcon className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setEditingItem(item)}
                                                    title="Редактировать"
                                                >
                                                    <PencilIcon className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(item.id)}
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

            <CreateChallengeShopItemDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                seasons={seasons}
            />

            {editingItem && (
                <EditChallengeShopItemDialog
                    open={!!editingItem}
                    onOpenChange={(open) => !open && setEditingItem(null)}
                    item={editingItem}
                    seasons={seasons}
                />
            )}

            {viewingItem && (
                <ViewChallengeShopItemDialog
                    open={!!viewingItem}
                    onOpenChange={(open) => !open && setViewingItem(null)}
                    item={viewingItem}
                />
            )}
        </div>
    );
};
