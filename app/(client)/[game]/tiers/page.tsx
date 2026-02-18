import { GAME_TYPE_VALUES, GameType } from '@/lib/enums/game_type.enum';
import type { Metadata } from 'next';
import { buildSocialMetadata } from '@/lib/seo';
import { TiersPage } from '@/domain/client/tiers/tiers-page';
import { getCurrentUser } from '@/actions/user/getCurrentUser';
import { redirect } from 'next/navigation';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ game: GameType }>;
}): Promise<Metadata> {
    const { game } = await params;
    const gameLabel = GAME_TYPE_VALUES.find((g) => g.value === game)?.label ?? game;
    const title = `Тир-листы — ${gameLabel} | Distruct`;
    const description = `Тир-листы предметов и оружия по ${gameLabel}.`;
    return {
        title,
        description,
        ...buildSocialMetadata(`/${game}/tiers`, title, description),
    };
}

export default async function Page({ params }: { params: Promise<{ game: GameType }> }) {
    const { game } = await params;
    const currentUser = await getCurrentUser();

    if (!currentUser) {
        redirect('/');
    }

    return <TiersPage game={game} currentUser={currentUser} />;
}
