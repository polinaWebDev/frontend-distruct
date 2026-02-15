'use client';

import { ChallengeSeasonUserBalanceEntity, CurrentSeasonDto } from '@/lib/api_client/gen';
import { GameType } from '@/lib/enums/game_type.enum';
import {
    ChallengeInfoBlock,
    ChallengeInfoBlockDesc,
    ChallengeInfoBlockPoints,
    ChallengeInfoBlockSeasonInfo,
    ChallengeInfoBlockTitle,
    ChallengeInfoBlockWave,
} from './components/challenge-info-block/challenge-info-block';
import styles from './challenges-main.module.css';
import clsx from 'clsx';
import { TrophyIcon } from '@/lib/icons/TrophyIcon';
import { CurrentSeasonIcon } from '@/lib/icons/CurrentSeasonIcon';
import { formatDate } from 'date-fns';
import { ru } from 'date-fns/locale';
import { AppBtn } from '@/ui/SmallBtn/AppBtn';
import Link from 'next/link';
import { ChallengesList } from './components/challenges-list/challenges-list';
import { useState } from 'react';
import { Dialog } from 'radix-ui';
import { ChallengeOfferDialog } from './components/challenge-offer-dialog/challenge-offer-dialog';
import { AuthDialog } from '@/domain/Layout/Header/AuthDialog/AuthDialog';

export type ChallengesMainProps = {
    game: GameType;
    season: CurrentSeasonDto;
    seasonBalance?: ChallengeSeasonUserBalanceEntity;
    authenticated: boolean;
};

export const ChallengesMain = ({
    game,
    authenticated,
    season,
    seasonBalance,
}: ChallengesMainProps) => {
    const [showOfferDialog, setShowOfferDialog] = useState(false);
    const [openAuthDialog, setOpenAuthDialog] = useState(false);
    return (
        <div className={clsx(styles.wrapper, 'header_margin_top', 'page_width_wrapper')}>
            <div className={styles.content}>
                <div className={styles.info_blocks}>
                    <ChallengeInfoBlock>
                        <ChallengeInfoBlockTitle icon={<TrophyIcon />}>
                            Доступные Награды
                        </ChallengeInfoBlockTitle>
                        <ChallengeInfoBlockPoints
                            btnText="Награды"
                            points={seasonBalance?.balance ?? 0}
                            subTitle="Кол-во ваших очков"
                            btnLink={authenticated ? `/${game}/challenges/rewards` : undefined}
                            btnOnClick={authenticated ? undefined : () => setOpenAuthDialog(true)}
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

                    <ChallengeInfoBlock>
                        <ChallengeInfoBlockTitle>Мои челленджи</ChallengeInfoBlockTitle>
                        <ChallengeInfoBlockDesc>
                            Посмотрите историю ваших выполненных челенджей
                        </ChallengeInfoBlockDesc>

                        <Link
                            href={`/${game}/challenges/progress/${season.id}`}
                            onClick={
                                authenticated
                                    ? undefined
                                    : (e) => {
                                          e.preventDefault();
                                          setOpenAuthDialog(true);
                                      }
                            }
                            className="mt-auto max-w-[150px] w-full"
                        >
                            <AppBtn text="Перейти" className="w-full" />
                        </Link>
                    </ChallengeInfoBlock>

                    <ChallengeInfoBlock>
                        <ChallengeInfoBlockTitle>Предложить свой челлендж</ChallengeInfoBlockTitle>
                        <ChallengeInfoBlockDesc>
                            Если у вас есть идея интересного задания, предложите её нам
                        </ChallengeInfoBlockDesc>

                        <AppBtn
                            text="Предложить"
                            style={'outline_brand'}
                            className="mt-auto max-w-[150px] w-full"
                            onClick={() => {
                                if (!authenticated) {
                                    setOpenAuthDialog(true);
                                    return;
                                }
                                setShowOfferDialog(true);
                            }}
                        />

                        <Dialog.Root open={showOfferDialog} onOpenChange={setShowOfferDialog}>
                            <ChallengeOfferDialog onClose={() => setShowOfferDialog(false)} />
                        </Dialog.Root>
                    </ChallengeInfoBlock>
                </div>

                <ChallengesList
                    game={game}
                    season_id={season.id}
                    authenticated={authenticated}
                    onAuthClick={() => setOpenAuthDialog(true)}
                />
            </div>

            <Dialog.Root open={openAuthDialog} onOpenChange={setOpenAuthDialog}>
                <AuthDialog onClose={() => setOpenAuthDialog(false)} />
            </Dialog.Root>
        </div>
    );
};
