import { CSSProperties, useState } from 'react';
import styles from './RandomPageChallengeSelector.module.css';
import {
    RandomChallengeWithCategoriesDto,
    RandomGearChallengeGroupEntity,
} from '@/lib/api_client/gen';
import { getActiveTextColorBasedOnBg } from '../../utils/utils';
import { AppBtn } from '@/ui/SmallBtn/AppBtn';
import clsx from 'clsx';
import { RandomizerGroupIcon } from '@/lib/icons/RandomizerGroupIcon';
import { Tabs, TabsList } from '@/components/ui/tabs';
import AppTabsTrigger from '@/ui/AppTabsTrigger/AppTabsTrigger';

const inactive_color = '#5D6369';

const GroupButton = ({
    group,
    onClick,
    selected,
}: {
    group: RandomGearChallengeGroupEntity;

    onClick: () => void;
    selected: boolean;
}) => {
    return (
        <div className={clsx(styles.group_button, selected && styles.selected)} onClick={onClick}>
            <RandomizerGroupIcon className={styles.group_button_icon} />
            <p className={styles.group_button_title}>{group.name}</p>
        </div>
    );
};

const DifficultyButton = ({
    challenge,
    activeColor,
    onClick,
}: {
    challenge: RandomChallengeWithCategoriesDto;
    activeColor: string;
    onClick: () => void;
}) => {
    const activeTextColor = getActiveTextColorBasedOnBg(activeColor);

    return (
        <AppTabsTrigger
            value={challenge.id}
            onClick={onClick}
            className={styles.difficulty_tab}
            style={
                {
                    '--difficulty-border': inactive_color,
                    '--difficulty-text': '#C9CED8',
                    '--difficulty-hover-border': activeColor,
                    '--difficulty-hover-text': activeTextColor,
                    '--difficulty-active-bg': activeColor,
                    '--difficulty-active-text': activeTextColor,
                } as CSSProperties
            }
        >
            <span className={styles.difficulty_tab_text}>{challenge.name}</span>
        </AppTabsTrigger>
    );
};

export const RandomPageChallengeGroupSelector = ({
    onSubmit,
    groups,
}: {
    groups: RandomGearChallengeGroupEntity[];
    onSubmit: (group: RandomGearChallengeGroupEntity) => any;
}) => {
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(groups[0]?.id ?? null);
    const selectedGroup = groups.find((group) => group.id === selectedGroupId) ?? groups[0] ?? null;

    return (
        <div className={styles.container}>
            <h1>РАНДОМАЙЗЕР</h1>
            <div className={styles.desc}>
                Автоматический и рандомный подбор экипировки в твой следующий рейд
            </div>

            <div className={styles.difficulty_items}>
                {groups.map((group) => (
                    <GroupButton
                        key={group.id}
                        group={group}
                        onClick={() => setSelectedGroupId(group.id)}
                        selected={selectedGroup?.id === group.id}
                    />
                ))}
            </div>
            <AppBtn
                disabled={!selectedGroup}
                className={styles.generate_button}
                onClick={() => {
                    if (!selectedGroup) {
                        return;
                    }
                    onSubmit(selectedGroup);
                }}
                text="Сгенерировать"
                style="default"
                big
            />
        </div>
    );
};

export const RandomPageChallengeSelector = ({
    onSubmit,
    currentChallengeId,
    challenges,
}: {
    onSubmit: (challenge: RandomChallengeWithCategoriesDto) => any;
    challenges: RandomChallengeWithCategoriesDto[];
    currentChallengeId?: string | null;
}) => {
    const [optimisticSelection, setOptimisticSelection] = useState<{
        id: string;
        baseId: string | null;
    } | null>(null);
    const normalizedCurrentId = currentChallengeId ?? null;
    const selectedChallengeId =
        optimisticSelection && optimisticSelection.baseId === normalizedCurrentId
            ? optimisticSelection.id
            : normalizedCurrentId;

    return (
        <div className={styles.challenge_selector_container}>
            <p className={styles.challenge_picker_title}>Уровень сложности</p>
            <Tabs value={selectedChallengeId ?? ''} className={styles.difficulty_tabs_root}>
                <TabsList className={styles.difficulty_items}>
                    {challenges.map((challenge) => (
                        <DifficultyButton
                            key={challenge.id}
                            challenge={challenge}
                            activeColor={challenge.color}
                            onClick={() => {
                                setOptimisticSelection({
                                    id: challenge.id,
                                    baseId: normalizedCurrentId,
                                });
                                onSubmit(challenge);
                            }}
                        />
                    ))}
                </TabsList>
            </Tabs>
        </div>
    );
};
