'use client';

import { DashboardDailyStatDto } from '@/lib/api_client/gen/types.gen';
import { StatsChart } from './StatsChart';

interface ChallengesChartProps {
    data: DashboardDailyStatDto[];
}

export function ChallengesChart({ data }: ChallengesChartProps) {
    return (
        <StatsChart
            data={data}
            title="Челленджи"
            description="Ежедневное количество завершенных челленджей"
            label="Челленджи"
            color="hsl(var(--chart-2))"
        />
    );
}
