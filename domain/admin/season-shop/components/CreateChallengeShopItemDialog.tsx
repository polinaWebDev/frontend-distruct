'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
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
import { challengesShopAdminControllerCreateMutation } from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { challengesShopAdminControllerCreate } from '@/lib/api_client/gen/sdk.gen';
import type { ChallengeSeason } from '@/lib/api_client/gen/types.gen';
import { zCreateChallengeShopItemDto } from '@/lib/api_client/gen/zod.gen';
import { getPublicClient } from '@/lib/api_client/public_client';

type CreateChallengeShopItemFormData = z.infer<typeof zCreateChallengeShopItemDto>;

interface CreateChallengeShopItemDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    seasons: ChallengeSeason[];
}

export function CreateChallengeShopItemDialog({
    open,
    onOpenChange,
    seasons,
}: CreateChallengeShopItemDialogProps) {
    const queryClient = useQueryClient();
    const [imageFile, setImageFile] = useState<File | null>(null);

    const form = useForm<CreateChallengeShopItemFormData>({
        resolver: zodResolver(zCreateChallengeShopItemDto),
        defaultValues: {
            name: '',
            description: '',
            price: 0,
            is_infinite: false,
            is_active: true,
            order: 0,
            quantity: 0,
            challenge_season_id: '',
        },
    });

    const createMutation = useMutation({
        ...challengesShopAdminControllerCreateMutation({
            client: getPublicClient(),
        }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: challengesShopAdminControllerCreateMutation().mutationKey,
            });
            toast.success('Предмет успешно создан');
            form.reset();
            setImageFile(null);
            onOpenChange(false);
        },
        onError: () => {
            toast.error('Ошибка при создании предмета');
        },
    });

    const handleSubmit = async (data: CreateChallengeShopItemFormData) => {
        const bodyData: any = {
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
                await challengesShopAdminControllerCreate({
                    client: getPublicClient(),
                    body: bodyData,
                });

                await queryClient.invalidateQueries({
                    queryKey: challengesShopAdminControllerCreateMutation().mutationKey,
                });
                toast.success('Предмет успешно создан');
                form.reset();
                setImageFile(null);
                onOpenChange(false);
            } catch (error) {
                console.error(error);
                toast.error('Ошибка при создании предмета');
            }
        } else {
            // No file, use mutation (with Zod validation)
            createMutation.mutate({
                body: bodyData,
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Создать предмет магазина</DialogTitle>
                    <DialogDescription>Добавьте новый предмет в магазин сезонов</DialogDescription>
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
                            <FormLabel>Изображение</FormLabel>
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
                                onClick={() => {
                                    form.reset();
                                    setImageFile(null);
                                    onOpenChange(false);
                                }}
                            >
                                Отмена
                            </Button>
                            <Button type="submit" disabled={createMutation.isPending}>
                                {createMutation.isPending ? 'Создание...' : 'Создать'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
