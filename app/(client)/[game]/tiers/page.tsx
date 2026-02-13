import { GameType } from '@/lib/enums/game_type.enum';
import { TiersPage } from '@/domain/client/tiers/tiers-page';

export default async function Page({ params }: { params: Promise<{ game: GameType }> }) {
    const { game } = await params;

    return <TiersPage game={game} />;
}
