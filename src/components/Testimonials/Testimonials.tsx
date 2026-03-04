import React from 'react';
import styles from './Testimonials.module.css';

interface Testimonial {
    name: string;
    city: string;
    quote: string;
    avatarUrl: string;
}

const testimonials: Testimonial[] = [
    {
        name: 'Sarah J.',
        city: 'New York City',
        quote: '"Quedarse en Lovely Home fue un sueño absoluto. La atención al detalle y el diseño curado hicieron que nuestro viaje fuera inolvidable. Definitivamente volveremos el próximo año."',
        avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDR6GjiUTnsBtQzIoxbNmfoRgO23pGWDoXLlpok5J11rj_lipZhn7-h8D4gmnFsz8CM3OQxnTCi-ohGg5TYM3NrrQXgdcadFz3JfwxPWqkgfPAcIqvTjOk8XPO55g6414ujiycVI7H6i6T3NZJL8sEryEHtNifDRCnC2Ranzo3pjOK8qKA6TPVIRQ9XsI09olUotoW3FpvLL3oj97XZyHodPjp3TqBMBbXPUTE7dOAFiO4V6eu-irMEpQbR0BolXMmbihZNpwAhoU1T',
    },
    {
        name: 'Mateo R.',
        city: 'Madrid',
        quote: '"Una experiencia de lujo desde el primer momento. La ubicación era perfecta y el diseño interior, exquisito. Superó todas nuestras expectativas por mucho."',
        avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDiGm6yXnAAUcSMT_NDj1HNPUN-HlJWG4VU3mcpBxvKRRC_qgqrZTsIPmt8CuCBYm6XTOeUdh63cKeeXh3_22UCQ5IBZsvjU4ntG2_LDPySliqNpCJCbhlbWE9r6y6Ib4auFcb4Mys222EcdcnhwonVXoXOa9IWxGCcSdtWIaMBnFNAIsQ3v7-3B5H30YtGLUiVH4HggCV506WwZ9IV0NwXvjcuS7DetTvkUC3JwuW3Qt8Nc57NxXvVbSQhokPdCFAoYoXetgaE-cyh',
    },
    {
        name: 'Elena K.',
        city: 'Buenos Aires',
        quote: '"Altamente recomendado para cualquiera que busque una estancia premium. Todo estaba impecable y bellamente diseñado. El anfitrión fue increíblemente amable."',
        avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0boknWbqvoXj8Ul7vHuJgcBOrM7RCxJidc4fEw3ZgRHU0VzoLrBug1IwuYKJ0BwJXp1qJHP31Df3_I3SZrBJs8xdpWqvm7wvCP4dcS-JHrlT1ZYHK9vMXtObIv_sY_M5crJlhrF-B6byLDrDgOWH4i-yQbRz72ELhK7itha9tp1_H3u_uS73jFclw_PsgA8iW0K4PaDjwkxc16tpEeBc96nI8IjZV8jQSghfAttnqXFEqyBSL-sStspnIapZFvEDRemuSYEGN43-9',
    },
];

const Testimonials = () => {
    return (
        <section className={styles.section}>
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.headerGroup}>
                    <span className={styles.label}>Testimonios</span>
                    <h2 className={styles.title}>Lo Que Nuestros Huéspedes Dicen</h2>
                    <p className={styles.subtitle}>
                        Historias reales de viajeros que encontraron su hogar lejos de casa.
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
                                    style={{ backgroundImage: `url('${t.avatarUrl}')` }}
                                />
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
                        Ver Todas las Reseñas
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
