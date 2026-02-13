'use client';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import styles from './ShareConfirmDialog.module.css';

type ShareConfirmDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onContinueWithoutSave: () => void;
    onSaveAndContinue: () => void;
};

const ShareConfirmDialog = ({
    open,
    onOpenChange,
    onContinueWithoutSave,
    onSaveAndContinue,
}: ShareConfirmDialogProps) => {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className={styles.content}>
                <AlertDialogHeader>
                    <AlertDialogTitle className={styles.title}>
                        Есть несохраненные изменения
                    </AlertDialogTitle>
                    <AlertDialogDescription className={styles.description}>
                        Перед тем как поделиться, сохраните изменения. Иначе все несохраненные
                        правки будут сброшены.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className={styles.footer}>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <div className={styles.actions}>
                        <AlertDialogAction
                            className={cn(buttonVariants({ variant: 'destructive' }))}
                            onClick={onContinueWithoutSave}
                        >
                            Продолжить без сохранения
                        </AlertDialogAction>
                        <AlertDialogAction onClick={onSaveAndContinue}>
                            Сохранить и продолжить
                        </AlertDialogAction>
                    </div>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default ShareConfirmDialog;
