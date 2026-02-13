export enum GameType {
    ArenaBreakout = 'arena_breakout',
    ActiveMatter = 'active_matter',
    ArcRaiders = 'arc_raiders',
    EscapeFromTarkov = 'escape_from_tarkov',
}

export const GAME_TYPE_VALUES: {
    value: GameType;
    label: string;
}[] = [
    {
        value: GameType.ArcRaiders,
        label: 'Arc Raiders',
    },
    {
        value: GameType.EscapeFromTarkov,
        label: 'Escape from Tarkov',
    },
    {
        value: GameType.ArenaBreakout,
        label: 'Arena Breakout: Infinite',
    },
    {
        value: GameType.ActiveMatter,
        label: 'Active Matter',
    },
];
