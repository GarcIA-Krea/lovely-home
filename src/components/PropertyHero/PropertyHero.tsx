'use client';

import React, { useState } from 'react';
import styles from './PropertyHero.module.css';
import BookingCalendar from '../Booking/BookingCalendar';

interface Property {
    name: string;
    neighborhood: string;
    city: string;
    price_per_night: number;
    currency: string;
    main_image_url: string;
    rating: number;
    review_count: number;
    description: string;
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
    const isEven = index % 2 === 0;
    const [showCalendar, setShowCalendar] = useState(false);

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

                    <h2 className={styles.title}>{property.name}</h2>

                    <p className={styles.description}>
                        {property.description}
                    </p>

                    <div className={styles.features}>
                        <div className={styles.feature}>
                            <span className="material-symbols-outlined">bed</span>
                            <span>{property.bedrooms} Hab</span>
                        </div>
                        <div className={styles.feature}>
                            <span className="material-symbols-outlined">shower</span>
                            <span>{property.bathrooms} Baño</span>
                        </div>
                        <div className={styles.feature}>
                            <span className="material-symbols-outlined">group</span>
                            <span>{property.max_guests} Huéspedes</span>
                        </div>
                    </div>

                    <div className={styles.rating}>
                        <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>star</span>
                        <span className={styles.ratingValue}>{property.rating}</span>
                        <span className={styles.reviewCount}>({property.review_count} reseñas)</span>
                    </div>

                    <div className={styles.pricing}>
                        <div className={styles.priceContainer}>
                            <span className={styles.currency}>{property.currency}</span>
                            <span className={styles.price}>${property.price_per_night.toLocaleString()}</span>
                            <span className={styles.unit}>/ noche</span>
                        </div>

                        <div className={styles.actions}>
                            <button
                                className={styles.primaryBtn}
                                onClick={() => setShowCalendar(true)}
                            >
                                <span>Reservar Directo</span>
                                <span className="material-symbols-outlined">bolt</span>
                            </button>
                            {property.airbnb_url && (
                                <a
                                    href={property.airbnb_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.airbnbBtn}
                                >
                                    <span>Airbnb</span>
                                </a>
                            )}
                            <button className={styles.secondaryBtn}>
                                Ver Detalles
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {showCalendar && (
                <BookingCalendar
                    propertyId={property.name}
                    propertyName={property.name}
                    pricePerNight={property.price_per_night}
                    currency={property.currency}
                    onClose={() => setShowCalendar(false)}
                />
            )}
        </section>
    );
};

export default PropertyHero;
