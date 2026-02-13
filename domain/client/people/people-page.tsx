'use client';

import { useEffect, useMemo, useState } from 'react';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getPublicClient } from '@/lib/api_client/public_client';
import {
    friendsControllerAcceptMutation,
    friendsControllerGetFriendsOptions,
    friendsControllerIncomingOptions,
    friendsControllerOutgoingOptions,
    friendsControllerRejectMutation,
    friendsControllerRemoveFriendMutation,
    friendsControllerSendMutation,
    usersPublicControllerFindPublicInfiniteOptions,
} from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { PublicUserResponseDto } from '@/lib/api_client/gen';
import { GameType } from '@/lib/enums/game_type.enum';
import { getFileUrl } from '@/lib/utils';
import styles from './people-page.module.css';

const PAGE_LIMIT = 20;

type FriendRequestItem = {
    id: string;
    user: PublicUserResponseDto;
    createdAt: string;
};

const useDebouncedValue = (value: string, delay = 300) => {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debounced;
};

export const PeoplePage = ({ game }: { game: GameType }) => {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebouncedValue(search.trim(), 300);

    const client = getPublicClient();

    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
        ...usersPublicControllerFindPublicInfiniteOptions({
            client,
            query: {
                limit: PAGE_LIMIT,
                username: debouncedSearch || undefined,
            },
        }),
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) =>
            lastPage.hasNextPage ? allPages.length + 1 : undefined,
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

    const outgoingByUserId = useMemo(() => {
        const map = new Map<string, FriendRequestItem>();
        (outgoingRequests?.requests ?? []).forEach((request) => {
            if (request.user?.id) {
                map.set(request.user.id, request);
            }
        });
        return map;
    }, [outgoingRequests]);

    const incomingByUserId = useMemo(() => {
        const map = new Map<string, FriendRequestItem>();
        (incomingRequests?.requests ?? []).forEach((request) => {
            if (request.user?.id) {
                map.set(request.user.id, request);
            }
        });
        return map;
    }, [incomingRequests]);

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

    const users = data?.pages.flatMap((page) => page.users) ?? [];

    return (
        <div className={`${styles.container} page_width_wrapper header_margin_top`}>
            <div className={styles.header}>
                <p className={styles.title}>Люди</p>
                <div className={styles.searchRow}>
                    <Input
                        placeholder="Поиск по имени..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                </div>
            </div>

            {isLoading && users.length === 0 ? (
                <div className={styles.emptyState}>Загрузка...</div>
            ) : users.length === 0 ? (
                <div className={styles.emptyState}>Пользователи не найдены</div>
            ) : (
                <div className={styles.grid}>
                    {users.map((user) => {
                        const isFriend = friendIds.has(user.id);
                        return (
                            <div className={styles.card} key={user.id}>
                                <div className={styles.userRow}>
                                    {user.avatar_url ? (
                                        <img
                                            src={getFileUrl(user.avatar_url)}
                                            alt={user.username}
                                            className={styles.avatar}
                                            crossOrigin="anonymous"
                                        />
                                    ) : (
                                        <div className={styles.placeholder}>
                                            {user.username.slice(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <p className={styles.username}>{user.username}</p>
                                    </div>
                                </div>

                                <div className={styles.actions}>
                                    <Button asChild variant="secondary">
                                        <Link href={`/${game}/people/${user.id}`}>Профиль</Link>
                                    </Button>
                                    {incomingByUserId.has(user.id) ? (
                                        <div className="flex gap-2">
                                            <Button
                                                variant="default"
                                                disabled={acceptRequestMutation.isPending}
                                                onClick={() =>
                                                    acceptRequestMutation.mutate({
                                                        body: {
                                                            requestId:
                                                                incomingByUserId.get(user.id)?.id ??
                                                                '',
                                                        },
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
                                                        body: {
                                                            requestId:
                                                                incomingByUserId.get(user.id)?.id ??
                                                                '',
                                                        },
                                                    })
                                                }
                                            >
                                                Отклонить
                                            </Button>
                                        </div>
                                    ) : isFriend ? (
                                        <Button
                                            variant="outline"
                                            disabled={removeFriendMutation.isPending}
                                            onClick={() =>
                                                removeFriendMutation.mutate({
                                                    body: { userId: user.id },
                                                })
                                            }
                                        >
                                            Удалить
                                        </Button>
                                    ) : outgoingByUserId.has(user.id) ? (
                                        <Button variant="outline" disabled>
                                            Запрос отправлен
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="default"
                                            disabled={sendRequestMutation.isPending}
                                            onClick={() =>
                                                sendRequestMutation.mutate({
                                                    body: { userId: user.id },
                                                })
                                            }
                                        >
                                            Добавить
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {hasNextPage && (
                <div className={styles.loadMoreRow}>
                    <Button
                        variant="outline"
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                    >
                        {isFetchingNextPage ? 'Загрузка...' : 'Показать еще'}
                    </Button>
                </div>
            )}
        </div>
    );
};
