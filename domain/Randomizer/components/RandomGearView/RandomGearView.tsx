import {
    GetRandomLoadoutResponseDto,
    loadoutRandomizerControllerGenerateRandomLoadout,
    RandomChallengeWithCategoriesDto,
} from '@/lib/api_client/gen';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import styles from './RandomGearView.module.css';
import { GoBackBig } from '@/ui/GoBackBig/GoBackBig';
import { AppBtn } from '@/ui/SmallBtn/AppBtn';
import { getPublicClient } from '@/lib/api_client/public_client';
import { RandomGearItem } from '../RandomGearItem/RandomGearItem';
import { PhotoProvider } from 'react-photo-view';

export const RandomGearView = ({
    seed,
    challenge,
    onBack,
    onNewGen,
}: {
    seed: string;
    challenge: RandomChallengeWithCategoriesDto;
    onBack: () => void;
    onNewGen: () => void;
}) => {
    const [result, setResult] = useState<GetRandomLoadoutResponseDto | null>(null);
    const { mutate, isPending } = useMutation({
        mutationFn: async ({ id, seed }: { id: string; seed: string }) => {
            setResult(null);
            await new Promise((resolve) => setTimeout(resolve, 1000));
            const res = await loadoutRandomizerControllerGenerateRandomLoadout({
                body: {
                    id: id,
                    seed: seed,
                },
                client: getPublicClient(),
            });

            return res.data;
        },
        onSuccess: (data) => {
            console.log(data);
            setResult(data || null);
        },
    });

    useEffect(() => {
        mutate({
            id: challenge.id,
            seed: seed,
        });
    }, [seed, challenge, mutate]);

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
                <PhotoProvider>
                    {challenge.categories.map((category) => {
                        const item = result?.result.find(
                            (item) => item.category_id === category.category_id
                        );

                        if (!isPending && !item?.gear) return null;

                        console.log(item?.gear);

                        return (
                            <RandomGearItem
                                key={category.category_id}
                                category={category}
                                gear={item?.gear || null}
                                isLoading={isPending}
                            />
                        );
                    })}
                </PhotoProvider>
            </div>

            {result?.additional_condition && (
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
                    disabled={isPending}
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
