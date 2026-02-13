import clsx from 'clsx';
import styles from './AppSkeleton.module.css';

export const AppSkeleton = ({ className }: { className?: string }) => {
    return (
        <div className={clsx(styles.container, className)}>
            <div className={styles.skeleton} />
        </div>
    );
};
