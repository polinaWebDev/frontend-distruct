import styles from '../../tiers-page.module.css';

type TiersTitleProps = {
    label?: string | null;
};

export function TiersTitle({ label }: TiersTitleProps) {
    return (
        <div className={styles.info}>
            <h1>Тир-лист</h1>
            <p className="text-muted-foreground">{label ?? '—'}</p>
        </div>
    );
}
