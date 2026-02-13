import Link from 'next/link';
import styles from './HeaderNavItem.module.css';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
export const HeaderNavItem = ({
    icon,
    title,
    href,
    onClick,
}: {
    icon: (className: string) => React.ReactNode;
    title: string;
    href: string;
    onClick?: () => void;
}) => {
    const pathname = usePathname();

    const isActive = pathname === href;

    return (
        <Link
            href={href}
            className={clsx(styles.nav_item, isActive && styles.active)}
            onClick={onClick}
        >
            {icon(styles.icon)}
            <div className={styles.text}>{title}</div>
        </Link>
    );
};
