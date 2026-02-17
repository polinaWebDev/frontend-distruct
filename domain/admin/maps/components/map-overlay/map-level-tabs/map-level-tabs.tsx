import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapLevelDto } from '@/lib/api_client/gen';
import { cn } from '@/lib/utils';
import { RemoveMapLevelDialog } from '@/domain/admin/maps/dialogs/remove-map-level.dialog';
import { UpdateMapLevelDialog } from '@/domain/admin/maps/dialogs/update-map-level.dialog';

export const MapLevelTabs = ({
    levels,
    selectedLevelId,
    onSelect,
    className,
    inline = false,
    admin = false,
    mapId,
}: {
    levels: MapLevelDto[];
    selectedLevelId?: string;
    onSelect: (levelId: string) => void;
    className?: string;
    inline?: boolean;
    admin?: boolean;
    mapId?: string;
}) => {
    if (!levels.length) return null;

    const sortedLevels = [...levels].sort((a, b) => Number(a.sort_order) - Number(b.sort_order));
    const activeId = selectedLevelId ?? sortedLevels[0]?.id;
    const showAdminActions = admin && !!mapId;

    return (
        <div
            className={cn(
                inline ? 'relative' : 'absolute left-4 top-4 z-[110] pointer-events-auto',
                className
            )}
        >
            <Tabs value={activeId} onValueChange={onSelect}>
                <TabsList className="bg-map-overlay-bg/80 backdrop-blur flex flex-col items-stretch gap-2 h-auto w-fit p-2">
                    {sortedLevels.map((level) => (
                        <div key={level.id} className="flex items-center justify-between gap-2">
                            <TabsTrigger value={level.id}>{level.name}</TabsTrigger>
                            {showAdminActions && (
                                <div className="flex items-center gap-1">
                                    <UpdateMapLevelDialog level={level} map_id={mapId} />
                                    <RemoveMapLevelDialog id={level.id} map_id={mapId} />
                                </div>
                            )}
                        </div>
                    ))}
                </TabsList>
            </Tabs>
        </div>
    );
};
