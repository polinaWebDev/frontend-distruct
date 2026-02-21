'use client';
import 'leaflet/dist/leaflet.css';
import './map-renderer.css';
import { memo, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { MapContainer, Popup, TileLayer } from 'react-leaflet';
import { LatLng, Map, Marker as LeafletMarker } from 'leaflet';
import { MapDataMarkerDto, MapDataMarkerTypeDto, MapDataResponseDto } from '@/lib/api_client/gen';
import { Copy, Info, MapPinPlusInside, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateOrUpdateMarkerDialog } from '../../dialogs/create-or-update-marker.dialog';
import { MapMarker } from './components/map-marker';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { createClusterCustomIcon } from '@/domain/admin/maps/components/map/components/map-cluster-market';
import { EnhancedMarker } from './enhanced-marker';
import {
    mapsControllerGetMapQueryKey,
    mapsMarkerAdminControllerCreateMapMarkerMutation,
    mapsMarkerAdminControllerRemoveMapMarkerMutation,
    mapsMarkerAdminControllerUpdateMapMarkerMutation,
} from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { getPublicClient } from '@/lib/api_client/public_client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getFileUrl } from '@/lib/utils';

const updateMarkerCoordinates = (
    data: MapDataResponseDto,
    markerId: string,
    latitude: number,
    longitude: number
) => {
    if (!data.categories) return data;

    let updated = false;
    const categories = data.categories.map((category) => {
        if (!category.marker_types) return category;
        const marker_types = category.marker_types.map((markerType) => {
            if (!markerType.markers) return markerType;
            const markers = markerType.markers.map((marker) => {
                if (marker.id !== markerId) return marker;
                updated = true;
                return {
                    ...marker,
                    latitude,
                    longitude,
                };
            });
            return markers === markerType.markers ? markerType : { ...markerType, markers };
        });
        return marker_types === category.marker_types ? category : { ...category, marker_types };
    });

    return updated ? { ...data, categories } : data;
};

const removeMarkerFromMapData = (data: MapDataResponseDto, markerId: string) => {
    if (!data.categories) return data;

    let updated = false;
    const categories = data.categories.map((category) => {
        if (!category.marker_types) return category;
        let categoryUpdated = false;
        const marker_types = category.marker_types.map((markerType) => {
            if (!markerType.markers) return markerType;
            const markers = markerType.markers.filter((marker) => marker.id !== markerId);
            if (markers.length === markerType.markers.length) return markerType;
            updated = true;
            categoryUpdated = true;
            return { ...markerType, markers };
        });
        return categoryUpdated ? { ...category, marker_types } : category;
    });

    return updated ? { ...data, categories } : data;
};

const getMarkerLevelIds = (marker: MapDataMarkerDto) => marker.map_level_ids ?? [];
const DUPLICATE_MARKER_LONGITUDE_OFFSET = 0.00008;
const LONG_PRESS_UNLOCK_MS = 500;
type LeafletMarkerWithDraggableDown = LeafletMarker & {
    dragging?: {
        _draggable?: { _onDown?: (e: MouseEvent | TouchEvent) => void };
    };
};

const mapMarkerBodySerializer = (body: {
    name?: string;
    description?: string;
    latitude?: number;
    longitude?: number;
    type_id?: string;
    floor_id?: string;
    map_level_ids?: string[];
    map_id?: string;
    info_link?: string;
    is_locked?: boolean;
}) => {
    const data = new FormData();

    if (body.name !== undefined) data.append('name', body.name);
    if (body.description !== undefined) data.append('description', body.description);
    if (body.latitude !== undefined) data.append('latitude', String(body.latitude));
    if (body.longitude !== undefined) data.append('longitude', String(body.longitude));
    if (body.type_id !== undefined) data.append('type_id', body.type_id);
    if (body.floor_id !== undefined) data.append('floor_id', body.floor_id);
    if (body.map_level_ids) {
        body.map_level_ids.forEach((id) => data.append('map_level_ids[]', id));
    }
    if (body.map_id !== undefined) data.append('map_id', body.map_id);
    if (body.info_link !== undefined) data.append('info_link', body.info_link);
    if (body.is_locked !== undefined) {
        const lockedValue = body.is_locked ? '1' : '0';
        data.append('is_locked', lockedValue);
        data.append('isLocked', lockedValue);
    }

    return data;
};

const updateMarkerById = (
    data: MapDataResponseDto,
    markerId: string,
    updater: (marker: MapDataMarkerDto) => MapDataMarkerDto
) => {
    if (!data.categories) return data;

    let updated = false;
    const categories = data.categories.map((category) => {
        if (!category.marker_types) return category;
        const marker_types = category.marker_types.map((markerType) => {
            if (!markerType.markers) return markerType;
            const markers = markerType.markers.map((marker) => {
                if (marker.id !== markerId) return marker;
                updated = true;
                return updater(marker);
            });
            return markers === markerType.markers ? markerType : { ...markerType, markers };
        });
        return marker_types === category.marker_types ? category : { ...category, marker_types };
    });

    return updated ? { ...data, categories } : data;
};

export const MapRenderer = memo(
    ({
        map_id,
        map_data,
        admin,
        selectedTypeId,
        selectedCategories,
        selectedFloorId,
        selectedLevelId,
        onMarkerClick,
    }: {
        map_id: string;
        map_data: MapDataResponseDto;
        admin: boolean;
        selectedTypeId?: string;
        selectedCategories: string[];
        selectedFloorId?: string;
        selectedLevelId?: string;
        onMarkerClick?: (marker: MapDataMarkerDto) => void;
    }) => {
        const map = useRef<Map | null>(null);
        const longPressUnlockTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
        const isMapDraggingSuppressed = useRef(false);
        const [clickedLatLng, setClickedLatLng] = useState<LatLng | null>(null);
        const [createDialogOpen, setCreateDialogOpen] = useState(false);
        const queryClient = useQueryClient();
        const floors = useMemo(() => map_data.floors ?? [], [map_data.floors]);
        const activeFloorId = selectedFloorId ?? floors[0]?.id;
        const activeFloor = floors.find((floor) => floor.id === activeFloorId);
        const maxZoomOverride = activeFloor?.max_zoom ?? 0;
        const maxZoomValue =
            typeof maxZoomOverride === 'string' ? Number(maxZoomOverride) : maxZoomOverride;
        const maxNativeZoom = Number.isFinite(maxZoomValue) && maxZoomValue >= 0 ? maxZoomValue : 0;
        const maxZoom = maxNativeZoom;
        const minZoom = admin ? 0 : 2;
        const initialZoom = admin ? Math.min(3, maxZoom) : Math.min(3, maxZoom);
        const safeInitialZoom = initialZoom < minZoom ? minZoom : initialZoom;

        useEffect(() => {
            if (!map.current) return;
            map.current.setMinZoom(minZoom);
            map.current.setMaxZoom(maxZoom);
            if (map.current.getZoom() > maxZoom) {
                map.current.setZoom(maxZoom);
            }
            if (map.current.getZoom() < minZoom) {
                map.current.setZoom(minZoom);
            }
        }, [minZoom, maxZoom]);

        useEffect(() => {
            if (!map.current || admin) return;
            map.current.setZoom(safeInitialZoom);
        }, [admin, activeFloorId, safeInitialZoom]);

        const markers = useMemo(() => {
            const types =
                map_data.categories
                    ?.filter((x) => selectedCategories.includes(x.id))
                    ?.flatMap(
                        (x) => x.marker_types?.map((y) => ({ ...y, color: x.color })) ?? []
                    ) ?? [];

            const markers: {
                marker_type: MapDataMarkerTypeDto;
                marker: MapDataMarkerDto;
                color: string;
            }[] = [];
            for (const type of types) {
                if (selectedTypeId && selectedTypeId !== type.id) continue;

                type.markers?.forEach((marker) => {
                    const markerFloorId = marker.floor_id ?? floors[0]?.id;
                    if (activeFloorId && markerFloorId && markerFloorId !== activeFloorId) {
                        return;
                    }
                    const markerLevelIds = getMarkerLevelIds(marker);
                    if (
                        selectedLevelId &&
                        markerLevelIds.length > 0 &&
                        !markerLevelIds.includes(selectedLevelId)
                    ) {
                        return;
                    }
                    markers.push({
                        marker_type: type,
                        marker: marker,
                        color: type.color,
                    });
                });
            }

            return markers;
        }, [map_data, selectedTypeId, selectedCategories, activeFloorId, selectedLevelId, floors]);

        const clusterGroupKey = useMemo(() => {
            const categoriesKey = [...selectedCategories].sort().join(',');
            return `${activeFloorId ?? 'all-floors'}:${selectedTypeId ?? 'all-types'}:${selectedLevelId ?? 'all-levels'}:${categoriesKey}`;
        }, [activeFloorId, selectedCategories, selectedTypeId, selectedLevelId]);

        const available_types = useMemo(() => {
            return map_data.categories?.flatMap((category) => category.marker_types ?? []) ?? [];
        }, [map_data]);

        const tileSalt = useId();
        const updateMarkerMutation = useMutation({
            ...mapsMarkerAdminControllerUpdateMapMarkerMutation({
                client: getPublicClient(),
            }),
            onMutate: async (variables) => {
                const queryKey = mapsControllerGetMapQueryKey({
                    path: { id: map_id },
                    client: getPublicClient(),
                });
                await queryClient.cancelQueries({ queryKey });
                const previousData = queryClient.getQueryData<MapDataResponseDto>(queryKey);
                if (previousData) {
                    if (variables.body.is_locked !== undefined) {
                        queryClient.setQueryData<MapDataResponseDto>(
                            queryKey,
                            updateMarkerById(previousData, variables.path.id, (marker) => ({
                                ...marker,
                                is_locked: variables.body.is_locked ?? marker.is_locked,
                            }))
                        );
                    } else if (
                        variables.body.latitude !== undefined &&
                        variables.body.longitude !== undefined
                    ) {
                        queryClient.setQueryData<MapDataResponseDto>(
                            queryKey,
                            updateMarkerCoordinates(
                                previousData,
                                variables.path.id,
                                variables.body.latitude,
                                variables.body.longitude
                            )
                        );
                    }
                }
                return { previousData, queryKey };
            },
            onError: (_error, _variables, context) => {
                if (context?.previousData && context.queryKey) {
                    queryClient.setQueryData(context.queryKey, context.previousData);
                }
            },
            onSettled: (_data, _error, _variables, context) => {
                if (context?.queryKey) {
                    queryClient.invalidateQueries({ queryKey: context.queryKey });
                }
            },
        });
        const duplicateMarkerMutation = useMutation({
            ...mapsMarkerAdminControllerCreateMapMarkerMutation({
                client: getPublicClient(),
            }),
            onMutate: () => {
                toast.loading('Дублирование метки...', { id: 'duplicate-marker-toast' });
            },
            onSuccess: () => {
                toast.success('Метка продублирована');
            },
            onError: (error) => {
                console.error(error);
                toast.error('Ошибка при дублировании метки');
            },
            onSettled: () => {
                queryClient.invalidateQueries({
                    queryKey: mapsControllerGetMapQueryKey({
                        path: { id: map_id },
                        client: getPublicClient(),
                    }),
                });
                toast.dismiss('duplicate-marker-toast');
            },
        });
        const removeMarkerMutation = useMutation({
            ...mapsMarkerAdminControllerRemoveMapMarkerMutation({
                client: getPublicClient(),
            }),
            onMutate: async (variables) => {
                const queryKey = mapsControllerGetMapQueryKey({
                    path: { id: map_id },
                    client: getPublicClient(),
                });
                await queryClient.cancelQueries({ queryKey });
                const previousData = queryClient.getQueryData<MapDataResponseDto>(queryKey);
                if (previousData) {
                    queryClient.setQueryData<MapDataResponseDto>(
                        queryKey,
                        removeMarkerFromMapData(previousData, variables.body.id)
                    );
                }
                return { previousData, queryKey };
            },
            onError: (_error, _variables, context) => {
                if (context?.previousData && context.queryKey) {
                    queryClient.setQueryData(context.queryKey, context.previousData);
                }
                toast.error('Ошибка при удалении метки');
            },
            onSuccess: () => {
                toast.success('Метка удалена');
            },
            onSettled: (_data, _error, _variables, context) => {
                if (context?.queryKey) {
                    queryClient.invalidateQueries({ queryKey: context.queryKey });
                }
            },
        });

        const iconCreateFunction = useCallback(
            (...args: Parameters<typeof createClusterCustomIcon>) =>
                createClusterCustomIcon(...args),
            []
        );
        const shouldUseClusters = !admin && !selectedTypeId;
        const suppressMapDragging = useCallback(() => {
            if (!map.current || isMapDraggingSuppressed.current) return;
            map.current.dragging.disable();
            isMapDraggingSuppressed.current = true;
        }, []);

        const restoreMapDragging = useCallback(() => {
            if (!map.current || !isMapDraggingSuppressed.current) return;
            map.current.dragging.enable();
            isMapDraggingSuppressed.current = false;
        }, []);

        const clearLongPressUnlock = useCallback(
            (markerId: string, shouldRestoreMapDragging = true) => {
                const timer = longPressUnlockTimers.current[markerId];
                if (!timer) {
                    if (shouldRestoreMapDragging) restoreMapDragging();
                    return;
                }
                clearTimeout(timer);
                delete longPressUnlockTimers.current[markerId];
                if (shouldRestoreMapDragging) restoreMapDragging();
            },
            [restoreMapDragging]
        );

        const startLongPressUnlock = useCallback(
            (
                marker: MapDataMarkerDto,
                markerNode?: LeafletMarker | null,
                downEvent?: MouseEvent | TouchEvent
            ) => {
                if (!admin || !marker.is_locked || updateMarkerMutation.isPending) return;
                suppressMapDragging();
                clearLongPressUnlock(marker.id, false);
                longPressUnlockTimers.current[marker.id] = setTimeout(() => {
                    updateMarkerMutation.mutate({
                        path: { id: marker.id },
                        body: { is_locked: false },
                    });
                    markerNode?.dragging?.enable();
                    const draggable = (markerNode as LeafletMarkerWithDraggableDown)?.dragging
                        ?._draggable;
                    draggable?._onDown?.(downEvent as MouseEvent | TouchEvent);
                    toast.success('Метка разблокирована');
                    clearLongPressUnlock(marker.id, false);
                }, LONG_PRESS_UNLOCK_MS);
            },
            [admin, clearLongPressUnlock, suppressMapDragging, updateMarkerMutation]
        );

        useEffect(() => {
            const timers = longPressUnlockTimers.current;
            return () => {
                Object.keys(timers).forEach((markerId) => {
                    const timer = timers[markerId];
                    if (!timer) return;
                    clearTimeout(timer);
                    delete timers[markerId];
                });
                restoreMapDragging();
            };
        }, [restoreMapDragging]);

        const handleMarkerDragEnd = useCallback(
            (marker: MapDataMarkerDto, latlng: LatLng) => {
                if (!admin || marker.is_locked) return;
                updateMarkerMutation.mutate({
                    path: { id: marker.id },
                    body: {
                        latitude: latlng.lat,
                        longitude: latlng.lng,
                    },
                });
            },
            [admin, updateMarkerMutation]
        );

        const handleRemoveMarker = useCallback(
            (markerId: string) => {
                if (!admin) return;
                if (!confirm('Удалить метку?')) return;
                removeMarkerMutation.mutate({
                    body: { id: markerId },
                });
            },
            [admin, removeMarkerMutation]
        );
        const handleDuplicateMarker = useCallback(
            (marker: MapDataMarkerDto) => {
                if (!admin) return;

                const fallbackLevelId = selectedLevelId ?? map_data.levels?.[0]?.id;
                const mapLevelIds = marker.map_level_ids?.length
                    ? marker.map_level_ids
                    : fallbackLevelId
                      ? [fallbackLevelId]
                      : [];

                if (!mapLevelIds.length) {
                    toast.error('Нельзя продублировать метку без выбранной сложности');
                    return;
                }

                duplicateMarkerMutation.mutate({
                    body: {
                        name: marker.name,
                        latitude: marker.latitude,
                        longitude: marker.longitude + DUPLICATE_MARKER_LONGITUDE_OFFSET,
                        type_id: marker.type_id,
                        floor_id: marker.floor_id ?? activeFloorId,
                        map_level_ids: mapLevelIds,
                        map_id,
                        info_link: marker.info_link ?? undefined,
                        is_locked: marker.is_locked,
                    },
                    bodySerializer: mapMarkerBodySerializer,
                });
            },
            [
                admin,
                selectedLevelId,
                map_data.levels,
                duplicateMarkerMutation,
                activeFloorId,
                map_id,
            ]
        );

        return (
            <MapContainer
                center={[0, 0]}
                zoom={safeInitialZoom}
                minZoom={minZoom}
                maxZoom={maxZoom}
                scrollWheelZoom={false}
                className="w-full h-full !bg-background"
                zoomSnap={1}
                // zoomDelta={100}
                wheelPxPerZoomLevel={30}
                attributionControl={false}
                ref={(ref) => {
                    map.current = ref;

                    if (!ref) return;
                    ref.scrollWheelZoom.enable();
                    ref.addEventListener('click', (e) => {
                        if (!admin) return;
                        setClickedLatLng(e.latlng);
                    });
                }}
                zoomControl={false}
            >
                <TileLayer
                    url={`${getFileUrl(
                        `maps/${map_id}${activeFloorId ? `/floors/${activeFloorId}` : ''}/{z}-{x}-{y}.webp`
                    )}?random=${tileSalt}`}
                    maxZoom={maxZoom}
                    minZoom={minZoom}
                    minNativeZoom={0}
                    tileSize={256}
                    maxNativeZoom={maxNativeZoom}
                    noWrap
                    eventHandlers={{
                        click: (e) => {
                            console.log(e);
                        },
                    }}
                />

                {admin ? (
                    <>
                        {markers.map((marker) => (
                            <EnhancedMarker
                                position={[marker.marker.latitude, marker.marker.longitude]}
                                key={marker.marker.id}
                                draggable={!marker.marker.is_locked}
                                eventHandlers={{
                                    click: (e) => {
                                        if (!admin) {
                                            onMarkerClick?.(marker.marker);
                                        }
                                        console.log(e);
                                    },
                                    mousedown: (e) => {
                                        startLongPressUnlock(
                                            marker.marker,
                                            e.target as LeafletMarker,
                                            e.originalEvent as MouseEvent
                                        );
                                    },
                                    mouseup: () => {
                                        clearLongPressUnlock(marker.marker.id);
                                    },
                                    mouseout: () => {
                                        clearLongPressUnlock(marker.marker.id);
                                    },
                                    touchstart: (e) => {
                                        startLongPressUnlock(
                                            marker.marker,
                                            e.target as LeafletMarker,
                                            e.originalEvent as TouchEvent
                                        );
                                    },
                                    touchend: () => {
                                        clearLongPressUnlock(marker.marker.id);
                                    },
                                    touchcancel: () => {
                                        clearLongPressUnlock(marker.marker.id);
                                    },
                                    dragend: (e) => {
                                        const target = e.target as LeafletMarker;
                                        handleMarkerDragEnd(marker.marker, target.getLatLng());
                                        restoreMapDragging();
                                    },
                                }}
                                icon={
                                    <MapMarker
                                        marker_type={marker.marker_type}
                                        color={marker.color}
                                        draggable={!marker.marker.is_locked}
                                        showLockBadge={marker.marker.is_locked}
                                    />
                                }
                            >
                                <Popup className="!bg-map-overlay-bg">
                                    {/* <div className="w-fit h-fit p-2 rounded-sm bg-black"> */}
                                    <p className="text-sm font-medium text-white">
                                        {marker.marker.name}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <CreateOrUpdateMarkerDialog
                                            key={marker.marker.id}
                                            cords={
                                                new LatLng(
                                                    marker.marker.latitude,
                                                    marker.marker.longitude
                                                )
                                            }
                                            map_id={map_id}
                                            available_types={available_types}
                                            floors={floors}
                                            levels={map_data.levels ?? []}
                                            selectedFloorId={activeFloorId}
                                            marker_data={marker.marker}
                                            marker_id={marker.marker.id}
                                        />

                                        <Button
                                            size={'icon'}
                                            onClick={() => onMarkerClick?.(marker.marker)}
                                        >
                                            <Info />
                                        </Button>
                                        <Button
                                            size={'icon'}
                                            variant="secondary"
                                            disabled={duplicateMarkerMutation.isPending}
                                            onClick={() => handleDuplicateMarker(marker.marker)}
                                            aria-label="Дублировать метку"
                                            title="Дублировать метку"
                                        >
                                            <Copy />
                                        </Button>
                                        <Button
                                            size={'icon'}
                                            variant="destructive"
                                            disabled={removeMarkerMutation.isPending}
                                            onClick={() => handleRemoveMarker(marker.marker.id)}
                                        >
                                            <Trash2 />
                                        </Button>
                                    </div>
                                </Popup>
                            </EnhancedMarker>
                        ))}
                    </>
                ) : shouldUseClusters ? (
                    <MarkerClusterGroup
                        key={clusterGroupKey}
                        iconCreateFunction={iconCreateFunction}
                        animate
                        animateAddingMarkers
                        disableClusteringAtZoom={maxZoom}
                        spiderfyOnMaxZoom={false}
                        showCoverageOnHover={false}
                    >
                        {markers.map((marker) => (
                            <EnhancedMarker
                                position={[marker.marker.latitude, marker.marker.longitude]}
                                key={marker.marker.id}
                                eventHandlers={{
                                    click: (e) => {
                                        onMarkerClick?.(marker.marker);
                                        console.log(e);
                                    },
                                }}
                                icon={
                                    <MapMarker
                                        marker_type={marker.marker_type}
                                        color={marker.color}
                                    />
                                }
                            />
                        ))}
                    </MarkerClusterGroup>
                ) : (
                    <>
                        {markers.map((marker) => (
                            <EnhancedMarker
                                position={[marker.marker.latitude, marker.marker.longitude]}
                                key={marker.marker.id}
                                eventHandlers={{
                                    click: (e) => {
                                        onMarkerClick?.(marker.marker);
                                        console.log(e);
                                    },
                                }}
                                icon={
                                    <MapMarker
                                        marker_type={marker.marker_type}
                                        color={marker.color}
                                    />
                                }
                            />
                        ))}
                    </>
                )}

                {clickedLatLng && admin && (
                    <>
                        <EnhancedMarker
                            position={clickedLatLng}
                            icon={
                                <div className="!bg-transparent flex items-center justify-center size-8 p-2 rounded-sm">
                                    <Button size={'icon'} className="cursor-pointer">
                                        <MapPinPlusInside className="object-contain w-full" />
                                    </Button>
                                </div>
                            }
                            eventHandlers={{
                                click: () => {
                                    setCreateDialogOpen(true);
                                },
                            }}
                        />
                        <CreateOrUpdateMarkerDialog
                            key={clickedLatLng.toString()}
                            cords={clickedLatLng}
                            map_id={map_id}
                            available_types={available_types}
                            floors={floors}
                            levels={map_data.levels ?? []}
                            selectedFloorId={activeFloorId}
                            open={createDialogOpen}
                            onOpenChange={setCreateDialogOpen}
                            hideTrigger
                        />
                    </>
                )}
            </MapContainer>
        );
    }
);

MapRenderer.displayName = 'MapRenderer';
