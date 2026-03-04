import React from 'react';
import styles from './PropertyCard.module.css';

export interface Property {
    title: string;
    location: string;
    price: number;
    currency?: string;
    rating: number;
    reviewCount: number;
    imageUrl: string;
    isNew?: boolean;
    isSuperhost?: boolean;
    amenities: {
        icon: string;
        name: string;
        description: string;
    }[];
    cancelBefore?: string;
}

interface PropertyCardProps {
    property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
    return (
        <div className={styles.card}>
            {/* Image Section */}
            <div className={styles.imageSection}>
                <div
                    className={styles.image}
                    style={{ backgroundImage: `url('${property.imageUrl}')` }}
                />
                <div className={styles.imageOverlay} />

                {/* Badges */}
                <div className={styles.badges}>
                    {property.isNew && <span className={styles.badgeNew}>New</span>}
                    {property.isSuperhost && <span className={styles.badgeSuperhost}>Superhost</span>}
                </div>

                {/* Mobile fav button */}
                <button className={styles.favBtnMobile}>
                    <span className="material-symbols-outlined">favorite</span>
                </button>
            </div>

            {/* Content Section */}
            <div className={styles.content}>
                <div>
                    {/* Header */}
                    <div className={styles.header}>
                        <div>
                            <h2 className={styles.title}>{property.title}</h2>
                            <div className={styles.location}>
                                <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>location_on</span>
                                <span>{property.location}</span>
                            </div>
                        </div>
                        <button className={styles.favBtnDesktop}>
                            <span className="material-symbols-outlined">favorite</span>
                        </button>
                    </div>

                    {/* Rating */}
                    <div className={styles.rating}>
                        <div className={styles.stars}>
                            {[...Array(5)].map((_, i) => (
                                <span
                                    key={i}
                                    className="material-symbols-outlined"
                                    style={{
                                        fontVariationSettings: i < Math.floor(property.rating) ? "'FILL' 1" : "'FILL' 0",
                                    }}
                                >
                                    star
                                </span>
                            ))}
                        </div>
                        <span className={styles.ratingValue}>{property.rating}</span>
                        <span className={styles.ratingCount}>({property.reviewCount} reviews)</span>
                    </div>

                    <hr className={styles.divider} />

                    {/* Features */}
                    <div className={styles.features}>
                        {property.amenities.map((amenity, index) => (
                            <div key={index} className={styles.featureItem}>
                                <div className={styles.featureIcon}>
                                    <span className="material-symbols-outlined">{amenity.icon}</span>
                                </div>
                                <div>
                                    <h3 className={styles.featureName}>{amenity.name}</h3>
                                    <p className={styles.featureDesc}>{amenity.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <div className={styles.priceRow}>
                        <div>
                            <p className={styles.priceLabel}>Total price</p>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                                <span className={styles.priceValue}>${property.price}</span>
                                <span className={styles.priceUnit}>/ night</span>
                            </div>
                        </div>
                        {property.cancelBefore && (
                            <div className={styles.cancelInfo}>
                                <p className={styles.cancelText}>Free cancellation</p>
                                <p className={styles.cancelDate}>Before {property.cancelBefore}</p>
                            </div>
                        )}
                    </div>
                    <div className={styles.actions}>
                        <button className={styles.bookBtn}>
                            <span>Book Now</span>
                            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>arrow_forward</span>
                        </button>
                        <button className={styles.calendarBtn}>
                            <span className="material-symbols-outlined">calendar_month</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyCard;
