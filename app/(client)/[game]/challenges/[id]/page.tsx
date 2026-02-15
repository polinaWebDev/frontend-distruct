import { ChallengePage } from '@/domain/client/challenge-page/challenge-page';
import { challengesClientControllerGetChallengeByIdWithProgress } from '@/lib/api_client/gen';
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
        const res = await challengesClientControllerGetChallengeByIdWithProgress({
            client: await getServerClient(),
            path: { id },
        });
        if (res.data?.title) {
            const title = `${res.data.title} — ${gameLabel} | Distruct`;
            const description = res.data.description ?? `Челленджи по ${gameLabel}.`;
            return {
                title,
                description,
                ...buildSocialMetadata(`/${game}/challenges/${id}`, title, description),
            };
        }
    } catch {
        // ignore
    }
    const title = `Челлендж — ${gameLabel} | Distruct`;
    const description = `Челленджи по ${gameLabel}.`;
    return {
        title,
        description,
        ...buildSocialMetadata(`/${game}/challenges/${id}`, title, description),
    };
}

export default async function Page({
    params,
}: {
    params: Promise<{ game: GameType; id: string }>;
}) {
    const { id } = await params;

    const res = await challengesClientControllerGetChallengeByIdWithProgress({
        client: await getServerClient(),
        path: {
            id: id,
        },
    });

    if (!res.data) {
        return notFound();
    }

    return <ChallengePage challenge={res.data} />;
}
