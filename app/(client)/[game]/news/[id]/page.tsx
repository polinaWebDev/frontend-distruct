import { getCurrentUser } from '@/actions/user/getCurrentUser';
import { NewsIdPage } from '@/domain/client/news-id/news-id-page';
import { newsControllerGetAllNewsClient, newsControllerGetNewsById } from '@/lib/api_client/gen';
import { getServerClient } from '@/lib/api_client/server_client';

import { GameType } from '@/lib/enums/game_type.enum';
import { notFound } from 'next/navigation';

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
