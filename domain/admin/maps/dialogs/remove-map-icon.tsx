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
import {
    mapsTypesAdminControllerRemoveMapTypeMutation,
    mapsControllerGetMapQueryKey,
} from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { getPublicClient } from '@/lib/api_client/public_client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Loader2, Trash } from 'lucide-react';
import { toast } from 'sonner';

export const RemoveMapIconDialog = ({ id, map_id }: { id?: string; map_id: string }) => {
    const queryClient = useQueryClient();
    const { mutate: removeIconType, isPending } = useMutation({
        ...mapsTypesAdminControllerRemoveMapTypeMutation({
            client: getPublicClient(),
        }),
        onSuccess: () => {
            toast.success('Тип иконки успешно удален');
        },
        onMutate: () => {
            toast.loading('Удаление типа иконки...', { id: 'remove-map-icon-toast' });
        },
        onSettled: () => {
            toast.dismiss('remove-map-icon-toast');
            queryClient.resetQueries({
                queryKey: mapsControllerGetMapQueryKey({
                    path: { id: map_id },
                    client: getPublicClient(),
                }),
            });
        },
        onError: () => {
            toast.error('Ошибка при удалении типа иконки');
        },
    });

    if (!id) {
        return null;
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button className="ml-2" variant="destructive" size={'icon'}>
                    <Trash className="object-contain" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Удалить тип иконки</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogDescription>
                    Вы уверены, что хотите удалить этот тип иконки?
                </AlertDialogDescription>
                <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => removeIconType({ body: { id: id } })}
                        disabled={isPending}
                    >
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Удалить'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
