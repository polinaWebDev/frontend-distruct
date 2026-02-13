import { ClientMapList } from '@/domain/ClientMapList/ClientMapList';
import { mapsControllerGetMapList } from '@/lib/api_client/gen';
import { getServerClient } from '@/lib/api_client/server_client';
import { GameType } from '@/lib/enums/game_type.enum';

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
