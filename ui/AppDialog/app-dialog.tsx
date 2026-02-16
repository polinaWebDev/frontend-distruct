import { VisuallyHidden } from 'radix-ui';
import styles from './app-dialog.module.css';
import { Content, Overlay, Portal, Title } from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';
import { XIcon } from 'lucide-react';

export const AppDialogContent = ({
    children,
    className,
    onClose,
}: {
    children: React.ReactNode;
    className?: string;
    onClose: () => void;
}) => {
    return (
        <div
            className={cn(styles.dialog_content, className)}
            onClick={(e) => {
                e.stopPropagation();
            }}
        >
            <button
                type="button"
                className={styles.dialog_close}
                onClick={onClose}
                aria-label="Закрыть"
            >
                <XIcon size={16} strokeWidth={1.8} />
            </button>
            {children}
        </div>
    );
};

export const AppDialog = ({
    children,
    onClose,
    title,
}: {
    children: React.ReactNode;
    onClose: () => void;
    title: string;
}) => {
    return (
        <Portal>
            <Overlay className={styles.dialog_overlay} />

            <Content
                className={styles.dialog_wrapper}
                onClick={() => {
                    onClose();
                }}
            >
                <VisuallyHidden.VisuallyHidden asChild>
                    <Title>{title}</Title>
                </VisuallyHidden.VisuallyHidden>

                {children}
            </Content>
        </Portal>
    );
};
