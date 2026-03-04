'use client';

import React, { useEffect, useRef, useState } from 'react';
import styles from './Intermezzo.module.css';

const Intermezzo = () => {
    const sectionRef = useRef<HTMLElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.2 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const fadeClass = (delay: string) =>
        `${styles.fadeInUp} ${isVisible ? styles.visible : ''} ${delay}`;

    return (
        <section ref={sectionRef} className={styles.intermezzo}>
            {/* Parallax Oil Painting Background */}
            <div className={styles.parallaxBg} />
            <div className={styles.overlay} />
            <div className={styles.lightRays} />

            {/* Poetic Content */}
            <div className={styles.content}>
                <hr className={`${styles.decorLine} ${fadeClass(styles.delay1)}`} />

                <p className={`${styles.poeticQuote} ${fadeClass(styles.delay2)}`}>
                    &ldquo;Como el colibrí que encuentra su hogar entre las montañas del
                    Valle de Aburrá, creamos un espacio donde cada huésped se sienta{' '}
                    <em>en familia</em>.&rdquo;
                </p>

                <p className={`${styles.familyStory} ${fadeClass(styles.delay3)}`}>
                    Somos una familia paisa que convirtió su hogar en el tuyo.
                    Cada detalle — desde esta pintura que nos acompaña cada mañana
                    hasta la vista de las montañas — fue pensado para que te sientas{' '}
                    <strong>en casa</strong>.
                </p>

                <hr className={`${styles.decorLineBottom} ${fadeClass(styles.delay4)}`} />

                <span className={`${styles.attribution} ${fadeClass(styles.delay5)}`}>
                    Óleo original · Casa Lovely Home · Medellín
                </span>
            </div>
        </section>
    );
};

export default Intermezzo;
