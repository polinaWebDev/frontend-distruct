import { VisuallyHidden } from 'radix-ui';
import styles from './app-dialog.module.css';
import { Content, Overlay, Portal, Title } from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';
import { XIcon } from 'lucide-react';

export const ApDialogContent = ({
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
            <div className={styles.dialog_close} onClick={onClose}>
                <XIcon color="white" size={24} />
            </div>
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
