import { getCurrentUser } from '@/actions/user/getCurrentUser';
import { NewsIdPage } from '@/domain/client/news-id/news-id-page';
import { newsControllerGetAllNewsClient, newsControllerGetNewsById } from '@/lib/api_client/gen';
import { getServerClient } from '@/lib/api_client/server_client';

import { GAME_TYPE_VALUES, GameType } from '@/lib/enums/game_type.enum';
import type { Metadata } from 'next';
import { buildSocialMetadata } from '@/lib/seo';
import { notFound } from 'next/navigation';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ game: GameType; id: string }>;
}): Promise<Metadata> {
    const { id, game } = await params;
    const gameLabel = GAME_TYPE_VALUES.find((g) => g.value === game)?.label ?? game;
    try {
        const data = await newsControllerGetNewsById({
            path: { id },
            client: await getServerClient(),
        });
        if (data.data?.title) {
            const title = `${data.data.title} — ${gameLabel} | Distruct`;
            const description = data.data.short_description ?? `Новости по ${gameLabel}.`;
            return {
                title,
                description,
                ...buildSocialMetadata(`/${game}/news/${id}`, title, description, 'article'),
            };
        }
    } catch {
        // ignore
    }
    const title = `Новость — ${gameLabel} | Distruct`;
    const description = `Новости и обновления по ${gameLabel}.`;
    return {
        title,
        description,
        ...buildSocialMetadata(`/${game}/news/${id}`, title, description, 'article'),
    };
}

export default async function Page({
    params,
}: {
    params: Promise<{ game: GameType; id: string }>;
}) {
    const { id } = await params;

    const data = await newsControllerGetNewsById({
        path: {
            id,
        },
        client: await getServerClient(),
    });

    const user = await getCurrentUser();
    const authed = !!user;

    const recommendedNews = await newsControllerGetAllNewsClient({
        query: {
            game_type: data.data?.game_type,
            limit: 2,
            page: 1,
            exclude_ids: [id],
            sort: 'latest',
        },
        client: await getServerClient(),
    });

    if (!data.data) {
        return notFound();
    }

    return (
        <NewsIdPage data={data.data} recommendedNews={recommendedNews.data?.data} authed={authed} />
    );
}
