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
import { mapsControllerGetMapQueryKey } from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { MapFloorDto } from '@/lib/api_client/gen';
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
    level: z.coerce.number().int().min(1, 'Номер этажа должен быть >= 1'),
});

type UpdateMapFloorDialogProps = {
    floor: MapFloorDto;
    map_id: string;
};

export const UpdateMapFloorDialog = ({ floor, map_id }: UpdateMapFloorDialogProps) => {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();
    const form = useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            id: floor.id,
            map_id,
            name: floor.name,
            level: Number(floor.level ?? 1),
        },
        mode: 'onChange',
    });

    useEffect(() => {
        if (!open) return;
        form.reset({
            id: floor.id,
            map_id,
            name: floor.name,
            level: Number(floor.level ?? 1),
        });
    }, [open, floor, map_id, form]);

    const { mutate: updateFloor, isPending } = useMutation({
        mutationFn: async (body: z.output<typeof schema>) => {
            const client = getPublicClient();
            const response = await client.request({
                method: 'POST',
                url: '/api/map/admin/update-floor',
                headers: { 'Content-Type': 'application/json' },
                body,
                throwOnError: true,
            });
            return response.data;
        },
        onSuccess: () => {
            toast.success('Этаж обновлен');
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
            toast.error('Ошибка при обновлении этажа');
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
                    <DialogTitle>Редактировать этаж</DialogTitle>
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
                                        <Input {...field} placeholder="Этаж 2" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="level"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Номер этажа</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={1}
                                            {...field}
                                            value={
                                                typeof field.value === 'number' ? field.value : ''
                                            }
                                            onChange={(event) =>
                                                field.onChange(
                                                    Number.parseInt(event.target.value, 10)
                                                )
                                            }
                                        />
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
                        onClick={() => updateFloor(schema.parse(form.getValues()))}
                    >
                        {isPending ? 'Сохранение...' : 'Сохранить'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
