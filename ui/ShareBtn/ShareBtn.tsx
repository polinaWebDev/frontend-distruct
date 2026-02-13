import clsx from 'clsx';
import styles from '@/ui/ShareBtn/ShareBtn.module.css';
import { ShareIcon } from '@/lib/icons/ShareIcon';

export const ShareBtn = ({
    className,
    onClick,
    color = 'black',
    disabled,
}: {
    className?: string;
    onClick?: () => void;
    text?: string;
    color?: string;
    disabled?: boolean;
}) => {
    return (
        <button className={clsx(styles.container, className)} disabled={disabled} onClick={onClick}>
            <ShareIcon style={{ stroke: color }} />
        </button>
    );
};
