'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import Image from 'next/image';
import {
    challengesAdminControllerGetChallengesProgressListOptions,
    challengesShopAdminControllerGetListOptions,
    profileCosmeticsAdminControllerCreateMutation,
    profileCosmeticsAdminControllerGetListOptions,
    profileCosmeticsAdminControllerGetListQueryKey,
    profileCosmeticsAdminControllerGrantMutation,
    profileCosmeticsAdminControllerUpdateMutation,
    usersControllerFindAllOptions,
} from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { getPublicClient } from '@/lib/api_client/public_client';
import {
    COSMETIC_TYPES,
    parseAdminCosmeticsResponse,
    type CosmeticType,
    type ProfileCosmetic,
} from '@/domain/profile-cosmetics/profile-cosmetics.utils';
import { getFileUrl } from '@/lib/utils';
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
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

const TYPE_LABELS: Record<CosmeticType, string> = {
    profile_background: 'Фон профиля',
    profile_frame: 'Рамка профиля',
    avatar_outline: 'Обводка аватара',
};

const SOURCE_TYPES = [
    'challenge_reward',
    'season_shop_item',
    'admin_manual',
    'promo_code',
    'shop_gift',
] as const;

type SourceType = (typeof SOURCE_TYPES)[number];
type SourceOption = { id: string; label: string };

const normalizeOptional = (value: string) => {
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
};

