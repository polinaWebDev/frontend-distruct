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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { MapListResponseDto } from '@/lib/api_client/gen';
import {
    mapsAdminControllerCreateMapMutation,
    mapsAdminControllerUpdateMapMutation,
    mapsControllerGetMapListQueryKey,
} from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { zCreateMapDto } from '@/lib/api_client/gen/zod.gen';
import { getPublicClient } from '@/lib/api_client/public_client';
import { GAME_TYPE_VALUES, GameType } from '@/lib/enums/game_type.enum';
import { useAdminGameTypeContext } from '@/domain/admin/context/admin-game-type-context';
import { AppControlledInput } from '@/ui/AppInput/AppInput';
import { getFileUrl } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

const schema = zCreateMapDto.extend({
    file: z.optional(z.instanceof(File)),
});

export const CreateMapDialog = ({
    open,
    onOpenChange,
    map_data,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    map_data?: MapListResponseDto;
}) => {
    const { gameType } = useAdminGameTypeContext();
    const form = useForm<z.infer<typeof zCreateMapDto>>({
        resolver: zodResolver(zCreateMapDto),
        defaultValues: {
            name: map_data?.name ?? '',
            description: map_data?.description ?? '',
            game_type: (map_data?.game_type as GameType) ?? GameType.ArenaBreakout,
            visibility: map_data?.visibility ?? 'public',
            file: undefined,
        },
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const previewUrlRef = useRef<string | null>(null);
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!open) return;
        form.setValue('game_type', gameType, { shouldValidate: true });
    }, [form, gameType, open]);

    useEffect(() => {
        if (!open) return;
        setImageFile(null);
        if (previewUrlRef.current) {
            URL.revokeObjectURL(previewUrlRef.current);
            previewUrlRef.current = null;
        }
        setPreviewUrl(map_data?.image_url ? getFileUrl(map_data.image_url) : null);
    }, [open, map_data?.image_url]);

    const { mutate: createMap, isPending } = useMutation({
        ...mapsAdminControllerCreateMapMutation({
            client: getPublicClient(),
        }),
        onSuccess: () => {
            toast.success('Карта успешно создана');
            onOpenChange(false);
            queryClient.resetQueries({
                queryKey: mapsControllerGetMapListQueryKey({
                    query: { game_type: form.getValues().game_type },
                    client: getPublicClient(),
                }),
            });
        },
        onError: (error) => {
            console.error(error);
            toast.error('Ошибка при создании карты');
        },
    });

    const { mutate: editMap, isPending: isEditPending } = useMutation({
        ...mapsAdminControllerUpdateMapMutation({
            client: getPublicClient(),
        }),
        onSuccess: () => {
            toast.success('Карта успешно обновлена');
            onOpenChange(false);
            queryClient.resetQueries({
                queryKey: mapsControllerGetMapListQueryKey({
                    query: { game_type: form.getValues().game_type },
                    client: getPublicClient(),
                }),
            });
        },
        onError: (error) => {
            console.error(error);
            toast.error('Ошибка при обновлении карты');
        },
    });
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{map_data ? 'Редактировать карту' : 'Создать карту'}</DialogTitle>
                    <DialogDescription>
                        {map_data
                            ? 'Редактируйте карту в системе'
                            : 'Добавьте новую карту в систему'}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 overflow-y-auto max-h-[80svh]">
                    <Form {...form}>
                        <div className="shrink-0 flex flex-col gap-4">
                            <AppControlledInput
                                control={form.control}
                                name="name"
                                label="Название *"
                                desc="Название карты"
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
                                                placeholder="Описание карты"
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
                                name="visibility"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Публичная</FormLabel>
                                            <div className="text-[0.8rem] text-muted-foreground">
                                                Выключено — только для админов
                                            </div>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value !== 'private'}
                                                onCheckedChange={(checked) =>
                                                    field.onChange(
                                                        checked ? 'public' : 'private'
                                                    )
                                                }
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-2">
                                <FormLabel>Изображение</FormLabel>
                                <Input
                                    id="image"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0] || null;
                                        setImageFile(file);
                                        if (previewUrlRef.current) {
                                            URL.revokeObjectURL(previewUrlRef.current);
                                            previewUrlRef.current = null;
                                        }
                                        if (file) {
                                            const objectUrl = URL.createObjectURL(file);
                                            previewUrlRef.current = objectUrl;
                                            setPreviewUrl(objectUrl);
                                        } else {
                                            setPreviewUrl(
                                                map_data?.image_url
                                                    ? getFileUrl(map_data.image_url)
                                                    : null
                                            );
                                        }
                                    }}
                                />
                                {previewUrl && (
                                    <div className="mt-2">
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="max-h-40 w-full rounded-md object-cover"
                                        />
                                    </div>
                                )}
                                {imageFile && (
                                    <p className="text-sm text-muted-foreground">
                                        Выбрано: {imageFile.name} (
                                        {(imageFile.size / 1024).toFixed(2)} KB)
                                    </p>
                                )}
                            </div>
                        </div>
                    </Form>
                </div>

                <DialogFooter>
                    <Button
                        disabled={!form.formState.isValid || isPending || isEditPending}
                        onClick={() => {
                            if (map_data) {
                                editMap({
                                    body: {
                                        ...form.getValues(),
                                        file: imageFile ? imageFile : undefined,
                                        id: map_data.id,
                                    },
                                });
                                return;
                            }

                            createMap({
                                body: {
                                    ...form.getValues(),
                                    file: imageFile ? imageFile : undefined,
                                },
                            });
                        }}
                    >
                        {isPending || isEditPending ? 'Сохранение...' : 'Сохранить'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
