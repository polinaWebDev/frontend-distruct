import { AppDialogContent, AppDialog } from '@/ui/AppDialog/app-dialog';
import styles from './challenge-offer-dialog.module.css';
import z from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppControlledInput, AppControlledTextarea } from '@/ui/AppInput/AppInput';

import { AppBtn } from '@/ui/SmallBtn/AppBtn';
import { getPublicClient } from '@/lib/api_client/public_client';
import { useMutation } from '@tanstack/react-query';
import { offerControllerCreateOfferMutation } from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { toast } from 'sonner';
import { ChallengeFileUpload } from '@/domain/client/challenge-page/components/challenge-file-upload/challenge-file-upload';

const schema = z.object({
    title: z.string(),
    comment: z.string(),
    files: z.array(z.instanceof(File)).max(5),
});

export const ChallengeOfferDialog = ({ onClose }: { onClose: () => void }) => {
    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            title: '',
            comment: '',
            files: [],
        },
    });

    const { mutate: createOffer, isPending } = useMutation({
        ...offerControllerCreateOfferMutation({
            client: getPublicClient(),
        }),
        onSuccess: () => {
            toast.success('Челлендж успешно предложен');
            form.reset();
            onClose();
        },
        onMutate: () => {
            toast.loading('Отправка предложения...', { id: 'upload-for-review-toast' });
        },
        onSettled: () => {
            toast.dismiss('upload-for-review-toast');
        },
        onError: (error) => {
            console.error(error);
            toast.error('Ошибка при отправке предложения');
        },
    });

    const onSubmit = (data: z.infer<typeof schema>) => {
        createOffer({
            body: {
                title: data.title,
                description: data.comment,
                files: data.files.length > 0 ? data.files : undefined,
            },
        });
    };

    return (
        <AppDialog onClose={onClose} title="Предложить челлендж">
            <AppDialogContent onClose={onClose}>
                <div className={styles.content}>
                    <div className={styles.text}>
                        <h1 className={styles.title}>Предложите свой челлендж</h1>
                    </div>

                    <div className={styles.form}>
                        <AppControlledInput
                            control={form.control}
                            name="title"
                            label="Заголовок"
                            placeholder="Введите заголовок челленджа"
                        />
                        <AppControlledTextarea
                            control={form.control}
                            name="comment"
                            label="Комментарий"
                            placeholder="Опишите суть челленджа"
                            rows={4}
                        />

                        <Controller
                            control={form.control}
                            name="files"
                            render={({ field: { value, onChange } }) => (
                                <ChallengeFileUpload
                                    value={value}
                                    onChange={onChange}
                                    maxFiles={5}
                                    maxSize={100 * 1024 * 1024}
                                    description="При желании приложите фото, которые помогут раскрыть суть челленджа"
                                />
                            )}
                        />
                    </div>

                    <div className={styles.buttons}>
                        <AppBtn
                            text="Отправить"
                            onClick={() => form.handleSubmit(onSubmit)()}
                            disabled={!form.formState.isValid || isPending}
                        />
                    </div>
                </div>
            </AppDialogContent>
        </AppDialog>
    );
};
