'use client';

import { TwitchWidget } from '@/components/twitch-widget/TwitchWidget';

export const ClientWidgets = ({ channel }: { channel: string }) => {
    return <TwitchWidget channel={channel} />;
};
