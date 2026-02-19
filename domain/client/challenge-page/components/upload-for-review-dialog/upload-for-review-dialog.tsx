import { AppDialogContent, AppDialog } from '@/ui/AppDialog/app-dialog';
import styles from './upload-for-review-dialog.module.css';
import z from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppControlledTextarea } from '@/ui/AppInput/AppInput';
import { ChallengeFileUpload } from '../challenge-file-upload/challenge-file-upload';
import { AppBtn } from '@/ui/SmallBtn/AppBtn';
import { getPublicClient } from '@/lib/api_client/public_client';
import { useMutation } from '@tanstack/react-query';
import { challengesClientControllerSendChallengeToReviewMutation } from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { toast } from 'sonner';

const normalizeSpaces = (value: string) => value.replace(/\s+/g, ' ').trim();

const schema = z.object({
    comment: z
        .string()
        .transform(normalizeSpaces)
        .pipe(
            z
                .string()
                .min(1, 'Комментарий не может быть пустым')
                .max(1000, 'Максимум 1000 символов')
        ),
    files: z.array(z.instanceof(File)).min(1).max(1),
});

export const UploadForReviewDialog = ({
    onClose,
    progress_id,
}: {
    onClose: () => void;
    progress_id: string;
}) => {
    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            comment: '',
            files: [],
        },
        mode: 'onChange',
    });

    const { mutate: uploadForReview, isPending } = useMutation({
        ...challengesClientControllerSendChallengeToReviewMutation({
            client: getPublicClient(),
        }),
        onSuccess: () => {
            toast.success('Файл успешно загружен');
            onClose();
            location.reload();
        },
        onMutate: () => {
            toast.loading('Загрузка файла...', { id: 'upload-for-review-toast' });
        },
        onSettled: () => {
            toast.dismiss('upload-for-review-toast');
        },
        onError: (error) => {
            console.error(error);
            toast.error('Ошибка при загрузке файла');
        },
    });

    const onSubmit = (data: z.infer<typeof schema>) => {
        uploadForReview({
            body: {
                user_comment: data.comment,
                file: data.files[0],
                progress_id: progress_id,
            },
        });
    };

    return (
        <AppDialog onClose={onClose} title="Загрузить для проверки">
            <AppDialogContent onClose={onClose}>
                <div className={styles.content}>
                    <div className={styles.text}>
                        <h1 className={styles.title}>Загрузить файл для проверки</h1>
                        <p className={styles.description}>
                            Загрузите видео или фото для проверки выполнения задания
                        </p>
                    </div>

                    <div className={styles.form}>
                        <AppControlledTextarea
                            control={form.control}
                            name="comment"
                            label="Комментарий"
                            placeholder="Введите комментарий"
                            rows={4}
                        />

                        <Controller
                            control={form.control}
                            name="files"
                            render={({ field: { value, onChange } }) => (
                                <ChallengeFileUpload
                                    value={value}
                                    onChange={onChange}
                                    maxFiles={1}
                                    maxSize={100 * 1024 * 1024}
                                    description="Приложите фото или видео, для проверки выполнения задания"
                                />
                            )}
                        />
                    </div>

                    <div className={styles.buttons}>
                        <AppBtn
                            text="Загрузить"
                            onClick={() => form.handleSubmit(onSubmit)()}
                            disabled={!form.formState.isValid || isPending}
                        />
                    </div>
                </div>
            </AppDialogContent>
        </AppDialog>
    );
};
