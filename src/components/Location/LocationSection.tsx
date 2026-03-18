'use client';

import { useTranslation } from '@/context/LanguageContext';
import styles from './LocationSection.module.css';

export default function LocationSection() {
    const { t } = useTranslation();

    const attractions = [
        {
            name: 'Provenza',
            description: t.location.attractions.provenza,
            icon: 'restaurant'
        },
        {
            name: 'Parque Lleras',
            description: t.location.attractions.lleras,
            icon: 'nightlife'
        },
        {
            name: 'Milla de Oro',
            description: t.location.attractions.milla,
            icon: 'payments'
        },
        {
            name: 'Parque El Poblado',
            description: t.location.attractions.poblado,
            icon: 'park'
        }
    ];

    return (
        <section className={styles.section} id="location">
            <div className={styles.container}>
                <div className={styles.info}>
                    <div className={styles.badge}>{t.location.badge}</div>
                    <h2 className={styles.title}>{t.location.title} <span className={styles.highlight}>{t.location.highlight}</span></h2>
                    <p className={styles.subtitle}>{t.location.subtitle}</p>

                    <div className={styles.attractions}>
                        {attractions.map((attr, idx) => (
                            <div key={idx} className={styles.attraction}>
                                <div className={styles.iconWrapper}>
                                    <span className="material-symbols-outlined">{attr.icon}</span>
                                </div>
                                <div className={styles.attrContent}>
                                    <h3>{attr.name}</h3>
                                    <p>{attr.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.mapContainer}>
                    <div className={styles.mapWrapper}>
                        <iframe 
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15865.716496225!2d-75.5807!3d6.2103!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e442830841b8979%3A0x6b18a66698642a8b!2sEl%20Poblado%2C%20Medell%C3%ADn%2C%20Antioquia!5e0!3m2!1ses!2sco!4v1700000000000!5m2!1ses!2sco" 
                            width="100%" 
                            height="100%" 
                            style={{ border: 0 }} 
                            allowFullScreen={true} 
                            loading="lazy" 
                            referrerPolicy="no-referrer-when-downgrade"
                            title={t.location.view_map}
                        ></iframe>
                        <div className={styles.mapOverlay}>
                            <a 
                                href="https://maps.app.goo.gl/3C6Z6zG6y6Z6Z6Z6Z" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className={styles.mapLink}
                            >
                                <span className="material-symbols-outlined">open_in_new</span>
                                {t.location.view_map}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
