import { getCurrentUser } from '@/actions/user/getCurrentUser';
import { redirect } from 'next/navigation';
import '@/app/globals.css';
import { Toaster } from '@/components/ui/sonner';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/admin/AppSidebar';
import { Separator } from '@/components/ui/separator';
import { AdminGameTypeProvider } from '@/domain/admin/context/admin-game-type-context';

export const dynamic = 'force-dynamic';
export default async function Layout({ children }: { children: React.ReactNode }) {
    const user = await getCurrentUser();

    if (!user || user.role !== 'admin') {
        return redirect('/');
    }

    return (
        <AdminGameTypeProvider>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg font-semibold">Админ-панель</h1>
                        </div>
                    </header>
                    <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
                </SidebarInset>
                <Toaster />
            </SidebarProvider>
        </AdminGameTypeProvider>
    );
}
