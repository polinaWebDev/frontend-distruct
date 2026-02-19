import { getCurrentUser } from '@/actions/user/getCurrentUser';
import { ChallengesRewards } from '@/domain/client/challenges-rewards/challenges-rewards';
import {
    seasonControllerGetCurrentSeason,
    seasonControllerGetCurrentSeasonBalance,
} from '@/lib/api_client/gen';
import { getServerClient } from '@/lib/api_client/server_client';
import { GAME_TYPE_VALUES, GameType } from '@/lib/enums/game_type.enum';
import type { Metadata } from 'next';
import { buildSocialMetadata } from '@/lib/seo';
import { notFound } from 'next/navigation';
import { unstable_noStore as noStore } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ game: GameType }>;
}): Promise<Metadata> {
    const { game } = await params;
    const gameLabel = GAME_TYPE_VALUES.find((g) => g.value === game)?.label ?? game;
    const title = `Награды челленджей — ${gameLabel} | Distruct`;
    const description = `Награды и прогресс сезона по ${gameLabel}.`;
    return {
        title,
        description,
        ...buildSocialMetadata(`/${game}/challenges/rewards`, title, description),
    };
}

export default async function Page({ params }: { params: Promise<{ game: GameType }> }) {
    noStore();
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
        <ChallengesRewards
            game={game}
            season={currentSeason.data}
            seasonBalance={seasonBalance.data}
            authenticated={authenticated}
        />
    );
}
