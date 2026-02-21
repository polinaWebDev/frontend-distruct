'use client';

import { useMemo, useState } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClockIcon, UserIcon, RotateCcwIcon } from 'lucide-react';
import { toast } from 'sonner';

import {
    challengesShopAdminControllerGetPurchasesListInfiniteOptions,
    challengesShopAdminControllerReversePurchaseMutation,
} from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { getPublicClient } from '@/lib/api_client/public_client';
import type { ChallengeShopPurchaseEntity } from '@/lib/api_client/gen/types.gen';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const PAGE_LIMIT = 20;

export const PurchasesPage = () => {
    const [search, setSearch] = useState<string>('');
    const queryClient = useQueryClient();

    const queryPayload = useMemo(
        () => ({
            page: 1,
            limit: PAGE_LIMIT,
            search: search || undefined,
        }),
        [search]
    );

    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
        useInfiniteQuery({
            ...challengesShopAdminControllerGetPurchasesListInfiniteOptions({
                client: getPublicClient(),
                query: queryPayload,
            }),
            initialPageParam: 1,
            getNextPageParam: (lastPage, allPages) => {
                const pageData = lastPage ?? [];
                if (!pageData.length || pageData.length < PAGE_LIMIT) {
                    return undefined;
                }
                return allPages.length + 1;
            },
        });

    const purchasesList = useMemo(() => {
        return (data?.pages.flatMap((page) => page ?? []) ?? []) as ChallengeShopPurchaseEntity[];
    }, [data]);

    const formatDate = (value?: string | Date | null) => {
        if (!value) return '—';
        const date = typeof value === 'string' ? new Date(value) : value;
        return new Intl.DateTimeFormat('ru-RU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    const reverseMutation = useMutation({
        ...challengesShopAdminControllerReversePurchaseMutation({
            client: getPublicClient(),
        }),
        onSuccess: () => {
            toast.success('Покупка отменена');
            queryClient.invalidateQueries({
                queryKey: ['challengesShopAdminControllerGetPurchasesList'],
            });
            refetch();
        },
        onError: () => {
            toast.error('Ошибка при отмене покупки');
        },
    });

    const handleReversePurchase = (id: string) => {
        reverseMutation.mutate({
            body: {
                id,
            },
        });
    };

    return (
        <div className="container mx-auto py-8 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">История покупок</h1>
            </div>

            <div className="flex gap-4 flex-wrap items-end">
                <div className="flex-1 min-w-[220px] space-y-2">
                    <Label htmlFor="search">Поиск (пользователь)</Label>
                    <Input
                        id="search"
                        placeholder="Введите имя пользователя..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                </div>
            </div>

            <div className="border rounded-lg">
                {isLoading && !data ? (
                    <div className="p-8 text-center text-muted-foreground">Загрузка...</div>
                ) : purchasesList.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">Записи не найдены</div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Пользователь</TableHead>
                                <TableHead>Товар</TableHead>
                                <TableHead>Цена</TableHead>
                                <TableHead>Контакты</TableHead>
                                <TableHead>Дата</TableHead>
                                <TableHead className="text-right">Действия</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {purchasesList.map((purchase) => (
                                <TableRow key={purchase.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <UserIcon className="w-4 h-4 text-muted-foreground" />
                                            <span className="font-medium">
                                                {purchase.user?.username || '—'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-medium">
                                            {purchase.item?.name || '—'}
                                        </span>
                                    </TableCell>
                                    <TableCell>{purchase.item?.price ?? '—'}</TableCell>
                                    <TableCell
                                        className="max-w-xs truncate"
                                        title={purchase.contact_info ?? undefined}
                                    >
                                        {purchase.contact_info || '—'}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <ClockIcon className="w-3 h-3" />
                                            {formatDate(purchase.createdAt)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button size="sm" variant="destructive">
                                                    <RotateCcwIcon className="w-4 h-4 mr-1" />
                                                    Отменить
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>
                                                        Отменить покупку?
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Это действие вернет средства пользователю и
                                                        удалит запись о покупке.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                        onClick={() =>
                                                            handleReversePurchase(purchase.id)
                                                        }
                                                    >
                                                        Отменить покупку
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            {hasNextPage && (
                <div className="flex justify-center">
                    <Button
                        variant="outline"
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                    >
                        {isFetchingNextPage ? 'Загрузка...' : 'Загрузить ещё'}
                    </Button>
                </div>
            )}
        </div>
    );
};
