import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    mapsAdminControllerUpdateMapLevelMutation,
    mapsControllerGetMapQueryKey,
} from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { MapLevelDto } from '@/lib/api_client/gen';
import { getPublicClient } from '@/lib/api_client/public_client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

const schema = z.object({
    id: z.string(),
    map_id: z.string(),
    name: z.string().min(1, 'Введите название'),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Введите цвет в формате #RRGGBB'),
    sort_order: z.coerce.number().int().min(1, 'Порядок должен быть >= 1'),
});

type UpdateMapLevelDialogProps = {
    level: MapLevelDto;
    map_id: string;
};

export const UpdateMapLevelDialog = ({ level, map_id }: UpdateMapLevelDialogProps) => {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();
    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            id: level.id,
            map_id,
            name: level.name,
            color: level.color ?? '#9CA3AF',
            sort_order: Number(level.sort_order ?? 1),
        },
        mode: 'onChange',
    });

    useEffect(() => {
        if (!open) return;
        form.reset({
            id: level.id,
            map_id,
            name: level.name,
            color: level.color ?? '#9CA3AF',
            sort_order: Number(level.sort_order ?? 1),
        });
    }, [open, level, map_id, form]);

    const { mutate: updateLevel, isPending } = useMutation({
        ...mapsAdminControllerUpdateMapLevelMutation({
            client: getPublicClient(),
        }),
        onSuccess: () => {
            toast.success('Сложность обновлена');
            setOpen(false);
            queryClient.resetQueries({
                queryKey: mapsControllerGetMapQueryKey({
                    path: { id: map_id },
                    client: getPublicClient(),
                }),
            });
        },
        onError: (error) => {
            console.error(error);
            toast.error('Ошибка при обновлении сложности');
        },
    });

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    size={'icon'}
                    variant={'ghost'}
                    onClick={(event) => event.stopPropagation()}
                    onPointerDown={(event) => event.stopPropagation()}
                >
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Редактировать сложность</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <div className="flex flex-col gap-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Название</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Легко" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="color"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Цвет</FormLabel>
                                    <FormControl>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="color"
                                                value={field.value}
                                                onChange={(e) =>
                                                    field.onChange(e.target.value.toUpperCase())
                                                }
                                                className="h-10 w-12 p-1"
                                            />
                                            <Input
                                                value={field.value}
                                                onChange={(e) =>
                                                    field.onChange(e.target.value.toUpperCase())
                                                }
                                                placeholder="#9CA3AF"
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="sort_order"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Порядок</FormLabel>
                                    <FormControl>
                                        <Input type="number" min={1} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </Form>
                <DialogFooter>
                    <Button
                        disabled={!form.formState.isValid || isPending}
                        onClick={() => updateLevel({ body: form.getValues() })}
                    >
                        {isPending ? 'Сохранение...' : 'Сохранить'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
