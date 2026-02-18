import { Item } from '@/domain/client/tiers/components/tiers/Board/Item';
import { useBoard } from '@/domain/client/tiers/components/tiers/Board/BoardContext';
import { RowResponseDto } from '@/lib/api_client/gen';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import styles from './Pool.module.css';

export function Pool({ row }: { row: RowResponseDto }) {
    const board = useBoard();
    const { setNodeRef, isOver } = useDroppable({
        id: `row:${row.id}`,
        data: { type: 'row', rowId: row.id },
        disabled: board.readOnly,
    });
    return (
        <div className={styles.pool} ref={setNodeRef} data-over={isOver}>
            <SortableContext
                items={row.items.map((item) => `item:${item.id}`)}
                strategy={verticalListSortingStrategy}
            >
                <div className={styles.pool_items}>
                    {row.items.map((item) => (
                        <Item key={item.id} item={item} rowId={row.id} />
                    ))}
                </div>
            </SortableContext>
        </div>
    );
}
