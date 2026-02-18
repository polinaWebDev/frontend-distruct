import * as React from 'react';
import { type SVGProps } from 'react';

const BrainIcon = (props: SVGProps<SVGSVGElement>) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
            {...props}
        >
            <g stroke="#797F89" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 18V5m3 8a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4m8.598-6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5" />
                <path d="M17.997 5.125a4 4 0 0 1 2.526 5.77" />
                <path d="M18 18a4 4 0 0 0 2-7.464" />
                <path d="M19.967 17.483a3.999 3.999 0 0 1-6.7 3.433A4 4 0 0 1 12 18a4 4 0 0 1-4.259 3.988 4 4 0 0 1-3.708-4.505" />
                <path d="M6 18a4 4 0 0 1-2-7.464" />
                <path d="M6.003 5.125a4 4 0 0 0-2.526 5.77" />
            </g>
        </svg>
    );
};

export default BrainIcon;
