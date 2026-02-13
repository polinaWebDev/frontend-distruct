import { useMemo, useState } from 'react';
import styles from './RandomPageChallengeSelector.module.css';
import {
    RandomChallengeWithCategoriesDto,
    RandomGearChallengeGroupEntity,
} from '@/lib/api_client/gen';
import { getActiveTextColorBasedOnBg } from '../../utils/utils';
import { DifficultyItemIcon } from '@/lib/icons/DifficultyItemIcon';
import { AppBtn } from '@/ui/SmallBtn/AppBtn';
import clsx from 'clsx';
import { RandomizerGroupIcon } from '@/lib/icons/RandomizerGroupIcon';

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
    selected,
}: {
    challenge: RandomChallengeWithCategoriesDto;
    activeColor: string;
    onClick: () => void;
    selected: boolean;
}) => {
    const [hovered, setHovered] = useState(false);

    const strokeColor = useMemo(() => {
        if (!hovered && !selected) return inactive_color;

        return activeColor;
    }, [hovered, selected]);

    const fillColor = useMemo(() => {
        if (!hovered && !selected) return 'transparent';

        return activeColor;
    }, [hovered, selected]);

    const textColor = useMemo(() => {
        if (!hovered && !selected) return '#C9CED8';

        return getActiveTextColorBasedOnBg(activeColor);
    }, [activeColor, hovered, selected]);

    return (
        <div
            className={clsx(styles.difficulty_button, (selected || hovered) && styles.hovered)}
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <DifficultyItemIcon stroke={strokeColor} fill={fillColor} />
            <p className={styles.difficulty_button_title} style={{ color: textColor }}>
                {challenge.name}
            </p>
        </div>
    );
};

export const RandomPageChallengeGroupSelector = ({
    onSubmit,
    groups,
}: {
    groups: RandomGearChallengeGroupEntity[];
    onSubmit: (group: RandomGearChallengeGroupEntity) => any;
}) => {
    const [selectedGroup, setSelectedGroup] = useState<RandomGearChallengeGroupEntity | null>(null);

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
                        onClick={() => setSelectedGroup(group)}
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
    return (
        <div className={styles.challenge_selector_container}>
            <p className={styles.challenge_picker_title}>Уровень сложности</p>
            <div className={styles.difficulty_items}>
                {challenges.map((challenge) => (
                    <DifficultyButton
                        key={challenge.id}
                        challenge={challenge}
                        activeColor={challenge.color}
                        onClick={() => onSubmit(challenge)}
                        selected={currentChallengeId === challenge.id}
                    />
                ))}
            </div>
        </div>
    );
};
