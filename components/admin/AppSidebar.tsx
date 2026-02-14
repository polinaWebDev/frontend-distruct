'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Package,
    Layers,
    Tag,
    Gem,
    Dices,
    LogOut,
    Map,
    Calendar,
    ListChecks,
    ShoppingCart,
    Users,
    Newspaper,
    ListOrdered,
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
                                defaultOpen={group.items?.some(
                                    (item) => pathname === item.href
                                )}
                            >
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton className="font-medium">
                                            <group.icon className="size-4" />
                                            <span className="flex-1 text-left">
                                                {group.title}
                                            </span>
                                            <ChevronDown className="size-4 transition-transform data-[state=open]:rotate-180" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    {group.items?.length ? (
                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                {group.items.map((item) => (
                                                    <SidebarMenuSubItem key={item.href}>
                                                        <SidebarMenuSubButton
                                                            asChild
                                                            isActive={pathname === item.href}
                                                        >
                                                            <Link href={item.href}>
                                                                {item.title}
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                ))}
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
