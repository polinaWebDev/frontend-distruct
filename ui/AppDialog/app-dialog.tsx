import { VisuallyHidden } from 'radix-ui';
import styles from './app-dialog.module.css';
import { Content, Overlay, Portal, Title } from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';
import { XIcon } from 'lucide-react';

export const AppDialogContent = ({
    children,
    className,
    onClose,
    asForm = false,
    onSubmit,
    style,
}: {
    children: React.ReactNode;
    className?: string;
    onClose: () => void;
    asForm?: boolean;
    onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
    style?: React.CSSProperties;
}) => {
    if (asForm) {
        return (
            <form
                className={cn(styles.dialog_content, className)}
                style={style}
                onClick={(e) => {
                    e.stopPropagation();
                }}
                onSubmit={(e) => {
                    if (onSubmit) {
                        onSubmit(e);
                        return;
                    }
                    e.preventDefault();
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
            </form>
        );
    }

    return (
        <div
            className={cn(styles.dialog_content, className)}
            style={style}
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
