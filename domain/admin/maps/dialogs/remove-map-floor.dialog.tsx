import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { mapsControllerGetMapQueryKey } from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { getPublicClient } from '@/lib/api_client/public_client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Trash } from 'lucide-react';
import { toast } from 'sonner';

export const RemoveMapFloorDialog = ({ id, map_id }: { id?: string; map_id: string }) => {
    const queryClient = useQueryClient();
    const { mutate: removeFloor, isPending } = useMutation({
        mutationFn: async () => {
            const client = getPublicClient();
            const response = await client.request({
                method: 'POST',
                url: '/api/map/admin/delete-floor',
                headers: { 'Content-Type': 'application/json' },
                body: { id, map_id },
                throwOnError: true,
            });
            return response.data;
        },
        onSuccess: () => {
            toast.success('Этаж удален');
        },
        onMutate: () => {
            toast.loading('Удаление этажа...', { id: 'remove-map-floor-toast' });
        },
        onSettled: () => {
            toast.dismiss('remove-map-floor-toast');
            queryClient.resetQueries({
                queryKey: mapsControllerGetMapQueryKey({
                    path: { id: map_id },
                    client: getPublicClient(),
                }),
            });
        },
        onError: (error) => {
            console.error(error);
            toast.error('Ошибка при удалении этажа');
        },
    });

    if (!id) return null;

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size={'icon'}
                    onClick={(event) => event.stopPropagation()}
                    onPointerDown={(event) => event.stopPropagation()}
                >
                    <Trash className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Удалить этаж</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogDescription>
                    Вы уверены, что хотите удалить этот этаж?
                </AlertDialogDescription>
                <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction onClick={() => removeFloor()} disabled={isPending}>
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Удалить'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
