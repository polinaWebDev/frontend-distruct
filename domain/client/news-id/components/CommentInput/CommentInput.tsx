import styles from './CommentInput.module.css';
import z from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppBtn } from '@/ui/SmallBtn/AppBtn';
import TextareaAutosize from 'react-textarea-autosize';
import clsx from 'clsx';
import { commentsControllerCreateNewsCommentMutation } from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { getPublicClient } from '@/lib/api_client/public_client';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
const schema = z.object({
    content: z
        .string()
        .min(1, 'Комментарий не может быть пустым')
        .max(500, 'Комментарий не может быть больше 500 символов'),
});

export const CommentInput = ({ refetch, news_id }: { refetch: () => void; news_id: string }) => {
    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            content: '',
        },
        mode: 'onChange',
    });

    const { mutate, isPending } = useMutation({
        ...commentsControllerCreateNewsCommentMutation({
            client: getPublicClient(),
        }),
        onSuccess: () => {
            refetch();
            form.reset();
        },
        onError: (error) => {
            console.error(error);
            toast.error('Ошибка при создании комментария');
        },
    });

    const handleSubmit = (data: z.infer<typeof schema>) => {
        mutate({
            body: {
                content: data.content,
                news_id: news_id,
            },
        });
    };

    return (
        <div className={styles.container}>
            <Controller
                control={form.control}
                name="content"
                render={({ field, fieldState }) => (
                    <TextareaAutosize
                        placeholder="Напишите комментарий..."
                        className={clsx(styles.input_container, fieldState.error && styles.errored)}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        minRows={1}
                        maxRows={5}
                        rows={1}
                        // onKeyDown={(e) => {
                        //     if (e.key === 'Enter') {
                        //         e.preventDefault();
                        //         e.stopPropagation();
                        //         form.handleSubmit(handleSubmit)();
                        //     }
                        // }}
                    />
                )}
            />

            <AppBtn
                className={styles.send_btn}
                text="Отправить"
                onClick={form.handleSubmit(handleSubmit)}
                disabled={!form.formState.isValid || isPending}
                big
            />
        </div>
    );
};
