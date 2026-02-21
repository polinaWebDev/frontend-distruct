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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { GetMapTypeResponseDto } from '@/lib/api_client/gen';
import {
    mapsTypesAdminControllerCreateMapTypeMutation,
    mapsTypesAdminControllerUpdateMapTypeMutation,
    mapsControllerGetMapQueryKey,
} from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { zCreateMapTypeDto, zUpdateMapTypeDto } from '@/lib/api_client/gen/zod.gen';
import { getPublicClient } from '@/lib/api_client/public_client';
import { AppControlledInput } from '@/ui/AppInput/AppInput';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

type IconTypeFormValues = z.input<typeof zCreateMapTypeDto>;

export const CreateOrUpdateIconTypeDialog = ({
    open,
    onOpenChange,
    map_id,
    category_id,
    icon_type_data,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    map_id: string;
    category_id: string;
    icon_type_data?: GetMapTypeResponseDto;
}) => {
    const form = useForm<IconTypeFormValues>({
        resolver: zodResolver(icon_type_data ? zUpdateMapTypeDto : zCreateMapTypeDto),
        defaultValues: {
            name: icon_type_data?.name ?? '',
            icon: icon_type_data?.icon ?? '',
            is_point_of_interest: icon_type_data?.is_point_of_interest ?? false,
            category_id: icon_type_data?.category_id ?? category_id,
            map_id: map_id,
        },
    });
    const queryClient = useQueryClient();

    const handleSvgFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.svg')) {
            toast.error('Пожалуйста, выберите SVG файл');
            return;
        }

        try {
            const text = await file.text();
            form.setValue('icon', text);
            toast.success('SVG файл загружен');
        } catch (error) {
            console.error('Error reading SVG file:', error);
            toast.error('Ошибка при чтении SVG файла');
        }
    };

    const { mutate: createIconType, isPending } = useMutation({
        ...mapsTypesAdminControllerCreateMapTypeMutation({
            client: getPublicClient(),
        }),
        onSuccess: () => {
            toast.success('Тип иконки успешно создан');
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
            toast.error('Ошибка при создании типа иконки');
        },
    });

    const { mutate: updateIconType, isPending: isUpdatePending } = useMutation({
        ...mapsTypesAdminControllerUpdateMapTypeMutation({
            client: getPublicClient(),
        }),
        onSuccess: () => {
            toast.success('Тип иконки успешно обновлен');
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
            toast.error('Ошибка при обновлении типа иконки');
        },
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {icon_type_data ? 'Редактировать тип иконки' : 'Создать тип иконки'}
                    </DialogTitle>
                    <DialogDescription>
                        {icon_type_data
                            ? 'Редактируйте тип иконки маркера'
                            : 'Добавьте новый тип иконки для маркеров'}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 overflow-y-auto max-h-[80svh]">
                    <Form {...form}>
                        <div className="shrink-0 flex flex-col gap-4">
                            <AppControlledInput
                                control={form.control}
                                name="name"
                                label="Название *"
                                desc="Название типа иконки"
                            />

                            <FormField
                                control={form.control}
                                name="is_point_of_interest"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">
                                                Point of interest
                                            </FormLabel>
                                            <div className="text-[0.8rem] text-muted-foreground">
                                                {field.value
                                                    ? 'Метка будет считаться POI'
                                                    : 'Обычный тип метки'}
                                            </div>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={Boolean(field.value)}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="icon"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>SVG иконка *</FormLabel>
                                        <div className="space-y-2">
                                            <FormControl>
                                                <Textarea
                                                    {...field}
                                                    placeholder="Вставьте SVG код здесь..."
                                                    rows={6}
                                                    className="font-mono text-sm"
                                                />
                                            </FormControl>
                                            <div className="space-y-2">
                                                <FormLabel className="text-sm font-normal">
                                                    Или загрузите SVG файл:
                                                </FormLabel>
                                                <Input
                                                    type="file"
                                                    accept=".svg"
                                                    onChange={handleSvgFileChange}
                                                />
                                            </div>
                                            {field.value && (
                                                <div className="mt-2 p-2 border rounded">
                                                    <p className="text-xs text-muted-foreground mb-2">
                                                        Предпросмотр:
                                                    </p>
                                                    <div
                                                        className="w-8 h-8"
                                                        dangerouslySetInnerHTML={{
                                                            __html: field.value,
                                                        }}
                                                    />
                                                </div>
                                            )}
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
                            const values = form.getValues();
                            if (icon_type_data) {
                                updateIconType({
                                    body: {
                                        ...values,
                                        is_point_of_interest: Boolean(values.is_point_of_interest),
                                        category_id: category_id,
                                        id: icon_type_data.id,
                                    },
                                });
                                return;
                            }

                            createIconType({
                                body: {
                                    ...values,
                                    is_point_of_interest: Boolean(values.is_point_of_interest),
                                    category_id: category_id,
                                },
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
