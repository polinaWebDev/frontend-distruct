import { getCurrentUser } from '@/actions/user/getCurrentUser';
import { ChallengesRewards } from '@/domain/client/challenges-rewards/challenges-rewards';
import {
    seasonControllerGetCurrentSeason,
    seasonControllerGetCurrentSeasonBalance,
} from '@/lib/api_client/gen';
import { getServerClient } from '@/lib/api_client/server_client';
import { GameType } from '@/lib/enums/game_type.enum';
import { notFound } from 'next/navigation';

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
        <ChallengesRewards
            game={game}
            season={currentSeason.data}
            seasonBalance={seasonBalance.data}
            authenticated={authenticated}
        />
    );
}
