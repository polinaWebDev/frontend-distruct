'use client';
import Settings from '@/lib/icons/SettingsIcon';
import { useBoard } from '@/domain/client/tiers/components/tiers/Board/BoardContext';
import styles from './RowActions.module.css';
import rowStyles from './Row.module.css';
import ArrowUp from '@/lib/icons/ArrowUp';
import ArrowDown from '@/lib/icons/ArrowDown';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { cn } from '@/lib/utils';

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
    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        reset,
    } = useForm<{ label: string; color: string }>({
        mode: 'onChange',
        defaultValues: {
            label: row?.title ?? '',
            color: row?.color ?? '#444444',
        },
    });

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

    useEffect(() => {
        if (!open) return;

        reset({
            label: row?.title ?? '',
            color: row?.color ?? '#444444',
        });
    }, [open, reset]);

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
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Настройки</DialogTitle>
                    </DialogHeader>
                    <form
                        className="grid gap-4"
                        onSubmit={handleSubmit((data) => {
                            board.updateRow({
                                rowId,
                                title: data.label || row.title,
                                color: data.color,
                            });
                            setOpen(false);
                        })}
                    >
                        <label
                            className={cn('grid gap-2 text-sm', errors.label && 'text-destructive')}
                        >
                            Label
                            <Input
                                placeholder="Название тира"
                                aria-invalid={Boolean(errors.label)}
                                className={cn(
                                    errors.label &&
                                        '!border-destructive focus-visible:!ring-destructive/40'
                                )}
                                {...register('label', {
                                    setValueAs: (v) => v.trim(),
                                    required: 'Название обязательно',
                                    maxLength: { value: 5, message: 'Максимум 5 символов.' },
                                })}
                            />
                            {errors.label ? (
                                <span className="text-destructive text-xs">
                                    {errors.label.message}
                                </span>
                            ) : null}
                        </label>
                        <label className="grid gap-2 text-sm">
                            Цвет
                            <Input
                                type="color"
                                className="h-10 w-20 cursor-pointer p-1"
                                {...register('color')}
                            />
                        </label>
                        <DialogFooter className="gap-2 sm:gap-2">
                            <div className="flex items-center gap-2">
                                {isOnlyTierRow ? (
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                        Нельзя удалить последнюю строку
                                    </span>
                                ) : null}
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => {
                                        if (isOnlyTierRow) return;
                                        setConfirmDeleteOpen(true);
                                    }}
                                    disabled={isOnlyTierRow}
                                >
                                    Удалить строку
                                </Button>
                            </div>
                            <Button type="submit" disabled={!isValid}>
                                Подтвердить
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
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
