import { AppDialogContent, AppDialog } from '@/ui/AppDialog/app-dialog';
import styles from './purchase-reward-dialog.module.css';
import { AppBtn } from '@/ui/SmallBtn/AppBtn';
import { ChallengeShopItemEntity } from '@/lib/api_client/gen';
import { useMutation } from '@tanstack/react-query';
import { getPublicClient } from '@/lib/api_client/public_client';
import { shopControllerPurchaseMutation } from '@/lib/api_client/gen/@tanstack/react-query.gen';
import z from 'zod/v3';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { AppControlledInput } from '@/ui/AppInput/AppInput';
import { useState } from 'react';
import { toast } from 'sonner';

const schema = z.object({
    contact_info: z.string().min(1),
});

export const PurchaseRewardDialog = ({
    onClose,
    item,
    balance,
}: {
    onClose: () => void;
    item: ChallengeShopItemEntity;
    balance: number;
}) => {
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const { mutate, isPending, error } = useMutation({
        ...shopControllerPurchaseMutation({
            client: getPublicClient(),
        }),
        onSuccess: () => {
            setShowSuccessDialog(true);
        },
        onError: (error) => {
            console.error(error);
            toast.error('Ошибка при покупке награды');
        },
    });

    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            contact_info: '',
        },
    });

    const handleSubmit = (data: z.infer<typeof schema>) => {
        mutate({
            body: {
                item_id: item.id,
                contact_info: data.contact_info,
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

                        <AppControlledInput
                            control={form.control}
                            name="contact_info"
                            label="Контактная информация"
                            placeholder="Введите вашу контактную информацию"
                            className="mt-8"
                        />

                        <div className={styles.buttons}>
                            <AppBtn
                                text={balance < item.price ? 'Недостаточно очков' : 'Купить'}
                                onClick={form.handleSubmit(handleSubmit)}
                                disabled={
                                    isPending || !form.formState.isValid || balance < item.price
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
                            Вы успешно купили эту награду. С вами свяжутся в ближайшее время.
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
