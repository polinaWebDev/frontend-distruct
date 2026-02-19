import { GearEntity, RandomChallengeCategoryDto } from '@/lib/api_client/gen';
import styles from './RandomGearItem.module.css';
import clsx from 'clsx';
import { getFileUrl } from '@/lib/utils';
import 'react-photo-view/dist/react-photo-view.css';
import { PhotoView } from 'react-photo-view';
import Image from 'next/image';
import { CopyIcon } from '@/lib/icons/CopyIcon';
import './RandomGearItem.global.css';
import { toast } from 'sonner';
export const RandomGearItem = ({
    category,
    gear,
    isLoading,
}: {
    category: RandomChallengeCategoryDto;
    gear: GearEntity | null;
    isLoading: boolean;
}) => {
    return (
        <div className={styles.container}>
            <div
                className={clsx(styles.loadout_item, category.is_long_slot && styles.long_slot)}
                key={category.category_id}
            >
                <p className={styles.title}>{category.category_name}</p>
                <div
                    className={clsx(
                        styles.gear_image_container,
                        isLoading && styles.loading,
                        category.is_long_slot && styles.long_slot
                    )}
                >
                    {gear && (
                        <PhotoView src={getFileUrl(gear?.image_url || '')}>
                            <Image
                                src={getFileUrl(gear?.image_url || '')}
                                width={140 * 4}
                                height={102 * 4}
                                alt={gear?.name || ''}
                                className={styles.gear_image}
                            />
                        </PhotoView>
                    )}
                </div>
                <p className={styles.desc}>{gear?.name ?? '-'}</p>
            </div>

            {gear && gear.description && gear.description.length > 0 && (
                <CopyIcon
                    className={clsx(styles.copy_icon, 'random_gear_copy_icon')}
                    onClick={() => {
                        navigator.clipboard.writeText(gear.description);
                        toast.success('Описание скопировано в буфер обмена');
                    }}
                />
            )}
        </div>
    );
};
