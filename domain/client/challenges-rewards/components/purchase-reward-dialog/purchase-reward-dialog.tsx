import { AppDialogContent, AppDialog } from '@/ui/AppDialog/app-dialog';
import styles from './purchase-reward-dialog.module.css';
import { AppBtn } from '@/ui/SmallBtn/AppBtn';
import { ChallengeShopItemClientListItemDto } from '@/lib/api_client/gen';
import { useMutation } from '@tanstack/react-query';
import { getPublicClient } from '@/lib/api_client/public_client';
import { shopControllerPurchaseMutation } from '@/lib/api_client/gen/@tanstack/react-query.gen';
import z from 'zod/v3';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { AppControlledInput } from '@/ui/AppInput/AppInput';
import { useState } from 'react';
import { toast } from 'sonner';
import { isOneTimePurchaseBlocked } from '../../utils/purchase-status';

const schema = z.object({
    contact_info: z.string().optional(),
});

export const PurchaseRewardDialog = ({
    onClose,
    item,
    balance,
}: {
    onClose: () => void;
    item: ChallengeShopItemClientListItemDto;
    balance: number;
}) => {
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [blockedByServer, setBlockedByServer] = useState(false);
    const purchaseBlocked = isOneTimePurchaseBlocked(item) || blockedByServer;
    const { mutate, isPending } = useMutation({
        ...shopControllerPurchaseMutation({
            client: getPublicClient(),
        }),
        onSuccess: () => {
            setShowSuccessDialog(true);
        },
        onError: (error) => {
            console.error(error);
            const status = (error as { response?: { status?: number } })?.response?.status;
            if (status === 400 && item.is_repeatable_purchase_allowed === false) {
                setBlockedByServer(true);
                toast.error('Эта награда уже куплена');
                return;
            }
            toast.error('Ошибка при покупке награды');
        },
    });

    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            contact_info: '',
        },
        mode: 'onChange',
    });

    const handleSubmit = (data: z.infer<typeof schema>) => {
        if (purchaseBlocked) {
            toast.error('Эта награда уже куплена');
            return;
        }

        if (item.is_contact_info_required && !data.contact_info?.trim()) {
            form.setError('contact_info', {
                type: 'required',
                message: 'Контактная информация обязательна для этого товара',
            });
            return;
        }

        form.clearErrors('contact_info');
        mutate({
            body: {
                item_id: item.id,
                contact_info: data.contact_info?.trim() || undefined,
            },
        });
    };

    return (
        <AppDialog title="Принять челлендж" onClose={onClose}>
            <AppDialogContent onClose={onClose}>
                {!showSuccessDialog && (
                    <>
                        <h1 className={styles.title}>
                            {item.name} - {item.price} Очков
                        </h1>
                        <p className={styles.description}>
                            Вы уверены, что хотите купить эту награду?
                        </p>

                        {item.is_contact_info_required && (
                            <AppControlledInput
                                control={form.control}
                                name="contact_info"
                                label="Контактная информация"
                                placeholder="Введите вашу контактную информацию"
                                className="mt-8"
                            />
                        )}
                        {!item.is_contact_info_required && (
                            <p className={styles.description}>
                                Контактная информация не обязательна для этого товара.
                            </p>
                        )}

                        <div className={styles.buttons}>
                            <AppBtn
                                text={
                                    purchaseBlocked
                                        ? 'Уже куплено'
                                        : balance < item.price
                                          ? 'Недостаточно очков'
                                          : 'Купить'
                                }
                                onClick={form.handleSubmit(handleSubmit)}
                                disabled={
                                    purchaseBlocked ||
                                    isPending ||
                                    (item.is_contact_info_required && !form.formState.isValid) ||
                                    balance < item.price
                                }
                            />
                            <AppBtn text={'Отмена'} onClick={onClose} style="outline_red" />
                        </div>
                    </>
                )}
                {showSuccessDialog && (
                    <>
                        <h1 className={styles.title}>Успешно</h1>
                        <p className={styles.description}>
                            {item.is_contact_info_required
                                ? 'Вы успешно купили эту награду. С вами свяжутся в ближайшее время.'
                                : 'Вы успешно купили эту награду. Предмет скоро окажется у вас.'}
                        </p>

                        <div className={styles.buttons}>
                            <AppBtn
                                text={'Закрыть'}
                                onClick={() => {
                                    location.reload();
                                }}
                            />
                        </div>
                    </>
                )}
            </AppDialogContent>
        </AppDialog>
    );
};
