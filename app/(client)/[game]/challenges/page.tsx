import { getCurrentUser } from '@/actions/user/getCurrentUser';
import { ChallengesMain } from '@/domain/client/challenges-main/challenges-main';
import {
    seasonControllerGetCurrentSeason,
    seasonControllerGetCurrentSeasonBalance,
} from '@/lib/api_client/gen';
import { getServerClient } from '@/lib/api_client/server_client';
import { GAME_TYPE_VALUES, GameType } from '@/lib/enums/game_type.enum';
import type { Metadata } from 'next';
import { buildSocialMetadata } from '@/lib/seo';
import { notFound } from 'next/navigation';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ game: GameType }>;
}): Promise<Metadata> {
    const { game } = await params;
    const gameLabel = GAME_TYPE_VALUES.find((g) => g.value === game)?.label ?? game;
    const title = `Челленджи — ${gameLabel} | Distruct`;
    const description = `Сезонные и пользовательские челленджи по ${gameLabel}.`;
    return {
        title,
        description,
        ...buildSocialMetadata(`/${game}/challenges`, title, description),
    };
}

export default async function Page({ params }: { params: Promise<{ game: GameType }> }) {
    const { game } = await params;

    const currentSeason = await seasonControllerGetCurrentSeason({
        client: await getServerClient(),
        query: {
            game_type: game,
        },
    });

    const user = await getCurrentUser();
    const authenticated = !!user;

    const seasonBalance = await seasonControllerGetCurrentSeasonBalance({
        client: await getServerClient(),
        query: {
            game_type: game,
        },
    });

    if (!currentSeason.data) {
        return notFound();
    }

    return (
        <ChallengesMain
            game={game}
            season={currentSeason.data}
            seasonBalance={seasonBalance.data}
            authenticated={authenticated}
        />
    );
}
