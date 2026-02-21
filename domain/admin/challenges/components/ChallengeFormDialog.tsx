'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { XIcon, SearchIcon, CheckIcon, ArrowUpIcon, ArrowDownIcon, TrashIcon } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import {
    challengesAdminControllerCreateChallengeMutation,
    challengesAdminControllerUpdateChallengeMutation,
    gearAdminControllerGetGearListInfiniteOptions,
    profileCosmeticsAdminControllerGetOptionsOptions,
} from '@/lib/api_client/gen/@tanstack/react-query.gen';
import type {
    ChallengeSeason,
    CreateChallengeDto,
    UpdateChallengeDto,
    GearEntity,
} from '@/lib/api_client/gen/types.gen';
import { getPublicClient } from '@/lib/api_client/public_client';
import { GameType, GAME_TYPE_VALUES } from '@/lib/enums/game_type.enum';
import { useAdminGameTypeContext } from '@/domain/admin/context/admin-game-type-context';
import {
    ChallengeDifficulty,
    CHALLENGE_DIFFICULTY_VALUES,
} from '@/lib/enums/challenge_difficulty.enum';
import type { ChallengeAdminRow } from '../types';
import { parseAdminCosmeticsResponse } from '@/domain/profile-cosmetics/profile-cosmetics.utils';

type ChallengeFormValues = {
    title: string;
    description: string;
    short_description: string;
    challenge_level: number;
    prize_amount: number;
    active: boolean;
    start_date: string;
    end_date: string;
    time_limit_in_seconds: number;
    game_type: GameType;
    season_id: string;
    difficulty: ChallengeDifficulty;
    prize_cosmetic_id: string;
    is_contact_info_required: boolean;
};

interface ChallengeFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    challenge?: ChallengeAdminRow | null;
    seasons: ChallengeSeason[];
}

const formatToDateTimeLocal = (value?: string | Date | null) => {
    if (!value) {
        return '';
    }

    const date = typeof value === 'string' ? new Date(value) : value;
    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
};

const extractCosmeticId = (value: unknown): string => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    if (typeof value === 'object') {
        const record = value as Record<string, unknown>;
        if (typeof record.id === 'string') return record.id;
        if (typeof record.id === 'number') return String(record.id);
        if (typeof record.cosmetic_id === 'string') return record.cosmetic_id;
        if (typeof record.cosmetic_id === 'number') return String(record.cosmetic_id);
    }
    return '';
};

