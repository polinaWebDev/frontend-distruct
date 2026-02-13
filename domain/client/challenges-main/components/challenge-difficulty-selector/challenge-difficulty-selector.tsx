import {
    CHALLENGE_DIFFICULTY_VALUES,
    ChallengeDifficulty,
} from '@/lib/enums/challenge_difficulty.enum';
import styles from './challenge-difficulty-selector.module.css';
import clsx from 'clsx';

export const ChallengeDifficultySelector = ({
    onSelect,
    selected,
}: {
    selected?: ChallengeDifficulty;
    onSelect: (difficulty: ChallengeDifficulty) => void;
}) => {
    return (
        <div className={styles.container}>
            {CHALLENGE_DIFFICULTY_VALUES.map((difficulty) => (
                <div
                    key={difficulty.value}
                    onClick={() => onSelect(difficulty.value)}
                    className={clsx(styles.item, selected === difficulty.value && styles.active)}
                >
                    {difficulty.multiple}
                </div>
            ))}
        </div>
    );
};
