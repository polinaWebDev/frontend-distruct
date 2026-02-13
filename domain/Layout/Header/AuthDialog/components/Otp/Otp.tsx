import { useState } from 'react';
import OtpInput from 'react-otp-input';

import styles from './Otp.module.css';
import { AppBtn } from '@/ui/SmallBtn/AppBtn';
import { GoBackSmall } from '@/lib/icons/GoBackSmall';
import { useMutation } from '@tanstack/react-query';
import { authControllerVerifyMutation } from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { getPublicClient } from '@/lib/api_client/public_client';
import clsx from 'clsx';

export const Otp = ({ email, onBack }: { email: string; onBack: () => void }) => {
    const [otp, setOtp] = useState<string>('');
    const [errored, setErrored] = useState<boolean>(false);

    const { mutate, isPending } = useMutation({
        ...authControllerVerifyMutation({
            client: getPublicClient(),
        }),
        onSuccess: (data, vars) => {
            console.log(data, vars);
            window.location.reload();
        },
        onError: (error) => {
            setErrored(true);
        },
    });

    return (
        <div className={styles.container}>
            <div className={styles.text}>
                <h1>Код подтверждения</h1>
                <p className="text-center">На ваш email {email} отправлен код подтверждения</p>
            </div>

            <OtpInput
                containerStyle={clsx(styles.otp_container, errored && styles.errored)}
                value={otp}
                onChange={(val) => {
                    setOtp(val);
                    setErrored(false);
                }}
                shouldAutoFocus
                numInputs={6}
                renderInput={(props) => (
                    <input
                        {...props}
                        className={clsx(styles.otp_input, errored && styles.errored)}
                        onChange={(e) => {
                            const isNum = /^[0-9]$/.test(e.target.value);
                            if (!isNum) return;
                            props.onChange(e);
                        }}
                    />
                )}
            />

            {errored && <p className={styles.error_message}>Неверный код</p>}

            <AppBtn
                text="Подтвердить"
                disabled={isPending || otp.length !== 6}
                onClick={() => {
                    mutate({
                        body: {
                            email,
                            code: otp,
                        },
                    });
                }}
            />

            <div
                className={styles.go_back}
                onClick={() => {
                    onBack();
                }}
            >
                <p>Вернуться назад</p>
                <GoBackSmall className={styles.icon} />
            </div>
        </div>
    );
};
