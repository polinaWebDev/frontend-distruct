import { MapDataMarkerDto } from '@/lib/api_client/gen';
import styles from './mark-marker-info.module.css';
import { MapMarkerBackIcon } from '@/lib/icons/MapMarkerBackIcon';
import { getFileUrl } from '@/lib/utils';
import Image from 'next/image';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import clsx from 'clsx';
import 'react-photo-view/dist/react-photo-view.css';
export const MarkMarkerInfo = ({
    marker,
    levelName,
    onClose,
}: {
    marker: MapDataMarkerDto;
    levelName?: string;
    onClose: () => void;
}) => {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <p>Подробности</p>
                <MapMarkerBackIcon onClick={onClose} className={styles.back_icon} />
            </div>

            {marker.image_url && (
                <PhotoProvider>
                    <PhotoView src={getFileUrl(marker.image_url)}>
                        <Image
                            src={getFileUrl(marker.image_url)}
                            alt={marker.name}
                            width={600}
                            height={244}
                            className={styles.image}
                        />
                    </PhotoView>
                </PhotoProvider>
            )}

            <div className={styles.content_wrapper}>
                <p className={styles.title}>{marker.name}</p>
                {levelName && <span className={styles.level_badge}>{levelName}</span>}
                <div
                    className={styles.content}
                    dangerouslySetInnerHTML={{ __html: marker.description }}
                ></div>
            </div>

            {marker.info_link && (
                <p className={styles.info_link_container}>
                    Подробнее:{' '}
                    <a href={marker.info_link} target="_blank" className={clsx(styles.info_link)}>
                        {marker.info_link}
                    </a>
                </p>
            )}
        </div>
    );
};
