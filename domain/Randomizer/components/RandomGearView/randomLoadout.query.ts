import { loadoutRandomizerControllerGenerateRandomLoadout } from '@/lib/api_client/gen';
import { getPublicClient } from '@/lib/api_client/public_client';

export const getRandomLoadoutQueryKey = (challengeId: string, seed: string | null) =>
    ['random-loadout', challengeId, seed] as const;

export const getRandomLoadout = async (challengeId: string, seed: string | null) => {
    if (!seed) {
        return null;
    }

    const res = await loadoutRandomizerControllerGenerateRandomLoadout({
        body: {
            id: challengeId,
            seed,
        },
        client: getPublicClient(),
    });

    return res.data ?? null;
};
