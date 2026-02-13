'use client';

import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    loadoutAdminControllerCreateRandomChallengeGroupMutation,
    loadoutAdminControllerUpdateRandomChallengeGroupMutation,
} from '@/lib/api_client/gen/@tanstack/react-query.gen';
import type {
    CreateRandomChallengeGroupDto,
    RandomGearChallengeGroupEntity,
    UpdateRandomChallengeGroupDto,
} from '@/lib/api_client/gen/types.gen';
import { getPublicClient } from '@/lib/api_client/public_client';
import { GameType, GAME_TYPE_VALUES } from '@/lib/enums/game_type.enum';
import { useAdminGameTypeContext } from '@/domain/admin/context/admin-game-type-context';

type ChallengeGroupFormValues = {
    name: string;
    game_type: GameType;
};

interface ChallengeGroupFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    group?: RandomGearChallengeGroupEntity | null;
    refetch: () => void;
}

export function ChallengeGroupFormDialog({
    open,
    onOpenChange,
    group,
    refetch,
}: ChallengeGroupFormDialogProps) {
    const queryClient = useQueryClient();
    const isEditing = Boolean(group);
    const { gameType } = useAdminGameTypeContext();

    const form = useForm<ChallengeGroupFormValues>({
        defaultValues: {
            name: '',
            game_type: gameType ?? GameType.ArenaBreakout,
        },
    });

    const { register, handleSubmit, reset, setValue, watch, formState } = form;
    const watchedGameType = watch('game_type');

    useEffect(() => {
        register('game_type', { required: 'Выберите игру' });
    }, [register]);

    const defaultValues = useMemo(() => {
        return {
            name: group?.name ?? '',
            game_type: (group?.game_type ?? gameType ?? GameType.ArenaBreakout) as GameType,
        };
    }, [group, gameType]);

    useEffect(() => {
        reset(defaultValues);
    }, [defaultValues, reset]);

    useEffect(() => {
        if (!open) return;
        setValue('game_type', gameType, { shouldValidate: true });
    }, [gameType, open, setValue]);

    const createMutation = useMutation({
        ...loadoutAdminControllerCreateRandomChallengeGroupMutation({
            client: getPublicClient(),
        }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['loadoutControllerGetRandomChallengeGroups'],
            });
            toast.success('Группа успешно создана');
            onOpenChange(false);
            reset();
            refetch();
        },
        onError: () => {
            toast.error('Ошибка при создании группы');
        },
    });

    const updateMutation = useMutation({
        ...loadoutAdminControllerUpdateRandomChallengeGroupMutation({
            client: getPublicClient(),
        }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['loadoutControllerGetRandomChallengeGroups'],
            });
            toast.success('Группа обновлена');
            onOpenChange(false);
            reset();
            refetch();
        },
        onError: () => {
            toast.error('Ошибка при обновлении группы');
        },
    });

    const isSubmitting = createMutation.status === 'pending' || updateMutation.status === 'pending';

    const onSubmit = (values: ChallengeGroupFormValues) => {
        const body: CreateRandomChallengeGroupDto = {
            name: values.name,
            game_type: values.game_type,
        };

        if (isEditing && group) {
            const updateBody: UpdateRandomChallengeGroupDto = {
                ...body,
                id: group.id,
            };
            updateMutation.mutate({ body: updateBody });
            return;
        }

        createMutation.mutate({ body });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Редактировать группу' : 'Создать группу'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Обновите данные группы челленджей'
                            : 'Добавьте новую группу челленджей'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Название *</Label>
                            <Input
                                id="name"
                                placeholder="Например: Штурмовые винтовки"
                                {...register('name', { required: 'Название обязательно' })}
                            />
                            {formState.errors.name && (
                                <p className="text-sm text-destructive mt-1">
                                    {formState.errors.name.message}
                                </p>
                            )}
                        </div>

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
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                            Отмена
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting
                                ? isEditing
                                    ? 'Сохраняем...'
                                    : 'Создаём...'
                                : isEditing
                                  ? 'Сохранить'
                                  : 'Создать'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
