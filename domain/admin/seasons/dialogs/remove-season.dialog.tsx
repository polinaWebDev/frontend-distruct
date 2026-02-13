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
    challengeSeasonAdminControllerGetListQueryKey,
    challengeSeasonAdminControllerRemoveMutation,
} from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { getPublicClient } from '@/lib/api_client/public_client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Trash } from 'lucide-react';
import { toast } from 'sonner';

export const RemoveSeasonDialog = ({ id }: { id?: string }) => {
    const queryClient = useQueryClient();
    const { mutate: removeSeason, isPending } = useMutation({
        ...challengeSeasonAdminControllerRemoveMutation({
            client: getPublicClient(),
        }),
        onSuccess: () => {
            toast.success('Сезон успешно удалён');
        },
        onMutate: () => {
            toast.loading('Удаление сезона...', { id: 'remove-season-toast' });
        },
        onSettled: () => {
            toast.dismiss('remove-season-toast');
            queryClient.resetQueries({
                queryKey: challengeSeasonAdminControllerGetListQueryKey(),
            });
        },
        onError: () => {
            toast.error('Ошибка при удалении сезона');
        },
    });

    if (!id) {
        return null;
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" title="Удалить">
                    <Trash className="w-4 h-4 text-destructive" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Удалить сезон</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogDescription>
                    Вы уверены, что хотите удалить этот сезон?
                </AlertDialogDescription>
                <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => removeSeason({ body: { id: id } })}
                        disabled={isPending}
                    >
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Удалить'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
