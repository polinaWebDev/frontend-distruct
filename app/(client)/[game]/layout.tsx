import { GAME_TYPE_VALUES, GameType } from '@/lib/enums/game_type.enum';
import { notFound } from 'next/navigation';

export default async function Layout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ game: GameType }>;
}) {
    const { game } = await params;

    if (!GAME_TYPE_VALUES.some((g) => g.value === game)) {
        return notFound();
    }

    return <>{children}</>;
}
