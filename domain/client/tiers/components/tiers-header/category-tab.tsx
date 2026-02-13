import AppTabsTrigger from '@/ui/AppTabsTrigger/AppTabsTrigger';
import { TierListCategoryListItemDto } from '@/lib/api_client/gen';

const CategoryTab = ({ category }: { category: TierListCategoryListItemDto }) => {
    return <AppTabsTrigger value={category.id.toString()}>{category.name}</AppTabsTrigger>;
};

export default CategoryTab;
