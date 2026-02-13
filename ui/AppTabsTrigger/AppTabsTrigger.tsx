import { TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

function AppTabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsTrigger>) {
    return (
        <TabsTrigger
            {...props}
            className={cn(
                `
                rounded-lg px-4 py-3 text-basefont-medium border-[#34363d] text-muted-foreground
                data-[state=active]:border-ded
                data-[state=active]:text-primary-foreground
                data-[state=active]:shadow
                transition-all
                `,
                className
            )}
        />
    );
}
export default AppTabsTrigger;
