'use client';

import { useEffect, useMemo, useState } from 'react';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
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
import { getFileUrl } from '@/lib/utils';
import { toast } from 'sonner';
import styles from './subscriptions-dialog.module.css';
import Link from 'next/link';

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

export const SubscriptionsDialog = ({
    currentUserId,
    game,
}: {
    currentUserId: string;
    game: string;
}) => {
    const client = getPublicClient();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebouncedValue(search.trim(), 300);

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

    const {
        data: usersData,
        isLoading: isUsersLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
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
        enabled: debouncedSearch.length > 0,
    });

    const friendIds = useMemo(
        () => new Set((friendsData?.friends ?? []).map((friend) => friend.id)),
        [friendsData]
    );

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

    const users = (usersData?.pages.flatMap((page) => page.users) ?? []).filter(
        (user) => user.id !== currentUserId
    );
    const friends = friendsData?.friends ?? [];
    const isSearching = debouncedSearch.length > 0;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="secondary">Подписки</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Подписки</DialogTitle>
                </DialogHeader>
                <div className={styles.content}>
                    <Input
                        placeholder="Поиск по имени..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                    <div className={styles.list}>
                        {!isSearching ? (
                            friends.length === 0 ? (
                                <div className={styles.empty}>Пока нет друзей</div>
                            ) : (
                                friends.map((friend) => (
                                    <div className={styles.item} key={friend.id}>
                                        <div className={styles.user}>
                                            {friend.avatar_url ? (
                                                <img
                                                    src={getFileUrl(friend.avatar_url)}
                                                    alt={friend.username}
                                                    className={styles.avatar}
                                                    crossOrigin="anonymous"
                                                />
                                            ) : (
                                                <div className={styles.placeholder}>
                                                    {friend.username.slice(0, 2).toUpperCase()}
                                                </div>
                                            )}
                                            <Link
                                                className={styles.username}
                                                href={`/${game}/people/${friend.id}`}
                                            >
                                                {friend.username}
                                            </Link>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                removeFriendMutation.mutate({
                                                    body: { userId: friend.id },
                                                })
                                            }
                                            disabled={removeFriendMutation.isPending}
                                        >
                                            Удалить
                                        </Button>
                                    </div>
                                ))
                            )
                        ) : isUsersLoading && users.length === 0 ? (
                            <div className={styles.empty}>Загрузка...</div>
                        ) : users.length === 0 ? (
                            <div className={styles.empty}>Пользователи не найдены</div>
                        ) : (
                            users.map((user) => {
                                const isFriend = friendIds.has(user.id);
                                const incoming = incomingByUserId.get(user.id);
                                const outgoing = outgoingByUserId.get(user.id);
                                return (
                                    <div className={styles.item} key={user.id}>
                                        <div className={styles.user}>
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
                                            <Link
                                                className={styles.username}
                                                href={`/${game}/people/${user.id}`}
                                            >
                                                {user.username}
                                            </Link>
                                        </div>

                                        {incoming ? (
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() =>
                                                        acceptRequestMutation.mutate({
                                                            body: { requestId: incoming.id },
                                                        })
                                                    }
                                                    disabled={acceptRequestMutation.isPending}
                                                >
                                                    Принять
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        rejectRequestMutation.mutate({
                                                            body: { requestId: incoming.id },
                                                        })
                                                    }
                                                    disabled={rejectRequestMutation.isPending}
                                                >
                                                    Отклонить
                                                </Button>
                                            </div>
                                        ) : isFriend ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    removeFriendMutation.mutate({
                                                        body: { userId: user.id },
                                                    })
                                                }
                                                disabled={removeFriendMutation.isPending}
                                            >
                                                Удалить
                                            </Button>
                                        ) : outgoing ? (
                                            <Button size="sm" variant="outline" disabled>
                                                Запрос отправлен
                                            </Button>
                                        ) : (
                                            <Button
                                                size="sm"
                                                onClick={() =>
                                                    sendRequestMutation.mutate({
                                                        body: { userId: user.id },
                                                    })
                                                }
                                                disabled={sendRequestMutation.isPending}
                                            >
                                                Добавить
                                            </Button>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {isSearching && hasNextPage && (
                        <div className="flex justify-center">
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
            </DialogContent>
        </Dialog>
    );
};
