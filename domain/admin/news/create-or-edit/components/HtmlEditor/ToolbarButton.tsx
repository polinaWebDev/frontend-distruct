import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface ToolbarButtonProps {
    onClick?: () => void;
    isActive?: boolean;
    icon?: LucideIcon;
    label?: string;
    tooltip?: string;
    children?: ReactNode;
    disabled?: boolean;
    className?: string;
}

export const ToolbarButton = ({
    onClick,
    isActive,
    icon: Icon,
    label,
    tooltip,
    children,
    disabled,
    className,
}: ToolbarButtonProps) => {
    const content = (
        <Button
            type="button"
            variant={isActive ? 'secondary' : 'ghost'}
            size="sm"
            onClick={onClick}
            disabled={disabled}
            className={cn('h-8 w-8 p-0', isActive && 'bg-muted text-muted-foreground', className)}
        >
            {Icon && <Icon className="h-4 w-4" />}
            {label}
            {children}
        </Button>
    );

    if (tooltip) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>{content}</TooltipTrigger>
                    <TooltipContent>
                        <p>{tooltip}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    return content;
};
