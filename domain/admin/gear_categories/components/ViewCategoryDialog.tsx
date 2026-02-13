'use client';

import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { GAME_TYPE_VALUES } from '@/lib/enums/game_type.enum';
import type { GearCategoryEntity } from '@/lib/api_client/gen/types.gen';
import { getFileUrl } from '@/lib/utils';

interface ViewCategoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category: GearCategoryEntity;
}

export function ViewCategoryDialog({ open, onOpenChange, category }: ViewCategoryDialogProps) {
    const gameTypeLabel =
        GAME_TYPE_VALUES.find((gt) => gt.value === category.game_type)?.label || category.game_type;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Информация о категории</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <Label>Название</Label>
                        <p className="mt-1 text-sm">{category.name}</p>
                    </div>

                    <div>
                        <Label>Описание</Label>
                        <p className="mt-1 text-sm whitespace-pre-wrap">{category.description}</p>
                    </div>

                    <div>
                        <Label>Тип игры</Label>
                        <p className="mt-1 text-sm">{gameTypeLabel}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Порядок</Label>
                            <p className="mt-1 text-sm">{category.order}</p>
                        </div>
                        <div>
                            <Label>Длинный слот</Label>
                            <p className="mt-1 text-sm">{category.is_long_slot ? 'Да' : 'Нет'}</p>
                        </div>
                    </div>

                    {category.image_url && (
                        <div>
                            <Label>Изображение</Label>
                            <div className="mt-2 relative w-full max-w-xs aspect-square">
                                <Image
                                    src={getFileUrl(category.image_url)}
                                    alt={category.name}
                                    width={256}
                                    height={256}
                                    className="object-contain w-full h-full rounded-lg border"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <Label>Исключённые категории</Label>
                        {category.excluded_categories && category.excluded_categories.length > 0 ? (
                            <ul className="mt-2 space-y-1">
                                {category.excluded_categories.map((excludedCat) => (
                                    <li key={excludedCat.id} className="text-sm">
                                        • {excludedCat.name}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="mt-1 text-sm text-muted-foreground">
                                Нет исключённых категорий
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                            <Label>ID</Label>
                            <p className="mt-1 text-sm font-mono text-muted-foreground">
                                {category.id}
                            </p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
