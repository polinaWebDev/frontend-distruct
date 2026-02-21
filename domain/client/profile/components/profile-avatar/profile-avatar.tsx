'use client';
import { getFileUrl } from '@/lib/utils';
import styles from './profile-avatar.module.css';
import { SquarePen } from 'lucide-react';
import { useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { usersControllerEditAvatarMutation } from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { getPublicClient } from '@/lib/api_client/public_client';
import { toast } from 'sonner';
import Image from 'next/image';

export const ProfileAvatar = ({
    url,
    profileBackgroundUrl,
}: {
    url?: string | null;
    profileBackgroundUrl?: string | null;
}) => {
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
            <div className={styles.avatar_clip}>
                {profileBackgroundUrl && (
                    <Image
                        className={styles.background}
                        src={getFileUrl(profileBackgroundUrl)}
                        alt=""
                        fill
                        sizes="296px"
                    />
                )}
                <div className={styles.avatar_layer}>
                    {url ? (
                        <Image
                            className={styles.avatar}
                            src={getFileUrl(url)}
                            alt=""
                            fill
                            sizes="296px"
                        />
                    ) : (
                        <div className={styles.placeholder} />
                    )}
                </div>
            </div>
            <div className={styles.edit_btn} onClick={() => ref.current?.click()}>
                <SquarePen />
            </div>
        </div>
    );
};
