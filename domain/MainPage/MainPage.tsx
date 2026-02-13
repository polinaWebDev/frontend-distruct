import hero_img from '@/lib/images/hero_img.webp';
import Image from 'next/image';
import styles from './MainPage.module.css';
import { GAME_TYPE_VALUES } from '@/lib/enums/game_type.enum';

export const MainPage = () => {
    return (
        <div className={styles.page}>
            <Image src={hero_img} alt="hero" className={styles.bg_img} />
            <div className={styles.gradient_bg} />

            <div className={styles.content}>
                <h1>Твой главный помощник в Extraction шутерах</h1>
                <div className={styles.games}>
                    {GAME_TYPE_VALUES.map((game) => (
                        <div key={game.value} className={styles.game}>
                            {game.label}
                        </div>
                    ))}
                </div>
                <div className={styles.banner}></div>
            </div>
        </div>
    );
};
