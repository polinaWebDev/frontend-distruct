import { getCurrentUser } from '@/actions/user/getCurrentUser';
import { ProfilePage } from '@/domain/client/profile/profile-page';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect('/');
    }

    return <ProfilePage profile={user} />;
}
