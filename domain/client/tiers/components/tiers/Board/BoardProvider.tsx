import { useState, useCallback, useEffect, useRef } from 'react';
import { BoardContext, type BoardContextValue } from './BoardContext';
import { TierListResponseDto } from '@/lib/api_client/gen';

type BoardProviderProps = {
    initialState: TierListResponseDto;
    onChange?: (next: TierListResponseDto) => void;
    children: React.ReactNode;
    readOnly?: boolean;
};

export function BoardProvider({
    initialState,
    onChange,
    children,
    readOnly = false,
}: BoardProviderProps) {
    const [draft, setDraft] = useState<TierListResponseDto>(initialState);
    const isInternalUpdateRef = useRef(false);

    const normalizeRowOrders = (rows: TierListResponseDto['rows'] = []) => {
        let normalOrder = 1;
        for (const row of rows) {
            if (row.type === 'pool') {
                row.order = 0;
                continue;
            }
            row.order = normalOrder;
            normalOrder += 1;
        }
    };

    const normalizeItemOrders = (items: TierListResponseDto['rows'][number]['items']) => {
        items.forEach((item, index) => {
            item.order = index;
        });
    };

    useEffect(() => {
        if (!isInternalUpdateRef.current) {
            return;
        }
        isInternalUpdateRef.current = false;
        onChange?.(draft);
    }, [draft, onChange]);

    const updateDraft = useCallback(
        (updater: (prev: TierListResponseDto) => TierListResponseDto) => {
            if (readOnly) return;
            isInternalUpdateRef.current = true;
            setDraft((prev) => updater(prev));
        },
        [readOnly]
    );

    const reorderRow = useCallback(
        ({ rowId, direction }: { rowId: string; direction: 'up' | 'down' }) => {
            if (readOnly) return;
            updateDraft((prev) => {
                const next = structuredClone(prev);
                const rows = next.rows ?? [];

                const index = rows.findIndex((r) => r.id === rowId);
                if (index === -1) return prev;

                const targetIndex = direction === 'up' ? index - 1 : index + 1;

                if (targetIndex < 0 || targetIndex >= rows.length) {
                    return prev;
                }

                const [row] = rows.splice(index, 1);
                rows.splice(targetIndex, 0, row);

                normalizeRowOrders(rows);
                return next;
            });
        },
        [readOnly, updateDraft]
    );

    const reorderCard = useCallback<BoardContextValue['reorderCard']>(
        ({ rowId, startIndex, finishIndex }) => {
            if (readOnly) return;
            updateDraft((prev) => {
                const next = structuredClone(prev);
                const row = next.rows!.find((r) => r.id === rowId);
                if (!row) return prev;

                const [card] = row.items.splice(startIndex, 1);
                row.items.splice(finishIndex, 0, card);
                normalizeItemOrders(row.items);

                return next;
            });
        },
        [readOnly, updateDraft]
    );

    const moveCard = useCallback(
        ({
            fromRowId,
            toRowId,
            cardIndex,
            targetIndex,
        }: Parameters<BoardContextValue['moveCard']>[0]) => {
            if (readOnly) return;
            updateDraft((prev) => {
                const next = structuredClone(prev);

                const from = next.rows!.find((r) => r.id === fromRowId);
                const to = next.rows!.find((r) => r.id === toRowId);
                if (!from || !to) return prev;

                const [item] = from.items.splice(cardIndex, 1);
                to.items.splice(targetIndex ?? to.items.length, 0, item);
                normalizeItemOrders(from.items);
                normalizeItemOrders(to.items);

                return next;
            });
        },
        [readOnly, updateDraft]
    );

    const updateRow = useCallback(
        ({ rowId, title, color }: { rowId: string; title: string; color: string }) => {
            if (readOnly) return;
            updateDraft((prev) => {
                const next = structuredClone(prev);
                const row = next.rows?.find((r) => r.id === rowId);
                if (!row || row.type === 'pool') return prev;
                row.title = title;
                row.color = color;
                return next;
            });
        },
        [readOnly, updateDraft]
    );

    const deleteRow = useCallback(
        ({ rowId }: { rowId: string }) => {
            if (readOnly) return;
            updateDraft((prev) => {
                const next = structuredClone(prev);
                const rows = next.rows ?? [];
                const tierRows = rows.filter((row) => row.type !== 'pool');
                if (tierRows.length <= 1) {
                    return prev;
                }
                const index = rows.findIndex((r) => r.id === rowId);
                if (index === -1) return prev;

                const [removed] = rows.splice(index, 1);
                if (!removed || removed.type === 'pool') {
                    return prev;
                }

                const poolRow = rows.find((r) => r.type === 'pool');
                if (poolRow && removed.items.length > 0) {
                    const startOrder = poolRow.items.length;
                    poolRow.items.push(
                        ...removed.items.map((item, itemIndex) => ({
                            ...item,
                            order: startOrder + itemIndex,
                        }))
                    );
                }

                normalizeRowOrders(rows);
                return next;
            });
        },
        [readOnly, updateDraft]
    );

    const addRow = useCallback(() => {
        if (readOnly) return;
        updateDraft((prev) => {
            const next = structuredClone(prev);

            const rows = next.rows ?? [];

            rows.push({
                id: crypto.randomUUID(),
                title: 'New tier',
                color: '#444444',
                items: [],
                order: rows.length,
                type: 'tier',
            });

            normalizeRowOrders(rows);
            next.rows = rows;
            return next;
        });
    }, [readOnly, updateDraft]);

    return (
        <BoardContext.Provider
            value={{
                rows: draft.rows ?? [],
                readOnly,
                reorderRow: reorderRow,
                reorderCard,
                moveCard,
                addRow,
                updateRow,
                deleteRow,
            }}
        >
            {children}
        </BoardContext.Provider>
    );
}
