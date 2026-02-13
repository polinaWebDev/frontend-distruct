import clsx from 'clsx';
import style from './challenge-info-block.module.css';
import Link from 'next/link';
import { AppBtn } from '@/ui/SmallBtn/AppBtn';
import { SeasonWaveIcon } from '@/lib/icons/SeasonWaveIcon';

export const ChallengeInfoBlock = ({
    children,
    className,
    noBottomPadding,
    outerChildren,
}: {
    className?: string;
    children?: React.ReactNode;
    noBottomPadding?: boolean;
    outerChildren?: React.ReactNode;
}) => {
    return (
        <div className={clsx(style.wrapper, className, noBottomPadding && style.no_bottom_padding)}>
            <div
                className={clsx(
                    style.container,

                    noBottomPadding && style.no_bottom_padding
                )}
            >
                {children}
            </div>
            {outerChildren}
        </div>
    );
};

export const ChallengeInfoBlockTitle = ({
    children,
    className,
    icon,
}: {
    className?: string;
    children?: React.ReactNode;
    icon?: React.ReactNode;
}) => {
    return (
        <div className={clsx(style.title_container, className)}>
            {icon ? <div className={style.icon_container}>{icon}</div> : null}
            <p>{children}</p>
        </div>
    );
};

export const ChallengeInfoBlockDesc = ({
    children,
    className,
}: {
    className?: string;
    children?: React.ReactNode;
}) => {
    return <p className={clsx(style.desc, className)}>{children}</p>;
};

export const ChallengeInfoBlockPoints = ({
    className,
    btnLink,
    btnText,
    points,
    subTitle,
    btnOnClick,
}: {
    className?: string;
    points: number;
    subTitle: string;
    btnText: string;
    btnLink?: string;
    btnOnClick?: () => void;
}) => {
    return (
        <div className={clsx(style.points_wrapper, className)}>
            <div className={style.points_container}>
                <p className={style.sub_title}>{subTitle}</p>
                <p className={style.amount}>{points}</p>
            </div>
            {btnLink ? (
                <Link href={btnLink} className={style.btn}>
                    <AppBtn
                        text={btnText}
                        style={'outline_brand'}
                        className="w-full"
                        weight={'medium'}
                    />
                </Link>
            ) : null}
            {btnOnClick ? (
                <AppBtn
                    text={btnText}
                    style={'outline_brand'}
                    className={style.btn}
                    onClick={btnOnClick}
                    weight={'medium'}
                />
            ) : null}
        </div>
    );
};

export const ChallengeInfoBlockSeasonInfo = ({
    className,
    items,
}: {
    items: {
        subTitle: string;
        content: string;
    }[];
    className?: string;
}) => {
    return (
        <div className={clsx(style.season_info_block, className)}>
            {items.map((item, index) => (
                <div className={style.item} key={index}>
                    <p className={style.sub_title}>{item.subTitle}</p>
                    <p className={style.content}>{item.content}</p>
                </div>
            ))}
        </div>
    );
};

export const ChallengeInfoBlockWave = ({ className }: { className?: string }) => {
    return (
        <div className={clsx(style.wave_container, className)}>
            <SeasonWaveIcon className={clsx(style.wave)} />
        </div>
    );
};
