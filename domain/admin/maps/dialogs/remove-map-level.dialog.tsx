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
    mapsAdminControllerRemoveMapLevelMutation,
    mapsControllerGetMapQueryKey,
} from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { getPublicClient } from '@/lib/api_client/public_client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Trash } from 'lucide-react';
import { toast } from 'sonner';

export const RemoveMapLevelDialog = ({ id, map_id }: { id?: string; map_id: string }) => {
    const queryClient = useQueryClient();
    const { mutate: removeLevel, isPending } = useMutation({
        ...mapsAdminControllerRemoveMapLevelMutation({
            client: getPublicClient(),
        }),
        onSuccess: () => {
            toast.success('Сложность удалена');
        },
        onMutate: () => {
            toast.loading('Удаление сложности...', { id: 'remove-map-level-toast' });
        },
        onSettled: () => {
            toast.dismiss('remove-map-level-toast');
            queryClient.resetQueries({
                queryKey: mapsControllerGetMapQueryKey({
                    path: { id: map_id },
                    client: getPublicClient(),
                }),
            });
        },
        onError: (error) => {
            console.error(error);
            toast.error('Ошибка при удалении сложности');
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
                    <AlertDialogTitle>Удалить сложность</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogDescription>
                    Вы уверены, что хотите удалить этот уровень сложности?
                </AlertDialogDescription>
                <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => removeLevel({ body: { id, map_id } })}
                        disabled={isPending}
                    >
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Удалить'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
