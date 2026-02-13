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
    mapsAdminControllerRemoveMapMutation,
    mapsControllerGetMapListQueryKey,
} from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { getPublicClient } from '@/lib/api_client/public_client';
import { GameType } from '@/lib/enums/game_type.enum';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Loader2, Trash } from 'lucide-react';
import { toast } from 'sonner';

export const RemoveMapDialog = ({ id, game_type }: { id?: string; game_type: GameType }) => {
    const queryClient = useQueryClient();
    const { mutate: removeMap, isPending } = useMutation({
        ...mapsAdminControllerRemoveMapMutation({
            client: getPublicClient(),
        }),
        onSuccess: () => {
            toast.success('Карта успешно удалена');
        },
        onMutate: () => {
            toast.loading('Удаление карты...', { id: 'remove-map-toast' });
        },
        onSettled: () => {
            toast.dismiss('remove-map-toast');
            queryClient.resetQueries({
                queryKey: mapsControllerGetMapListQueryKey({
                    query: { game_type: game_type },
                    client: getPublicClient(),
                }),
            });
        },
        onError: () => {
            toast.error('Ошибка при удалении карты');
        },
    });

    if (!id) {
        return null;
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive">
                    <Trash />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Удалить карту</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogDescription>
                    Вы уверены, что хотите удалить эту карту?
                </AlertDialogDescription>
                <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => removeMap({ body: { id: id } })}
                        disabled={isPending}
                    >
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Удалить'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
