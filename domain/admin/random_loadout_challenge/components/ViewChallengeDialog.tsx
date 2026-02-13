'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { RandomChallengeFullDto } from '@/lib/api_client/gen/types.gen';
import { Badge } from '@/components/ui/badge';

interface ViewChallengeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    challenge: RandomChallengeFullDto;
}

export function ViewChallengeDialog({ open, onOpenChange, challenge }: ViewChallengeDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Просмотр челленджа</DialogTitle>
                    <DialogDescription>
                        Детальная информация о рандомном челлендже
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <Label>Название</Label>
                            <p className="text-lg font-medium">{challenge.name}</p>
                        </div>

                        <div>
                            <Label>Описание</Label>
                            <p className="text-sm text-muted-foreground">{challenge.description}</p>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label>Уровень челленджа</Label>
                                <p className="text-lg font-medium">{challenge.challenge_level}</p>
                            </div>

                            <div>
                                <Label>Мин. тир</Label>
                                <p className="text-lg font-medium">{challenge.min_tier}</p>
                            </div>

                            <div>
                                <Label>Макс. тир</Label>
                                <p className="text-lg font-medium">{challenge.max_tier}</p>
                            </div>
                        </div>

                        <div>
                            <Label>Цвет</Label>
                            <div className="flex items-center gap-2 mt-2">
                                <div
                                    className="w-8 h-8 rounded border"
                                    style={{ backgroundColor: challenge.color }}
                                />
                                <span className="font-mono">{challenge.color}</span>
                            </div>
                        </div>

                        <div>
                            <Label>
                                Категории для генерации ({challenge.challenge_items.length})
                            </Label>
                            <div className="mt-2 space-y-2">
                                {challenge.challenge_items.length > 0 ? (
                                    <div className="border rounded-md p-4 space-y-2">
                                        {challenge.challenge_items
                                            .sort((a, b) => a.order - b.order)
                                            .map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex items-center justify-between bg-secondary p-2 rounded"
                                                >
                                                    <span className="font-medium">
                                                        {item.gear_category.name}
                                                    </span>
                                                    <Badge variant="outline">
                                                        Порядок: {item.order}
                                                    </Badge>
                                                </div>
                                            ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        Категории не указаны
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <Label>Типы для исключения ({challenge.types_to_exclude.length})</Label>
                            <div className="mt-2">
                                {challenge.types_to_exclude.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {challenge.types_to_exclude.map((type: any) => (
                                            <Badge key={type.id} variant="secondary">
                                                {type.name}
                                            </Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">Нет исключений</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <Label>
                                Редкости для исключения ({challenge.rarities_to_exclude.length})
                            </Label>
                            <div className="mt-2">
                                {challenge.rarities_to_exclude.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {challenge.rarities_to_exclude.map((rarity: any) => (
                                            <Badge
                                                key={rarity.id}
                                                variant="secondary"
                                                style={{
                                                    backgroundColor: rarity.color,
                                                    color: '#fff',
                                                }}
                                            >
                                                {rarity.name}
                                            </Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">Нет исключений</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <Label>
                                Дополнительные условия ({challenge.additional_conditions.length})
                            </Label>
                            <div className="mt-2">
                                {challenge.additional_conditions.length > 0 ? (
                                    <div className="border rounded-md p-4 space-y-2">
                                        {challenge.additional_conditions.map((condition, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <Badge variant="outline">{index + 1}</Badge>
                                                <span className="text-sm">{condition}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        Нет дополнительных условий
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button onClick={() => onOpenChange(false)}>Закрыть</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
