'use client';

import { MapDataMarkerDto, MapDataResponseDto } from '@/lib/api_client/gen';
import { GameType } from '@/lib/enums/game_type.enum';
import { Activity, useCallback, useState } from 'react';
import { MapRenderer } from '../admin/maps/components/map/map-renderer';
import { MapFilters } from '../admin/maps/components/map-overlay/map-filters/map-filters';
import { MapInfo } from '../admin/maps/components/map-overlay/map-info/map-info';
import { MarkMarkerInfo } from '../admin/maps/components/map-overlay/map-info/components/mark-marker-info/mark-marker-info';
import { MapFloorTabs } from '../admin/maps/components/map-overlay/map-floor-tabs/map-floor-tabs';

export const ClientMapPage = ({ map, game }: { map: MapDataResponseDto; game: GameType }) => {
    const [selectedTypeId, setSelectedTypeId] = useState<string | undefined>(undefined);

    const [selectedCategories, setSelectedCategories] = useState<string[]>(
        map.categories?.map((x) => x.id) ?? []
    );

    const [selectedFloorId, setSelectedFloorId] = useState<string | undefined>(map.floors?.[0]?.id);

    const [selectedMarker, setSelectedMarker] = useState<MapDataMarkerDto | undefined>(undefined);
    const handleMarkerClick = useCallback((marker: MapDataMarkerDto) => {
        setSelectedMarker(marker);
    }, []);

    console.log(map.floors);

    return (
        <div className="w-full h-svh relative">
            <div className="w-full flex flex-1 h-full relative z-1">
                {(map.floors?.length ?? 0) > 1 && (
                    <MapFloorTabs
                        floors={map.floors ?? []}
                        selectedFloorId={selectedFloorId}
                        onSelect={setSelectedFloorId}
                    />
                )}
                <MapRenderer
                    admin={false}
                    map_id={map.id}
                    map_data={map}
                    selectedTypeId={selectedTypeId}
                    selectedCategories={selectedCategories}
                    selectedFloorId={selectedFloorId}
                    onMarkerClick={handleMarkerClick}
                />
            </div>

            {selectedMarker && (
                <MarkMarkerInfo
                    marker={selectedMarker}
                    onClose={() => setSelectedMarker(undefined)}
                />
            )}

            <Activity mode={selectedMarker ? 'hidden' : 'visible'}>
                <MapInfo
                    admin={false}
                    map_data={map}
                    onSelectType={(x) => {
                        setSelectedTypeId((prev) => (prev === x ? undefined : x));
                    }}
                    selectedTypeId={selectedTypeId}
                />
            </Activity>

            <MapFilters
                categories={map.categories ?? []}
                onSelect={(x: string) => {
                    setSelectedCategories((prev) =>
                        prev.includes(x) ? prev.filter((y) => y !== x) : [...prev, x]
                    );
                }}
                selected={selectedCategories}
            />
        </div>
    );
};
