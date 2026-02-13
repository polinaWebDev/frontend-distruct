'use client';

import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { GAME_TYPE_VALUES } from '@/lib/enums/game_type.enum';
import type { GearEntity } from '@/lib/api_client/gen/types.gen';
import { getFileUrl } from '@/lib/utils';

interface ViewGearDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    gear: GearEntity;
}

export function ViewGearDialog({ open, onOpenChange, gear }: ViewGearDialogProps) {
    const gameTypeLabel =
        GAME_TYPE_VALUES.find((gt) => gt.value === gear.game_type)?.label || gear.game_type;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Информация о предмете</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <Label>Название</Label>
                        <p className="mt-1 text-sm">{gear.name}</p>
                    </div>

                    <div>
                        <Label>Описание</Label>
                        <p className="mt-1 text-sm whitespace-pre-wrap">{gear.description}</p>
                    </div>

                    <div>
                        <Label>Тип игры</Label>
                        <p className="mt-1 text-sm">{gameTypeLabel}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Уровень</Label>
                            <p className="mt-1 text-sm">{gear.tier}</p>
                        </div>
                        <div>
                            <Label>Вес</Label>
                            <p className="mt-1 text-sm">{gear.weight}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <Label>Категория</Label>
                            <p className="mt-1 text-sm">{gear.category?.name || 'N/A'}</p>
                        </div>
                        <div>
                            <Label>Редкость</Label>
                            <p className="mt-1 text-sm">{gear.rarity?.name || 'N/A'}</p>
                        </div>
                        <div>
                            <Label>Тип</Label>
                            <p className="mt-1 text-sm">{gear.type?.name || 'N/A'}</p>
                        </div>
                    </div>

                    {gear.image_url && (
                        <div>
                            <Label>Изображение</Label>
                            <div className="mt-2 relative w-full max-w-xs aspect-square">
                                <Image
                                    src={getFileUrl(gear.image_url)}
                                    alt={gear.name}
                                    width={256}
                                    height={256}
                                    className="object-contain w-full h-full rounded-lg border"
                                />
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                            <Label>ID</Label>
                            <p className="mt-1 text-sm font-mono text-muted-foreground">
                                {gear.id}
                            </p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
