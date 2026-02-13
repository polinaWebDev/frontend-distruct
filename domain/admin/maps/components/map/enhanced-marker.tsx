import React, { useState, useId, useMemo, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Marker, MarkerProps } from 'react-leaflet';
import L from 'leaflet';

interface EnhancedMarkerProps extends Omit<MarkerProps, 'icon'> {
    icon: ReactNode;
}

export const EnhancedMarker: React.FC<EnhancedMarkerProps> = ({
    icon: reactIcon,
    eventHandlers,
    ...props
}) => {
    const [markerRendered, setMarkerRendered] = useState(false);
    const id = 'marker-' + useId();

    const icon = useMemo(
        () =>
            L.divIcon({
                html: `<div id="${id}" class="!bg-transparent relative translate-x-[-50%] translate-y-[-50%]"></div>`,
                className: '!bg-transparent !border-0',
                iconSize: [0, 0],
            }),
        [id]
    );

    return (
        <>
            <Marker
                {...props}
                eventHandlers={{
                    ...eventHandlers,
                    add: (e) => {
                        setMarkerRendered(true);
                        if (eventHandlers?.add) eventHandlers.add(e);
                    },
                    remove: (e) => {
                        setMarkerRendered(false);
                        if (eventHandlers?.remove) eventHandlers.remove(e);
                    },
                }}
                icon={icon}
            />
            {markerRendered && createPortal(reactIcon, document.getElementById(id) as Element)}
        </>
    );
};
