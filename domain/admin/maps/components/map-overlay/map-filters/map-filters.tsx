import { Activity, Fragment, useState } from 'react';
import styles from './map-filters.module.css';
import { FunnelX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MapDataCategoryDto } from '@/lib/api_client/gen';
import { hexToRgba } from '@/lib/utils';
import clsx from 'clsx';

import { useMedia } from 'react-use';
export const MapFilters = ({
    categories,
    onSelect,
    selected,
    className,
    inline = false,
}: {
    categories: MapDataCategoryDto[];
    selected: string[];
    onSelect: (category_id: string) => void;
    className?: string;
    inline?: boolean;
}) => {
    const isMobile = useMedia('(max-width: 1000px)');
    const [hidden, setHidden] = useState(isMobile);

    return (
        <div
            className={clsx(
                styles.container,
                hidden && styles.hidden,
                !hidden && styles.open,
                inline && styles.inline,
                className
            )}
        >
            <Activity mode={hidden ? 'visible' : 'hidden'}>
                <Button size={'icon'} variant={'ghost'} onClick={() => setHidden(!hidden)}>
                    <FunnelX />
                </Button>
            </Activity>

            <Activity mode={hidden ? 'hidden' : 'visible'}>
                <div className={styles.title_container}>
                    <p>Фильтр отображения</p>

                    <Button size={'icon'} variant={'ghost'} onClick={() => setHidden(!hidden)}>
                        <FunnelX />
                    </Button>
                </div>

                <div className={styles.filters_container}>
                    {categories.map((category, i) => (
                        <Fragment key={category.id}>
                            <div className={styles.filter}>
                                <div
                                    className={styles.color}
                                    style={{
                                        background: category.color,
                                        boxShadow: `0px 0px 20.200000762939453px 6px ${hexToRgba(category.color, 0.38)}`,
                                    }}
                                ></div>
                                <p>{category.name}</p>
                                <div
                                    className={clsx(
                                        styles.switch_container,
                                        selected.includes(category.id) && styles.active
                                    )}
                                    onClick={() => onSelect(category.id)}
                                >
                                    <div
                                        className={styles.circle}
                                        style={{
                                            background: selected.includes(category.id)
                                                ? 'black'
                                                : 'white',
                                        }}
                                    ></div>
                                </div>
                            </div>
                            {i !== categories.length - 1 && <div className={styles.separator} />}
                        </Fragment>
                    ))}
                </div>
            </Activity>
        </div>
    );
};
