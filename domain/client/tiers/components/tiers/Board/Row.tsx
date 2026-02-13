import { hexToRgba } from '@/lib/utils';
import styles from './Row.module.css';
import clsx from 'clsx';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Item } from './Item';
import { useDroppable } from '@dnd-kit/core';
import { RowResponseDto } from '@/lib/api_client/gen';
import RowActions from '@/domain/client/tiers/components/tiers/Board/RowActions';
import { useBoard } from '@/domain/client/tiers/components/tiers/Board/BoardContext';

const LUMINANCE_THRESHOLD = 0.5;

const getLuminance = (hex: string) => {
    const normalized = hex.replace('#', '');
    if (normalized.length !== 6) return 0;
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
};

export function Row({ row }: { row: RowResponseDto }) {
    const board = useBoard();
    const { setNodeRef, isOver } = useDroppable({
        id: row.id,
        data: { type: 'row', rowId: row.id },
        disabled: board.readOnly,
    });

    const BLACK = '#000000';
    const WHITE = '#ffffff';

    const rowLabelTextColor = getLuminance(row.color) > LUMINANCE_THRESHOLD ? BLACK : WHITE;

    return (
        <>
            <div
                className={clsx(styles.row)}
                style={{
                    ['--row-border-color' as string]: row.color,
                    ['--row-bg-color' as string]: hexToRgba(row.color, 0.15),
                }}
            >
                <div
                    className={styles.row_label}
                    style={{
                        backgroundColor: row.color,
                        color: rowLabelTextColor,
                    }}
                >
                    <span className={styles.row_label_text}>{row.title}</span>
                </div>
                <div className={styles.items_zone} ref={setNodeRef} data-over={isOver}>
                    <SortableContext
                        items={row.items.map((item) => item.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className={styles.items_list}>
                            {row.items.length > 0 ? (
                                row.items.map((item) => (
                                    <Item key={item.id} item={item} rowId={row.id} />
                                ))
                            ) : (
                                <span className={styles.row_placeholder}>
                                    Перетащите предметы сюда
                                </span>
                            )}
                        </div>
                    </SortableContext>
                </div>
                {!board.readOnly ? <RowActions rowId={row.id} /> : null}
            </div>
        </>
    );
}
