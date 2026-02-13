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
} from 'lucide-react';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from '@/components/ui/sidebar';

// Navigation items
const navItems = [
    {
        title: 'Панель управления',
        href: '/admin',
        icon: LayoutDashboard,
    },
    {
        title: 'Предметы',
        href: '/admin/items',
        icon: Package,
    },
    {
        title: 'Категории',
        href: '/admin/categories',
        icon: Layers,
    },
    {
        title: 'Категории тир-листов',
        href: '/admin/tier-list-categories',
        icon: ListOrdered,
    },
    {
        title: 'Типы снаряжения',
        href: '/admin/gear-types',
        icon: Tag,
    },
    {
        title: 'Редкости',
        href: '/admin/rarities',
        icon: Gem,
    },
    {
        title: 'Рандомные челленджи',
        href: '/admin/loadout-challenges',
        icon: Dices,
    },
    {
        title: 'Группы рандомных челленджей',
        href: '/admin/challenge-groups',
        icon: Package,
    },
    {
        title: 'Карты',
        href: '/admin/maps',
        icon: Map,
    },
    {
        title: 'Сезоны',
        href: '/admin/seasons',
        icon: Calendar,
    },
    {
        title: 'Челленджи',
        href: '/admin/challenges',
        icon: ListChecks,
    },

    {
        title: 'Магазин сезонов',
        href: '/admin/season-shop',
        icon: ShoppingCart,
    },
    {
        title: 'Пользователи',
        href: '/admin/users',
        icon: Users,
    },
    {
        title: 'Новости',
        href: '/admin/news',
        icon: Newspaper,
    },
    {
        title: 'Баннеры',
        href: '/admin/banners',
        icon: Newspaper,
    },
    {
        title: 'Размещение баннеров',
        href: '/admin/banner-placements',
        icon: ListOrdered,
    },
    {
        title: 'Модерация прогресса',
        href: '/admin/progress',
        icon: ListChecks,
    },
    {
        title: 'Покупки',
        href: '/admin/purchases',
        icon: ShoppingCart,
    },
    {
        title: 'Предложения',
        href: '/admin/offers',
        icon: Newspaper,
    },
];

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
                    <SidebarGroupLabel>Управление</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navItems.map((item) => (
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
                        </SidebarMenu>
                    </SidebarGroupContent>
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
