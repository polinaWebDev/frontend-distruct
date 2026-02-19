import { Item } from '@/domain/client/tiers/components/tiers/Board/Item';
import { useBoard } from '@/domain/client/tiers/components/tiers/Board/BoardContext';
import { useGearById } from '@/domain/client/tiers/components/tiers/GearContext';
import { ItemResponseDto, PublicGearDto, RowResponseDto } from '@/lib/api_client/gen';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useMemo, useState } from 'react';
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

export function Pool({
    row,
    typeOptions,
    previewIndex = null,
}: {
    row: RowResponseDto;
    typeOptions: TypeOption[];
    previewIndex?: number | null;
}) {
    const board = useBoard();
    const gearById = useGearById();
    const [selectedTypeId, setSelectedTypeId] = useState<string>('all');
    const availableTypeIds = useMemo(
        () => new Set(typeOptions.map((type) => type.id)),
        [typeOptions]
    );
    const effectiveSelectedTypeId =
        selectedTypeId === 'all' || availableTypeIds.has(selectedTypeId) ? selectedTypeId : 'all';
    const isPoolEmpty = row.items.length === 0;
    const { setNodeRef, isOver } = useDroppable({
        id: `row:${row.id}`,
        data: { type: 'row', rowId: row.id },
        disabled: board.readOnly,
    });

    const sortedItems = useMemo(() => {
        if (effectiveSelectedTypeId === 'all') return row.items;
        const matched: ItemResponseDto[] = [];
        const rest: ItemResponseDto[] = [];
        row.items.forEach((item) => {
            const option = getTypeOption(gearById[item.gearId]);
            if (option?.id === effectiveSelectedTypeId) {
                matched.push(item);
                return;
            }
            rest.push(item);
        });
        return [...matched, ...rest];
    }, [effectiveSelectedTypeId, gearById, row.items]);

    return (
        <div className={styles.pool} ref={setNodeRef} data-over={isOver}>
            {typeOptions.length > 0 ? (
                <div className={styles.controls}>
                    <select
                        className={`${styles.typeSelect} rounded-xl border border-[#34363d] bg-[#1b1d24] px-3 py-2 text-sm font-medium text-muted-foreground transition-all focus:border-ded focus:text-primary-foreground focus:shadow focus:outline-none`}
                        value={effectiveSelectedTypeId}
                        onChange={(event) => {
                            const nextValue = event.target.value;
                            setSelectedTypeId(
                                nextValue === 'all' || availableTypeIds.has(nextValue)
                                    ? nextValue
                                    : 'all'
                            );
                        }}
                    >
                        <option value="all">Все типы</option>
                        {typeOptions.map((type) => (
                            <option key={type.id} value={type.id}>
                                {type.name}
                            </option>
                        ))}
                    </select>
                </div>
            ) : null}
            <SortableContext
                items={sortedItems.map((item) => `item:${item.id}`)}
                strategy={verticalListSortingStrategy}
            >
                <div className={styles.pool_items}>
                    {isPoolEmpty ? (
                        <>
                            {previewIndex !== null ? (
                                <span className={styles.preview_slot} aria-hidden="true" />
                            ) : null}
                            <p className={styles.empty_state}>Предметы не найдены</p>
                        </>
                    ) : (
                        <>
                            {sortedItems.map((item, index) => (
                                <div key={item.id} className={styles.item_slot}>
                                    {previewIndex === index ? (
                                        <span className={styles.preview_slot} aria-hidden="true" />
                                    ) : null}
                                    <Item item={item} rowId={row.id} />
                                </div>
                            ))}
                            {previewIndex !== null && previewIndex >= sortedItems.length ? (
                                <span className={styles.preview_slot} aria-hidden="true" />
                            ) : null}
                        </>
                    )}
                </div>
            </SortableContext>
        </div>
    );
}
