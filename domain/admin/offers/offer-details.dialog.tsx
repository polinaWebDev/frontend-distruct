'use client';

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import { DownloadIcon, FileVideoIcon, ImageIcon, FileIcon } from 'lucide-react';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { offerControllerGetByIdOptions } from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { getPublicClient } from '@/lib/api_client/public_client';
import { Skeleton } from '@/components/ui/skeleton';
import { getFileUrl } from '@/lib/utils';

interface OfferDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    offerId: string | null;
}

const isVideo = (url: string) => /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
const isImage = (url: string) => /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(url);

export function OfferDetailsDialog({ open, onOpenChange, offerId }: OfferDetailsDialogProps) {
    const { data: offer, isLoading } = useQuery({
        ...offerControllerGetByIdOptions({
            client: getPublicClient(),
            path: {
                id: offerId ?? '',
            },
        }),
        enabled: !!offerId && open,
    });

    if (!offer && isLoading) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Загрузка...</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-40 w-full" />
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    if (!offer) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Детали предложения</DialogTitle>
                    <DialogDescription>
                        Просмотр информации о предложенном челлендже
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <Label className="text-muted-foreground">Пользователь</Label>
                            <div className="font-medium">{offer.user?.username || '—'}</div>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Дата создания</Label>
                            <div className="font-medium">
                                {offer.createdAt
                                    ? format(new Date(offer.createdAt), 'd MMMM yyyy HH:mm', {
                                          locale: ru,
                                      })
                                    : '—'}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-muted-foreground">Название</Label>
                        <div className="text-lg font-semibold">{offer.title}</div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-muted-foreground">Описание</Label>
                        <div className="p-3 bg-muted rounded-md text-sm whitespace-pre-wrap">
                            {offer.description}
                        </div>
                    </div>

                    {offer.images_urls && offer.images_urls.length > 0 && (
                        <div className="space-y-2">
                            <Label className="text-muted-foreground">Файлы</Label>
                            <PhotoProvider>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {offer.images_urls.map((url, index) => {
                                        const fileUrl = getFileUrl(url);
                                        const isVideoFile = isVideo(fileUrl);
                                        const isImageFile = isImage(fileUrl);

                                        return (
                                            <div
                                                key={index}
                                                className="relative rounded-md border bg-muted overflow-hidden group"
                                            >
                                                {isVideoFile ? (
                                                    <div className="aspect-video">
                                                        <video
                                                            src={fileUrl}
                                                            controls
                                                            className="w-full h-full object-contain bg-black"
                                                        />
                                                    </div>
                                                ) : isImageFile ? (
                                                    <PhotoView src={fileUrl}>
                                                        <div className="aspect-video cursor-pointer">
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            <img
                                                                src={fileUrl}
                                                                alt={`File ${index + 1}`}
                                                                className="h-full w-full object-cover transition-all hover:scale-105"
                                                            />
                                                        </div>
                                                    </PhotoView>
                                                ) : (
                                                    <div className="aspect-video flex items-center justify-center bg-secondary text-muted-foreground">
                                                        <div className="text-center">
                                                            <FileIcon className="w-8 h-8 mx-auto mb-2" />
                                                            <span className="text-xs">
                                                                Неизвестный формат
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Type Badge */}
                                                <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded flex items-center gap-1.5 pointer-events-none">
                                                    {isVideoFile ? (
                                                        <>
                                                            <FileVideoIcon className="w-3 h-3" />
                                                            <span>Видео</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ImageIcon className="w-3 h-3" />
                                                            <span>Изображение</span>
                                                        </>
                                                    )}
                                                </div>

                                                {/* Download Button */}
                                                <a
                                                    href={fileUrl}
                                                    download
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full hover:bg-white transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                                                    onClick={(e) => e.stopPropagation()}
                                                    title="Скачать"
                                                >
                                                    <DownloadIcon className="w-4 h-4 text-black" />
                                                </a>
                                            </div>
                                        );
                                    })}
                                </div>
                            </PhotoProvider>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
