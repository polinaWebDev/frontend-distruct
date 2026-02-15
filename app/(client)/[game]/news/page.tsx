import { NewsPage } from '@/domain/client/news/news-page';
import { GAME_TYPE_VALUES, GameType } from '@/lib/enums/game_type.enum';
import type { Metadata } from 'next';
import { buildSocialMetadata } from '@/lib/seo';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ game: GameType }>;
}): Promise<Metadata> {
    const { game } = await params;
    const gameLabel = GAME_TYPE_VALUES.find((g) => g.value === game)?.label ?? game;
    const title = `Новости — ${gameLabel} | Distruct`;
    const description = `Свежие новости и обновления по ${gameLabel}.`;
    return {
        title,
        description,
        ...buildSocialMetadata(`/${game}/news`, title, description),
    };
}

export default async function Page({ params }: { params: Promise<{ game: GameType }> }) {
    const { game } = await params;

    return <NewsPage gameType={game} />;
}
