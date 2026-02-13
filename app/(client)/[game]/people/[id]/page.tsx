import { GameType } from '@/lib/enums/game_type.enum';
import { PublicProfilePage } from '@/domain/client/people/public-profile-page';

export default async function Page({
    params,
}: {
    params: Promise<{ game: GameType; id: string }>;
}) {
    const { game, id } = await params;

    return <PublicProfilePage userId={id} game={game} />;
}
