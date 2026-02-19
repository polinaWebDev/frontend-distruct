import { useMemo, useState } from 'react';
import styles from './profile-username.module.css';
import z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, SquarePen, X } from 'lucide-react';
import { AppControlledInput } from '@/ui/AppInput/AppInput';
import { getPublicClient } from '@/lib/api_client/public_client';
import { useMutation } from '@tanstack/react-query';
import { usersControllerEditUsernameMutation } from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { toast } from 'sonner';
import clsx from 'clsx';

const normalizeSpaces = (value: string) => value.replace(/\s+/g, ' ').trim();

const schema = z.object({
    username: z
        .string()
        .transform(normalizeSpaces)
        .pipe(
            z
                .string()
                .min(3, 'Имя пользователя должно быть не короче 3 символов')
                .max(32, 'Имя пользователя должно быть не длиннее 32 символов')
        ),
});

export const ProfileUsername = ({
    username,
    isEditing: isEditingProp,
    onEditingChange,
}: {
    username: string;
    isEditing?: boolean;
    onEditingChange?: (value: boolean) => void;
}) => {
    const [isEditingState, setIsEditingState] = useState(false);
    const isEditing = isEditingProp ?? isEditingState;
    const setIsEditing = (value: boolean) => {
        if (onEditingChange) {
            onEditingChange(value);
        } else {
            setIsEditingState(value);
        }
    };
    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            username: username,
        },
    });
    const displayUsername = useMemo(() => username, [username]);

    const { mutate, isPending } = useMutation({
        ...usersControllerEditUsernameMutation({
            client: getPublicClient(),
        }),
        onSuccess: () => {
            toast.success('Имя пользователя успешно обновлено');
            location.reload();
            setIsEditing(false);
        },
        onMutate: () => {
            toast.loading('Обновление имени пользователя...', {
                id: 'edit-username-toast',
            });
        },
        onSettled: () => {
            toast.dismiss('edit-username-toast');
        },
        onError: (error) => {
            console.error(error);
            toast.error('Ошибка при обновлении имени пользователя');
        },
    });

    const handleSubmit = (data: z.infer<typeof schema>) => {
        mutate({
            body: data,
        });
    };

    return (
        <div className={styles.container}>
            {isEditing ? (
                <AppControlledInput
                    control={form.control}
                    className={styles.input}
                    name="username"
                />
            ) : (
                <p className={clsx(styles.username, 'truncate')}>{displayUsername}</p>
            )}

            {!isEditing && <SquarePen className={styles.icon} onClick={() => setIsEditing(true)} />}

            {isEditing && (
                <>
                    <X className={styles.icon} onClick={() => setIsEditing(false)} />
                    <Check className={styles.icon} onClick={form.handleSubmit(handleSubmit)} />
                </>
            )}
        </div>
    );
};
