'use client';

import {
    RandomChallengeWithCategoriesDto,
    RandomGearChallengeGroupEntity,
} from '@/lib/api_client/gen';
import { GameType } from '@/lib/enums/game_type.enum';

import styles from './RandomizerPage.module.css';
import clsx from 'clsx';
import { RandomizerArenaHero } from '@/lib/icons/RandomizerArenaHero';
import {
    RandomPageChallengeGroupSelector,
    RandomPageChallengeSelector,
} from './components/RandomPageChallengeSelector/RandomPageChallengeSelector';
import { usePathname, useRouter } from 'next/navigation';
import { v4 } from 'uuid';
import { useSearchParams } from 'next/navigation';
import { RandomGearView } from './components/RandomGearView/RandomGearView';
import { useQueryClient } from '@tanstack/react-query';
import {
    getRandomLoadout,
    getRandomLoadoutQueryKey,
} from './components/RandomGearView/randomLoadout.query';

export const RandomizerPage = ({
    challenges,
    game,
    groups,
}: {
    game: GameType;
    challenges: RandomChallengeWithCategoriesDto[];
    groups: RandomGearChallengeGroupEntity[];
}) => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const challengeId = searchParams.get('challenge_id');
    const groupId = searchParams.get('group_id');
    const seed = searchParams.get('seed');
    const selectedChallenge = challenges.find((challenge) => challenge.id === challengeId);
    const availableChallenges = challenges
        .filter((challenge) => challenge.random_gear_challenge_group_id === groupId)
        .sort((a, b) => a.order - b.order);

    return (
        <div className={clsx(styles.page, 'page_width_wrapper')}>
            <div className={styles.hero_container}>
                <RandomizerArenaHero className={styles.hero} />
            </div>

            <div className={styles.content}>
                {/* <div className={'w-full'}> */}
                {!groupId && (
                    <RandomPageChallengeGroupSelector
                        onSubmit={(group) => {
                            const newParams = new URLSearchParams(searchParams.toString());
                            newParams.set('group_id', group.id);
                            const firstChallenge = challenges
                                .filter(
                                    (challenge) =>
                                        challenge.random_gear_challenge_group_id === group.id
                                )
                                .sort((a, b) => a.order - b.order)[0];

                            if (!firstChallenge) {
                                return;
                            }

                            const availableChallengesId = firstChallenge.id;
                            const nextSeed = v4();

                            void queryClient.prefetchQuery({
                                queryKey: getRandomLoadoutQueryKey(availableChallengesId, nextSeed),
                                queryFn: () => getRandomLoadout(availableChallengesId, nextSeed),
                            });

                            newParams.set('challenge_id', availableChallengesId);
                            newParams.set('seed', nextSeed);
                            router.push(`${pathname}?${newParams.toString()}`);
                        }}
                        groups={groups}
                    />
                )}
                {groupId && (
                    <RandomPageChallengeSelector
                        onSubmit={(challenge) => {
                            const newParams = new URLSearchParams(searchParams.toString());
                            const nextSeed = v4();

                            void queryClient.prefetchQuery({
                                queryKey: getRandomLoadoutQueryKey(challenge.id, nextSeed),
                                queryFn: () => getRandomLoadout(challenge.id, nextSeed),
                            });

                            newParams.set('challenge_id', challenge.id);
                            newParams.set('seed', nextSeed);
                            router.push(`${pathname}?${newParams.toString()}`);
                        }}
                        currentChallengeId={challengeId}
                        challenges={availableChallenges}
                    />
                )}
                {selectedChallenge && seed && (
                    <RandomGearView
                        seed={seed}
                        challenge={selectedChallenge}
                        onBack={() => {
                            const newParams = new URLSearchParams(searchParams.toString());
                            newParams.delete('challenge_id');
                            newParams.delete('group_id');
                            newParams.delete('seed');
                            router.push(`${pathname}?${newParams.toString()}`);
                        }}
                        onNewGen={() => {
                            const newParams = new URLSearchParams(searchParams.toString());
                            newParams.set('seed', v4());
                            router.push(`${pathname}?${newParams.toString()}`);
                        }}
                    />
                )}
                {/* </div> */}
            </div>
        </div>
    );
};
