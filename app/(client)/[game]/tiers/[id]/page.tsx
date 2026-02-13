import { GameType } from '@/lib/enums/game_type.enum';
import { TiersPublicPage } from '@/domain/client/tiers/tiers-public-page';

export default async function Page({
    params,
}: {
    params: Promise<{ game: GameType; id: string }>;
}) {
    const { id, game } = await params;

    return <TiersPublicPage tierListId={id} game={game} />;
}
