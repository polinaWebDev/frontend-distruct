import { UserResponseDto } from '@/lib/api_client/gen';
import { GameType } from '@/lib/enums/game_type.enum';
import styles from './MobileHeader.module.css';
import Link from 'next/link';
import { DistructLogo } from '@/lib/icons/DistructLogo';
import { MenuIcon } from '@/lib/icons/MenuIcon';
import clsx from 'clsx';
import { useState } from 'react';
import { GameIcon } from '../HeaderGameItem/HeaderGameItem';
import { useGameLink } from '../utils/useGameLink';
import { HeaderNavItem } from '../HeaderNavItem/HeaderNavItem';
import { RandomizerIcon } from '@/lib/icons/RandomizerIcon';
import { MapsIcon } from '@/lib/icons/MapsIcon';
import { NewsIcon } from '@/lib/icons/NewsIcon';
import { ChallengesIcon } from '@/lib/icons/ChallengesIcon';
import { HeaderProfileBtn } from '../HeaderProfileBtn/HeaderProfileBtn';
import { TierIcon } from '@/lib/icons/TierIcon';
import { useNewsUnreadIndicator } from '@/domain/client/news/hooks/useNewsReadState';
import BrainIcon from '@/lib/icons/BrainIcon';
import { Dialog } from 'radix-ui';
import { AuthDialog } from '../AuthDialog/AuthDialog';

const GameIconItem = ({ game, onClick }: { game: GameType; onClick: () => void }) => {
    const { linkPath, onLinkClick } = useGameLink(game);

    return (
        <Link
            href={linkPath}
            className={styles.game_icon_item}
            onClick={(e) => {
                onLinkClick(e);
                onClick();
            }}
        >
            <GameIcon black game={game} selected={false} />
        </Link>
    );
};

export const MobileHeader = ({ user, game }: { user?: UserResponseDto; game: GameType }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [gameMenuOpen, setGameMenuOpen] = useState(false);
    const [openAuthDialog, setOpenAuthDialog] = useState(false);
    const { hasUnread } = useNewsUnreadIndicator({ gameType: game });
    return (
        <div suppressHydrationWarning className={styles.container}>
            <Link href={`/?game=${game}`} className={clsx(styles.logo, styles.box_style)}>
                <DistructLogo />
            </Link>

            <div
                className={clsx(styles.menu_container, styles.box_style, menuOpen && styles.open)}
                onClick={() => {
                    setMenuOpen((prev) => !prev);
                    setGameMenuOpen(false);
                }}
            >
                <MenuIcon className={styles.menu_icon} />
                <p>Меню</p>
            </div>

            <div
                className={clsx(styles.selected_game_container, styles.box_style)}
                onClick={() => {
                    setMenuOpen(false);
                    setGameMenuOpen((prev) => !prev);
                }}
            >
                <GameIcon game={game} selected={true} />
            </div>

            <div className={clsx(styles.game_menu_container, gameMenuOpen && styles.open)}>
                <div className={styles.game_list}>
                    <GameIconItem
                        game={GameType.ArenaBreakout}
                        onClick={() => setGameMenuOpen(false)}
                    />
                    <GameIconItem
                        game={GameType.EscapeFromTarkov}
                        onClick={() => setGameMenuOpen(false)}
                    />
                    <GameIconItem
                        game={GameType.ArcRaiders}
                        onClick={() => setGameMenuOpen(false)}
                    />
                    <GameIconItem
                        game={GameType.ActiveMatter}
                        onClick={() => setGameMenuOpen(false)}
                    />
                </div>
            </div>

            <div className={clsx(styles.nav_menu_container, menuOpen && styles.open)}>
                <div className={styles.nav_menu_list}>
                    <HeaderNavItem
                        icon={(className) => <ChallengesIcon className={className} />}
                        title="Челленджи"
                        href={`/${game}/challenges`}
                        onClick={() => setMenuOpen(false)}
                    />
                    <HeaderNavItem
                        icon={(className) => <MapsIcon className={className} />}
                        title="Карты"
                        href={`/${game}/maps`}
                        onClick={() => setMenuOpen(false)}
                    />
                    <HeaderNavItem
                        icon={(className) => <TierIcon className={className} />}
                        title="Тир-листы"
                        href={`/${game}/tiers`}
                        onClick={(e) => {
                            if (user) {
                                setMenuOpen(false);
                                return;
                            }
                            e.preventDefault();
                            setMenuOpen(false);
                            setOpenAuthDialog(true);
                        }}
                    />
                    <HeaderNavItem
                        icon={(className) => <RandomizerIcon className={className} />}
                        title="Рандомайзер"
                        href={`/${game}/randomizer`}
                        onClick={() => setMenuOpen(false)}
                    />

                    <HeaderNavItem
                        icon={(className) => <NewsIcon className={className} />}
                        title="Новости"
                        href={`/${game}/news`}
                        onClick={() => setMenuOpen(false)}
                        showIndicator={hasUnread}
                    />
                    <HeaderNavItem
                        icon={(className) => <BrainIcon className={className} />}
                        title="База знаний"
                        href={`/${game}/knowledge-base`}
                        disabled
                        strokeIcon
                    />

                    <HeaderProfileBtn
                        user={user}
                        game={game ?? GameType.ArenaBreakout}
                        onClick={() => setMenuOpen(false)}
                    />
                </div>
            </div>
            <Dialog.Root open={openAuthDialog} onOpenChange={setOpenAuthDialog}>
                <AuthDialog onClose={() => setOpenAuthDialog(false)} />
            </Dialog.Root>
        </div>
    );
};
