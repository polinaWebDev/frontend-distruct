'use client';
import { getFileUrl } from '@/lib/utils';
import styles from './profile-avatar.module.css';
import { SquarePen } from 'lucide-react';
import { useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { usersControllerEditAvatarMutation } from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { getPublicClient } from '@/lib/api_client/public_client';
import { toast } from 'sonner';

export const ProfileAvatar = ({ url }: { url?: string | null }) => {
    const ref = useRef<HTMLInputElement>(null);

    const { mutate: editAvatar } = useMutation({
        ...usersControllerEditAvatarMutation({
            client: getPublicClient(),
        }),
        onSuccess: () => {
            toast.success('Аватар успешно обновлён');
            location.reload();
        },
        onMutate: () => {
            toast.loading('Загрузка аватара...', { id: 'edit-avatar-toast' });
        },
        onSettled: () => {
            toast.dismiss('edit-avatar-toast');
        },
        onError: (error) => {
            console.error(error);
            toast.error('Ошибка при обновлении аватара');
        },
    });

    return (
        <div className={styles.container}>
            <input
                ref={ref}
                type="file"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                        editAvatar({
                            body: {
                                avatar: file,
                            },
                        });
                    }
                }}
                className="hidden"
                accept="image/*"
            />
            {url ? (
                <img className={styles.avatar} src={getFileUrl(url)} alt="" />
            ) : (
                <div className={styles.placeholder} />
            )}

            <div className={styles.edit_btn} onClick={() => ref.current?.click()}>
                <SquarePen />
            </div>
        </div>
    );
};
