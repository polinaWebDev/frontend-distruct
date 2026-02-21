import { ChallengeShopItemClientListItemDto } from '@/lib/api_client/gen';
import styles from './reward-item.module.css';
import { getFileUrl } from '@/lib/utils';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import { AppBtn } from '@/ui/SmallBtn/AppBtn';
import { useState } from 'react';
import { Dialog } from 'radix-ui';
import { PurchaseRewardDialog } from '../purchase-reward-dialog/purchase-reward-dialog';
import { isOneTimePurchaseBlocked } from '../../utils/purchase-status';

const getRewardImage = (reward: ChallengeShopItemClientListItemDto): string | null => {
    const rewardRecord = reward as unknown as Record<string, unknown>;
    const prizeCosmetic = rewardRecord.prize_cosmetic;

    if (prizeCosmetic && typeof prizeCosmetic === 'object') {
        const prizeCosmeticRecord = prizeCosmetic as Record<string, unknown>;
        const asset = prizeCosmeticRecord.asset_url;
        if (typeof asset === 'string' && asset.trim()) {
            return asset;
        }
    }

    return reward.image_url ?? null;
};

export const RewardItem = ({
    reward,
    balance,
}: {
    reward: ChallengeShopItemClientListItemDto;
    balance: number;
}) => {
    const [openPurchaseRewardDialog, setOpenPurchaseRewardDialog] = useState(false);
    const image = getRewardImage(reward);
    const purchaseBlocked = isOneTimePurchaseBlocked(reward);

    return (
        <div className={styles.container}>
            {image ? (
                <PhotoProvider>
                    <PhotoView src={getFileUrl(image)}>
                        <img src={getFileUrl(image)} alt={reward.name} className={styles.img} />
                    </PhotoView>
                </PhotoProvider>
            ) : (
                <div className={styles.img} />
            )}

            <div className={styles.content}>
                <div className={styles.text}>
                    <div className={styles.item}>
                        <p className={styles.title}>{reward.name}</p>
                        <p className={styles.desc}>{reward.description}</p>
                    </div>
                </div>

                <div className={styles.btn_container}>
                    <AppBtn
                        text={purchaseBlocked ? 'Уже куплено' : reward.price + ' Очков'}
                        className={styles.btn}
                        // style={'outline_brand'}
                        disabled={purchaseBlocked}
                        onClick={() => {
                            if (purchaseBlocked) return;
                            setOpenPurchaseRewardDialog(true);
                        }}
                    />
                    <p className={styles.quantity_text}>
                        ({reward.is_infinite ? 'Бесконечно' : `${reward.quantity} шт.`})
                    </p>
                </div>
            </div>
            <Dialog.Root open={openPurchaseRewardDialog} onOpenChange={setOpenPurchaseRewardDialog}>
                <PurchaseRewardDialog
                    onClose={() => setOpenPurchaseRewardDialog(false)}
                    item={reward}
                    balance={balance}
                />
            </Dialog.Root>
        </div>
    );
};
