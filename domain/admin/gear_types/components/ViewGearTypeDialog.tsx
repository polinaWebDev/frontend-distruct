'use client';

import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { GAME_TYPE_VALUES } from '@/lib/enums/game_type.enum';
import type { GearTypeEntity } from '@/lib/api_client/gen/types.gen';
import { getFileUrl } from '@/lib/utils';

interface ViewGearTypeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    gearType: GearTypeEntity;
}

export function ViewGearTypeDialog({ open, onOpenChange, gearType }: ViewGearTypeDialogProps) {
    const gameTypeLabel =
        GAME_TYPE_VALUES.find((gt) => gt.value === gearType.game_type)?.label || gearType.game_type;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Информация о типе предмета</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <Label>Название</Label>
                        <p className="mt-1 text-sm">{gearType.name}</p>
                    </div>

                    <div>
                        <Label>Описание</Label>
                        <p className="mt-1 text-sm whitespace-pre-wrap">{gearType.description}</p>
                    </div>

                    <div>
                        <Label>Тип игры</Label>
                        <p className="mt-1 text-sm">{gameTypeLabel}</p>
                    </div>

                    {gearType.image_url && (
                        <div>
                            <Label>Изображение</Label>
                            <div className="mt-2 relative w-full max-w-xs aspect-square">
                                <Image
                                    src={getFileUrl(gearType.image_url)}
                                    alt={gearType.name}
                                    width={256}
                                    height={256}
                                    className="object-contain w-full h-full rounded-lg border"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <Label>Исключённые типы</Label>
                        {gearType.excluded_types && gearType.excluded_types.length > 0 ? (
                            <ul className="mt-2 space-y-1">
                                {gearType.excluded_types.map((excludedType) => (
                                    <li key={excludedType.id} className="text-sm">
                                        • {excludedType.name}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="mt-1 text-sm text-muted-foreground">
                                Нет исключённых типов
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                            <Label>ID</Label>
                            <p className="mt-1 text-sm font-mono text-muted-foreground">
                                {gearType.id}
                            </p>
                        </div>
                        <div>
                            <Label>Дата создания</Label>
                            {/* <p className="mt-1 text-sm text-muted-foreground">
                {new Date(gearType.created_at).toLocaleDateString('ru-RU')}
              </p> */}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
