import { GameType } from '@/lib/enums/game_type.enum';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

export const useGameLink = (game: GameType) => {
    const pathname = usePathname();
    const queryParams = useSearchParams();
    const router = useRouter();

    const linkPath = useMemo(() => {
        const gamePathParam = pathname.split('/')[1];

        if (gamePathParam === '' || pathname.includes('profile')) {
            const nextParams = new URLSearchParams(queryParams.toString());
            nextParams.set('game', game);
            return `${pathname}?${nextParams.toString()}`;
        }

        const pathNameParts = pathname.split('/');
        pathNameParts[1] = game;
        return pathNameParts.join('/');
    }, [pathname, game, queryParams]);

    const onLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        const gamePathParam = pathname.split('/')[1];
        if (gamePathParam != '' && !pathname.includes('profile')) {
            return;
        }
        e.preventDefault();
        const gameParam = queryParams.get('game');

        if (gameParam === game) {
            router.push(pathname, {
                scroll: false,
            });
        } else {
            router.push(pathname + '?game=' + game, {
                scroll: false,
            });
        }
    };

    return {
        linkPath,
        onLinkClick,
    };
};
