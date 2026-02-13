export enum ChallengeProgressStatus {
    Started = 'started',
    Cancelled = 'cancelled',
    WaitingForReview = 'waiting_for_review',
    InReview = 'in_review',
    Failed = 'failed',
    Completed = 'completed',
}

export const CHALLENGE_PROGRESS_STATUS_VALUES: {
    value: ChallengeProgressStatus;
    label: string;
}[] = [
    {
        value: ChallengeProgressStatus.Started,
        label: 'Выполняются',
    },
    {
        value: ChallengeProgressStatus.WaitingForReview,
        label: 'Ожидает проверки',
    },
    {
        value: ChallengeProgressStatus.Failed,
        label: 'Неудача',
    },
    {
        value: ChallengeProgressStatus.Completed,
        label: 'Выполнено',
    },
];
