'use client';
import { useBoard } from '@/domain/client/tiers/components/tiers/Board/BoardContext';
import { Row } from '@/domain/client/tiers/components/tiers/Board/Row';
import { useGearById } from '@/domain/client/tiers/components/tiers/GearContext';
import { PublicGearDto } from '@/lib/api_client/gen';
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    DragOverEvent,
} from '@dnd-kit/core';
import { useMemo, useRef, useState } from 'react';
import { Pool } from '@/domain/client/tiers/components/tiers/Board/Pool';
import { ItemOverlay } from '@/domain/client/tiers/components/tiers/Board/Item';
import styles from './Board.module.css';
import { AppBtn } from '@/ui/SmallBtn/AppBtn';

type BoardProps = {
    tierListId: string;
    readOnly?: boolean;
};

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

export function Board({ tierListId, readOnly = false }: BoardProps) {
    const board = useBoard();
    const gearById = useGearById();
    const [activeItemId, setActiveItemId] = useState<string | null>(null);
    const lastDragOverActionRef = useRef<string | null>(null);
    const logDnd = (...args: unknown[]) => {
        console.info('[tiers-dnd]', ...args);
    };

    const poolRow = board.rows.find((row) => row.type === 'pool');
    const tierRows = board.rows.filter((row) => row.type !== 'pool');
    const typeOptions = useMemo(() => {
        const byId = new Map<string, TypeOption>();
        for (const row of board.rows) {
            for (const item of row.items) {
                const option = getTypeOption(gearById[item.gearId]);
                if (option && !byId.has(option.id)) {
                    byId.set(option.id, option);
                }
            }
        }
        return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name, 'ru'));
    }, [board.rows, gearById]);

    const activeItem = useMemo(() => {
        if (!activeItemId) return null;
        for (const row of board.rows) {
            const match = row.items.find((item) => String(item.id) === activeItemId);
            if (match) return match;
        }
        return null;
    }, [activeItemId, board.rows]);

    const findRowByItemId = (itemId: string) => {
        return board.rows.find((row) => row.items.some((item) => String(item.id) === itemId));
    };

    const handleDragStart = (event: DragStartEvent) => {
        if (readOnly) return;
        lastDragOverActionRef.current = null;
        const fromData = event.active.data.current?.itemId as string | undefined;
        if (fromData) {
            setActiveItemId(fromData);
            logDnd('dragStart', {
                activeId: String(event.active.id),
                itemId: fromData,
                activeData: event.active.data.current,
            });
            return;
        }
        const activeDndId = String(event.active.id);
        const parsedItemId = activeDndId.startsWith('item:') ? activeDndId.slice(5) : activeDndId;
        setActiveItemId(parsedItemId);
        logDnd('dragStart', {
            activeId: activeDndId,
            itemId: parsedItemId,
            activeData: event.active.data.current,
        });
    };

    const getDragContext = (event: {
        active: DragStartEvent['active'];
        over?: DragOverEvent['over'];
    }) => {
        const { active, over } = event;
        if (!over) {
            logDnd('getDragContext: no-over', {
                activeId: String(active.id),
                activeData: active.data.current,
            });
            return null;
        }

        const activeItemId =
            (active.data.current?.itemId as string | undefined) ??
            (String(active.id).startsWith('item:')
                ? String(active.id).slice(5)
                : String(active.id));
        const activeRow = findRowByItemId(activeItemId);
        const overId = String(over.id);
        const overType = over.data.current?.type as string | undefined;
        const overDataRowId = over.data.current?.rowId as string | undefined;
        const overDataItemId = over.data.current?.itemId as string | undefined;

        const overRowIdFromDndId = overId.startsWith('row:') ? overId.slice(4) : undefined;
        const overItemIdFromDndId = overId.startsWith('item:') ? overId.slice(5) : undefined;

        const overRowFromRowId = board.rows.find((row) => String(row.id) === overDataRowId);
        const overRowFromOverId = board.rows.find(
            (row) => String(row.id) === overRowIdFromDndId || String(row.id) === overId
        );
        const overRowFromItemId = findRowByItemId(overDataItemId ?? overItemIdFromDndId ?? overId);
        const overRowId = overRowFromRowId?.id ?? overRowFromOverId?.id ?? overRowFromItemId?.id;

        if (!activeRow || !overRowId) {
            logDnd('getDragContext: no-row-match', {
                activeId: String(active.id),
                activeItemId,
                overId,
                overType,
                overData: over.data.current,
                overDataRowId,
                overDataItemId,
                overRowIdFromDndId,
                overItemIdFromDndId,
            });
            return null;
        }

        const overRow = board.rows.find((row) => String(row.id) === String(overRowId));
        if (!overRow) {
            logDnd('getDragContext: over-row-not-found', { overRowId, overId, overType });
            return null;
        }

        const activeIndex = activeRow.items.findIndex((item) => String(item.id) === activeItemId);
        if (activeIndex === -1) {
            logDnd('getDragContext: active-index-not-found', {
                activeItemId,
                activeRowId: activeRow.id,
                activeRowItems: activeRow.items.map((item) => String(item.id)),
            });
            return null;
        }

        const overItemId =
            overType === 'item' || (overRowFromItemId && !overRowFromOverId)
                ? (overDataItemId ?? overItemIdFromDndId ?? overId)
                : null;
        const targetIndex = overItemId
            ? overRow.items.findIndex((item) => String(item.id) === overItemId)
            : overRow.items.length;

        logDnd('getDragContext: resolved', {
            activeId: String(active.id),
            activeItemId,
            activeRowId: activeRow.id,
            overId,
            overType,
            overData: over.data.current,
            overRowId: overRow.id,
            overItemId,
            targetIndex,
        });

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
        if (!ctx) {
            logDnd('dragOver: skipped (no context)');
            return;
        }

        const { activeRow, overRow, activeIndex, overItemId, targetIndex } = ctx;
        const dragOverSignature = [
            String(event.active.id),
            String(activeRow.id),
            String(overRow.id),
            String(activeIndex),
            overItemId ?? 'none',
            String(targetIndex),
        ].join('|');

        if (lastDragOverActionRef.current === dragOverSignature) {
            return;
        }

        if (activeRow.id === overRow.id) {
            if (overItemId && targetIndex !== -1 && targetIndex !== activeIndex) {
                lastDragOverActionRef.current = dragOverSignature;
                logDnd('dragOver: reorder', {
                    rowId: activeRow.id,
                    startIndex: activeIndex,
                    finishIndex: targetIndex,
                });
                board.reorderCard({
                    rowId: activeRow.id,
                    startIndex: activeIndex,
                    finishIndex: targetIndex,
                });
            }
            return;
        }

        lastDragOverActionRef.current = dragOverSignature;
        logDnd('dragOver: move', {
            fromRowId: activeRow.id,
            toRowId: overRow.id,
            cardIndex: activeIndex,
            targetIndex: targetIndex === -1 ? undefined : targetIndex,
        });
        board.moveCard({
            fromRowId: activeRow.id,
            toRowId: overRow.id,
            cardIndex: activeIndex,
            targetIndex: targetIndex === -1 ? undefined : targetIndex,
        });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        if (readOnly) {
            setActiveItemId(null);
            lastDragOverActionRef.current = null;
            return;
        }
        setActiveItemId(null);
        lastDragOverActionRef.current = null;
        const ctx = getDragContext(event);
        if (!ctx) {
            logDnd('dragEnd: skipped (no context)');
            return;
        }

        const { activeRow, overRow, activeIndex, overItemId, targetIndex } = ctx;

        if (activeRow.id === overRow.id) {
            const finishIndex = overItemId ? targetIndex : Math.max(0, overRow.items.length - 1);
            if (finishIndex === -1 || finishIndex === activeIndex) return;
            logDnd('dragEnd: reorder', {
                rowId: activeRow.id,
                startIndex: activeIndex,
                finishIndex,
            });
            board.reorderCard({ rowId: activeRow.id, startIndex: activeIndex, finishIndex });
            return;
        }

        logDnd('dragEnd: move', {
            fromRowId: activeRow.id,
            toRowId: overRow.id,
            cardIndex: activeIndex,
            targetIndex: targetIndex === -1 ? undefined : targetIndex,
        });
        board.moveCard({
            fromRowId: activeRow.id,
            toRowId: overRow.id,
            cardIndex: activeIndex,
            targetIndex: targetIndex === -1 ? undefined : targetIndex,
        });
    };

    const handleDragCancel = () => {
        setActiveItemId(null);
        lastDragOverActionRef.current = null;
        logDnd('dragCancel');
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
                    {!readOnly && poolRow ? <Pool row={poolRow} typeOptions={typeOptions} /> : null}
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
