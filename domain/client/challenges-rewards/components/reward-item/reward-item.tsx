import { ChallengeShopItemEntity } from '@/lib/api_client/gen';
import styles from './reward-item.module.css';
import { getFileUrl } from '@/lib/utils';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import { AppBtn } from '@/ui/SmallBtn/AppBtn';
import { useState } from 'react';
import { Dialog } from 'radix-ui';
import { PurchaseRewardDialog } from '../purchase-reward-dialog/purchase-reward-dialog';

export const RewardItem = ({
    reward,
    balance,
}: {
    reward: ChallengeShopItemEntity;
    balance: number;
}) => {
    const [openPurchaseRewardDialog, setOpenPurchaseRewardDialog] = useState(false);
    return (
        <div className={styles.container}>
            <PhotoProvider>
                <PhotoView src={getFileUrl(reward.image_url ?? '')}>
                    <img
                        src={getFileUrl(reward.image_url ?? '')}
                        alt={reward.name}
                        className={styles.img}
                    />
                </PhotoView>
            </PhotoProvider>

            <div className={styles.content}>
                <div className={styles.text}>
                    <div className={styles.item}>
                        <p className={styles.title}>{reward.name}</p>
                        <p className={styles.desc}>{reward.description}</p>
                    </div>

                    <div className={styles.item}>
                        <p className={styles.title}>
                            {reward.is_infinite ? 'Бесконечно' : reward.quantity + ' шт'}
                        </p>
                        <p className={styles.desc}>Осталось</p>
                    </div>
                </div>

                <div className={styles.btn_container}>
                    <AppBtn
                        text={reward.price + ' Очков'}
                        className={styles.btn}
                        style={'outline_brand'}
                        onClick={() => setOpenPurchaseRewardDialog(true)}
                    />
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
