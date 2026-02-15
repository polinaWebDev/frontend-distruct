'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import {
    SortableContext,
    useSortable,
    arrayMove,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { PlusIcon, Trash2Icon, GripVerticalIcon } from 'lucide-react';
import { toast } from 'sonner';
import {
    bannerPlacementsAdminControllerCreatePlacementMutation,
    bannerPlacementsAdminControllerDeletePlacementMutation,
    bannerPlacementsAdminControllerListPlacementsOptions,
    bannerPlacementsAdminControllerListPlacementsQueryKey,
    bannerPlacementsAdminControllerUpdatePlacementMutation,
    bannersAdminControllerListBannersOptions,
} from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { getPublicClient } from '@/lib/api_client/public_client';
import type {
    BannerAdminResponseDto,
    BannerPlacementAdminItemDto,
    BannerPlacementsSlotAdminDto,
    BannerSlotAdminResponseDto,
} from '@/lib/api_client/gen/types.gen';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { BannerProvider } from '@/components/banners/BannerProvider';
import { BannerSlot } from '@/components/banners/BannerSlot';
import { getFileUrl } from '@/lib/utils';
import { AppSkeleton } from '@/ui/AppSkeleton/AppSkeleton';
import newsStyles from '@/domain/client/news-id/news-id-page.module.css';
import challengesRewardsStyles from '@/domain/client/challenges-rewards/challenges-rewards.module.css';
import tiersStyles from '@/domain/client/tiers/tiers-page.module.css';
import clsx from 'clsx';

type BannerSlotPage = BannerSlotAdminResponseDto['page'];
type BannerMediaType = BannerAdminResponseDto['type'];

const PAGE_OPTIONS: Array<{ label: string; value: BannerSlotPage }> = [
    { label: 'News article', value: 'news_article' },
    { label: 'Rewards', value: 'challenges_rewards' },
];

type AddBannerDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    slotId: string;
    allowedTypes: BannerMediaType[];
    banners: BannerAdminResponseDto[];
    defaultPriority: number;
    onSubmit: (payload: {
        slotId: string;
        bannerId: string;
        priority: number;
        startAt?: string;
        endAt?: string;
    }) => void;
};

