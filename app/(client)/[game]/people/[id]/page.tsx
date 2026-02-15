import { GAME_TYPE_VALUES, GameType } from '@/lib/enums/game_type.enum';
import type { Metadata } from 'next';
import { buildSocialMetadata } from '@/lib/seo';
import { PublicProfilePage } from '@/domain/client/people/public-profile-page';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ game: GameType; id: string }>;
}): Promise<Metadata> {
    const { game } = await params;
    const gameLabel = GAME_TYPE_VALUES.find((g) => g.value === game)?.label ?? game;
    const title = `Профиль игрока — ${gameLabel} | Distruct`;
    const description = `Публичный профиль игрока в ${gameLabel}.`;
    return {
        title,
        description,
        ...buildSocialMetadata(`/${game}/people/${id}`, title, description),
    };
}

export default async function Page({
    params,
}: {
    params: Promise<{ game: GameType; id: string }>;
}) {
    const { game, id } = await params;

    return <PublicProfilePage userId={id} game={game} />;
}
