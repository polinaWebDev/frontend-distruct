import { GameType, isEnabledClientGameType } from '@/lib/enums/game_type.enum';
import { redirect } from 'next/navigation';

export default async function Layout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ game: string }>;
}) {
    const { game } = await params;

    if (!isEnabledClientGameType(game)) {
        return redirect(`/${GameType.ArenaBreakout}`);
    }

    return <>{children}</>;
}
