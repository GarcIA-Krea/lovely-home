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
    main_image_url: string;
}

const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function BookingGrid() {
    const router = useRouter();
    const [properties, setProperties] = useState<Property[]>([]);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [expandedPropId, setExpandedPropId] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Responsive detection
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Calculate days in month
    const daysInMonth = useMemo(() => {
        const date = new Date(year, month + 1, 0);
        return date.getDate();
    }, [year, month]);

    const firstDayOfMonth = useMemo(() => {
        return new Date(year, month, 1).getDay();
    }, [year, month]);

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const { data: props } = await supabase
                    .from('properties')
                    .select('id, name, main_image_url')
                    .order('name');
                
                const startOfMonth = new Date(year, month, 1).toISOString();
                const endOfMonth = new Date(year, month + 1, 0).toISOString();

                const { data: resvs } = await supabase
                    .from('reservations')
                    .select('*')
                    .neq('status', 'cancelled')
                    .or(`check_in.lte.${endOfMonth},check_out.gte.${startOfMonth}`);

                setProperties(props || []);
                setReservations(resvs || []);
                
                // Auto-expand first property on mobile
                if (props && props.length > 0 && !expandedPropId) {
                    setExpandedPropId(props[0].id);
                }
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

    const formatName = (name: any) => {
        if (!name) return 'Propiedad';
        if (typeof name === 'object') return name.es || name.en || 'Propiedad';
        try {
            if (typeof name === 'string' && (name.startsWith('{') || name.startsWith('['))) {
                const parsed = JSON.parse(name);
                return parsed.es || parsed.en || name;
            }
        } catch (e) {}
        return name;
    };

    const getDayReservation = (propId: string, day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const targetDate = new Date(dateStr);
        
        return reservations.find(r => {
            if (r.property_id !== propId) return false;
            const start = new Date(r.check_in);
            const end = new Date(r.check_out);
            // End date is check-out, so usually doesn't count as "occupied" for the night of that day
            // But for simple visualization, we check if targetDate is between start and end (inclusive of start, exclusive of end)
            return targetDate >= start && targetDate < end;
        });
    };

    const getPlatformColor = (platform: string) => {
        switch (platform?.toLowerCase()) {
            case 'airbnb': return '#FF5A5F';
            case 'booking': return '#003580';
            case 'direct': return '#c6e26a';
            default: return '#444';
        }
    };

    const getReservationStyle = (res: Reservation, daysInMonth: number) => {
        const start = new Date(res.check_in);
        const end = new Date(res.check_out);
        const monthStart = new Date(year, month, 1);
        const overlapStart = Math.max(1, Math.ceil((start.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24)) + 1);
        const overlapEnd = Math.min(daysInMonth, Math.ceil((end.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24)));
        if (overlapEnd < 1 || overlapStart > daysInMonth) return null;

        const cellWidth = 100 / daysInMonth;
        const left = (overlapStart - 1) * cellWidth;
        const width = (overlapEnd - overlapStart + 1) * cellWidth;

        return {
            left: `calc(${left}% + 4px)`,
            width: `calc(${width}% - 8px)`
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

    const [syncing, setSyncing] = useState(false);

    const handleSync = async () => {
        setSyncing(true);
        try {
            const res = await fetch('/api/admin/sync', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                alert(`Sincronización exitosa: ${data.syncedCount} reservas actualizadas.`);
                window.location.reload(); // Refresh to show new data
            } else {
                throw new Error(data.error || 'Error desconocido');
            }
        } catch (err: any) {
            alert('Error al sincronizar: ' + err.message);
        } finally {
            setSyncing(false);
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
                    
                    <button 
                        className={styles.syncBtn} 
                        onClick={handleSync} 
                        disabled={syncing}
                        title="Sincronizar con Airbnb/Booking"
                    >
                        <span className={`material-symbols-outlined ${syncing ? styles.rotating : ''}`}>
                            sync
                        </span>
                        {syncing ? 'Sincronizando...' : 'Sincronizar'}
                    </button>
                </div>

                {!isMobile && (
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
                    </div>
                )}
            </div>

            {/* Desktop View: Timeline Grid */}
            {!isMobile && (
                <div className={styles.gridWrapper}>
                    <div className={styles.grid}>
                        <div className={styles.row} style={{ height: 'auto', background: '#f8f9fa' }}>
                            <div className={styles.propertyCol} style={{ background: '#f8f9fa' }}>Propiedad</div>
                            {days.map(d => {
                                const date = new Date(year, month, d);
                                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                                const isToday = new Date().toDateString() === date.toDateString();
                                return (
                                    <div key={d} className={`${styles.cell} ${styles.dayHeader} ${isWeekend ? styles.weekend : ''} ${isToday ? styles.todayHighlight : ''}`}>
                                        {WEEKDAYS[date.getDay()][0]}
                                        <span className={styles.dayNumber}>{d}</span>
                                    </div>
                                );
                            })}
                        </div>

                        {properties.map(prop => (
                            <div key={prop.id} className={styles.row}>
                                <div className={styles.propertyCol}>
                                    <div className={styles.propAvatar}>
                                        <img src={prop.main_image_url} alt="" className={styles.propThumb} />
                                    </div>
                                    <span className={styles.propName}>{formatName(prop.name)}</span>
                                </div>
                                <div style={{ flex: 1, position: 'relative', display: 'flex' }}>
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
            )}

            {/* Mobile View: Accordion / Calendar */}
            {isMobile && (
                <div className={styles.mobileContainer}>
                    {properties.map(prop => (
                        <div key={prop.id} className={`${styles.mobilePropItem} ${expandedPropId === prop.id ? styles.expanded : ''}`}>
                            <button 
                                className={styles.mobilePropHeader}
                                onClick={() => setExpandedPropId(expandedPropId === prop.id ? null : prop.id)}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <img src={prop.main_image_url} alt="" className={styles.mobileThumb} />
                                    <span style={{ fontWeight: 700 }}>{formatName(prop.name)}</span>
                                </div>
                                <span className="material-symbols-outlined">
                                    {expandedPropId === prop.id ? 'expand_less' : 'expand_more'}
                                </span>
                            </button>

                            {expandedPropId === prop.id && (
                                <div className={styles.mobileCalendarWrapper}>
                                    <div className={styles.mobileCalendarGrid}>
                                        {WEEKDAYS.map(w => <div key={w} className={styles.mobileDayLabel}>{w}</div>)}
                                        {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`pad-${i}`} />)}
                                        {days.map(d => {
                                            const res = getDayReservation(prop.id, d);
                                            return (
                                                <div key={d} className={styles.mobileDayCell} onClick={() => res && router.push('/admin/reservations')}>
                                                    <span className={styles.mobileDayNum}>{d}</span>
                                                    {res && (
                                                        <div 
                                                            className={styles.mobileIndicator} 
                                                            style={{ background: getPlatformColor(res.platform) }}
                                                            title={res.guest_name}
                                                        />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className={styles.mobileLegend}>
                                        <div className={styles.mobileLegendItem}><div className={styles.dot} style={{ background: '#c6e26a' }} /> Directa</div>
                                        <div className={styles.mobileLegendItem}><div className={styles.dot} style={{ background: '#FF5A5F' }} /> Airbnb</div>
                                        <div className={styles.mobileLegendItem}><div className={styles.dot} style={{ background: '#003580' }} /> Booking</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
