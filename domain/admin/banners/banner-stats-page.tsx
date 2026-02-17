'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3Icon, MousePointerClickIcon, EyeIcon } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
    bannersAdminControllerGetBannerStatsOptions,
    bannersAdminControllerListBannersOptions,
} from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { getPublicClient } from '@/lib/api_client/public_client';
import type {
    BannerAdminResponseDto,
    BannersAdminControllerGetBannerStatsData,
} from '@/lib/api_client/gen/types.gen';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';

type PageFilter = Exclude<
    NonNullable<BannersAdminControllerGetBannerStatsData['query']>['page'],
    undefined
>;

type BannerStatsFilters = {
    startDate: string;
    endDate: string;
    bannerId: string;
    page: PageFilter | 'all';
};

const PAGE_OPTIONS: Array<{ label: string; value: PageFilter }> = [
    { label: 'Главная', value: 'main' },
    { label: 'Новость', value: 'news_article' },
    { label: 'Награды', value: 'challenges_rewards' },
];

const chartConfig = {
    views: {
        label: 'Показы',
        color: '#3b82f6',
    },
    clicks: {
        label: 'Клики',
        color: '#f97316',
    },
} satisfies ChartConfig;

function toDateInputValue(date: Date) {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60_000);
    return localDate.toISOString().slice(0, 10);
}

function getDefaultFilters(): BannerStatsFilters {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 14);

    return {
        startDate: toDateInputValue(startDate),
        endDate: toDateInputValue(endDate),
        bannerId: 'all',
        page: 'all',
    };
}

function formatCtr(value: number) {
    const percent = value <= 1 ? value * 100 : value;
    return `${percent.toFixed(2)}%`;
}

