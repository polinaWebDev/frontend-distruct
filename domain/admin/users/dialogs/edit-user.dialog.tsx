'use client';

import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { usersAdminControllerEditUserMutation } from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { getPublicClient } from '@/lib/api_client/public_client';
import type { UserAdminRow } from '../types';
// Assuming UserRole enum/type is exported or I can use the string literals 'admin' | 'user'

// Define the schema manually since zAdminEditUserDto might not match the form needs exactly (e.g. file handling)
// or if zAdminEditUserDto is available, extend it.
// For now, I will define a local schema to be safe and flexible with the file input.

const userRoleValues = ['admin', 'user'] as const;

const fileListSchema =
    typeof FileList !== 'undefined' ? z.instanceof(FileList) : z.any();

const formSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    email: z.string().email('Invalid email'),
    role: z.enum(userRoleValues),
    points: z.number().min(0),
    file: fileListSchema.optional(),
});

type UserFormValues = z.infer<typeof formSchema>;

interface EditUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: UserAdminRow | null;
    refetch: () => any;
}

export const EditUserDialog = ({ open, onOpenChange, user, refetch }: EditUserDialogProps) => {
    const queryClient = useQueryClient();
    // const isEditing = Boolean(user); // Removed as this dialog is always for editing

    const form = useForm<UserFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: '',
            email: '',
            role: 'user',
            points: 0,
        },
    });

    const { register, handleSubmit, reset, setValue, watch, formState } = form;
    const watchedRole = watch('role');

    const defaultValues = useMemo(() => {
        return {
            username: user?.username ?? '',
            email: user?.email ?? '',
            role: (user?.role as 'admin' | 'user') ?? 'user',
            points: user?.points ?? 0,
        };
    }, [user]);

    useEffect(() => {
        if (open) {
            reset(defaultValues);
        }
    }, [defaultValues, reset, open]);

    const updateMutation = useMutation({
        ...usersAdminControllerEditUserMutation({
            client: getPublicClient(),
        }),
        onSuccess: async () => {
            toast.success('User updated successfully');
            refetch();
            onOpenChange(false);
        },
        onError: () => {
            toast.error('Error updating user');
        },
    });

    const onSubmit = (values: UserFormValues) => {
        if (!user) return;

        const body = {
            user_id: user.id,
            username: values.username,
            email: values.email,
            role: values.role,
            points: values.points,
            file: values.file?.[0] as File | undefined,
        };

        updateMutation.mutate({ body });
    };

    const isSubmitting = updateMutation.status === 'pending';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Редактировать пользователя</DialogTitle>
                    <DialogDescription>Обновите данные пользователя.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="username">Имя пользователя *</Label>
                        <Input
                            id="username"
                            placeholder="Имя пользователя"
                            {...register('username')}
                        />
                        {formState.errors.username && (
                            <p className="text-sm text-destructive mt-1">
                                {formState.errors.username.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input id="email" type="email" placeholder="Email" {...register('email')} />
                        {formState.errors.email && (
                            <p className="text-sm text-destructive mt-1">
                                {formState.errors.email.message}
                            </p>
                        )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="role">Роль *</Label>
                            <Select
                                value={watchedRole}
                                onValueChange={(value) =>
                                    setValue('role', value as 'admin' | 'user', {
                                        shouldValidate: true,
                                    })
                                }
                            >
                                <SelectTrigger id="role" className="w-full">
                                    <SelectValue placeholder="Выберите роль" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user">Пользователь</SelectItem>
                                    <SelectItem value="admin">Админ</SelectItem>
                                </SelectContent>
                            </Select>
                            {formState.errors.role && (
                                <p className="text-sm text-destructive mt-1">
                                    {formState.errors.role.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="points">Баллы *</Label>
                            <Input
                                id="points"
                                type="number"
                                min={0}
                                step={1}
                                {...register('points', {
                                    valueAsNumber: true,
                                })}
                            />
                            {formState.errors.points && (
                                <p className="text-sm text-destructive mt-1">
                                    {formState.errors.points.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="file">Аватар</Label>
                        <Input id="file" type="file" accept="image/*" {...register('file')} />
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                            Отмена
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Сохранение...' : 'Сохранить'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
