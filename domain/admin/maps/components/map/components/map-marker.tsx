import { MapDataMarkerTypeDto } from '@/lib/api_client/gen';
import styles from './map-marker.module.css';
export const MapMarker = ({
    marker_type,
    color,
    draggable = false,
}: {
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
