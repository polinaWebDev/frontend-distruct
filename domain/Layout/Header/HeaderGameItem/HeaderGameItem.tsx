'use client';
import { GameType } from '@/lib/enums/game_type.enum';
import { ArenaLogo } from '@/lib/icons/ArenaLogo';
import clsx from 'clsx';

import styles from './HeaderGameItem.module.css';
import { ArcRaidersLogo } from '@/lib/icons/ArcRaidersLogo';
import { ActiveMatterLogo } from '@/lib/icons/ActiveMatterLogo';
import { TarkovLogo } from '@/lib/icons/TarkovLogo';
import Link from 'next/link';
import { useGameLink } from '../utils/useGameLink';

export const GameIcon = ({
    game,
    selected,
    black,
}: {
    game: GameType;
    selected: boolean;
    black?: boolean;
}) => {
    if (game === GameType.ArcRaiders) {
        return (
            <ArcRaidersLogo
                className={clsx(
                    styles.arc_raiders_logo,
                    styles.logo,
                    selected && styles.selected,
                    black && styles.black
                )}
            />
        );
    }

    if (game === GameType.ActiveMatter) {
        return (
            <ActiveMatterLogo
                className={clsx(
                    styles.active_matter_logo,
                    styles.logo,
                    selected && styles.selected,
                    black && styles.black
                )}
            />
        );
    }

    if (game === GameType.ArenaBreakout) {
        return (
            <ArenaLogo
                className={clsx(
                    styles.arc_raiders_logo,
                    styles.logo,
                    selected && styles.selected,
                    black && styles.black
                )}
            />
        );
    }

    if (game === GameType.EscapeFromTarkov) {
        return (
            <TarkovLogo
                className={clsx(
                    styles.tarkov_logo,
                    styles.logo,
                    selected && styles.selected,
                    black && styles.black
                )}
            />
        );
    }

    return null;
};

export const HeaderGameItem = ({ game, selected }: { game: GameType; selected: boolean }) => {
    const { linkPath, onLinkClick } = useGameLink(game);

    return (
        <Link href={linkPath} className={styles.logo_container} onClick={onLinkClick}>
            <GameIcon game={game} selected={selected} />

            <div className={clsx(styles.selected_line, selected && styles.selected)} />
        </Link>
    );
};
