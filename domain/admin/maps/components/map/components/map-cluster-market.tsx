import L, { MarkerCluster } from 'leaflet';
export const createClusterCustomIcon = function (cluster: MarkerCluster) {
    return L.divIcon({
        html: `<div class="custom-marker-cluster__inner"><span>${cluster.getChildCount()}</span></div>`,
        className: 'custom-marker-cluster',
        iconSize: L.point(40, 40, true),
        iconAnchor: [20, 20],
    });
};
