import { getPublicClient } from '@/lib/api_client/public_client';
import {
    gearControllerGetPublicGearByIds,
    PublicGearDto,
    tiersControllerGetTierListCategoryByGame,
    tiersControllerGetPublicTierList,
} from '@/lib/api_client/gen';
import clsx from 'clsx';
import styles from './tiers-page.module.css';
import { GearProvider } from '@/domain/client/tiers/components/tiers/GearContext';
import TierList from '@/domain/client/tiers/components/tiers/TierList';
import { GameType } from '@/lib/enums/game_type.enum';
import { TiersTabs } from '@/domain/client/tiers/components/tiers-header/tiers-tabs';
import { TiersTitle } from '@/domain/client/tiers/components/tiers-header/tiers-title';
import { usersPublicControllerFindPublicById } from '@/lib/api_client/gen';

export async function TiersPublicPage({
    tierListId,
    game,
}: {
    tierListId: string;
    game: GameType;
}) {
    const tierRes = await tiersControllerGetPublicTierList({
        path: { tierListId },
        client: await getPublicClient(),
    });

    if (!tierRes.data) {
        return null;
    }

    const categoryRes = await tiersControllerGetTierListCategoryByGame({
        path: {
            gameType: game,
            categoryId: tierRes.data.categoryId,
        },
        client: await getPublicClient(),
    });

    const category = categoryRes.data ?? null;

    const ownerRes = await usersPublicControllerFindPublicById({
        path: { id: tierRes.data.userId },
        client: await getPublicClient(),
    });

    const ownerLabel = ownerRes.data?.username;

    const gearIds = Array.from(
        new Set(tierRes.data.rows.flatMap((row) => row.items.map((item) => item.gearId)))
    );

    const gearRes = await gearControllerGetPublicGearByIds({
        query: { ids: gearIds },
        client: await getPublicClient(),
    });

    const gearById = Object.fromEntries(
        (gearRes.data ?? []).map((gear) => [String(gear.id), gear])
    ) as Record<string, PublicGearDto>;

    return (
        <div className={clsx(styles.container, 'page_width_wrapper', 'header_margin_top')}>
            <GearProvider gearById={gearById}>
                <TiersTitle label={ownerLabel} />
                <TiersTabs defaultValue={category?.id} categories={category ? [category] : []}>
                    <TierList tierList={tierRes.data} readOnly />
                </TiersTabs>
            </GearProvider>
        </div>
    );
}
