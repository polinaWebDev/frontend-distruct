'use client';

import { ChallengeSeasonUserBalanceEntity, CurrentSeasonDto } from '@/lib/api_client/gen/types.gen';
import { GameType } from '@/lib/enums/game_type.enum';
import clsx from 'clsx';
import { Fragment, useMemo, useState } from 'react';
import styles from './challenges-rewards.module.css';
import {
    ChallengeInfoBlock,
    ChallengeInfoBlockPoints,
    ChallengeInfoBlockSeasonInfo,
    ChallengeInfoBlockTitle,
    ChallengeInfoBlockWave,
} from '../challenges-main/components/challenge-info-block/challenge-info-block';
import { TrophyIcon, PackageOpen } from 'lucide-react';
import { CurrentSeasonIcon } from '@/lib/icons/CurrentSeasonIcon';
import { formatDate } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Dialog } from 'radix-ui';
import { AuthDialog } from '@/domain/Layout/Header/AuthDialog/AuthDialog';
import { useInfiniteQuery } from '@tanstack/react-query';
import { shopControllerGetListInfiniteOptions } from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { RewardItem } from './components/reward-item/reward-item';
import { AppSkeleton } from '@/ui/AppSkeleton/AppSkeleton';
import { AppBtn } from '@/ui/SmallBtn/AppBtn';
import { getPublicClient } from '@/lib/api_client/public_client';
export type ChallengesRewardsProps = {
    game: GameType;
    season: CurrentSeasonDto;
    seasonBalance?: ChallengeSeasonUserBalanceEntity;
    authenticated: boolean;
};

const LIMIT = 20;

export const ChallengesRewards = ({
    game,
    season,
    seasonBalance,
    authenticated,
}: ChallengesRewardsProps) => {
    const [showOfferDialog, setShowOfferDialog] = useState(false);
    const [openAuthDialog, setOpenAuthDialog] = useState(false);

    const {
        data: shopItems,
        isPending,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
    } = useInfiniteQuery({
        ...shopControllerGetListInfiniteOptions({
            query: {
                game_type: game,
                page: 1,
                limit: LIMIT,
            },
            client: getPublicClient(),
        }),
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
            if (!lastPage || lastPage.length === 0) {
                return undefined;
            }
            const responseDto = lastPage;
            if (!responseDto || responseDto.length < LIMIT) {
                return undefined;
            }
            return allPages.length + 1;
        },
    });

    const rewards = useMemo(() => {
        return shopItems?.pages.flatMap((page) => page ?? []) ?? [];
    }, [shopItems]);

    return (
        <div className={clsx(styles.wrapper, 'header_margin_top', 'page_width_wrapper')}>
            <div className={styles.content}>
                <h1 className={styles.title}>Доступные награды</h1>
                <div className={styles.info_blocks}>
                    <ChallengeInfoBlock>
                        <ChallengeInfoBlockTitle icon={<TrophyIcon />}>
                            Доступные Награды
                        </ChallengeInfoBlockTitle>
                        <ChallengeInfoBlockPoints
                            btnText="Награды"
                            points={seasonBalance?.balance ?? 0}
                            subTitle="Кол-во ваших очков"
                        />
                    </ChallengeInfoBlock>
                    <ChallengeInfoBlock noBottomPadding outerChildren={<ChallengeInfoBlockWave />}>
                        <ChallengeInfoBlockTitle icon={<CurrentSeasonIcon />}>
                            Текущий сезон
                        </ChallengeInfoBlockTitle>
                        <ChallengeInfoBlockSeasonInfo
                            items={[
                                {
                                    subTitle: 'Сезон',
                                    content: season.name,
                                },
                                {
                                    subTitle: 'Закончится',
                                    content: formatDate(new Date(season.ends_at), 'dd.MM.yyyy', {
                                        locale: ru,
                                    }),
                                },
                                {
                                    subTitle: 'Наград',
                                    content: season.rewards_count.toString(),
                                },
                                {
                                    subTitle: 'Челленджей',
                                    content: season.challenges_count.toString(),
                                },
                            ]}
                        />
                    </ChallengeInfoBlock>
                </div>
                {rewards.length > 0 || isPending || isFetchingNextPage ? (
                    <div className={styles.rewards}>
                        {rewards.map((reward) => (
                            <RewardItem
                                key={reward.id}
                                reward={reward}
                                balance={seasonBalance?.balance ?? 0}
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
                        <PackageOpen className={styles.empty_state_icon} />
                        <span className={styles.empty_state_text}>
                            В этом сезоне пока нет доступных вам наград
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

            <Dialog.Root open={openAuthDialog} onOpenChange={setOpenAuthDialog}>
                <AuthDialog onClose={() => setOpenAuthDialog(false)} />
            </Dialog.Root>
        </div>
    );
};
