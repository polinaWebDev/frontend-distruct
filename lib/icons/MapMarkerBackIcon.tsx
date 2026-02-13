import { SVGProps } from 'react';

export const MapMarkerBackIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg
        width={62}
        height={30}
        viewBox="0 0 62 30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path
            d="M3 0.5H58.5C59.8807 0.5 61 1.61929 61 3V18.7812C61 19.3797 60.7849 19.9585 60.3945 20.4121L53.3232 28.6309C52.8483 29.1828 52.1558 29.5 51.4277 29.5H3C1.61929 29.5 0.5 28.3807 0.5 27V3L0.512695 2.74414C0.640824 1.48361 1.70566 0.5 3 0.5Z"
            stroke="white"
        />
        <path
            d="M31.5 19L26.5 14.5L31.5 10"
            stroke="white"
            strokeWidth={1.4}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);
