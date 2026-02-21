'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import {
    challengesShopAdminControllerUpdateMutation,
    profileCosmeticsAdminControllerGetOptionsOptions,
} from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { challengesShopAdminControllerUpdate } from '@/lib/api_client/gen/sdk.gen';
import type {
    ChallengeShopItemEntity,
    ChallengeSeason,
    UpdateChallengeShopItemDto,
} from '@/lib/api_client/gen/types.gen';
import { zUpdateChallengeShopItemDto } from '@/lib/api_client/gen/zod.gen';
import { getPublicClient } from '@/lib/api_client/public_client';
import { parseAdminCosmeticsResponse } from '@/domain/profile-cosmetics/profile-cosmetics.utils';

type UpdateChallengeShopItemFormData = z.input<typeof zUpdateChallengeShopItemDto>;

interface EditChallengeShopItemDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item: ChallengeShopItemEntity;
    seasons: ChallengeSeason[];
}

export function EditChallengeShopItemDialog({
    open,
    onOpenChange,
    item,
    seasons,
}: EditChallengeShopItemDialogProps) {
    const queryClient = useQueryClient();
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [cosmeticSearchQuery, setCosmeticSearchQuery] = useState('');
    const [prizeCosmeticId, setPrizeCosmeticId] = useState(item.prize_cosmetic_id ?? '');

    const form = useForm<
        UpdateChallengeShopItemFormData,
        unknown,
        UpdateChallengeShopItemFormData
    >({
        resolver: zodResolver(zUpdateChallengeShopItemDto),
        defaultValues: {
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            is_infinite: item.is_infinite,
            is_active: item.is_active,
            is_contact_info_required: item.is_contact_info_required ?? false,
            is_repeatable_purchase_allowed: item.is_repeatable_purchase_allowed ?? true,
            order: item.order,
            quantity: item.quantity,
            challenge_season_id: item.challenge_season_id,
        },
    });

    useEffect(() => {
        if (open && item) {
            form.reset({
                id: item.id,
                name: item.name,
                description: item.description,
                price: item.price,
                is_infinite: item.is_infinite,
                is_active: item.is_active,
                is_contact_info_required: item.is_contact_info_required ?? false,
                is_repeatable_purchase_allowed: item.is_repeatable_purchase_allowed ?? true,
                order: item.order,
                quantity: item.quantity,
                challenge_season_id: item.challenge_season_id,
            });
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setImageFile(null);
            setPrizeCosmeticId(item.prize_cosmetic_id ?? '');
        }
    }, [open, item, form]);

    const updateMutation = useMutation({
        ...challengesShopAdminControllerUpdateMutation({
            client: getPublicClient(),
        }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: challengesShopAdminControllerUpdateMutation().mutationKey,
            });
            toast.success('Предмет успешно обновлён');
            onOpenChange(false);
        },
        onError: () => {
            toast.error('Ошибка при обновлении предмета');
        },
    });

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

    const cosmeticsOptions = parseAdminCosmeticsResponse(cosmeticsData);

    const handleSubmit = async (data: UpdateChallengeShopItemFormData) => {
        const bodyData: UpdateChallengeShopItemDto = {
            id: data.id,
            name: data.name,
            description: data.description,
            price: data.price,
            is_infinite: data.is_infinite,
            is_active: data.is_active,
            is_contact_info_required: data.is_contact_info_required ?? false,
            is_repeatable_purchase_allowed: data.is_repeatable_purchase_allowed ?? true,
            order: data.order,
            quantity: data.quantity,
            challenge_season_id: data.challenge_season_id,
            prize_cosmetic_id: prizeCosmeticId || null,
        };

        // If there's an image file, call SDK directly to bypass Zod validation
        if (imageFile) {
            bodyData.file = imageFile;

            try {
                await challengesShopAdminControllerUpdate({
                    client: getPublicClient(),
                    body: bodyData,
                });

                await queryClient.invalidateQueries({
                    queryKey: challengesShopAdminControllerUpdateMutation().mutationKey,
                });
                toast.success('Предмет успешно обновлён');
                onOpenChange(false);
            } catch (error) {
                console.error(error);
                toast.error('Ошибка при обновлении предмета');
            }
        } else {
            // No file, use mutation (with Zod validation)
            updateMutation.mutate({
                body: bodyData,
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Редактировать предмет магазина</DialogTitle>
                    <DialogDescription>Измените данные предмета</DialogDescription>
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
                                        <Input {...field} placeholder="Например: Супер оружие" />
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
                                            placeholder="Описание предмета..."
                                            rows={3}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Цена *</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                value={field.value ?? ''}
                                                type="number"
                                                placeholder="0"
                                                onChange={(e) => {
                                                    const rawValue = e.target.value;
                                                    if (rawValue === '') {
                                                        field.onChange(undefined);
                                                        return;
                                                    }
                                                    field.onChange(Number(rawValue));
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="order"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Порядок *</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                value={field.value ?? ''}
                                                type="number"
                                                placeholder="0"
                                                onChange={(e) => {
                                                    const rawValue = e.target.value;
                                                    if (rawValue === '') {
                                                        field.onChange(undefined);
                                                        return;
                                                    }
                                                    field.onChange(Number(rawValue));
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-2">
                            <FormLabel>Косметическая награда</FormLabel>
                            <Input
                                value={cosmeticSearchQuery}
                                onChange={(event) => setCosmeticSearchQuery(event.target.value)}
                                placeholder="Поиск косметики..."
                            />
                            <Select
                                value={prizeCosmeticId || '__none__'}
                                onValueChange={(value) =>
                                    setPrizeCosmeticId(value === '__none__' ? '' : value)
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Без косметической награды" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__none__">Без награды</SelectItem>
                                    {cosmeticsOptions.map((item) => (
                                        <SelectItem key={item.id} value={item.id}>
                                            {item.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="quantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Количество *</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                value={field.value ?? ''}
                                                type="number"
                                                placeholder="0"
                                                onChange={(e) => {
                                                    const rawValue = e.target.value;
                                                    if (rawValue === '') {
                                                        field.onChange(undefined);
                                                        return;
                                                    }
                                                    field.onChange(Number(rawValue));
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="challenge_season_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Сезон *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Выберите сезон" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {seasons.length > 0 ? (
                                                    seasons.map((season) => (
                                                        <SelectItem
                                                            key={season.id}
                                                            value={season.id}
                                                        >
                                                            {season.name}
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <SelectItem value="none" disabled>
                                                        Нет доступных сезонов
                                                    </SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="is_infinite"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Бесконечный *</FormLabel>
                                        <Select
                                            onValueChange={(value) =>
                                                field.onChange(value === 'true')
                                            }
                                            value={String(field.value ?? true)}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="true">Да</SelectItem>
                                                <SelectItem value="false">Нет</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="is_active"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Активен *</FormLabel>
                                        <Select
                                            onValueChange={(value) =>
                                                field.onChange(value === 'true')
                                            }
                                            value={String(field.value ?? true)}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="true">Да</SelectItem>
                                                <SelectItem value="false">Нет</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="is_contact_info_required"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Контакты обязательны *</FormLabel>
                                        <Select
                                            onValueChange={(value) =>
                                                field.onChange(value === 'true')
                                            }
                                            value={String(field.value ?? false)}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="true">Да</SelectItem>
                                                <SelectItem value="false">Нет</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="is_repeatable_purchase_allowed"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Повторная покупка *</FormLabel>
                                        <Select
                                            onValueChange={(value) =>
                                                field.onChange(value === 'true')
                                            }
                                            value={String(field.value ?? true)}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="true">Разрешена</SelectItem>
                                                <SelectItem value="false">Запрещена</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-2">
                            <FormLabel>Изображение (опционально)</FormLabel>
                            <Input
                                id="image"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                            />
                            {imageFile && (
                                <p className="text-sm text-muted-foreground">
                                    Выбрано: {imageFile.name} ({(imageFile.size / 1024).toFixed(2)}{' '}
                                    KB)
                                </p>
                            )}
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Отмена
                            </Button>
                            <Button type="submit" disabled={updateMutation.isPending}>
                                {updateMutation.isPending ? 'Обновление...' : 'Обновить'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
