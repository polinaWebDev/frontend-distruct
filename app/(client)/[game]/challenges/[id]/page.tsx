import { ChallengePage } from '@/domain/client/challenge-page/challenge-page';
import { challengesClientControllerGetChallengeByIdWithProgress } from '@/lib/api_client/gen';
import { getServerClient } from '@/lib/api_client/server_client';
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const res = await challengesClientControllerGetChallengeByIdWithProgress({
        client: await getServerClient(),
        path: {
            id: id,
        },
    });

    if (!res.data) {
        return notFound();
    }

    return <ChallengePage challenge={res.data} />;
}
