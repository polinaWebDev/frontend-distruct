import { ReactNode } from 'react';
import { AppLayout } from '@/domain/Layout/AppLayout';
import { getCurrentUser } from '@/actions/user/getCurrentUser';
import './client.css';
import { Toaster } from 'sonner';
import { isServerMobile } from '@/lib/server/isMobileServer';

export default async function Layout({ children }: { children: ReactNode }) {
    const user = await getCurrentUser();
    const isMobileServer = await isServerMobile();

    return (
        <AppLayout user={user} isMobileServer={isMobileServer}>
            {children}
            <Toaster />
        </AppLayout>
    );
}
