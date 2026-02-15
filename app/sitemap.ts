import type { MetadataRoute } from 'next';
import { GameType } from '@/lib/enums/game_type.enum';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? 'https://distruct.info';

const apiBase =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ??
    process.env.SERVER_API_URL?.replace(/\/$/, '');

const gameRoutes = ['news', 'challenges', 'maps', 'people', 'randomizer', 'tiers'] as const;

type NewsItem = {
    id: string;
    publish_at?: string | null;
    createdAt?: string | null;
};

const fetchNewsByGame = async (game: GameType) => {
    if (!apiBase) return [];
    const items: NewsItem[] = [];
    let page = 1;
    const limit = 100;
    for (let i = 0; i < 20; i += 1) {
        const url = new URL('/api/news/client/list', apiBase);
        url.searchParams.set('page', String(page));
        url.searchParams.set('limit', String(limit));
        url.searchParams.set('game_type', game);
        const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
        if (!res.ok) break;
        const data = await res.json();
        const pageItems = Array.isArray(data?.data) ? data.data : [];
        items.push(...pageItems);
        if (!pageItems.length || pageItems.length < limit) break;
        page += 1;
    }
    return items;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const now = new Date();
    const urls: MetadataRoute.Sitemap = [
        {
            url: siteUrl,
            lastModified: now,
        },
    ];

    const games = Object.values(GameType);
    games.forEach((game) => {
        gameRoutes.forEach((route) => {
            urls.push({
                url: `${siteUrl}/${game}/${route}`,
                lastModified: now,
            });
        });
    });

    const newsByGame = await Promise.all(games.map((game) => fetchNewsByGame(game)));
    newsByGame.forEach((newsList, idx) => {
        const game = games[idx];
        newsList.forEach((news) => {
            urls.push({
                url: `${siteUrl}/${game}/news/${news.id}`,
                lastModified: news.publish_at
                    ? new Date(news.publish_at)
                    : news.createdAt
                      ? new Date(news.createdAt)
                      : now,
            });
        });
    });

    return urls;
}
