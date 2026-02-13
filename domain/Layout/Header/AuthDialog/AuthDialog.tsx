'use client';

import { Login } from './components/Login/Login';
import { useState } from 'react';
import { Otp } from './components/Otp/Otp';
import { ApDialogContent, AppDialog } from '@/ui/AppDialog/app-dialog';

export const AuthDialog = ({ onClose }: { onClose: () => void }) => {
    const [email, setEmail] = useState<string | null>(null);

    return (
        <AppDialog title="Авторизация" onClose={onClose}>
            <ApDialogContent onClose={onClose}>
                {!email && (
                    <Login
                        onSubmit={(data) => {
                            setEmail(data.email);
                        }}
                    />
                )}

                {email && <Otp email={email} onBack={() => setEmail(null)} />}
            </ApDialogContent>
        </AppDialog>
    );
};
