'use client';

import { MapDataMarkerDto, MapDataResponseDto } from '@/lib/api_client/gen';
import { Activity, useCallback, useState } from 'react';
import { MapRenderer } from '../admin/maps/components/map/map-renderer';
import { MapFilters } from '../admin/maps/components/map-overlay/map-filters/map-filters';
import { MapInfo } from '../admin/maps/components/map-overlay/map-info/map-info';
import { MarkMarkerInfo } from '../admin/maps/components/map-overlay/map-info/components/mark-marker-info/mark-marker-info';
import { MapFloorTabs } from '../admin/maps/components/map-overlay/map-floor-tabs/map-floor-tabs';
import { MapLevelTabs } from './components/map-level-tabs/map-level-tabs';

export const ClientMapPage = ({ map }: { map: MapDataResponseDto }) => {
    const [selectedTypeId, setSelectedTypeId] = useState<string | undefined>(undefined);

    const [selectedCategories, setSelectedCategories] = useState<string[]>(
        map.categories?.map((x) => x.id) ?? []
    );

    const [selectedFloorId, setSelectedFloorId] = useState<string | undefined>(map.floors?.[0]?.id);
    const [selectedLevelId, setSelectedLevelId] = useState<string | undefined>(map.levels?.[0]?.id);

    const [selectedMarker, setSelectedMarker] = useState<MapDataMarkerDto | undefined>(undefined);
    const handleMarkerClick = useCallback((marker: MapDataMarkerDto) => {
        setSelectedMarker(marker);
    }, []);

    return (
        <div className="w-full h-svh relative">
            <div className="w-full flex flex-1 h-full relative z-1">
                <MapRenderer
                    admin={false}
                    map_id={map.id}
                    map_data={map}
                    selectedTypeId={selectedTypeId}
                    selectedCategories={selectedCategories}
                    selectedFloorId={selectedFloorId}
                    selectedLevelId={selectedLevelId}
                    onMarkerClick={handleMarkerClick}
                />
            </div>
            <div className="absolute left-0 right-0 bottom-0 top-[var(--header-height)] z-[110] pointer-events-none">
                <div className="page_width_wrapper mx-auto h-full px-[var(--page-horizontal-padding)] relative">
                    {(map.levels?.length ?? 0) > 0 && (
                        <div className="absolute right-0 top-10 pointer-events-none">
                            <MapLevelTabs
                                levels={map.levels ?? []}
                                selectedLevelId={selectedLevelId}
                                onSelect={setSelectedLevelId}
                                inline
                                className="pointer-events-auto"
                            />
                        </div>
                    )}

                    <div className="absolute right-0 bottom-10 flex flex-col items-end gap-3 pointer-events-none">
                        {(map.floors?.length ?? 0) > 1 && (
                            <MapFloorTabs
                                floors={map.floors ?? []}
                                selectedFloorId={selectedFloorId}
                                onSelect={setSelectedFloorId}
                                inline
                                className="pointer-events-auto"
                            />
                        )}
                        <MapFilters
                            categories={map.categories ?? []}
                            onSelect={(x: string) => {
                                setSelectedCategories((prev) =>
                                    prev.includes(x) ? prev.filter((y) => y !== x) : [...prev, x]
                                );
                            }}
                            selected={selectedCategories}
                            inline
                            className="pointer-events-auto"
                        />
                    </div>

                    <div className="pointer-events-auto">
                        <Activity mode={selectedMarker ? 'hidden' : 'visible'}>
                            <MapInfo
                                admin={false}
                                map_data={map}
                                onSelectType={(x) => {
                                    setSelectedTypeId((prev) => (prev === x ? undefined : x));
                                }}
                                selectedTypeId={selectedTypeId}
                                selectedLevelId={selectedLevelId}
                            />
                        </Activity>
                    </div>
                </div>
            </div>

            {selectedMarker && (
                <MarkMarkerInfo
                    marker={selectedMarker}
                    levels={
                        selectedMarker.map_level_ids?.length
                            ? selectedMarker.map_level_ids
                                  .map((id) => map.levels?.find((level) => level.id === id))
                                  .filter((x): x is NonNullable<typeof x> => Boolean(x))
                            : undefined
                    }
                    onClose={() => setSelectedMarker(undefined)}
                />
            )}
        </div>
    );
};
