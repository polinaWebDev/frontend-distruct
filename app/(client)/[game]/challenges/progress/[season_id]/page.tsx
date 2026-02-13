import { ChallengesProgressList } from '@/domain/client/challenges-progress-list/challenges-progress-list';

import { GameType } from '@/lib/enums/game_type.enum';

export default async function Page({
    params,
}: {
    params: Promise<{ season_id: string; game: GameType }>;
}) {
    const { season_id, game } = await params;

    return <ChallengesProgressList game={game} season_id={season_id} />;
}
