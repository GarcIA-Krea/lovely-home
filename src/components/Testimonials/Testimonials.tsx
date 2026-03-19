'use client';

import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import styles from './Testimonials.module.css';
import { supabase } from '@/lib/supabaseClient';

interface Testimonial {
    id: string;
    name: string;
    city: string;
    quote: string;
    avatar_url?: string;
}

const Testimonials = () => {
    const { t } = useTranslation();
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

    useEffect(() => {
        const fetchTestimonials = async () => {
            const { data } = await supabase
                .from('testimonials')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (data && data.length > 0) {
                setTestimonials(data);
            }
        };

        fetchTestimonials();
    }, []);

    if (testimonials.length === 0) return null;

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
                    {testimonials.map((testimonio, index) => (
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
                            <p className={styles.quote}>{testimonio.quote}</p>

                            {/* User Info */}
                            <div className={styles.userInfo}>
                                <div
                                    className={styles.avatar}
                                    style={testimonio.avatar_url ? { backgroundImage: `url('${testimonio.avatar_url}')` } : { backgroundColor: '#e2e8f0' }}
                                >
                                    {!testimonio.avatar_url && <span style={{ color: '#64748b', fontWeight: 'bold' }}>{testimonio.name.charAt(0)}</span>}
                                </div>
                                <div>
                                    <h4 className={styles.userName}>{testimonio.name}</h4>
                                    <p className={styles.userCity}>{testimonio.city}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA Removed as requested */}
            </div>
        </section>
    );
};

export default Testimonials;
