import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import styles from './Intermezzo.module.css';

const Intermezzo = () => {
    const { t } = useTranslation();
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

    const highlightText = (text: string, words: string[]) => {
        if (!text) return text;
        let highlighted = false;
        let regex = new RegExp(`(${words.join('|')})`, 'gi');
        
        const parts = text.split(regex);
        return parts.map((part, i) => {
            if (!highlighted && words.some(w => w.toLowerCase() === part.toLowerCase())) {
                highlighted = true;
                return <span key={i} className={styles.highlight}>{part}</span>;
            }
            return part;
        });
    };

    // Words to highlight in different languages
    const quoteHighlight = ['familia', 'family', 'família', 'famille', 'familie'];
    const storyHighlight = ['casa', 'home', 'zuhause'];

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
                    &ldquo;{highlightText(t.intermezzo.quote, quoteHighlight)}&rdquo;
                </p>

                <p className={`${styles.familyStory} ${fadeClass(styles.delay3)}`}>
                    {highlightText(t.intermezzo.story, storyHighlight)}
                </p>

                <hr className={`${styles.decorLineBottom} ${fadeClass(styles.delay4)}`} />

                <span className={`${styles.attribution} ${fadeClass(styles.delay5)}`}>
                    {t.intermezzo.attribution}
                </span>
            </div>
        </section>
    );
};

export default Intermezzo;
