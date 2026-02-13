'use client';
import { TabsContent } from '@/components/ui/tabs';
import { BoardProvider } from '@/domain/client/tiers/components/tiers/Board/BoardProvider';
import dynamic from 'next/dynamic';

const Board = dynamic(
    () => import('@/domain/client/tiers/components/tiers/Board/Board').then((m) => m.Board),
    { ssr: false }
);
import {
    TierListResponseDto,
    tiersControllerUpdateTierList,
    tiersControllerUpdateTierListPrivacy,
} from '@/lib/api_client/gen';
import { getPublicClient } from '@/lib/api_client/public_client';
import { useState, type ReactNode, useLayoutEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { TierListActionsProvider } from './TierListActionsContext';

const TierList = ({
    tierList,
    actions,
    readOnly = false,
    useTabsContent = true,
}: {
    tierList: TierListResponseDto;
    actions?: ReactNode;
    readOnly?: boolean;
    useTabsContent?: boolean;
}) => {
    const [saved, setSaved] = useState(tierList);
    const [draft, setDraft] = useState(tierList);
    const [isSaving, setIsSaving] = useState(false);
    const [actionsHost, setActionsHost] = useState<HTMLElement | null>(null);
    const hasChanges = useMemo(
        () => JSON.stringify(saved) !== JSON.stringify(draft),
        [saved, draft]
    );

    // Ререндер гарантированно один, controlled mount update
    useLayoutEffect(() => {
        setActionsHost(document.getElementById('tier-actions-slot'));
    }, []);

    const save = async () => {
        if (isSaving) return;
        setIsSaving(true);
        try {
            const savedRowIds = new Set((saved.rows ?? []).map((row) => row.id));
            const cleanedRows = (draft.rows ?? []).map((row) => {
                if (!row.id || savedRowIds.has(row.id)) {
                    return row;
                }
                const { id, ...rest } = row;
                return rest;
            });
            const response = await tiersControllerUpdateTierList({
                path: {
                    tierListId: tierList.id,
                },
                body: {
                    ...draft,
                    rows: cleanedRows,
                },
                client: getPublicClient(),
            });
            if (response.data) {
                setSaved(response.data);
                setDraft(response.data);
            }
        } finally {
            setIsSaving(false);
        }
    };

    const updatePrivacy = async (nextIsPublic: boolean) => {
        if (isSaving) return;
        setIsSaving(true);
        try {
            const response = await tiersControllerUpdateTierListPrivacy({
                path: {
                    tierListId: String(tierList.id),
                },
                body: {
                    isPublic: nextIsPublic,
                },
                client: getPublicClient(),
            });
            if (response.data) {
                setSaved(response.data);
                setDraft(response.data);
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <TierListActionsProvider
            value={{
                saved,
                draft,
                setDraft,
                save,
                updatePrivacy,
                resetDraft: () => setDraft(saved),
                isSaving,
                hasChanges,
            }}
        >
            {actionsHost && actions ? createPortal(actions, actionsHost) : null}
            {useTabsContent ? (
                <TabsContent key={tierList.id} value={tierList.categoryId}>
                    <BoardProvider
                        key={draft.id + JSON.stringify(draft.updatedAt ?? '')}
                        initialState={draft}
                        onChange={(next: TierListResponseDto) =>
                            setDraft((prev) => ({
                                ...prev,
                                ...next,
                            }))
                        }
                        readOnly={readOnly}
                    >
                        <Board tierListId={tierList.id} readOnly={readOnly} />
                    </BoardProvider>
                </TabsContent>
            ) : (
                <BoardProvider
                    key={draft.id + JSON.stringify(draft.updatedAt ?? '')}
                    initialState={draft}
                    onChange={(next: TierListResponseDto) =>
                        setDraft((prev) => ({
                            ...prev,
                            ...next,
                        }))
                    }
                    readOnly={readOnly}
                >
                    <Board tierListId={tierList.id} readOnly={readOnly} />
                </BoardProvider>
            )}
        </TierListActionsProvider>
    );
};

export default TierList;
