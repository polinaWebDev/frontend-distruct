import { SVGProps } from 'react';
const ArrowDown = (props: SVGProps<SVGSVGElement>) => (
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
            d="M9 1 5 5 1 1"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
        />
    </svg>
);
export default ArrowDown;
