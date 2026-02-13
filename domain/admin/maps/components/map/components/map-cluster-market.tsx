import L, { MarkerCluster } from 'leaflet';
import styles from './map-cluster-marker.module.css';
export const createClusterCustomIcon = function (cluster: MarkerCluster) {
    return L.divIcon({
        html: `<span>${cluster.getChildCount()}</span>`,
        className: styles.customMarkerCluster,
        iconSize: L.point(33, 33, true),
    });
};
