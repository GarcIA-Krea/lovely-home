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
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d495.8097198981981!2d-75.56334301137976!3d6.200527869755367!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e4683b6ef539049%3A0xd9824fc25acc014e!2sLovely%20Home%20-%20Apartamentos%20Amoblados%20-%20Alojamiento%20-%20Hospedaje!5e0!3m2!1ses!2sco!4v1775702633515!5m2!1ses!2sco" 
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
                                href="https://www.google.com/maps/search/?api=1&query=6.200527869755367,-75.56334301137976" 
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
