'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { toast } from 'sonner';
import { gearAdminControllerUpdateGearTypeMutation } from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { gearAdminControllerUpdateGearType } from '@/lib/api_client/gen/sdk.gen';
import { zUpdateGearTypeDto } from '@/lib/api_client/gen/zod.gen';
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
import type { GearTypeEntity } from '@/lib/api_client/gen/types.gen';
import type { z } from 'zod';
import { getFileUrl } from '@/lib/utils';

type UpdateGearTypeFormData = z.infer<typeof zUpdateGearTypeDto>;

interface EditGearTypeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    gearType: GearTypeEntity;
    availableTypes: GearTypeEntity[];
}

export function EditGearTypeDialog({
    open,
    onOpenChange,
    gearType,
    availableTypes,
}: EditGearTypeDialogProps) {
    const queryClient = useQueryClient();
    const [imageFile, setImageFile] = useState<File | null>(null);
    const { gameType } = useAdminGameTypeContext();

    const form = useForm<UpdateGearTypeFormData>({
        resolver: zodResolver(zUpdateGearTypeDto),
        defaultValues: {
            id: gearType.id,
            name: gearType.name,
            description: gearType.description,
            game_type: gearType.game_type,
            excluded_types: (gearType.excluded_types || []).map((t) => t.id),
        },
    });

    // Update form data when gearType changes
    useEffect(() => {
        if (gearType) {
            form.reset({
                id: gearType.id,
                name: gearType.name,
                description: gearType.description,
                game_type: gearType.game_type,
                excluded_types: (gearType.excluded_types || []).map((t) => t.id),
            });
            setImageFile(null);
        }
    }, [gearType, form]);

    useEffect(() => {
        if (!open) return;
        form.setValue('game_type', gameType, { shouldValidate: true });
    }, [form, gameType, open]);

    const updateMutation = useMutation({
        ...gearAdminControllerUpdateGearTypeMutation({
            client: getPublicClient(),
        }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['gearAdminControllerGetGearTypeList'],
                refetchType: 'all',
            });
            toast.success('Тип предмета успешно обновлён');
            await queryClient.resetQueries({
                queryKey: gearAdminControllerUpdateGearTypeMutation().mutationKey,
            });
            onOpenChange(false);
        },
        onError: (err) => {
            console.error(err);
            toast.error('Ошибка при обновлении типа предмета');
        },
    });

    const handleSubmit = async (data: UpdateGearTypeFormData) => {
        const bodyData: any = {
            id: data.id,
            name: data.name,
            description: data.description,
            game_type: data.game_type,
            excluded_types: data.excluded_types,
        };

        // If there's an image file, call SDK directly to bypass Zod validation
        if (imageFile) {
            bodyData.image = imageFile;

            try {
                await gearAdminControllerUpdateGearType({
                    client: getPublicClient(),
                    body: bodyData,
                });

                await queryClient.invalidateQueries({
                    queryKey: ['gearAdminControllerGetGearTypeList'],
                    refetchType: 'all',
                });
                toast.success('Тип предмета успешно обновлён');
                onOpenChange(false);
            } catch (err) {
                console.error(err);
                toast.error('Ошибка при обновлении типа предмета');
            }
        } else {
            // No file, use mutation (with Zod validation)
            updateMutation.mutate({
                body: bodyData,
            });
        }
    };

    const toggleExcludedType = (typeId: string) => {
        const currentExcluded = form.getValues('excluded_types');
        form.setValue(
            'excluded_types',
            currentExcluded.includes(typeId)
                ? currentExcluded.filter((id) => id !== typeId)
                : [...currentExcluded, typeId]
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Редактировать тип предмета</DialogTitle>
                    <DialogDescription>Измените данные типа предмета</DialogDescription>
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
                                        <Input {...field} placeholder="Например: Шлем" />
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
                                            placeholder="Описание типа предмета..."
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

                        <div className="space-y-2">
                            <FormLabel>Изображение</FormLabel>
                            {gearType.image_url && !imageFile && (
                                <div className="mb-2">
                                    <div className="relative w-24 h-24">
                                        <Image
                                            src={getFileUrl(gearType.image_url)}
                                            alt={gearType.name}
                                            width={256}
                                            height={256}
                                            className="object-cover w-full h-full rounded border"
                                        />
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Текущее изображение
                                    </p>
                                </div>
                            )}
                            <Input
                                id="edit-image"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                            />
                            {imageFile && (
                                <p className="text-sm text-muted-foreground">
                                    Новое изображение: {imageFile.name} (
                                    {(imageFile.size / 1024).toFixed(2)} KB)
                                </p>
                            )}
                        </div>

                        <FormField
                            control={form.control}
                            name="excluded_types"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Исключённые типы</FormLabel>
                                    <p className="text-sm text-muted-foreground">
                                        Выберите типы, которые не могут быть выбраны вместе с этим
                                        типом
                                    </p>
                                    <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                                        {availableTypes
                                            .filter(
                                                (t) =>
                                                    t.game_type === form.watch('game_type') &&
                                                    t.id !== gearType.id
                                            )
                                            .map((type) => (
                                                <div
                                                    key={type.id}
                                                    className="flex items-center space-x-2"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        id={`edit-exclude-${type.id}`}
                                                        checked={field.value.includes(type.id)}
                                                        onChange={() => toggleExcludedType(type.id)}
                                                        className="w-4 h-4"
                                                    />
                                                    <label
                                                        htmlFor={`edit-exclude-${type.id}`}
                                                        className="text-sm cursor-pointer"
                                                    >
                                                        {type.name}
                                                    </label>
                                                </div>
                                            ))}
                                        {availableTypes.filter(
                                            (t) =>
                                                t.game_type === form.watch('game_type') &&
                                                t.id !== gearType.id
                                        ).length === 0 && (
                                            <p className="text-sm text-muted-foreground">
                                                Нет доступных типов
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
