'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    LayoutDashboard,
    LogOut,
    Map,
    Users,
    ChevronDown,
    Folder,
    Boxes,
    Activity,
    Store,
} from 'lucide-react';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarRail,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { offerControllerGetListOptions } from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { getPublicClient } from '@/lib/api_client/public_client';

// Navigation items
const navItems = {
    root: [
        {
            title: 'Панель управления',
            href: '/admin',
            icon: LayoutDashboard,
        },
        {
            title: 'Карты',
            href: '/admin/maps',
            icon: Map,
        },
        {
            title: 'Пользователи',
            href: '/admin/users',
            icon: Users,
        },
    ],
    navMain: [
        {
            title: 'Контент',
            icon: Folder,
            items: [
                {
                    title: 'Новости',
                    href: '/admin/news',
                },
                {
                    title: 'Баннеры',
                    href: '/admin/banners',
                },
                {
                    title: 'Статистика баннеров',
                    href: '/admin/banners/stats',
                },
                {
                    title: 'Размещение баннеров',
                    href: '/admin/banner-placements',
                },
                {
                    title: 'Предложения',
                    href: '/admin/offers',
                },
            ],
        },
        {
            title: 'Активность',
            icon: Activity,
            items: [
                {
                    title: 'Челленджи',
                    href: '/admin/challenges',
                },
                {
                    title: 'Рандомные челленджи',
                    href: '/admin/loadout-challenges',
                },
                {
                    title: 'Группы рандомных челленджей',
                    href: '/admin/challenge-groups',
                },
                {
                    title: 'Модерация прогресса',
                    href: '/admin/progress',
                },
            ],
        },
        {
            title: 'Предметы',
            icon: Boxes,
            items: [
                {
                    title: 'Предметы',
                    href: '/admin/items',
                },
                {
                    title: 'Категории',
                    href: '/admin/categories',
                },
                {
                    title: 'Категории тир-листов',
                    href: '/admin/tier-list-categories',
                },
                {
                    title: 'Типы снаряжения',
                    href: '/admin/gear-types',
                },
                {
                    title: 'Редкости',
                    href: '/admin/rarities',
                },
            ],
        },
        {
            title: 'Сезоны и магазин',
            icon: Store,
            items: [
                {
                    title: 'Сезоны',
                    href: '/admin/seasons',
                },
                {
                    title: 'Магазин сезонов',
                    href: '/admin/season-shop',
                },
                {
                    title: 'Покупки',
                    href: '/admin/purchases',
                },
            ],
        },
    ],
};

export function AppSidebar() {
    const pathname = usePathname();
    const [lastSeenOffersAt, setLastSeenOffersAt] = useState<number | null>(null);
    const OFFERS_LAST_SEEN_KEY = 'admin_offers_last_seen_at';

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const stored = window.localStorage.getItem(OFFERS_LAST_SEEN_KEY);
        setLastSeenOffersAt(stored ? Number(stored) : null);
    }, []);

    const { data: latestOffers } = useQuery({
        ...offerControllerGetListOptions({
            client: getPublicClient(),
            query: { page: 1, limit: 1 },
        }),
        staleTime: 30_000,
        refetchInterval: 30_000,
    });

    const latestOfferTimestamp = latestOffers?.[0]?.createdAt
        ? new Date(latestOffers[0].createdAt).getTime()
        : null;

    const { data: newOffersList } = useQuery({
        ...offerControllerGetListOptions({
            client: getPublicClient(),
            query: { page: 1, limit: 100 },
        }),
        enabled: lastSeenOffersAt !== null,
        staleTime: 30_000,
        refetchInterval: 30_000,
    });

    const newOffersCount = useMemo(() => {
        if (!lastSeenOffersAt || !newOffersList) return 0;
        return newOffersList.filter((offer) => {
            const createdAt = offer.createdAt ? new Date(offer.createdAt).getTime() : 0;
            return createdAt > lastSeenOffersAt;
        }).length;
    }, [newOffersList, lastSeenOffersAt]);

    useEffect(() => {
        if (pathname !== '/admin/offers') return;
        if (latestOfferTimestamp === null) return;
        if (typeof window === 'undefined') return;
        window.localStorage.setItem(OFFERS_LAST_SEEN_KEY, String(latestOfferTimestamp));
        setLastSeenOffersAt(latestOfferTimestamp);
    }, [pathname, latestOfferTimestamp]);

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/admin">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                    <LayoutDashboard className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">Админ-панель</span>
                                    <span className="truncate text-xs">Distruct Help</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarMenu>
                        {navItems.root.map((item) => (
                            <SidebarMenuItem key={item.href}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={pathname === item.href}
                                    tooltip={item.title}
                                >
                                    <Link href={item.href}>
                                        <item.icon />
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}

                        {navItems.navMain.map((group) => (
                            <Collapsible
                                key={group.title}
                                defaultOpen={false}
                                className="group/collapsible"
                            >
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton className="font-medium">
                                            <group.icon className="size-4" />
                                            <span className="flex-1 text-left">{group.title}</span>
                                            <ChevronDown className="size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    {group.items?.length ? (
                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                {group.items.map((item) => {
                                                    const isOffersItem =
                                                        item.href === '/admin/offers';
                                                    return (
                                                        <SidebarMenuSubItem key={item.href}>
                                                            <SidebarMenuSubButton
                                                                asChild
                                                                isActive={pathname === item.href}
                                                            >
                                                                <Link href={item.href}>
                                                                    <span className="flex items-center gap-2">
                                                                        <span>{item.title}</span>
                                                                        {isOffersItem &&
                                                                            newOffersCount > 0 && (
                                                                                <span
                                                                                    className="inline-flex min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1.5 text-[10px] font-semibold leading-4 text-white"
                                                                                    aria-label={`Новые предложения: ${newOffersCount}`}
                                                                                >
                                                                                    {newOffersCount}
                                                                                </span>
                                                                            )}
                                                                    </span>
                                                                </Link>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                    );
                                                })}
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    ) : null}
                                </SidebarMenuItem>
                            </Collapsible>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Вернуться на сайт">
                            <Link href="/">
                                <LogOut />
                                <span>Вернуться на сайт</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
}
