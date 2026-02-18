'use client';

import { MapListResponseDto } from '@/lib/api_client/gen';
import styles from './ClientMapList.module.css';
import clsx from 'clsx';
import Image from 'next/image';
import { getFileUrl } from '@/lib/utils';
import Link from 'next/link';
import { GameType } from '@/lib/enums/game_type.enum';
import { Map } from 'lucide-react';

export const ClientMapList = ({ maps, game }: { maps: MapListResponseDto[]; game: GameType }) => {
    return (
        <div className={clsx(styles.container, 'page_width_wrapper')}>
            {maps.length > 0 ? (
                maps.map((map) => (
                    <Link href={`/${game}/maps/${map.id}`} className={styles.map_item} key={map.id}>
                        <div className={styles.preview_wrap}>
                            <Image
                                className={styles.preview}
                                width={517}
                                height={162}
                                src={getFileUrl(map.image_url ?? '')}
                                alt={map.name}
                            />
                            {map.visibility === 'private' && (
                                <span className={styles.admin_badge}>Только админам</span>
                            )}
                        </div>
                        <div className={styles.bottom}>
                            <p className={styles.title}>{map.name}</p>
                            {(map.levels?.length ?? 0) > 0 && (
                                <div className={styles.levels}>
                                    {[...(map.levels ?? [])]
                                        .sort((a, b) => Number(a.sort_order) - Number(b.sort_order))
                                        .map((level) => (
                                            <span key={level.id} className={styles.level_badge}>
                                                {level.name}
                                            </span>
                                        ))}
                                </div>
                            )}
                            <div className={styles.info}>
                                {map.categories?.map((category) => (
                                    <p className={styles.p} key={category.id}>
                                        {category.name + ' '}
                                        <span>{category.marker_types?.length ?? 0}</span>
                                    </p>
                                ))}
                            </div>
                        </div>
                    </Link>
                ))
            ) : (
                <div className={styles.empty_state}>
                    <Map className={styles.empty_state_icon} />
                    <span className={styles.empty_state_text}>Карт пока нет</span>
                </div>
            )}
        </div>
    );
};
