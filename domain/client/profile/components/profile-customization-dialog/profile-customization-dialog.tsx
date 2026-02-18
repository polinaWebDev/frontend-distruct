'use client';

import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList } from '@/components/ui/tabs';
import { AppDialog, AppDialogContent } from '@/ui/AppDialog/app-dialog';
import AppTabsTrigger from '@/ui/AppTabsTrigger/AppTabsTrigger';
import { AppBtn } from '@/ui/SmallBtn/AppBtn';
import styles from './profile-customization-dialog.module.css';

type CustomizationTab = 'outline' | 'background' | 'frame';

type CustomizationItem = {
    id: string;
    name: string;
    description: string;
    requiredPoints: number;
};

const TAB_LABELS: Record<CustomizationTab, string> = {
    outline: 'Обводка',
    background: 'Фон',
    frame: 'Рамка',
};

const getUnlockHint = (requiredPoints: number) =>
    requiredPoints === 0
        ? 'Доступно по умолчанию'
        : `Откроется при ${requiredPoints} очках профиля`;

export const ProfileCustomizationDialog = ({
    open,
    onOpenChange,
    userPoints,
    itemsByTab,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userPoints: number;
    itemsByTab?: Record<CustomizationTab, CustomizationItem[]>;
}) => {
    const [appliedByTab, setAppliedByTab] = useState<Record<CustomizationTab, string | null>>({
        outline: null,
        background: null,
        frame: null,
    });

    const resolvedItemsByTab: Record<CustomizationTab, CustomizationItem[]> = itemsByTab ?? {
        outline: [],
        background: [],
        frame: [],
    };

    const applyItem = (tab: CustomizationTab, itemId: string) => {
        setAppliedByTab((prev) => ({
            ...prev,
            [tab]: itemId,
        }));
    };

    const renderItems = (tab: CustomizationTab) => {
        return (
            <div className={styles.list}>
                {resolvedItemsByTab[tab].length === 0 && (
                    <div className={styles.empty}>
                        Для этой категории пока нет доступных предметов.
                    </div>
                )}
                {resolvedItemsByTab[tab].map((item) => {
                    const isOwned = userPoints >= item.requiredPoints;
                    const isApplied = appliedByTab[tab] === item.id;
                    const unlockHint = getUnlockHint(item.requiredPoints);
                    const tooltipText = isOwned
                        ? 'Доступно для применения'
                        : `${unlockHint}. Сейчас: ${userPoints}`;

                    return (
                        <div
                            key={item.id}
                            className={`${styles.item} ${!isOwned ? styles.itemDisabled : ''}`}
                            title={tooltipText}
                        >
                            <div className={styles.itemInfo}>
                                <p className={styles.itemName}>{item.name}</p>
                                <p className={styles.itemDescription}>{item.description}</p>
                                {!isOwned && <p className={styles.unlockHint}>{unlockHint}</p>}
                            </div>
                            <div title={tooltipText}>
                                <AppBtn
                                    text={isApplied ? 'Применено' : 'Применить'}
                                    style={isOwned ? 'outline_bright' : 'outline_dark'}
                                    disabled={!isOwned || isApplied}
                                    onClick={() => applyItem(tab, item.id)}
                                />
                            </div>
                        </div>
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
                </AppDialogContent>
            </AppDialog>
        </Dialog>
    );
};
