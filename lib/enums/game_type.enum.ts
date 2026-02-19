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

export const ENABLED_CLIENT_GAME_TYPES: GameType[] = [GameType.ArenaBreakout];

export const isEnabledClientGameType = (game: string | null | undefined): game is GameType => {
    return ENABLED_CLIENT_GAME_TYPES.some((enabledGame) => enabledGame === game);
};
