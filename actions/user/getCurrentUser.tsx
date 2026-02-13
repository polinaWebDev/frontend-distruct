'use server';

import { usersControllerGetMe } from '@/lib/api_client/gen';
import { getServerClient } from '@/lib/api_client/server_client';
import { connection } from 'next/server';
import { cookies } from 'next/headers';
export const getCurrentUser = async () => {
    await connection();
    console.log('SERVER_API_URL', process.env.SERVER_API_URL);
    const token = (await cookies()).get('accessToken')?.value;
    console.log('[getCurrentUser] accessToken present:', !!token, 'len:', token?.length ?? 0);
    const response = await usersControllerGetMe({
        client: await getServerClient(),
    });
    const user = response.data;
    console.log('[getCurrentUser] response', user?.id ?? null);
    return user;
};
