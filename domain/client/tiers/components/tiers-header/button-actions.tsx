'use client';
import { useTierListActions } from '@/domain/client/tiers/components/tiers/TierListActionsContext';
import ShareConfirmDialog from './ShareConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AppBtn } from '@/ui/SmallBtn/AppBtn';
import { ShareBtn } from '@/ui/ShareBtn/ShareBtn';
import { AppDialog, AppDialogContent } from '@/ui/AppDialog/app-dialog';
import { Root as DialogRoot } from '@radix-ui/react-dialog';

const ButtonActions = () => {
    const { save, resetDraft, isSaving, saved, updatePrivacy, hasChanges } = useTierListActions();
    const [shareOpen, setShareOpen] = useState(false);
    const [shareConfirmOpen, setShareConfirmOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [origin, setOrigin] = useState('');
    const pathname = usePathname();

    const sharePath = useMemo(() => {
        if (!saved?.id) return '';
        if (!pathname) return '';
        return pathname.replace(/\/tiers(?:\/.*)?$/, `/tiers/${saved.id}`);
    }, [pathname, saved?.id]);

    const shareUrl = useMemo(() => {
        if (!origin || !sharePath) return '';
        return `${origin}${sharePath}`;
    }, [origin, sharePath]);

    useEffect(() => {
        if (!shareOpen) return;
        if (typeof window === 'undefined') return;
        setOrigin(window.location.origin);
        setCopied(false);
    }, [shareOpen]);

    const handleShareClick = () => {
        if (hasChanges) {
            setShareConfirmOpen(true);
            return;
        }
        setShareOpen(true);
    };

    const handleShareWithoutSave = () => {
        resetDraft();
        setShareConfirmOpen(false);
        setShareOpen(true);
    };

    const handleShareAfterSave = async () => {
        await save();
        setShareConfirmOpen(false);
        setShareOpen(true);
    };

    return (
        <div>
            <div className="flex gap-2">
                <AppBtn
                    style="default"
                    text="Сохранить"
                    onClick={save}
                    disabled={isSaving || !hasChanges}
                />
                <ShareBtn onClick={handleShareClick} color="white" disabled={isSaving} />
            </div>
            <ShareConfirmDialog
                open={shareConfirmOpen}
                onOpenChange={setShareConfirmOpen}
                onContinueWithoutSave={handleShareWithoutSave}
                onSaveAndContinue={handleShareAfterSave}
            />
            <DialogRoot open={shareOpen} onOpenChange={setShareOpen}>
                <AppDialog title="Поделиться тир-листом" onClose={() => setShareOpen(false)}>
                    <AppDialogContent
                        onClose={() => setShareOpen(false)}
                        className="grid gap-4"
                        style={{ width: '100%', maxWidth: 540 }}
                    >
                        <h2 className="text-xl font-semibold leading-none tracking-tight">
                            Поделиться тир-листом
                        </h2>
                        <label className="grid gap-2 text-sm">
                            Ссылка на readonly тир-лист
                            <div className="flex gap-2">
                                <Input value={shareUrl} readOnly />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={async () => {
                                        if (!shareUrl) return;
                                        await navigator.clipboard.writeText(shareUrl);
                                        setCopied(true);
                                    }}
                                >
                                    {copied ? 'Скопировано' : 'Копировать'}
                                </Button>
                            </div>
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                            <Checkbox
                                checked={saved.isPublic}
                                disabled={isSaving}
                                onCheckedChange={(checked) => {
                                    updatePrivacy(checked === true);
                                }}
                            />
                            Публичный тир-лист
                        </label>
                    </AppDialogContent>
                </AppDialog>
            </DialogRoot>
        </div>
    );
};

export default ButtonActions;
