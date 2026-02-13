import { Button } from '@/components/ui/button';
import { Eye, PencilIcon, TrashIcon } from 'lucide-react';

export const MapsTreeActions = ({
    onEdit,
    onDelete,
    onView,
}: {
    onEdit?: () => void;
    onDelete?: () => void;
    onView?: () => void;
}) => {
    return (
        <div className="flex justify-end gap-2">
            <Button variant="ghost" size="icon" onClick={onView}>
                <Eye />
            </Button>
            <Button variant="ghost" size="icon" onClick={onEdit}>
                <PencilIcon className="w-4 h-4" />
            </Button>
            <Button variant="destructive" size="icon" onClick={onDelete}>
                <TrashIcon className="w-4 h-4" />
            </Button>
        </div>
    );
};
