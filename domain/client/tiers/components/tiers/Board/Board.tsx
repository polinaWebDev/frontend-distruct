'use client';
import { useBoard } from '@/domain/client/tiers/components/tiers/Board/BoardContext';
import { Row } from '@/domain/client/tiers/components/tiers/Board/Row';
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    DragOverEvent,
} from '@dnd-kit/core';
import { useMemo, useState } from 'react';
import { Pool } from '@/domain/client/tiers/components/tiers/Board/Pool';
import { ItemOverlay } from '@/domain/client/tiers/components/tiers/Board/Item';
import styles from './Board.module.css';
import { AppBtn } from '@/ui/SmallBtn/AppBtn';

type BoardProps = {
    tierListId: string;
    readOnly?: boolean;
};

export function Board({ tierListId, readOnly = false }: BoardProps) {
    const board = useBoard();
    const [activeId, setActiveId] = useState<string | null>(null);

    const poolRow = board.rows.find((row) => row.type === 'pool');
    const tierRows = board.rows.filter((row) => row.type !== 'pool');

    const activeItem = useMemo(() => {
        if (!activeId) return null;
        for (const row of board.rows) {
            const match = row.items.find((item) => item.id === activeId);
            if (match) return match;
        }
        return null;
    }, [activeId, board.rows]);

    const findRowByItemId = (itemId: string) => {
        return board.rows.find((row) => row.items.some((item) => item.id === itemId));
    };

    const handleDragStart = (event: DragStartEvent) => {
        if (readOnly) return;
        setActiveId(event.active.id as string);
    };

    const getDragContext = (event: {
        active: DragStartEvent['active'];
        over?: DragOverEvent['over'];
    }) => {
        const { active, over } = event;
        if (!over) return null;

        const activeRow = findRowByItemId(active.id as string);
        const overId = over.id as string;
        const overType = over.data.current?.type as string | undefined;
        const overDataRowId = over.data.current?.rowId as string | undefined;

        const overRowFromRowId = board.rows.find((row) => row.id === overDataRowId);
        const overRowFromOverId = board.rows.find((row) => row.id === overId);
        const overRowFromItemId = findRowByItemId(overId);
        const overRowId = overRowFromRowId?.id ?? overRowFromOverId?.id ?? overRowFromItemId?.id;

        if (!activeRow || !overRowId) return null;

        const overRow = board.rows.find((row) => row.id === overRowId);
        if (!overRow) return null;

        const activeIndex = activeRow.items.findIndex((item) => item.id === active.id);
        if (activeIndex === -1) return null;

        const overItemId =
            overType === 'item' || (overRowFromItemId && !overRowFromOverId) ? overId : null;
        const targetIndex = overItemId
            ? overRow.items.findIndex((item) => item.id === overItemId)
            : overRow.items.length;

        return {
            activeRow,
            overRow,
            activeIndex,
            overItemId,
            targetIndex,
        };
    };

    const handleDragOver = (event: DragOverEvent) => {
        if (readOnly) return;
        const ctx = getDragContext(event);
        if (!ctx) return;

        const { activeRow, overRow, activeIndex, overItemId, targetIndex } = ctx;

        if (activeRow.id === overRow.id) {
            if (overItemId && targetIndex !== -1 && targetIndex !== activeIndex) {
                board.reorderCard({
                    rowId: activeRow.id,
                    startIndex: activeIndex,
                    finishIndex: targetIndex,
                });
            }
            return;
        }

        board.moveCard({
            fromRowId: activeRow.id,
            toRowId: overRow.id,
            cardIndex: activeIndex,
            targetIndex: targetIndex === -1 ? undefined : targetIndex,
        });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        if (readOnly) {
            setActiveId(null);
            return;
        }
        setActiveId(null);
        const ctx = getDragContext(event);
        if (!ctx) return;

        const { activeRow, overRow, activeIndex, overItemId, targetIndex } = ctx;

        if (activeRow.id === overRow.id) {
            const finishIndex = overItemId ? targetIndex : Math.max(0, overRow.items.length - 1);
            if (finishIndex === -1 || finishIndex === activeIndex) return;
            board.reorderCard({ rowId: activeRow.id, startIndex: activeIndex, finishIndex });
            return;
        }

        board.moveCard({
            fromRowId: activeRow.id,
            toRowId: overRow.id,
            cardIndex: activeIndex,
            targetIndex: targetIndex === -1 ? undefined : targetIndex,
        });
    };

    const handleDragCancel = () => {
        setActiveId(null);
    };

    return (
        <>
            <DndContext
                onDragStart={readOnly ? undefined : handleDragStart}
                onDragOver={readOnly ? undefined : handleDragOver}
                onDragEnd={readOnly ? undefined : handleDragEnd}
                onDragCancel={readOnly ? undefined : handleDragCancel}
            >
                <div className="board" data-tier-list-id={tierListId}>
                    <div className={styles.row_wrap}>
                        {tierRows.map((row) => (
                            <Row key={row.id} row={row} />
                        ))}
                        {!board.readOnly ? (
                            <AppBtn
                                text="+ Добавить"
                                style="outline_brand"
                                className="max-w-[150px]"
                                onClick={board.addRow}
                            />
                        ) : null}
                    </div>
                    {poolRow && <Pool row={poolRow} />}
                </div>
                {!readOnly ? (
                    <DragOverlay adjustScale={false}>
                        {activeItem ? <ItemOverlay item={activeItem} /> : null}
                    </DragOverlay>
                ) : null}
            </DndContext>
        </>
    );
}
