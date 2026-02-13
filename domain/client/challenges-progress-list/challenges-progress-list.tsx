'use client';

import { challengesClientControllerGetProgressingChallengesInfiniteOptions } from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { getPublicClient } from '@/lib/api_client/public_client';
import {
    CHALLENGE_PROGRESS_STATUS_VALUES,
    ChallengeProgressStatus,
} from '@/lib/enums/challenge-progress-status.enum';
import { GameType } from '@/lib/enums/game_type.enum';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Fragment, useMemo, useState } from 'react';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

import styles from './challenges-progress-list.module.css';
import clsx from 'clsx';
import { AppBtn } from '@/ui/SmallBtn/AppBtn';
import { ChallengeListItem } from '../challenges-main/components/challenge-list-item/challenge-list-item';
import { AppSkeleton } from '@/ui/AppSkeleton/AppSkeleton';
import { Swords } from 'lucide-react';

export const ChallengesProgressList = ({
    game,
    season_id,
}: {
    game: GameType;
    season_id: string;
}) => {
    const [status, setStatus] = useState<ChallengeProgressStatus>(ChallengeProgressStatus.Started);

    const { data, isPending, isFetchingNextPage, fetchNextPage, hasNextPage } = useInfiniteQuery({
        ...challengesClientControllerGetProgressingChallengesInfiniteOptions({
            query: {
                limit: DEFAULT_LIMIT,
                page: DEFAULT_PAGE,
                status,
                game_type: game,
                season_id,
            },
            client: getPublicClient(),
        }),
        initialPageParam: DEFAULT_PAGE,
        getNextPageParam: (lastPage, allPages) => {
            if (!lastPage || lastPage.length === 0) {
                return undefined;
            }
            const responseDto = lastPage;
            if (!responseDto || responseDto.length < DEFAULT_LIMIT) {
                return undefined;
            }
            return allPages.length + 1;
        },
    });

    const challenges = useMemo(() => {
        return data?.pages.flatMap((page) => page ?? []) ?? [];
    }, [data]);

    return (
        <div className={clsx(styles.wrapper, 'header_margin_top', 'page_width_wrapper')}>
            <div className={styles.content}>
                <h1 className={styles.title}>Ваши челленджи</h1>
                <div className={styles.status_selector}>
                    {CHALLENGE_PROGRESS_STATUS_VALUES.map((s) => (
                        <AppBtn
                            key={s.value}
                            text={s.label}
                            onClick={() => setStatus(s.value)}
                            style={s.value === status ? 'outline_brand' : 'outline_dark'}
                            className={clsx(styles.status_selector_item)}
                        />
                    ))}
                </div>

                {challenges.length > 0 || isPending || isFetchingNextPage ? (
                    <div className={styles.list}>
                        {challenges.map((challenge) => (
                            <ChallengeListItem key={challenge.id} challenge={challenge} />
                        ))}
                        {(isFetchingNextPage || isPending) && (
                            <Fragment>
                                <AppSkeleton className={styles.sk} />
                                <AppSkeleton className={styles.sk} />
                                <AppSkeleton className={styles.sk} />
                                <AppSkeleton className={styles.sk} />
                            </Fragment>
                        )}
                    </div>
                ) : (
                    <div className={styles.empty_state}>
                        <Swords className={styles.empty_state_icon} />
                        <span className={styles.empty_state_text}>
                            Список челленджей с этим статусом пуст
                        </span>
                    </div>
                )}

                {hasNextPage && (
                    <div className={styles.load_more_btn_container}>
                        <AppBtn
                            text="Загрузить ещё"
                            onClick={() => fetchNextPage()}
                            disabled={isFetchingNextPage}
                            className={styles.load_more_btn}
                            style={'outline_dark'}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
