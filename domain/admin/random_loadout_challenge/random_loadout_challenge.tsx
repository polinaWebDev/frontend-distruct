'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, PencilIcon, Trash2Icon, InfoIcon } from 'lucide-react';
import { toast } from 'sonner';
import {
    loadoutControllerGetRandomChallengesListWithFullDataOptions,
    loadoutAdminControllerRemoveRandomChallengeMutation,
    loadoutControllerGetRandomChallengeGroupsOptions,
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
import type { RandomChallengeFullDto } from '@/lib/api_client/gen/types.gen';
import { CreateChallengeDialog } from './components/CreateChallengeDialog';
import { EditChallengeDialog } from './components/EditChallengeDialog';
import { ViewChallengeDialog } from './components/ViewChallengeDialog';

export default function RandomLoadoutChallengePage() {
    const queryClient = useQueryClient();
    const { gameType, setGameType } = useAdminGameTypeContext();
    const [searchName, setSearchName] = useState('');
    const [selectedGroup, setSelectedGroup] = useState<string>('all');

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingChallenge, setEditingChallenge] = useState<RandomChallengeFullDto | null>(null);
    const [viewingChallenge, setViewingChallenge] = useState<RandomChallengeFullDto | null>(null);

    // Reset selected group when game type changes
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedGroup('all');
    }, [gameType]);

    // Fetch groups
    const { data: groupsData } = useQuery({
        ...loadoutControllerGetRandomChallengeGroupsOptions({
            client: getPublicClient(),
            query: {
                game_type: gameType,
            },
        }),
    });

    const groups = (groupsData || []) as any[];

    // Fetch challenges list
    const { data, isLoading } = useQuery({
        ...loadoutControllerGetRandomChallengesListWithFullDataOptions({
            client: getPublicClient(),
            query: {
                game_type: gameType,
                // @ts-ignore
                group_id: selectedGroup === 'all' ? undefined : selectedGroup,
            },
        }),
    });

    // Filter challenges by name
    const challenges = useMemo(() => {
        if (!data) return [];
        const challengeList = data as RandomChallengeFullDto[];

        if (!searchName) return challengeList;

        return challengeList.filter((challenge) =>
            challenge.name.toLowerCase().includes(searchName.toLowerCase())
        );
    }, [data, searchName]);

    // Delete mutation
    const deleteMutation = useMutation({
        ...loadoutAdminControllerRemoveRandomChallengeMutation({
            client: getPublicClient(),
        }),
        onSuccess: async () => {
            // await queryClient.invalidateQueries({
            //   queryKey: ['loadoutControllerGetRandomChallengesListWithFullData'],
            //   refetchType: 'all',
            // });

            await queryClient.resetQueries();
            toast.success('Челлендж успешно удалён');
        },
        onError: () => {
            toast.error('Ошибка при удалении челленджа');
        },
    });

    const handleDelete = (id: string) => {
        if (confirm('Вы уверены, что хотите удалить этот челлендж?')) {
            deleteMutation.mutate({
                body: { id },
            });
        }
    };

    return (
        <div className="container mx-auto py-8 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Рандомные челленджи</h1>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Создать челлендж
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
                    <Label htmlFor="group-filter">Группа</Label>
                    <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                        <SelectTrigger id="group-filter" className="w-full">
                            <SelectValue placeholder="Все группы" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Все группы</SelectItem>
                            {groups.map((group) => (
                                <SelectItem key={group.id} value={group.id}>
                                    {group.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
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
                ) : challenges.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        Челленджи не найдены
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Название</TableHead>
                                <TableHead>Группа</TableHead>
                                <TableHead>Описание</TableHead>
                                <TableHead>Уровень</TableHead>
                                <TableHead>Мин. тир</TableHead>
                                <TableHead>Макс. тир</TableHead>
                                <TableHead>Категории</TableHead>
                                <TableHead>Цвет</TableHead>
                                <TableHead>Порядок</TableHead>
                                <TableHead className="text-right">Действия</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {challenges.map((challenge) => (
                                <TableRow key={challenge.id}>
                                    <TableCell className="font-medium">{challenge.name}</TableCell>
                                    <TableCell className="font-medium">
                                        {challenge.group?.name}
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate">
                                        {challenge.description}
                                    </TableCell>
                                    <TableCell>{challenge.challenge_level}</TableCell>
                                    <TableCell>{challenge.min_tier}</TableCell>
                                    <TableCell>{challenge.max_tier}</TableCell>
                                    <TableCell>{challenge.challenge_items.length}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-6 h-6 rounded border"
                                                style={{ backgroundColor: challenge.color }}
                                            />
                                            <span className="text-sm">{challenge.color}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{challenge.order}</TableCell>
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
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            <CreateChallengeDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />

            {editingChallenge && (
                <EditChallengeDialog
                    open={!!editingChallenge}
                    onOpenChange={(open) => !open && setEditingChallenge(null)}
                    challenge={editingChallenge}
                />
            )}

            {viewingChallenge && (
                <ViewChallengeDialog
                    open={!!viewingChallenge}
                    onOpenChange={(open) => !open && setViewingChallenge(null)}
                    challenge={viewingChallenge}
                />
            )}
        </div>
    );
}
