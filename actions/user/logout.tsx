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
    const domain = process.env.COOKIE_DOMAIN;
    const secureCookies = process.env.NODE_ENV === 'production';
    const baseOptions = {
        path: '/',
        sameSite: 'none' as const,
        secure: secureCookies,
    };

    if (domain) {
        cookieStore.set({
            name: 'accessToken',
            value: '',
            expires: new Date(0),
            domain,
            ...baseOptions,
        });
        cookieStore.set({
            name: 'refreshToken',
            value: '',
            expires: new Date(0),
            domain,
            ...baseOptions,
        });
    }

    // Also clear host-only cookies as a fallback.
    cookieStore.set({
        name: 'accessToken',
        value: '',
        expires: new Date(0),
        ...baseOptions,
    });
    cookieStore.set({
        name: 'refreshToken',
        value: '',
        expires: new Date(0),
        ...baseOptions,
    });

    return true;
};
