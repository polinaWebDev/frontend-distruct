'use client';

import { newsControllerGetAllNewsClientInfiniteOptions } from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { getPublicClient } from '@/lib/api_client/public_client';
import { GameType } from '@/lib/enums/game_type.enum';
import { useInfiniteQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { useMemo, useState } from 'react';
import styles from './news-page.module.css';
import { NewsItem } from './comoponents/news-item';
import { AppBtn } from '@/ui/SmallBtn/AppBtn';
import { Newspaper } from 'lucide-react';
import { Tabs, TabsList } from '@/components/ui/tabs';
import AppTabsTrigger from '@/ui/AppTabsTrigger/AppTabsTrigger';

const LIMIT = 15;
type SortType = 'new' | 'popular';
const SORT_MAP: Record<SortType, 'latest' | 'popular'> = {
    new: 'latest',
    popular: 'popular',
};

export const NewsPage = ({ gameType }: { gameType: GameType }) => {
    const [sortType, setSortType] = useState<SortType>('popular');
    const { data, isPending, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
        ...newsControllerGetAllNewsClientInfiniteOptions({
            client: getPublicClient(),
            query: {
                page: 1,
                limit: LIMIT,
                game_type: gameType,
                sort: SORT_MAP[sortType],
            },
        }),
        getNextPageParam: (lastPage, allPages) => {
            if (!lastPage || lastPage.data.length === 0) {
                return undefined;
            }
            const responseDto = lastPage.data;

            if (!responseDto || responseDto.length < LIMIT) {
                return undefined;
            }
            return allPages.length + 1;
        },
        initialPageParam: 1,
    });

    const news = useMemo(() => {
        if (!data) return [];
        return data.pages.flatMap((page) => page.data ?? []);
    }, [data]);

    const orderedNews = useMemo(() => {
        if (news.length === 0) return news;
        const unread = news.filter((item) => item.is_new);
        const rest = news.filter((item) => !item.is_new);
        return [...unread, ...rest];
    }, [news]);

    return (
        <div className={clsx('header_margin_top', 'page_width_wrapper', styles.container)}>
            <div className={styles.header_row}>
                <h1>Новости</h1>
                <Tabs value={sortType} onValueChange={(value) => setSortType(value as SortType)}>
                    <TabsList className="flex gap-2">
                        <AppTabsTrigger value="new">Сначала новые</AppTabsTrigger>
                        <AppTabsTrigger value="popular">Сначала популярные</AppTabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
            {orderedNews.length > 0 || isPending || isFetchingNextPage ? (
                <div className={styles.items}>
                    {orderedNews.map((news) => (
                        <NewsItem key={news.id} news={news} />
                    ))}
                </div>
            ) : (
                <div className={styles.empty_state}>
                    <Newspaper className={styles.empty_state_icon} />
                    <span className={styles.empty_state_text}>Новостей пока нет</span>
                </div>
            )}
            {hasNextPage && (
                <AppBtn
                    text="Загрузить больше"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    style="outline_dark"
                    className={styles.load_more_btn}
                />
            )}
        </div>
    );
};
