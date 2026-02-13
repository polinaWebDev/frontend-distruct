'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    challengeSeasonAdminControllerCreateMutation,
    challengeSeasonAdminControllerGetListQueryKey,
    challengeSeasonAdminControllerUpdateMutation,
} from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { zCreateChallengeSeasonDto, zUpdateChallengeSeasonDto } from '@/lib/api_client/gen/zod.gen';
import { getPublicClient } from '@/lib/api_client/public_client';
import { GameType, GAME_TYPE_VALUES } from '@/lib/enums/game_type.enum';
import { getStoredGameType } from '@/domain/admin/hooks/useAdminGameType';
import type {
    ChallengeSeason,
    CreateChallengeSeasonDto,
    UpdateChallengeSeasonDto,
} from '@/lib/api_client/gen/types.gen';

type CreateSeasonFormData = z.infer<typeof zCreateChallengeSeasonDto>;
type UpdateSeasonFormData = z.infer<typeof zUpdateChallengeSeasonDto>;

interface CreateOrUpdateSeasonDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    season?: ChallengeSeason | null;
}

export function CreateOrUpdateSeasonDialog({
    open,
    onOpenChange,
    season,
}: CreateOrUpdateSeasonDialogProps) {
    const queryClient = useQueryClient();
    const isEdit = !!season;

    const storedGameType = getStoredGameType();
    const createForm = useForm<CreateSeasonFormData>({
        resolver: zodResolver(zCreateChallengeSeasonDto),
        defaultValues: {
            name: '',
            active: false,
            ends_at: new Date().toISOString(),
            game: (storedGameType ?? GameType.ArenaBreakout) as GameType,
        },
    });

    const updateForm = useForm<UpdateSeasonFormData>({
        resolver: zodResolver(zUpdateChallengeSeasonDto),
        defaultValues: {
            id: '',
            name: '',
            active: false,
            ends_at: new Date().toISOString(),
            game: (storedGameType ?? GameType.ArenaBreakout) as GameType,
        },
    });

    const form = isEdit ? updateForm : createForm;

    // Update form when season changes
    useEffect(() => {
        if (season && open) {
            updateForm.reset({
                id: season.id,
                name: season.name,
                active: season.active,
                ends_at: new Date(season.ends_at).toISOString(),
                game: season.game as GameType,
            });
        } else if (!season && open) {
            createForm.reset({
                name: '',
                active: false,
                ends_at: new Date().toISOString(),
                game: (storedGameType ?? GameType.ArenaBreakout) as GameType,
            });
        }
    }, [season, open, createForm, updateForm]);

    const createMutation = useMutation({
        ...challengeSeasonAdminControllerCreateMutation({
            client: getPublicClient(),
        }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: challengeSeasonAdminControllerGetListQueryKey(),
                refetchType: 'all',
            });
            toast.success('Сезон успешно создан');
            createForm.reset();
            onOpenChange(false);
        },
        onError: (error) => {
            console.error(error);
            toast.error('Ошибка при создании сезона');
        },
    });

    const updateMutation = useMutation({
        ...challengeSeasonAdminControllerUpdateMutation({
            client: getPublicClient(),
        }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: challengeSeasonAdminControllerGetListQueryKey(),
                refetchType: 'all',
            });
            toast.success('Сезон успешно обновлён');
            onOpenChange(false);
        },
        onError: (error) => {
            console.error(error);
            toast.error('Ошибка при обновлении сезона');
        },
    });

    const handleSubmit = (data: CreateSeasonFormData | UpdateSeasonFormData) => {
        // Convert ISO string to Date object for API
        const endsAtDate = typeof data.ends_at === 'string' ? new Date(data.ends_at) : data.ends_at;

        if (isEdit) {
            const updateData: UpdateChallengeSeasonDto = {
                id: (data as UpdateSeasonFormData).id,
                name: data.name,
                active: data.active,
                game: data.game,
                ends_at: endsAtDate,
            };
            updateMutation.mutate({
                body: updateData,
            });
        } else {
            const createData: CreateChallengeSeasonDto = {
                name: data.name,
                active: data.active,
                game: data.game,
                ends_at: endsAtDate,
            };
            createMutation.mutate({
                body: createData,
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Редактировать сезон' : 'Создать сезон'}</DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? 'Редактируйте информацию о сезоне'
                            : 'Добавьте новый сезон в систему'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...(form as any)}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control as any}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Название *</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Например: Сезон 1" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control as any}
                            name="game"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Тип игры *</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {GAME_TYPE_VALUES.map((gt) => (
                                                <SelectItem key={gt.value} value={gt.value}>
                                                    {gt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control as any}
                            name="ends_at"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Дата окончания *</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="datetime-local"
                                            value={
                                                field.value
                                                    ? new Date(field.value)
                                                          .toISOString()
                                                          .slice(0, 16)
                                                    : ''
                                            }
                                            onChange={(e) => {
                                                field.onChange(
                                                    e.target.value
                                                        ? new Date(e.target.value).toISOString()
                                                        : new Date().toISOString()
                                                );
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control as any}
                            name="active"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center space-x-2">
                                        <FormControl>
                                            <input
                                                type="checkbox"
                                                checked={field.value}
                                                onChange={(e) => field.onChange(e.target.checked)}
                                                className="w-4 h-4"
                                            />
                                        </FormControl>
                                        <FormLabel className="mt-0!">Активен *</FormLabel>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    form.reset();
                                    onOpenChange(false);
                                }}
                            >
                                Отмена
                            </Button>
                            <Button
                                type="submit"
                                disabled={createMutation.isPending || updateMutation.isPending}
                            >
                                {createMutation.isPending || updateMutation.isPending
                                    ? 'Сохранение...'
                                    : isEdit
                                      ? 'Сохранить'
                                      : 'Создать'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
