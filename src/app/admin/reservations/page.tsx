'use client';
// Lovely Home Admin - Reservations Page (Refactored for Mobile-First)

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import styles from './style.module.css';

interface Reservation {
    id: string;
    guest_name: string;
    guest_email: string;
    check_in: string;
    check_out: string;
    total_price: number;
    currency: string;
    status: string;
    properties: any;
    created_at: string;
    platform?: string;
}

interface Property {
    id: string;
    name: any;
    price_per_night: number;
}

export default function ReservationsPage() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        guest_name: '',
        guest_email: '',
        property_id: '',
        check_in: '',
        check_out: '',
        total_price: 0
    });

    const fetchData = async () => {
        setLoading(true);
        const { data: resData } = await supabase
            .from('reservations')
            .select(`
                id, guest_name, guest_email, check_in, check_out, 
                total_price, currency, status, created_at, platform,
                properties (name)
            `)
            .order('created_at', { ascending: false });

        if (resData) setReservations(resData as any);

        const { data: propData } = await supabase
            .from('properties')
            .select('id, name, price_per_night')
            .order('name');
            
        if (propData) setProperties(propData);
        
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const updateStatus = async (id: string, newStatus: string) => {
        const res = await fetch('/api/admin/reservations', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'update_status', id, status: newStatus })
        });
        const result = await res.json();
        
        if (res.ok && result.success) {
            fetchData();
        } else {
            alert('Error al actualizar el estado: ' + (result.error || 'Desconocido'));
        }
    };

    const isExpired = (res: Reservation) => {
        if (res.status !== 'pending') return false;
        const createdAt = new Date(res.created_at);
        const now = new Date();
        const diffMins = Math.floor((now.getTime() - createdAt.getTime()) / 60000);
        return diffMins > 15;
    };

    const getPendingText = (res: Reservation) => {
        if (res.status !== 'pending') return '';
        const createdAt = new Date(res.created_at);
        const now = new Date();
        const diffMins = Math.floor((now.getTime() - createdAt.getTime()) / 60000);
        const remaining = 15 - diffMins;
        if (remaining <= 0) return 'Expirada';
        return `${remaining} min restantes`;
    };

    const clearExpired = async () => {
        const expiredIds = reservations.filter(isExpired).map(r => r.id);
        if (expiredIds.length === 0) {
            alert('No hay reservas expiradas para limpiar.');
            return;
        }
        
        setLoading(true);
        const res = await fetch('/api/admin/reservations', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'clear_expired', expiredIds })
        });
        const result = await res.json();
            
        if (!res.ok || result.error) {
            alert('Error al limpiar las reservas: ' + (result.error || 'Desconocido'));
            setLoading(false);
        } else {
            fetchData();
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/admin/reservations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...formData,
                currency: 'COP',
                status: 'confirmed',
                platform: 'direct'
            })
        });
        const result = await res.json();
        
        if (!res.ok || result.error) {
            alert('Error al crear reserva: ' + (result.error || 'Desconocido'));
        } else {
            setFormData({ guest_name: '', guest_email: '', property_id: '', check_in: '', check_out: '', total_price: 0 });
            setShowForm(false);
            fetchData();
        }
    };

    useEffect(() => {
        if (formData.check_in && formData.check_out && formData.property_id) {
            const start = new Date(formData.check_in);
            const end = new Date(formData.check_out);
            const diffTime = end.getTime() - start.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays > 0) {
                const prop = properties.find(p => p.id === formData.property_id);
                if (prop) {
                    setFormData(prev => ({ ...prev, total_price: diffDays * prop.price_per_night }));
                }
            } else {
                setFormData(prev => ({ ...prev, total_price: 0 }));
            }
        }
    }, [formData.check_in, formData.check_out, formData.property_id, properties]);

    const handleWompiPayment = async () => {
        const start = new Date(formData.check_in);
        const end = new Date(formData.check_out);
        const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        const prop = properties.find(p => p.id === formData.property_id);
        
        if (!prop || nights <= 0 || !formData.guest_name || !formData.guest_email) {
            alert('Por favor completa todos los campos (nombre, correo, fechas válidas).');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    propertyId: formData.property_id,
                    propertyName: getPropName(prop.name),
                    guestName: formData.guest_name,
                    guestEmail: formData.guest_email,
                    pricePerNight: prop.price_per_night,
                    checkIn: formData.check_in,
                    checkOut: formData.check_out,
                    nights,
                    currency: 'COP',
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
            alert('Error al iniciar el proceso de pago con Wompi.');
            setLoading(false);
        }
    };

    const getPropName = (nameObj: any) => {
        if (!nameObj) return 'Desconocida';
        let parsed = typeof nameObj === 'string' ? JSON.parse(nameObj) : nameObj;
        return parsed?.es || 'Desconocida';
    };

    const getStatusClass = (res: Reservation) => {
        if (res.status === 'confirmed') return styles.status_confirmed;
        if (res.status === 'cancelled') return styles.status_cancelled;
        if (isExpired(res)) return styles.status_expired;
        return styles.status_pending;
    };

    const renderStatus = (res: Reservation) => {
        if (res.status === 'pending') {
            return isExpired(res) ? 'EXPIRADA' : `PENDIENTE (${getPendingText(res)})`;
        }
        return res.status.toUpperCase();
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Reservas</h1>
                <div className={styles.actionButtons}>
                    <button onClick={clearExpired} className={styles.cleanBtn}>
                        <span className="material-symbols-outlined">delete_sweep</span>
                        Limpiar Vencidas
                    </button>
                    <button onClick={() => setShowForm(!showForm)} className={styles.createBtn}>
                        <span className="material-symbols-outlined">{showForm ? 'close' : 'add'}</span>
                        {showForm ? 'Cancelar' : 'Nueva Reserva'}
                    </button>
                </div>
            </div>

            {showForm && (
                <form onSubmit={handleCreate} className={styles.formContainer}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#1a1a1a' }}>Añadir Reserva Manual</h2>
                    <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>Ingresa los datos para bloquear las fechas de una reserva directa.</p>
                    
                    <div className={styles.formGrid}>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Nombre del Huésped</label>
                            <input required value={formData.guest_name} onChange={e => setFormData({...formData, guest_name: e.target.value})} className={styles.input} />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Correo Electrónico</label>
                            <input type="email" required value={formData.guest_email} onChange={e => setFormData({...formData, guest_email: e.target.value})} className={styles.input} />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Propiedad</label>
                            <select required value={formData.property_id} onChange={e => setFormData({...formData, property_id: e.target.value})} className={styles.select}>
                                <option value="" disabled>Seleccionar...</option>
                                {properties.map(p => (
                                    <option key={p.id} value={p.id}>{getPropName(p.name)}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Check-in</label>
                            <input type="date" required value={formData.check_in} onChange={e => setFormData({...formData, check_in: e.target.value})} className={styles.input} />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Check-out</label>
                            <input type="date" required value={formData.check_out} onChange={e => setFormData({...formData, check_out: e.target.value})} className={styles.input} />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Precio Total (COP)</label>
                            <input type="number" required value={formData.total_price || ''} onChange={e => setFormData({...formData, total_price: Number(e.target.value)})} className={styles.input} />
                        </div>
                    </div>
                    
                    <div className={styles.formActions}>
                        <button type="button" onClick={handleWompiPayment} className={styles.wompiBtn}>
                            <span className="material-symbols-outlined">payments</span>
                            Pagar con Wompi
                        </button>
                        <button type="submit" className={styles.createBtn}>
                            Confirmar Manualmente
                        </button>
                    </div>
                </form>
            )}

            {/* Desktop View */}
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead className={styles.thead}>
                        <tr className={styles.tr}>
                            <th className={styles.th}>Huésped</th>
                            <th className={styles.th}>Propiedad</th>
                            <th className={styles.th}>Llegada / Salida</th>
                            <th className={styles.th}>Total</th>
                            <th className={styles.th}>Estado</th>
                            <th className={styles.th}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>Cargando reservas...</td>
                            </tr>
                        ) : reservations.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No hay reservas registradas.</td>
                            </tr>
                        ) : (
                            reservations.map((res) => (
                                <tr key={res.id} className={styles.tr}>
                                    <td className={styles.td}>
                                        <div style={{ fontWeight: 600, color: '#1a1a1a' }}>{res.guest_name}</div>
                                        <div className={styles.email}>{res.guest_email}</div>
                                    </td>
                                    <td className={styles.td}>{getPropName(res.properties?.name)}</td>
                                    <td className={styles.td}>
                                        {res.check_in} <br/> <span className={styles.email}>a</span> {res.check_out}
                                    </td>
                                    <td className={styles.td} style={{ fontWeight: 500 }}>
                                        ${res.total_price?.toLocaleString()} {res.currency}
                                    </td>
                                    <td className={styles.td}>
                                        <span className={`${styles.statusPill} ${getStatusClass(res)}`}>
                                            {renderStatus(res)}
                                        </span>
                                    </td>
                                    <td className={styles.td}>
                                        <select 
                                            value={res.status}
                                            onChange={(e) => updateStatus(res.id, e.target.value)}
                                            className={styles.statusSelect}
                                        >
                                            <option value="pending">Pendiente</option>
                                            <option value="confirmed">Confirmada</option>
                                            <option value="cancelled">Cancelada</option>
                                        </select>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile View */}
            <div className={styles.cardsContainer}>
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>Cargando reservas...</div>
                ) : reservations.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No hay reservas registradas.</div>
                ) : (
                    reservations.map((res) => (
                        <div key={res.id} className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div className={styles.cardPropName}>{getPropName(res.properties?.name)}</div>
                                <span className={`${styles.statusPill} ${getStatusClass(res)}`}>
                                    {renderStatus(res)}
                                </span>
                            </div>
                            
                            <div className={styles.cardGuestInfo}>
                                <div style={{ fontWeight: 700 }}>{res.guest_name}</div>
                                <div className={styles.email}>{res.guest_email}</div>
                            </div>

                            <div className={styles.cardDates}>
                                <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: '#666' }}>calendar_today</span>
                                <span>{res.check_in}</span>
                                <span style={{ color: '#ccc' }}>→</span>
                                <span>{res.check_out}</span>
                            </div>

                            <div className={styles.cardFooter}>
                                <div className={styles.priceDisplay}>
                                    ${res.total_price?.toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#666' }}>{res.currency}</span>
                                </div>
                                <select 
                                    value={res.status}
                                    onChange={(e) => updateStatus(res.id, e.target.value)}
                                    className={styles.statusSelect}
                                    style={{ padding: '0.5rem 0.25rem' }}
                                >
                                    <option value="pending">Pendiente</option>
                                    <option value="confirmed">Confirmada</option>
                                    <option value="cancelled">Cancelada</option>
                                </select>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
