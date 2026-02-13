'use client';

import { AppBtn } from '@/ui/SmallBtn/AppBtn';
import styles from './profile-block.module.css';

export const ProfileBlock = ({
    title,
    desc,
    actionLabel = 'Скоро',
    onAction,
}: {
    title: string;
    desc?: string;
    actionLabel?: string;
    onAction?: () => void;
}) => {
    return (
        <div className={styles.block}>
            <p className={styles.title}>{title}</p>
            {desc && <p className={styles.desc}>{desc}</p>}

            <AppBtn
                text={actionLabel}
                disabled={!onAction}
                // style="outline_bright"
                weight="semibold"
                className={styles.soon}
                onClick={onAction}
            />
        </div>
    );
};
