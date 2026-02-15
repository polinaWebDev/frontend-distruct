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
import { getPublicClient } from '@/lib/api_client/public_client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createLucideIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

const schema = z.object({
    map_id: z.string(),
    name: z.string().min(1, 'Введите название'),
    level: z.coerce.number().int().min(1, 'Номер этажа должен быть >= 1'),
});

const LayersPlusIcon = createLucideIcon('LayersPlus', [
    [
        'path',
        {
            d: 'M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 .83.18 2 2 0 0 0 .83-.18l8.58-3.9a1 1 0 0 0 0-1.831z',
            key: '1',
        },
    ],
    ['path', { d: 'M16 17h6', key: '2' }],
    ['path', { d: 'M19 14v6', key: '3' }],
    ['path', { d: 'M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 .825.178', key: '4' }],
    ['path', { d: 'M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l2.116-.962', key: '5' }],
]);

export const CreateMapFloorDialog = ({ map_id }: { map_id: string }) => {
    const queryClient = useQueryClient();
    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            map_id,
            name: '',
            level: 1,
        },
        mode: 'onChange',
    });

    const { mutate: createFloor, isPending } = useMutation({
        mutationFn: async (body: z.infer<typeof schema>) => {
            const client = getPublicClient();
            const response = await client.request({
                method: 'POST',
                url: '/api/map/admin/create-floor',
                headers: { 'Content-Type': 'application/json' },
                body,
                throwOnError: true,
            });
            return response.data;
        },
        onSuccess: () => {
            toast.success('Этаж создан');
            queryClient.resetQueries({
                queryKey: mapsControllerGetMapQueryKey({
                    path: { id: map_id },
                    client: getPublicClient(),
                }),
            });
        },
        onError: (error) => {
            console.error(error);
            toast.error('Ошибка при создании этажа');
        },
    });

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>
                    <LayersPlusIcon />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Создать этаж</DialogTitle>
                    <DialogDescription>Добавьте новый слой/этаж для карты</DialogDescription>
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
                        onClick={() => createFloor(form.getValues())}
                    >
                        {isPending ? 'Создание...' : 'Создать'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
