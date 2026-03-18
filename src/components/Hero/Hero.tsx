import React from 'react';
import Image from 'next/image';
import styles from './Hero.module.css';
import { useTranslation } from '@/context/LanguageContext';
import LanguageSelector from '../LanguageSelector/LanguageSelector';

const Hero = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.hero}>
      {/* Background Image with Overlay */}
      <div className={styles.background}>
        <div className={styles.backgroundImage}></div>
        <div className={styles.overlay}></div>
      </div>

      {/* Content Wrapper */}
      <div className={styles.contentWrapper}>
        {/* Navigation */}
        <header className={styles.header}>
          <div className={styles.logoContainer}>
            <Image
              src="/images/logo.png"
              alt="Lovely Home"
              width={220}
              height={110}
              className={styles.logoImage}
              priority
            />
          </div>

          <nav className={styles.nav}>
            <a href="#" className={styles.navLink}>{t.nav.destinations}</a>
            <a href="#" className={styles.navLink}>{t.nav.membership}</a>
            <a href="#" className={styles.navLink}>{t.nav.about}</a>
          </nav>

          <div className={styles.actions}>
            <LanguageSelector />
            <a href="#" className={styles.login}>Login</a>
            <button className={styles.signUp}>Sign Up</button>
            <button className={styles.mobileMenu}>
              <span className="material-symbols-outlined" style={{ fontSize: '2rem' }}>menu</span>
            </button>
          </div>
        </header>

        {/* Main Hero Content */}
        <main className={styles.main}>
          <div className={styles.badge}>
            <span className={styles.dot}></span>
            <span className={styles.badgeText}>{t.hero.badge}</span>
          </div>

          <h1 className={styles.title}>
            {t.hero.title} <br />
            <span className={styles.highlight}>{t.hero.location}</span>
          </h1>

          <p className={styles.subtitle}>{t.hero.subtitle}</p>

          <div className={styles.ctas}>
            <button className={styles.primaryBtn}>
              <span>{t.hero.explore}</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <button className={styles.secondaryBtn}>
              <span className="material-symbols-outlined">play_circle</span>
              <span>{t.hero.video}</span>
            </button>
          </div>

          {/* Social Proof / Stats */}
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <p className={styles.statValue}>4.9<span>/5</span></p>
              <p className={styles.statLabel}>{t.hero.rating}</p>
            </div>
            <div className={styles.divider}></div>
            <div className={styles.statItem}>
              <p className={styles.statValue}>5</p>
              <p className={styles.statLabel}>{t.hero.properties}</p>
            </div>
            <div className={styles.divider}></div>
            <div className={styles.avatars}>
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100" alt="User" className={styles.avatar} />
              <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100" alt="User" className={styles.avatar} />
              <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100" alt="User" className={styles.avatar} />
              <div className={styles.avatarPlus}>+2k</div>
            </div>
          </div>
        </main>

        {/* Bottom Features List */}
        <div className={styles.features}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <span className="material-symbols-outlined">wifi</span>
            </div>
            <div>
              <h3 className={styles.featureTitle}>{t.features.wifi}</h3>
              <p className={styles.featureDescription}>{t.features.wifi_desc}</p>
            </div>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <span className="material-symbols-outlined">location_on</span>
            </div>
            <div>
              <h3 className={styles.featureTitle}>{t.features.locations}</h3>
              <p className={styles.featureDescription}>{t.features.locations_desc}</p>
            </div>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <span className="material-symbols-outlined">cleaning_services</span>
            </div>
            <div>
              <h3 className={styles.featureTitle}>{t.features.cleaning}</h3>
              <p className={styles.featureDescription}>{t.features.cleaning_desc}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
