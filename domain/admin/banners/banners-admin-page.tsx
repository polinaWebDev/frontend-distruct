'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import {
    bannersAdminControllerDeleteBannerMutation,
    bannersAdminControllerListBannersOptions,
    bannersAdminControllerListBannersQueryKey,
} from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { getPublicClient } from '@/lib/api_client/public_client';
import type { BannerAdminResponseDto } from '@/lib/api_client/gen/types.gen';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BannerFormDialog } from './components/banner-form-dialog';
import { getFileUrl } from '@/lib/utils';

export function BannersAdminPage() {
    const queryClient = useQueryClient();
    const [createOpen, setCreateOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<BannerAdminResponseDto | null>(null);

    const { data, isLoading } = useQuery({
        ...bannersAdminControllerListBannersOptions({
            client: getPublicClient(),
        }),
    });

    const banners = useMemo(() => (data ?? []) as BannerAdminResponseDto[], [data]);

    const deleteMutation = useMutation({
        ...bannersAdminControllerDeleteBannerMutation({
            client: getPublicClient(),
        }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: bannersAdminControllerListBannersQueryKey(),
            });
            toast.success('Баннер удалён');
        },
        onError: () => {
            toast.error('Ошибка при удалении баннера');
        },
    });

    const handleDelete = (id: string) => {
        if (!confirm('Удалить баннер?')) return;
        deleteMutation.mutate({ path: { id } });
    };

    const handleSuccess = async () => {
        await queryClient.invalidateQueries({
            queryKey: bannersAdminControllerListBannersQueryKey(),
        });
    };

    return (
        <div className="container mx-auto py-8 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Баннеры</h1>
                <Button onClick={() => setCreateOpen(true)}>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Создать баннер
                </Button>
            </div>

            <div className="border rounded-lg">
                {isLoading ? (
                    <div className="p-8 text-center text-muted-foreground">Загрузка...</div>
                ) : banners.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">Баннеры не найдены</div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Превью</TableHead>
                                <TableHead>Название</TableHead>
                                <TableHead>Тип</TableHead>
                                <TableHead>Статус</TableHead>
                                <TableHead>Дата создания</TableHead>
                                <TableHead className="text-right">Действия</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {banners.map((banner) => (
                                <TableRow key={banner.id}>
                                    <TableCell>
                                        <div className="h-12 w-20 rounded-md bg-muted/40 overflow-hidden flex items-center justify-center">
                                            {banner.type === 'video' ? (
                                                <video
                                                    src={getFileUrl(banner.fileUrl)}
                                                    muted
                                                    className="h-full w-full object-contain"
                                                />
                                            ) : (
                                                <img
                                                    src={getFileUrl(banner.fileUrl)}
                                                    alt={banner.title}
                                                    className="h-full w-full object-contain"
                                                />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{banner.title}</TableCell>
                                    <TableCell>{banner.type}</TableCell>
                                    <TableCell>
                                        <Badge variant={banner.isActive ? 'default' : 'secondary'}>
                                            {banner.isActive ? 'Активен' : 'Выключен'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(banner.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setEditingBanner(banner)}
                                                title="Редактировать"
                                            >
                                                <PencilIcon className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(banner.id)}
                                                title="Удалить"
                                            >
                                                <Trash2Icon className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            <BannerFormDialog
                open={createOpen}
                mode="create"
                onOpenChange={setCreateOpen}
                onSuccess={handleSuccess}
            />

            <BannerFormDialog
                open={!!editingBanner}
                mode="edit"
                banner={editingBanner}
                onOpenChange={(open) => setEditingBanner(open ? editingBanner : null)}
                onSuccess={handleSuccess}
            />
        </div>
    );
}
