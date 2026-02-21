import {
    GetMapTypeResponseDto,
    MapDataCategoryDto,
    MapDataMarkerDto,
    MapDataMarkerTypeDto,
} from '@/lib/api_client/gen';
import styles from './map-info-types.module.css';
import { GoBackSmallBtn } from '@/ui/GoBackBig/GoBackBig';
import { Button } from '@/components/ui/button';
import { Pencil, Plus, Trash } from 'lucide-react';
import { CreateOrUpdateIconTypeDialog } from '@/domain/admin/maps/dialogs/create-or-update-icon-type';
import { useState } from 'react';
import clsx from 'clsx';
import { RemoveMapIconDialog } from '@/domain/admin/maps/dialogs/remove-map-icon';

export const MapInfoTypes = ({
    category,
    types,
    onBack,
    admin,
    map_id,
    onSelectType,
    selectedTypeId,
    selectedLevelId,
}: {
    category: MapDataCategoryDto;
    types: MapDataMarkerTypeDto[];
    onBack: () => void;
    admin: boolean;
    map_id: string;
    onSelectType: (type_id?: string) => void;
    selectedTypeId?: string;
    selectedLevelId?: string;
}) => {
    const [createIconTypeOpen, setCreateIconTypeOpen] = useState(false);
    const [iconTypeToEdit, setIconTypeToEdit] = useState<MapDataMarkerTypeDto | null>(null);
    const [iconTypeToDelete, setIconTypeToDelete] = useState<MapDataMarkerTypeDto | null>(null);
    const markerMatchesSelectedLevel = (marker: MapDataMarkerDto) => {
        if (!selectedLevelId) return true;
        const markerLevelIds = marker.map_level_ids ?? [];
        if (!markerLevelIds.length) return true;
        return markerLevelIds.includes(selectedLevelId);
    };

    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <div className={styles.title_container}>
                    <p>
                        {category.name + ' '} <span>x{types.length}</span>
                    </p>
                </div>

                <GoBackSmallBtn text={undefined} onClick={onBack} />
            </div>
            <div className={styles.types}>
                <div className={styles.content}>
                    {types.map((type) => (
                        <div
                            className={clsx(
                                styles.type,
                                selectedTypeId === type.id && styles.selected
                            )}
                            key={type.id}
                            onClick={() => onSelectType(type.id)}
                        >
                            <div
                                className={styles.icon}
                                dangerouslySetInnerHTML={{ __html: type.icon }}
                            ></div>

                            <div className={styles.name_wrap}>
                                <p>{type.name}</p>
                                {type.is_point_of_interest && (
                                    <span className={styles.poi_badge}>POI</span>
                                )}
                            </div>
                            <p className={styles.count}>
                                {type.markers?.filter(markerMatchesSelectedLevel).length ?? 0}
                            </p>
                            {admin && (
                                <div className="flex gap-4 ml-5">
                                    <Button
                                        size={'icon'}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIconTypeToEdit(type);
                                        }}
                                    >
                                        <Pencil className="object-contain" />
                                    </Button>
                                    <Button
                                        size={'icon'}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIconTypeToDelete(type);
                                        }}
                                    >
                                        <Trash className="object-contain" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}

                    {admin && (
                        <div
                            className={clsx(styles.type)}
                            onClick={(e) => {
                                e.stopPropagation();
                                setCreateIconTypeOpen(true);
                            }}
                        >
                            <div className={styles.icon}>
                                <Plus className="object-contain" />
                            </div>
                            <p>Создать тип</p>
                        </div>
                    )}
                </div>
            </div>

            {admin && (
                <CreateOrUpdateIconTypeDialog
                    category_id={category.id}
                    map_id={map_id}
                    open={createIconTypeOpen}
                    onOpenChange={setCreateIconTypeOpen}
                />
            )}

            {iconTypeToEdit && admin && (
                <CreateOrUpdateIconTypeDialog
                    category_id={category.id}
                    map_id={map_id}
                    open={!!iconTypeToEdit}
                    onOpenChange={() => setIconTypeToEdit(null)}
                    icon_type_data={iconTypeToEdit as unknown as GetMapTypeResponseDto}
                />
            )}

            {iconTypeToDelete && admin && (
                <RemoveMapIconDialog id={iconTypeToDelete.id} map_id={map_id} />
            )}
        </div>
    );
};
