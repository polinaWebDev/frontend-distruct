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
import { MapMarkerCategoryEntity } from '@/lib/api_client/gen';
import {
    mapsCategoriesAdminControllerCreateMapCategoryMutation,
    mapsCategoriesAdminControllerUpdateMapCategoryMutation,
    mapsControllerGetMapQueryKey,
} from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { zCreateMapsCategoryDto, zUpdateMapsCategoryDto } from '@/lib/api_client/gen/zod.gen';
import { getPublicClient } from '@/lib/api_client/public_client';
import { AppControlledInput } from '@/ui/AppInput/AppInput';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

export const CreateOrUpdateMapCategoryDialog = ({
    open,
    onOpenChange,
    map_id,
    category_data,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    map_id: string;
    category_data?: MapMarkerCategoryEntity;
}) => {
    const form = useForm<z.infer<typeof zCreateMapsCategoryDto>>({
        resolver: zodResolver(category_data ? zUpdateMapsCategoryDto : zCreateMapsCategoryDto),
        defaultValues: {
            name: category_data?.name ?? '',
            description: category_data?.description ?? '',
            color: category_data?.color ?? '#ffffff',
            map_id: map_id,
        },
    });
    const queryClient = useQueryClient();

    const { mutate: createCategory, isPending } = useMutation({
        ...mapsCategoriesAdminControllerCreateMapCategoryMutation({
            client: getPublicClient(),
        }),
        onSuccess: () => {
            toast.success('Категория успешно создана');
            onOpenChange(false);
            queryClient.resetQueries({
                queryKey: mapsControllerGetMapQueryKey({
                    path: { id: map_id },
                    client: getPublicClient(),
                }),
            });
        },
        onError: (error) => {
            console.error(error);
            toast.error('Ошибка при создании категории');
        },
    });

    const { mutate: updateCategory, isPending: isUpdatePending } = useMutation({
        ...mapsCategoriesAdminControllerUpdateMapCategoryMutation({
            client: getPublicClient(),
        }),
        onSuccess: () => {
            toast.success('Категория успешно обновлена');
            onOpenChange(false);
            queryClient.resetQueries({
                queryKey: mapsControllerGetMapQueryKey({
                    path: { id: map_id },
                    client: getPublicClient(),
                }),
            });
        },
        onError: (error) => {
            console.error(error);
            toast.error('Ошибка при обновлении категории');
        },
    });

    console.log(form.formState.errors, form.getValues());

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {category_data ? 'Редактировать категорию' : 'Создать категорию'}
                    </DialogTitle>
                    <DialogDescription>
                        {category_data
                            ? 'Редактируйте категорию маркеров карты'
                            : 'Добавьте новую категорию маркеров для карты'}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 overflow-y-auto max-h-[80svh]">
                    <Form {...form}>
                        <div className="shrink-0 flex flex-col gap-4">
                            <AppControlledInput
                                control={form.control}
                                name="name"
                                label="Название *"
                                desc="Название категории"
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
                                                placeholder="Описание категории"
                                                rows={3}
                                            />
                                        </FormControl>
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
                        </div>
                    </Form>
                </div>

                <DialogFooter>
                    <Button
                        disabled={isPending || isUpdatePending}
                        onClick={() => {
                            if (category_data) {
                                updateCategory({
                                    body: {
                                        ...form.getValues(),
                                        id: category_data.id,
                                    },
                                });
                                return;
                            }

                            createCategory({
                                body: form.getValues(),
                            });
                        }}
                    >
                        {isPending || isUpdatePending ? 'Сохранение...' : 'Сохранить'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
