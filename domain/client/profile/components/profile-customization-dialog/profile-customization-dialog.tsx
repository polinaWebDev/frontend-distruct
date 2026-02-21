'use client';

import { useEffect, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Dialog } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList } from '@/components/ui/tabs';
import Image from 'next/image';
import { AppDialog, AppDialogContent } from '@/ui/AppDialog/app-dialog';
import AppTabsTrigger from '@/ui/AppTabsTrigger/AppTabsTrigger';
import {
    profileCosmeticsControllerEquipMutation,
    profileCosmeticsControllerGetMyCosmeticsOptions,
    profileCosmeticsControllerGetMyCosmeticsQueryKey,
    profileCosmeticsControllerUnequipMutation,
} from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { getPublicClient } from '@/lib/api_client/public_client';
import {
    COSMETIC_TYPES,
    parseMyCosmeticsResponse,
    type CosmeticType,
} from '@/domain/profile-cosmetics/profile-cosmetics.utils';
import { getFileUrl } from '@/lib/utils';
import styles from './profile-customization-dialog.module.css';

type CustomizationTab = 'outline' | 'background' | 'frame';

const TAB_LABELS: Record<CustomizationTab, string> = {
    outline: 'Обводка',
    background: 'Фон',
    frame: 'Рамка',
};

const TAB_TO_TYPE: Record<CustomizationTab, CosmeticType> = {
    outline: 'avatar_outline',
    background: 'profile_background',
    frame: 'profile_frame',
};

