import { MapDataMarkerDto, MapDataMarkerTypeDto } from '@/lib/api_client/gen';
import styles from './map-marker.module.css';
export const MapMarker = ({
    data,
    marker_type,
    color,
    draggable = false,
}: {
    data: MapDataMarkerDto;
    marker_type: MapDataMarkerTypeDto;
    color: string;
    draggable?: boolean;
}) => {
    return (
        <div
            className={`${styles.icon} ${draggable ? styles.draggable : ''}`}
            style={{
                ['--marker-shadow-color' as string]: color,
            }}
        >
            <div dangerouslySetInnerHTML={{ __html: marker_type.icon }}></div>
        </div>
    );
};
