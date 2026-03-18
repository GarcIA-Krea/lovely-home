import { useTranslation } from '@/context/LanguageContext';
import styles from './PropertyCard.module.css';

export interface Property {
    title: any; // Now JSONB
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
        name: any; // Now JSONB
        description: string;
    }[];
    cancelBefore?: string;
}

interface PropertyCardProps {
    property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
    const { t, language } = useTranslation();

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
                    {property.isNew && <span className={styles.badgeNew}>{property.isNew ? 'New' : ''}</span>}
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
                            <h2 className={styles.title}>{getTranslation(property.title)}</h2>
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
                        <span className={styles.ratingCount}>({property.reviewCount} {t.hero.rating.toLowerCase()})</span>
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
                                    <h3 className={styles.featureName}>{getTranslation(amenity.name)}</h3>
                                    <p className={styles.featureDesc}>{getTranslation(amenity.description)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <div className={styles.priceRow}>
                        <div>
                            <p className={styles.priceLabel}>{t.booking.total}</p>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                                <span className={styles.priceValue}>${property.price}</span>
                                <span className={styles.priceUnit}>/ {t.booking.nights.slice(0, -1)}</span>
                            </div>
                        </div>
                        {property.cancelBefore && (
                            <div className={styles.cancelInfo}>
                                <p className={styles.cancelText}>{t.booking.confirm}</p>
                                <p className={styles.cancelDate}>{property.cancelBefore}</p>
                            </div>
                        )}
                    </div>
                    <div className={styles.actions}>
                        <button className={styles.bookBtn}>
                            <span>{t.booking.direct}</span>
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
