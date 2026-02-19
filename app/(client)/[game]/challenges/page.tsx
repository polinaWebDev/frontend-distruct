import { getCurrentUser } from '@/actions/user/getCurrentUser';
import { ChallengesMain } from '@/domain/client/challenges-main/challenges-main';
import {
    seasonControllerGetCurrentSeason,
    seasonControllerGetCurrentSeasonBalance,
} from '@/lib/api_client/gen';
import { getServerClient } from '@/lib/api_client/server_client';
import { GAME_TYPE_VALUES, GameType } from '@/lib/enums/game_type.enum';
import type { Metadata } from 'next';
import { buildSocialMetadata } from '@/lib/seo';
import styles from '@/domain/client/challenges-main/components/challenges-list/challenges-list.module.css';
import pageStyles from './challenges-page.module.css';
import clsx from 'clsx';
import { CalendarX } from 'lucide-react';
import { unstable_noStore as noStore } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ game: GameType }>;
}): Promise<Metadata> {
    const { game } = await params;
    const gameLabel = GAME_TYPE_VALUES.find((g) => g.value === game)?.label ?? game;
    const title = `Челленджи — ${gameLabel} | Distruct`;
    const description = `Сезонные и пользовательские челленджи по ${gameLabel}.`;
    return {
        title,
        description,
        ...buildSocialMetadata(`/${game}/challenges`, title, description),
    };
}

export default async function Page({ params }: { params: Promise<{ game: GameType }> }) {
    noStore();
    const { game } = await params;

    const currentSeason = await seasonControllerGetCurrentSeason({
        client: await getServerClient(),
        query: {
            game_type: game,
        },
    });

    const user = await getCurrentUser();
    const authenticated = !!user;

    const seasonBalance = await seasonControllerGetCurrentSeasonBalance({
        client: await getServerClient(),
        query: {
            game_type: game,
        },
    });

    console.log('currentSeason', currentSeason);
    console.log('seasonBalance', seasonBalance.data?.balance);

    if (!currentSeason.data) {
        return (
            <div
                className={clsx('page_width_wrapper', pageStyles.empty_container, styles.container)}
            >
                <div className={clsx(styles.empty_state, pageStyles.empty_state_reset)}>
                    <CalendarX className={styles.empty_state_icon} />
                    <span className={styles.empty_state_text}>Сезона еще не начат</span>
                </div>
            </div>
        );
    }

    return (
        <ChallengesMain
            game={game}
            season={currentSeason.data}
            seasonBalance={seasonBalance.data}
            authenticated={authenticated}
        />
    );
}
