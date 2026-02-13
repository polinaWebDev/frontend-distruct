import { NewsEntity } from '@/lib/api_client/gen';
import style from './news-item.module.css';
import { getFileUrl } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

export const formatNewsDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

export const NewsItem = ({ news }: { news: NewsEntity }) => {
    return (
        <Link href={`/${news.game_type}/news/${news.id}`} className={style.container}>
            <Image
                src={getFileUrl(news.image_url ?? '')}
                alt={news.title}
                width={517}
                height={162}
            />

            <p className={style.title}>{news.title}</p>
            <p className={style.description}>{news.short_description}</p>

            <p className={style.date}>{formatNewsDate(news.createdAt)}</p>
        </Link>
    );
};
