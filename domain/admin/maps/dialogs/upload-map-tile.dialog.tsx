import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { MapFloorDto } from '@/lib/api_client/gen';
import { mapsAdminControllerGenerateMapTilesMutation } from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { getPublicClient } from '@/lib/api_client/public_client';
import { useMutation } from '@tanstack/react-query';
import { UploadIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export const UploadMapTileDialog = ({
    map_id,
    floors,
    selectedFloorId,
}: {
    map_id: string;
    floors: MapFloorDto[];
    selectedFloorId?: string;
}) => {
    const [open, setOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const previewUrlRef = useRef<string | null>(null);
    const [floorSelection, setFloorSelection] = useState<string>(selectedFloorId ?? '');
    const [floorLevel, setFloorLevel] = useState<string>('1');
    const [floorName, setFloorName] = useState<string>('');

    const { mutate: uploadMapTile, isPending } = useMutation({
        ...mapsAdminControllerGenerateMapTilesMutation({
            client: getPublicClient(),
        }),
        onSuccess: () => {
            toast.success('Карта успешно загружена');
            setOpen(false);
            setFile(null);
            if (previewUrlRef.current) {
                URL.revokeObjectURL(previewUrlRef.current);
                previewUrlRef.current = null;
            }
            setPreview(null);
            setTimeout(() => {
                window.location.reload();
            }, 500);
        },
        onMutate: () => {
            toast.loading('Загрузка карты...', { id: 'upload-map-tile-toast' });
        },
        onSettled: () => {
            toast.dismiss('upload-map-tile-toast');
        },
        onError: (error) => {
            console.error(error);
            toast.error('Ошибка при загрузке карты');
        },
    });

    useEffect(() => {
        if (!open) return;
        const initialId = selectedFloorId ?? floors[0]?.id ?? 'new';
        setFloorSelection(initialId);
        const floor = floors.find((item) => item.id === initialId);
        if (floor) {
            setFloorLevel(String(floor.level));
            setFloorName(floor.name);
        } else {
            setFloorLevel('1');
            setFloorName('');
        }
    }, [open, selectedFloorId, floors]);

    useEffect(() => {
        return () => {
            if (previewUrlRef.current) {
                URL.revokeObjectURL(previewUrlRef.current);
            }
        };
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null;
        if (selectedFile) {
            if (selectedFile.type !== 'image/png' && selectedFile.type !== 'image/webp') {
                toast.error('Разрешены только PNG или WebP файлы');
                e.target.value = '';
                return;
            }
            if (previewUrlRef.current) {
                URL.revokeObjectURL(previewUrlRef.current);
            }
            const objectUrl = URL.createObjectURL(selectedFile);
            previewUrlRef.current = objectUrl;
            setPreview(objectUrl);
        } else {
            if (previewUrlRef.current) {
                URL.revokeObjectURL(previewUrlRef.current);
                previewUrlRef.current = null;
            }
            setPreview(null);
        }
        setFile(selectedFile);
    };

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            setFile(null);
            if (previewUrlRef.current) {
                URL.revokeObjectURL(previewUrlRef.current);
                previewUrlRef.current = null;
            }
            setPreview(null);
            setFloorSelection(selectedFloorId ?? '');
            const selectedFloor = floors.find((floor) => floor.id === selectedFloorId);
            if (selectedFloor) {
                setFloorLevel(String(selectedFloor.level));
                setFloorName(selectedFloor.name);
            } else {
                setFloorLevel('1');
                setFloorName('');
            }
        }
    };

    const selectedFloor = floors.find((floor) => floor.id === floorSelection);
    const isNewFloor = floorSelection === 'new';

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button>
                    <UploadIcon />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Загрузить карту</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-3">
                    <Label>Этаж</Label>
                    <Select
                        value={floorSelection || (floors[0]?.id ?? 'new')}
                        onValueChange={(value) => {
                            setFloorSelection(value);
                            if (value === 'new') {
                                setFloorLevel('');
                                setFloorName('');
                                return;
                            }
                            const floor = floors.find((item) => item.id === value);
                            if (floor) {
                                setFloorLevel(String(floor.level));
                                setFloorName(floor.name);
                            }
                        }}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Выберите этаж" />
                        </SelectTrigger>
                        <SelectContent>
                            {floors.map((floor) => (
                                <SelectItem key={floor.id} value={floor.id}>
                                    {floor.name}
                                </SelectItem>
                            ))}
                            <SelectItem value="new">Новый этаж</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label>Номер этажа</Label>
                            <Input
                                type="number"
                                min={1}
                                value={floorLevel}
                                onChange={(e) => setFloorLevel(e.target.value)}
                                disabled={!isNewFloor && !!selectedFloor}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Название</Label>
                            <Input
                                value={floorName}
                                onChange={(e) => setFloorName(e.target.value)}
                                disabled={!isNewFloor && !!selectedFloor}
                            />
                        </div>
                    </div>
                </div>

                <Input type="file" accept="image/png,image/webp" onChange={handleFileChange} />

                {preview && (
                    <div className="mt-4">
                        <img
                            src={preview}
                            alt="Preview"
                            className="max-w-full h-auto max-h-96 rounded-md border"
                        />
                    </div>
                )}

                <DialogFooter>
                    <Button
                        onClick={() => {
                            if (file) {
                                const level = Number(floorLevel);
                                if (!Number.isFinite(level) || level <= 0) {
                                    toast.error('Укажите корректный номер этажа');
                                    return;
                                }
                                uploadMapTile({
                                    body: {
                                        file: file as any,
                                        id: map_id,
                                        floor_level: level,
                                        floor_name: floorName ? floorName : undefined,
                                    },
                                });
                            }
                        }}
                        disabled={isPending || !file}
                    >
                        Загрузить
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
