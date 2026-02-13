import { MapBtnIcon } from '@/lib/icons/MapBtnIcon';
import './map-info-btn.css';

export const MapInfoBtn = ({ text, onClick }: { text: string; onClick?: () => void }) => {
    return (
        <div className="map-info-btn" onClick={onClick}>
            <p>{text}</p>
            <MapBtnIcon />
        </div>
    );
};
