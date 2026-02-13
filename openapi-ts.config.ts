import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
    input: `${process.env.OPENAPI_API_URL}`, // sign up at app.heyapi.dev
    output: 'lib/api_client/gen',
    plugins: [
        {
            dates: true,
            name: '@hey-api/transformers',
            enums: true,
        },
        {
            enums: 'typescript',
            name: '@hey-api/typescript',
        },
        {
            name: 'zod',
        },
        {
            name: '@hey-api/sdk',
            validator: {
                request: false,
                response: false,
            },
        },
        '@hey-api/client-axios',
        '@tanstack/react-query',
    ],
});
