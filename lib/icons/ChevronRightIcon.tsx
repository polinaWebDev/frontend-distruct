import { SVGProps } from 'react';

export const ChevronRightIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg
        width={7}
        height={12}
        viewBox="0 0 7 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path
            d="M0.75 0.75L5.75 5.75L0.75 10.75"
            stroke="black"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);