export const ProfileCustomizationDialog = ({
    open,
    onOpenChange,
    onAppearanceChange,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAppearanceChange?: (value: {
        profileBackgroundUrl: string | null;
        profileFrameUrl: string | null;
        avatarOutlineUrl: string | null;
    }) => void;
}) => {
    const client = getPublicClient();
    const queryClient = useQueryClient();

    const cosmeticsQuery = useQuery({
        ...profileCosmeticsControllerGetMyCosmeticsOptions({ client }),
        enabled: open,
    });

    const equipMutation = useMutation({
        ...profileCosmeticsControllerEquipMutation({ client }),
        onSuccess: async () => {
            toast.success('Косметика применена');
            await queryClient.invalidateQueries({
                queryKey: profileCosmeticsControllerGetMyCosmeticsQueryKey({ client }),
            });
        },
        onError: () => {
            toast.error('Не удалось применить косметику');
        },
    });

    const unequipMutation = useMutation({
        ...profileCosmeticsControllerUnequipMutation({ client }),
        onSuccess: async () => {
            toast.success('Косметика снята');
            await queryClient.invalidateQueries({
                queryKey: profileCosmeticsControllerGetMyCosmeticsQueryKey({ client }),
            });
        },
        onError: () => {
            toast.error('Не удалось снять косметику');
        },
    });

    const parsed = useMemo(
        () => parseMyCosmeticsResponse(cosmeticsQuery.data),
        [cosmeticsQuery.data]
    );

    const itemsByTab = useMemo(
        () => ({
            outline: parsed.items.filter((item) => item.type === 'avatar_outline'),
            background: parsed.items.filter((item) => item.type === 'profile_background'),
            frame: parsed.items.filter((item) => item.type === 'profile_frame'),
        }),
        [parsed.items]
    );

    const appearance = useMemo(() => {
        const getEquippedAsset = (type: CosmeticType) =>
            parsed.items.find(
                (item) =>
                    item.type === type &&
                    (item.is_equipped === true || parsed.equippedByType[type] === item.id)
            )?.asset_url ?? null;

        return {
            profileBackgroundUrl: getEquippedAsset('profile_background'),
            profileFrameUrl: getEquippedAsset('profile_frame'),
            avatarOutlineUrl: getEquippedAsset('avatar_outline'),
        };
    }, [parsed.equippedByType, parsed.items]);

    useEffect(() => {
        if (!cosmeticsQuery.isSuccess) return;
        onAppearanceChange?.(appearance);
    }, [appearance, cosmeticsQuery.isSuccess, onAppearanceChange]);

    const applyItem = async (itemId: string) => {
        await equipMutation.mutateAsync({
            body: { cosmetic_id: itemId },
        });
    };

    const unequip = async (tab: CustomizationTab) => {
        await unequipMutation.mutateAsync({
            body: { type: TAB_TO_TYPE[tab] },
        });
    };

    const renderItems = (tab: CustomizationTab) => {
        const list = itemsByTab[tab];
        const isGridTab = tab === 'outline' || tab === 'background';

        if (cosmeticsQuery.isLoading) {
            return <div className={styles.empty}>Загрузка...</div>;
        }

        if (cosmeticsQuery.isError) {
            return <div className={styles.empty}>Не удалось загрузить косметику профиля.</div>;
        }

        return (
            <div
                className={`
                    ${styles.list}
                    ${isGridTab ? styles.gridList : styles.frameList}
                `}
            >
                {list.length === 0 && (
                    <div className={styles.empty}>
                        Для этой категории пока нет доступных предметов.
                    </div>
                )}
                {list.map((item) => {
                    const isApplied =
                        item.is_equipped === true ||
                        parsed.equippedByType[TAB_TO_TYPE[tab]] === item.id;
                    const isActionDisabled =
                        equipMutation.isPending ||
                        unequipMutation.isPending ||
                        item.is_active === false;

                    return (
                        <button
                            type="button"
                            key={item.id}
                            className={`
                                ${styles.itemButton}
                                ${isGridTab ? styles.gridItemButton : styles.frameItemButton}
                                ${item.is_active === false ? styles.itemDisabled : ''}
                                ${isApplied ? styles.itemSelected : ''}
                            `}
                            disabled={isActionDisabled}
                            onClick={() => {
                                if (isApplied) {
                                    void unequip(tab);
                                    return;
                                }
                                void applyItem(item.id);
                            }}
                        >
                            <div
                                className={`
                                    ${styles.preview}
                                    ${isGridTab ? styles.gridPreview : styles.framePreview}
                                    ${isApplied ? styles.previewSelected : ''}
                                `}
                            >
                                {item.asset_url ? (
                                    <Image
                                        src={getFileUrl(item.asset_url)}
                                        alt={item.name}
                                        width={72}
                                        height={72}
                                        className={styles.previewImage}
                                    />
                                ) : (
                                    <span className={styles.previewFallback}>Нет превью</span>
                                )}
                            </div>
                            {isGridTab ? (
                                <div className={styles.gridItemInfo}>
                                    <p className={styles.itemName}>{item.name}</p>
                                    {item.is_active === false && (
                                        <p className={styles.unlockHint}>Отключено</p>
                                    )}
                                </div>
                            ) : (
                                <div className={styles.itemInfo}>
                                    <p className={styles.itemName}>{item.name}</p>
                                    <p className={styles.itemDescription}>{item.description}</p>
                                    {item.is_active === false && (
                                        <p className={styles.unlockHint}>
                                            Косметика отключена админом
                                        </p>
                                    )}
                                    {isApplied && <p className={styles.selectedLabel}>Надето</p>}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <AppDialog title="Кастомизация профиля" onClose={() => onOpenChange(false)}>
                <AppDialogContent
                    onClose={() => onOpenChange(false)}
                    className={styles.dialogContent}
                >
                    <h2 className={styles.title}>Кастомизация профиля</h2>
                    <Tabs defaultValue="outline" className={styles.tabsRoot}>
                        <TabsList className={styles.tabsList}>
                            <AppTabsTrigger value="outline" className={styles.tabTrigger}>
                                {TAB_LABELS.outline}
                            </AppTabsTrigger>
                            <AppTabsTrigger value="background" className={styles.tabTrigger}>
                                {TAB_LABELS.background}
                            </AppTabsTrigger>
                            <AppTabsTrigger value="frame" className={styles.tabTrigger}>
                                {TAB_LABELS.frame}
                            </AppTabsTrigger>
                        </TabsList>
                        <TabsContent value="outline">{renderItems('outline')}</TabsContent>
                        <TabsContent value="background">{renderItems('background')}</TabsContent>
                        <TabsContent value="frame">{renderItems('frame')}</TabsContent>
                    </Tabs>
                    {parsed.items.length > 0 && (
                        <p className={styles.hintText}>
                            Типов косметики: {COSMETIC_TYPES.length}. Повторный клик по надетому
                            предмету снимает его.
                        </p>
                    )}
                </AppDialogContent>
            </AppDialog>
        </Dialog>
    );
};
