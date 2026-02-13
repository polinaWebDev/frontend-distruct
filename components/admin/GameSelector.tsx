import { GAME_TYPE_VALUES, GameType } from '@/lib/enums/game_type.enum';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export const GameSelector = ({
    value,
    onChange,
}: {
    value: GameType;
    onChange: (value: GameType) => void;
}) => {
    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger id="game-type" className="w-fit">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {GAME_TYPE_VALUES.map((gt) => (
                    <SelectItem key={gt.value} value={gt.value}>
                        {gt.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};
