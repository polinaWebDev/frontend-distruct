import { Item } from '@/domain/client/tiers/components/tiers/Board/Item';
import { useBoard } from '@/domain/client/tiers/components/tiers/Board/BoardContext';
import { useGearById } from '@/domain/client/tiers/components/tiers/GearContext';
import { ItemResponseDto, PublicGearDto, RowResponseDto } from '@/lib/api_client/gen';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useMemo, useState } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import styles from './Pool.module.css';

type TypeOption = {
    id: string;
    name: string;
};

function getTypeOption(gear: PublicGearDto | undefined): TypeOption | null {
    const typeId = gear?.type?.id;
    if (!typeId) return null;
    return {
        id: typeId,
        name: gear.type?.name?.trim() || typeId,
    };
}

export function Pool({ row, typeOptions }: { row: RowResponseDto; typeOptions: TypeOption[] }) {
    const board = useBoard();
    const gearById = useGearById();
    const [selectedTypeId, setSelectedTypeId] = useState<string>('all');
    const isPoolEmpty = row.items.length === 0;
    const { setNodeRef, isOver } = useDroppable({
        id: `row:${row.id}`,
        data: { type: 'row', rowId: row.id },
        disabled: board.readOnly,
    });

    const sortedItems = useMemo(() => {
        if (selectedTypeId === 'all') return row.items;
        const matched: ItemResponseDto[] = [];
        const rest: ItemResponseDto[] = [];
        row.items.forEach((item) => {
            const option = getTypeOption(gearById[item.gearId]);
            if (option?.id === selectedTypeId) {
                matched.push(item);
                return;
            }
            rest.push(item);
        });
        return [...matched, ...rest];
    }, [gearById, row.items, selectedTypeId]);

    return (
        <div className={styles.pool} ref={setNodeRef} data-over={isOver}>
            {typeOptions.length > 0 ? (
                <div className={styles.controls}>
                    <Select value={selectedTypeId} onValueChange={setSelectedTypeId}>
                        <SelectTrigger
                            className={`${styles.typeSelect} rounded-xl border-[#34363d] bg-[#1b1d24] px-3 py-2 text-sm font-medium text-muted-foreground transition-all data-[state=open]:border-ded data-[state=open]:text-primary-foreground data-[state=open]:shadow`}
                        >
                            <SelectValue placeholder="Фильтр по типу" />
                        </SelectTrigger>
                        <SelectContent className="border-[#34363d] bg-[#1b1d24]">
                            <SelectItem value="all">Все типы</SelectItem>
                            {typeOptions.map((type) => (
                                <SelectItem key={type.id} value={type.id}>
                                    {type.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            ) : null}
            <SortableContext
                items={sortedItems.map((item) => `item:${item.id}`)}
                strategy={verticalListSortingStrategy}
            >
                <div className={styles.pool_items}>
                    {isPoolEmpty ? (
                        <p className={styles.empty_state}>Предметы не найдены</p>
                    ) : (
                        sortedItems.map((item) => <Item key={item.id} item={item} rowId={row.id} />)
                    )}
                </div>
            </SortableContext>
        </div>
    );
}
