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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { MapDataMarkerDto, MapDataMarkerTypeDto, MapFloorDto } from '@/lib/api_client/gen';
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

const schema = zCreateMapMarkerDto.extend({
    file: z.optional(z.instanceof(File)),
});

export const CreateOrUpdateMarkerDialog = ({
    cords,
    map_id,
    available_types,
    floors,
    selectedFloorId,
    marker_data,
    marker_id,
}: {
    cords: LatLng;
    map_id: string;
    available_types: MapDataMarkerTypeDto[];
    floors: MapFloorDto[];
    selectedFloorId?: string;
    marker_id?: string;
    marker_data?: MapDataMarkerDto;
}) => {
    const [open, setOpen] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const queryClient = useQueryClient();
    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: marker_data?.name ?? '',
            description: marker_data?.description ?? '',
            latitude: marker_data?.latitude ?? cords.lat,
            longitude: marker_data?.longitude ?? cords.lng,
            type_id: marker_data?.type_id ?? undefined,
            floor_id: marker_data?.floor_id ?? selectedFloorId ?? undefined,
            map_id: map_id,
            info_link: marker_data?.info_link ?? undefined,
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

    console.log(marker_data?.type_id);

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
            <DialogTrigger asChild>
                <Button>{marker_data ? <PencilIcon /> : <PlusIcon />}</Button>
            </DialogTrigger>
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
                                            value={field.value}
                                            defaultValue={marker_data?.floor_id ?? selectedFloorId}
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
                                    body: {
                                        ...res,
                                        file: imageFile ? imageFile : undefined,
                                        id: marker_id,
                                    },
                                });
                            } else {
                                createMarker({
                                    body: {
                                        ...res,
                                        file: imageFile ? imageFile : undefined,
                                    },
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
