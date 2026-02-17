import {
    MapDataCategoryDto,
    MapDataMarkerDto,
    MapDataResponseDto,
    MapMarkerCategoryEntity,
} from '@/lib/api_client/gen';
import { getFileUrl, hexToRgba } from '@/lib/utils';
import Image from 'next/image';
import styles from './map-info.module.css';
import { Fragment, useState } from 'react';
import { AppInput } from '@/ui/AppInput/AppInput';
import { MapInfoBtn } from './components/map-info-btn/map-info-btn';
import { CreateOrUpdateMapCategoryDialog } from '../../../dialogs/create-or-update-map-category';
import { RemoveMapCategoryDialog } from '../../../dialogs/remove-category.dialog';
import { MapInfoTypes } from './components/map-info-types/map-info-types';
import { Button } from '@/components/ui/button';
import { EyeIcon, EyeOffIcon, Pencil } from 'lucide-react';
import { Activity } from 'react';
import clsx from 'clsx';
import { useMedia } from 'react-use';

export const MapInfo = ({
    map_data,
    admin,
    onSelectType,
    selectedTypeId,
    selectedLevelId,
}: {
    map_data: MapDataResponseDto;
    admin: boolean;
    onSelectType: (type_id?: string) => void;
    selectedTypeId?: string;
    selectedLevelId?: string;
}) => {
    const isMobile = useMedia('(max-width: 1000px)');
    const [search, setSearch] = useState('');
    const [hidden, setHidden] = useState(isMobile);
    const [createCategoryOpen, setCreateCategoryOpen] = useState(false);
    const [categoryToEdit, setCategoryToEdit] = useState<MapDataCategoryDto | null>(null);

    const [selectedCategory, setSelectedCategory] = useState<MapDataCategoryDto | null>(null);
    const markerMatchesSelectedLevel = (marker: MapDataMarkerDto) => {
        if (!selectedLevelId) return true;
        const markerLevelIds = marker.map_level_ids ?? [];
        if (!markerLevelIds.length) return true;
        return markerLevelIds.includes(selectedLevelId);
    };

    return (
        <div
            className={clsx(styles.container, hidden && styles.hidden, !hidden && styles.open)}
            style={{
                ...(admin && { width: 500 }),
            }}
        >
            {hidden && (
                <Button size={'icon'} variant={'ghost'} onClick={() => setHidden(!hidden)}>
                    <EyeOffIcon />
                </Button>
            )}

            <Activity mode={hidden ? 'hidden' : 'visible'}>
                <div className={styles.info_container}>
                    {map_data.image_url && (
                        <Image
                            src={getFileUrl(map_data.image_url)}
                            alt={map_data.name}
                            className={styles.preview}
                            width={312 * 2}
                            height={64 * 2}
                        />
                    )}

                    <div className="flex justify-between items-end w-full">
                        <div className={styles.text}>
                            <p>{map_data.description}</p>
                            <h1>{map_data.name}</h1>
                        </div>

                        <Button size={'icon'} variant={'ghost'} onClick={() => setHidden(!hidden)}>
                            <EyeIcon />
                        </Button>
                    </div>
                </div>

                <div className={styles.search_container}>
                    {!selectedCategory && (
                        <Fragment>
                            <h2>Поиск</h2>
                            <AppInput
                                placeholder="Поиск"
                                value={search}
                                onText={(value) => setSearch(value)}
                            />
                            <div className={styles.categories}>
                                {map_data.categories
                                    ?.filter((category) =>
                                        category.name.toLowerCase().includes(search.toLowerCase())
                                    )
                                    .map((category) => (
                                        <div className={styles.category} key={category.id}>
                                            <div className={styles.content}>
                                                <div
                                                    className={styles.color}
                                                    style={{
                                                        background: category.color,
                                                        boxShadow: `0px 0px 20.200000762939453px 6px ${hexToRgba(category.color, 0.38)}`,
                                                    }}
                                                />
                                                <div className={styles.text}>
                                                    <h3>{category.name}</h3>
                                                    <p>{category.description}</p>
                                                </div>
                                            </div>

                                            <MapInfoBtn
                                                text={`${category.marker_types?.reduce(
                                                    (acc, markerType) =>
                                                        acc +
                                                        (markerType.markers?.filter(
                                                            markerMatchesSelectedLevel
                                                        ).length ?? 0),
                                                    0
                                                )}x`}
                                                onClick={() => setSelectedCategory(category)}
                                            />

                                            {admin && (
                                                <>
                                                    <RemoveMapCategoryDialog
                                                        id={category.id}
                                                        map_id={map_data.id}
                                                    />
                                                    <Button
                                                        onClick={() => setCategoryToEdit(category)}
                                                        size={'icon'}
                                                        className="ml-2"
                                                    >
                                                        <Pencil className="object-contain" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                {admin && (
                                    <div
                                        className={styles.category}
                                        onClick={() => setCreateCategoryOpen(true)}
                                    >
                                        <div className={styles.content}>
                                            <div className={styles.color} />
                                            <div className={styles.text}>
                                                <h3>Создать категорию</h3>
                                                <p>тык</p>
                                            </div>
                                        </div>

                                        <MapInfoBtn text={`+`} />
                                    </div>
                                )}
                            </div>
                        </Fragment>
                    )}
                    {selectedCategory && (
                        <MapInfoTypes
                            category={selectedCategory}
                            types={selectedCategory.marker_types ?? []}
                            selectedLevelId={selectedLevelId}
                            onBack={() => {
                                setSelectedCategory(null);
                                onSelectType(undefined);
                            }}
                            selectedTypeId={selectedTypeId}
                            onSelectType={onSelectType}
                            admin={admin}
                            map_id={map_data.id}
                        />
                    )}
                </div>

                {admin && (
                    <CreateOrUpdateMapCategoryDialog
                        open={createCategoryOpen}
                        onOpenChange={setCreateCategoryOpen}
                        map_id={map_data.id}
                    />
                )}

                {admin && categoryToEdit && (
                    <CreateOrUpdateMapCategoryDialog
                        map_id={map_data.id}
                        category_data={categoryToEdit as unknown as MapMarkerCategoryEntity}
                        open={!!categoryToEdit}
                        onOpenChange={() => setCategoryToEdit(null)}
                    />
                )}
            </Activity>
        </div>
    );
};
