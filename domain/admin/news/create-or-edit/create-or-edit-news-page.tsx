'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
    ArrowLeftIcon,
    PlusIcon,
    Trash2Icon,
    ArrowUpIcon,
    ArrowDownIcon,
    UploadIcon,
} from 'lucide-react';
import Image from 'next/image';

import {
    newsAdminControllerCreateNewsMutation,
    newsAdminControllerUpdateNewsMutation,
    newsAdminControllerAddGalleryImageMutation,
    newsAdminControllerRemoveGalleryImageMutation,
    newsAdminControllerReorderGalleryImagesMutation,
    uploadsControllerUploadFileMutation,
} from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { getPublicClient } from '@/lib/api_client/public_client';
import { getFileUrl } from '@/lib/utils';
import { GameType, GAME_TYPE_VALUES } from '@/lib/enums/game_type.enum';
import { getStoredGameType } from '@/domain/admin/hooks/useAdminGameType';
import type { NewsEntity, NewsGalleryImageEntity } from '@/lib/api_client/gen/types.gen';
import { HtmlEditor } from './components/HtmlEditor/HtmlEditor';
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
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const formSchema = z.object({
    title: z.string().min(1, 'Заголовок обязателен'),
    short_description: z.string().min(1, 'Краткое описание обязательно'),
    content: z.string().min(1, 'Содержание обязательно'),
    game_type: z.nativeEnum(GameType).optional(),
    image_url: z.string().optional().nullable(),
    is_published: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateOrEditNewsPageProps {
    news?: NewsEntity;
}

export const CreateOrEditNewsPage = ({ news }: CreateOrEditNewsPageProps) => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [isUploading, setIsUploading] = useState(false);
    const [galleryImages, setGalleryImages] = useState<NewsGalleryImageEntity[]>(
        news?.gallery_images || []
    );

    const storedGameType = getStoredGameType();
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: news?.title || '',
            short_description: news?.short_description || '',
            content: news?.content || '',
            game_type: (news?.game_type as GameType) || storedGameType || GameType.ArenaBreakout,
            image_url: news?.image_url || null,
            is_published: news?.is_published ?? false,
        },
    });

    // Sync gallery images if news prop updates (e.g. after refetch)
    useEffect(() => {
        if (news?.gallery_images) {
            setGalleryImages(news.gallery_images);
        }
    }, [news]);

    const createMutation = useMutation({
        ...newsAdminControllerCreateNewsMutation({ client: getPublicClient() }),
        onMutate: () => {
            toast.loading('Создание новости...', { id: 'create-news' });
        },
        onSuccess: () => {
            toast.success('Новость успешно создана', { id: 'create-news' });
            router.push('/admin/news');
        },
        onError: () => {
            toast.error('Не удалось создать новость', { id: 'create-news' });
        },
    });

    const updateMutation = useMutation({
        ...newsAdminControllerUpdateNewsMutation({ client: getPublicClient() }),
        onMutate: () => {
            toast.loading('Обновление новости...', { id: 'update-news' });
        },
        onSuccess: () => {
            toast.success('Новость успешно обновлена', { id: 'update-news' });
            queryClient.invalidateQueries({
                queryKey: ['newsControllerGetNewsById'],
            });
        },
        onError: () => {
            toast.error('Не удалось обновить новость', { id: 'update-news' });
        },
    });

    const uploadMutation = useMutation({
        ...uploadsControllerUploadFileMutation({ client: getPublicClient() }),
    });

    const addGalleryImageMutation = useMutation({
        ...newsAdminControllerAddGalleryImageMutation({
            client: getPublicClient(),
        }),
        onMutate: () => {
            toast.loading('Добавление изображения...', { id: 'add-gallery-image' });
        },
        onSuccess: () => {
            toast.success('Изображение добавлено в галерею', {
                id: 'add-gallery-image',
            });
            router.refresh(); // Refresh to get updated list
        },
        onError: () => {
            toast.error('Не удалось добавить изображение', {
                id: 'add-gallery-image',
            });
        },
    });

    const removeGalleryImageMutation = useMutation({
        ...newsAdminControllerRemoveGalleryImageMutation({
            client: getPublicClient(),
        }),
        onMutate: () => {
            toast.loading('Удаление изображения...', { id: 'remove-gallery-image' });
        },
        onSuccess: () => {
            toast.success('Изображение удалено из галереи', {
                id: 'remove-gallery-image',
            });
            router.refresh();
        },
        onError: () => {
            toast.error('Не удалось удалить изображение', {
                id: 'remove-gallery-image',
            });
        },
    });

    const reorderGalleryImagesMutation = useMutation({
        ...newsAdminControllerReorderGalleryImagesMutation({
            client: getPublicClient(),
        }),
        onMutate: () => {
            toast.loading('Изменение порядка галереи...', { id: 'reorder-gallery' });
        },
        onSuccess: () => {
            toast.success('Порядок галереи изменен', { id: 'reorder-gallery' });
            router.refresh();
        },
        onError: () => {
            toast.error('Не удалось изменить порядок галереи', {
                id: 'reorder-gallery',
            });
        },
    });

    const handleImageUpload = async (file: File, isMainImage: boolean = true) => {
        setIsUploading(true);
        const toastId = 'upload-image';
        toast.loading('Загрузка изображения...', { id: toastId });
        try {
            const url = await uploadMutation.mutateAsync({
                body: {
                    file: file as any, // Type casting needed due to generated types sometimes being specific
                },
            });

            if (url) {
                if (isMainImage) {
                    form.setValue('image_url', url);
                    toast.success('Изображение успешно загружено', { id: toastId });
                } else if (news?.id) {
                    // Dismiss upload toast as addGalleryImageMutation will show its own
                    toast.dismiss(toastId);
                    await addGalleryImageMutation.mutateAsync({
                        body: {
                            news_id: news.id,
                            image_url: url,
                        },
                    });
                } else {
                    toast.success('Изображение успешно загружено', { id: toastId });
                }
            }
        } catch (error) {
            toast.error('Ошибка при загрузке изображения', { id: toastId });
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    };

    const onSubmit = (values: FormValues) => {
        if (news) {
            updateMutation.mutate({
                body: {
                    ...values,
                    id: news.id,
                },
            });
        } else {
            createMutation.mutate({
                body: {
                    ...values,
                    // Ensure optional fields are handled
                    game_type: values.game_type ?? undefined,
                    image_url: values.image_url ?? undefined,
                },
            });
        }
    };

    const handleReorder = async (index: number, direction: 'up' | 'down') => {
        if (!news?.id) return;

        const newImages = [...galleryImages];
        if (direction === 'up' && index > 0) {
            [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
        } else if (direction === 'down' && index < newImages.length - 1) {
            [newImages[index + 1], newImages[index]] = [newImages[index], newImages[index + 1]];
        } else {
            return;
        }

        setGalleryImages(newImages); // Optimistic update

        const imageIds = newImages.map((img) => img.id);
        try {
            await reorderGalleryImagesMutation.mutateAsync({
                body: {
                    news_id: news.id,
                    image_ids: imageIds,
                },
            });
        } catch {
            // Revert on error (could be handled better)
            setGalleryImages(news.gallery_images || []);
        }
    };

    return (
        <div className="container mx-auto py-8 space-y-6 max-w-4xl">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Назад
            </Button>

            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">
                    {news ? 'Редактировать новость' : 'Создать новость'}
                </h1>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Основная информация</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Заголовок *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Заголовок новости" {...field} />
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
                                        <FormLabel>Тип игры</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Выберите игру" />
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
                                name="is_published"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">
                                                Опубликовано *
                                            </FormLabel>
                                            <div className="text-[0.8rem] text-muted-foreground">
                                                Публично видно пользователям
                                            </div>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="short_description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Краткое описание *</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Краткое содержание..."
                                                className="h-20"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="content"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Содержание *</FormLabel>
                                        <FormControl>
                                            <HtmlEditor
                                                value={field.value}
                                                onChange={field.onChange}
                                                placeholder="Полное содержание новости..."
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="image_url"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Главное изображение</FormLabel>
                                        <FormControl>
                                            <div className="flex flex-col gap-4">
                                                {field.value && (
                                                    <div className="relative w-full h-48 bg-muted rounded-md overflow-hidden">
                                                        <Image
                                                            src={getFileUrl(field.value)}
                                                            alt="Предпросмотр"
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        placeholder="URL изображения"
                                                        {...field}
                                                        value={field.value || ''}
                                                    />
                                                    <div className="relative">
                                                        <input
                                                            type="file"
                                                            id="main-image-upload"
                                                            className="hidden"
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file)
                                                                    handleImageUpload(file, true);
                                                            }}
                                                            disabled={isUploading}
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() =>
                                                                document
                                                                    .getElementById(
                                                                        'main-image-upload'
                                                                    )
                                                                    ?.click()
                                                            }
                                                            disabled={isUploading}
                                                        >
                                                            <UploadIcon className="w-4 h-4 mr-2" />
                                                            Загрузить
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => router.back()}>
                            Отмена
                        </Button>
                        <Button
                            type="submit"
                            disabled={createMutation.isPending || updateMutation.isPending}
                        >
                            {createMutation.isPending || updateMutation.isPending
                                ? 'Сохранение...'
                                : news
                                  ? 'Обновить новость'
                                  : 'Создать новость'}
                        </Button>
                    </div>
                </form>
            </Form>

            {/* Gallery Section - Only visible when editing */}
            {news && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Галерея</CardTitle>
                        <div className="relative">
                            <input
                                type="file"
                                id="gallery-upload"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleImageUpload(file, false);
                                }}
                                disabled={addGalleryImageMutation.isPending || isUploading}
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => document.getElementById('gallery-upload')?.click()}
                                disabled={addGalleryImageMutation.isPending || isUploading}
                            >
                                <PlusIcon className="w-4 h-4 mr-2" />
                                Добавить изображение
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {galleryImages.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                В галерее нет изображений
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {galleryImages.map((image, index) => (
                                    <div
                                        key={image.id}
                                        className="group relative aspect-video bg-muted rounded-md overflow-hidden border"
                                    >
                                        <Image
                                            src={getFileUrl(image.image_url)}
                                            alt={`Gallery ${index}`}
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                onClick={() => handleReorder(index, 'up')}
                                                disabled={
                                                    index === 0 ||
                                                    reorderGalleryImagesMutation.isPending
                                                }
                                                title="Переместить вверх"
                                            >
                                                <ArrowUpIcon className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                onClick={() => handleReorder(index, 'down')}
                                                disabled={
                                                    index === galleryImages.length - 1 ||
                                                    reorderGalleryImagesMutation.isPending
                                                }
                                                title="Переместить вниз"
                                            >
                                                <ArrowDownIcon className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                onClick={() =>
                                                    removeGalleryImageMutation.mutate({
                                                        body: { id: image.id },
                                                    })
                                                }
                                                title="Удалить"
                                            >
                                                <Trash2Icon className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
