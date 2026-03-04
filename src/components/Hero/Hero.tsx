import React from 'react';
import Image from 'next/image';
import styles from './Hero.module.css';

const Hero = () => {
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
            <a href="#" className={styles.navLink}>Destinations</a>
            <a href="#" className={styles.navLink}>Membership</a>
            <a href="#" className={styles.navLink}>About Us</a>
          </nav>

          <div className={styles.actions}>
            <a href="#" className={styles.login}>Log In</a>
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
            <span className={styles.badgeText}>Premium Living</span>
          </div>

          <h1 className={styles.title}>
            Tu Hogar en <br />
            <span className={styles.highlight}>Medellín</span>
          </h1>

          <p className={styles.subtitle}>
            Cerca de todo lo que necesitas. Experimenta el lujo minimalista en el corazón de la ciudad de la eterna primavera.
          </p>

          <div className={styles.ctas}>
            <button className={styles.primaryBtn}>
              <span>Explorar Alojamientos</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <button className={styles.secondaryBtn}>
              <span className="material-symbols-outlined">play_circle</span>
              <span>Ver Video</span>
            </button>
          </div>

          {/* Social Proof / Stats */}
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <p className={styles.statValue}>4.9<span>/5</span></p>
              <p className={styles.statLabel}>Rating</p>
            </div>
            <div className={styles.divider}></div>
            <div className={styles.statItem}>
              <p className={styles.statValue}>120<span>+</span></p>
              <p className={styles.statLabel}>Propiedades</p>
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
              <h3 className={styles.featureTitle}>High-Speed WiFi</h3>
              <p className={styles.featureDescription}>Perfect for remote work nomads.</p>
            </div>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <span className="material-symbols-outlined">location_on</span>
            </div>
            <div>
              <h3 className={styles.featureTitle}>Prime Locations</h3>
              <p className={styles.featureDescription}>El Poblado, Laureles, and more.</p>
            </div>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <span className="material-symbols-outlined">cleaning_services</span>
            </div>
            <div>
              <h3 className={styles.featureTitle}>Weekly Cleaning</h3>
              <p className={styles.featureDescription}>Professional service included.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
