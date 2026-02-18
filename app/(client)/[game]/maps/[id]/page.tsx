import { ClientMapDynamicWrapper } from '@/domain/ClientMapPage/ClientMapDynamicWrapper';
import { mapsControllerGetMap } from '@/lib/api_client/gen';
import { getServerClient } from '@/lib/api_client/server_client';
import { GAME_TYPE_VALUES, GameType } from '@/lib/enums/game_type.enum';
import type { Metadata } from 'next';
import { buildSocialMetadata } from '@/lib/seo';
import { notFound } from 'next/navigation';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ game: GameType; id: string }>;
}): Promise<Metadata> {
    const { game, id } = await params;
    const gameLabel = GAME_TYPE_VALUES.find((g) => g.value === game)?.label ?? game;
    try {
        const mapResponse = await mapsControllerGetMap({
            client: await getServerClient(),
            path: { id },
        });
        if (mapResponse.data?.name) {
            const title = `${mapResponse.data.name} — ${gameLabel} | Distruct`;
            const description = `Карта ${mapResponse.data.name} для ${gameLabel}.`;
            return {
                title,
                description,
                ...buildSocialMetadata(`/${game}/maps/${id}`, title, description),
            };
        }
    } catch {
        // ignore
    }
    const title = `Карта — ${gameLabel} | Distruct`;
    const description = `Интерактивные карты для ${gameLabel}.`;
    return {
        title,
        description,
        ...buildSocialMetadata(`/${game}/maps/${id}`, title, description),
    };
}

export default async function MapsViewPage({
    params,
}: {
    params: Promise<{ game: GameType; id: string }>;
}) {
    const { id } = await params;

    const mapResponse = await mapsControllerGetMap({
        client: await getServerClient(),
        path: {
            id: id,
        },
    });

    if (!mapResponse.data) {
        return notFound();
    }

    return <ClientMapDynamicWrapper map={mapResponse.data} />;
}
