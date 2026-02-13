'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { challengesShopAdminControllerUpdateMutation } from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { challengesShopAdminControllerUpdate } from '@/lib/api_client/gen/sdk.gen';
import type { ChallengeShopItemEntity, ChallengeSeason } from '@/lib/api_client/gen/types.gen';
import { zUpdateChallengeShopItemDto } from '@/lib/api_client/gen/zod.gen';
import { getPublicClient } from '@/lib/api_client/public_client';

type UpdateChallengeShopItemFormData = z.infer<typeof zUpdateChallengeShopItemDto>;

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

    const form = useForm<UpdateChallengeShopItemFormData>({
        resolver: zodResolver(zUpdateChallengeShopItemDto),
        defaultValues: {
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            is_infinite: item.is_infinite,
            is_active: item.is_active,
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
                order: item.order,
                quantity: item.quantity,
                challenge_season_id: item.challenge_season_id,
            });
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setImageFile(null);
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

    const handleSubmit = async (data: UpdateChallengeShopItemFormData) => {
        const bodyData: any = {
            id: data.id,
            name: data.name,
            description: data.description,
            price: data.price,
            is_infinite: data.is_infinite,
            is_active: data.is_active,
            order: data.order,
            quantity: data.quantity,
            challenge_season_id: data.challenge_season_id,
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
                                                type="number"
                                                placeholder="0"
                                                onChange={(e) =>
                                                    field.onChange(parseInt(e.target.value, 10))
                                                }
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
                                                type="number"
                                                placeholder="0"
                                                onChange={(e) =>
                                                    field.onChange(parseInt(e.target.value, 10))
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
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
                                                type="number"
                                                placeholder="0"
                                                onChange={(e) =>
                                                    field.onChange(parseInt(e.target.value, 10))
                                                }
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
                                            value={field.value.toString()}
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
                                            value={field.value.toString()}
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
