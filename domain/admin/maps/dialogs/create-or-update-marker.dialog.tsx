'use client';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
    MapDataMarkerDto,
    MapDataMarkerTypeDto,
    MapFloorDto,
    MapLevelDto,
} from '@/lib/api_client/gen';
import {
    mapsControllerGetMapQueryKey,
    mapsMarkerAdminControllerCreateMapMarkerMutation,
    mapsMarkerAdminControllerUpdateMapMarkerMutation,
} from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { zCreateMapMarkerDto } from '@/lib/api_client/gen/zod.gen';
import { getPublicClient } from '@/lib/api_client/public_client';
import { getFileUrl } from '@/lib/utils';
import { AppControlledInput } from '@/ui/AppInput/AppInput';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LatLng } from 'leaflet';
import { PencilIcon, PlusIcon } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';
import { CreateMapLevelDialog } from './create-map-level.dialog';

const schema = zCreateMapMarkerDto.extend({
    map_level_ids: z.array(z.string()).min(1, 'Выберите хотя бы одну сложность'),
    file: z.optional(z.instanceof(File)),
    is_locked: z.boolean().optional(),
});

const mapMarkerBodySerializer = (body: Partial<z.infer<typeof schema>>) => {
    const data = new FormData();

    if (body.name !== undefined) data.append('name', body.name);
    if (body.description !== undefined && body.description !== null) {
        data.append('description', body.description);
    }
    if (body.latitude !== undefined) data.append('latitude', String(body.latitude));
    if (body.longitude !== undefined) data.append('longitude', String(body.longitude));
    if (body.type_id !== undefined) data.append('type_id', body.type_id);
    if (body.floor_id !== undefined && body.floor_id !== null) {
        data.append('floor_id', body.floor_id);
    }
    if (body.map_level_ids) {
        body.map_level_ids.forEach((id) => data.append('map_level_ids[]', id));
    }
    if (body.map_id !== undefined) data.append('map_id', body.map_id);
    if (body.info_link !== undefined && body.info_link !== null) {
        data.append('info_link', body.info_link);
    }
    if (body.is_locked !== undefined) {
        const lockedValue = body.is_locked ? '1' : '0';
        data.append('is_locked', lockedValue);
        data.append('isLocked', lockedValue);
    }
    if (body.file) data.append('file', body.file);

    return data;
};

