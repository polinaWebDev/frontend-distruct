import { SVGProps } from 'react';
export const VoteArrow = (props: SVGProps<SVGSVGElement>) => (
    <svg
        width={12}
        height={14}
        viewBox="0 0 12 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path
            d="M5.75 12.75V0.75M5.75 0.75L0.75 5.89286M5.75 0.75L10.75 5.89286"
            stroke="#79808E"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);
