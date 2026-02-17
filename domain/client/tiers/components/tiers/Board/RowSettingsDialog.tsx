'use client';

import { DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ColorPicker } from '@/components/ui/color-picker';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { AppDialog, AppDialogContent } from '@/ui/AppDialog/app-dialog';

type RowSettingsDialogProps = {
    open: boolean;
    onClose: () => void;
    initialLabel: string;
    initialColor: string;
    isOnlyTierRow: boolean;
    onOpenDeleteConfirm: () => void;
    onSubmit: (data: { label: string; color: string }) => void;
};

export const RowSettingsDialog = ({
    open,
    onClose,
    initialLabel,
    initialColor,
    isOnlyTierRow,
    onOpenDeleteConfirm,
    onSubmit,
}: RowSettingsDialogProps) => {
    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        setValue,
        reset,
        control,
    } = useForm<{ label: string; color: string }>({
        mode: 'onChange',
        defaultValues: {
            label: initialLabel,
            color: initialColor,
        },
    });
    const colorValue = useWatch({ control, name: 'color' }) ?? initialColor;

    useEffect(() => {
        if (!open) return;
        reset({
            label: initialLabel,
            color: initialColor,
        });
    }, [initialColor, initialLabel, open, reset]);

    if (!open) return null;

    return (
        <AppDialog title="Настройки" onClose={onClose}>
            <AppDialogContent
                onClose={onClose}
                asForm
                className="grid gap-4"
                style={{ maxWidth: 350, width: '100%' }}
                onSubmit={handleSubmit((data) => {
                    onSubmit(data);
                    reset(data);
                })}
            >
                <h2 className="text-xl font-semibold leading-none tracking-tight">
                    Настройки тира
                </h2>
                <label
                    className={cn('grid w-full gap-2 text-sm', errors.label && 'text-destructive')}
                >
                    Label
                    <Input
                        placeholder="Название тира"
                        aria-invalid={Boolean(errors.label)}
                        className={cn(
                            errors.label && '!border-destructive focus-visible:!ring-destructive/40'
                        )}
                        {...register('label', {
                            setValueAs: (v) => v.trim(),
                            required: 'Название обязательно',
                            maxLength: { value: 5, message: 'Максимум 5 символов.' },
                        })}
                    />
                    {errors.label ? (
                        <span className="text-destructive text-xs">{errors.label.message}</span>
                    ) : null}
                </label>
                <label className="grid w-full gap-2 text-sm">
                    Цвет
                    <ColorPicker
                        className="w-full [&>div:last-child]:flex-1 [&>div:last-child>input]:w-full"
                        value={colorValue}
                        onChange={(color) => {
                            setValue('color', color, {
                                shouldDirty: true,
                                shouldTouch: true,
                                shouldValidate: true,
                            });
                        }}
                    />
                </label>
                <DialogFooter className="!flex !w-full !flex-row !items-center !justify-between gap-2 sm:gap-2">
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
                                onOpenDeleteConfirm();
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
            </AppDialogContent>
        </AppDialog>
    );
};
