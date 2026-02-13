'use client';

import { GameType } from '@/lib/enums/game_type.enum';

import styles from './challenges-list.module.css';
import { ChallengeDifficulty } from '@/lib/enums/challenge_difficulty.enum';
import { Fragment, useMemo, useState } from 'react';
import { ChallengeDifficultySelector } from '../challenge-difficulty-selector/challenge-difficulty-selector';
import { useInfiniteQuery } from '@tanstack/react-query';
import { challengesClientControllerGetProgressingChallengesInfiniteOptions } from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { getPublicClient } from '@/lib/api_client/public_client';
import { ChallengeListItem } from '../challenge-list-item/challenge-list-item';
import { AppSkeleton } from '@/ui/AppSkeleton/AppSkeleton';
import { AppBtn } from '@/ui/SmallBtn/AppBtn';
import { Swords } from 'lucide-react';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

export const ChallengesList = ({
    game,
    season_id,
    authenticated,
    onAuthClick,
}: {
    season_id: string;
    game: GameType;
    authenticated: boolean;
    onAuthClick?: () => void;
}) => {
    const [difficulty, setDifficulty] = useState<ChallengeDifficulty>(ChallengeDifficulty.Easy);

    const { data, isPending, isFetchingNextPage, fetchNextPage, hasNextPage } = useInfiniteQuery({
        ...challengesClientControllerGetProgressingChallengesInfiniteOptions({
            query: {
                limit: DEFAULT_LIMIT,
                page: DEFAULT_PAGE,
                difficulty,
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
        <div className={styles.container}>
            <ChallengeDifficultySelector
                selected={difficulty}
                onSelect={(difficulty) => setDifficulty(difficulty)}
            />
            {challenges.length > 0 || isPending || isFetchingNextPage ? (
                <div className={styles.list}>
                    {challenges.map((challenge) => (
                        <ChallengeListItem
                            key={challenge.id}
                            challenge={challenge}
                            authenticated={authenticated}
                            onAuthClick={onAuthClick}
                        />
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
                        В этой категории пока нет челленджей
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
    );
};
