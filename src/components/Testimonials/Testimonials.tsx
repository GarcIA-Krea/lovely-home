'use client';

import React from 'react';
import { useTranslation } from '@/context/LanguageContext';
import styles from './Testimonials.module.css';

interface Testimonial {
    name: string;
    city: string;
    quote: string;
    avatarUrl: string;
}

const testimonials: Testimonial[] = [
    {
        name: 'Daniel',
        city: 'Germany',
        quote: '"¡Pasamos dos semanas en Medellín con cuatro personas y el lugar fue perfecto! El lugar estaba muy limpio y equipado con todo lo que necesitábamos. La ubicación era muy segura y excelente para explorar El Poblado a pie..."',
        avatarUrl: '', 
    },
    {
        name: 'Char',
        city: 'Netherlands',
        quote: '"Tuve una estancia encantadora en casa de María, hasta el punto de que quería extenderme y quedarme más tiempo... La ubicación era increíble, fácilmente transitable a donde está la acción..."',
        avatarUrl: '',
    },
    {
        name: 'Abel',
        city: 'USA',
        quote: '"Great place, really comfortable and clean. Highly recommend for anyone looking for a well-located stay in Medellin."',
        avatarUrl: '',
    },
    {
        name: 'Owen',
        city: 'USA',
        quote: '"The place was amazing, the view is incredible. Maria was a great host and very helpful during our stay. Clean, modern, and in a fantastic neighborhood."',
        avatarUrl: '',
    },
    {
        name: 'Kieran',
        city: 'USA',
        quote: '"Gemas: María, su madre y este lugar son simplemente extraordinarios. Todo fue impecable, desde la comunicación hasta el confort del apartamento. Definitivamente regresaremos."',
        avatarUrl: '',
    },
    {
        name: 'Thais Venancio',
        city: 'Brazil',
        quote: '"Excelente estadia, apartamento limpo e bem localizado. Maria foi muito atenciosa e prestativa em todos los momentos."',
        avatarUrl: '',
    },
    {
        name: 'Le\'',
        city: 'USA',
        quote: '"Maria was super helpful and the place was great. The location is perfect for exploring the city and the apartment has everything you need."',
        avatarUrl: '',
    },
    {
        name: 'Angie',
        city: 'USA',
        quote: '"El lugar era impresionante y estaba limpio. Se pareció a las fotos, nos sentimos como en casa y no queríamos irnos. También tienes una vista increíble por la noche. María fue muy dulce, receptiva y amable."',
        avatarUrl: '',
    },
    {
        name: 'Gian',
        city: 'USA',
        quote: '"The location is perfect, the apartment is beautiful. Great value for money and Maria is an excellent host who goes above and beyond."',
        avatarUrl: '',
    },
    {
        name: 'Marco',
        city: 'Italy',
        quote: '"Excelente ubicación, todo muy limpio. Maria siempre estuvo disponible para ayudarnos con cualquier cosa. Muy recomendable para familias o grupos pequeños."',
        avatarUrl: '',
    }
];

const Testimonials = () => {
    const { t } = useTranslation();

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.headerGroup}>
                    <span className={styles.label}>{t.testimonials.label}</span>
                    <h2 className={styles.title}>{t.testimonials.title}</h2>
                    <p className={styles.subtitle}>
                        {t.location.subtitle}
                    </p>
                </div>

                {/* Grid */}
                <div className={styles.grid}>
                    {testimonials.map((t, index) => (
                        <div key={index} className={styles.card}>
                            {/* Decorative Quote */}
                            <div className={styles.quoteIcon}>
                                <span className="material-symbols-outlined">format_quote</span>
                            </div>

                            {/* Stars */}
                            <div className={styles.stars}>
                                {[...Array(5)].map((_, i) => (
                                    <span key={i} className="material-symbols-outlined">star</span>
                                ))}
                            </div>

                            {/* Quote */}
                            <p className={styles.quote}>{t.quote}</p>

                            {/* User Info */}
                            <div className={styles.userInfo}>
                                <div
                                    className={styles.avatar}
                                    style={t.avatarUrl ? { backgroundImage: `url('${t.avatarUrl}')` } : { backgroundColor: '#e2e8f0' }}
                                >
                                    {!t.avatarUrl && <span style={{ color: '#64748b', fontWeight: 'bold' }}>{t.name.charAt(0)}</span>}
                                </div>
                                <div>
                                    <h4 className={styles.userName}>{t.name}</h4>
                                    <p className={styles.userCity}>{t.city}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className={styles.cta}>
                    <button className={styles.ctaBtn}>
                        {t.booking.details}
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
