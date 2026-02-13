'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type ColorPickerProps = {
    value: string;
    onChange: (color: string) => void;
    className?: string;
    id?: string;
    error?: string;
    isInvalid?: boolean;
};

export function ColorPicker({
    value,
    onChange,
    className,
    id,
    error,
    isInvalid,
}: ColorPickerProps) {
    const fallbackColor = '#000000';
    const isValid = /^#?[0-9a-fA-F]{6}$/.test(value);
    const showInvalid = isInvalid ?? !isValid;
    const errorMessage = error ?? (!isValid ? 'Заполните поле' : undefined);
    const colorInputValue = isValid ? (value.startsWith('#') ? value : `#${value}`) : fallbackColor;

    return (
        <div className={cn('flex items-start gap-3', className)}>
            <div className="relative h-10 w-10 overflow-hidden rounded-md border border-white/20 shadow-sm">
                <input
                    id={id}
                    type="color"
                    value={colorInputValue}
                    onChange={(e) => onChange(e.target.value)}
                    className="absolute inset-0 h-full w-full cursor-pointer border-0 bg-transparent p-0"
                />
            </div>
            <div className="flex flex-col gap-1">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={cn(
                        'h-10 w-32 rounded-md border bg-white/5 px-3 text-sm text-white outline-none transition font-mono',
                        !showInvalid
                            ? 'border-white/15 focus:border-white/40 focus:ring-2 focus:ring-white/20'
                            : 'border-red-500/60 focus:border-red-400 focus:ring-2 focus:ring-red-400/40'
                    )}
                />
                {showInvalid && errorMessage && (
                    <p className="text-xs text-red-400">{errorMessage}</p>
                )}
            </div>
        </div>
    );
}
