import { NewsPage } from '@/domain/client/news/news-page';
import { GameType } from '@/lib/enums/game_type.enum';

export default async function Page({ params }: { params: Promise<{ game: GameType }> }) {
    const { game } = await params;

    return <NewsPage gameType={game} />;
}
