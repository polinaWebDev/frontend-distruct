import { ReactNode } from 'react';
import { Tabs, TabsList } from '@/components/ui/tabs';
import CategoryTab from '@/domain/client/tiers/components/tiers-header/category-tab';
import { TierListCategoryListItemDto } from '@/lib/api_client/gen';
import styles from '../../tiers-page.module.css';

type TiersTabsProps = {
    categories: TierListCategoryListItemDto[];
    defaultValue?: string;
    tabsListClassName?: string;
    showActionsSlot?: boolean;
    children: ReactNode;
};

export function TiersTabs({
    categories,
    defaultValue,
    tabsListClassName,
    showActionsSlot = false,
    children,
}: TiersTabsProps) {
    return (
        <Tabs defaultValue={defaultValue}>
            <div className={styles.header}>
                <TabsList className={tabsListClassName}>
                    {categories.map((category) => (
                        <CategoryTab key={category.id} category={category} />
                    ))}
                </TabsList>
                {showActionsSlot ? (
                    <div id="tier-actions-slot" className={styles.header_actions} />
                ) : null}
            </div>
            {children}
        </Tabs>
    );
}
