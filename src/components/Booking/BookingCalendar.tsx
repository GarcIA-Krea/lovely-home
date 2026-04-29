'use client';

import React, { useState, useEffect } from 'react';
import styles from './BookingCalendar.module.css';
import { useTranslation } from '@/context/LanguageContext';

interface BookingCalendarProps {
    propertyId: string;
    propertyName: string;
    pricePerNight: number;
    currency: string;
    onClose: () => void;
    initialCheckIn?: string;
    initialCheckOut?: string;
}

export default function BookingCalendar({ propertyId, propertyName, pricePerNight, currency, onClose, initialCheckIn = '', initialCheckOut = '' }: BookingCalendarProps) {
    const { t } = useTranslation();
    const [checkIn, setCheckIn] = useState<string>(initialCheckIn);
    const [checkOut, setCheckOut] = useState<string>(initialCheckOut);
    const [guestName, setGuestName] = useState<string>('');
    const [guestEmail, setGuestEmail] = useState<string>('');
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [nights, setNights] = useState<number>(0);
    const [loadingPrice, setLoadingPrice] = useState(false);
    const [priceBreakdown, setPriceBreakdown] = useState<any[]>([]);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchDynamicPrice = async () => {
            if (checkIn && checkOut) {
                const start = new Date(checkIn);
                const end = new Date(checkOut);
                const diffTime = end.getTime() - start.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays > 0) {
                    setNights(diffDays);
                    setLoadingPrice(true);
                    try {
                        const res = await fetch(`/api/pricing?property_id=${propertyId}&check_in=${checkIn}&check_out=${checkOut}`);
                        if (res.ok) {
                            const data = await res.json();
                            setTotalPrice(data.total);
                            setPriceBreakdown(data.breakdown || []);
                        } else {
                            // Fallback
                            setTotalPrice(diffDays * pricePerNight);
                            setPriceBreakdown([]);
                        }
                    } catch (e) {
                        // Fallback
                        setTotalPrice(diffDays * pricePerNight);
                        setPriceBreakdown([]);
                    } finally {
                        setLoadingPrice(false);
                    }
                } else {
                    setNights(0);
                    setTotalPrice(0);
                    setPriceBreakdown([]);
                }
            } else {
                setNights(0);
                setTotalPrice(0);
                setPriceBreakdown([]);
            }
        };

        const timer = setTimeout(() => {
            fetchDynamicPrice();
        }, 400);

        return () => clearTimeout(timer);
    }, [checkIn, checkOut, propertyId, pricePerNight]);

    const handleBooking = async () => {
        if (nights > 0 && guestName.trim() !== '' && guestEmail.trim() !== '') {
            setLoading(true);
            try {
                const response = await fetch('/api/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        propertyId,
                        propertyName,
                        guestName,
                        guestEmail,
                        pricePerNight,
                        checkIn,
                        checkOut,
                        nights,
                        currency,
                    }),
                });

                const data = await response.json();
                if (data.url) {
                    window.location.href = data.url;
                } else {
                    throw new Error(data.error || 'Failed to create checkout session');
                }
            } catch (error: any) {
                console.error('Booking Error:', error);
                alert('Error al iniciar el proceso de pago. Por favor intenta de nuevo.');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>
                    <span className="material-symbols-outlined">close</span>
                </button>

                <div className={styles.header}>
                    <h2>{t.booking.title}</h2>
                    <p>{propertyName}</p>
                </div>

                <div className={styles.inputs}>
                    <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                        <label>{t.booking.name}</label>
                        <input
                            type="text"
                            placeholder="Ej. Juan Pérez"
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                        />
                    </div>
                    <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                        <label>{t.booking.email}</label>
                        <input
                            type="email"
                            placeholder="juan@email.com"
                            value={guestEmail}
                            onChange={(e) => setGuestEmail(e.target.value)}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>{t.booking.checkin}</label>
                        <input
                            type="date"
                            value={checkIn}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={(e) => setCheckIn(e.target.value)}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>{t.booking.checkout}</label>
                        <input
                            type="date"
                            value={checkOut}
                            min={checkIn || new Date().toISOString().split('T')[0]}
                            onChange={(e) => setCheckOut(e.target.value)}
                        />
                    </div>
                </div>

                {nights > 0 && (
                    <div className={styles.summary}>
                        <div className={styles.summaryRow}>
                            <span>{t.booking.nights} ({nights})</span>
                            <span>{loadingPrice ? '...' : `${totalPrice.toLocaleString()} ${currency}`}</span>
                        </div>
                        {priceBreakdown.some(b => b.discountLastMinute > 0) && (
                            <div className={styles.summaryRow} style={{ color: '#10B981', fontSize: '0.85rem' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>sell</span>
                                    ¡Descuento de Último Minuto!
                                </span>
                            </div>
                        )}
                        <div className={styles.totalRow}>
                            <span>{t.booking.totalEstimated}</span>
                            <span>{loadingPrice ? 'Calculando...' : `${totalPrice.toLocaleString()} ${currency}`}</span>
                        </div>
                    </div>
                )}

                <button
                    className={styles.bookBtn}
                    disabled={nights <= 0 || !guestName || !guestEmail || loading}
                    onClick={handleBooking}
                >
                    <span className="material-symbols-outlined">bolt</span>
                    {loading ? t.booking.redirecting : t.booking.pay}
                </button>

                <p className={styles.disclaimer}>
                    {t.booking.disclaimer}
                </p>
            </div>
        </div>
    );
}
