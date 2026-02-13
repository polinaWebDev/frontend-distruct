'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PlusIcon, PencilIcon, InfoIcon } from 'lucide-react';
import { challengeSeasonAdminControllerGetListOptions } from '@/lib/api_client/gen/@tanstack/react-query.gen';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ChallengeSeason } from '@/lib/api_client/gen/types.gen';
import { CreateOrUpdateSeasonDialog } from './dialogs/create-or-update-season.dialog';
import { RemoveSeasonDialog } from './dialogs/remove-season.dialog';

export const SeasonsPage = () => {
    const [searchName, setSearchName] = useState('');
    const [activeFilter, setActiveFilter] = useState<boolean | null>(null);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingSeason, setEditingSeason] = useState<ChallengeSeason | null>(null);
    const [viewingSeason, setViewingSeason] = useState<ChallengeSeason | null>(null);

    // Fetch seasons list
    const { data, isLoading } = useQuery({
        ...challengeSeasonAdminControllerGetListOptions({
            client: getPublicClient(),
            query: {
                search: searchName || null,
                active: activeFilter,
            },
        }),
    });

    // Filter seasons by name
    const seasons = useMemo(() => {
        if (!data) return [];
        const seasonList = data as ChallengeSeason[];

        if (!searchName && activeFilter === null) return seasonList;

        return seasonList.filter((season) => {
            const matchesName = !searchName
                ? true
                : season.name.toLowerCase().includes(searchName.toLowerCase());
            const matchesActive = activeFilter === null ? true : season.active === activeFilter;
            return matchesName && matchesActive;
        });
    }, [data, searchName, activeFilter]);

    const formatDate = (date: Date | string) => {
        const d = typeof date === 'string' ? new Date(date) : date;
        return new Intl.DateTimeFormat('ru-RU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        }).format(d);
    };

    const getGameTypeLabel = (game: string) => {
        const gameTypes: Record<string, string> = {
            escape_from_tarkov: 'Escape from Tarkov',
            arena_breakout: 'Arena Breakout',
            active_matter: 'Active Matter',
            arc_raiders: 'Arc Raiders',
        };
        return gameTypes[game] || game;
    };

    return (
        <div className="container mx-auto py-8 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Сезоны</h1>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Создать сезон
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
                    <Label htmlFor="active-filter">Статус</Label>
                    <Select
                        value={activeFilter === null ? 'all' : activeFilter ? 'active' : 'inactive'}
                        onValueChange={(value) => {
                            if (value === 'all') setActiveFilter(null);
                            else if (value === 'active') setActiveFilter(true);
                            else setActiveFilter(false);
                        }}
                    >
                        <SelectTrigger id="active-filter" className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Все</SelectItem>
                            <SelectItem value="active">Активные</SelectItem>
                            <SelectItem value="inactive">Неактивные</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Table */}
            <div className="border rounded-lg">
                {isLoading ? (
                    <div className="p-8 text-center text-muted-foreground">Загрузка...</div>
                ) : seasons.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">Сезоны не найдены</div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Название</TableHead>
                                <TableHead>Игра</TableHead>
                                <TableHead>Статус</TableHead>
                                <TableHead>Дата окончания</TableHead>
                                <TableHead>Дата создания</TableHead>
                                <TableHead className="text-right">Действия</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {seasons.map((season) => (
                                <TableRow key={season.id}>
                                    <TableCell className="font-medium">{season.name}</TableCell>
                                    <TableCell>{getGameTypeLabel(season.game)}</TableCell>
                                    <TableCell>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                season.active
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}
                                        >
                                            {season.active ? 'Активен' : 'Неактивен'}
                                        </span>
                                    </TableCell>
                                    <TableCell>{formatDate(season.ends_at)}</TableCell>
                                    <TableCell>{formatDate(season.createdAt)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setViewingSeason(season)}
                                                title="Просмотр"
                                            >
                                                <InfoIcon className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setEditingSeason(season)}
                                                title="Редактировать"
                                            >
                                                <PencilIcon className="w-4 h-4" />
                                            </Button>
                                            <RemoveSeasonDialog id={season.id} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            <CreateOrUpdateSeasonDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />

            {editingSeason && (
                <CreateOrUpdateSeasonDialog
                    open={!!editingSeason}
                    onOpenChange={(open) => !open && setEditingSeason(null)}
                    season={editingSeason}
                />
            )}

            <Dialog open={!!viewingSeason} onOpenChange={(open) => !open && setViewingSeason(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    {viewingSeason && (
                        <>
                            <DialogHeader>
                                <DialogTitle>{viewingSeason.name}</DialogTitle>
                                <DialogDescription>Информация о сезоне</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">
                                        Игра
                                    </Label>
                                    <p className="mt-1">{getGameTypeLabel(viewingSeason.game)}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">
                                        Статус
                                    </Label>
                                    <p className="mt-1">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                viewingSeason.active
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}
                                        >
                                            {viewingSeason.active ? 'Активен' : 'Неактивен'}
                                        </span>
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">
                                        Дата окончания
                                    </Label>
                                    <p className="mt-1">{formatDate(viewingSeason.ends_at)}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">
                                        Дата создания
                                    </Label>
                                    <p className="mt-1">{formatDate(viewingSeason.createdAt)}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">
                                        Дата обновления
                                    </Label>
                                    <p className="mt-1">{formatDate(viewingSeason.updatedAt)}</p>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};
