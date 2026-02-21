'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { AppBtn } from '@/ui/SmallBtn/AppBtn';
import { getPublicClient } from '@/lib/api_client/public_client';
import {
    friendsControllerAcceptMutation,
    friendsControllerGetFriendsOptions,
    friendsControllerIncomingOptions,
    friendsControllerOutgoingOptions,
    friendsControllerRejectMutation,
    friendsControllerRemoveFriendMutation,
    friendsControllerSendMutation,
    tiersControllerGetPublicTierListsByUserOptions,
    usersPublicControllerFindPublicByIdOptions,
} from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { PublicUserResponseDto } from '@/lib/api_client/gen';
import { GameType } from '@/lib/enums/game_type.enum';
import { getFileUrl } from '@/lib/utils';
import styles from './public-profile-page.module.css';

type FriendRequestItem = {
    id: string;
    user: PublicUserResponseDto;
    createdAt: Date;
};

export const PublicProfilePage = ({ userId, game }: { userId: string; game: GameType }) => {
    const queryClient = useQueryClient();
    const client = getPublicClient();

    const { data: userData, isLoading: isUserLoading } = useQuery({
        ...usersPublicControllerFindPublicByIdOptions({
            client,
            path: { id: userId },
        }),
    });

    const { data: tierListsData, isLoading: isTierListsLoading } = useQuery({
        ...tiersControllerGetPublicTierListsByUserOptions({
            client,
            path: { userId },
            query: {
                gameType: game,
            },
        }),
    });

    const { data: friendsData } = useQuery({
        ...friendsControllerGetFriendsOptions({
            client,
        }),
        retry: false,
    });

    const { data: incomingRequests } = useQuery({
        ...friendsControllerIncomingOptions({
            client,
        }),
        retry: false,
    });

    const { data: outgoingRequests } = useQuery({
        ...friendsControllerOutgoingOptions({
            client,
        }),
        retry: false,
    });

    const friendIds = useMemo(() => {
        return new Set((friendsData?.friends ?? []).map((friend) => friend.id));
    }, [friendsData]);

    const incomingByUserId = useMemo(() => {
        const map = new Map<string, FriendRequestItem>();
        (incomingRequests?.requests ?? []).forEach((request) => {
            if (request.user?.id) {
                map.set(request.user.id, request);
            }
        });
        return map;
    }, [incomingRequests]);

    const outgoingByUserId = useMemo(() => {
        const map = new Map<string, FriendRequestItem>();
        (outgoingRequests?.requests ?? []).forEach((request) => {
            if (request.user?.id) {
                map.set(request.user.id, request);
            }
        });
        return map;
    }, [outgoingRequests]);

    const sendRequestMutation = useMutation({
        ...friendsControllerSendMutation({
            client,
        }),
        onSuccess: () => {
            toast.success('Запрос отправлен');
            queryClient.invalidateQueries();
        },
        onError: () => {
            toast.error('Не удалось отправить запрос');
        },
    });

    const acceptRequestMutation = useMutation({
        ...friendsControllerAcceptMutation({
            client,
        }),
        onSuccess: () => {
            toast.success('Запрос принят');
            queryClient.invalidateQueries();
        },
        onError: () => {
            toast.error('Не удалось принять запрос');
        },
    });

    const rejectRequestMutation = useMutation({
        ...friendsControllerRejectMutation({
            client,
        }),
        onSuccess: () => {
            toast.success('Запрос отклонен');
            queryClient.invalidateQueries();
        },
        onError: () => {
            toast.error('Не удалось отклонить запрос');
        },
    });

    const removeFriendMutation = useMutation({
        ...friendsControllerRemoveFriendMutation({
            client,
        }),
        onSuccess: () => {
            toast.success('Друг удален');
            queryClient.invalidateQueries();
        },
        onError: () => {
            toast.error('Не удалось удалить друга');
        },
    });

    const isFriend = userData ? friendIds.has(userData.id) : false;
    const incomingRequest = userData ? incomingByUserId.get(userData.id) : undefined;
    const outgoingRequest = userData ? outgoingByUserId.get(userData.id) : undefined;
    const tierLists = tierListsData ?? [];

    return (
        <div className={`${styles.container} page_width_wrapper header_margin_top`}>
            <div className={styles.content}>
                <div className={styles.content_inner}>
                    <div className={styles.left}>
                        {userData?.avatar_url ? (
                            <img
                                src={getFileUrl(userData.avatar_url)}
                                alt={userData?.username ?? 'Пользователь'}
                                className={styles.avatar}
                            />
                        ) : (
                            <div className={styles.placeholder}>
                                {(userData?.username ?? 'U').slice(0, 1).toUpperCase()}
                            </div>
                        )}
                    </div>

                    <div className={styles.right}>
                        <p className={styles.title}>
                            {isUserLoading ? 'Загрузка...' : (userData?.username ?? 'Пользователь')}
                        </p>
                        <p className={styles.subtitle}>Публичные тир-листы</p>

                        {userData && (
                            <>
                                {incomingRequest ? (
                                    <div className={styles.actions}>
                                        <Button
                                            variant="default"
                                            disabled={acceptRequestMutation.isPending}
                                            onClick={() =>
                                                acceptRequestMutation.mutate({
                                                    body: { requestId: incomingRequest.id },
                                                })
                                            }
                                        >
                                            Принять
                                        </Button>
                                        <Button
                                            variant="outline"
                                            disabled={rejectRequestMutation.isPending}
                                            onClick={() =>
                                                rejectRequestMutation.mutate({
                                                    body: { requestId: incomingRequest.id },
                                                })
                                            }
                                        >
                                            Отклонить
                                        </Button>
                                    </div>
                                ) : isFriend ? (
                                    <Button
                                        variant="outline"
                                        className={styles.primary_action}
                                        disabled={removeFriendMutation.isPending}
                                        onClick={() =>
                                            removeFriendMutation.mutate({
                                                body: { userId: userData.id },
                                            })
                                        }
                                    >
                                        Удалить из друзей
                                    </Button>
                                ) : outgoingRequest ? (
                                    <Button
                                        variant="outline"
                                        className={styles.primary_action}
                                        disabled
                                    >
                                        Запрос отправлен
                                    </Button>
                                ) : (
                                    <AppBtn
                                        text="Добавить в друзья"
                                        style="outline_bright"
                                        className={styles.primary_action}
                                        disabled={sendRequestMutation.isPending}
                                        onClick={() =>
                                            sendRequestMutation.mutate({
                                                body: { userId: userData.id },
                                            })
                                        }
                                    />
                                )}
                            </>
                        )}

                        {isTierListsLoading ? (
                            <div className={styles.emptyState}>Загрузка тир-листов...</div>
                        ) : tierLists.length === 0 ? (
                            <div className={styles.emptyState}>Публичные тир-листы не найдены</div>
                        ) : (
                            <div className={styles.lists}>
                                {tierLists.map((list) => (
                                    <Link
                                        href={`/${game}/tiers/${list.id}`}
                                        key={list.id}
                                        className={styles.listCard}
                                    >
                                        <p className={styles.listTitle}>{list.title}</p>
                                        <p className={styles.listMeta}>{list.categoryName}</p>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
