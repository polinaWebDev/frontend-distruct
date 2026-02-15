'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { toast } from 'sonner';
import {
    gearAdminControllerUpdateGearCategoryMutation,
    gearAdminControllerGetGearCategoryListOptions,
} from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { gearAdminControllerUpdateGearCategory } from '@/lib/api_client/gen/sdk.gen';
import { zUpdateGearCategoryDto } from '@/lib/api_client/gen/zod.gen';
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
import type { GearCategoryEntity } from '@/lib/api_client/gen/types.gen';
import type { z } from 'zod';
import { getFileUrl } from '@/lib/utils';

type UpdateGearCategoryFormData = z.infer<typeof zUpdateGearCategoryDto>;

interface EditCategoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category: GearCategoryEntity;
}

export function EditCategoryDialog({ open, onOpenChange, category }: EditCategoryDialogProps) {
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

    const form = useForm<UpdateGearCategoryFormData>({
        resolver: zodResolver(zUpdateGearCategoryDto),
        defaultValues: {
            id: category.id,
            name: category.name,
            description: category.description,
            game_type: category.game_type,
            excluded_categories: (category.excluded_categories || []).map((c) => c.id),
            order: category.order,
            is_long_slot: category.is_long_slot,
        },
    });

    // Watch the form's game_type value
    const selectedGameType = form.watch('game_type');

    // Fetch available categories for exclusion
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

    const availableCategories = ((categoriesData?.data || []) as GearCategoryEntity[]).filter(
        (c) => c.id !== category.id
    );

    // Update form data when category changes
    useEffect(() => {
        if (category) {
            form.reset({
                id: category.id,
                name: category.name,
                description: category.description,
                game_type: category.game_type,
                excluded_categories: (category.excluded_categories || []).map((c) => c.id),
                order: category.order,
                is_long_slot: category.is_long_slot,
            });
            setImageFile(null);
        }
    }, [category, form]);

    useEffect(() => {
        if (!open) return;
        form.setValue('game_type', gameType, { shouldValidate: true });
    }, [form, gameType, open]);

    const updateMutation = useMutation({
        ...gearAdminControllerUpdateGearCategoryMutation({
            client: getPublicClient(),
        }),
        onSuccess: async () => {
            await queryClient.resetQueries({
                queryKey: ['gearAdminControllerGetGearCategoryList'],
            });
            toast.success('Категория успешно обновлена');
            await queryClient.resetQueries({
                queryKey: gearAdminControllerUpdateGearCategoryMutation().mutationKey,
            });
            onOpenChange(false);
        },
        onError: (err) => {
            console.error(err);
            toast.error('Ошибка при обновлении категории');
        },
    });

    const handleSubmit = async (data: UpdateGearCategoryFormData) => {
        const bodyData: any = {
            id: data.id,
            name: data.name,
            description: data.description,
            game_type: data.game_type,
            excluded_categories: data.excluded_categories,
            order: data.order,
            is_long_slot: data.is_long_slot,
        };

        // If there's an image file, call SDK directly to bypass Zod validation
        if (imageFile) {
            bodyData.image = imageFile;

            try {
                await gearAdminControllerUpdateGearCategory({
                    client: getPublicClient(),
                    body: bodyData,
                });

                await queryClient.invalidateQueries({
                    queryKey: ['gearAdminControllerGetGearCategoryList'],
                    refetchType: 'all',
                });
                toast.success('Категория успешно обновлена');
                onOpenChange(false);
            } catch (err) {
                console.error(err);
                toast.error('Ошибка при обновлении категории');
            }
        } else {
            // No file, use mutation (with Zod validation)
            updateMutation.mutate({
                body: bodyData,
            });
        }
    };

    const toggleExcludedCategory = (categoryId: string) => {
        const currentExcluded = form.getValues('excluded_categories');
        form.setValue(
            'excluded_categories',
            currentExcluded.includes(categoryId)
                ? currentExcluded.filter((id) => id !== categoryId)
                : [...currentExcluded, categoryId],
            { shouldValidate: true, shouldDirty: true }
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Редактировать категорию</DialogTitle>
                    <DialogDescription>Измените данные категории предметов</DialogDescription>
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
                                        <Input {...field} placeholder="Например: Оружие" />
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
                                            placeholder="Описание категории..."
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
                            name="order"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Порядок сортировки *</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="number"
                                            placeholder="0"
                                            value={field.value}
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
                            name="is_long_slot"
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
                                        <FormLabel className="mt-0!">Длинный слот *</FormLabel>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-2">
                            <FormLabel>Изображение</FormLabel>
                            {category.image_url && !imageFile && (
                                <div className="mb-2">
                                    <p className="text-sm text-muted-foreground mb-1">
                                        Текущее изображение:
                                    </p>
                                    <div className="relative w-24 h-24">
                                        <Image
                                            src={getFileUrl(category.image_url)}
                                            alt={category.name}
                                            width={256}
                                            height={256}
                                            className="rounded object-cover w-24 h-24"
                                        />
                                    </div>
                                </div>
                            )}
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

                        <FormField
                            control={form.control}
                            name="excluded_categories"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Исключённые категории</FormLabel>
                                    <p className="text-sm text-muted-foreground">
                                        Выберите категории, которые не могут быть выбраны вместе с
                                        этой категорией
                                    </p>
                                    <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                                        {availableCategories.length > 0 ? (
                                            availableCategories.map((cat) => (
                                                <div
                                                    key={cat.id}
                                                    className="flex items-center space-x-2"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        id={`exclude-${cat.id}`}
                                                        checked={field.value.includes(cat.id)}
                                                        onChange={() =>
                                                            toggleExcludedCategory(cat.id)
                                                        }
                                                        className="w-4 h-4"
                                                    />
                                                    <label
                                                        htmlFor={`exclude-${cat.id}`}
                                                        className="text-sm cursor-pointer"
                                                    >
                                                        {cat.name}
                                                        {formatCategoryDescription(
                                                            cat.description
                                                        ) && (
                                                            <span className="text-xs text-muted-foreground">
                                                                {' '}
                                                                (
                                                                {formatCategoryDescription(
                                                                    cat.description
                                                                )}
                                                                )
                                                            </span>
                                                        )}
                                                    </label>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                Нет доступных категорий
                                            </p>
                                        )}
                                    </div>
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
