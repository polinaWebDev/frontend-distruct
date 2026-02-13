import { GAME_TYPE_VALUES, GameType } from '@/lib/enums/game_type.enum';
import { Metadata } from 'next';

type Props = {
    params: Promise<{ game: GameType }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { game } = await params;

    const gameName = GAME_TYPE_VALUES.find((g) => g.value === game)?.label;

    return {
        title: `Distruct - ${gameName}`,
    };
}

export default async function TestPage({ params }: { params: Promise<{ game: GameType }> }) {
    const { game } = await params;

    return <div className="header_margin_top">Test page: {game}</div>;
}
