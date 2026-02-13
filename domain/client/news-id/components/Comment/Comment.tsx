'use client';

import { GetNewsCommentsResponseItemDto } from '@/lib/api_client/gen';
import styles from './Comment.module.css';
import { getFileUrl } from '@/lib/utils';
import { VoteArrow } from '@/lib/icons/VoteArrow';
import clsx from 'clsx';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { commentsControllerVoteNewsCommentMutation } from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { getPublicClient } from '@/lib/api_client/public_client';
import { ru } from 'date-fns/locale';
import { formatDistanceToNow, format } from 'date-fns';

const formatCommentDate = (input: string | Date) => {
    const date = new Date(input);

    const currentDate = new Date();

    const diff = currentDate.getTime() - date.getTime();

    const diffInMinutes = Math.floor(diff / 1000 / 60);

    if (diffInMinutes < 60) {
        return formatDistanceToNow(date, { locale: ru, addSuffix: true });
    }

    return format(date, 'dd.MM.yyyy HH:mm', { locale: ru });
};

export const Comment = ({ comment }: { comment: GetNewsCommentsResponseItemDto }) => {
    const [vote, setVote] = useState<'like' | 'dislike' | undefined>(comment.vote);
    const [likesCount, setLikesCount] = useState(comment.likes_count);
    const [dislikesCount, setDislikesCount] = useState(comment.dislikes_count);

    // Store previous state for rollback on error
    const [prevVote, setPrevVote] = useState<'like' | 'dislike' | undefined>(comment.vote);
    const [prevLikesCount, setPrevLikesCount] = useState(comment.likes_count);
    const [prevDislikesCount, setPrevDislikesCount] = useState(comment.dislikes_count);

    const { mutate, isPending } = useMutation({
        ...commentsControllerVoteNewsCommentMutation({
            client: getPublicClient(),
        }),

        onError: () => {
            // Rollback to previous state on error
            setVote(prevVote);
            setLikesCount(prevLikesCount);
            setDislikesCount(prevDislikesCount);
        },
    });

    const handleVote = (newVote: 'like' | 'dislike') => {
        // Prevent voting while request is pending
        if (isPending) return;

        // Store current state for potential rollback
        setPrevVote(vote);
        setPrevLikesCount(likesCount);
        setPrevDislikesCount(dislikesCount);

        // Optimistically update vote state
        setVote((prev) => (prev === newVote ? undefined : newVote));

        // Calculate optimistic count updates
        let newLikesCount = likesCount;
        let newDislikesCount = dislikesCount;

        if (vote === newVote) {
            // User is removing their vote
            if (newVote === 'like') {
                newLikesCount = Math.max(0, likesCount - 1);
            } else {
                newDislikesCount = Math.max(0, dislikesCount - 1);
            }
        } else if (vote === undefined) {
            // User is voting for the first time
            if (newVote === 'like') {
                newLikesCount = likesCount + 1;
            } else {
                newDislikesCount = dislikesCount + 1;
            }
        } else {
            // User is changing their vote from like to dislike or vice versa
            if (newVote === 'like') {
                newLikesCount = likesCount + 1;
                newDislikesCount = Math.max(0, dislikesCount - 1);
            } else {
                newDislikesCount = dislikesCount + 1;
                newLikesCount = Math.max(0, likesCount - 1);
            }
        }

        // Optimistically update counts
        setLikesCount(newLikesCount);
        setDislikesCount(newDislikesCount);

        mutate({
            body: {
                comment_id: comment.id,
                vote: newVote,
            },
        });
    };

    return (
        <div className={styles.container}>
            <img
                src={comment.user.avatar_url ? getFileUrl(comment.user.avatar_url) : ''}
                alt={comment.user.username}
                className={styles.avatar}
            />

            <div className={styles.content}>
                <div className={styles.user}>
                    <p className={styles.username}>{comment.user.username}</p>
                    <p className={styles.date}>{formatCommentDate(comment.createdAt)}</p>
                </div>

                <p className={styles.text}>{comment.content}</p>
            </div>

            <div className={styles.actions}>
                <div
                    className={clsx(
                        styles.vote_container,
                        vote === 'like' && styles.active,
                        isPending && styles.loading
                    )}
                    onClick={() => {
                        handleVote('like');
                    }}
                >
                    <VoteArrow className={clsx(styles.icon, vote === 'like' && styles.active)} />

                    <p className={styles.count}>{likesCount}</p>
                </div>

                <div
                    className={clsx(
                        styles.vote_container,
                        vote === 'dislike' && styles.active,
                        isPending && styles.loading
                    )}
                    onClick={() => {
                        handleVote('dislike');
                    }}
                >
                    <VoteArrow
                        className={clsx(
                            styles.icon,
                            styles.down,
                            vote === 'dislike' && styles.active
                        )}
                    />

                    <p className={styles.count}>{dislikesCount}</p>
                </div>
            </div>
        </div>
    );
};
