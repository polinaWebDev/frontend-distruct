import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ItemResponseDto } from '@/lib/api_client/gen';
import { getFileUrl, hexToRgba } from '@/lib/utils';
import styles from './Item.module.css';
import { useGearById } from '@/domain/client/tiers/components/tiers/GearContext';
import { useRef, useState } from 'react';
import { useBoard } from '@/domain/client/tiers/components/tiers/Board/BoardContext';
// import TierTooltip from '@/domain/client/tiers/components/tiers/Board/TierTooltip';

type ItemProps = {
    item: ItemResponseDto;
    rowId: string;
};

function resolveRarityColor(color: string | null | undefined) {
    return typeof color === 'string' && color.trim().length > 0 ? color : '#999999';
}

export function Item({ item, rowId }: ItemProps) {
    const board = useBoard();
    const gearById = useGearById();
    const gear = gearById[item.gearId];
    const cardRef = useRef<HTMLDivElement | null>(null);
    const [panelSide, setPanelSide] = useState<'right' | 'left'>('right');
    const { setNodeRef, attributes, listeners, transform, transition, isDragging, isOver } =
        useSortable({
            id: `item:${item.id}`,
            data: { type: 'item', rowId, itemId: String(item.id) },
            disabled: board.readOnly,
        });

    const setRefs = (node: HTMLDivElement | null) => {
        setNodeRef(node);
        cardRef.current = node;
    };

    const handlePanelPlacement = () => {
        if (!cardRef.current || typeof window === 'undefined') return;
        const rect = cardRef.current.getBoundingClientRect();
        const panelWidth = 220;
        const panelGap = 12;
        const spaceRight = window.innerWidth - rect.right;
        setPanelSide(spaceRight < panelWidth + panelGap ? 'left' : 'right');
    };

    const rarityColor = resolveRarityColor(gear?.rarity?.color);
    const style = {
        width: '108px',
        height: '80px',
        transform: CSS.Transform.toString(transform),
        transition,
        backgroundColor: isDragging ? 'transparent' : hexToRgba(rarityColor, 0.15),
        border: isDragging ? '1px solid transparent' : '1px solid ' + rarityColor,
    };

    return (
        <div
            ref={setRefs}
            style={style}
            className={`${styles.card}${isDragging ? ` ${styles.dragging}` : ''}`}
            data-over={isOver}
            onMouseEnter={handlePanelPlacement}
            {...attributes}
            {...listeners}
        >
            <div className={styles.dropOverlay} aria-hidden="true" />
            {/*{!isDragging ? (*/}
            {/*    <div*/}
            {/*        className={`${styles.hoverPanel} ${*/}
            {/*            panelSide === 'left' ? styles.hoverPanelLeft : styles.hoverPanelRight*/}
            {/*        }`}*/}
            {/*        aria-hidden="true"*/}
            {/*    >*/}
            {/*        <TierTooltip gear={gear} />*/}
            {/*    </div>*/}
            {/*) : null}*/}
            {gear?.image_url ? (
                <img
                    className={styles.image}
                    src={getFileUrl(gear.image_url)}
                    alt={gear.name}
                    loading="lazy"
                />
            ) : null}
            <p className={styles.name}>{gear?.name ?? item.gearId}</p>
        </div>
    );
}

export function ItemOverlay({ item }: { item: ItemResponseDto }) {
    const gearById = useGearById();
    const gear = gearById[item.gearId];
    const rarityColor = resolveRarityColor(gear?.rarity?.color);
    const style = {
        width: '108px',
        height: '80px',
        backgroundColor: hexToRgba(rarityColor, 0.15) ?? undefined,
        border: '1px solid ' + rarityColor,
    };

    return (
        <div className={styles.card} style={style}>
            {gear?.image_url ? (
                <img className={styles.image} src={getFileUrl(gear.image_url)} alt={gear.name} />
            ) : null}
            <p className={styles.name}>{gear?.name ?? item.gearId}</p>
        </div>
    );
}
