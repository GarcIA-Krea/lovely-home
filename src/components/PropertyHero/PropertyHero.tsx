'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import styles from './PropertyHero.module.css';
import BookingCalendar from '../Booking/BookingCalendar';
import PropertyDetails from '../PropertyDetails/PropertyDetails';
import { SiAirbnb, SiBookingdotcom } from 'react-icons/si';

interface Property {
    id: string; // Added for consistently
    name: any; // JSONB
    neighborhood: string;
    city: string;
    price_per_night: number;
    currency: string;
    main_image_url: string;
    rating: number;
    review_count: number;
    description: any; // JSONB
    bedrooms: number;
    bathrooms: number;
    max_guests: number;
    airbnb_url?: string;
    booking_url?: string;
}

interface PropertyHeroProps {
    property: Property;
    index: number;
}

const PropertyHero: React.FC<PropertyHeroProps> = ({ property, index }) => {
    const { t, language } = useTranslation();
    const isEven = index % 2 === 0;
    const [showCalendar, setShowCalendar] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    const getTranslation = (field: any) => {
        if (!field) return '';
        let parsedField = field;
        
        // If it's a string, try to parse it as JSON
        if (typeof field === 'string') {
            try {
                parsedField = JSON.parse(field);
            } catch (e) {
                return field; // Return as is if not JSON
            }
        }

        if (typeof parsedField === 'object' && parsedField !== null) {
            return parsedField[language] || parsedField['es'] || '';
        }
        
        return String(parsedField);
    };

    const propertyName = getTranslation(property.name);

    return (
        <section className={styles.container}>
            {/* Background Image with Parallax effect (pure CSS) */}
            <div className={styles.imageOverlay}>
                <div
                    className={styles.bgImage}
                    style={{ backgroundImage: `url('${property.main_image_url}')` }}
                />
                <div className={styles.gradient} />
            </div>

            <div className={`${styles.content} ${isEven ? styles.contentLeft : styles.contentRight}`}>
                <div className={styles.textWrapper}>
                    <div className={styles.badge}>
                        <span className="material-symbols-outlined">location_on</span>
                        <span>{property.neighborhood}, {property.city}</span>
                    </div>

                    <h2 className={styles.title}>{propertyName}</h2>

                    <p className={styles.description}>
                        {getTranslation(property.description)}
                    </p>

                    <div className={styles.features}>
                        <div className={styles.feature}>
                            <span className="material-symbols-outlined">bed</span>
                            <span>{property.bedrooms} {t.stats.bedrooms}</span>
                        </div>
                        <div className={styles.feature}>
                            <span className="material-symbols-outlined">shower</span>
                            <span>{property.bathrooms} {t.stats.bathrooms}</span>
                        </div>
                        <div className={styles.feature}>
                            <span className="material-symbols-outlined">group</span>
                            <span>{property.max_guests} {t.stats.guests}</span>
                        </div>
                    </div>

                    <div className={styles.rating}>
                        <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>star</span>
                        <span className={styles.ratingValue}>{property.rating}</span>
                        <span className={styles.reviewCount}>({property.review_count} {t.hero.rating.toLowerCase()})</span>
                    </div>

                    <div className={styles.pricing}>
                        <div className={styles.priceContainer}>
                            <span className={styles.currency}>{property.currency}</span>
                            <span className={styles.price}>${property.price_per_night.toLocaleString()}</span>
                            <span className={styles.unit}>/ {t.booking.nights.slice(0, -1)}</span>
                        </div>

                        <div className={styles.actions}>
                            <button
                                className={styles.primaryBtn}
                                onClick={() => setShowCalendar(true)}
                            >
                                <span>{t.booking.direct}</span>
                                <span className="material-symbols-outlined">bolt</span>
                            </button>
                            {property.airbnb_url && (
                                <a
                                    href={property.airbnb_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.airbnbBtn}
                                    title="Airbnb"
                                >
                                    <SiAirbnb size={20} />
                                </a>
                            )}
                            {property.booking_url && (
                                <a
                                    href={property.booking_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.bookingBtnExternal}
                                    title="Booking.com"
                                >
                                    <SiBookingdotcom size={20} />
                                </a>
                            )}
                            <button 
                                className={styles.secondaryBtn}
                                onClick={() => setShowDetails(true)}
                            >
                                {t.booking.details}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {showDetails && (
                <PropertyDetails 
                    property={property as any} 
                    onClose={() => setShowDetails(false)}
                    onBookNow={() => {
                        setShowDetails(false);
                        setShowCalendar(true);
                    }}
                />
            )}

            {showCalendar && (
                <BookingCalendar
                    propertyId={propertyName}
                    propertyName={propertyName}
                    pricePerNight={property.price_per_night}
                    currency={property.currency}
                    onClose={() => setShowCalendar(false)}
                />
            )}
        </section>
    );
};

export default PropertyHero;
