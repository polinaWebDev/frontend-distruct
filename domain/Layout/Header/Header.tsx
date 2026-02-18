'use client';

import { GAME_TYPE_VALUES, GameType } from '@/lib/enums/game_type.enum';
import styles from './Header.module.css';
import { HeaderGameItem } from './HeaderGameItem/HeaderGameItem';
import clsx from 'clsx';
import { DistructLogo } from '@/lib/icons/DistructLogo';
import { HeaderNavItem } from './HeaderNavItem/HeaderNavItem';
import { RandomizerIcon } from '@/lib/icons/RandomizerIcon';
import Link from 'next/link';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { HeaderProfileBtn } from './HeaderProfileBtn/HeaderProfileBtn';
import { UserResponseDto } from '@/lib/api_client/gen';
import { MapsIcon } from '@/lib/icons/MapsIcon';
import { MobileHeader } from './MobileHeader/MobileHeader';
import { NewsIcon } from '@/lib/icons/NewsIcon';
import { ChallengesIcon } from '@/lib/icons/ChallengesIcon';
import { TierIcon } from '@/lib/icons/TierIcon';
import { useNewsUnreadIndicator } from '@/domain/client/news/hooks/useNewsReadState';
import BrainIcon from '@/lib/icons/BrainIcon';
import { Trophy } from 'lucide-react';
import { Dialog } from 'radix-ui';
import { AuthDialog } from './AuthDialog/AuthDialog';

export const Header = ({ user }: { user?: UserResponseDto; isMobileServer: boolean }) => {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();
    const [openAuthDialog, setOpenAuthDialog] = useState(false);

    const { game: gameParam } = useParams<{ game: GameType }>();
    const gameQueryParam = searchParams.get('game') as GameType | null;

    const game = useMemo(() => {
        return gameParam || gameQueryParam;
    }, [gameParam, gameQueryParam]);

    const isGameParamCorrect = useMemo(() => {
        return GAME_TYPE_VALUES.some((g) => g.value === game);
    }, [game]);

    const { hasUnread } = useNewsUnreadIndicator({ gameType: game });

    useEffect(() => {
        if (!game) {
            const defaultGame = GameType.ArenaBreakout;
            router.push(pathname + '?game=' + defaultGame);
        }
    }, [game, pathname, router]);

    return (
        <Fragment>
            <MobileHeader user={user} game={game ?? GameType.ArenaBreakout} />

            <header
                className={clsx(styles.header_wrapper, 'page_width_wrapper')}
                suppressHydrationWarning
            >
                <div className={styles.header_top_bar}>
                    <Link href={`/?game=${game ?? GameType.ArenaBreakout}`}>
                        <DistructLogo className={styles.logo} />
                    </Link>

                    <div className={styles.games}>
                        <HeaderGameItem
                            game={GameType.ArenaBreakout}
                            selected={game === GameType.ArenaBreakout}
                        />
                        <HeaderGameItem
                            game={GameType.EscapeFromTarkov}
                            selected={game === GameType.EscapeFromTarkov}
                            disabled
                        />
                        <HeaderGameItem
                            game={GameType.ArcRaiders}
                            selected={game === GameType.ArcRaiders}
                            disabled
                        />
                        <HeaderGameItem
                            game={GameType.ActiveMatter}
                            selected={game === GameType.ActiveMatter}
                            disabled
                        />
                    </div>

                    <HeaderProfileBtn user={user} game={game ?? GameType.ArenaBreakout} />
                </div>

                {game && isGameParamCorrect && (
                    <div className={styles.header_bottom_bar}>
                        <HeaderNavItem
                            icon={(className) => <ChallengesIcon className={className} />}
                            title="Челленджи"
                            href={`/${game}/challenges`}
                        />
                        <HeaderNavItem
                            icon={(className) => <MapsIcon className={className} />}
                            title="Карты"
                            href={`/${game}/maps`}
                        />
                        <HeaderNavItem
                            icon={(className) => <TierIcon className={className} />}
                            title="Тир-листы"
                            href={`/${game}/tiers`}
                            onClick={(e) => {
                                if (user) return;
                                e.preventDefault();
                                setOpenAuthDialog(true);
                            }}
                        />
                        <HeaderNavItem
                            icon={(className) => <RandomizerIcon className={className} />}
                            title="Рандомайзер"
                            href={`/${game}/randomizer`}
                        />

                        <HeaderNavItem
                            icon={(className) => <NewsIcon className={className} />}
                            title="Новости"
                            href={`/${game}/news`}
                            showIndicator={hasUnread}
                        />
                        <HeaderNavItem
                            icon={(className) => <BrainIcon className={className} />}
                            title="База знаний"
                            href={`/${game}/knowledge-base`}
                            disabled
                            strokeIcon
                        />
                        <HeaderNavItem
                            icon={(className) => <Trophy className={className} />}
                            title="Рейтинг"
                            href={`/${game}/rating`}
                            disabled
                            strokeIcon
                        />
                    </div>
                )}
                <Dialog.Root open={openAuthDialog} onOpenChange={setOpenAuthDialog}>
                    <AuthDialog onClose={() => setOpenAuthDialog(false)} />
                </Dialog.Root>
            </header>
        </Fragment>
    );
};
