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
}: {
    icon: (className: string) => React.ReactNode;
    title: string;
    href: string;
    onClick?: () => void;
    showIndicator?: boolean;
}) => {
    const pathname = usePathname();

    const isActive = pathname === href;

    return (
        <Link
            href={href}
            className={clsx(styles.nav_item, isActive && styles.active)}
            onClick={onClick}
        >
            {showIndicator && <span className={styles.indicator} aria-hidden="true" />}
            {icon(styles.icon)}
            <div className={styles.text}>{title}</div>
        </Link>
    );
};
