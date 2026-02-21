import { ChallengeShopItemClientListItemDto } from '@/lib/api_client/gen';

export const isOneTimePurchaseBlocked = (item: ChallengeShopItemClientListItemDto): boolean => {
    return item.is_one_time && item.is_already_purchased_by_user;
};
