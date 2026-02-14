import { useForm } from 'react-hook-form';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppControlledInput } from '@/ui/AppInput/AppInput';
import { AppBtn } from '@/ui/SmallBtn/AppBtn';
import { useMutation } from '@tanstack/react-query';
import { authControllerRequestLoginMutation } from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { getPublicClient } from '@/lib/api_client/public_client';

const loginSchema = z.object({
    email: z.email({ error: 'Формат email некорректный' }),
});

export const Login = ({ onSubmit }: { onSubmit: (data: z.infer<typeof loginSchema>) => void }) => {
    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
        },
        mode: 'onChange',
    });

    const { mutate, isPending } = useMutation({
        ...authControllerRequestLoginMutation({
            client: getPublicClient(),
        }),
        onSuccess: (data, vars) => {
            onSubmit({ email: vars.body.email });
        },
    });

    const handleSubmit = (data: z.infer<typeof loginSchema>) => {
        mutate({
            body: {
                email: data.email,
            },
        });
    };

    const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
    const twitchLoginUrl = apiBase ? `${apiBase}/api/auth/twitch` : '/api/auth/twitch';

    return (
        <div className="flex flex-col w-full ">
            <div className="flex flex-col w-full gap-4">
                <AppControlledInput
                    control={form.control}
                    name="email"
                    placeholder="Email"
                    showErrorMessage
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            e.stopPropagation();
                            form.handleSubmit(handleSubmit)();
                        }
                    }}
                />
                <AppBtn
                    style={'default'}
                    text="Войти"
                    onClick={form.handleSubmit(handleSubmit)}
                    disabled={!form.formState.isValid || isPending}
                />
            </div>

            <div className="flex w-full gap-[29px] items-center justify-center my-[37px]">
                <div className="w-full h-[1px] bg-[#3C3C42]" />

                <p>или</p>

                <div className="w-full h-[1px] bg-[#3C3C42]" />
            </div>

            <div className="flex flex-col w-full gap-3">
                <AppBtn
                    text="Вход с помощью Twitch"
                    icon="twitch"
                    style="twitch"
                    onClick={() => {
                        window.location.href = twitchLoginUrl;
                    }}
                />
                <AppBtn
                    text="Вход с помощью Google"
                    icon="google"
                    style="google"
                    onClick={() => {
                        window.location.href = `${process.env.NEXT_PUBLIC_GOOGLE_OAUTH_URL}`;
                    }}
                />
            </div>
        </div>
    );
};
