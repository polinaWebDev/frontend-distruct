'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardControllerGetAllStatsOptions } from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { getPublicClient } from '@/lib/api_client/public_client';
import { NewUsersChart } from './components/NewUsersChart';
import { ChallengesChart } from './components/ChallengesChart';
import { SalesChart } from './components/SalesChart';
import { Skeleton } from '@/components/ui/skeleton';

const DEFAULT_START_DATE = new Date(new Date().setDate(new Date().getDate() - 30));
const DEFAULT_END_DATE = new Date();

export const Dashboard = () => {
    const { data, isLoading, error } = useQuery({
        ...dashboardControllerGetAllStatsOptions({
            client: getPublicClient(),
            query: {
                start_date: DEFAULT_START_DATE,
                end_date: DEFAULT_END_DATE,
            },
        }),
    });

    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-[200px] w-full rounded-xl" />
                <Skeleton className="h-[200px] w-full rounded-xl" />
                <Skeleton className="h-[200px] w-full rounded-xl" />
                <Skeleton className="h-[200px] w-full rounded-xl" />
            </div>
        );
    }

    if (error || !data) {
        return <div>Error loading dashboard stats</div>;
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            <NewUsersChart data={data.new_users} />
            <ChallengesChart data={data.challenges} />
            <SalesChart data={data.sales} />
        </div>
    );
};
