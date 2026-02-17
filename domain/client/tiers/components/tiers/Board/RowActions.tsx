'use client';
import Settings from '@/lib/icons/SettingsIcon';
import { useBoard } from '@/domain/client/tiers/components/tiers/Board/BoardContext';
import styles from './RowActions.module.css';
import rowStyles from './Row.module.css';
import ArrowUp from '@/lib/icons/ArrowUp';
import ArrowDown from '@/lib/icons/ArrowDown';
import { Root as DialogRoot } from '@radix-ui/react-dialog';
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
import { useState } from 'react';
import { RowSettingsDialog } from '@/domain/client/tiers/components/tiers/Board/RowSettingsDialog';

type ButtonConfig = {
    id: 'settings' | 'move-up' | 'move-down';
    icon: React.ReactElement;
};

const BUTTONS: ButtonConfig[] = [
    { id: 'settings', icon: <Settings /> },
    { id: 'move-up', icon: <ArrowUp /> },
    { id: 'move-down', icon: <ArrowDown /> },
];

const RowActions = ({ rowId }: { rowId: string }) => {
    const board = useBoard();
    const row = board.rows.find((item) => item.id === rowId);
    const tierRows = board.rows.filter((item) => item.type !== 'pool');
    const rowIndex = tierRows.findIndex((item) => item.id === rowId);
    const isFirst = rowIndex === 0;
    const isLast = rowIndex === tierRows.length - 1;
    const isOnlyTierRow = tierRows.length <= 1;
    const [open, setOpen] = useState(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

    const handlers: Record<ButtonConfig['id'], () => void> = {
        settings: () => {
            setOpen(true);
        },
        'move-up': () => {
            board.reorderRow({ rowId, direction: 'up' });
        },
        'move-down': () => {
            board.reorderRow({ rowId, direction: 'down' });
        },
    };

    const isDisabled = (id: ButtonConfig['id']) => {
        if (id === 'move-up') return isFirst;
        if (id === 'move-down') return isLast;
        return false;
    };

    if (!row) return null;

    return (
        <>
            <div className={`${styles.buttons} ${rowStyles.row_actions}`}>
                {BUTTONS.map((button) => (
                    <button
                        className={`${styles.button} ${rowStyles.row_action_btn}`}
                        key={button.id}
                        onClick={isDisabled(button.id) ? undefined : handlers[button.id]}
                        disabled={isDisabled(button.id)}
                    >
                        {button.icon}
                    </button>
                ))}
            </div>
            <DialogRoot open={open} onOpenChange={setOpen}>
                <RowSettingsDialog
                    open={open}
                    onClose={() => setOpen(false)}
                    initialLabel={row.title}
                    initialColor={row.color ?? '#444444'}
                    isOnlyTierRow={isOnlyTierRow}
                    onOpenDeleteConfirm={() => setConfirmDeleteOpen(true)}
                    onSubmit={(data) => {
                        board.updateRow({
                            rowId,
                            title: data.label || row.title,
                            color: data.color,
                        });
                        setOpen(false);
                    }}
                />
            </DialogRoot>
            <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Удалить строку?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Строка будет удалена, а все элементы перемещены в пул
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20"
                            onClick={() => {
                                if (isOnlyTierRow) return;
                                board.deleteRow({ rowId });
                                setConfirmDeleteOpen(false);
                                setOpen(false);
                            }}
                        >
                            Удалить
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default RowActions;
