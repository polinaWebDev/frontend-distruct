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

export const NewsIdPage = ({
    data,
    recommendedNews = [],
    authed = false,
}: {
    data: NewsEntity;
    recommendedNews?: NewsEntity[];
    authed?: boolean;
}) => {
    const mainImageFileName = data.gallery_images?.[0]?.image_url ?? data.image_url;
    const mainImageUrl = getFileUrl(mainImageFileName);

    return (
        <BannerProvider page="news_article">
            <div className={clsx('header_margin_top', 'page_width_wrapper', styles.container)}>
                <div className={styles.news_content}>
                    <NewsImageGallery data={data} />

                    <h1 className={styles.title}>{data.title}</h1>
                    <NewsHtmlContent content={data.content} />
                    <div className="my-6">
                        <BannerSlot slotKey="content_inline" />
                    </div>
                    <div className={styles.date}>{formatNewsDate(data.createdAt)}</div>

                    <CommentsList newsId={data.id} authed={authed} />
                </div>

                <div className={styles.sticky}>
                    <div className={styles.separator}></div>

                    <div className={styles.recommended_news}>
                        <div className="mb-6">
                            <BannerSlot slotKey="sidebar_top" />
                        </div>
                        {recommendedNews.map((news) => (
                            <NewsItem key={news.id} news={news} />
                        ))}
                    </div>
                </div>
            </div>
        </BannerProvider>
    );
};
