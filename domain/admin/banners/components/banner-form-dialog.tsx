'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
import { zCreateBannerAdminDto, zUpdateBannerAdminDto } from '@/lib/api_client/gen/zod.gen';
import type { BannerAdminResponseDto } from '@/lib/api_client/gen/types.gen';
import { getFileUrl } from '@/lib/utils';
import {
    bannersAdminControllerCreateBanner,
    bannersAdminControllerUpdateBanner,
} from '@/lib/api_client/gen/sdk.gen';
import { getPublicClient } from '@/lib/api_client/public_client';

const TYPE_OPTIONS = [
    { label: 'image', value: 'image' },
    { label: 'video', value: 'video' },
] as const;

const createBannerFormSchema = zCreateBannerAdminDto.extend({
    isActive: z.boolean(),
});

const updateBannerFormSchema = zUpdateBannerAdminDto.extend({
    isActive: z.boolean(),
});

type CreateBannerFormData = z.infer<typeof createBannerFormSchema>;

type UpdateBannerFormData = z.infer<typeof updateBannerFormSchema> & {
    type?: 'image' | 'video';
};

type BannerFormDialogProps = {
    open: boolean;
    mode: 'create' | 'edit';
    banner?: BannerAdminResponseDto | null;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
};

function normalizeBannerLinkUrl(rawValue?: string | null) {
    const value = rawValue?.trim();
    if (!value) return null;
    if (/^https?:\/\//i.test(value)) return value;
    return `https://${value}`;
}

function isValidHttpUrl(value: string) {
    try {
        const parsed = new URL(value);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
}

export function BannerFormDialog({
    open,
    mode,
    banner,
    onOpenChange,
    onSuccess,
}: BannerFormDialogProps) {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const isEdit = mode === 'edit';

    const form = useForm<CreateBannerFormData | UpdateBannerFormData>({
        resolver: zodResolver(isEdit ? updateBannerFormSchema : createBannerFormSchema),
        defaultValues: isEdit
            ? {
                  title: banner?.title ?? '',
                  type: (banner?.type as 'image' | 'video') ?? 'image',
                  link_url: banner?.linkUrl ?? undefined,
                  isActive: banner?.isActive ?? true,
              }
            : {
                  title: '',
                  type: 'image',
                  link_url: undefined,
                  file: '',
                  isActive: true,
              },
    });

    const watchedType = form.watch('type');

    useEffect(() => {
        if (!open) return;
        if (isEdit) {
            form.reset({
                title: banner?.title ?? '',
                type: (banner?.type as 'image' | 'video') ?? 'image',
                link_url: banner?.linkUrl ?? undefined,
                isActive: banner?.isActive ?? true,
            });
            setFile(null);
            setPreviewUrl(null);
        } else {
            form.reset({
                title: '',
                type: 'image',
                link_url: undefined,
                file: '',
                isActive: true,
            });
            setFile(null);
            setPreviewUrl(null);
        }
    }, [open, isEdit, banner, form]);

    useEffect(() => {
        if (!file) return;
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    useEffect(() => {
        if (!open) return;
        setFile(null);
        setPreviewUrl(null);
    }, [watchedType, open]);

    const currentPreview = useMemo(() => {
        if (previewUrl) return previewUrl;
        if (isEdit && banner?.fileUrl) return getFileUrl(banner.fileUrl);
        return null;
    }, [previewUrl, isEdit, banner]);

    const handleSubmit = async (data: CreateBannerFormData | UpdateBannerFormData) => {
        const linkUrl = normalizeBannerLinkUrl(data.link_url);
        const selectedType = (data.type as 'image' | 'video' | undefined) ?? banner?.type;

        if (linkUrl && !isValidHttpUrl(linkUrl)) {
            toast.error('Некорректная ссылка. Укажите полный URL');
            return;
        }

        if (!selectedType) {
            toast.error('Не удалось определить тип баннера');
            return;
        }

        if (!isEdit && !file) {
            toast.error('Файл обязателен');
            return;
        }

        if (isEdit && banner && selectedType !== banner.type && !file) {
            toast.error('При смене типа требуется новый файл');
            return;
        }

        try {
            if (isEdit && banner) {
                const updateBody: Record<string, unknown> = {
                    title: data.title,
                    link_url: linkUrl,
                    isActive: data.isActive,
                };

                if (file) {
                    updateBody.file = file;
                    updateBody.type = selectedType;
                }

                await bannersAdminControllerUpdateBanner({
                    client: getPublicClient(),
                    path: { id: banner.id },
                    body: updateBody as any,
                });
            } else {
                await bannersAdminControllerCreateBanner({
                    client: getPublicClient(),
                    body: {
                        title: data.title,
                        type: selectedType,
                        link_url: linkUrl,
                        isActive: data.isActive,
                        ...(file ? { file } : {}),
                    } as any,
                });
            }

            toast.success(isEdit ? 'Баннер обновлён' : 'Баннер создан');
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            toast.error('Ошибка при сохранении баннера');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Редактировать баннер' : 'Создать баннер'}</DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? 'Обновите метаданные или замените файл.'
                            : 'Загрузите изображение или видео для баннера.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Заголовок *</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Например: Winter Sale" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Тип *</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value as string}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Выберите тип" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {TYPE_OPTIONS.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormItem>
                            <FormLabel>{isEdit ? 'Заменить файл' : 'Файл *'}</FormLabel>
                            <FormControl>
                                <Input
                                    type="file"
                                    accept={
                                        watchedType === 'video'
                                            ? 'video/mp4,video/webm'
                                            : 'image/jpeg,image/png,image/webp,image/gif'
                                    }
                                    onChange={(e) => {
                                        const selected = e.target.files?.[0] ?? null;
                                        setFile(selected);
                                    }}
                                />
                            </FormControl>
                        </FormItem>

                        <FormField
                            control={form.control}
                            name="link_url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ссылка</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            value={field.value ?? ''}
                                            placeholder="https://example.com"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="isActive"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Статус</FormLabel>
                                        <div className="text-[0.8rem] text-muted-foreground">
                                            {field.value ? 'Активен' : 'Выключен'}
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

                        <div className="rounded-lg border p-4">
                            <p className="text-sm text-muted-foreground mb-2">Превью</p>
                            {currentPreview ? (
                                watchedType === 'video' ? (
                                    <video
                                        src={currentPreview}
                                        muted
                                        controls={false}
                                        className="w-full max-h-56 object-contain rounded-md bg-black/10"
                                    />
                                ) : (
                                    <img
                                        src={currentPreview}
                                        alt="preview"
                                        className="w-full max-h-56 object-contain rounded-md bg-black/10"
                                    />
                                )
                            ) : (
                                <div className="h-32 rounded-md bg-muted flex items-center justify-center text-sm text-muted-foreground">
                                    Превью появится после выбора файла
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => onOpenChange(false)}
                            >
                                Отмена
                            </Button>
                            <Button type="submit">Сохранить</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
