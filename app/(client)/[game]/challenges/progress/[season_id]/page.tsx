import { ChallengesProgressList } from '@/domain/client/challenges-progress-list/challenges-progress-list';

import { GAME_TYPE_VALUES, GameType } from '@/lib/enums/game_type.enum';
import type { Metadata } from 'next';
import { buildSocialMetadata } from '@/lib/seo';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ season_id: string; game: GameType }>;
}): Promise<Metadata> {
    const { game, season_id } = await params;
    const gameLabel = GAME_TYPE_VALUES.find((g) => g.value === game)?.label ?? game;
    const title = `Прогресс сезона — ${gameLabel} | Distruct`;
    const description = `Прогресс выполнения челленджей по ${gameLabel}.`;
    return {
        title,
        description,
        ...buildSocialMetadata(`/${game}/challenges/progress/${season_id}`, title, description),
    };
}

export default async function Page({
    params,
}: {
    params: Promise<{ season_id: string; game: GameType }>;
}) {
    const { season_id, game } = await params;

    return <ChallengesProgressList game={game} season_id={season_id} />;
}
