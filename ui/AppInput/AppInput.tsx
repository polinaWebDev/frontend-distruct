import clsx from 'clsx';
import styles from './AppInput.module.css';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

export type AppInputProps = {
    placeholder?: string;
    label?: string;
    desc?: string;
    errorMessage?: string;
    showErrorMessage?: boolean;
    value?: string;
    onText?: (x: string) => void;
    onFocus?: () => void;
    onBlur?: () => void;
    className?: string;
    onSubmit?: () => void;
    onFileChange?: (file: File | null) => void;
    errored?: boolean;
} & InputHTMLAttributes<HTMLInputElement>;

export const AppInput = ({
    placeholder,
    label,
    desc,
    errorMessage,
    showErrorMessage,
    value,
    onText,
    onFocus,
    onBlur,
    className,
    onSubmit,
    onFileChange,
    errored,
    ...props
}: AppInputProps) => {
    return (
        <div className={clsx(styles.input_container, className)}>
            {label && <label className={styles.label}>{label}</label>}

            <input
                className={clsx(styles.input, errored && styles.errored)}
                placeholder={placeholder}
                value={value}
                onChange={(e) => {
                    if (props.type === 'file') {
                        onFileChange?.(e.target.files?.[0] || null);
                    } else {
                        onText?.(e.target.value);
                    }
                }}
                onFocus={onFocus}
                onBlur={onBlur}
                onSubmit={onSubmit}
                {...props}
            />

            {desc && <p className={styles.desc}>{desc}</p>}

            {errorMessage && showErrorMessage && (
                <p className={styles.error_message}>{errorMessage}</p>
            )}
        </div>
    );
};

export type AppTextareaProps = {
    placeholder?: string;
    label?: string;
    desc?: string;
    errorMessage?: string;
    showErrorMessage?: boolean;
    value?: string;
    onText?: (x: string) => void;
    onFocus?: () => void;
    onBlur?: () => void;
    className?: string;
    onSubmit?: () => void;
    errored?: boolean;
} & TextareaHTMLAttributes<HTMLTextAreaElement>;

export const AppTextarea = ({
    placeholder,
    label,
    desc,
    errorMessage,
    showErrorMessage,
    value,
    onText,
    onFocus,
    onBlur,
    className,
    onSubmit,
    errored,
    onChange,
    ...props
}: AppTextareaProps) => {
    return (
        <div className={clsx(styles.input_container, className)}>
            {label && <label className={styles.label}>{label}</label>}

            <textarea
                className={clsx(styles.input, errored && styles.errored)}
                placeholder={placeholder}
                rows={4}
                value={value}
                onChange={(e) => {
                    onText?.(e.target.value);
                    onChange?.(e);
                }}
                onFocus={onFocus}
                onBlur={onBlur}
                onSubmit={onSubmit}
                {...props}
            />

            {desc && <p className={styles.desc}>{desc}</p>}

            {errorMessage && showErrorMessage && (
                <p className={styles.error_message}>{errorMessage}</p>
            )}
        </div>
    );
};

export interface AppControlledInputProps<T extends FieldValues>
    extends Omit<AppInputProps, 'onText' | 'onFocus' | 'onBlur' | 'value' | 'errorMessage'> {
    control: Control<T>; // `T` is the form schema type
    name: Path<T>; // `Path<T>` ensures that `name` is one of the keys of the form schema
    transform?: (x: string) => string;
}

export function AppControlledInput<T extends FieldValues>({
    name,
    control,
    transform,
    ...rest
}: AppControlledInputProps<T>) {
    return (
        <Controller
            control={control}
            name={name}
            render={({ fieldState, field }) => (
                <AppInput
                    {...rest}
                    onBlur={field.onBlur}
                    onText={(t) => {
                        if (transform) {
                            field.onChange(transform(t));
                            return;
                        }
                        field.onChange(t);
                    }}
                    onFileChange={(file) => {
                        field.onChange(file);
                    }}
                    value={field.value}
                    errorMessage={fieldState.error?.message}
                    errored={!!fieldState.error}
                />
            )}
        />
    );
}

export interface AppControlledTextareaProps<T extends FieldValues>
    extends Omit<AppTextareaProps, 'onText' | 'onFocus' | 'onBlur' | 'value' | 'errorMessage'> {
    control: Control<T>; // `T` is the form schema type
    name: Path<T>; // `Path<T>` ensures that `name` is one of the keys of the form schema
    transform?: (x: string) => string;
}

export function AppControlledTextarea<T extends FieldValues>({
    name,
    control,
    transform,
    ...rest
}: AppControlledTextareaProps<T>) {
    return (
        <Controller
            control={control}
            name={name}
            render={({ fieldState, field }) => (
                <AppTextarea
                    {...rest}
                    onBlur={field.onBlur}
                    onText={(t) => {
                        if (transform) {
                            field.onChange(transform(t));
                            return;
                        }
                        field.onChange(t);
                    }}
                    value={field.value}
                    errorMessage={fieldState.error?.message}
                    errored={!!fieldState.error}
                />
            )}
        />
    );
}
