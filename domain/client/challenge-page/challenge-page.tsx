'use client';

import { GetChallengeByIdWithProgressResponseDto } from '@/lib/api_client/gen';
import styles from './challenge-page.module.css';
import clsx from 'clsx';
import { RandomGearItem } from '@/domain/Randomizer/components/RandomGearItem/RandomGearItem';
import { PhotoProvider } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import { CHALLENGE_DIFFICULTY_VALUES } from '@/lib/enums/challenge_difficulty.enum';
import { formatDistance } from 'date-fns';
import { ru } from 'date-fns/locale';
import { AppBtn } from '@/ui/SmallBtn/AppBtn';
import { GoBackBig } from '@/ui/GoBackBig/GoBackBig';
import Link from 'next/link';
import { useCallback, useState } from 'react';
import { AcceptChallengeDialog } from './components/accept-challenge-dialog/accept-challenge-dialog';
import { Dialog } from 'radix-ui';
import {
    challengesClientControllerAcceptChallengeMutation,
    challengesClientControllerRetryChallengeMutation,
} from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { getPublicClient } from '@/lib/api_client/public_client';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { UploadForReviewDialog } from './components/upload-for-review-dialog/upload-for-review-dialog';
import { useInterval } from 'react-use';

const ChallengeInfoItem = ({
    title,
    value,
    className,
    value_color,
}: {
    title?: string;
    value?: string;
    className?: string;
    value_color?: string;
}) => {
    return (
        <div className={styles.challenge_info_item}>
            {title && <p className={styles.title}>{title}</p>}
            {value && (
                <p className={clsx(styles.value, className)} style={{ color: value_color }}>
                    {value}
                </p>
            )}
        </div>
    );
};

const formatTimeLimit = (timeLimit: number) => {
    const hours = Math.floor(timeLimit / 3600);
    const minutes = Math.floor((timeLimit % 3600) / 60);
    const seconds = timeLimit % 60;
    return `${hours}ч ${minutes}м ${seconds}с`;
};

const ChallengeBtn = ({ challenge }: { challenge: GetChallengeByIdWithProgressResponseDto }) => {
    const progress = challenge.progress;
    const [openAcceptChallengeDialog, setOpenAcceptChallengeDialog] = useState(false);
    const [openUploadForReviewDialog, setOpenUploadForReviewDialog] = useState(false);
    const [openRetryChallengeDialog, setOpenRetryChallengeDialog] = useState(false);
    const { mutate: acceptChallenge, isPending } = useMutation({
        ...challengesClientControllerAcceptChallengeMutation({
            client: getPublicClient(),
        }),
        onSuccess: () => {
            toast.success('Челлендж принят');
            location.reload();
        },
        onError: (error) => {
            toast.error('Ошибка при принятии челленджа');
        },
    });

    const { mutate: retryChallenge, isPending: isRetryPending } = useMutation({
        ...challengesClientControllerRetryChallengeMutation({
            client: getPublicClient(),
        }),
        onSuccess: () => {
            toast.success('Челлендж повторён');
            location.reload();
        },
        onError: (error) => {
            toast.error('Ошибка при повторении челленджа');
        },
    });

    if (!progress) {
        return (
            <>
                <AppBtn
                    text="Начать выполнение"
                    big
                    className={styles.btn}
                    weight={'medium'}
                    onClick={() => setOpenAcceptChallengeDialog(true)}
                />
                <Dialog.Root
                    open={openAcceptChallengeDialog}
                    onOpenChange={setOpenAcceptChallengeDialog}
                >
                    <AcceptChallengeDialog
                        title={challenge.title}
                        description={'Вы уверены, что хотите принять этот челлендж?'}
                        onClose={() => setOpenAcceptChallengeDialog(false)}
                        onAccept={() =>
                            acceptChallenge({
                                body: {
                                    challenge_id: challenge.id,
                                },
                            })
                        }
                    />
                </Dialog.Root>
            </>
        );
    }

    const status = progress.status;

    if (status === 'started') {
        return (
            <>
                <AppBtn
                    text="Загрузить результат"
                    style={'outline_brand'}
                    big
                    className={styles.btn}
                    weight={'medium'}
                    onClick={() => setOpenUploadForReviewDialog(true)}
                />

                <Dialog.Root
                    open={openUploadForReviewDialog}
                    onOpenChange={setOpenUploadForReviewDialog}
                >
                    <UploadForReviewDialog
                        onClose={() => setOpenUploadForReviewDialog(false)}
                        progress_id={progress.id}
                    />
                </Dialog.Root>
            </>
        );
    }

    if (status === 'completed') {
        return <AppBtn text="Выполнен" disabled big className={styles.btn} weight={'medium'} />;
    }

    if (status === 'waiting_for_review') {
        return (
            <AppBtn text="Ожидает проверки" disabled big className={styles.btn} weight={'medium'} />
        );
    }

    if (status === 'in_review') {
        return <AppBtn text="На проверке" disabled big className={styles.btn} weight={'medium'} />;
    }

    if (status === 'failed') {
        return (
            <>
                <AppBtn
                    text={progress.can_be_retried ? 'Попробовать снова' : 'Неудача'}
                    style={progress.can_be_retried ? 'outline_brand' : 'outline_red'}
                    big
                    className={styles.btn}
                    weight={'medium'}
                    onClick={() => progress.can_be_retried && setOpenRetryChallengeDialog(true)}
                />
                <Dialog.Root
                    open={openRetryChallengeDialog}
                    onOpenChange={setOpenRetryChallengeDialog}
                >
                    <AcceptChallengeDialog
                        title={challenge.title}
                        description={'Вы уверены, что хотите повторить этот челлендж?'}
                        onClose={() => setOpenRetryChallengeDialog(false)}
                        onAccept={() =>
                            retryChallenge({
                                body: {
                                    progress_id: String(progress.id),
                                },
                            })
                        }
                    />
                </Dialog.Root>
            </>
        );
    }

    return <AppBtn text="Начать" big className={styles.btn} weight={'medium'} />;
};

