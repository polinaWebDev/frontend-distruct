'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { XIcon, ChevronUpIcon, ChevronDownIcon } from 'lucide-react';
import {
    loadoutAdminControllerUpdateRandomChallengeMutation,
    gearAdminControllerGetGearCategoryListOptions,
    gearAdminControllerGetGearTypeListOptions,
    gearAdminControllerGetGearRarityListOptions,
    loadoutControllerGetRandomChallengeGroupsOptions,
} from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { getPublicClient } from '@/lib/api_client/public_client';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type {
    RandomChallengeFullDto,
    UpdateRandomChallengeDto,
} from '@/lib/api_client/gen/types.gen';
import { GameType, GAME_TYPE_VALUES } from '@/lib/enums/game_type.enum';
import { useAdminGameTypeContext } from '@/domain/admin/context/admin-game-type-context';

interface EditChallengeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    challenge: RandomChallengeFullDto;
}

export function EditChallengeDialog({ open, onOpenChange, challenge }: EditChallengeDialogProps) {
    const queryClient = useQueryClient();
    const { gameType } = useAdminGameTypeContext();
    const [selectedCategories, setSelectedCategories] = useState<string[]>(
        challenge.challenge_items
            .sort((a, b) => a.order - b.order)
            .map((item) => item.gear_category_id)
    );
    const [excludedCategories, setExcludedCategories] = useState<string[]>([]);
    const [excludedTypes, setExcludedTypes] = useState<string[]>(
        challenge.types_to_exclude.map((t: any) => t.id) || []
    );
    const [excludedRarities, setExcludedRarities] = useState<string[]>(
        challenge.rarities_to_exclude.map((r: any) => r.id) || []
    );
    const [additionalConditions, setAdditionalConditions] = useState<string[]>(
        challenge.additional_conditions || []
    );
    const [newCondition, setNewCondition] = useState('');
    const [color, setColor] = useState(challenge.color || '#ffffff');

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<
        Omit<
            UpdateRandomChallengeDto,
            | 'categories_to_generate'
            | 'categories_to_exclude'
            | 'types_to_exclude'
            | 'additional_conditions'
            | 'rarities_to_exclude'
        >
    >({
        defaultValues: {
            id: challenge.id,
            name: challenge.name,
            description: challenge.description,
            min_tier: challenge.min_tier,
            max_tier: challenge.max_tier,
            challenge_level: challenge.challenge_level,
            order: challenge.order,
            game_type: challenge.game_type,
            random_gear_challenge_group_id: challenge.group?.id || '',
        },
    });

    const watchedGameType = watch('game_type') || gameType;
    const watchedGroupId = watch('random_gear_challenge_group_id');

    useEffect(() => {
        register('random_gear_challenge_group_id', { required: 'Выберите группу' });
        register('game_type', { required: 'Выберите игру' });
    }, [register]);

    useEffect(() => {
        if (!open) return;
        setValue('game_type', gameType, { shouldValidate: true });
    }, [gameType, open, setValue]);

    // Fetch categories
    const { data: categoriesData } = useQuery({
        ...gearAdminControllerGetGearCategoryListOptions({
            client: getPublicClient(),
            query: {
                page: 1,
                limit: 1000,
                game_type: watchedGameType,
                name: '',
            },
        }),
        enabled: open,
    });

    // Fetch types
    const { data: typesData } = useQuery({
        ...gearAdminControllerGetGearTypeListOptions({
            client: getPublicClient(),
            query: {
                page: 1,
                limit: 1000,
                game_type: watchedGameType,
                name: '',
            },
        }),
        enabled: open,
    });

    // Fetch rarities
    const { data: raritiesData } = useQuery({
        ...gearAdminControllerGetGearRarityListOptions({
            client: getPublicClient(),
            query: {
                page: 1,
                limit: 1000,
                game_type: watchedGameType,
                name: '',
            },
        }),
        enabled: open,
    });

    // Fetch groups
    const { data: groupsData } = useQuery({
        ...loadoutControllerGetRandomChallengeGroupsOptions({
            client: getPublicClient(),
            query: {
                game_type: watchedGameType,
            },
        }),
        enabled: open,
    });

    const categories = (categoriesData?.data || []) as any[];
    const types = (typesData?.data || []) as any[];
    const rarities = (raritiesData?.data || []) as any[];
    const groups = (groupsData || []) as any[];

    const updateMutation = useMutation({
        ...loadoutAdminControllerUpdateRandomChallengeMutation({
            client: getPublicClient(),
        }),
        onSuccess: async () => {
            await queryClient.resetQueries();
            toast.success('Челлендж успешно обновлён');
            handleClose();
        },
        onError: (error) => {
            console.error(error);
            toast.error('Ошибка при обновлении челленджа');
        },
    });

    const handleClose = () => {
        reset();
        onOpenChange(false);
    };

    const handleAddCondition = () => {
        if (newCondition.trim()) {
            setAdditionalConditions([...additionalConditions, newCondition.trim()]);
            setNewCondition('');
        }
    };

    const handleRemoveCondition = (index: number) => {
        setAdditionalConditions(additionalConditions.filter((_, i) => i !== index));
    };

    const handleMoveCategory = (index: number, direction: 'up' | 'down') => {
        const newCategories = [...selectedCategories];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex >= 0 && targetIndex < newCategories.length) {
            [newCategories[index], newCategories[targetIndex]] = [
                newCategories[targetIndex],
                newCategories[index],
            ];
            setSelectedCategories(newCategories);
        }
    };

    const onSubmit = (
        data: Omit<
            UpdateRandomChallengeDto,
            | 'categories_to_generate'
            | 'categories_to_exclude'
            | 'types_to_exclude'
            | 'additional_conditions'
            | 'rarities_to_exclude'
        >
    ) => {
        if (selectedCategories.length === 0) {
            toast.error('Выберите хотя бы одну категорию для генерации');
            return;
        }

        updateMutation.mutate({
            body: {
                ...data,
                id: challenge.id,
                game_type: data.game_type,
                categories_to_generate: selectedCategories.map((category_id, index) => ({
                    category_id,
                    order: index,
                })),
                categories_to_exclude: excludedCategories,
                types_to_exclude: excludedTypes,
                rarities_to_exclude: excludedRarities,
                additional_conditions: additionalConditions,
                color,
            } as any,
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Редактировать челлендж</DialogTitle>
                    <DialogDescription>Измените параметры рандомного челленджа</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="name">Название *</Label>
                                <Input
                                    id="name"
                                    {...register('name', { required: 'Обязательное поле' })}
                                    placeholder="Введите название..."
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive mt-1">
                                        {errors.name.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="game_type">Тип игры *</Label>
                                <Select
                                    value={watchedGameType}
                                    onValueChange={(value) =>
                                        setValue('game_type', value as GameType, {
                                            shouldValidate: true,
                                        })
                                    }
                                >
                                    <SelectTrigger id="game_type" className="w-full">
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
                                {errors.game_type && (
                                    <p className="text-sm text-destructive mt-1">
                                        {errors.game_type.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="group">Группа *</Label>
                                <Select
                                    value={watchedGroupId}
                                    onValueChange={(value) =>
                                        setValue('random_gear_challenge_group_id', value, {
                                            shouldValidate: true,
                                        })
                                    }
                                >
                                    <SelectTrigger id="group" className="w-full">
                                        <SelectValue placeholder="Выберите группу" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {groups.map((group: any) => (
                                            <SelectItem key={group.id} value={group.id}>
                                                {group.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.random_gear_challenge_group_id && (
                                    <p className="text-sm text-destructive mt-1">
                                        {errors.random_gear_challenge_group_id.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="description">Описание</Label>
                            <Textarea
                                id="description"
                                {...register('description')}
                                placeholder="Введите описание..."
                                rows={3}
                            />
                            {errors.description && (
                                <p className="text-sm text-destructive mt-1">
                                    {errors.description.message}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                            <div>
                                <Label htmlFor="order">Порядок *</Label>
                                <Input
                                    id="order"
                                    type="number"
                                    {...register('order', {
                                        required: 'Обязательное поле',
                                        valueAsNumber: true,
                                        min: { value: 0, message: 'Минимум 0' },
                                    })}
                                />
                                {errors.order && (
                                    <p className="text-sm text-destructive mt-1">
                                        {errors.order.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="challenge_level">Уровень челленджа *</Label>
                                <Input
                                    id="challenge_level"
                                    type="number"
                                    {...register('challenge_level', {
                                        required: 'Обязательное поле',
                                        valueAsNumber: true,
                                        min: { value: 1, message: 'Минимум 1' },
                                    })}
                                />
                                {errors.challenge_level && (
                                    <p className="text-sm text-destructive mt-1">
                                        {errors.challenge_level.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="min_tier">Мин. тир *</Label>
                                <Input
                                    id="min_tier"
                                    type="number"
                                    {...register('min_tier', {
                                        required: 'Обязательное поле',
                                        valueAsNumber: true,
                                        min: { value: 1, message: 'Минимум 1' },
                                    })}
                                />
                                {errors.min_tier && (
                                    <p className="text-sm text-destructive mt-1">
                                        {errors.min_tier.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="max_tier">Макс. тир *</Label>
                                <Input
                                    id="max_tier"
                                    type="number"
                                    {...register('max_tier', {
                                        required: 'Обязательное поле',
                                        valueAsNumber: true,
                                        min: { value: 1, message: 'Минимум 1' },
                                    })}
                                />
                                {errors.max_tier && (
                                    <p className="text-sm text-destructive mt-1">
                                        {errors.max_tier.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="color">Цвет *</Label>
                            <div className="flex items-center gap-4">
                                <input
                                    id="color"
                                    type="color"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    className="w-20 h-10 rounded border cursor-pointer"
                                />
                                <Input
                                    type="text"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    placeholder="#ffffff"
                                    className="flex-1"
                                    pattern="^#[0-9A-Fa-f]{6}$"
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Категории для генерации *</Label>
                            <div className="border rounded-md p-4 space-y-2 max-h-48 overflow-y-auto">
                                {categories.map((category: any) => (
                                    <div key={category.id} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id={`cat-gen-${category.id}`}
                                            checked={selectedCategories.includes(category.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedCategories([
                                                        ...selectedCategories,
                                                        category.id,
                                                    ]);
                                                } else {
                                                    setSelectedCategories(
                                                        selectedCategories.filter(
                                                            (id) => id !== category.id
                                                        )
                                                    );
                                                }
                                            }}
                                            className="w-4 h-4"
                                        />
                                        <label
                                            htmlFor={`cat-gen-${category.id}`}
                                            className="text-sm cursor-pointer"
                                        >
                                            {category.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                            {selectedCategories.length > 0 && (
                                <div className="mt-4">
                                    <Label className="text-sm text-muted-foreground">
                                        Порядок категорий
                                    </Label>
                                    <div className="border rounded-md p-2 space-y-1 mt-2">
                                        {selectedCategories.map((categoryId, index) => {
                                            const category = categories.find(
                                                (c: any) => c.id === categoryId
                                            );
                                            return (
                                                <div
                                                    key={categoryId}
                                                    className="flex items-center justify-between bg-secondary p-2 rounded"
                                                >
                                                    <span className="text-sm font-medium">
                                                        {index + 1}. {category?.name || categoryId}
                                                    </span>
                                                    <div className="flex gap-1">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            disabled={index === 0}
                                                            onClick={() =>
                                                                handleMoveCategory(index, 'up')
                                                            }
                                                            className="h-8 w-8"
                                                        >
                                                            <ChevronUpIcon className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            disabled={
                                                                index ===
                                                                selectedCategories.length - 1
                                                            }
                                                            onClick={() =>
                                                                handleMoveCategory(index, 'down')
                                                            }
                                                            className="h-8 w-8"
                                                        >
                                                            <ChevronDownIcon className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <Label>Категории для исключения</Label>
                            <div className="border rounded-md p-4 space-y-2 max-h-48 overflow-y-auto">
                                {categories.map((category: any) => (
                                    <div key={category.id} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id={`cat-exc-${category.id}`}
                                            checked={excludedCategories.includes(category.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setExcludedCategories([
                                                        ...excludedCategories,
                                                        category.id,
                                                    ]);
                                                } else {
                                                    setExcludedCategories(
                                                        excludedCategories.filter(
                                                            (id) => id !== category.id
                                                        )
                                                    );
                                                }
                                            }}
                                            className="w-4 h-4"
                                        />
                                        <label
                                            htmlFor={`cat-exc-${category.id}`}
                                            className="text-sm cursor-pointer"
                                        >
                                            {category.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <Label>Типы для исключения</Label>
                            <div className="border rounded-md p-4 space-y-2 max-h-48 overflow-y-auto">
                                {types.map((type: any) => (
                                    <div key={type.id} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id={`type-exc-${type.id}`}
                                            checked={excludedTypes.includes(type.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setExcludedTypes([...excludedTypes, type.id]);
                                                } else {
                                                    setExcludedTypes(
                                                        excludedTypes.filter((id) => id !== type.id)
                                                    );
                                                }
                                            }}
                                            className="w-4 h-4"
                                        />
                                        <label
                                            htmlFor={`type-exc-${type.id}`}
                                            className="text-sm cursor-pointer"
                                        >
                                            {type.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <Label>Редкости для исключения</Label>
                            <div className="border rounded-md p-4 space-y-2 max-h-48 overflow-y-auto">
                                {rarities.map((rarity: any) => (
                                    <div key={rarity.id} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id={`rarity-exc-${rarity.id}`}
                                            checked={excludedRarities.includes(rarity.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setExcludedRarities([
                                                        ...excludedRarities,
                                                        rarity.id,
                                                    ]);
                                                } else {
                                                    setExcludedRarities(
                                                        excludedRarities.filter(
                                                            (id) => id !== rarity.id
                                                        )
                                                    );
                                                }
                                            }}
                                            className="w-4 h-4"
                                        />
                                        <label
                                            htmlFor={`rarity-exc-${rarity.id}`}
                                            className="text-sm cursor-pointer"
                                        >
                                            {rarity.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <Label>Дополнительные условия</Label>
                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <Input
                                        value={newCondition}
                                        onChange={(e) => setNewCondition(e.target.value)}
                                        placeholder="Введите условие..."
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddCondition();
                                            }
                                        }}
                                    />
                                    <Button type="button" onClick={handleAddCondition}>
                                        Добавить
                                    </Button>
                                </div>
                                {additionalConditions.length > 0 && (
                                    <div className="border rounded-md p-2 space-y-1">
                                        {additionalConditions.map((condition, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between bg-secondary p-2 rounded"
                                            >
                                                <span className="text-sm">{condition}</span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleRemoveCondition(index)}
                                                >
                                                    <XIcon className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Отмена
                        </Button>
                        <Button type="submit" disabled={updateMutation.isPending}>
                            {updateMutation.isPending ? 'Сохранение...' : 'Сохранить'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