export function BannerStatsPage() {
    const [draftFilters, setDraftFilters] = useState<BannerStatsFilters>(() => getDefaultFilters());
    const [appliedFilters, setAppliedFilters] = useState<BannerStatsFilters>(() =>
        getDefaultFilters()
    );

    const { data: bannersRaw } = useQuery({
        ...bannersAdminControllerListBannersOptions({
            client: getPublicClient(),
        }),
    });

    const banners = useMemo(() => (bannersRaw ?? []) as BannerAdminResponseDto[], [bannersRaw]);

    const statsQuery = useMemo<BannersAdminControllerGetBannerStatsData['query']>(
        () => ({
            start_date: appliedFilters.startDate || undefined,
            end_date: appliedFilters.endDate || undefined,
            banner_id: appliedFilters.bannerId === 'all' ? undefined : appliedFilters.bannerId,
            page: appliedFilters.page === 'all' ? undefined : appliedFilters.page,
        }),
        [appliedFilters]
    );

    const { data, isLoading, isFetching, error } = useQuery({
        ...bannersAdminControllerGetBannerStatsOptions({
            client: getPublicClient(),
            query: statsQuery,
        }),
    });

    const dailyStats = useMemo(() => {
        const list = data?.daily_stats ?? [];
        return [...list]
            .sort((a, b) => a.date.localeCompare(b.date))
            .map((item) => ({
                ...item,
                label: new Intl.DateTimeFormat('ru-RU', {
                    day: '2-digit',
                    month: '2-digit',
                }).format(new Date(item.date)),
            }));
    }, [data]);

    const bannerStats = useMemo(() => {
        return [...(data?.banners ?? [])].sort((a, b) => b.views - a.views);
    }, [data]);

    const totalViews = data?.totals.views ?? 0;
    const totalClicks = data?.totals.clicks ?? 0;
    const totalCtr = data?.totals.ctr ?? 0;

    const handleReset = () => {
        const defaults = getDefaultFilters();
        setDraftFilters(defaults);
        setAppliedFilters(defaults);
    };

    return (
        <div className="container mx-auto py-8 space-y-6">
            <div className="flex items-center justify-between gap-3">
                <h1 className="text-3xl font-bold">Статистика баннеров</h1>
                {isFetching && !isLoading ? (
                    <span className="text-sm text-muted-foreground">Обновление...</span>
                ) : null}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Фильтры</CardTitle>
                    <CardDescription>
                        Период, страница и конкретный баннер для анализа.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-2">
                            <Label htmlFor="start-date">Дата с</Label>
                            <Input
                                id="start-date"
                                type="date"
                                value={draftFilters.startDate}
                                onChange={(event) =>
                                    setDraftFilters((prev) => ({
                                        ...prev,
                                        startDate: event.target.value,
                                    }))
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="end-date">Дата по</Label>
                            <Input
                                id="end-date"
                                type="date"
                                value={draftFilters.endDate}
                                onChange={(event) =>
                                    setDraftFilters((prev) => ({
                                        ...prev,
                                        endDate: event.target.value,
                                    }))
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Страница</Label>
                            <Select
                                value={draftFilters.page}
                                onValueChange={(value) =>
                                    setDraftFilters((prev) => ({
                                        ...prev,
                                        page: value as BannerStatsFilters['page'],
                                    }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Все страницы" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Все страницы</SelectItem>
                                    {PAGE_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Баннер</Label>
                            <Select
                                value={draftFilters.bannerId}
                                onValueChange={(value) =>
                                    setDraftFilters((prev) => ({
                                        ...prev,
                                        bannerId: value,
                                    }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Все баннеры" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Все баннеры</SelectItem>
                                    {banners.map((banner) => (
                                        <SelectItem key={banner.id} value={banner.id}>
                                            {banner.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button onClick={() => setAppliedFilters(draftFilters)}>
                            Применить фильтры
                        </Button>
                        <Button variant="outline" onClick={handleReset}>
                            Сбросить
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {isLoading ? (
                <div className="grid gap-4 md:grid-cols-3">
                    <Skeleton className="h-32 rounded-xl" />
                    <Skeleton className="h-32 rounded-xl" />
                    <Skeleton className="h-32 rounded-xl" />
                </div>
            ) : error ? (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                    Не удалось загрузить статистику баннеров.
                </div>
            ) : (
                <>
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Всего показов</CardDescription>
                                <CardTitle className="text-3xl">
                                    {totalViews.toLocaleString()}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center text-muted-foreground text-sm">
                                    <EyeIcon className="mr-2 h-4 w-4" />
                                    Показы
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Всего кликов</CardDescription>
                                <CardTitle className="text-3xl">
                                    {totalClicks.toLocaleString()}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center text-muted-foreground text-sm">
                                    <MousePointerClickIcon className="mr-2 h-4 w-4" />
                                    Клики
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>CTR</CardDescription>
                                <CardTitle className="text-3xl">{formatCtr(totalCtr)}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center text-muted-foreground text-sm">
                                    <BarChart3Icon className="mr-2 h-4 w-4" />
                                    Конверсия
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Динамика по дням</CardTitle>
                            <CardDescription>Показы и клики по выбранному периоду.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {dailyStats.length === 0 ? (
                                <div className="text-sm text-muted-foreground">
                                    Нет данных за выбранный период.
                                </div>
                            ) : (
                                <ChartContainer
                                    config={chartConfig}
                                    className="min-h-[280px] w-full"
                                >
                                    <BarChart
                                        accessibilityLayer
                                        data={dailyStats}
                                        margin={{ left: 8, right: 8, top: 16, bottom: 8 }}
                                    >
                                        <CartesianGrid vertical={false} />
                                        <XAxis
                                            dataKey="label"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                        />
                                        <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                                        <ChartTooltip
                                            cursor={false}
                                            content={
                                                <ChartTooltipContent
                                                    labelFormatter={(_, payload) =>
                                                        payload?.[0]?.payload?.date
                                                            ? new Intl.DateTimeFormat('ru-RU', {
                                                                  year: 'numeric',
                                                                  month: '2-digit',
                                                                  day: '2-digit',
                                                              }).format(
                                                                  new Date(payload[0].payload.date)
                                                              )
                                                            : ''
                                                    }
                                                />
                                            }
                                        />
                                        <Bar
                                            dataKey="views"
                                            fill="var(--color-views)"
                                            radius={4}
                                            maxBarSize={28}
                                        />
                                        <Bar
                                            dataKey="clicks"
                                            fill="var(--color-clicks)"
                                            radius={4}
                                            maxBarSize={28}
                                        />
                                    </BarChart>
                                </ChartContainer>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>По баннерам</CardTitle>
                            <CardDescription>Сортировка по количеству показов.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {bannerStats.length === 0 ? (
                                <div className="p-6 text-sm text-muted-foreground">
                                    Нет данных по баннерам.
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Баннер</TableHead>
                                            <TableHead className="text-right">Показы</TableHead>
                                            <TableHead className="text-right">Клики</TableHead>
                                            <TableHead className="text-right">CTR</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {bannerStats.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">
                                                    {item.title}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {item.views.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {item.clicks.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {formatCtr(item.ctr)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
