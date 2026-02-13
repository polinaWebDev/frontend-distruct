'use client';

import { useMemo, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { PencilIcon } from 'lucide-react';

import { usersControllerFindAllInfiniteOptions } from '@/lib/api_client/gen/@tanstack/react-query.gen';
import type { UsersControllerFindAllData } from '@/lib/api_client/gen/types.gen';
import { getPublicClient } from '@/lib/api_client/public_client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import type { UserAdminRow } from './types';
import { EditUserDialog } from './dialogs/edit-user.dialog';
import { getFileUrl } from '@/lib/utils';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';

const PAGE_LIMIT = 15;

export const UsersPage = () => {
    const [searchName, setSearchName] = useState('');
    const [roleFilter, setRoleFilter] = useState<'admin' | 'user' | 'all'>('all');
    const [editingUser, setEditingUser] = useState<UserAdminRow | null>(null);

    const queryPayload = useMemo(
        () =>
            ({
                page: 1,
                limit: PAGE_LIMIT,
                username: searchName || undefined,
                role: roleFilter === 'all' ? undefined : roleFilter,
            }) as unknown as UsersControllerFindAllData['query'],
        [searchName, roleFilter]
    );

    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
        useInfiniteQuery({
            ...usersControllerFindAllInfiniteOptions({
                client: getPublicClient(),
                query: queryPayload,
            }),
            initialPageParam: 1,
            getNextPageParam: (lastPage, allPages) => {
                const pageData = lastPage?.users ?? [];
                if (!pageData.length || pageData.length < PAGE_LIMIT) {
                    return undefined;
                }
                return allPages.length + 1;
            },
        });

    const users = useMemo(() => {
        return (data?.pages.flatMap((page) => page?.users ?? []) ?? []) as UserAdminRow[];
    }, [data]);

    return (
        <div className="container mx-auto py-8 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Пользователи</h1>
            </div>

            <div className="flex gap-4 flex-wrap items-end">
                <div className="flex-1 min-w-[220px] space-y-2">
                    <Label htmlFor="search">Поиск по имени</Label>
                    <Input
                        id="search"
                        placeholder="Введите имя..."
                        value={searchName}
                        onChange={(event) => setSearchName(event.target.value)}
                    />
                </div>

                <div className="w-56 space-y-2">
                    <Label htmlFor="role-filter">Роль</Label>
                    <Select
                        value={roleFilter}
                        onValueChange={(value) => setRoleFilter(value as 'admin' | 'user' | 'all')}
                    >
                        <SelectTrigger id="role-filter" className="w-full">
                            <SelectValue placeholder="Фильтровать по роли" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Все</SelectItem>
                            <SelectItem value="admin">Админ</SelectItem>
                            <SelectItem value="user">Пользователь</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="border rounded-lg">
                {isLoading && !data ? (
                    <div className="p-8 text-center text-muted-foreground">Загрузка...</div>
                ) : users.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        Пользователи не найдены
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Аватар</TableHead>
                                <TableHead>Имя пользователя</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Роль</TableHead>

                                <TableHead className="text-right">Действия</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        {user.avatar_url ? (
                                            <PhotoProvider>
                                                <PhotoView src={getFileUrl(user.avatar_url)}>
                                                    <img
                                                        src={getFileUrl(user.avatar_url)}
                                                        alt={user.username}
                                                        className="w-10 h-10 rounded-full object-cover bg-muted"
                                                        crossOrigin="anonymous"
                                                    />
                                                </PhotoView>
                                            </PhotoProvider>
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                                                {user.username.slice(0, 2).toUpperCase()}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">{user.username}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                user.role === 'admin'
                                                    ? 'bg-purple-100 text-purple-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}
                                        >
                                            {user.role}
                                        </span>
                                    </TableCell>

                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setEditingUser(user)}
                                            title="Edit"
                                        >
                                            <PencilIcon className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            {hasNextPage && (
                <div className="flex justify-center">
                    <Button
                        variant="outline"
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                    >
                        {isFetchingNextPage ? 'Loading...' : 'Load More'}
                    </Button>
                </div>
            )}

            {!hasNextPage && users.length > 0 && (
                <div className="text-center text-sm text-muted-foreground">All users loaded</div>
            )}

            {editingUser && (
                <EditUserDialog
                    open={!!editingUser}
                    onOpenChange={(open) => !open && setEditingUser(null)}
                    user={editingUser}
                    refetch={refetch}
                />
            )}
        </div>
    );
};
