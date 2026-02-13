'use client';

import { DashboardDailyStatDto } from '@/lib/api_client/gen/types.gen';
import { StatsChart } from './StatsChart';

interface NewUsersChartProps {
    data: DashboardDailyStatDto[];
}

export function NewUsersChart({ data }: NewUsersChartProps) {
    return (
        <StatsChart
            data={data}
            title="Новые пользователи"
            description="Ежедневное количество новых пользователей"
            label="Пользователи"
            color="hsl(var(--chart-1))"
        />
    );
}
