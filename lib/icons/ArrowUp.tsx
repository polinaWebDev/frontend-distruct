import type { SVGProps } from 'react';
const ArrowUp = (props: SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="10"
        height="6"
        fill="none"
        viewBox="0 0 10 6"
        {...props}
    >
        <path
            stroke="#A0AABD"
            d="m1 5 4-4 4 4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
        />
    </svg>
);
export default ArrowUp;
