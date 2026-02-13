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
    mapsCategoriesAdminControllerRemoveMapCategoryMutation,
    mapsControllerGetMapQueryKey,
} from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { getPublicClient } from '@/lib/api_client/public_client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Loader2, Trash } from 'lucide-react';
import { toast } from 'sonner';

export const RemoveMapCategoryDialog = ({ id, map_id }: { id?: string; map_id: string }) => {
    const queryClient = useQueryClient();
    const { mutate: removeCategory, isPending } = useMutation({
        ...mapsCategoriesAdminControllerRemoveMapCategoryMutation({
            client: getPublicClient(),
        }),
        onSuccess: () => {
            toast.success('Категория успешно удалена');
        },
        onMutate: () => {
            toast.loading('Удаление категории...', {
                id: 'remove-map-category-toast',
            });
        },
        onSettled: () => {
            toast.dismiss('remove-map-category-toast');
            queryClient.resetQueries({
                queryKey: mapsControllerGetMapQueryKey({
                    path: { id: map_id },
                    client: getPublicClient(),
                }),
            });
        },
        onError: () => {
            toast.error('Ошибка при удалении категории');
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
                    <AlertDialogTitle>Удалить категорию</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogDescription>
                    Вы уверены, что хотите удалить эту категорию?
                </AlertDialogDescription>
                <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => removeCategory({ body: { id: id } })}
                        disabled={isPending}
                    >
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Удалить'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
