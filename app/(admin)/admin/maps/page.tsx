'use client';
import dynamic from 'next/dynamic';

const Component = dynamic(
    () => import('@/domain/admin/maps/maps-page').then((mod) => mod.MapsPage),
    {
        ssr: false,
    }
);

export default function Page() {
    return <Component />;
}
