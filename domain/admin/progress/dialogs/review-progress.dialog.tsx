'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ExternalLinkIcon, CheckIcon, XIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import {
    challengesAdminControllerGetChallengeProgressByIdOptions,
    challengesAdminControllerSetChallengeProgressMutation,
} from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { getPublicClient } from '@/lib/api_client/public_client';
import { ChallengeProgressStatus } from '../types';
import { getFileUrl } from '@/lib/utils';
import type { ChallengeProgressEntity } from '@/lib/api_client/gen/types.gen';

interface ReviewProgressDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    progress: ChallengeProgressEntity | null;
    refetch: () => void;
}

type ReviewFormValues = {
    status: ChallengeProgressStatus;
    review_comment: string;
    can_be_retried: boolean;
};

export function ReviewProgressDialog({
    open,
    onOpenChange,
    progress,
    refetch,
}: ReviewProgressDialogProps) {
    const queryClient = useQueryClient();

    const { data: progressData } = useQuery({
        ...challengesAdminControllerGetChallengeProgressByIdOptions({
            client: getPublicClient(),
            path: {
                id: progress?.id ?? '',
            },
        }),
        enabled: !!progress?.id && open,
    });

    const activeProgress = progressData ?? progress;

    const form = useForm<ReviewFormValues>({
        defaultValues: {
            status: ChallengeProgressStatus.Completed,
            review_comment: '',
            can_be_retried: false,
        },
    });

    const { register, handleSubmit, reset, watch, setValue } = form;
    const watchedStatus = watch('status');

    useEffect(() => {
        if (open && activeProgress) {
            reset({
                status:
                    activeProgress.status === ChallengeProgressStatus.WaitingForReview
                        ? ChallengeProgressStatus.Completed
                        : (activeProgress.status as ChallengeProgressStatus),
                review_comment: activeProgress.review_comment ?? '',
                can_be_retried: activeProgress.can_be_retried ?? false,
            });
        }
    }, [open, activeProgress, reset]);

    const mutation = useMutation({
        ...challengesAdminControllerSetChallengeProgressMutation({
            client: getPublicClient(),
        }),
        onSuccess: () => {
            toast.success('Статус челленджа обновлен');

            queryClient.invalidateQueries({
                queryKey: ['challengesAdminControllerGetChallengeProgressById'],
            });
            refetch();
            onOpenChange(false);
        },
        onError: () => {
            toast.error('Ошибка при обновлении статуса');
        },
    });

    const onSubmit = (values: ReviewFormValues) => {
        if (!activeProgress) return;

        mutation.mutate({
            body: {
                progress_id: activeProgress.id,
                status: values.status,
                review_comment: values.review_comment,
                can_be_retried: values.can_be_retried,
            },
        });
    };

    if (!activeProgress) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Проверка выполнения челленджа</DialogTitle>
                    <DialogDescription>
                        Проверьте доказательства и примите решение
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Info Section */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <Label className="text-muted-foreground">Игрок</Label>
                            <div className="font-medium">
                                {activeProgress.user?.username || 'Unknown'}
                            </div>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Челлендж</Label>
                            <div className="font-medium">
                                {activeProgress.challenge?.title || 'Unknown'}
                            </div>
                        </div>
                        <div className="col-span-2">
                            <Label className="text-muted-foreground">Комментарий игрока</Label>
                            <div className="p-2 bg-muted rounded-md mt-1 text-sm">
                                {activeProgress.user_comment || 'Нет комментария'}
                            </div>
                        </div>
                        <div className="col-span-2">
                            <Label className="text-muted-foreground">Доказательство</Label>
                            <div className="mt-1">
                                {activeProgress.upload_url ? (
                                    <div className="flex items-center gap-2">
                                        <a
                                            href={getFileUrl(activeProgress.upload_url)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center text-primary hover:underline"
                                        >
                                            <ExternalLinkIcon className="w-4 h-4 mr-1" />
                                            Открыть файл
                                        </a>
                                        {/* Simple preview if it's an image */}
                                        {['jpg', 'jpeg', 'png', 'webp'].some((ext) =>
                                            activeProgress.upload_url?.toLowerCase().endsWith(ext)
                                        ) && (
                                            <div className="mt-2 border rounded-lg overflow-hidden w-full max-h-[300px] relative">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={getFileUrl(activeProgress.upload_url)}
                                                    alt="Proof"
                                                    className="object-contain w-full h-full"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-muted-foreground italic">
                                        Файл не приложен
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Review Form */}
                    <form
                        id="review-form"
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-4 border-t pt-4"
                    >
                        <div className="space-y-3">
                            <Label>Решение</Label>
                            <RadioGroup
                                value={watchedStatus}
                                onValueChange={(val: ChallengeProgressStatus) =>
                                    setValue('status', val as ChallengeProgressStatus)
                                }
                                className="flex gap-4"
                            >
                                <div className="flex items-center space-x-2 border p-3 rounded-md cursor-pointer hover:bg-accent w-full">
                                    <RadioGroupItem
                                        value={ChallengeProgressStatus.Completed}
                                        id="r-completed"
                                    />
                                    <Label
                                        htmlFor="r-completed"
                                        className="cursor-pointer flex items-center gap-2 w-full"
                                    >
                                        <CheckIcon className="w-4 h-4 text-green-600" />
                                        Подтвердить выполнение
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2 border p-3 rounded-md cursor-pointer hover:bg-accent w-full">
                                    <RadioGroupItem
                                        value={ChallengeProgressStatus.Failed}
                                        id="r-failed"
                                    />
                                    <Label
                                        htmlFor="r-failed"
                                        className="cursor-pointer flex items-center gap-2 w-full"
                                    >
                                        <XIcon className="w-4 h-4 text-red-600" />
                                        Отклонить
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {watchedStatus === ChallengeProgressStatus.Failed && (
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="can-retry"
                                    checked={watch('can_be_retried')}
                                    onCheckedChange={(checked: boolean) =>
                                        setValue('can_be_retried', checked === true)
                                    }
                                />
                                <Label htmlFor="can-retry">Разрешить повторную попытку</Label>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="comment">Комментарий администратора</Label>
                            <Textarea
                                id="comment"
                                placeholder={
                                    watchedStatus === ChallengeProgressStatus.Failed
                                        ? 'Укажите причину отклонения...'
                                        : 'Комментарий (необязательно)...'
                                }
                                {...register('review_comment', {
                                    required:
                                        watchedStatus === ChallengeProgressStatus.Failed
                                            ? 'Причина отклонения обязательна'
                                            : false,
                                })}
                            />
                            {form.formState.errors.review_comment && (
                                <p className="text-sm text-destructive">
                                    {form.formState.errors.review_comment.message}
                                </p>
                            )}
                        </div>
                    </form>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Отмена
                    </Button>
                    <Button type="submit" form="review-form" disabled={mutation.isPending}>
                        {mutation.isPending ? 'Сохранение...' : 'Сохранить решение'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
