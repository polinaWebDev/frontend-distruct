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
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export const ProfilePage = ({ profile }: { profile: UserResponseDto }) => {
    const searchParams = useSearchParams();
    const game = (searchParams.get('game') as GameType) ?? GameType.ArenaBreakout;
    const router = useRouter();
    const client = getPublicClient();
    const [isEditingProfile, setIsEditingProfile] = useState(false);

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
        <div className={clsx(styles.container, 'page_width_wrapper header_margin_top')}>
            <div className={styles.content}>
                <div className={styles.left}>
                    <ProfileAvatar url={profile.avatar_url} />

                    <AppBtn
                        style="outline_red"
                        text="Выйти из аккаунта"
                        className={styles.logout_btn}
                        onClick={() => {
                            handleLogout();
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

                    <div className={styles.actionsRow}>
                        <Button
                            size="sm"
                            className={styles.editProfileBtn}
                            onClick={() => setIsEditingProfile(true)}
                        >
                            Редактировать профиль
                        </Button>
                    </div>

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
    );
};
