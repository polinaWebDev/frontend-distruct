import { loadoutRandomizerControllerGenerateRandomLoadout } from '@/lib/api_client/gen';
import { getPublicClient } from '@/lib/api_client/public_client';

export const getRandomLoadoutQueryKey = (challengeId: string, seed: string) =>
    ['random-loadout', challengeId, seed] as const;

export const getRandomLoadout = async (challengeId: string, seed: string) => {
    const res = await loadoutRandomizerControllerGenerateRandomLoadout({
        body: {
            id: challengeId,
            seed,
        },
        client: getPublicClient(),
    });

    return res.data ?? null;
};
