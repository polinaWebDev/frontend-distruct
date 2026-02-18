import Link from 'next/link';
import styles from './HeaderNavItem.module.css';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
export const HeaderNavItem = ({
    icon,
    title,
    href,
    onClick,
    showIndicator = false,
    disabled = false,
    strokeIcon = false,
}: {
    icon: (className: string) => React.ReactNode;
    title: string;
    href: string;
    onClick?: () => void;
    showIndicator?: boolean;
    disabled?: boolean;
    strokeIcon?: boolean;
}) => {
    const pathname = usePathname();

    const isActive = pathname === href;
    const iconClassName = clsx(styles.icon, strokeIcon && styles.stroke_icon);

    if (disabled) {
        return (
            <div className={clsx(styles.nav_item, styles.disabled)} aria-disabled="true">
                <span className={styles.soon_badge}>скоро</span>
                {icon(iconClassName)}
                <div className={styles.text}>{title}</div>
            </div>
        );
    }

    return (
        <Link
            href={href}
            className={clsx(styles.nav_item, isActive && styles.active)}
            onClick={onClick}
        >
            {showIndicator && <span className={styles.indicator} aria-hidden="true" />}
            {icon(iconClassName)}
            <div className={styles.text}>{title}</div>
        </Link>
    );
};
