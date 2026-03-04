'use client';

import React, { useState, useEffect } from 'react';
import styles from './BookingCalendar.module.css';

interface BookingCalendarProps {
    propertyId: string;
    propertyName: string;
    pricePerNight: number;
    currency: string;
    onClose: () => void;
}

export default function BookingCalendar({ propertyId, propertyName, pricePerNight, currency, onClose }: BookingCalendarProps) {
    const [checkIn, setCheckIn] = useState<string>('');
    const [checkOut, setCheckOut] = useState<string>('');
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [nights, setNights] = useState<number>(0);

    useEffect(() => {
        if (checkIn && checkOut) {
            const start = new Date(checkIn);
            const end = new Date(checkOut);
            const diffTime = end.getTime() - start.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > 0) {
                setNights(diffDays);
                setTotalPrice(diffDays * pricePerNight);
            } else {
                setNights(0);
                setTotalPrice(0);
            }
        }
    }, [checkIn, checkOut, pricePerNight]);

    const handleBooking = () => {
        if (nights > 0) {
            alert(`Iniciando reserva directa para ${propertyName}.\n${nights} noches por ${totalPrice.toLocaleString()} ${currency}.\n\n(Próximo paso: Integración con Stripe)`);
            onClose();
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>
                    <span className="material-symbols-outlined">close</span>
                </button>

                <div className={styles.header}>
                    <h2>Reserva Directa</h2>
                    <p>{propertyName}</p>
                </div>

                <div className={styles.inputs}>
                    <div className={styles.inputGroup}>
                        <label>Check-in</label>
                        <input
                            type="date"
                            value={checkIn}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={(e) => setCheckIn(e.target.value)}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Check-out</label>
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
                            <span>{pricePerNight.toLocaleString()} {currency} x {nights} noches</span>
                            <span>{(pricePerNight * nights).toLocaleString()} {currency}</span>
                        </div>
                        <div className={styles.totalRow}>
                            <span>Total Estimado</span>
                            <span>{totalPrice.toLocaleString()} {currency}</span>
                        </div>
                    </div>
                )}

                <button
                    className={styles.bookBtn}
                    disabled={nights <= 0}
                    onClick={handleBooking}
                >
                    <span className="material-symbols-outlined">bolt</span>
                    Confirmar y Pagar
                </button>

                <p className={styles.disclaimer}>
                    Al reservar directo ahorras hasta un 20% en comisiones de plataformas externas.
                </p>
            </div>
        </div>
    );
}
