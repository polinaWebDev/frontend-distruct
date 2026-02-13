import { num_word } from '../utils';

export enum ChallengeDifficulty {
    Easy = 'easy',
    Medium = 'medium',
    Hard = 'hard',
}

export const CHALLENGE_DIFFICULTY_VALUES: {
    value: ChallengeDifficulty;
    label: (count: number) => string;
    color: string;
    multiple: string;
    adjective: string;
}[] = [
    {
        value: ChallengeDifficulty.Easy,
        label: (count: number) => `${num_word(count, ['легкий', 'легких', 'легких'])}`,
        color: '#FFFFFF',
        multiple: 'легкие',
        adjective: 'легкая',
    },
    {
        value: ChallengeDifficulty.Medium,
        label: (count: number) => `${num_word(count, ['средний', 'средних', 'средних'])}`,
        multiple: 'средние',
        color: '#4B62F1',
        adjective: 'средняя',
    },
    {
        value: ChallengeDifficulty.Hard,
        label: (count: number) => `${num_word(count, ['тяжелый', 'тяжелых', 'тяжелых'])}`,
        color: '#EF2B4B',
        multiple: 'тяжелые',
        adjective: 'тяжелая',
    },
];
