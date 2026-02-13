'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';

import {
    loadoutControllerGetRandomChallengeGroupsOptions,
    loadoutAdminControllerRemoveRandomChallengeGroupMutation,
} from '@/lib/api_client/gen/@tanstack/react-query.gen';
import type { RandomGearChallengeGroupEntity } from '@/lib/api_client/gen/types.gen';
import { getPublicClient } from '@/lib/api_client/public_client';
import { Button } from '@/components/ui/button';
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
import { useAdminGameTypeContext } from '@/domain/admin/context/admin-game-type-context';
import { ChallengeGroupFormDialog } from './components/ChallengeGroupFormDialog';

export const ChallengeGroupsPage = () => {
    const queryClient = useQueryClient();
    const { gameType: gameTypeFilter, setGameType: setGameTypeFilter } = useAdminGameTypeContext();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<RandomGearChallengeGroupEntity | null>(null);

    const { data, isLoading, refetch } = useQuery({
        ...loadoutControllerGetRandomChallengeGroupsOptions({
            client: getPublicClient(),
            query: {
                game_type: gameTypeFilter,
            },
        }),
        enabled: !!gameTypeFilter,
    });

    const groups = useMemo(() => {
        return (data ?? []) as RandomGearChallengeGroupEntity[];
    }, [data]);

    const deleteMutation = useMutation({
        ...loadoutAdminControllerRemoveRandomChallengeGroupMutation({
            client: getPublicClient(),
        }),
        onSuccess: async () => {
            refetch();
            toast.success('Группа удалена');
        },
        onError: () => {
            toast.error('Ошибка при удалении группы');
        },
    });

    const handleDelete = (id: string) => {
        if (!confirm('Вы уверены, что хотите удалить эту группу?')) {
            return;
        }
        deleteMutation.mutate({ body: { id } });
    };

    const getGameLabel = (value: GameType) =>
        GAME_TYPE_VALUES.find((item) => item.value === value)?.label ?? value;

    return (
        <div className="container mx-auto py-8 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Группы случайных челленджей</h1>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Создать группу
                </Button>
            </div>

            <div className="flex gap-4 items-end">
                <div className="w-56 space-y-2">
                    <Label htmlFor="game-filter">Игра</Label>
                    <Select
                        value={gameTypeFilter}
                        onValueChange={(value) => setGameTypeFilter(value as GameType)}
                    >
                        <SelectTrigger id="game-filter" className="w-full">
                            <SelectValue placeholder="Фильтр по игре" />
                        </SelectTrigger>
                        <SelectContent>
                            {GAME_TYPE_VALUES.map((item) => (
                                <SelectItem key={item.value} value={item.value}>
                                    {item.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="border rounded-lg">
                {isLoading ? (
                    <div className="p-8 text-center text-muted-foreground">Загрузка...</div>
                ) : groups.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">Группы не найдены</div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Название</TableHead>
                                <TableHead>Игра</TableHead>
                                <TableHead className="text-right">Действия</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {groups.map((group) => (
                                <TableRow key={group.id}>
                                    <TableCell className="font-medium">{group.name}</TableCell>
                                    <TableCell>
                                        {getGameLabel(group.game_type as GameType)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setEditingGroup(group)}
                                                title="Редактировать"
                                            >
                                                <PencilIcon className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(group.id)}
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

            <ChallengeGroupFormDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                refetch={refetch}
            />

            {editingGroup && (
                <ChallengeGroupFormDialog
                    open={!!editingGroup}
                    onOpenChange={(open) => !open && setEditingGroup(null)}
                    group={editingGroup}
                    refetch={refetch}
                />
            )}
        </div>
    );
};
