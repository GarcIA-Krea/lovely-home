'use client';

import React, { useState, useEffect, useMemo } from 'react';
import styles from './BookingGrid.module.css';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

interface Reservation {
    id: string;
    property_id: string;
    guest_name: string;
    check_in: string;
    check_out: string;
    platform: string;
    status: string;
}

interface Property {
    id: string;
    name: string;
}

const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function BookingGrid() {
    const router = useRouter();
    const [properties, setProperties] = useState<Property[]>([]);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [loading, setLoading] = useState(true);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Calculate days in month
    const daysInMonth = useMemo(() => {
        const date = new Date(year, month + 1, 0);
        return date.getDate();
    }, [year, month]);

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                // Fetch Properties
                const { data: props } = await supabase
                    .from('properties')
                    .select('id, name')
                    .order('name');
                
                // Fetch Reservations for the month (and slightly before/after for span)
                const startOfMonth = new Date(year, month, 1).toISOString();
                const endOfMonth = new Date(year, month + 1, 0).toISOString();

                const { data: resvs } = await supabase
                    .from('reservations')
                    .select('*')
                    .neq('status', 'cancelled')
                    .or(`check_in.lte.${endOfMonth},check_out.gte.${startOfMonth}`);

                setProperties(props || []);
                setReservations(resvs || []);
            } catch (err) {
                console.error('Error fetching grid data:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [year, month, supabase]);

    const changeMonth = (offset: number) => {
        setCurrentDate(new Date(year, month + offset, 1));
    };

    const getReservationStyle = (res: Reservation, daysInMonth: number) => {
        const start = new Date(res.check_in);
        const end = new Date(res.check_out);
        
        // Month boundaries
        const monthStart = new Date(year, month, 1);
        const monthEnd = new Date(year, month, daysInMonth);

        // Calculate overlap start day (1-indexed)
        const overlapStart = Math.max(1, Math.ceil((start.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24)) + 1);
        const overlapEnd = Math.min(daysInMonth, Math.ceil((end.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24)));

        if (overlapEnd < 1 || overlapStart > daysInMonth) return null;

        const cellWidth = 100 / daysInMonth; // percentage
        const left = (overlapStart - 1) * cellWidth;
        const width = (overlapEnd - overlapStart + 1) * cellWidth;

        return {
            left: `${left}%`,
            width: `${width}%`
        };
    };

    const getPlatformClass = (platform: string) => {
        switch (platform?.toLowerCase()) {
            case 'airbnb': return styles.airbnb;
            case 'booking': return styles.booking;
            case 'direct': return styles.direct;
            default: return styles.blocked;
        }
    };

    if (loading) return <div className={styles.loading}>Cargando calendario maestro...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.controls}>
                    <button className={styles.navBtn} onClick={() => changeMonth(-1)}>
                        <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <div className={styles.monthDisplay}>
                        {MONTHS[month]} {year}
                    </div>
                    <button className={styles.navBtn} onClick={() => changeMonth(1)}>
                        <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                </div>

                <div className={styles.legend}>
                    <div className={styles.legendItem}>
                        <div className={`${styles.dot}`} style={{ background: '#c6e26a' }}></div>
                        Directa
                    </div>
                    <div className={styles.legendItem}>
                        <div className={`${styles.dot}`} style={{ background: '#FF5A5F' }}></div>
                        Airbnb
                    </div>
                    <div className={styles.legendItem}>
                        <div className={`${styles.dot}`} style={{ background: '#003580' }}></div>
                        Booking
                    </div>
                    <div className={styles.legendItem}>
                        <div className={`${styles.dot}`} style={{ background: '#444' }}></div>
                        Bloqueo
                    </div>
                </div>
            </div>

            <div className={styles.gridWrapper}>
                <div className={styles.grid}>
                    {/* Header Row */}
                    <div className={styles.row} style={{ height: 'auto', background: '#f8f9fa' }}>
                        <div className={styles.propertyCol} style={{ background: '#f8f9fa' }}>Propiedad</div>
                        {days.map(d => {
                            const date = new Date(year, month, d);
                            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                            const isToday = new Date().toDateString() === date.toDateString();
                            return (
                                <div 
                                    key={d} 
                                    className={`${styles.cell} ${styles.dayHeader} ${isWeekend ? styles.weekend : ''} ${isToday ? styles.todayHighlight : ''}`}
                                >
                                    {['D','L','M','M','J','V','S'][date.getDay()]}
                                    <span className={styles.dayNumber}>{d}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Property Rows */}
                    {properties.map(prop => (
                        <div key={prop.id} className={styles.row}>
                            <div className={styles.propertyCol}>
                                {typeof prop.name === 'string' ? prop.name : (JSON.parse(prop.name as any)?.es || 'Propiedad')}
                            </div>
                            <div className={styles.gridWrapper} style={{ flex: 1, position: 'relative', display: 'flex' }}>
                                {days.map(d => (
                                    <div key={d} className={styles.cell}></div>
                                ))}
                                
                                {reservations
                                    .filter(r => r.property_id === prop.id)
                                    .map(res => {
                                        const style = getReservationStyle(res, daysInMonth);
                                        if (!style) return null;
                                        return (
                                            <div 
                                                key={res.id}
                                                className={`${styles.reservation} ${getPlatformClass(res.platform)}`}
                                                style={style}
                                                title={`${res.guest_name || 'Huésped'} (${res.platform})`}
                                                onClick={() => router.push('/admin/reservations')}
                                            >
                                                {res.guest_name || 'Reservado'}
                                            </div>
                                        );
                                    })
                                }
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
