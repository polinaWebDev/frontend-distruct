import { MapDataMarkerDto, MapDataMarkerTypeDto } from '@/lib/api_client/gen';
import styles from './map-marker.module.css';
import { hexToRgba } from '@/lib/utils';
export const MapMarker = ({
    data,
    marker_type,
    color,
}: {
    data: MapDataMarkerDto;
    marker_type: MapDataMarkerTypeDto;
    color: string;
}) => {
    return (
        <div
            className={styles.container}
            style={{
                border: '1px solid ' + color,
                boxShadow: `0px 0px 23.899999618530273px 4px ${hexToRgba(color, 0.5)}`,
            }}
        >
            <div
                className={styles.icon}
                dangerouslySetInnerHTML={{ __html: marker_type.icon }}
            ></div>
        </div>
    );
};
