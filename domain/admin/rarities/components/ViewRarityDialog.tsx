'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { GAME_TYPE_VALUES } from '@/lib/enums/game_type.enum';
import type { GearRarityEntity } from '@/lib/api_client/gen/types.gen';

interface ViewRarityDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    rarity: GearRarityEntity;
}

export function ViewRarityDialog({ open, onOpenChange, rarity }: ViewRarityDialogProps) {
    const gameTypeLabel =
        GAME_TYPE_VALUES.find((gt) => gt.value === rarity.game_type)?.label || rarity.game_type;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Информация о редкости</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-muted-foreground">ID</Label>
                        <p className="text-sm font-mono bg-muted px-3 py-2 rounded">{rarity.id}</p>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-muted-foreground">Название</Label>
                        <p className="text-base font-medium">{rarity.name}</p>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-muted-foreground">Описание</Label>
                        <p className="text-sm">{rarity.description}</p>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-muted-foreground">Тип игры</Label>
                        <p className="text-sm">{gameTypeLabel}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-muted-foreground">Цвет</Label>
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-8 h-8 rounded border"
                                    style={{ backgroundColor: rarity.color }}
                                />
                                <p className="text-sm font-mono">{rarity.color}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-muted-foreground">Вес</Label>
                            <p className="text-sm">{rarity.weight}</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-muted-foreground">Дата создания</Label>
                        <p className="text-sm">
                            {new Date(rarity.createdAt).toLocaleString('ru-RU')}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-muted-foreground">Дата обновления</Label>
                        <p className="text-sm">
                            {new Date(rarity.updatedAt).toLocaleString('ru-RU')}
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
