'use client';
import 'leaflet/dist/leaflet.css';
import './map-renderer.css';
import { memo, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { MapContainer, Popup, TileLayer } from 'react-leaflet';
import { LatLng, Map, Marker as LeafletMarker } from 'leaflet';
import { MapDataMarkerDto, MapDataMarkerTypeDto, MapDataResponseDto } from '@/lib/api_client/gen';
import { Info, MapPinPlusInside, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateOrUpdateMarkerDialog } from '../../dialogs/create-or-update-marker.dialog';
import { MapMarker } from './components/map-marker';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { createClusterCustomIcon } from '@/domain/admin/maps/components/map/components/map-cluster-market';
import { EnhancedMarker } from './enhanced-marker';
import {
    mapsControllerGetMapQueryKey,
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

export const MapRenderer = memo(
    ({
        map_id,
        map_data,
        admin,
        selectedTypeId,
        selectedCategories,
        selectedFloorId,
        onMarkerClick,
    }: {
        map_id: string;
        map_data: MapDataResponseDto;
        admin: boolean;
        selectedTypeId?: string;
        selectedCategories: string[];
        selectedFloorId?: string;
        onMarkerClick?: (marker: MapDataMarkerDto) => void;
    }) => {
        const map = useRef<Map | null>(null);
        const [clickedLatLng, setClickedLatLng] = useState<LatLng | null>(null);
        const [createDialogOpen, setCreateDialogOpen] = useState(false);
        const queryClient = useQueryClient();
        const floors = map_data.floors ?? [];
        const activeFloorId = selectedFloorId ?? floors[0]?.id;
        const activeFloor = floors.find((floor) => floor.id === activeFloorId);
        const maxZoomOverride = activeFloor?.max_zoom ?? 0;
        const maxZoomValue =
            typeof maxZoomOverride === 'string' ? Number(maxZoomOverride) : maxZoomOverride;
        const maxNativeZoom = Number.isFinite(maxZoomValue) && maxZoomValue >= 0 ? maxZoomValue : 0;
        const maxZoom = maxNativeZoom;
        const minZoom = 0;
        const initialZoom = Math.min(3, maxZoom);
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
                    markers.push({
                        marker_type: type,
                        marker: marker,
                        color: type.color,
                    });
                });
            }

            return markers;
        }, [map_data, selectedTypeId, selectedCategories, activeFloorId]);

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
                    queryClient.setQueryData<MapDataResponseDto>(
                        queryKey,
                        updateMarkerCoordinates(
                            previousData,
                            variables.body.id,
                            variables.body.latitude,
                            variables.body.longitude
                        )
                    );
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

        const iconCreateFunction = useCallback(createClusterCustomIcon, []);

        const handleMarkerDragEnd = useCallback(
            (marker: MapDataMarkerDto, latlng: LatLng) => {
                if (!admin) return;
                updateMarkerMutation.mutate({
                    body: {
                        id: marker.id,
                        name: marker.name,
                        description: marker.description ?? '',
                        latitude: latlng.lat,
                        longitude: latlng.lng,
                        type_id: marker.type_id,
                        floor_id: marker.floor_id ?? activeFloorId,
                        map_id: map_id,
                        info_link: marker.info_link ?? undefined,
                    },
                });
            },
            [admin, map_id, updateMarkerMutation, activeFloorId]
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
                                draggable
                                eventHandlers={{
                                    click: (e) => {
                                        if (!admin) {
                                            onMarkerClick?.(marker.marker);
                                        }
                                        console.log(e);
                                    },
                                    dragend: (e) => {
                                        const target = e.target as LeafletMarker;
                                        handleMarkerDragEnd(marker.marker, target.getLatLng());
                                    },
                                }}
                                icon={
                                    <MapMarker
                                        data={marker.marker}
                                        marker_type={marker.marker_type}
                                        color={marker.color}
                                        draggable
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
                ) : (
                    <MarkerClusterGroup
                        iconCreateFunction={iconCreateFunction}
                        disableClusteringAtZoom={4}
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
                                        data={marker.marker}
                                        marker_type={marker.marker_type}
                                        color={marker.color}
                                    />
                                }
                            />
                        ))}
                    </MarkerClusterGroup>
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
