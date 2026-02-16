'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getPublicClient } from '@/lib/api_client/public_client';
import {
    friendsControllerAcceptMutation,
    friendsControllerCancelMutation,
    friendsControllerIncomingOptions,
    friendsControllerOutgoingOptions,
    friendsControllerRejectMutation,
} from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { getFileUrl } from '@/lib/utils';
import { toast } from 'sonner';
import styles from './requests-dialog.module.css';
import { Tabs, TabsContent, TabsList } from '@/components/ui/tabs';
import { AppDialogContent, AppDialog } from '@/ui/AppDialog/app-dialog';
import AppTabsTrigger from '@/ui/AppTabsTrigger/AppTabsTrigger';
import { UserPlus2 } from 'lucide-react';

export const RequestsDialog = ({ incomingCount }: { incomingCount: number }) => {
    const client = getPublicClient();
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);

    const { data: incomingRequests } = useQuery({
        ...friendsControllerIncomingOptions({
            client,
        }),
        retry: false,
    });

    const { data: outgoingRequests } = useQuery({
        ...friendsControllerOutgoingOptions({
            client,
        }),
        retry: false,
    });

    const acceptRequestMutation = useMutation({
        ...friendsControllerAcceptMutation({
            client,
        }),
        onSuccess: () => {
            toast.success('Запрос принят');
            queryClient.invalidateQueries();
        },
        onError: () => {
            toast.error('Не удалось принять запрос');
        },
    });

    const rejectRequestMutation = useMutation({
        ...friendsControllerRejectMutation({
            client,
        }),
        onSuccess: () => {
            toast.success('Запрос отклонен');
            queryClient.invalidateQueries();
        },
        onError: () => {
            toast.error('Не удалось отклонить запрос');
        },
    });

    const cancelRequestMutation = useMutation({
        ...friendsControllerCancelMutation({
            client,
        }),
        onSuccess: () => {
            toast.success('Запрос отменен');
            queryClient.invalidateQueries();
        },
        onError: () => {
            toast.error('Не удалось отменить запрос');
        },
    });

    const incoming = useMemo(() => incomingRequests?.requests ?? [], [incomingRequests]);
    const outgoing = useMemo(() => outgoingRequests?.requests ?? [], [outgoingRequests]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className={`${styles.triggerBtn} ${incomingCount > 0 ? styles.hasIncoming : ''}`}
                onClick={() => setOpen(true)}
                aria-label="Запросы в друзья"
                title="Запросы в друзья"
            >
                <UserPlus2 size={18} />
                <span className={styles.triggerLabel}>Запросы</span>
            </Button>
            <AppDialog title="Запросы в друзья" onClose={() => setOpen(false)}>
                <AppDialogContent onClose={() => setOpen(false)} className={styles.dialogContent}>
                    <h2 className={styles.title}>Запросы в друзья</h2>
                    <div className={styles.content}>
                        <Tabs defaultValue="incoming" className={styles.tabsRoot}>
                            <TabsList className={styles.tabsList}>
                                <AppTabsTrigger value="incoming" className={styles.tabTrigger}>
                                    <span className={styles.tabLabel}>
                                        Входящие
                                        {incoming.length > 0 && (
                                            <span className={styles.tabBadge}>
                                                {incoming.length > 9 ? '9+' : incoming.length}
                                            </span>
                                        )}
                                    </span>
                                </AppTabsTrigger>
                                <AppTabsTrigger value="outgoing" className={styles.tabTrigger}>
                                    Исходящие
                                </AppTabsTrigger>
                            </TabsList>
                            <TabsContent value="incoming">
                                <div className={styles.list}>
                                    {incoming.length === 0 ? (
                                        <div className={styles.empty}>Нет входящих запросов</div>
                                    ) : (
                                        incoming.map((request) => (
                                            <div className={styles.item} key={request.id}>
                                                <div className={styles.user}>
                                                    {request.user.avatar_url ? (
                                                        <img
                                                            src={getFileUrl(
                                                                request.user.avatar_url
                                                            )}
                                                            alt={request.user.username}
                                                            className={styles.avatar}
                                                            crossOrigin="anonymous"
                                                        />
                                                    ) : (
                                                        <div className={styles.placeholder}>
                                                            {request.user.username
                                                                .slice(0, 2)
                                                                .toUpperCase()}
                                                        </div>
                                                    )}
                                                    <p className={styles.username}>
                                                        {request.user.username}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={() =>
                                                            acceptRequestMutation.mutate({
                                                                body: { requestId: request.id },
                                                            })
                                                        }
                                                        disabled={acceptRequestMutation.isPending}
                                                    >
                                                        Принять
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            rejectRequestMutation.mutate({
                                                                body: { requestId: request.id },
                                                            })
                                                        }
                                                        disabled={rejectRequestMutation.isPending}
                                                    >
                                                        Отклонить
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </TabsContent>
                            <TabsContent value="outgoing">
                                <div className={styles.list}>
                                    {outgoing.length === 0 ? (
                                        <div className={styles.empty}>Нет исходящих запросов</div>
                                    ) : (
                                        outgoing.map((request) => (
                                            <div className={styles.item} key={request.id}>
                                                <div className={styles.user}>
                                                    {request.user.avatar_url ? (
                                                        <img
                                                            src={getFileUrl(
                                                                request.user.avatar_url
                                                            )}
                                                            alt={request.user.username}
                                                            className={styles.avatar}
                                                            crossOrigin="anonymous"
                                                        />
                                                    ) : (
                                                        <div className={styles.placeholder}>
                                                            {request.user.username
                                                                .slice(0, 2)
                                                                .toUpperCase()}
                                                        </div>
                                                    )}
                                                    <p className={styles.username}>
                                                        {request.user.username}
                                                    </p>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        cancelRequestMutation.mutate({
                                                            body: { requestId: request.id },
                                                        })
                                                    }
                                                    disabled={cancelRequestMutation.isPending}
                                                >
                                                    Отменить
                                                </Button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </AppDialogContent>
            </AppDialog>
        </Dialog>
    );
};
