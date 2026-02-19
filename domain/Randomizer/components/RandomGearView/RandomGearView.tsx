import { RandomChallengeWithCategoriesDto } from '@/lib/api_client/gen';
import { useQuery } from '@tanstack/react-query';
import styles from './RandomGearView.module.css';
import { GoBackBig } from '@/ui/GoBackBig/GoBackBig';
import { AppBtn } from '@/ui/SmallBtn/AppBtn';
import { RandomGearItem } from '../RandomGearItem/RandomGearItem';
import { PhotoProvider } from 'react-photo-view';
import { getRandomLoadout, getRandomLoadoutQueryKey } from './randomLoadout.query';

export const RandomGearView = ({
    seed,
    challenge,
    onBack,
    onNewGen,
}: {
    seed: string | null;
    challenge: RandomChallengeWithCategoriesDto;
    onBack: () => void;
    onNewGen: () => void;
}) => {
    const hasSeed = !!seed;
    const { data: result, isPending } = useQuery({
        queryKey: getRandomLoadoutQueryKey(challenge.id, seed),
        queryFn: () => getRandomLoadout(challenge.id, seed),
        enabled: hasSeed,
    });
    const isLoadoutLoading = hasSeed && isPending;

    return (
        <div className={styles.container}>
            {/* <div className={styles.bg_gradient} /> */}
            {/* <div className={styles.difficulty_container}>
                <p>
                    Уровень сложности:{' '}
                    <span style={{ color: challenge.color }}>{challenge.name}</span>
                </p>
            </div> */}

            <div className={styles.loadout_container}>
                {hasSeed && (
                    <PhotoProvider>
                        {challenge.categories.map((category) => {
                            const item = result?.result.find(
                                (item) => item.category_id === category.category_id
                            );

                            if (!isLoadoutLoading && !item?.gear) return null;

                            return (
                                <RandomGearItem
                                    key={category.category_id}
                                    category={category}
                                    gear={item?.gear || null}
                                    isLoading={isLoadoutLoading}
                                />
                            );
                        })}
                    </PhotoProvider>
                )}
            </div>

            {hasSeed && result?.additional_condition && (
                <div className={styles.additional_challenges_container}>
                    <p className={styles.title}>Дополнительное усложнение</p>
                    <div className={styles.items}>
                        <div className={styles.item} key={result?.additional_condition}>
                            <p>{result?.additional_condition}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className={styles.bottom_btns}>
                <AppBtn
                    disabled={isLoadoutLoading}
                    text="Новая генерация"
                    onClick={onNewGen}
                    style="default"
                    big
                    className={styles.btn}
                />
                <GoBackBig className={styles.go_back_btn} onClick={onBack} />
            </div>
        </div>
    );
};
