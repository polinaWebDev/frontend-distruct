'use client';

export const logout = async () => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL;
    if (!apiBase) {
        throw new Error('NEXT_PUBLIC_API_URL is not set');
    }

    await fetch(`${apiBase}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
    });
};
