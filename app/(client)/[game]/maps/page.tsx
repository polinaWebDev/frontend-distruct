import { ClientMapList } from '@/domain/ClientMapList/ClientMapList';
import { mapsControllerGetMapList } from '@/lib/api_client/gen';
import { getServerClient } from '@/lib/api_client/server_client';
import { GAME_TYPE_VALUES, GameType } from '@/lib/enums/game_type.enum';
import type { Metadata } from 'next';
import { buildSocialMetadata } from '@/lib/seo';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ game: GameType }>;
}): Promise<Metadata> {
    const { game } = await params;
    const gameLabel = GAME_TYPE_VALUES.find((g) => g.value === game)?.label ?? game;
    const title = `Карты — ${gameLabel} | Distruct`;
    const description = `Интерактивные карты и локации для ${gameLabel}.`;
    return {
        title,
        description,
        ...buildSocialMetadata(`/${game}/maps`, title, description),
    };
}

export default async function MapsPage({ params }: { params: Promise<{ game: GameType }> }) {
    const { game } = await params;

    const mapsResponse = await mapsControllerGetMapList({
        query: {
            game_type: game,
        },
        client: await getServerClient(),
    });

    return <ClientMapList game={game} maps={mapsResponse.data ?? []} />;
}
