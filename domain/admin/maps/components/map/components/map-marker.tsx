import { MapDataMarkerTypeDto } from '@/lib/api_client/gen';
import styles from './map-marker.module.css';
import { hexToRgba } from '@/lib/utils';
export const MapMarker = ({
    marker_type,
    color,
    draggable = false,
}: {
    marker_type: MapDataMarkerTypeDto;
    color: string;
    draggable?: boolean;
}) => {
    const isPoi = marker_type.is_point_of_interest;
    return (
        <div
            className={`${styles.icon} ${draggable ? styles.draggable : ''} ${isPoi ? styles.poi : ''}`}
            style={{
                ['--marker-shadow-color' as string]: color,
                ['--poi-zone-border-color' as string]: hexToRgba(color, 0.75),
                ['--poi-zone-fill-color' as string]: hexToRgba(color, 0.18),
                ['--poi-zone-glow-color' as string]: hexToRgba(color, 0.45),
            }}
        >
            <div dangerouslySetInnerHTML={{ __html: marker_type.icon }}></div>
        </div>
    );
};
