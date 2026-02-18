'use client';

import {
    QueryClient,
    QueryClientProvider as TanstackQueryClientProvider,
} from '@tanstack/react-query';
import { useState } from 'react';

export const QueryClientProvider = ({ children }: { children: React.ReactNode }) => {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 1000 * 60 * 5,
                        gcTime: 1000 * 60 * 30,
                        refetchOnWindowFocus: false,
                        refetchOnMount: false,
                    },
                },
            })
    );

    return (
        <TanstackQueryClientProvider client={queryClient}>{children}</TanstackQueryClientProvider>
    );
};
