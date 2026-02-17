import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    mapsAdminControllerCreateMapLevelMutation,
    mapsControllerGetMapQueryKey,
} from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { MapLevelDto } from '@/lib/api_client/gen';
import { getPublicClient } from '@/lib/api_client/public_client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Gauge } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

type CreateMapLevelDialogProps = {
    map_id: string;
    levels?: MapLevelDto[];
    compact?: boolean;
};

export const CreateMapLevelDialog = ({
    map_id,
    levels = [],
    compact = false,
}: CreateMapLevelDialogProps) => {
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [sortOrder, setSortOrder] = useState('1');

    const nextSortOrder = useMemo(() => {
        const maxSortOrder = levels.reduce((acc, level) => {
            const value = Number(level.sort_order);
            return Number.isFinite(value) ? Math.max(acc, value) : acc;
        }, 0);
        return String(maxSortOrder + 1);
    }, [levels]);

    const clearAndClose = () => {
        setOpen(false);
        setName('');
        setSortOrder(nextSortOrder);
    };

    const { mutate: createLevel, isPending } = useMutation({
        ...mapsAdminControllerCreateMapLevelMutation({
            client: getPublicClient(),
        }),
        onSuccess: () => {
            toast.success('Сложность добавлена');
            queryClient.resetQueries({
                queryKey: mapsControllerGetMapQueryKey({
                    path: { id: map_id },
                    client: getPublicClient(),
                }),
            });
            clearAndClose();
        },
        onError: (error) => {
            console.error(error);
            toast.error('Не удалось добавить сложность');
        },
    });

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                setOpen(nextOpen);
                if (nextOpen) {
                    setSortOrder(nextSortOrder);
                } else if (!isPending) {
                    setName('');
                }
            }}
        >
            <DialogTrigger asChild>
                {compact ? (
                    <Button type="button" size="icon" variant="ghost">
                        <Gauge className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button type="button">
                        <Gauge className="h-4 w-4" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Добавить сложность</DialogTitle>
                    <DialogDescription>Создайте новый уровень сложности для карты</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <p className="text-sm text-white">Название</p>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Легко"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <p className="text-sm text-white">Порядок</p>
                        <Input
                            type="number"
                            min={1}
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            placeholder="1"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        type="button"
                        disabled={isPending || !name.trim() || Number(sortOrder) < 1}
                        onClick={() => {
                            createLevel({
                                body: {
                                    map_id,
                                    name: name.trim(),
                                    sort_order: Number(sortOrder),
                                },
                            });
                        }}
                    >
                        {isPending ? 'Сохранение...' : 'Сохранить'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
