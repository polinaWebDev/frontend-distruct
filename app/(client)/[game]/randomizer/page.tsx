import { GAME_TYPE_VALUES, GameType } from '@/lib/enums/game_type.enum';
import type { Metadata } from 'next';
import { buildSocialMetadata } from '@/lib/seo';
import { RandomizerPage } from '@/domain/Randomizer/RandomizerPage';
import {
    loadoutControllerGetRandomChallengeGroups,
    loadoutControllerGetRandomChallengesList,
} from '@/lib/api_client/gen';
import { getServerClient } from '@/lib/api_client/server_client';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ game: GameType }>;
}): Promise<Metadata> {
    const { game } = await params;
    const gameLabel = GAME_TYPE_VALUES.find((g) => g.value === game)?.label ?? game;
    const title = `Рандомайзер — ${gameLabel} | Distruct`;
    const description = `Сгенерируйте случайный челлендж для ${gameLabel}.`;
    return {
        title,
        description,
        ...buildSocialMetadata(`/${game}/randomizer`, title, description),
    };
}

export default async function Page({ params }: { params: Promise<{ game: GameType }> }) {
    const { game } = await params;

    const challengesResponse = await loadoutControllerGetRandomChallengesList({
        client: await getServerClient(),
        query: {
            game_type: game,
        },
    });

    const groupsResponse = await loadoutControllerGetRandomChallengeGroups({
        client: await getServerClient(),
        query: {
            game_type: game,
        },
    });

    return (
        <RandomizerPage
            groups={groupsResponse.data ?? []}
            game={game}
            challenges={challengesResponse.data ?? []}
        />
    );
}
