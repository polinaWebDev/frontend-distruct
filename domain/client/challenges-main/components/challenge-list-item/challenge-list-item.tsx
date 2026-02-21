'use client';

import { GetAllChallengesWithProgressItemDto } from '@/lib/api_client/gen';
import styles from './challenge-list-item.module.css';
import { useMemo } from 'react';
import { CHALLENGE_DIFFICULTY_VALUES } from '@/lib/enums/challenge_difficulty.enum';
import { AppBtn } from '@/ui/SmallBtn/AppBtn';
import Link from 'next/link';
import clsx from 'clsx';
import { getFileUrl } from '@/lib/utils';
import Image from 'next/image';

const getChallengeRewardImage = (challenge: GetAllChallengesWithProgressItemDto): string | null => {
    const prize = challenge.prize_cosmetic_id;
    if (!prize || typeof prize !== 'object') return null;

    const asRecord = prize as Record<string, unknown>;
    const directAsset = asRecord.asset_url;
    if (typeof directAsset === 'string' && directAsset.trim()) return directAsset;

    const nestedCosmetic = asRecord.prize_cosmetic;
    if (nestedCosmetic && typeof nestedCosmetic === 'object') {
        const nestedRecord = nestedCosmetic as Record<string, unknown>;
        const nestedAsset = nestedRecord.asset_url;
        if (typeof nestedAsset === 'string' && nestedAsset.trim()) return nestedAsset;
    }

    return null;
};

const ChallengeBtn = ({ challenge }: { challenge: GetAllChallengesWithProgressItemDto }) => {
    const progress = challenge.progress;

    if (!progress) {
        return <AppBtn text="Выполнить" className={clsx(styles.btn, 'w-full')} />;
    }

    if (progress.status === 'completed') {
        return (
            <AppBtn
                text="Выполнено"
                style={'outline_bright'}
                className={clsx(styles.btn, 'w-full')}
            />
        );
    }

    if (progress.status === 'in_review') {
        return (
            <AppBtn
                text="В процессе проверки"
                style={'outline_dark'}
                className={clsx(styles.btn, 'w-full')}
            />
        );
    }

    if (progress.status === 'failed') {
        return (
            <AppBtn
                text={progress.can_be_retried ? 'Повторить' : 'Неудача'}
                style={'outline_red'}
                className={clsx(styles.btn, 'w-full')}
            />
        );
    }

    if (progress.status === 'cancelled') {
        return (
            <AppBtn text="Отменено" style={'outline_red'} className={clsx(styles.btn, 'w-full')} />
        );
    }
    if (progress.status === 'waiting_for_review') {
        return (
            <AppBtn
                text="Ожидает проверки"
                style={'outline_dark'}
                className={clsx(styles.btn, 'w-full')}
            />
        );
    }

    if (progress.status === 'started') {
        return (
            <AppBtn
                text="Выполняется"
                style={'outline_bright'}
                className={clsx(styles.btn, 'w-full')}
            />
        );
    }

    return <AppBtn text="Выполнить" className={clsx(styles.btn, 'w-full')} />;
};

export const ChallengeListItem = ({
    challenge,
    authenticated,
    onAuthClick,
}: {
    authenticated?: boolean;
    challenge: GetAllChallengesWithProgressItemDto;
    onAuthClick?: () => void;
}) => {
    const difficulty = useMemo(() => {
        return CHALLENGE_DIFFICULTY_VALUES.find(
            (difficulty) => difficulty.value === challenge.difficulty
        );
    }, [challenge.difficulty]);
    const rewardImage = useMemo(() => getChallengeRewardImage(challenge), [challenge]);

    return (
        <Link
            href={`/${challenge.game_type}/challenges/${challenge.id}`}
            className={styles.container}
            onClick={(e) => {
                if (!authenticated) {
                    e.preventDefault();
                    onAuthClick?.();
                }
            }}
        >
            <div className={styles.content}>
                {rewardImage && (
                    <Image
                        src={getFileUrl(rewardImage)}
                        alt="Награда"
                        className={styles.reward_img}
                        width={68}
                        height={68}
                    />
                )}
                <div className={styles.title_container}>
                    <p className={styles.title}>{challenge.title}</p>
                    <p className={styles.desc}>{challenge.short_description}</p>
                </div>

                <div className={styles.meta_container}>
                    <div className={styles.text_item}>
                        <div className={styles.text_item_title}>Сложность</div>
                        <div className={styles.text_item_desc} style={{ color: difficulty?.color }}>
                            {difficulty?.adjective}
                        </div>
                    </div>

                    <div className={styles.text_item}>
                        <div className={styles.text_item_title}>Очков</div>
                        <div className={styles.text_item_desc}>{challenge.prize_amount}</div>
                    </div>
                </div>
            </div>

            <ChallengeBtn challenge={challenge} />
        </Link>
    );
};
