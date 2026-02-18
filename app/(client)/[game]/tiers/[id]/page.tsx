import { GAME_TYPE_VALUES, GameType } from '@/lib/enums/game_type.enum';
import type { Metadata } from 'next';
import { buildSocialMetadata } from '@/lib/seo';
import { TiersPublicPage } from '@/domain/client/tiers/tiers-public-page';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ game: GameType; id: string }>;
}): Promise<Metadata> {
    const { game, id } = await params;
    const gameLabel = GAME_TYPE_VALUES.find((g) => g.value === game)?.label ?? game;
    const title = `Тир-лист — ${gameLabel} | Distruct`;
    const description = `Публичный тир-лист по ${gameLabel}.`;
    return {
        title,
        description,
        ...buildSocialMetadata(`/${game}/tiers/${id}`, title, description),
    };
}

export default async function Page({
    params,
}: {
    params: Promise<{ game: GameType; id: string }>;
}) {
    const { id, game } = await params;

    return <TiersPublicPage tierListId={id} game={game} />;
}
