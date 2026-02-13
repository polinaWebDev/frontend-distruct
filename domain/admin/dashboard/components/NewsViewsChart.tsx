'use client';

import { DashboardDailyStatDto } from '@/lib/api_client/gen/types.gen';
import { StatsChart } from './StatsChart';

interface NewsViewsChartProps {
    data: DashboardDailyStatDto[];
}

export function NewsViewsChart({ data }: NewsViewsChartProps) {
    return (
        <StatsChart
            data={data}
            title="News Views"
            description="Daily news article views"
            label="Views"
            color="hsl(var(--chart-4))"
        />
    );
}
