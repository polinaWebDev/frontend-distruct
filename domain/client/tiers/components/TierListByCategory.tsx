import {
    gearControllerGetPublicGearByIds,
    PublicGearDto,
    tiersControllerGetTierListByCategory,
} from '@/lib/api_client/gen';
import { getServerClient } from '@/lib/api_client/server_client';
import TierList from '@/domain/client/tiers/components/tiers/TierList';
import { GearProvider } from '@/domain/client/tiers/components/tiers/GearContext';
import type { ReactNode } from 'react';

export async function TierListByCategory({
    categoryId,
    actions,
}: {
    categoryId: string;
    actions?: ReactNode;
}) {
    const res = await tiersControllerGetTierListByCategory({
        path: { categoryId },
        client: await getServerClient(),
    });

    if (!res.data) {
        return null;
    }

    const gearIds = Array.from(
        new Set(res.data.rows.flatMap((row) => row.items.map((item) => item.gearId)))
    );

    const gearRes = await gearControllerGetPublicGearByIds({
        query: { ids: gearIds },
        client: await getServerClient(),
    });

    const gearById = Object.fromEntries(
        (gearRes.data ?? []).map((gear) => [String(gear.id), gear])
    ) as Record<string, PublicGearDto>;

    return (
        <GearProvider gearById={gearById}>
            <TierList tierList={res.data} actions={actions} useTabsContent={false} />
        </GearProvider>
    );
}
