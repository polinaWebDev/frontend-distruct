import { useEffect, useState } from 'react';
import styles from './RandomPageChallengeSelector.module.css';
import {
    RandomChallengeWithCategoriesDto,
    RandomGearChallengeGroupEntity,
} from '@/lib/api_client/gen';
import { getActiveTextColorBasedOnBg } from '../../utils/utils';
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
    const activeTextColor = getActiveTextColorBasedOnBg(activeColor);

    return (
        <AppBtn
            text={challenge.name}
            style={selected ? 'default' : 'outline_dark'}
            onClick={onClick}
            className={styles.difficulty_button}
            textClassName={styles.difficulty_button_text}
            colorProps={
                selected
                    ? {
                          bgColor: activeColor,
                          textColor: activeTextColor,
                          hoverBgColor: activeColor,
                          hoverTextColor: activeTextColor,
                          partColor: activeColor,
                          partHoverColor: activeColor,
                      }
                    : {
                          borderColor: inactive_color,
                          textColor: '#C9CED8',
                          hoverBorderColor: activeColor,
                          hoverTextColor: activeTextColor,
                      }
            }
        />
    );
};

export const RandomPageChallengeGroupSelector = ({
    onSubmit,
    groups,
}: {
    groups: RandomGearChallengeGroupEntity[];
    onSubmit: (group: RandomGearChallengeGroupEntity) => any;
}) => {
    const [selectedGroup, setSelectedGroup] = useState<RandomGearChallengeGroupEntity | null>(
        groups[0] ?? null
    );

    useEffect(() => {
        if (groups.length === 0) {
            setSelectedGroup(null);
            return;
        }

        setSelectedGroup((prevGroup) =>
            prevGroup && groups.some((group) => group.id === prevGroup.id) ? prevGroup : groups[0]
        );
    }, [groups]);

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
