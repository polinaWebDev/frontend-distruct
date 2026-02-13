import { createContext, useContext } from 'react';
import { RowResponseDto } from '@/lib/api_client/gen';

export type BoardContextValue = {
    rows: RowResponseDto[];
    readOnly: boolean;

    reorderRow(args: { rowId: string; direction: 'up' | 'down' }): void;

    reorderCard(args: { rowId: string; startIndex: number; finishIndex: number }): void;

    moveCard(args: {
        fromRowId: string;
        toRowId: string;
        cardIndex: number;
        targetIndex?: number;
    }): void;

    updateRow(args: { rowId: string; title: string; color: string }): void;

    deleteRow(args: { rowId: string }): void;

    addRow(): void;
};

export const BoardContext = createContext<BoardContextValue | null>(null);

export function useBoard() {
    const ctx = useContext(BoardContext);
    if (!ctx) {
        throw new Error('useBoard must be used inside BoardProvider');
    }
    return ctx;
}
