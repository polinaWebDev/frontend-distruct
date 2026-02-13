import { type SVGProps } from 'react';

interface IProps extends SVGProps<SVGSVGElement> {}

export const TierIcon = (props: IProps) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="19"
            height="13"
            fill="none"
            viewBox="0 0 19 13"
            {...props}
        >
            <path
                fill="#797F89"
                d="M2 0H1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V1a1 1 0 0 0-1-1m0 5H1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1m0 5H1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1M17.09 0H6.91C5.854 0 5 .672 5 1.5S5.855 3 6.91 3h10.18C18.146 3 19 2.328 19 1.5S18.145 0 17.09 0m-2.923 5H6.833C5.821 5 5 5.672 5 6.5S5.82 8 6.833 8h7.334C15.179 8 16 7.328 16 6.5S15.18 5 14.167 5M10.5 10h-4a1.5 1.5 0 0 0 0 3h4a1.5 1.5 0 0 0 0-3"
            />
        </svg>
    );
};
