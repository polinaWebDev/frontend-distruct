'use server';

import { authControllerVerify } from '@/lib/api_client/gen';
import { getServerClient } from '@/lib/api_client/server_client';

export const verifyOtp = async ({ email, code }: { email: string; code: string }) => {
    const client = await getServerClient();

    const response = await authControllerVerify({
        client,
        body: {
            email,
            code,
        },
    });

    return response.data;
};