function AddBannerDialog({
    open,
    onOpenChange,
    slotId,
    allowedTypes,
    banners,
    defaultPriority,
    onSubmit,
}: AddBannerDialogProps) {
    const [bannerId, setBannerId] = useState<string>('');
    const [priority, setPriority] = useState<number>(defaultPriority);
    const [startAt, setStartAt] = useState<string>('');
    const [endAt, setEndAt] = useState<string>('');

    useEffect(() => {
        if (!open) return;
        setPriority(defaultPriority);
        setBannerId('');
        setStartAt('');
        setEndAt('');
    }, [open, defaultPriority]);

    const availableBanners = useMemo(() => {
        return banners.filter(
            (banner) => banner.isActive && allowedTypes.includes(banner.type as BannerMediaType)
        );
    }, [banners, allowedTypes]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Добавить баннер в слот</DialogTitle>
                    <DialogDescription>Выберите баннер и параметры показа.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Баннер</label>
                        <Select value={bannerId} onValueChange={setBannerId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Выберите баннер" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableBanners.map((banner) => (
                                    <SelectItem key={banner.id} value={banner.id}>
                                        {banner.title} ({banner.type})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Priority</label>
                        <Input
                            type="number"
                            min={0}
                            value={priority}
                            onChange={(e) => setPriority(parseInt(e.target.value, 10) || 0)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Start at</label>
                            <Input
                                type="datetime-local"
                                value={startAt}
                                onChange={(e) => setStartAt(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">End at</label>
                            <Input
                                type="datetime-local"
                                value={endAt}
                                onChange={(e) => setEndAt(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="secondary" type="button" onClick={() => onOpenChange(false)}>
                        Отмена
                    </Button>
                    <Button
                        type="button"
                        onClick={() => {
                            if (!bannerId) {
                                toast.error('Выберите баннер');
                                return;
                            }
                            onSubmit({
                                slotId,
                                bannerId,
                                priority,
                                startAt: startAt ? new Date(startAt).toISOString() : undefined,
                                endAt: endAt ? new Date(endAt).toISOString() : undefined,
                            });
                        }}
                    >
                        Добавить
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

type SortablePlacementProps = {
    placement: BannerPlacementAdminItemDto;
    onRemove: (id: string) => void;
};

function SortablePlacementItem({ placement, onRemove }: SortablePlacementProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: placement.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={
                'flex items-center gap-4 rounded-md border p-3 bg-background ' +
                (isDragging ? 'opacity-70' : '')
            }
        >
            <button
                className="text-muted-foreground hover:text-foreground"
                {...attributes}
                {...listeners}
                type="button"
            >
                <GripVerticalIcon className="w-4 h-4" />
            </button>
            <div className="h-12 w-20 rounded-md bg-muted/40 overflow-hidden flex items-center justify-center">
                {placement.banner.type === 'video' ? (
                    <video
                        src={getFileUrl(placement.banner.fileUrl)}
                        muted
                        className="h-full w-full object-contain"
                    />
                ) : (
                    <img
                        src={getFileUrl(placement.banner.fileUrl)}
                        alt={placement.banner.title}
                        className="h-full w-full object-contain"
                    />
                )}
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <p className="font-medium">{placement.banner.title}</p>
                    {!placement.banner.isActive && (
                        <Badge variant="secondary">Баннер выключен</Badge>
                    )}
                    {!placement.isActive && <Badge variant="secondary">Выключен</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">
                    {placement.banner.type} · priority {placement.priority}
                </p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onRemove(placement.id)}>
                <Trash2Icon className="w-4 h-4" />
            </Button>
        </div>
    );
}

type SlotCardProps = {
    slot: BannerPlacementsSlotAdminDto;
    banners: BannerAdminResponseDto[];
    onCreate: (payload: {
        slotId: string;
        bannerId: string;
        priority: number;
        startAt?: string;
        endAt?: string;
    }) => void;
    onUpdatePriority: (updates: Array<{ id: string; priority: number }>) => void;
    onRemove: (id: string) => void;
};

function SlotCard({ slot, banners, onCreate, onUpdatePriority, onRemove }: SlotCardProps) {
    const sensors = useSensors(useSensor(PointerSensor));
    const [items, setItems] = useState<BannerPlacementAdminItemDto[]>(slot.placements || []);
    const [addOpen, setAddOpen] = useState(false);

    useEffect(() => {
        setItems(slot.placements || []);
    }, [slot.placements]);

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return;

        const newItems = arrayMove(items, oldIndex, newIndex).map((item, index) => ({
            ...item,
            priority: index,
        }));
        setItems(newItems);

        const updates = newItems
            .map((item) => ({ id: item.id, priority: item.priority }))
            .filter((item) => {
                const original = slot.placements.find((p) => p.id === item.id);
                return !original || original.priority !== item.priority;
            });

        if (updates.length > 0) {
            onUpdatePriority(updates);
        }
    };

    return (
        <div className="rounded-xl border p-4 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-semibold">{slot.slotKey}</p>
                    <p className="text-sm text-muted-foreground">
                        {slot.width} × {slot.height}
                    </p>
                </div>
                <Button size="sm" onClick={() => setAddOpen(true)}>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add banner
                </Button>
            </div>

            {items.length === 0 ? (
                <div className="text-sm text-muted-foreground">Баннеров нет</div>
            ) : (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={items.map((item) => item.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-2">
                            {items.map((placement) => (
                                <SortablePlacementItem
                                    key={placement.id}
                                    placement={placement}
                                    onRemove={onRemove}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            <AddBannerDialog
                open={addOpen}
                onOpenChange={setAddOpen}
                slotId={slot.slotId}
                allowedTypes={slot.allowedTypes as BannerMediaType[]}
                banners={banners}
                defaultPriority={items.length}
                onSubmit={(payload) => {
                    onCreate(payload);
                    setAddOpen(false);
                }}
            />
        </div>
    );
}

function resolveSlotKey(slotKeys: string[], preferred: string[]) {
    return preferred.find((key) => slotKeys.includes(key)) ?? slotKeys[0] ?? null;
}

function PagePreview({ page, slotKeys }: { page: BannerSlotPage; slotKeys: string[] }) {
    const contentInlineKey = resolveSlotKey(slotKeys, ['content_inline']);
    const topInlineKey = resolveSlotKey(slotKeys, ['top_inline']);
    const sidebarKey = resolveSlotKey(slotKeys, ['sidebar_top', 'sidebar']);

    if (page === 'news_article') {
        return (
            <div className="rounded-xl border p-6 bg-muted/10">
                <div className={clsx(newsStyles.container, 'max-w-[1200px] mx-auto')}>
                    <div className={newsStyles.news_content}>
                        <div className="h-64">
                            <AppSkeleton />
                        </div>
                        <div className={newsStyles.title}>
                            <div className="h-10 max-w-[420px]">
                                <AppSkeleton />
                            </div>
                        </div>
                        <div className="space-y-3">
                            {Array.from({ length: 4 }).map((_, idx) => (
                                <div key={idx} className="h-6">
                                    <AppSkeleton />
                                </div>
                            ))}
                        </div>
                        {contentInlineKey && (
                            <div className="my-6 flex justify-center">
                                <BannerSlot slotKey={contentInlineKey} />
                            </div>
                        )}
                        <div className="space-y-3">
                            {Array.from({ length: 5 }).map((_, idx) => (
                                <div key={idx} className="h-6">
                                    <AppSkeleton />
                                </div>
                            ))}
                        </div>
                        <div className={newsStyles.date}>
                            <div className="h-4 w-24">
                                <AppSkeleton />
                            </div>
                        </div>
                    </div>
                    <div className={newsStyles.sticky}>
                        <div className={newsStyles.separator}></div>
                        <div className={newsStyles.recommended_news}>
                            {sidebarKey && (
                                <div className="mb-6 flex justify-center">
                                    <BannerSlot slotKey={sidebarKey} />
                                </div>
                            )}
                            {Array.from({ length: 3 }).map((_, idx) => (
                                <div key={idx} className="h-28 w-full">
                                    <AppSkeleton />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (page === 'challenges_rewards') {
        return (
            <div className="rounded-xl border p-6 bg-muted/10">
                <div className={clsx(challengesRewardsStyles.wrapper, 'max-w-[1200px] mx-auto')}>
                    <div className={challengesRewardsStyles.content}>
                        <div className="h-7 max-w-[260px]">
                            <AppSkeleton />
                        </div>
                        <div className={challengesRewardsStyles.info_blocks}>
                            {Array.from({ length: 2 }).map((_, idx) => (
                                <div key={idx} className="h-40">
                                    <AppSkeleton />
                                </div>
                            ))}
                            {topInlineKey && (
                                <div className="flex items-center justify-center h-40">
                                    <BannerSlot slotKey={topInlineKey} />
                                </div>
                            )}
                        </div>
                        <div className={challengesRewardsStyles.rewards}>
                            {Array.from({ length: 6 }).map((_, idx) => (
                                <div key={idx} className="h-28 w-full">
                                    <AppSkeleton />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border p-6 bg-muted/10">
            <div className={clsx(tiersStyles.container, 'max-w-[1200px] mx-auto')}>
                <div className={tiersStyles.info}>
                    <div className="h-6 w-32">
                        <AppSkeleton />
                    </div>
                    <div className="h-4 w-20">
                        <AppSkeleton />
                    </div>
                </div>
                {contentInlineKey && (
                    <div className="my-6 flex justify-center">
                        <BannerSlot slotKey={contentInlineKey} />
                    </div>
                )}
                <div className="space-y-3">
                    {Array.from({ length: 10 }).map((_, idx) => (
                        <div key={idx} className="h-6">
                            <AppSkeleton />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function BannerPlacementsPage() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState<BannerSlotPage>('news_article');

    const { data: placementsData, isLoading } = useQuery({
        ...bannerPlacementsAdminControllerListPlacementsOptions({
            client: getPublicClient(),
            query: { page },
        }),
    });

    const { data: bannersData } = useQuery({
        ...bannersAdminControllerListBannersOptions({
            client: getPublicClient(),
        }),
    });

    const banners = (bannersData ?? []) as BannerAdminResponseDto[];
    const slots = (placementsData ?? []) as BannerPlacementsSlotAdminDto[];

    const createMutation = useMutation({
        ...bannerPlacementsAdminControllerCreatePlacementMutation({
            client: getPublicClient(),
        }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: bannerPlacementsAdminControllerListPlacementsQueryKey({
                    client: getPublicClient(),
                    query: { page },
                }),
            });
            toast.success('Баннер добавлен');
        },
        onError: () => toast.error('Ошибка при добавлении баннера'),
    });

    const updateMutation = useMutation({
        ...bannerPlacementsAdminControllerUpdatePlacementMutation({
            client: getPublicClient(),
        }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: bannerPlacementsAdminControllerListPlacementsQueryKey({
                    client: getPublicClient(),
                    query: { page },
                }),
            });
        },
        onError: () => toast.error('Ошибка при обновлении приоритета'),
    });

    const deleteMutation = useMutation({
        ...bannerPlacementsAdminControllerDeletePlacementMutation({
            client: getPublicClient(),
        }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: bannerPlacementsAdminControllerListPlacementsQueryKey({
                    client: getPublicClient(),
                    query: { page },
                }),
            });
            toast.success('Размещение удалено');
        },
        onError: () => toast.error('Ошибка при удалении'),
    });

    const handleCreate = (payload: {
        slotId: string;
        bannerId: string;
        priority: number;
        startAt?: string;
        endAt?: string;
    }) => {
        createMutation.mutate({
            body: payload,
        });
    };

    const handleUpdatePriority = (updates: Array<{ id: string; priority: number }>) => {
        updates.forEach((update) => {
            updateMutation.mutate({
                path: { id: update.id },
                body: { priority: update.priority },
            });
        });
    };

    const handleRemove = (id: string) => {
        if (!confirm('Удалить размещение?')) return;
        deleteMutation.mutate({ path: { id } });
    };

    return (
        <BannerProvider page={page}>
            <div className="container mx-auto py-8 space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Размещение баннеров</h1>
                        <p className="text-muted-foreground">
                            Управляйте слотами и порядком показа.
                        </p>
                    </div>
                    <div className="w-64">
                        <Select
                            value={page}
                            onValueChange={(value) => setPage(value as BannerSlotPage)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Выберите страницу" />
                            </SelectTrigger>
                            <SelectContent>
                                {PAGE_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <h2 className="text-lg font-semibold">Preview страницы</h2>
                    <PagePreview page={page} slotKeys={slots.map((slot) => slot.slotKey)} />
                </div>

                {isLoading ? (
                    <div className="p-8 text-center text-muted-foreground">Загрузка...</div>
                ) : slots.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">Слоты не найдены</div>
                ) : (
                    <div className="grid gap-6">
                        {slots.map((slot) => (
                            <SlotCard
                                key={slot.slotId}
                                slot={slot}
                                banners={banners}
                                onCreate={handleCreate}
                                onUpdatePriority={handleUpdatePriority}
                                onRemove={handleRemove}
                            />
                        ))}
                    </div>
                )}
            </div>
        </BannerProvider>
    );
}
