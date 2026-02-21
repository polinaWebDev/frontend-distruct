'use client';

import { GameType } from '@/lib/enums/game_type.enum';
import { useMemo } from 'react';
import {
    newsControllerGetNewsIndicatorOptions,
    newsControllerMarkNewsSeenMutation,
} from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { getPublicClient } from '@/lib/api_client/public_client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const newsClientQueryPredicate = (query: { queryKey?: readonly unknown[] }) =>
    (query.queryKey?.[0] as { _id?: string } | undefined)?._id === 'newsControllerGetAllNewsClient';

const newsIndicatorQueryPredicate = (query: { queryKey?: readonly unknown[] }) =>
    (query.queryKey?.[0] as { _id?: string } | undefined)?._id === 'newsControllerGetNewsIndicator';

const newsByIdQueryPredicate = (query: { queryKey?: readonly unknown[] }) =>
    (query.queryKey?.[0] as { _id?: string } | undefined)?._id === 'newsControllerGetNewsById';

export const useNewsUnreadIndicator = ({ gameType }: { gameType?: GameType | null }) => {
    const { data } = useQuery({
        ...newsControllerGetNewsIndicatorOptions({
            client: getPublicClient(),
            query: {
                game_type: gameType ?? undefined,
            },
        }),
        enabled: Boolean(gameType),
        staleTime: 60_000,
        refetchOnWindowFocus: false,
    });

    const hasUnread = useMemo(() => Boolean(data?.has_new), [data]);

    return { hasUnread };
};

export const useMarkNewsSeen = () => {
    const queryClient = useQueryClient();

    return useMutation({
        ...newsControllerMarkNewsSeenMutation({ client: getPublicClient() }),
        onSuccess: (_data, variables) => {
            const newsId = variables?.body?.news_id;
            if (newsId) {
                queryClient.setQueriesData(
                    { predicate: newsClientQueryPredicate },
                    (oldData: any) => {
                        if (!oldData?.pages) return oldData;
                        return {
                            ...oldData,
                            pages: oldData.pages.map((page: any) => {
                                if (!page?.data) return page;
                                return {
                                    ...page,
                                    data: page.data.map((item: any) =>
                                        item?.id === newsId
                                            ? { ...item, is_new: false }
                                            : item
                                    ),
                                };
                            }),
                        };
                    }
                );

                queryClient.setQueriesData(
                    { predicate: newsByIdQueryPredicate },
                    (oldData: any) => {
                        if (!oldData) return oldData;
                        if (oldData?.id !== newsId) return oldData;
                        return { ...oldData, is_new: false };
                    }
                );
            }
            queryClient.invalidateQueries({ predicate: newsIndicatorQueryPredicate });
            queryClient.invalidateQueries({ predicate: newsClientQueryPredicate });
            queryClient.invalidateQueries({ predicate: newsByIdQueryPredicate });
        },
    });
};
