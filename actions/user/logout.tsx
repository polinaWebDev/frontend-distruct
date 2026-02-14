'use server';

import { cookies } from 'next/headers';
import { authControllerLogout } from '@/lib/api_client/gen';
import { getServerClient } from '@/lib/api_client/server_client';

export const logout = async () => {
    const cookieStore = await cookies();
    const apiBase = process.env.SERVER_API_URL ?? process.env.NEXT_PUBLIC_API_URL;

    if (apiBase) {
        await authControllerLogout({
            client: await getServerClient(),
        });
    }

    const domain = process.env.COOKIE_DOMAIN;
    const secureCookies = process.env.NODE_ENV === 'production';
    const baseOptions = {
        path: '/',
        sameSite: 'lax' as const,
        secure: secureCookies,
    };
    const expires = new Date(0);

    if (domain) {
        cookieStore.set({
            name: 'accessToken',
            value: '',
            expires,
            domain,
            ...baseOptions,
        });
        cookieStore.set({
            name: 'refreshToken',
            value: '',
            expires,
            domain,
            ...baseOptions,
        });
    }

    // Also clear host-only cookies as a fallback.
    cookieStore.set({
        name: 'accessToken',
        value: '',
        expires,
        ...baseOptions,
    });
    cookieStore.set({
        name: 'refreshToken',
        value: '',
        expires,
        ...baseOptions,
    });

    return true;
};