export const CreateOrUpdateMarkerDialog = ({
    cords,
    map_id,
    available_types,
    floors,
    levels,
    selectedFloorId,
    marker_data,
    marker_id,
    open: controlledOpen,
    onOpenChange,
    hideTrigger = false,
    defaultOpen = false,
}: {
    cords: LatLng;
    map_id: string;
    available_types: MapDataMarkerTypeDto[];
    floors: MapFloorDto[];
    levels: MapLevelDto[];
    selectedFloorId?: string;
    marker_id?: string;
    marker_data?: MapDataMarkerDto;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    hideTrigger?: boolean;
    defaultOpen?: boolean;
}) => {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
    const open = controlledOpen ?? uncontrolledOpen;
    const setOpen = (nextOpen: boolean) => {
        if (controlledOpen === undefined) {
            setUncontrolledOpen(nextOpen);
        }
        onOpenChange?.(nextOpen);
    };
    const [imageFile, setImageFile] = useState<File | null>(null);
    const queryClient = useQueryClient();
    const form = useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: marker_data?.name ?? '',
            description: marker_data?.description ?? '',
            latitude: marker_data?.latitude ?? cords.lat,
            longitude: marker_data?.longitude ?? cords.lng,
            type_id: marker_data?.type_id ?? undefined,
            floor_id: marker_data?.floor_id ?? selectedFloorId ?? undefined,
            map_level_ids: (marker_data?.map_level_ids ?? []).map(String),
            map_id: map_id,
            info_link: marker_data?.info_link ?? undefined,
            is_locked: marker_data?.is_locked ?? false,
        },
        mode: 'onChange',
    });

    const clearQueries = () => {
        queryClient.resetQueries({
            queryKey: mapsControllerGetMapQueryKey({
                path: { id: map_id },
                client: getPublicClient(),
            }),
        });
    };

    const { mutate: createMarker, isPending } = useMutation({
        ...mapsMarkerAdminControllerCreateMapMarkerMutation({
            client: getPublicClient(),
        }),
        onSuccess: () => {
            toast.success('Маркер успешно создан');
        },
        onSettled: () => {
            setOpen(false);
            setImageFile(null);
            clearQueries();
            toast.dismiss('create-marker-toast');
        },
        onMutate: () => {
            toast.loading('Создание маркера...', { id: 'create-marker-toast' });
        },
        onError: (error) => {
            console.error(error);
            toast.error('Ошибка при создании маркера');
        },
    });

    const updateMutation = useMutation({
        ...mapsMarkerAdminControllerUpdateMapMarkerMutation({
            client: getPublicClient(),
        }),
        onSuccess: () => {
            toast.success('Маркер успешно обновлен');
        },
        onSettled: () => {
            setOpen(false);
            setImageFile(null);
            clearQueries();
            toast.dismiss('update-marker-toast');
        },
        onMutate: () => {
            toast.loading('Обновление маркера...', { id: 'update-marker-toast' });
        },
        onError: (error) => {
            console.error(error);
            toast.error('Ошибка при обновлении маркера');
        },
    });

    return (
        <Dialog
            open={open}
            onOpenChange={(newOpen) => {
                setOpen(newOpen);
                if (!newOpen) {
                    setImageFile(null);
                }
            }}
        >
            {!hideTrigger && (
                <DialogTrigger asChild>
                    <Button>{marker_data ? <PencilIcon /> : <PlusIcon />}</Button>
                </DialogTrigger>
            )}
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {marker_data ? 'Редактировать маркер' : 'Создать маркер'}
                    </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 overflow-y-auto max-h-[80svh]">
                    <div className="flex flex-col gap-4 h-fit">
                        <AppControlledInput
                            control={form.control}
                            name="name"
                            label="Название *"
                            desc="Название маркера"
                        />

                        <AppControlledInput
                            control={form.control}
                            name="info_link"
                            label="Ссылка"
                            desc="Ссылка на информацию о маркере"
                        />

                        <FormItem>
                            <Label>Описание</Label>

                            <Textarea
                                {...form.register('description')}
                                placeholder="Описание карты"
                                rows={3}
                            />
                        </FormItem>

                        <FormItem>
                            <Label>Тип маркера *</Label>
                            <Controller
                                control={form.control}
                                name="type_id"
                                render={({ field }) => (
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        defaultValue={marker_data?.type_id ?? undefined}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Выберите тип маркера" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {available_types.map((type) => (
                                                <SelectItem
                                                    key={type.id}
                                                    value={type.id.toString()}
                                                >
                                                    <div
                                                        className="w-4 h-4 object-contain"
                                                        dangerouslySetInnerHTML={{
                                                            __html: type.icon,
                                                        }}
                                                    />
                                                    <p>{type.name}</p>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </FormItem>

                        {floors.length > 0 && (
                            <FormItem>
                                <Label>Этаж *</Label>
                                <Controller
                                    control={form.control}
                                    name="floor_id"
                                    render={({ field }) => (
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value ?? undefined}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Выберите этаж" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {floors.map((floor) => (
                                                    <SelectItem
                                                        key={floor.id}
                                                        value={floor.id.toString()}
                                                    >
                                                        {floor.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </FormItem>
                        )}

                        <FormItem>
                            <div className="flex items-center gap-2">
                                <Controller
                                    control={form.control}
                                    name="is_locked"
                                    render={({ field }) => (
                                        <Checkbox
                                            id="marker-is-locked"
                                            checked={Boolean(field.value)}
                                            onCheckedChange={(checked) =>
                                                field.onChange(checked === true)
                                            }
                                        />
                                    )}
                                />
                                <Label htmlFor="marker-is-locked" className="cursor-pointer">
                                    Заблокировать метку (нельзя двигать)
                                </Label>
                            </div>
                        </FormItem>

                        <FormItem>
                            <div className="flex items-center justify-between">
                                <Label>Сложность</Label>
                                <CreateMapLevelDialog map_id={map_id} levels={levels} compact />
                            </div>
                            <Controller
                                control={form.control}
                                name="map_level_ids"
                                render={({ field }) => (
                                    <div className="space-y-2 rounded-md border p-3">
                                        {[...levels]
                                            .sort(
                                                (a, b) =>
                                                    Number(a.sort_order) - Number(b.sort_order)
                                            )
                                            .map((level) => {
                                                const levelId = String(level.id);
                                                const selected = field.value.includes(levelId);
                                                return (
                                                    <div
                                                        key={level.id}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <Checkbox
                                                            id={`marker-level-${level.id}`}
                                                            checked={selected}
                                                            onCheckedChange={(checked) => {
                                                                if (checked) {
                                                                    field.onChange([
                                                                        ...field.value,
                                                                        levelId,
                                                                    ]);
                                                                    return;
                                                                }
                                                                field.onChange(
                                                                    field.value.filter(
                                                                        (id) => id !== levelId
                                                                    )
                                                                );
                                                            }}
                                                        />
                                                        <Label
                                                            htmlFor={`marker-level-${level.id}`}
                                                            className="cursor-pointer inline-flex items-center gap-2"
                                                        >
                                                            <span
                                                                className="inline-block h-2.5 w-2.5 rounded-full border border-white/30"
                                                                style={{
                                                                    backgroundColor:
                                                                        level.color || '#9CA3AF',
                                                                }}
                                                            />
                                                            {level.name}
                                                        </Label>
                                                    </div>
                                                );
                                            })}
                                        {levels.length === 0 && (
                                            <p className="text-sm text-muted-foreground">
                                                Нет созданных сложностей
                                            </p>
                                        )}
                                        {form.formState.errors.map_level_ids?.message && (
                                            <p className="text-sm text-red-500">
                                                {form.formState.errors.map_level_ids.message}
                                            </p>
                                        )}
                                    </div>
                                )}
                            />
                        </FormItem>

                        <div className="space-y-2">
                            <Label>Изображение</Label>
                            <Input
                                id="image"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                            />
                            {imageFile && (
                                <p className="text-sm text-muted-foreground">
                                    Выбрано: {imageFile.name} ({(imageFile.size / 1024).toFixed(2)}{' '}
                                    KB)
                                </p>
                            )}
                            {marker_data?.image_url && (
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Текущее изображение:
                                    </p>
                                    <Image
                                        src={getFileUrl(marker_data.image_url)}
                                        alt={marker_data.name}
                                        width={256}
                                        height={256}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="submit"
                        disabled={isPending || updateMutation.isPending || isPending}
                        onClick={form.handleSubmit((res) => {
                            if (marker_id) {
                                updateMutation.mutate({
                                    path: { id: marker_id },
                                    body: {
                                        ...res,
                                        file: imageFile ? imageFile : undefined,
                                    },
                                    bodySerializer: mapMarkerBodySerializer,
                                });
                            } else {
                                createMarker({
                                    body: {
                                        ...res,
                                        file: imageFile ? imageFile : undefined,
                                    },
                                    bodySerializer: mapMarkerBodySerializer,
                                });
                            }
                        })}
                    >
                        {isPending || updateMutation.isPending || isPending
                            ? 'Сохранение...'
                            : 'Сохранить'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
