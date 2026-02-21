import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapLevelDto } from '@/lib/api_client/gen';
import { cn } from '@/lib/utils';

export const MapLevelTabs = ({
    levels,
    selectedLevelId,
    onSelect,
    className,
    inline = false,
}: {
    levels: MapLevelDto[];
    selectedLevelId?: string;
    onSelect: (levelId: string) => void;
    className?: string;
    inline?: boolean;
}) => {
    if (!levels.length) return null;

    const sortedLevels = [...levels].sort((a, b) => Number(a.sort_order) - Number(b.sort_order));
    const activeId = selectedLevelId ?? sortedLevels[0]?.id;

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
                        <TabsTrigger
                            key={level.id}
                            value={level.id}
                            className="justify-start gap-2"
                        >
                            <span
                                className="inline-block h-2.5 w-2.5 rounded-full border border-white/30"
                                style={{ backgroundColor: level.color || '#9CA3AF' }}
                            />
                            {level.name}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>
        </div>
    );
};
