'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { GameSelector } from '@/components/admin/GameSelector';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
import { getPublicClient } from '@/lib/api_client/public_client';
import {
    gearAdminControllerGetGearCategoryListOptions,
    tiersAdminControllerCreateMutation,
    tiersAdminControllerListOptions,
    tiersAdminControllerListQueryKey,
    tiersAdminControllerRemoveMutation,
    tiersAdminControllerUpdateMutation,
} from '@/lib/api_client/gen/@tanstack/react-query.gen';
import type {
    GearCategoryEntity,
    TierListCategoryResponseAdminDto,
} from '@/lib/api_client/gen/types.gen';

const GEAR_CATEGORY_PAGE_LIMIT = 200;

const getErrorMessage = (error: unknown, fallback: string) => {
    const maybeAxios = error as {
        response?: { data?: { message?: string | string[] } };
    };
    const message = maybeAxios.response?.data?.message;
    if (Array.isArray(message)) {
        return message.join(', ');
    }
    if (typeof message === 'string') {
        return message;
    }
    return fallback;
};

const normalizeGameTypeLabel = (value: GameType) =>
    GAME_TYPE_VALUES.find((gt) => gt.value === value)?.label ?? value;

export default function TierListCategoriesPage() {
    const queryClient = useQueryClient();
    const { gameType, setGameType } = useAdminGameTypeContext();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<TierListCategoryResponseAdminDto | null>(
        null
    );

    useEffect(() => {
        setEditingCategory(null);
    }, [gameType]);

    const {
        data: categories,
        isLoading: isCategoriesLoading,
        error: categoriesError,
    } = useQuery({
        ...tiersAdminControllerListOptions({
            client: getPublicClient(),
        }),
    });

    const filteredCategories = useMemo(() => {
        if (!categories) return [];
        return categories.filter((category) => category.gameType === gameType);
    }, [categories, gameType]);

    const createMutation = useMutation({
        ...tiersAdminControllerCreateMutation({
            client: getPublicClient(),
        }),
        onSuccess: async (created) => {
            queryClient.setQueryData<TierListCategoryResponseAdminDto[]>(
                tiersAdminControllerListQueryKey(),
                (previous) => (previous ? [created, ...previous] : [created])
            );
            toast.success('Категория создана');
            setIsCreateOpen(false);
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Ошибка при создании категории'));
        },
    });

    const updateMutation = useMutation({
        ...tiersAdminControllerUpdateMutation({
            client: getPublicClient(),
        }),
        onSuccess: async (updated) => {
            queryClient.setQueryData<TierListCategoryResponseAdminDto[]>(
                tiersAdminControllerListQueryKey(),
                (previous) =>
                    previous
                        ? previous.map((item) => (item.id === updated.id ? updated : item))
                        : [updated]
            );
            toast.success('Категория обновлена');
            setEditingCategory(null);
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Ошибка при обновлении категории'));
        },
    });

    const deleteMutation = useMutation({
        ...tiersAdminControllerRemoveMutation({
            client: getPublicClient(),
        }),
        onSuccess: async (_, variables) => {
            queryClient.setQueryData<TierListCategoryResponseAdminDto[]>(
                tiersAdminControllerListQueryKey(),
                (previous) =>
                    previous ? previous.filter((item) => item.id !== variables.path.id) : []
            );
            toast.success('Категория удалена');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Ошибка при удалении категории'));
        },
    });

    const handleCreate = (payload: {
        name: string;
        gearCategoryIds: string[];
        gameType: GameType;
    }) => {
        createMutation.mutate({
            body: {
                gameType: payload.gameType,
                name: payload.name,
                gearCategoryIds: payload.gearCategoryIds,
            },
        });
    };

    const handleUpdate = (payload: {
        name: string;
        gearCategoryIds: string[];
        gameType: GameType;
    }) => {
        if (!editingCategory) return;
        updateMutation.mutate({
            path: { id: editingCategory.id },
            body: {
                gameType: payload.gameType,
                name: payload.name,
                gearCategoryIds: payload.gearCategoryIds,
            },
        });
    };

    const handleDelete = (id: string) => {
        if (confirm('Удалить категорию?')) {
            deleteMutation.mutate({
                path: { id },
            });
        }
    };

    return (
        <div className="container mx-auto py-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Категории тир-листов</h1>
                    <p className="text-sm text-muted-foreground">
                        Контекст: {normalizeGameTypeLabel(gameType)}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <GameSelector value={gameType} onChange={setGameType} />
                    <Button onClick={() => setIsCreateOpen(true)}>
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Создать категорию
                    </Button>
                </div>
            </div>

            <div className="border rounded-lg">
                {isCategoriesLoading ? (
                    <div className="p-8 text-center text-muted-foreground">Загрузка...</div>
                ) : categoriesError ? (
                    <div className="p-8 text-center text-destructive">
                        {getErrorMessage(categoriesError, 'Не удалось загрузить категории')}
                    </div>
                ) : filteredCategories.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        Для выбранной игры категории не найдены
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Название</TableHead>
                                <TableHead>Связанные категории снаряжения</TableHead>
                                <TableHead className="text-right">Действия</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCategories.map((category) => (
                                <TableRow key={category.id}>
                                    <TableCell className="font-medium">{category.name}</TableCell>
                                    <TableCell>
                                        {category.gearCategories.length === 0 ? (
                                            <span className="text-muted-foreground text-sm">
                                                Нет связей
                                            </span>
                                        ) : (
                                            <div className="flex flex-wrap gap-2">
                                                {category.gearCategories.map((gear) => (
                                                    <Badge key={gear.id} variant="secondary">
                                                        {gear.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
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

            <TierListCategoryDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                title="Создать категорию"
                description="Добавьте новую категорию для выбранной игры"
                submitLabel="Создать"
                onSubmit={handleCreate}
            />

            {editingCategory && (
                <TierListCategoryDialog
                    open={!!editingCategory}
                    onOpenChange={(open) => !open && setEditingCategory(null)}
                    title="Редактировать категорию"
                    description="Обновите название и список связанных категорий"
                    submitLabel="Сохранить"
                    initialName={editingCategory.name}
                    initialGearCategoryIds={editingCategory.gearCategories.map((item) => item.id)}
                    onSubmit={handleUpdate}
                />
            )}
        </div>
    );
}

function TierListCategoryDialog({
    open,
    onOpenChange,
    title,
    description,
    submitLabel,
    initialName = '',
    initialGearCategoryIds = [],
    onSubmit,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    submitLabel: string;
    initialName?: string;
    initialGearCategoryIds?: string[];
    onSubmit: (payload: { name: string; gearCategoryIds: string[]; gameType: GameType }) => void;
}) {
    const { gameType: pageGameType } = useAdminGameTypeContext();
    const [name, setName] = useState(initialName);
    const [selectedIds, setSelectedIds] = useState<string[]>(initialGearCategoryIds);
    const [selectedGameType, setSelectedGameType] = useState<GameType>(pageGameType);
    const initialIdsKey = useMemo(() => initialGearCategoryIds.join('|'), [initialGearCategoryIds]);
    const normalizedInitialIds = useMemo(() => initialGearCategoryIds.slice(), [initialIdsKey]);

    useEffect(() => {
        if (!open) return;
        setName(initialName);
        setSelectedIds(normalizedInitialIds);
    }, [initialName, initialIdsKey, normalizedInitialIds, open]);

    useEffect(() => {
        if (!open) return;
        setSelectedGameType(pageGameType);
    }, [open, pageGameType]);

    const {
        data: gearCategoryList,
        isLoading,
        error: gearCategoriesError,
    } = useQuery({
        ...gearAdminControllerGetGearCategoryListOptions({
            client: getPublicClient(),
            query: {
                page: 1,
                limit: GEAR_CATEGORY_PAGE_LIMIT,
                game_type: selectedGameType,
                name: '',
            },
        }),
        enabled: open,
    });

    const availableGearCategories = useMemo(() => {
        return (gearCategoryList?.data ?? []) as GearCategoryEntity[];
    }, [gearCategoryList]);

    const errorMessage = gearCategoriesError
        ? getErrorMessage(gearCategoriesError, 'Не удалось загрузить категории снаряжения')
        : undefined;

    const handleToggle = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const handleClose = (nextOpen: boolean) => {
        if (!nextOpen) {
            setName(initialName);
            setSelectedIds(initialGearCategoryIds);
        }
        onOpenChange(nextOpen);
    };

    const handleSubmit = () => {
        onSubmit({
            name,
            gearCategoryIds: selectedIds,
            gameType: selectedGameType,
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="tier-category-name">Название *</Label>
                        <Input
                            id="tier-category-name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="Введите название..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tier-category-game-type">Тип игры *</Label>
                        <Select
                            value={selectedGameType}
                            onValueChange={(value) => setSelectedGameType(value as GameType)}
                        >
                            <SelectTrigger id="tier-category-game-type" className="w-full">
                                <SelectValue placeholder="Выберите игру" />
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

                    <div className="space-y-2">
                        <Label>Связанные категории снаряжения *</Label>
                        <div className="border rounded-md p-4 space-y-2 max-h-56 overflow-y-auto">
                            {isLoading ? (
                                <div className="text-sm text-muted-foreground">
                                    Загрузка списка...
                                </div>
                            ) : errorMessage ? (
                                <div className="text-sm text-destructive">{errorMessage}</div>
                            ) : availableGearCategories.length === 0 ? (
                                <div className="text-sm text-muted-foreground">
                                    Для выбранной игры нет доступных категорий
                                </div>
                            ) : (
                                availableGearCategories.map((category) => (
                                    <label
                                        key={category.id}
                                        className="flex items-center gap-2 text-sm cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4"
                                            checked={selectedIds.includes(category.id)}
                                            onChange={() => handleToggle(category.id)}
                                        />
                                        <span>{category.name}</span>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>

                    {typeof gearCategoryList?.total === 'number' &&
                        gearCategoryList.total > GEAR_CATEGORY_PAGE_LIMIT && (
                            <p className="text-xs text-muted-foreground">
                                Показаны первые {GEAR_CATEGORY_PAGE_LIMIT} категорий снаряжения.
                            </p>
                        )}
                </div>

                <DialogFooter className="mt-4">
                    <Button variant="secondary" onClick={() => handleClose(false)}>
                        Отмена
                    </Button>
                    <Button onClick={handleSubmit}>{submitLabel}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
