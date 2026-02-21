'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import type { ChallengeShopItemEntity } from '@/lib/api_client/gen/types.gen';
import { getFileUrl } from '@/lib/utils';

interface ViewChallengeShopItemDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item: ChallengeShopItemEntity;
}

const getSeasonShopPreview = (item: ChallengeShopItemEntity): string | null => {
    const record = item as unknown as Record<string, unknown>;
    const prize = record.prize_cosmetic;
    if (prize && typeof prize === 'object') {
        const prizeRecord = prize as Record<string, unknown>;
        const asset = prizeRecord.asset_url;
        if (typeof asset === 'string' && asset.trim()) {
            return asset;
        }
    }
    return item.image_url ?? null;
};

export function ViewChallengeShopItemDialog({
    open,
    onOpenChange,
    item,
}: ViewChallengeShopItemDialogProps) {
    const preview = getSeasonShopPreview(item);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{item.name}</DialogTitle>
                    <DialogDescription>Информация о предмете магазина</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    {preview && (
                        <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                                Изображение
                            </Label>
                            <div className="mt-2">
                                <Image
                                    src={getFileUrl(preview)}
                                    alt={item.name}
                                    width={200}
                                    height={200}
                                    className="object-cover rounded"
                                />
                            </div>
                        </div>
                    )}
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                            Название
                        </Label>
                        <p className="mt-1">{item.name}</p>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                            Описание
                        </Label>
                        <p className="mt-1">{item.description}</p>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">Цена</Label>
                        <p className="mt-1">{item.price}</p>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                            Бесконечный
                        </Label>
                        <p className="mt-1">{item.is_infinite ? 'Да' : 'Нет'}</p>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">Активен</Label>
                        <p className="mt-1">{item.is_active ? 'Да' : 'Нет'}</p>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                            Контакты обязательны
                        </Label>
                        <p className="mt-1">{item.is_contact_info_required ? 'Да' : 'Нет'}</p>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                            Повторная покупка
                        </Label>
                        <p className="mt-1">
                            {item.is_repeatable_purchase_allowed ? 'Разрешена' : 'Запрещена'}
                        </p>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">Порядок</Label>
                        <p className="mt-1">{item.order}</p>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                            Количество
                        </Label>
                        <p className="mt-1">{item.quantity}</p>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                            ID Сезона
                        </Label>
                        <p className="mt-1">{item.challenge_season_id}</p>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                            Дата создания
                        </Label>
                        <p className="mt-1">{new Date(item.createdAt).toLocaleString('ru-RU')}</p>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                            Дата обновления
                        </Label>
                        <p className="mt-1">{new Date(item.updatedAt).toLocaleString('ru-RU')}</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
