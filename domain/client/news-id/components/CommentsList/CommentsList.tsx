'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import styles from './CommentsList.module.css';
import { commentsControllerGetNewsCommentsInfiniteOptions } from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { getPublicClient } from '@/lib/api_client/public_client';
import { Comment } from '../Comment/Comment';
import { CommentInput } from '../CommentInput/CommentInput';
import { useMemo, useState } from 'react';
import { GetNewsCommentsResponseItemDto } from '@/lib/api_client/gen';
import { AppSkeleton } from '@/ui/AppSkeleton/AppSkeleton';
import { AppBtn } from '@/ui/SmallBtn/AppBtn';
import { MessageSquareDashed } from 'lucide-react';
import { GameType } from '@/lib/enums/game_type.enum';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const limit = 20;
type SortType = 'new' | 'popular';

export const CommentsList = ({
    newsId,
    authed,
    gameType,
}: {
    newsId: string;
    authed: boolean;
    gameType: GameType;
}) => {
    const [sortType, setSortType] = useState<SortType>('popular');
    const { data, isPending, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
        useInfiniteQuery({
            ...commentsControllerGetNewsCommentsInfiniteOptions({
                client: getPublicClient(),
                query: {
                    news_id: newsId,
                    limit,
                    page: 1,
                },
            }),
            initialPageParam: 1,
            getNextPageParam: (lastPage, allPages) => {
                if (!lastPage || lastPage.length === 0) {
                    return undefined;
                }
                const responseDto = lastPage;
                if (!responseDto || responseDto.length < limit) {
                    return undefined;
                }
                return allPages.length + 1;
            },
        });

    const comments = useMemo(() => {
        const items =
            (data?.pages?.flatMap((page) => page ?? []) as GetNewsCommentsResponseItemDto[]) ?? [];

        const sorted = [...items];
        sorted.sort((a, b) => {
            if (sortType === 'popular') {
                const scoreA = a.likes_count - a.dislikes_count;
                const scoreB = b.likes_count - b.dislikes_count;
                if (scoreA !== scoreB) return scoreB - scoreA;
            }
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        return sorted;
    }, [data, sortType]);

    return (
        <div className={styles.container}>
            <div className={styles.header_row}>
                <h1 className={styles.title}>Комментарии</h1>
            </div>

            {authed && <CommentInput refetch={refetch} news_id={newsId} />}

            <div className={styles.sort_selector_top}>
                <Select value={sortType} onValueChange={(value) => setSortType(value as SortType)}>
                    <SelectTrigger className="w-[200px] rounded-xl border-[#34363d] px-3 py-2 text-sm font-medium text-muted-foreground transition-all data-[state=open]:border-ded data-[state=open]:text-primary-foreground data-[state=open]:shadow">
                        <SelectValue placeholder="Сортировка" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1b1d24] border-[#34363d]">
                        <SelectItem value="new">Сначала новые</SelectItem>
                        <SelectItem value="popular">Сначала популярные</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {comments?.length > 0 || isPending || isFetchingNextPage ? (
                <div className={styles.list}>
                    {comments?.map((comment) => (
                        <Comment key={comment.id} comment={comment} gameType={gameType} />
                    ))}

                    {(isPending || isFetchingNextPage) && (
                        <>
                            <AppSkeleton className={styles.skeleton} />
                            <AppSkeleton className={styles.skeleton} />
                            <AppSkeleton className={styles.skeleton} />
                        </>
                    )}

                    {hasNextPage && (
                        <AppBtn
                            text="Загрузить больше"
                            onClick={() => fetchNextPage()}
                            disabled={isFetchingNextPage}
                            style={'outline_dark'}
                        />
                    )}
                </div>
            ) : (
                <div className={styles.empty_state}>
                    <MessageSquareDashed className={styles.empty_state_icon} />
                    <span className={styles.empty_state_text}>Комментариев пока нет</span>
                </div>
            )}
        </div>
    );
};
