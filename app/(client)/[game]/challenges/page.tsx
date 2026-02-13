import { getCurrentUser } from '@/actions/user/getCurrentUser';
import { ChallengesMain } from '@/domain/client/challenges-main/challenges-main';
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
        <ChallengesMain
            game={game}
            season={currentSeason.data}
            seasonBalance={seasonBalance.data}
            authenticated={authenticated}
        />
    );
}
