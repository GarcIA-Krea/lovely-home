'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import styles from './PropertyDetails.module.css';
import { SiAirbnb, SiBookingdotcom } from 'react-icons/si';

interface PropertyImage {
    image_url: string;
    display_order: number;
}

interface Property {
    id: string;
    name: any; // Now JSONB
    neighborhood: string;
    city: string;
    price_per_night: number;
    currency: string;
    main_image_url: string;
    rating: number;
    review_count: number;
    description: any; // Now JSONB
    bedrooms: number;
    bathrooms: number;
    max_guests: number;
    airbnb_url?: string;
    booking_url?: string;
    property_images?: PropertyImage[];
}

interface PropertyDetailsProps {
    property: Property;
    onClose: () => void;
    onBookNow: () => void;
}

const PropertyDetails: React.FC<PropertyDetailsProps> = ({ property, onClose, onBookNow }) => {
    const { t, language } = useTranslation();
    const [activeImage, setActiveImage] = useState(property.main_image_url);
    const [isClosing, setIsClosing] = useState(false);

    const getTranslation = (field: any) => {
        if (!field) return '';
        let parsedField = field;
        
        // If it's a string, try to parse it as JSON
        if (typeof field === 'string') {
            try {
                parsedField = JSON.parse(field);
            } catch (e) {
                // Not JSON, return as is
                return field;
            }
        }

        if (typeof parsedField === 'object' && parsedField !== null) {
            return parsedField[language] || parsedField['es'] || '';
        }
        
        return String(parsedField);
    };
    // Combine main image with gallery and deduplicate
    const allImages = Array.from(new Set([
        property.main_image_url,
        ...(property.property_images?.map(img => img.image_url) || [])
    ])).slice(0, 12);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(onClose, 400); // Wait for animation
    };

    const scrollThumbnails = (direction: 'left' | 'right') => {
        const container = document.getElementById('thumbnail-container');
        if (container) {
            const scrollAmount = 200;
            container.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    // Close on escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') handleClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    return (
        <div className={`${styles.overlay} ${isClosing ? styles.fadeOut : styles.fadeIn}`}>
            <div className={`${styles.modal} ${isClosing ? styles.slideDown : styles.slideUp}`}>
                <button className={styles.closeBtn} onClick={handleClose}>
                    <span className="material-symbols-outlined">close</span>
                </button>

                <div className={styles.container}>
                    {/* Left: Gallery */}
                    <div className={styles.gallerySection}>
                        <div className={styles.mainImageWrapper}>
                            <img src={activeImage} alt={getTranslation(property.name)} className={styles.mainImage} />
                        </div>
                        <div className={styles.thumbnailsWrapper}>
                            <button className={styles.navBtn} onClick={() => scrollThumbnails('left')}>
                                <span className="material-symbols-outlined">chevron_left</span>
                            </button>
                            <div className={styles.thumbnails} id="thumbnail-container">
                                {allImages.map((url, idx) => (
                                    <div 
                                        key={idx} 
                                        className={`${styles.thumbnail} ${activeImage === url ? styles.activeThumbnail : ''}`}
                                        onClick={() => setActiveImage(url)}
                                    >
                                        <img src={url} alt={`${getTranslation(property.name)} ${idx}`} />
                                    </div>
                                ))}
                            </div>
                            <button className={styles.navBtn} onClick={() => scrollThumbnails('right')}>
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                        </div>
                    </div>

                    {/* Right: Info */}
                    <div className={styles.infoSection}>
                        <div className={styles.header}>
                            <div className={styles.badge}>
                                <span className="material-symbols-outlined">location_on</span>
                                <span>{property.neighborhood}, {property.city}</span>
                            </div>
                            <h2 className={styles.title}>{getTranslation(property.name)}</h2>
                            <div className={styles.rating}>
                                <span className="material-symbols-outlined">star</span>
                                <span className={styles.ratingValue}>{property.rating}</span>
                                <span className={styles.reviewCount}>({property.review_count} {t.hero.rating.toLowerCase()})</span>
                            </div>
                        </div>

                        <div className={styles.content}>
                            <div className={styles.specs}>
                                <div className={styles.spec}>
                                    <span className="material-symbols-outlined">bed</span>
                                    <span>{property.bedrooms} {t.stats.bedrooms}</span>
                                </div>
                                <div className={styles.spec}>
                                    <span className="material-symbols-outlined">shower</span>
                                    <span>{property.bathrooms} {t.stats.bathrooms}</span>
                                </div>
                                <div className={styles.spec}>
                                    <span className="material-symbols-outlined">group</span>
                                    <span>{property.max_guests} {t.stats.guests}</span>
                                </div>
                            </div>

                            <div className={styles.description}>
                                <p>{getTranslation(property.description)}</p>
                            </div>

                            <div className={styles.pricing}>
                                <div className={styles.priceInfo}>
                                    <span className={styles.priceLabel}>{t.booking.total}</span>
                                    <div className={styles.priceValue}>
                                        <span className={styles.currency}>{property.currency}</span>
                                        <span className={styles.amount}>${property.price_per_night.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.actions}>
                                <button className={styles.bookBtn} onClick={onBookNow}>
                                    {t.booking.direct}
                                    <span className="material-symbols-outlined">bolt</span>
                                </button>
                                
                                <div className={styles.trustBadgesContainer}>
                                    {property.airbnb_url && (
                                        <div className={`${styles.trustBadge} ${styles.airbnb}`} title="Airbnb Superhost">
                                            <SiAirbnb size={16} /> <span>Superhost 5.0</span>
                                        </div>
                                    )}
                                    {property.booking_url && (
                                        <div className={`${styles.trustBadge} ${styles.booking}`} title="Booking.com Exceptional">
                                            <SiBookingdotcom size={16} /> <span>Excepcional 9.8</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
;

export default PropertyDetails;
