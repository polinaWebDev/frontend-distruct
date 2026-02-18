'use client';
import { MapDataResponseDto } from '@/lib/api_client/gen';
import dynamic from 'next/dynamic';

const Component = dynamic(() => import('./ClientMapPage').then((mod) => mod.ClientMapPage), {
    ssr: false,
});

export const ClientMapDynamicWrapper = ({ map }: { map: MapDataResponseDto }) => {
    return <Component map={map} />;
};
