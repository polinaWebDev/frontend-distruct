'use client';
import { MapDataResponseDto } from '@/lib/api_client/gen';
import { GameType } from '@/lib/enums/game_type.enum';
import dynamic from 'next/dynamic';

const Component = dynamic(() => import('./ClientMapPage').then((mod) => mod.ClientMapPage), {
    ssr: false,
});

export const ClientMapDynamicWrapper = ({
    game,
    map,
}: {
    game: GameType;
    map: MapDataResponseDto;
}) => {
    return <Component game={game} map={map} />;
};
