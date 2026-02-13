import { getServerClient } from '@/lib/api_client/server_client';
import clsx from 'clsx';
import { GameType } from '@/lib/enums/game_type.enum';
import { TabsContent } from '@/components/ui/tabs';
import styles from './tiers-page.module.css';
import { tiersControllerGetTierListCategoriesByGame } from '@/lib/api_client/gen';
import { TierListByCategory } from '@/domain/client/tiers/components/TierListByCategory';
import ButtonActions from '@/domain/client/tiers/components/tiers-header/button-actions';
import { getCurrentUser } from '@/actions/user/getCurrentUser';
import { TiersTabs } from '@/domain/client/tiers/components/tiers-header/tiers-tabs';
import { TiersTitle } from '@/domain/client/tiers/components/tiers-header/tiers-title';
import { BannerProvider } from '@/components/banners/BannerProvider';
import { BannerSlot } from '@/components/banners/BannerSlot';

export async function TiersPage({ game }: { game: GameType }) {
    const currentUser = await getCurrentUser();
    const categoriesRes = await tiersControllerGetTierListCategoriesByGame({
        path: { gameType: game },
        client: await getServerClient(),
    });

    const categories = categoriesRes.data ?? [];

    return (
        <BannerProvider page="tiers">
            <div className={clsx(styles.container, 'page_width_wrapper', 'header_margin_top')}>
                <TiersTitle label={currentUser?.username} />
                <div className="my-4 flex justify-center">
                    <BannerSlot slotKey="content_inline" />
                </div>
                <TiersTabs
                    defaultValue={categories[0]?.id}
                    categories={categories}
                    tabsListClassName="mb-4 flex gap-2"
                    showActionsSlot
                >
                    {categories.map((category) => (
                        <TabsContent key={category.id} value={category.id}>
                            <TierListByCategory
                                categoryId={category.id}
                                actions={<ButtonActions />}
                            />
                        </TabsContent>
                    ))}
                </TiersTabs>
            </div>
        </BannerProvider>
    );
}
