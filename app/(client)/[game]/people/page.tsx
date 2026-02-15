import { GAME_TYPE_VALUES, GameType } from '@/lib/enums/game_type.enum';
import type { Metadata } from 'next';
import { buildSocialMetadata } from '@/lib/seo';
import { PeoplePage } from '@/domain/client/people/people-page';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ game: GameType }>;
}): Promise<Metadata> {
    const { game } = await params;
    const gameLabel = GAME_TYPE_VALUES.find((g) => g.value === game)?.label ?? game;
    const title = `Люди — ${gameLabel} | Distruct`;
    const description = `Игроки, команды и профили по ${gameLabel}.`;
    return {
        title,
        description,
        ...buildSocialMetadata(`/${game}/people`, title, description),
    };
}

export default async function Page({ params }: { params: Promise<{ game: GameType }> }) {
    const { game } = await params;

    return <PeoplePage game={game} />;
}
