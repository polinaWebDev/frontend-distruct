import * as React from 'react';
import { SVGProps } from 'react';
export const MapBtnIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg
        width={75}
        height={24}
        viewBox="0 0 75 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path
            d="M0 3C0 1.34315 1.34315 0 3 0H72C73.6569 0 75 1.34315 75 3V12.7817C75 13.4998 74.7424 14.1941 74.274 14.7384L67.202 22.9568C66.6321 23.6191 65.8018 24 64.9281 24H2.99999C1.34314 24 0 22.6569 0 21V3Z"
            fill="white"
            className="map_btn_icon_background"
        />
        <path
            d="M55 7L60 11.5L55 16"
            stroke="black"
            strokeWidth={1.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="map_btn_icon_stroke"
        />
    </svg>
);