export function ChallengeFormDialog({
    open,
    onOpenChange,
    challenge,
    seasons,
}: ChallengeFormDialogProps) {
    const queryClient = useQueryClient();
    const isEditing = Boolean(challenge);
    const { gameType } = useAdminGameTypeContext();

    const form = useForm<ChallengeFormValues>({
        defaultValues: {
            title: '',
            description: '',
            short_description: '',
            challenge_level: 1,
            prize_amount: 0,
            active: true,
            start_date: formatToDateTimeLocal(new Date()),
            end_date: '',
            time_limit_in_seconds: 0,
            game_type: gameType ?? GameType.ArenaBreakout,
            season_id: seasons[0]?.id ?? '',
            difficulty: ChallengeDifficulty.Easy,
            prize_cosmetic_id: '',
            is_contact_info_required: challenge?.is_contact_info_required ?? false,
        },
    });

    const { register, handleSubmit, reset, setValue, watch, formState } = form;
    const watchedGameType = watch('game_type');
    const watchedSeason = watch('season_id');
    const watchedDifficulty = watch('difficulty');
    const watchedPrizeCosmeticId = watch('prize_cosmetic_id');

    useEffect(() => {
        register('game_type', { required: 'Выберите игру' });
        register('season_id', { required: 'Выберите сезон' });
        register('difficulty', { required: 'Выберите сложность' });
        register('prize_cosmetic_id');
        register('is_contact_info_required');
    }, [register]);

    const defaultValues = useMemo(() => {
        return {
            title: challenge?.title ?? '',
            description: challenge?.description ?? '',
            challenge_level: challenge?.challenge_level ?? 1,
            prize_amount: challenge?.prize_amount ?? 0,
            active: challenge?.active ?? true,
            start_date: formatToDateTimeLocal(challenge?.start_date ?? new Date()),
            end_date: formatToDateTimeLocal(challenge?.end_date?.toString() ?? undefined),
            time_limit_in_seconds: challenge?.time_limit_in_seconds ?? 0,
            game_type: (challenge?.game_type ?? gameType ?? GameType.ArenaBreakout) as GameType,
            season_id: challenge?.season_id ?? seasons[0]?.id ?? '',
            difficulty: (challenge?.difficulty ?? ChallengeDifficulty.Easy) as ChallengeDifficulty,
            short_description: challenge?.short_description ?? '',
            prize_cosmetic_id: extractCosmeticId(challenge?.prize_cosmetic_id),
            is_contact_info_required: challenge?.is_contact_info_required ?? false,
        };
    }, [challenge, gameType, seasons]);

    useEffect(() => {
        reset(defaultValues);
    }, [defaultValues, reset]);

    useEffect(() => {
        if (!open) return;
        setValue('game_type', gameType, { shouldValidate: true });
    }, [gameType, open, setValue]);

    const [additionalConditions, setAdditionalConditions] = useState<string[]>(
        challenge?.additional_conditions ?? []
    );
    const [newCondition, setNewCondition] = useState('');
    const [selectedGears, setSelectedGears] = useState<GearEntity[]>(challenge?.gears ?? []);
    const [gearSearchQuery, setGearSearchQuery] = useState('');
    const [isGearSelectorOpen, setIsGearSelectorOpen] = useState(false);
    const [cosmeticSearchQuery, setCosmeticSearchQuery] = useState('');
    const gearSelectorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setAdditionalConditions(challenge?.additional_conditions ?? []);
        setSelectedGears(challenge?.gears ?? []);
    }, [challenge]);

    // Close gear selector when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                gearSelectorRef.current &&
                !gearSelectorRef.current.contains(event.target as Node)
            ) {
                setIsGearSelectorOpen(false);
            }
        };

        if (isGearSelectorOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isGearSelectorOpen]);

    const isSeasonMissing = seasons.length === 0;

    const clearDialogState = () => {
        setAdditionalConditions(challenge?.additional_conditions ?? []);
        setNewCondition('');
        setSelectedGears(challenge?.gears ?? []);
        setGearSearchQuery('');
        setIsGearSelectorOpen(false);
        //@ts-ignore
        reset(defaultValues);
    };

    const handleClose = () => {
        clearDialogState();
        onOpenChange(false);
    };

    const createMutation = useMutation({
        ...challengesAdminControllerCreateChallengeMutation({
            client: getPublicClient(),
        }),
        onSuccess: async () => {
            await queryClient.resetQueries({
                queryKey: ['challengesClientControllerGetAvailableChallenges'],
            });
            toast.success('Челлендж успешно создан');
            clearDialogState();
            onOpenChange(false);
            window.location.reload();
        },
        onError: () => {
            toast.error('Ошибка при создании челленджа');
        },
    });

    const updateMutation = useMutation({
        ...challengesAdminControllerUpdateChallengeMutation({
            client: getPublicClient(),
        }),
        onSuccess: async () => {
            await queryClient.resetQueries({
                queryKey: ['challengesClientControllerGetAvailableChallenges'],
            });
            toast.success('Челлендж обновлён');
            clearDialogState();
            onOpenChange(false);

            window.location.reload();
        },
        onError: () => {
            toast.error('Ошибка при обновлении челленджа');
        },
    });

    const isSubmitting = createMutation.status === 'pending' || updateMutation.status === 'pending';
    const handleAddCondition = () => {
        if (!newCondition.trim()) return;
        setAdditionalConditions([...additionalConditions, newCondition.trim()]);
        setNewCondition('');
    };

    // Fetch gear list for selector
    const GEAR_LIMIT = 250;
    const {
        data: gearData,
        isLoading: isLoadingGear,
        fetchNextPage: fetchNextGearPage,
        hasNextPage: hasMoreGear,
    } = useInfiniteQuery({
        ...gearAdminControllerGetGearListInfiniteOptions({
            client: getPublicClient(),
            query: {
                page: 0,
                limit: GEAR_LIMIT,
                game_type: watchedGameType || GameType.ArenaBreakout,
                name: gearSearchQuery || '',
            },
        }),
        enabled: isGearSelectorOpen && !!watchedGameType,
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
            const pageData = (lastPage as { data: GearEntity[] })?.data ?? [];
            if (!pageData.length || pageData.length < GEAR_LIMIT) {
                return undefined;
            }
            return allPages.length + 1;
        },
    });

    const allGearItems = useMemo(() => {
        return (gearData?.pages.flatMap((page) => (page as { data: GearEntity[] })?.data ?? []) ??
            []) as GearEntity[];
    }, [gearData]);
    const { data: cosmeticsData } = useQuery({
        ...profileCosmeticsAdminControllerGetOptionsOptions({
            client: getPublicClient(),
            query: {
                search: cosmeticSearchQuery || undefined,
                is_active: true,
            },
        }),
        enabled: open,
    });

    const cosmeticOptions = useMemo(
        () => parseAdminCosmeticsResponse(cosmeticsData),
        [cosmeticsData]
    );

    const addGear = (gear: GearEntity) => {
        if (selectedGears.some((g) => g.id === gear.id)) return;
        setSelectedGears([...selectedGears, gear]);
    };

    const removeGear = (gearId: string) => {
        setSelectedGears((prev) => prev.filter((g) => g.id !== gearId));
    };

    const moveGear = (index: number, direction: number) => {
        const newGears = [...selectedGears];
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= newGears.length) return;

        [newGears[index], newGears[targetIndex]] = [newGears[targetIndex], newGears[index]];
        setSelectedGears(newGears);
    };

    const onSubmit = (values: ChallengeFormValues) => {
        if (isSeasonMissing) {
            toast.error('Добавьте сезон перед созданием челленджа');
            return;
        }

        const safeChallengeLevel = Number.isFinite(values.challenge_level)
            ? values.challenge_level
            : 1;
        const safePrizeAmount = Number.isFinite(values.prize_amount) ? values.prize_amount : 0;
        const timeLimit =
            Number.isFinite(values.time_limit_in_seconds) && values.time_limit_in_seconds > 0
                ? values.time_limit_in_seconds
                : null;

        const body: CreateChallengeDto = {
            title: values.title,
            description: values.description,
            challenge_level: safeChallengeLevel,
            is_contact_info_required: values.is_contact_info_required,
            prize_amount: safePrizeAmount,
            prize_cosmetic_id: values.prize_cosmetic_id || null,
            short_description: values.short_description,
            active: values.active,
            start_date: new Date(values.start_date),
            end_date: values.end_date ? new Date(values.end_date) : null,
            game_type: values.game_type,
            season_id: values.season_id,
            difficulty: values.difficulty,
            additional_conditions: additionalConditions,
            time_limit_in_seconds: timeLimit,
            loadout_items: selectedGears.map((g, i) => ({
                gear_id: g.id,
                order: i,
            })),
        };

        if (isEditing && challenge) {
            const updateBody: UpdateChallengeDto = {
                ...body,
                id: challenge.id,
            };
            updateMutation.mutate({ body: updateBody });
            return;
        }

        createMutation.mutate({ body });
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Редактировать челлендж' : 'Создать челлендж'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Обновите данные существующего челленджа'
                            : 'Добавьте новый челлендж для сезона'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="title">Название *</Label>
                            <Input
                                id="title"
                                placeholder="Например: Операция Рубеж"
                                {...register('title', { required: 'Название обязательно' })}
                            />
                            {formState.errors.title && (
                                <p className="text-sm text-destructive mt-1">
                                    {formState.errors.title.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="challenge_level">Уровень *</Label>
                            <Input
                                id="challenge_level"
                                type="number"
                                min={1}
                                step={1}
                                {...register('challenge_level', {
                                    valueAsNumber: true,
                                    required: 'Уровень обязателен',
                                })}
                            />
                            {formState.errors.challenge_level && (
                                <p className="text-sm text-destructive mt-1">
                                    {formState.errors.challenge_level.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="short_description">Краткое описание *</Label>
                        <Textarea
                            id="short_description"
                            rows={3}
                            placeholder="Опишите цель челленджа в одно предложение..."
                            {...register('short_description', {
                                required: 'Описание обязательно',
                            })}
                        />
                        {formState.errors.short_description && (
                            <p className="text-sm text-destructive mt-1">
                                {formState.errors.short_description.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Описание *</Label>
                        <Textarea
                            id="description"
                            rows={3}
                            placeholder="Опишите цель челленджа..."
                            {...register('description', { required: 'Описание обязательно' })}
                        />
                        {formState.errors.description && (
                            <p className="text-sm text-destructive mt-1">
                                {formState.errors.description.message}
                            </p>
                        )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="prize_amount">Приз *</Label>
                            <Input
                                id="prize_amount"
                                type="number"
                                min={0}
                                step="0.01"
                                {...register('prize_amount', {
                                    valueAsNumber: true,
                                    required: 'Приз обязателен',
                                })}
                            />
                            {formState.errors.prize_amount && (
                                <p className="text-sm text-destructive mt-1">
                                    {formState.errors.prize_amount.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="start_date">Дата старта *</Label>
                            <Input
                                id="start_date"
                                type="datetime-local"
                                {...register('start_date', { required: 'Укажите дату старта' })}
                            />
                            {formState.errors.start_date && (
                                <p className="text-sm text-destructive mt-1">
                                    {formState.errors.start_date.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="end_date">Дата окончания</Label>
                            <Input id="end_date" type="datetime-local" {...register('end_date')} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="prize-cosmetic-search">Косметическая награда</Label>
                        <Input
                            id="prize-cosmetic-search"
                            placeholder="Поиск косметики..."
                            value={cosmeticSearchQuery}
                            onChange={(event) => setCosmeticSearchQuery(event.target.value)}
                        />
                        <Select
                            value={watchedPrizeCosmeticId || '__none__'}
                            onValueChange={(value) =>
                                setValue('prize_cosmetic_id', value === '__none__' ? '' : value)
                            }
                        >
                            <SelectTrigger id="prize_cosmetic_id" className="w-full">
                                <SelectValue placeholder="Без косметической награды" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__none__">Без косметической награды</SelectItem>
                                {cosmeticOptions.map((item) => (
                                    <SelectItem key={item.id} value={item.id}>
                                        {item.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
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
                                    {GAME_TYPE_VALUES.map((game) => (
                                        <SelectItem key={game.value} value={game.value}>
                                            {game.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {formState.errors.game_type && (
                                <p className="text-sm text-destructive mt-1">
                                    {formState.errors.game_type.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="difficulty">Сложность *</Label>
                            <Select
                                value={watchedDifficulty}
                                onValueChange={(value) =>
                                    setValue('difficulty', value as ChallengeDifficulty, {
                                        shouldValidate: true,
                                    })
                                }
                            >
                                <SelectTrigger id="difficulty" className="w-full">
                                    <SelectValue placeholder="Выберите сложность" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CHALLENGE_DIFFICULTY_VALUES.map((difficulty) => (
                                        <SelectItem key={difficulty.value} value={difficulty.value}>
                                            {difficulty.adjective}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {formState.errors.difficulty && (
                                <p className="text-sm text-destructive mt-1">
                                    {formState.errors.difficulty.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="season_id">Сезон *</Label>
                            <Select
                                value={watchedSeason}
                                onValueChange={(value) =>
                                    setValue('season_id', value, { shouldValidate: true })
                                }
                                disabled={isSeasonMissing}
                            >
                                <SelectTrigger id="season_id" className="w-full">
                                    <SelectValue placeholder="Выберите сезон" />
                                </SelectTrigger>
                                <SelectContent>
                                    {isSeasonMissing ? (
                                        <SelectItem value="none" disabled>
                                            Сначала создайте сезон
                                        </SelectItem>
                                    ) : (
                                        seasons.map((season) => (
                                            <SelectItem key={season.id} value={season.id}>
                                                {season.name}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                            {formState.errors.season_id && (
                                <p className="text-sm text-destructive mt-1">
                                    {formState.errors.season_id.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Доп. условия</Label>
                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <Input
                                        value={newCondition}
                                        onChange={(event) => setNewCondition(event.target.value)}
                                        placeholder="Например: Без смертей"
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter') {
                                                event.preventDefault();
                                                handleAddCondition();
                                            }
                                        }}
                                    />
                                    <Button type="button" onClick={handleAddCondition}>
                                        Добавить
                                    </Button>
                                </div>
                                {additionalConditions.length > 0 && (
                                    <div className="border rounded-md p-3 space-y-2">
                                        {additionalConditions.map((condition, index) => (
                                            <div
                                                key={condition + index}
                                                className="flex justify-between items-center bg-secondary/10 px-3 py-2 rounded"
                                            >
                                                <span className="text-sm">{condition}</span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        setAdditionalConditions(
                                                            additionalConditions.filter(
                                                                (_, idx) => idx !== index
                                                            )
                                                        )
                                                    }
                                                >
                                                    <XIcon className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="time_limit_in_seconds">Лимит времени (сек)</Label>
                            <Input
                                id="time_limit_in_seconds"
                                type="number"
                                min={0}
                                step={1}
                                {...register('time_limit_in_seconds', {
                                    valueAsNumber: true,
                                })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Предметы * (Всего: {selectedGears.length})</Label>
                        <div className="space-y-3">
                            {/* Selected gear list */}
                            {selectedGears.length > 0 && (
                                <div className="space-y-2">
                                    {selectedGears.map((gear, index) => (
                                        <div
                                            key={`${gear.id}-${index}`}
                                            className="flex items-center justify-between p-2 border rounded-md bg-card"
                                        >
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                {/* {gear.image_url && (
                                                    <div className="relative w-8 h-8 shrink-0">
                                                        <Image
                                                            src={getFileUrl(gear.image_url)}
                                                            alt={gear.name}
                                                            fill
                                                            className="object-cover rounded"
                                                        />
                                                    </div>
                                                )} */}
                                                <span
                                                    className="font-medium text-sm truncate"
                                                    title={gear.name}
                                                >
                                                    {gear.name}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => moveGear(index, -1)}
                                                    disabled={index === 0}
                                                >
                                                    <ArrowUpIcon className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => moveGear(index, 1)}
                                                    disabled={index === selectedGears.length - 1}
                                                >
                                                    <ArrowDownIcon className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                                    onClick={() => removeGear(gear.id)}
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Gear selector */}
                            <div className="relative" ref={gearSelectorRef}>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() => setIsGearSelectorOpen(!isGearSelectorOpen)}
                                >
                                    <SearchIcon className="w-4 h-4 mr-2" />
                                    Добавить предмет...
                                </Button>

                                {isGearSelectorOpen && (
                                    <div className="absolute z-50 w-full mt-2 bg-popover border rounded-md shadow-lg max-h-[400px] flex flex-col">
                                        {/* Search input */}
                                        <div className="p-3 border-b">
                                            <Input
                                                placeholder="Поиск предметов..."
                                                value={gearSearchQuery}
                                                onChange={(e) => setGearSearchQuery(e.target.value)}
                                                className="w-full"
                                            />
                                        </div>

                                        {/* Gear list */}
                                        <div className="overflow-y-auto flex-1 p-2">
                                            {isLoadingGear && allGearItems.length === 0 ? (
                                                <div className="p-4 text-center text-sm text-muted-foreground">
                                                    Загрузка...
                                                </div>
                                            ) : allGearItems.length === 0 ? (
                                                <div className="p-4 text-center text-sm text-muted-foreground">
                                                    Предметы не найдены
                                                </div>
                                            ) : (
                                                <div className="space-y-1">
                                                    {allGearItems.map((gear) => {
                                                        const isSelected = selectedGears.some(
                                                            (g) => g.id === gear.id
                                                        );
                                                        return (
                                                            <button
                                                                key={gear.id}
                                                                type="button"
                                                                onClick={() => addGear(gear)}
                                                                disabled={isSelected}
                                                                className={`
                                                                    w-full flex items-center gap-3 p-2 rounded-md text-left
                                                                    hover:bg-accent transition-colors
                                                                    ${isSelected ? 'opacity-50 cursor-not-allowed' : ''}
                                                                `}
                                                            >
                                                                <div className="relative w-10 h-10 shrink-0">
                                                                    {/* {gear.image_url ? (
                                                                        <Image
                                                                            src={getFileUrl(
                                                                                gear.image_url
                                                                            )}
                                                                            alt={gear.name}
                                                                            fill
                                                                            className="object-cover rounded"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-full h-full bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                                                                            Нет
                                                                        </div>
                                                                    )} */}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="font-medium text-sm truncate">
                                                                        {gear.name}
                                                                    </div>
                                                                    {gear.description && (
                                                                        <div className="text-xs text-muted-foreground truncate">
                                                                            {gear.description}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                {isSelected && (
                                                                    <CheckIcon className="w-4 h-4 text-primary shrink-0" />
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {/* Load more button */}
                                            {hasMoreGear && (
                                                <div className="mt-2 pt-2 border-t">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="w-full"
                                                        onClick={() => fetchNextGearPage()}
                                                        disabled={isLoadingGear}
                                                    >
                                                        {isLoadingGear
                                                            ? 'Загрузка...'
                                                            : 'Загрузить ещё'}
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Добавьте предметы и настройте их порядок.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <label className="flex items-center gap-2 text-sm">
                                <input type="checkbox" {...register('active')} className="h-4 w-4" />
                                <span>Активен *</span>
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    {...register('is_contact_info_required')}
                                    className="h-4 w-4"
                                />
                                <span>Контакты обязательны</span>
                            </label>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" type="button" onClick={handleClose}>
                                Отмена
                            </Button>
                            <Button type="submit" disabled={isSubmitting || isSeasonMissing}>
                                {isSubmitting
                                    ? isEditing
                                        ? 'Сохраняем...'
                                        : 'Создаём...'
                                    : isEditing
                                      ? 'Сохранить'
                                      : 'Создать'}
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
