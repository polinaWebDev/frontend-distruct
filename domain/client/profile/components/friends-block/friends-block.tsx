'use client';

import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getPublicClient } from '@/lib/api_client/public_client';
import {
    friendsControllerGetFriendsOptions,
    friendsControllerRemoveFriendMutation,
} from '@/lib/api_client/gen/@tanstack/react-query.gen';
import styles from './friends-block.module.css';

export const FriendsBlock = ({ game }: { game: string }) => {
    const client = getPublicClient();
    const queryClient = useQueryClient();

    const { data: friendsData } = useQuery({
        ...friendsControllerGetFriendsOptions({
            client,
        }),
        retry: false,
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

    const friends = useMemo(() => friendsData?.friends ?? [], [friendsData]);

    return (
        <div className={styles.block}>
            {/*<p className={styles.title}>Друзья</p>*/}
            {/*<div className={styles.list}>*/}
            {/*    {friends.length === 0 ? (*/}
            {/*        <p className={styles.empty}>Пока нет друзей</p>*/}
            {/*    ) : (*/}
            {/*        friends.map((friend) => (*/}
            {/*            <div className={styles.item} key={friend.id}>*/}
            {/*                <div className={styles.user}>*/}
            {/*                    {friend.avatar_url ? (*/}
            {/*                        <img*/}
            {/*                            src={getFileUrl(friend.avatar_url)}*/}
            {/*                            alt={friend.username}*/}
            {/*                            className={styles.avatar}*/}
            {/*                            crossOrigin="anonymous"*/}
            {/*                        />*/}
            {/*                    ) : (*/}
            {/*                        <div className={styles.placeholder}>*/}
            {/*                            {friend.username.slice(0, 2).toUpperCase()}*/}
            {/*                        </div>*/}
            {/*                    )}*/}
            {/*                    <Link className={styles.username} href={`/${game}/people/${friend.id}`}>*/}
            {/*                        {friend.username}*/}
            {/*                    </Link>*/}
            {/*                </div>*/}
            {/*                <Button*/}
            {/*                    size="sm"*/}
            {/*                    variant="outline"*/}
            {/*                    disabled={removeFriendMutation.isPending}*/}
            {/*                    onClick={() =>*/}
            {/*                        removeFriendMutation.mutate({*/}
            {/*                            body: { userId: friend.id },*/}
            {/*                        })*/}
            {/*                    }*/}
            {/*                >*/}
            {/*                    Удалить*/}
            {/*                </Button>*/}
            {/*            </div>*/}
            {/*        ))*/}
            {/*    )}*/}
            {/*</div>*/}
        </div>
    );
};
