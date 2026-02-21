import { getServerClient } from '@/lib/api_client/server_client';
import { getPublicClient } from '@/lib/api_client/public_client';
import clsx from 'clsx';
import { GameType } from '@/lib/enums/game_type.enum';
import { TabsContent } from '@/components/ui/tabs';
import styles from './tiers-page.module.css';
import {
    TierListCategoryListItemDto,
    tiersControllerGetTierListCategoriesByGame,
    UserResponseDto,
} from '@/lib/api_client/gen';
import { TierListByCategory } from '@/domain/client/tiers/components/TierListByCategory';
import ButtonActions from '@/domain/client/tiers/components/tiers-header/button-actions';
import { getCurrentUser } from '@/actions/user/getCurrentUser';
import { TiersTabs } from '@/domain/client/tiers/components/tiers-header/tiers-tabs';
import { TiersTitle } from '@/domain/client/tiers/components/tiers-header/tiers-title';

export async function TiersPage({
    game,
    currentUser,
}: {
    game: GameType;
    currentUser?: UserResponseDto;
}) {
    const resolvedCurrentUser = currentUser ?? (await getCurrentUser());
    const isAuthenticated = Boolean(resolvedCurrentUser?.id);

    const isCategoryList = (value: unknown): value is TierListCategoryListItemDto[] =>
        Array.isArray(value) &&
        value.every(
            (item) =>
                Boolean(item) &&
                typeof item === 'object' &&
                'id' in item &&
                typeof item.id === 'string'
        );

    let categoriesRes = await tiersControllerGetTierListCategoriesByGame({
        path: { gameType: game },
        client: isAuthenticated ? await getServerClient() : getPublicClient(),
    });
    if (!isCategoryList(categoriesRes.data)) {
        categoriesRes = await tiersControllerGetTierListCategoriesByGame({
            path: { gameType: game },
            client: getPublicClient(),
        });
    }

    const categories = isCategoryList(categoriesRes.data) ? categoriesRes.data : [];

    return (
        <div className={clsx(styles.container, 'page_width_wrapper', 'header_margin_top')}>
            <TiersTitle label={resolvedCurrentUser?.username} />
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
    );
}
