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
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    gearAdminControllerCreateGearMutation,
    gearAdminControllerGetGearCategoryListOptions,
    gearAdminControllerGetGearRarityListOptions,
    gearAdminControllerGetGearTypeListOptions,
} from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { gearAdminControllerCreateGear } from '@/lib/api_client/gen/sdk.gen';
import type {
    GearCategoryEntity,
    GearRarityEntity,
    GearTypeEntity,
} from '@/lib/api_client/gen/types.gen';
import { zCreateGearDto } from '@/lib/api_client/gen/zod.gen';
import { getPublicClient } from '@/lib/api_client/public_client';
import { GAME_TYPE_VALUES } from '@/lib/enums/game_type.enum';
import { useAdminGameTypeContext } from '@/domain/admin/context/admin-game-type-context';

type CreateGearFormData = z.infer<typeof zCreateGearDto>;

interface CreateGearDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateGearDialog({ open, onOpenChange }: CreateGearDialogProps) {
    const queryClient = useQueryClient();
    const [imageFile, setImageFile] = useState<File | null>(null);
    const { gameType } = useAdminGameTypeContext();
    const formatCategoryDescription = (description?: string) => {
        if (!description) return null;
        const maxLen = 20;
        const trimmed = description.trim();
        if (!trimmed) return null;
        if (trimmed.length <= maxLen) return trimmed;
        return `${trimmed.slice(0, maxLen)}...`;
    };

    const form = useForm<CreateGearFormData>({
        resolver: zodResolver(zCreateGearDto),
        defaultValues: {
            name: '',
            description: '',
            game_type: gameType,
            tier: 0,
            weight: 0,
            category_id: '',
            rarity_id: 'none',
            type_id: 'none',
        },
    });

    useEffect(() => {
        if (!open) return;
        form.setValue('game_type', gameType, { shouldValidate: true });
    }, [form, gameType, open]);

    // Watch the form's game_type value
    const selectedGameType = form.watch('game_type');

    // Fetch categories
    const { data: categoriesData } = useQuery({
        ...gearAdminControllerGetGearCategoryListOptions({
            client: getPublicClient(),
            query: {
                page: 1,
                limit: 1000,
                game_type: selectedGameType,
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
                game_type: selectedGameType,
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
                game_type: selectedGameType,
                name: '',
            },
        }),
        enabled: open,
    });

    const categories = (categoriesData?.data || []) as GearCategoryEntity[];
    const rarities = (raritiesData?.data || []) as GearRarityEntity[];
    const types = (typesData?.data || []) as GearTypeEntity[];

    const createMutation = useMutation({
        ...gearAdminControllerCreateGearMutation({
            client: getPublicClient(),
        }),
        onSuccess: async () => {
            await queryClient.resetQueries({
                queryKey: gearAdminControllerCreateGearMutation().mutationKey,
            });
            toast.success('Предмет успешно создан');
            form.reset();
            setImageFile(null);
            onOpenChange(false);
        },
        onError: (error) => {
            console.error(error);
            toast.error('Ошибка при создании предмета');
        },
    });

    const handleSubmit = async (data: CreateGearFormData) => {
        const normalizedTypeId = data.type_id === 'none' || !data.type_id ? undefined : data.type_id;
        const bodyData: any = {
            name: data.name,
            description: data.description,
            game_type: data.game_type,
            tier: data.tier,
            weight: data.weight,
            category_id: data.category_id,
            rarity_id: data.rarity_id === 'none' || !data.rarity_id ? null : data.rarity_id,
            ...(normalizedTypeId ? { type_id: normalizedTypeId } : {}),
        };

        // If there's an image file, call SDK directly to bypass Zod validation
        if (imageFile) {
            bodyData.image = imageFile;

            try {
                await gearAdminControllerCreateGear({
                    client: getPublicClient(),
                    body: bodyData,
                });

                await queryClient.resetQueries({
                    queryKey: gearAdminControllerCreateGearMutation().mutationKey,
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
                    <DialogTitle>Создать предмет</DialogTitle>
                    <DialogDescription>Добавьте новый предмет в систему</DialogDescription>
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
                                        <Input {...field} placeholder="Например: АК-74" />
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

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="tier"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Уровень *</FormLabel>
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
                                name="weight"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Вес *</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                onChange={(e) =>
                                                    field.onChange(parseFloat(e.target.value))
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="category_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Категория *</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Выберите категорию" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {categories.length > 0 ? (
                                                categories.map((category) => (
                                                    <SelectItem
                                                        key={category.id}
                                                        value={category.id}
                                                    >
                                                        {category.name}
                                                        {formatCategoryDescription(
                                                            category.description
                                                        ) && (
                                                            <span className="text-xs text-muted-foreground">
                                                                {' '}
                                                                (
                                                                {formatCategoryDescription(
                                                                    category.description
                                                                )}
                                                                )
                                                            </span>
                                                        )}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="none" disabled>
                                                    Нет доступных категорий
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="rarity_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Редкость</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Не указано" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="none">Не указано</SelectItem>
                                            {rarities.length > 0 ? (
                                                rarities.map((rarity) => (
                                                    <SelectItem key={rarity.id} value={rarity.id}>
                                                        {rarity.name}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="no-rarities" disabled>
                                                    Нет доступных редкостей
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="type_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Тип</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Выберите тип" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="none">Не указано</SelectItem>
                                            {types.length > 0 ? (
                                                types.map((type) => (
                                                    <SelectItem key={type.id} value={type.id}>
                                                        {type.name}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="no-types" disabled>
                                                    Нет доступных типов
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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
