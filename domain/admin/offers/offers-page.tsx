'use client';

import { useMemo, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ClockIcon, UserIcon, InfoIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

import { offerControllerGetListInfiniteOptions } from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { getPublicClient } from '@/lib/api_client/public_client';
import type { ChallengeOfferEntity } from '@/lib/api_client/gen/types.gen';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { OfferDetailsDialog } from './offer-details.dialog';

const PAGE_LIMIT = 20;

export const OffersPage = () => {
    const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);

    const queryPayload = useMemo(
        () => ({
            page: 1,
            limit: PAGE_LIMIT,
        }),
        []
    );

    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
        ...offerControllerGetListInfiniteOptions({
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

    const offersList = useMemo(() => {
        return (data?.pages.flatMap((page) => page ?? []) ?? []) as ChallengeOfferEntity[];
    }, [data]);

    return (
        <div className="container mx-auto py-8 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Предложения челленджей</h1>
            </div>

            <div className="border rounded-lg">
                {isLoading && !data ? (
                    <div className="p-8 text-center text-muted-foreground">Загрузка...</div>
                ) : offersList.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">Записи не найдены</div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Пользователь</TableHead>
                                <TableHead>Название</TableHead>
                                <TableHead>Файлы</TableHead>
                                <TableHead>Дата</TableHead>
                                <TableHead className="text-right">Действия</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {offersList.map((offer) => (
                                <TableRow key={offer.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <UserIcon className="w-4 h-4 text-muted-foreground" />
                                            <span className="font-medium">
                                                {offer.user?.username || '—'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium line-clamp-1">
                                            {offer.title}
                                        </div>
                                        <div className="text-xs text-muted-foreground line-clamp-1">
                                            {offer.description}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {offer.images_urls && offer.images_urls.length > 0 ? (
                                            <span className="text-sm text-muted-foreground">
                                                {offer.images_urls.length} шт.
                                            </span>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <ClockIcon className="w-3 h-3" />
                                            {offer.createdAt
                                                ? format(
                                                      new Date(offer.createdAt),
                                                      'dd.MM.yyyy HH:mm',
                                                      {
                                                          locale: ru,
                                                      }
                                                  )
                                                : '—'}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setSelectedOfferId(offer.id ?? null)}
                                        >
                                            <InfoIcon className="w-4 h-4 mr-1" />
                                            Просмотр
                                        </Button>
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

            <OfferDetailsDialog
                open={!!selectedOfferId}
                onOpenChange={(open) => !open && setSelectedOfferId(null)}
                offerId={selectedOfferId}
            />
        </div>
    );
};
