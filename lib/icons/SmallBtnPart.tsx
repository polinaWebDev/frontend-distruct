import { SVGProps } from 'react';
export const SmallBtnPart = (props: SVGProps<SVGSVGElement>) => (
    <svg
        width={19}
        height={40}
        viewBox="0 0 19 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path
            d="M0 0.000976562L13.9997 0.000257003C16.7613 0.000115067 19 2.23873 19 5.00026V22.7063C19 24.0458 18.4626 25.3292 17.5082 26.269L5.02362 38.5627C4.08825 39.4837 2.82817 40 1.51543 40H0V0.000976562Z"
            fill="#F5A02F"
        />
    </svg>
);

export const SmallBtnPartOutline = (props: SVGProps<SVGSVGElement>) => (
    <svg
        width={20}
        height={41}
        viewBox="0 0 20 41"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path
            d="M0 0.5H14C16.7614 0.5 19 2.73858 19 5.5V23.2092C19 24.547 18.464 25.8289 17.5117 26.7684L5.05488 39.0592C4.1192 39.9824 2.85761 40.5 1.54315 40.5H3.91006e-05"
            stroke="white"
        />
    </svg>
);
