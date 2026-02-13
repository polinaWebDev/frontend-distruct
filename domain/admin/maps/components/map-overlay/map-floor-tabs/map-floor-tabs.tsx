import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapFloorDto } from '@/lib/api_client/gen';
import { cn } from '@/lib/utils';

export const MapFloorTabs = ({
    floors,
    selectedFloorId,
    onSelect,
    className,
}: {
    floors: MapFloorDto[];
    selectedFloorId?: string;
    onSelect: (floorId: string) => void;
    className?: string;
}) => {
    if (!floors.length) return null;

    const activeId = selectedFloorId ?? floors[0]?.id;

    return (
        <div className={cn('absolute left-4 top-4 z-20', className)}>
            <Tabs value={activeId} onValueChange={onSelect}>
                <TabsList className="bg-map-overlay-bg/80 backdrop-blur">
                    {floors.map((floor) => (
                        <TabsTrigger key={floor.id} value={floor.id}>
                            {floor.name}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>
        </div>
    );
};
