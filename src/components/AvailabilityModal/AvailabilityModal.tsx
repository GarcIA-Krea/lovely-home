'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styles from './AvailabilityModal.module.css';
import { useTranslation } from '@/context/LanguageContext';
import BookingCalendar from '../Booking/BookingCalendar';

interface PropertyResult {
    id: string;
    name: any;
    max_guests: number;
    price_per_night: number;
    currency: string;
    main_image_url: string;
    neighborhood: string;
    is_available: boolean;
}

interface BookingTarget {
    id: string;
    name: string;
    price: number;
    currency: string;
    checkIn: string;
    checkOut: string;
}

interface AvailabilityModalProps {
    onClose: () => void;
}

const MAX_GUESTS = 6;
const today = new Date().toISOString().split('T')[0];

export default function AvailabilityModal({ onClose }: AvailabilityModalProps) {
    const { t, language } = useTranslation();
    const av = t.availability;

    const [numGuests, setNumGuests] = useState(2);
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [results, setResults] = useState<PropertyResult[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [bookingTarget, setBookingTarget] = useState<BookingTarget | null>(null);

    const search = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ num_guests: String(numGuests) });
            if (checkIn) params.set('check_in', checkIn);
            if (checkOut) params.set('check_out', checkOut);

            const res = await fetch(`/api/availability?${params.toString()}`);
            const data = await res.json();
            setResults(Array.isArray(data) ? data : []);
        } catch {
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, [numGuests, checkIn, checkOut]);

    // Auto-search when guests change (no dates required for initial view)
    useEffect(() => {
        search();
    }, [numGuests]);

    const getPropName = (nameObj: any): string => {
        if (!nameObj) return '';
        const parsed = typeof nameObj === 'string' ? JSON.parse(nameObj) : nameObj;
        return parsed?.[language] || parsed?.es || '';
    };

    const getNights = () => {
        if (!checkIn || !checkOut) return 0;
        const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    };

    const nights = getNights();

    const handleBook = (prop: PropertyResult) => {
        setBookingTarget({
            id: prop.id,
            name: getPropName(prop.name),
            price: prop.price_per_night,
            currency: prop.currency,
            checkIn,
            checkOut,
        });
    };

    if (bookingTarget) {
        return (
            <BookingCalendar
                propertyId={bookingTarget.id}
                propertyName={bookingTarget.name}
                pricePerNight={bookingTarget.price}
                currency={bookingTarget.currency}
                initialCheckIn={bookingTarget.checkIn}
                initialCheckOut={bookingTarget.checkOut}
                onClose={() => setBookingTarget(null)}
            />
        );
    }

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className={styles.header}>
                    <h2 className={styles.title}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1.3rem', verticalAlign: 'middle', marginRight: '0.4rem', color: 'var(--primary)' }}>calendar_month</span>
                        {av.title}
                    </h2>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Filters */}
                <div className={styles.filters}>
                    <div className={styles.filterGroup}>
                        <span className={styles.filterLabel}>
                            <span className="material-symbols-outlined" style={{ fontSize: '0.9rem', verticalAlign: 'middle' }}>group</span>
                            {' '}{av.guests}
                        </span>
                        <div className={styles.guestSelector}>
                            {Array.from({ length: MAX_GUESTS }, (_, i) => i + 1).map(n => (
                                <button
                                    key={n}
                                    className={`${styles.guestBtn} ${numGuests === n ? styles.active : ''}`}
                                    onClick={() => setNumGuests(n)}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.filterGroup}>
                        <span className={styles.filterLabel}>{av.checkin}</span>
                        <input
                            type="date"
                            className={styles.dateInput}
                            value={checkIn}
                            min={today}
                            onChange={e => {
                                setCheckIn(e.target.value);
                                if (checkOut && e.target.value >= checkOut) setCheckOut('');
                            }}
                        />
                    </div>

                    <div className={styles.filterGroup}>
                        <span className={styles.filterLabel}>{av.checkout}</span>
                        <input
                            type="date"
                            className={styles.dateInput}
                            value={checkOut}
                            min={checkIn || today}
                            onChange={e => setCheckOut(e.target.value)}
                        />
                    </div>

                    <button
                        className={styles.searchBtn}
                        onClick={search}
                        disabled={loading}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>search</span>
                        {av.search}
                    </button>
                </div>

                {/* Results */}
                <div className={styles.results}>
                    {loading && (
                        <div className={styles.loading}>
                            <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite' }}>progress_activity</span>
                            {av.loading}
                        </div>
                    )}

                    {!loading && results === null && (
                        <p className={styles.hint}>{av.selectDates}</p>
                    )}

                    {!loading && results !== null && results.length === 0 && (
                        <p className={styles.noResults}>{av.noResults}</p>
                    )}

                    {!loading && results !== null && results.map(prop => {
                        const name = getPropName(prop.name);
                        const isAvail = prop.is_available;
                        const totalStr = nights > 0
                            ? `$${(prop.price_per_night * nights).toLocaleString()} ${prop.currency} · ${nights} ${nights === 1 ? av.night : av.nights}`
                            : '';

                        return (
                            <div key={prop.id} className={`${styles.propertyRow} ${isAvail ? styles.available : styles.unavailable}`}>
                                {prop.main_image_url && (
                                    <img src={prop.main_image_url} alt={name} className={styles.propertyImage} />
                                )}

                                <div className={styles.propertyInfo}>
                                    <div className={styles.propertyName}>{name}</div>
                                    <div className={styles.propertyMeta}>
                                        <span className={styles.capacityBadge}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '0.85rem' }}>group</span>
                                            {av.capacity} {prop.max_guests} {av.capacityUnit}
                                        </span>
                                        {prop.neighborhood && <span>· {prop.neighborhood}</span>}
                                        <span className={`${styles.statusBadge} ${isAvail ? styles.available : styles.unavailable}`}>
                                            {isAvail ? `✓ ${av.available}` : `✕ ${av.unavailable}`}
                                        </span>
                                    </div>
                                </div>

                                <div className={styles.propertyPrice}>
                                    <div className={styles.priceAmount}>${prop.price_per_night.toLocaleString()}</div>
                                    <div className={styles.priceUnit}>{prop.currency} {av.perNight}</div>
                                    {totalStr && <div className={styles.priceSub}>{totalStr}</div>}
                                </div>

                                {isAvail && (
                                    <button
                                        className={styles.bookBtn}
                                        onClick={() => handleBook(prop)}
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>bolt</span>
                                        {av.bookNow}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
