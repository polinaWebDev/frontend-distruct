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
    disabled,
}: {
    game: GameType;
    selected: boolean;
    black?: boolean;
    disabled?: boolean;
}) => {
    if (game === GameType.ArcRaiders) {
        return (
            <ArcRaidersLogo
                className={clsx(
                    styles.arc_raiders_logo,
                    styles.logo,
                    selected && styles.selected,
                    black && styles.black,
                    disabled && styles.disabled
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
                    black && styles.black,
                    disabled && styles.disabled
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
                    black && styles.black,
                    disabled && styles.disabled
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
                    black && styles.black,
                    disabled && styles.disabled
                )}
            />
        );
    }

    return null;
};

export const HeaderGameItem = ({
    game,
    selected,
    disabled = false,
}: {
    game: GameType;
    selected: boolean;
    disabled?: boolean;
}) => {
    const { linkPath, onLinkClick } = useGameLink(game);

    if (disabled) {
        return (
            <div className={clsx(styles.logo_container, styles.disabled)} aria-disabled="true">
                <span className={styles.soon_badge}>скоро</span>
                <GameIcon game={game} selected={selected} disabled />
                <div className={clsx(styles.selected_line, selected && styles.selected)} />
            </div>
        );
    }

    return (
        <Link href={linkPath} className={styles.logo_container} onClick={onLinkClick}>
            <GameIcon game={game} selected={selected} />

            <div className={clsx(styles.selected_line, selected && styles.selected)} />
        </Link>
    );
};
