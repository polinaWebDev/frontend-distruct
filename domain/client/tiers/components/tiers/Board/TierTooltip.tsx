// import type { CSSProperties } from 'react';
// import { PublicGearDto } from '@/lib/api_client/gen';
// import { getFileUrl } from '@/lib/utils';
// import styles from './TierTooltip.module.css';
//
// interface TierTooltipProps {
//     gear: PublicGearDto;
// }
//
// const TierTooltip = ({ gear }: TierTooltipProps) => {
//     return (
//         <div
//             className={styles.root}
//             style={{ '--rarity-color': gear.rarity.color } as CSSProperties}
//         >
//             <div className={styles.header}>
//                 <h3 className={styles.title}>{gear.name}</h3>
//                 <div className={styles.id}>ID: {gear.id}</div>
//             </div>
//             <div className={styles.row}>
//                 <span className={styles.label}>Rarity:</span> {gear.rarity.name}
//             </div>
//             <div className={styles.row}>
//                 <span className={styles.label}>Rarity ID:</span> {gear.rarity.id}
//             </div>
//             <div className={styles.row}>
//                 <span className={styles.label}>Rarity Color:</span> {gear.rarity.color}
//             </div>
//             <div className={styles.row}>
//                 <span className={styles.label}>Tier:</span> {gear.tier}
//             </div>
//             <div className={styles.section}>
//                 <span className={styles.label}>Description:</span>
//                 <div className={styles.description}>{gear.description || '—'}</div>
//             </div>
//         </div>
//     );
// };
//
// export default TierTooltip;
