'use client';
import styles from './NewsImageGallery.module.css';
import 'react-photo-view/dist/react-photo-view.css';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import { NewsEntity } from '@/lib/api_client/gen';
import { getFileUrl } from '@/lib/utils';

export const NewsImageGallery = ({ data }: { data: NewsEntity }) => {
    const mainImageFileName = data.gallery_images?.[0]?.image_url ?? data.image_url;
    const mainImageUrl = getFileUrl(mainImageFileName);
    const galleryImages = data.gallery_images?.slice(1) ?? [];

    return (
        <PhotoProvider>
            <div className={styles.container}>
                <PhotoView src={mainImageUrl}>
                    <img className={styles.main_image} src={mainImageUrl} alt={data.title} />
                </PhotoView>

                {galleryImages.length > 0 && (
                    <div className={styles.gallery_images}>
                        {galleryImages?.map((image) => (
                            <PhotoView src={getFileUrl(image.image_url)} key={image.id}>
                                <img
                                    src={getFileUrl(image.image_url)}
                                    alt={image.image_url}
                                    className={styles.gallery_image}
                                />
                            </PhotoView>
                        ))}
                    </div>
                )}
            </div>
        </PhotoProvider>
    );
};
