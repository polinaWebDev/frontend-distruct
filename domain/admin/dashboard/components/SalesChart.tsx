'use client';

import { DashboardDailyStatDto } from '@/lib/api_client/gen/types.gen';
import { StatsChart } from './StatsChart';

interface SalesChartProps {
    data: DashboardDailyStatDto[];
}

export function SalesChart({ data }: SalesChartProps) {
    return (
        <StatsChart
            data={data}
            title="Траты на сезоны"
            description="Ежедневное количество трат"
            label="Траты"
            color="hsl(var(--chart-3))"
        />
    );
}
