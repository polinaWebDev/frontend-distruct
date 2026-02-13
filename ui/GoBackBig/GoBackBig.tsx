import { GoBackBigIcon } from '@/lib/icons/GoBackBigIcon';
import styles from './GoBackBig.module.css';
import clsx from 'clsx';
import { GoBackSmall } from '@/lib/icons/GoBackSmall';

export const GoBackBig = ({
    className,
    onClick,
    text = 'Вернуться назад',
}: {
    className?: string;
    onClick?: () => void;
    text?: string;
}) => {
    return (
        <div className={clsx(styles.container, className)} onClick={onClick}>
            {text && <p>{text}</p>}
            <GoBackBigIcon />
        </div>
    );
};

export const GoBackSmallBtn = ({
    className,
    onClick,
    text,
}: {
    className?: string;
    onClick?: () => void;
    text?: string;
}) => {
    return (
        <div className={clsx(styles.container, className)} onClick={onClick}>
            {text && <p>{text}</p>}
            <GoBackSmall />
        </div>
    );
};
