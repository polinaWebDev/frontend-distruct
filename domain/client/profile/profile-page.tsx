'use client';
import { UserResponseDto, authControllerLogout } from '@/lib/api_client/gen';
import styles from './profile-page.module.css';
import clsx from 'clsx';
import { ProfileAvatar } from './components/profile-avatar/profile-avatar';
import { ProfileBlock } from './components/profile-block/profile-block';
import { AppBtn } from '@/ui/SmallBtn/AppBtn';
import { ProfileUsername } from './components/profile-username/profile-username';
import { FriendsBlock } from './components/friends-block/friends-block';
import { useRouter, useSearchParams } from 'next/navigation';
import { GameType } from '@/lib/enums/game_type.enum';
import { RequestsDialog } from './components/requests-dialog/requests-dialog';
import { useQuery } from '@tanstack/react-query';
import { getPublicClient } from '@/lib/api_client/public_client';
import { friendsControllerIncomingOptions } from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { SubscriptionsDialog } from './components/subscriptions-dialog/subscriptions-dialog';
import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { AppDialog, AppDialogContent } from '@/ui/AppDialog/app-dialog';
import { ProfileCustomizationDialog } from './components/profile-customization-dialog/profile-customization-dialog';

export const ProfilePage = ({ profile }: { profile: UserResponseDto }) => {
    const searchParams = useSearchParams();
    const game = (searchParams.get('game') as GameType) ?? GameType.ArenaBreakout;
    const router = useRouter();
    const client = getPublicClient();
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
    const [isCustomizationDialogOpen, setIsCustomizationDialogOpen] = useState(false);

    const { data: incomingRequests } = useQuery({
        ...friendsControllerIncomingOptions({
            client,
        }),
        retry: false,
    });

    const incomingCount = incomingRequests?.requests?.length ?? 0;
    const handleLogout = async () => {
        try {
            await authControllerLogout({ client });
        } finally {
            window.location.reload();
        }
    };

    return (
        <>
            <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
                <div className={clsx(styles.container, 'page_width_wrapper header_margin_top')}>
                    <div className={styles.content}>
                        <div className={styles.left}>
                            <ProfileAvatar url={profile.avatar_url} />

                            <AppBtn
                                style="outline_red"
                                text="Выйти из аккаунта"
                                className={styles.logout_btn}
                                onClick={() => {
                                    setIsLogoutDialogOpen(true);
                                }}
                            />
                        </div>
                        <div className={styles.right}>
                            <ProfileUsername
                                username={profile.username}
                                isEditing={isEditingProfile}
                                onEditingChange={setIsEditingProfile}
                            />
                            <p className={styles.email}>{profile.email}</p>

                            <AppBtn
                                style="outline_bright"
                                text="Кастомизация профиля"
                                className={styles.customization_btn}
                                onClick={() => {
                                    setIsCustomizationDialogOpen(true);
                                }}
                            />
                            <div className="flex flex-wrap gap-3">
                                <SubscriptionsDialog currentUserId={profile.id} game={game} />
                                <RequestsDialog incomingCount={incomingCount} />
                            </div>

                            <FriendsBlock game={game} />
                            <ProfileBlock
                                title="Тир-листы"
                                desc="Снаряжение по тирам S, A, B, C и тп"
                                actionLabel="Открыть"
                                onAction={() => router.push(`/${game}/tiers`)}
                            />
                            <ProfileBlock title="Достижения" />
                        </div>
                    </div>
                </div>
                <AppDialog
                    title="Подтверждение выхода"
                    onClose={() => setIsLogoutDialogOpen(false)}
                >
                    <AppDialogContent onClose={() => setIsLogoutDialogOpen(false)}>
                        <h2 className={styles.logout_dialog_title}>Выйти из аккаунта?</h2>
                        <p className={styles.logout_dialog_description}>
                            Вы уверены, что хотите завершить текущую сессию?
                        </p>
                        <div className={styles.logout_dialog_buttons}>
                            <AppBtn
                                text="Выйти"
                                style="outline_red"
                                onClick={() => {
                                    setIsLogoutDialogOpen(false);
                                    handleLogout();
                                }}
                            />
                            <AppBtn
                                text="Отмена"
                                style="outline_bright"
                                onClick={() => {
                                    setIsLogoutDialogOpen(false);
                                }}
                            />
                        </div>
                    </AppDialogContent>
                </AppDialog>
            </Dialog>
            <ProfileCustomizationDialog
                open={isCustomizationDialogOpen}
                onOpenChange={setIsCustomizationDialogOpen}
                userPoints={profile.points}
            />
        </>
    );
};
