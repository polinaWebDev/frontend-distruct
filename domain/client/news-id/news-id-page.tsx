'use client';

import { NewsEntity } from '@/lib/api_client/gen';
import clsx from 'clsx';
import styles from './news-id-page.module.css';
import 'react-photo-view/dist/react-photo-view.css';
import { getFileUrl } from '@/lib/utils';
import { NewsImageGallery } from './components/NewsImageGallery/NewsImageGallery';
import { NewsHtmlContent } from './components/NewsHtmlContent/NewsHtmlContent';
import { formatNewsDate, NewsItem } from '../news/comoponents/news-item';
import { CommentsList } from './components/CommentsList/CommentsList';
import { BannerProvider } from '@/components/banners/BannerProvider';
import { BannerSlot } from '@/components/banners/BannerSlot';
import { useEffect, useRef } from 'react';
import { useMarkNewsSeen } from '../news/hooks/useNewsReadState';
import Link from 'next/link';
import { GoBackSmallBtn } from '@/ui/GoBackBig/GoBackBig';
import { GameType, isEnabledClientGameType } from '@/lib/enums/game_type.enum';

export const NewsIdPage = ({
    data,
    recommendedNews = [],
    authed = false,
}: {
    data: NewsEntity;
    recommendedNews?: NewsEntity[];
    authed?: boolean;
}) => {
    const markNewsSeen = useMarkNewsSeen();
    const lastMarkedIdRef = useRef<string | null>(null);

    useEffect(() => {
        if (!authed) return;
        if (!data?.id || !data?.game_type) return;
        if (lastMarkedIdRef.current === data.id) return;
        lastMarkedIdRef.current = data.id;
        markNewsSeen.mutate({ body: { news_id: data.id } });
    }, [authed, data?.id, data?.game_type]);

    const mainImageFileName = data.gallery_images?.[0]?.image_url ?? data.image_url;
    const mainImageUrl = getFileUrl(mainImageFileName);
    const resolvedGameType =
        data.game_type && isEnabledClientGameType(data.game_type)
            ? data.game_type
            : GameType.ArenaBreakout;

    return (
        <BannerProvider page="news_article">
            <div className={clsx('header_margin_top', 'page_width_wrapper', styles.container)}>
                <div className={styles.news_content}>
                    <Link href={`/${data.game_type}/news`} className={styles.back_link}>
                        <GoBackSmallBtn text="К новостям" />
                    </Link>
                    <NewsImageGallery data={data} />

                    <h1 className={styles.title}>{data.title}</h1>
                    <NewsHtmlContent content={data.content} />
                    <div className="my-6">
                        <BannerSlot slotKey="content_inline" />
                    </div>
                    <div className={styles.date}>{formatNewsDate(data.createdAt)}</div>

                    <CommentsList
                        newsId={data.id}
                        authed={authed}
                        gameType={resolvedGameType}
                    />
                </div>

                <div className={styles.sticky}>
                    <div className={styles.separator}></div>

                    <div className={styles.recommended_news}>
                        <div className="mb-6">
                            <BannerSlot slotKey="sidebar_top" />
                        </div>
                        <h2 className={styles.recommended_title}>Другие новости</h2>
                        {recommendedNews.length > 0 ? (
                            recommendedNews.map((news) => <NewsItem key={news.id} news={news} />)
                        ) : (
                            <div className={styles.recommended_empty}>
                                Других новостей пока нет
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </BannerProvider>
    );
};
