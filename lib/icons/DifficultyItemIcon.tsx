import { SVGProps } from 'react';

export const DifficultyItemIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg
        width={118}
        height={40}
        viewBox="0 0 118 40"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
        fill="none"
        stroke="none"
    >
        <path
            d="M5 0.5H113C115.485 0.5 117.5 2.51472 117.5 5V20.9336C117.5 22.1244 117.028 23.2669 116.188 24.1104L102.168 38.1768C101.324 39.0239 100.177 39.5 98.9805 39.5H5C2.51472 39.5 0.5 37.4853 0.5 35V5C0.5 2.51472 2.51472 0.5 5 0.5Z"
            stroke={props.stroke || '#5D6369'}
            fill={props.fill || 'none'}
        />
    </svg>
);
