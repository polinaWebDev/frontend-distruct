import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapFloorDto } from '@/lib/api_client/gen';
import { cn } from '@/lib/utils';
import { RemoveMapFloorDialog } from '@/domain/admin/maps/dialogs/remove-map-floor.dialog';
import { UpdateMapFloorDialog } from '@/domain/admin/maps/dialogs/update-map-floor.dialog';

export const MapFloorTabs = ({
    floors,
    selectedFloorId,
    onSelect,
    className,
    inline = false,
    admin = false,
    mapId,
}: {
    floors: MapFloorDto[];
    selectedFloorId?: string;
    onSelect: (floorId: string) => void;
    className?: string;
    inline?: boolean;
    admin?: boolean;
    mapId?: string;
}) => {
    if (!floors.length) return null;

    const sortedFloors = [...floors].sort((a, b) => Number(a.level) - Number(b.level));
    const activeId = selectedFloorId ?? sortedFloors[0]?.id;
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
                    {sortedFloors.map((floor) => (
                        <div key={floor.id} className="flex items-center justify-between gap-2">
                            <TabsTrigger value={floor.id}>{floor.name}</TabsTrigger>
                            {showAdminActions && (
                                <div className="flex items-center gap-1">
                                    <UpdateMapFloorDialog floor={floor} map_id={mapId} />
                                    <RemoveMapFloorDialog id={floor.id} map_id={mapId} />
                                </div>
                            )}
                        </div>
                    ))}
                </TabsList>
            </Tabs>
        </div>
    );
};
