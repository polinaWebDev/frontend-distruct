import hero_img from '@/lib/images/main-arena.webp';
import mac_randomize from '@/lib/images/mac-randomize.webp';
import mac_maps from '@/lib/images/mac-maps.webp';
import mac_challenges from '@/lib/images/mac-challenges.webp';
import Image from 'next/image';
import styles from './MainPage.module.css';
import { GAME_TYPE_VALUES } from '@/lib/enums/game_type.enum';
import { AppBtn } from '@/ui/SmallBtn/AppBtn';
import clsx from 'clsx';
import { BannerProvider } from '@/components/banners/BannerProvider';
import { BannerSlot } from '@/components/banners/BannerSlot';

export const MainPage = () => {
    return (
        <div className={styles.page}>
            <main className={styles.content}>
                <section className={`${styles.section} ${styles.heroSection}`}>
                    <Image src={hero_img} alt="hero" className={styles.bg_img} />
                    <div className={styles.gradient_bg} />
                    <div className="page_width_wrapper">
                        <h1>Твой главный помощник в Extraction шутерах</h1>
                        <div className={styles.games}>
                            {GAME_TYPE_VALUES.map((game) => (
                                <div key={game.value} className={styles.game}>
                                    {game.label}
                                </div>
                            ))}
                        </div>
                        <BannerProvider page="main">
                            <BannerSlot slotKey="inline" className={styles.banner} />
                        </BannerProvider>
                    </div>
                </section>
                <section
                    className={clsx(
                        styles.section,
                        styles.featureSection,
                        styles.randomizerSection
                    )}
                >
                    <div className="page_width_wrapper">
                        <div className={styles.featureContent}>
                            <h2>Рандомайзер</h2>
                            <h3>Генератор рандомной экипировки</h3>
                            <p>
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
                                ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                                aliquip ex ea commodo consequat. Duis aute irure dolor in
                                reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                                pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
                                culpa qui officia deserunt mollit anim id est laborum.
                            </p>
                            <AppBtn
                                href="/arena_breakout/randomizer"
                                text="Попробовать"
                                className={styles.featureButton}
                            />
                        </div>
                        <Image
                            src={mac_randomize}
                            alt="Рандомайзер"
                            className={styles.featureImage}
                            width={952}
                            height={715}
                        />
                    </div>
                </section>
                <section
                    className={clsx(styles.section, styles.featureSection, styles.mapsSection)}
                >
                    <div className="page_width_wrapper">
                        <Image
                            src={mac_maps}
                            alt="Карты"
                            className={styles.featureImage}
                            width={1001}
                            height={739}
                        />
                        <div className={styles.featureContent}>
                            <h2>Карты</h2>
                            <h3>Ваш путеводитель в экстракшен-шутерах</h3>
                            <p>
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
                                ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                                aliquip ex ea commodo consequat. Duis aute irure dolor in
                                reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                                pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
                                culpa qui officia deserunt mollit anim id est laborum.
                            </p>
                            <AppBtn
                                big={false}
                                href="/arena_breakout/maps"
                                text="Попробовать"
                                className={styles.featureButton}
                            />
                        </div>
                    </div>
                </section>
                <section className={styles.challengesSection}>
                    <div className={styles.challengesMedia}>
                        <svg
                            className={styles.challengesTitleSvg}
                            viewBox="0 0 1400 276"
                            preserveAspectRatio="xMidYMid meet"
                            role="presentation"
                            aria-hidden="true"
                        >
                            <text x="700" y="138">
                                ЧЕЛЛЕНДЖИ
                            </text>
                        </svg>
                        <Image
                            src={mac_challenges}
                            alt="challenges"
                            className={styles.challengesImage}
                            width={859}
                            height={524}
                        />
                    </div>
                    <ol className={styles.challengesList}>
                        <li>
                            <span>#1</span>
                            <h4>Выполняйте задания</h4>
                            <p>
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                                eiusmod tempor
                            </p>
                        </li>
                        <li>
                            <span>#2</span>
                            <h4>Получайте очки</h4>
                            <p>
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                                eiusmod tempor
                            </p>
                        </li>
                        <li>
                            <span>#3</span>
                            <h4>Забирайте награды</h4>
                            <p>
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                                eiusmod tempor
                            </p>
                        </li>
                    </ol>
                </section>
            </main>
        </div>
    );
};
