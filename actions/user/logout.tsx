'use server';

import { cookies } from 'next/headers';
import { authControllerLogout } from '@/lib/api_client/gen';
import { getServerClient } from '@/lib/api_client/server_client';

export const logout = async () => {
    try {
        await authControllerLogout({
            client: await getServerClient(),
        });
    } catch {
        // ignore API errors; still clear cookies locally
    }

    const cookieStore = await cookies();
    cookieStore.delete('accessToken');
    cookieStore.delete('refreshToken');

    return true;
};