const useExpireInSeconds = (timeLimitedAt?: Date) => {
    const [timeStr, setTimeStr] = useState<string | null>();
    const handle = useCallback(() => {
        if (!timeLimitedAt) return;
        const diff = timeLimitedAt.getTime() - Date.now();
        if (diff <= 0) {
            setTimeStr('00:00:00');
            return;
        }
        setTimeStr(formatTimeLimit(Math.floor((timeLimitedAt.getTime() - Date.now()) / 1000)));
    }, [timeLimitedAt]);

    useInterval(() => {
        handle();
    }, 1000);

    return timeStr;
};

export const ChallengePage = ({
    challenge,
}: {
    challenge: GetChallengeByIdWithProgressResponseDto;
}) => {
    const gear = challenge.gears;

    const difficulty = CHALLENGE_DIFFICULTY_VALUES.find((d) => d.value === challenge.difficulty);
    const difficultyColor = difficulty?.color;
    let difficultyLabel = difficulty?.adjective ?? '';
    difficultyLabel = difficultyLabel.charAt(0).toUpperCase() + difficultyLabel.slice(1);

    const expireIn = challenge.progress?.time_limited_at
        ? formatDistance(new Date(challenge.progress?.time_limited_at), new Date(), {
              addSuffix: true,
              locale: ru,
          })
        : null;

    const expireInSeconds = useExpireInSeconds(
        challenge.progress?.time_limited_at
            ? new Date(challenge.progress?.time_limited_at)
            : undefined
    );

    return (
        <div className={clsx(styles.wrapper, 'header_margin_top', 'page_width_wrapper')}>
            <div className={styles.content}>
                <div className={styles.left}>
                    <h1>{challenge.title}</h1>
                    <div className={styles.challenge_info}>
                        <ChallengeInfoItem title="Описание" value={challenge.description} />
                        <ChallengeInfoItem
                            title="Сложность"
                            value={difficultyLabel}
                            value_color={difficultyColor}
                        />
                        <ChallengeInfoItem
                            title="Очков за выполнение"
                            value={'+' + challenge.prize_amount.toString()}
                        />
                        {challenge.progress?.review_comment && (
                            <ChallengeInfoItem
                                title="Комментарий модератора"
                                value={challenge.progress.review_comment}
                            />
                        )}

                        {!expireIn &&
                            challenge.time_limit_in_seconds &&
                            challenge.time_limit_in_seconds > 0 && (
                                <ChallengeInfoItem
                                    title="Время на выполнение"
                                    value={formatTimeLimit(challenge.time_limit_in_seconds)}
                                />
                            )}
                        {expireInSeconds && challenge.progress?.status === 'started' && (
                            <ChallengeInfoItem
                                title="Осталось времени для выполнения:"
                                value={expireInSeconds}
                            />
                        )}
                    </div>

                    <div className={styles.buttons}>
                        <ChallengeBtn challenge={challenge} />

                        <Link href={`/${challenge.game_type}/challenges`}>
                            <GoBackBig className={styles.go_back_btn} />
                        </Link>
                    </div>
                </div>
                <div className={styles.right}>
                    <div className={styles.gear_list}>
                        <PhotoProvider>
                            {gear.map((g) => (
                                <RandomGearItem
                                    key={g.id}
                                    category={{
                                        category_description: g.category?.description || '',
                                        category_id: g.category?.id || '',
                                        category_name: g.category?.name || '',
                                        category_order: g.category?.order || 0,
                                        category_image_url: g.category?.image_url || '',
                                        is_long_slot: g.category?.is_long_slot || false,
                                    }}
                                    gear={g}
                                    isLoading={false}
                                />
                            ))}
                        </PhotoProvider>
                    </div>
                    {challenge?.additional_conditions &&
                        challenge?.additional_conditions.length > 0 && (
                            <div className={styles.additional_challenges_container}>
                                <p className={styles.title}>Дополнительное усложнение</p>
                                <div className={styles.items}>
                                    {challenge?.additional_conditions.map((condition) => (
                                        <div className={styles.item} key={condition}>
                                            <p>{condition}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                </div>
            </div>
        </div>
    );
};
