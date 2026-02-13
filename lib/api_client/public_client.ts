import { createClient } from './gen/client';

export const getPublicClient = () => {
    return createClient({
        baseURL: process.env.NEXT_PUBLIC_API_URL,
        withCredentials: true,
    });
};
