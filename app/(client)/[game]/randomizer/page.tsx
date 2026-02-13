import { GameType } from '@/lib/enums/game_type.enum';
import { RandomizerPage } from '@/domain/Randomizer/RandomizerPage';
import {
    loadoutControllerGetRandomChallengeGroups,
    loadoutControllerGetRandomChallengesList,
} from '@/lib/api_client/gen';
import { getServerClient } from '@/lib/api_client/server_client';

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
