import { ApDialogContent, AppDialog } from '@/ui/AppDialog/app-dialog';
import { AppBtn } from '@/ui/SmallBtn/AppBtn';
import styles from './accept-challenge-dialog.module.css';
export const AcceptChallengeDialog = ({
    onClose,
    onAccept,
    title,
    description,
    acceptText = 'Принять',
    cancelText = 'Отменить',
    onCancel,
}: {
    onClose: () => void;
    onAccept?: () => void;
    onCancel?: () => void;
    title: string;
    description: string;
    acceptText?: string;
    cancelText?: string;
}) => {
    return (
        <AppDialog title="Принять челлендж" onClose={onClose}>
            <ApDialogContent onClose={onClose}>
                <h1 className={styles.title}>{title}</h1>
                <p className={styles.description}>{description}</p>

                <div className={styles.buttons}>
                    <AppBtn text={acceptText} onClick={onAccept} />
                    <AppBtn text={cancelText} onClick={onCancel ?? onClose} style="outline_red" />
                </div>
            </ApDialogContent>
        </AppDialog>
    );
};