export function ProfileCosmeticsAdminPage() {
    const client = getPublicClient();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | CosmeticType>('all');
    const [activeFilter, setActiveFilter] = useState<'all' | 'true' | 'false'>('all');

    const [createName, setCreateName] = useState('');
    const [createDescription, setCreateDescription] = useState('');
    const [createType, setCreateType] = useState<CosmeticType>('profile_background');
    const [createAssetUrl, setCreateAssetUrl] = useState('');
    const [createIsActive, setCreateIsActive] = useState(true);
    const [createFile, setCreateFile] = useState<File | null>(null);

    const [grantUserSearch, setGrantUserSearch] = useState('');
    const [grantUserId, setGrantUserId] = useState<string>('');
    const [grantCosmeticSearch, setGrantCosmeticSearch] = useState('');
    const [grantCosmeticId, setGrantCosmeticId] = useState<string>('');
    const [grantSourceType, setGrantSourceType] = useState<SourceType>('admin_manual');
    const [grantSourceId, setGrantSourceId] = useState<string>('');

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editType, setEditType] = useState<CosmeticType>('profile_background');
    const [editAssetUrl, setEditAssetUrl] = useState('');
    const [editIsActive, setEditIsActive] = useState(true);
    const [editFile, setEditFile] = useState<File | null>(null);
    const [grantSourceSearch, setGrantSourceSearch] = useState('');

    const listQuery = useQuery({
        ...profileCosmeticsAdminControllerGetListOptions({
            client,
            query: {
                search: normalizeOptional(search),
                type: typeFilter === 'all' ? undefined : typeFilter,
                is_active:
                    activeFilter === 'all' ? undefined : activeFilter === 'true' ? true : false,
            },
        }),
    });

    const cosmetics = useMemo(() => parseAdminCosmeticsResponse(listQuery.data), [listQuery.data]);

    const usersQuery = useQuery({
        ...usersControllerFindAllOptions({
            client,
            query: {
                page: 1,
                limit: 100,
                username: normalizeOptional(grantUserSearch),
            },
        }),
    });

    const shopItemsQuery = useQuery({
        ...challengesShopAdminControllerGetListOptions({
            client,
            query: {
                season_id: null,
                search: normalizeOptional(grantSourceSearch),
            },
        }),
    });

    const rewardsQuery = useQuery({
        ...challengesAdminControllerGetChallengesProgressListOptions({
            client,
            query: {
                status: 'completed',
                page: 1,
                limit: 100,
                search: normalizeOptional(grantSourceSearch),
                game_type: undefined,
                difficulty: undefined,
            },
        }),
    });

    const userOptions = useMemo(() => {
        const users = (usersQuery.data?.users ?? []) as Array<{
            id: string;
            username: string;
            email: string;
        }>;
        return users.map((user) => ({
            id: user.id,
            label: `${user.username} (${user.email})`,
        }));
    }, [usersQuery.data]);

    const cosmeticOptions = useMemo(
        () =>
            cosmetics.map((item) => ({
                id: item.id,
                label: `${item.name} (${TYPE_LABELS[item.type]})`,
            })),
        [cosmetics]
    );

    const filteredCosmeticOptions = useMemo(() => {
        const q = grantCosmeticSearch.trim().toLowerCase();
        if (!q) return cosmeticOptions;
        return cosmeticOptions.filter((item) => item.label.toLowerCase().includes(q));
    }, [cosmeticOptions, grantCosmeticSearch]);

    const sourceOptionsByType = useMemo(() => {
        const shopItems = (shopItemsQuery.data ?? []) as Array<{ id: string; name: string }>;
        const rewards = (rewardsQuery.data ?? []) as Array<{
            challenge_id: string;
            challenge?: { id?: string; title?: string };
        }>;

        const rewardMap = new Map<string, SourceOption>();
        rewards.forEach((reward) => {
            const challengeId = reward.challenge?.id ?? reward.challenge_id;
            if (!challengeId || rewardMap.has(challengeId)) return;
            rewardMap.set(challengeId, {
                id: challengeId,
                label: reward.challenge?.title
                    ? `${reward.challenge.title}`
                    : `Challenge ${challengeId.slice(0, 8)}`,
            });
        });

        return {
            challenge_reward: Array.from(rewardMap.values()),
            season_shop_item: shopItems.map((item) => ({
                id: item.id,
                label: item.name,
            })),
            admin_manual: [] as SourceOption[],
            promo_code: [] as SourceOption[],
            shop_gift: [] as SourceOption[],
        } as Record<SourceType, SourceOption[]>;
    }, [rewardsQuery.data, shopItemsQuery.data]);

    const invalidateList = async () => {
        await queryClient.invalidateQueries({
            queryKey: profileCosmeticsAdminControllerGetListQueryKey({
                client,
                query: {
                    search: normalizeOptional(search),
                    type: typeFilter === 'all' ? undefined : typeFilter,
                    is_active:
                        activeFilter === 'all' ? undefined : activeFilter === 'true' ? true : false,
                },
            }),
        });
    };

    const createMutation = useMutation({
        ...profileCosmeticsAdminControllerCreateMutation({ client }),
        onSuccess: async () => {
            toast.success('Косметика создана');
            setCreateName('');
            setCreateDescription('');
            setCreateAssetUrl('');
            setCreateFile(null);
            await invalidateList();
        },
        onError: () => {
            toast.error('Не удалось создать косметику');
        },
    });

    const updateMutation = useMutation({
        ...profileCosmeticsAdminControllerUpdateMutation({ client }),
        onSuccess: async () => {
            toast.success('Косметика обновлена');
            await invalidateList();
        },
        onError: () => {
            toast.error('Не удалось обновить косметику');
        },
    });

    const grantMutation = useMutation({
        ...profileCosmeticsAdminControllerGrantMutation({ client }),
        onSuccess: () => {
            toast.success('Косметика выдана пользователю');
            setGrantUserId('');
            setGrantSourceId('');
        },
        onError: () => {
            toast.error('Не удалось выдать косметику');
        },
    });

    const sourceTypeRequiresSourceId = (sourceType: SourceType) =>
        sourceType === 'challenge_reward' || sourceType === 'season_shop_item';

    const handleCreate = async () => {
        if (!createName.trim()) {
            toast.error('Укажите название');
            return;
        }
        if (!createAssetUrl.trim() && !createFile) {
            toast.error('Нужно передать file или asset_url');
            return;
        }

        await createMutation.mutateAsync({
            body: {
                name: createName.trim(),
                description: normalizeOptional(createDescription) ?? null,
                type: createType,
                asset_url: normalizeOptional(createAssetUrl) ?? null,
                is_active: createIsActive,
                ...(createFile ? { file: createFile } : {}),
            },
        });
    };

    const handleGrant = async () => {
        if (!grantUserId || !grantCosmeticId) {
            toast.error('Выберите пользователя и косметику');
            return;
        }
        if (sourceTypeRequiresSourceId(grantSourceType) && !grantSourceId) {
            toast.error('Выберите source_id из списка');
            return;
        }

        await grantMutation.mutateAsync({
            body: {
                user_id: String(grantUserId),
                cosmetic_id: String(grantCosmeticId),
                source_type: grantSourceType,
                source_id: sourceTypeRequiresSourceId(grantSourceType)
                    ? String(grantSourceId)
                    : null,
            },
        });
    };

    const startEdit = (item: ProfileCosmetic) => {
        setEditingId(item.id);
        setEditName(item.name);
        setEditDescription(item.description ?? '');
        setEditType(item.type);
        setEditAssetUrl(item.asset_url ?? '');
        setEditIsActive(item.is_active ?? true);
        setEditFile(null);
        setGrantCosmeticId(item.id);
    };

    const handleUpdate = async () => {
        if (!editingId) return;

        await updateMutation.mutateAsync({
            body: {
                id: editingId,
                name: normalizeOptional(editName),
                description: normalizeOptional(editDescription) ?? null,
                type: editType,
                asset_url: normalizeOptional(editAssetUrl) ?? null,
                is_active: editIsActive,
                ...(editFile ? { file: editFile } : {}),
            },
        });
    };

    return (
        <div className="container mx-auto py-8 space-y-8">
            <h1 className="text-3xl font-bold">Косметика профиля</h1>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                    <Label htmlFor="search">Поиск</Label>
                    <Input
                        id="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Название"
                    />
                </div>

                <div className="space-y-2">
                    <Label>Тип</Label>
                    <Select
                        value={typeFilter}
                        onValueChange={(value) => setTypeFilter(value as 'all' | CosmeticType)}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Все типы</SelectItem>
                            {COSMETIC_TYPES.map((type) => (
                                <SelectItem key={type} value={type}>
                                    {TYPE_LABELS[type]}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Активность</Label>
                    <Select
                        value={activeFilter}
                        onValueChange={(value) =>
                            setActiveFilter(value as 'all' | 'true' | 'false')
                        }
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Все</SelectItem>
                            <SelectItem value="true">Только активные</SelectItem>
                            <SelectItem value="false">Только неактивные</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="border rounded-lg">
                {listQuery.isLoading ? (
                    <div className="p-8 text-center text-muted-foreground">Загрузка...</div>
                ) : listQuery.isError ? (
                    <div className="p-8 text-center text-destructive">
                        Ошибка загрузки списка косметики
                    </div>
                ) : cosmetics.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        Косметика не найдена
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Превью</TableHead>
                                <TableHead>Название</TableHead>
                                <TableHead>Тип</TableHead>
                                <TableHead>Статус</TableHead>
                                <TableHead>Source</TableHead>
                                <TableHead>ID</TableHead>
                                <TableHead className="text-right">Действия</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {cosmetics.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        {item.asset_url ? (
                                            <Image
                                                src={getFileUrl(item.asset_url)}
                                                alt={item.name}
                                                width={48}
                                                height={48}
                                                className="h-12 w-12 rounded-md object-cover border"
                                            />
                                        ) : (
                                            <span className="text-xs text-muted-foreground">
                                                Нет
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell>{TYPE_LABELS[item.type]}</TableCell>
                                    <TableCell>
                                        {item.is_active === false ? 'Неактивна' : 'Активна'}
                                    </TableCell>
                                    <TableCell>{item.source_type ?? '-'}</TableCell>
                                    <TableCell className="font-mono text-xs">{item.id}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" onClick={() => startEdit(item)}>
                                            Редактировать
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            <Separator />

            <div className="grid gap-8 lg:grid-cols-2">
                <div className="space-y-4 border rounded-lg p-4">
                    <h2 className="text-xl font-semibold">Создать косметику</h2>
                    <div className="space-y-2">
                        <Label htmlFor="create-name">Название</Label>
                        <Input
                            id="create-name"
                            value={createName}
                            onChange={(e) => setCreateName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="create-description">Описание</Label>
                        <Input
                            id="create-description"
                            value={createDescription}
                            onChange={(e) => setCreateDescription(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Тип</Label>
                        <Select
                            value={createType}
                            onValueChange={(value) => setCreateType(value as CosmeticType)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {COSMETIC_TYPES.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {TYPE_LABELS[type]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="create-asset-url">asset_url</Label>
                        <Input
                            id="create-asset-url"
                            value={createAssetUrl}
                            onChange={(e) => setCreateAssetUrl(e.target.value)}
                            placeholder="https://... или /api/public/..."
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="create-file">file</Label>
                        <Input
                            id="create-file"
                            type="file"
                            onChange={(e) => setCreateFile(e.target.files?.[0] ?? null)}
                        />
                    </div>
                    <div className="flex items-center justify-between rounded-md border px-3 py-2">
                        <Label htmlFor="create-active">is_active</Label>
                        <Switch
                            id="create-active"
                            checked={createIsActive}
                            onCheckedChange={setCreateIsActive}
                        />
                    </div>
                    <Button onClick={() => void handleCreate()} disabled={createMutation.isPending}>
                        {createMutation.isPending ? 'Создание...' : 'Создать'}
                    </Button>
                </div>

                <div className="space-y-4 border rounded-lg p-4">
                    <h2 className="text-xl font-semibold">Обновить косметику</h2>
                    {!editingId ? (
                        <p className="text-sm text-muted-foreground">
                            Выберите элемент из таблицы и нажмите «Редактировать».
                        </p>
                    ) : (
                        <>
                            <p className="text-xs font-mono text-muted-foreground">{editingId}</p>
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Название</Label>
                                <Input
                                    id="edit-name"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-description">Описание</Label>
                                <Input
                                    id="edit-description"
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Тип</Label>
                                <Select
                                    value={editType}
                                    onValueChange={(value) => setEditType(value as CosmeticType)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {COSMETIC_TYPES.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {TYPE_LABELS[type]}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-asset-url">asset_url</Label>
                                <Input
                                    id="edit-asset-url"
                                    value={editAssetUrl}
                                    onChange={(e) => setEditAssetUrl(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-file">file</Label>
                                <Input
                                    id="edit-file"
                                    type="file"
                                    onChange={(e) => setEditFile(e.target.files?.[0] ?? null)}
                                />
                            </div>
                            <div className="flex items-center justify-between rounded-md border px-3 py-2">
                                <Label htmlFor="edit-active">is_active</Label>
                                <Switch
                                    id="edit-active"
                                    checked={editIsActive}
                                    onCheckedChange={setEditIsActive}
                                />
                            </div>
                            <Button
                                onClick={() => void handleUpdate()}
                                disabled={updateMutation.isPending}
                            >
                                {updateMutation.isPending ? 'Обновление...' : 'Обновить'}
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <Separator />

            <div className="space-y-4 border rounded-lg p-4">
                <h2 className="text-xl font-semibold">Выдать косметику пользователю</h2>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="grant-user-search">Поиск пользователя</Label>
                        <Input
                            id="grant-user-search"
                            value={grantUserSearch}
                            onChange={(e) => setGrantUserSearch(e.target.value)}
                            placeholder="Введите имя или email..."
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="grant-cosmetic-search">Поиск косметики</Label>
                        <Input
                            id="grant-cosmetic-search"
                            value={grantCosmeticSearch}
                            onChange={(e) => setGrantCosmeticSearch(e.target.value)}
                            placeholder="Введите название косметики..."
                        />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label>Результаты поиска пользователей</Label>
                        <div className="max-h-52 overflow-auto rounded-md border">
                            {usersQuery.isLoading ? (
                                <div className="px-3 py-2 text-sm text-muted-foreground">
                                    Поиск...
                                </div>
                            ) : userOptions.length === 0 ? (
                                <div className="px-3 py-2 text-sm text-muted-foreground">
                                    Пользователи не найдены
                                </div>
                            ) : (
                                userOptions.map((user) => (
                                    <button
                                        type="button"
                                        key={user.id}
                                        className={`block w-full text-left px-3 py-2 text-sm border-b last:border-b-0 hover:bg-muted/50 ${
                                            grantUserId === user.id ? 'bg-muted' : ''
                                        }`}
                                        onClick={() => setGrantUserId(user.id)}
                                    >
                                        {user.label}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Косметика</Label>
                        <Select value={grantCosmeticId} onValueChange={setGrantCosmeticId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Выберите косметику" />
                            </SelectTrigger>
                            <SelectContent>
                                {filteredCosmeticOptions.map((item) => (
                                    <SelectItem key={item.id} value={item.id}>
                                        {item.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>source_type</Label>
                        <Select
                            value={grantSourceType}
                            onValueChange={(value) => {
                                setGrantSourceType(value as SourceType);
                                setGrantSourceId('');
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {SOURCE_TYPES.map((sourceType) => (
                                    <SelectItem key={sourceType} value={sourceType}>
                                        {sourceType}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {sourceTypeRequiresSourceId(grantSourceType) && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="grant-source-search">Поиск source</Label>
                                <Input
                                    id="grant-source-search"
                                    value={grantSourceSearch}
                                    onChange={(e) => setGrantSourceSearch(e.target.value)}
                                    placeholder="Начните вводить название..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>source</Label>
                                <Select value={grantSourceId} onValueChange={setGrantSourceId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Выберите source" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sourceOptionsByType[grantSourceType].map((item) => (
                                            <SelectItem key={item.id} value={item.id}>
                                                {item.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
                    )}
                </div>
                <Button onClick={() => void handleGrant()} disabled={grantMutation.isPending}>
                    {grantMutation.isPending ? 'Выдача...' : 'Выдать'}
                </Button>
            </div>
        </div>
    );
}
