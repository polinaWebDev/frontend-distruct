'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { gearAdminControllerUpdateGearRarityMutation } from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { zUpdateGearRarityDto } from '@/lib/api_client/gen/zod.gen';
import { getPublicClient } from '@/lib/api_client/public_client';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { GAME_TYPE_VALUES } from '@/lib/enums/game_type.enum';
import { useAdminGameTypeContext } from '@/domain/admin/context/admin-game-type-context';
import type { GearRarityEntity } from '@/lib/api_client/gen/types.gen';
import type { z } from 'zod';

type UpdateGearRarityFormData = z.infer<typeof zUpdateGearRarityDto>;

interface EditRarityDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    rarity: GearRarityEntity;
}

export function EditRarityDialog({ open, onOpenChange, rarity }: EditRarityDialogProps) {
    const queryClient = useQueryClient();
    const { gameType } = useAdminGameTypeContext();

    const form = useForm<UpdateGearRarityFormData>({
        resolver: zodResolver(zUpdateGearRarityDto),
        defaultValues: {
            id: rarity.id,
            name: rarity.name,
            description: rarity.description,
            color: rarity.color,
            weight: rarity.weight,
            game_type: rarity.game_type,
        },
    });

    // Update form data when rarity changes
    useEffect(() => {
        if (rarity) {
            form.reset({
                id: rarity.id,
                name: rarity.name,
                description: rarity.description,
                color: rarity.color,
                weight: rarity.weight,
                game_type: rarity.game_type,
            });
        }
    }, [rarity, form]);

    useEffect(() => {
        if (!open) return;
        form.setValue('game_type', gameType, { shouldValidate: true });
    }, [form, gameType, open]);

    const updateMutation = useMutation({
        ...gearAdminControllerUpdateGearRarityMutation({
            client: getPublicClient(),
        }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['gearAdminControllerGetGearRarityList'],
                refetchType: 'all',
            });
            toast.success('Редкость успешно обновлена');
            await queryClient.resetQueries({
                queryKey: gearAdminControllerUpdateGearRarityMutation().mutationKey,
            });
            onOpenChange(false);
        },
        onError: (error) => {
            console.error(error);
            toast.error('Ошибка при обновлении редкости');
        },
    });

    const handleSubmit = (data: UpdateGearRarityFormData) => {
        updateMutation.mutate({
            body: data,
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Редактировать редкость</DialogTitle>
                    <DialogDescription>Измените данные редкости предмета</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Название *</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Например: Легендарный" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Описание</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            value={field.value ?? ''}
                                            placeholder="Описание редкости..."
                                            rows={3}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="game_type"
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
                            control={form.control}
                            name="color"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Цвет *</FormLabel>
                                    <div className="flex gap-2 items-center">
                                        <FormControl>
                                            <input
                                                type="color"
                                                {...field}
                                                className="w-16 h-9 p-1 cursor-pointer rounded"
                                            />
                                        </FormControl>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                className="flex-1 font-mono"
                                                placeholder="#ffffff"
                                                maxLength={7}
                                            />
                                        </FormControl>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="weight"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Вес (приоритет) *</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="number"
                                            min={1}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                            placeholder="1"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Отмена
                            </Button>
                            <Button type="submit" disabled={updateMutation.isPending}>
                                {updateMutation.isPending ? 'Сохранение...' : 'Сохранить'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
