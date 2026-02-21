'use client';
import { GameSelector } from '@/components/admin/GameSelector';

import {
    mapsControllerGetMapListOptions,
    mapsControllerGetMapOptions,
} from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { getPublicClient } from '@/lib/api_client/public_client';
import { useAdminGameTypeContext } from '@/domain/admin/context/admin-game-type-context';
import { useQuery } from '@tanstack/react-query';
import { Activity, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapDataMarkerDto, MapListResponseDto } from '@/lib/api_client/gen';

import { Map } from 'leaflet';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { EyeIcon, EyeOffIcon, PencilIcon, PlusIcon } from 'lucide-react';
import { CreateMapDialog } from './dialogs/create-map.dialog';
import { RemoveMapDialog } from './dialogs/remove-map.dialog';
import { MapRenderer } from './components/map/map-renderer';
import { MapInfo } from './components/map-overlay/map-info/map-info';
import { UploadMapTileDialog } from './dialogs/upload-map-tile.dialog';
import { MapFilters } from './components/map-overlay/map-filters/map-filters';
import { MarkMarkerInfo } from './components/map-overlay/map-info/components/mark-marker-info/mark-marker-info';
import { MapFloorTabs } from '@/domain/admin/maps/components/map-overlay/map-floor-tabs/map-floor-tabs';
import { MapLevelTabs } from '@/domain/admin/maps/components/map-overlay/map-level-tabs/map-level-tabs';
import { CreateMapFloorDialog } from '@/domain/admin/maps/dialogs/create-map-floor.dialog';
import { CreateMapLevelDialog } from '@/domain/admin/maps/dialogs/create-map-level.dialog';
export const MapsPage = () => {
    const { gameType, setGameType } = useAdminGameTypeContext();
    const [isCreateMapOpen, setIsCreateMapOpen] = useState(false);
    const [selectedMap, setSelectedMap] = useState<MapListResponseDto | undefined>(undefined);
    const [showAdminControls, setShowAdminControls] = useState(true);

    const [mapToEdit, setMapToEdit] = useState<MapListResponseDto | undefined>(undefined);

    const [selectedTypeId, setSelectedTypeId] = useState<string | undefined>(undefined);

    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    const [selectedFloorId, setSelectedFloorId] = useState<string | undefined>(undefined);
    const [selectedLevelId, setSelectedLevelId] = useState<string | undefined>(undefined);

    const [selectedMarker, setSelectedMarker] = useState<MapDataMarkerDto | undefined>(undefined);
    const handleMarkerClick = useCallback((marker: MapDataMarkerDto) => {
        setSelectedMarker(marker);
    }, []);

    const map = useRef<Map | null>(null);

    const { data } = useQuery({
        ...mapsControllerGetMapListOptions({
            client: getPublicClient(),
            query: {
                game_type: gameType,
            },
        }),
    });

    const { data: fullMapDataRes } = useQuery({
        ...mapsControllerGetMapOptions({
            client: getPublicClient(),
            path: {
                id: selectedMap?.id ?? '',
            },
        }),
        enabled: !!selectedMap?.id,
    });

    const mapData = useMemo(() => {
        return data ?? [];
    }, [data]);

    useEffect(() => {
        console.log('render');
        if (selectedMap) {
            const map = mapData.find((x) => x.id === selectedMap.id);
            if (map) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setSelectedTypeId(undefined);
            } else {
                setSelectedMap(undefined);
                setSelectedTypeId(undefined);
            }
        }
    }, [mapData]);

    useEffect(() => {
        if (fullMapDataRes) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSelectedCategories(fullMapDataRes.categories?.map((x) => x.id) ?? []);
            if (fullMapDataRes.floors?.length) {
                const hasSelected = fullMapDataRes.floors.some(
                    (floor) => floor.id === selectedFloorId
                );
                if (!hasSelected) {
                    setSelectedFloorId(fullMapDataRes.floors[0].id);
                }
            } else {
                setSelectedFloorId(undefined);
            }
            if (fullMapDataRes.levels?.length) {
                const hasSelectedLevel = fullMapDataRes.levels.some(
                    (level) => level.id === selectedLevelId
                );
                if (!hasSelectedLevel) {
                    setSelectedLevelId(fullMapDataRes.levels[0].id);
                }
            } else {
                setSelectedLevelId(undefined);
            }
        }
    }, [fullMapDataRes, selectedFloorId, selectedLevelId]);

    return (
        <div className="w-full mx-auto py-8 space-y-6 h-full">
            <div className="flex justify-between items-center w-full relative z-2">
                <div className="flex items-center gap-2">
                    <Select
                        value={selectedMap?.id ?? ''}
                        onValueChange={(value) => {
                            const map = mapData.find((x) => x.id === value);
                            if (map) {
                                setSelectedMap(map);
                            }
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue className="w-fit" placeholder="Выберите карту" />
                        </SelectTrigger>
                        <SelectContent>
                            {mapData.map((map) => (
                                <SelectItem key={map.id} value={map.id}>
                                    {map.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div className="flex justify-end gap-2">
                        <RemoveMapDialog id={selectedMap?.id} game_type={gameType} />
                        <Button onClick={() => setIsCreateMapOpen(true)}>
                            <PlusIcon />
                        </Button>
                        <Button onClick={() => setMapToEdit(selectedMap)}>
                            <PencilIcon />
                        </Button>
                        {selectedMap && (
                            <UploadMapTileDialog
                                map_id={selectedMap.id}
                                floors={fullMapDataRes?.floors ?? []}
                                selectedFloorId={selectedFloorId}
                            />
                        )}
                        {selectedMap && <CreateMapFloorDialog map_id={selectedMap.id} />}
                        {selectedMap && (
                            <CreateMapLevelDialog
                                map_id={selectedMap.id}
                                levels={fullMapDataRes?.levels ?? []}
                            />
                        )}

                        <Button
                            size={'icon'}
                            variant={'ghost'}
                            onClick={() => setShowAdminControls(!showAdminControls)}
                        >
                            {showAdminControls ? <EyeOffIcon /> : <EyeIcon />}
                        </Button>
                    </div>
                </div>
                <GameSelector value={gameType} onChange={setGameType} />
            </div>

            {selectedMap && fullMapDataRes && (
                <div className="w-full flex flex-col gap-4 h-full relative z-1">
                    <div className="w-full flex flex-1 h-full relative z-1">
                        <MapRenderer
                            admin={showAdminControls}
                            map_id={selectedMap.id}
                            map_data={fullMapDataRes}
                            selectedTypeId={selectedTypeId}
                            selectedCategories={selectedCategories}
                            selectedFloorId={selectedFloorId}
                            selectedLevelId={selectedLevelId}
                            onMarkerClick={handleMarkerClick}
                        />
                    </div>
                    <div className="absolute right-10 bottom-10 z-[110] flex flex-col items-end gap-3 pointer-events-none">
                        {(fullMapDataRes.levels?.length ?? 0) > 0 && (
                            <MapLevelTabs
                                levels={fullMapDataRes.levels ?? []}
                                selectedLevelId={selectedLevelId}
                                onSelect={setSelectedLevelId}
                                admin={showAdminControls}
                                mapId={selectedMap.id}
                                inline
                                className="pointer-events-auto -translate-y-[30%]"
                            />
                        )}
                        <MapFloorTabs
                            floors={fullMapDataRes.floors ?? []}
                            selectedFloorId={selectedFloorId}
                            onSelect={setSelectedFloorId}
                            admin={showAdminControls}
                            mapId={selectedMap.id}
                            inline
                            className="pointer-events-auto -translate-y-[30%]"
                        />
                        <MapFilters
                            categories={fullMapDataRes.categories ?? []}
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
                    {selectedMarker && (
                        <MarkMarkerInfo
                            marker={selectedMarker}
                            levels={
                                selectedMarker.map_level_ids?.length
                                    ? selectedMarker.map_level_ids
                                          .map((id) =>
                                              fullMapDataRes.levels?.find(
                                                  (level) => level.id === id
                                              )
                                          )
                                          .filter((x): x is NonNullable<typeof x> => Boolean(x))
                                    : undefined
                            }
                            onClose={() => setSelectedMarker(undefined)}
                        />
                    )}
                    <Activity mode={selectedMarker ? 'hidden' : 'visible'}>
                        <MapInfo
                            admin={showAdminControls}
                            map_data={fullMapDataRes}
                            onSelectType={(x) => {
                                setSelectedTypeId((prev) => (prev === x ? undefined : x));
                            }}
                            selectedTypeId={selectedTypeId}
                            selectedLevelId={selectedLevelId}
                        />
                    </Activity>
                </div>
            )}

            <CreateMapDialog open={isCreateMapOpen} onOpenChange={setIsCreateMapOpen} />
            <CreateMapDialog
                key={mapToEdit?.id ?? 'none'}
                open={!!mapToEdit}
                onOpenChange={() => setMapToEdit(undefined)}
                map_data={mapToEdit}
            />
        </div>
    );
};
