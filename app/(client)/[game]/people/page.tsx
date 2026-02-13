import { GameType } from '@/lib/enums/game_type.enum';
import { PeoplePage } from '@/domain/client/people/people-page';

export default async function Page({ params }: { params: Promise<{ game: GameType }> }) {
    const { game } = await params;

    return <PeoplePage game={game} />;
}
