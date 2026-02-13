'use server';

import { createClient } from './gen/client';
import { cookies } from 'next/headers';

export const getServerClient = async () => {
    const client = createClient({
        baseURL: process.env.SERVER_API_URL,
        withCredentials: true,
    });

    client.instance.interceptors.request.use(async (config) => {
        config.headers['Cookie'] = (await cookies()).toString();
        return config;
    });

    client.instance.interceptors.response.use(async (response) => {
        if (response && response.headers && response.headers.getSetCookie) {
            //@ts-ignore
            const cookie_list = response.headers['set-cookie'];
            if (cookie_list) {
                for (const cookie_string of cookie_list) {
                    const cookie_name = cookie_string.split('=')[0];
                    const cookie_value = cookie_string.split('=')[1];
                    (await cookies()).set(cookie_name, cookie_value);
                }
            }
        }
        return response;
    });

    return client;
};
