import styles from './AppLayout.module.css';
import { ReactNode } from 'react';
import { GameType } from '@/lib/enums/game_type.enum';
import { UserResponseDto } from '@/lib/api_client/gen';
import { Header } from '@/domain/Layout/Header/Header';
import { ClientWidgets } from './ClientWidgets';
export const AppLayout = ({
    children,
    game,
    user,
    isMobileServer,
}: {
    children: ReactNode;
    game?: GameType;
    user?: UserResponseDto;
    isMobileServer: boolean;
}) => {
    const twitchChannel = process.env.NEXT_PUBLIC_TWITCH_CHANNEL ?? 'DISTRUCT_STREAM';

    return (
        <div className={styles.page_wrapper}>
            <Header user={user} isMobileServer={isMobileServer} />

            {children}
            <ClientWidgets channel={twitchChannel} />
        </div>
    );
};
