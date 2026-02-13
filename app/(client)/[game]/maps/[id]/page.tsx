import { ClientMapDynamicWrapper } from '@/domain/ClientMapPage/ClientMapDynamicWrapper';
import { mapsControllerGetMap } from '@/lib/api_client/gen';
import { getServerClient } from '@/lib/api_client/server_client';
import { GameType } from '@/lib/enums/game_type.enum';
import { notFound } from 'next/navigation';

export default async function MapsViewPage({
    params,
}: {
    params: Promise<{ game: GameType; id: string }>;
}) {
    const { game, id } = await params;

    const mapResponse = await mapsControllerGetMap({
        client: await getServerClient(),
        path: {
            id: id,
        },
    });

    if (!mapResponse.data) {
        return notFound();
    }

    return <ClientMapDynamicWrapper game={game} map={mapResponse.data} />;
}
