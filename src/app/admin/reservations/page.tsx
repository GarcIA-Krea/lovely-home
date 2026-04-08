'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

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
        // Fetch Reservations
        const { data: resData } = await supabase
            .from('reservations')
            .select(`
                id, guest_name, guest_email, check_in, check_out, 
                total_price, currency, status, created_at,
                properties (name)
            `)
            .order('created_at', { ascending: false });

        if (resData) setReservations(resData as any);

        // Fetch Properties for the dropdown
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
                status: 'confirmed'
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

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1a1a1a', margin: 0 }}>Reservas</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button 
                        onClick={clearExpired}
                        style={{
                            background: '#fdecea', color: '#c62828', padding: '0.75rem 1.5rem', borderRadius: '8px', 
                            border: '1px solid #f4cdd2', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem'
                        }}
                    >
                        <span className="material-symbols-outlined">delete_sweep</span>
                        Limpiar Vencidas
                    </button>
                    <button 
                        onClick={() => setShowForm(!showForm)}
                        style={{
                            background: '#000', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '8px', 
                            border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem'
                        }}
                    >
                        <span className="material-symbols-outlined">{showForm ? 'close' : 'add'}</span>
                        {showForm ? 'Cancelar' : 'Nueva Reserva'}
                    </button>
                </div>
            </div>

            {showForm && (
                <form onSubmit={handleCreate} style={{ background: '#fff', padding: '2rem', borderRadius: '12px', border: '1px solid #eaeaea', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#1a1a1a' }}>Anadir Reserva Manual</h2>
                    <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>Ingresa los datos para bloquear las fechas de una reserva directa.</p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Nombre del Huésped</label>
                            <input required value={formData.guest_name} onChange={e => setFormData({...formData, guest_name: e.target.value})} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Còrreo Electrónico</label>
                            <input type="email" required value={formData.guest_email} onChange={e => setFormData({...formData, guest_email: e.target.value})} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Propiedad</label>
                            <select required value={formData.property_id} onChange={e => setFormData({...formData, property_id: e.target.value})} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', background: '#fff' }}>
                                <option value="" disabled>Seleccionar...</option>
                                {properties.map(p => (
                                    <option key={p.id} value={p.id}>{getPropName(p.name)}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Check-in</label>
                            <input type="date" required value={formData.check_in} onChange={e => setFormData({...formData, check_in: e.target.value})} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Check-out</label>
                            <input type="date" required value={formData.check_out} onChange={e => setFormData({...formData, check_out: e.target.value})} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Precio Total (COP)</label>
                            <input type="number" required value={formData.total_price || ''} onChange={e => setFormData({...formData, total_price: Number(e.target.value)})} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', gap: '1rem' }}>
                        <button type="button" onClick={handleWompiPayment} style={{ background: '#4c2882', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className="material-symbols-outlined">payments</span>
                            Pagar con Wompi
                        </button>
                        <button type="submit" style={{ background: '#000', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                            Confirmar Manualmente
                        </button>
                    </div>
                </form>
            )}

            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #eaeaea', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: '#f8f8f8', borderBottom: '1px solid #eaeaea' }}>
                        <tr>
                            <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.85rem', color: '#666' }}>Huésped</th>
                            <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.85rem', color: '#666' }}>Propiedad</th>
                            <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.85rem', color: '#666' }}>Llegada / Salida</th>
                            <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.85rem', color: '#666' }}>Total</th>
                            <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.85rem', color: '#666' }}>Estado</th>
                            <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.85rem', color: '#666' }}>Acciones</th>
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
                                <tr key={res.id} style={{ borderBottom: '1px solid #eaeaea' }}>
                                    <td style={{ padding: '1rem', fontSize: '0.9rem' }}>
                                        <div style={{ fontWeight: 600, color: '#1a1a1a' }}>{res.guest_name}</div>
                                        <div style={{ color: '#666', fontSize: '0.8rem' }}>{res.guest_email}</div>
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#1a1a1a' }}>
                                        {getPropName(res.properties?.name)}
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#1a1a1a' }}>
                                        {res.check_in} <br/> <span style={{ color: '#666', fontSize: '0.8rem' }}>a</span> {res.check_out}
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#1a1a1a', fontWeight: 500 }}>
                                        ${res.total_price?.toLocaleString()} {res.currency}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '99px',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            background: res.status === 'confirmed' ? '#e6f4ea' : res.status === 'cancelled' ? '#fdecea' : isExpired(res) ? '#ffebee' : '#fff3e0',
                                            color: res.status === 'confirmed' ? '#2e7d32' : res.status === 'cancelled' ? '#c62828' : isExpired(res) ? '#d32f2f' : '#e65100',
                                        }}>
                                            {res.status === 'pending' ? (isExpired(res) ? 'EXPIRADA' : `PENDIENTE (${getPendingText(res)})`) : res.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <select 
                                            value={res.status}
                                            onChange={(e) => updateStatus(res.id, e.target.value)}
                                            style={{
                                                padding: '0.4rem',
                                                borderRadius: '6px',
                                                border: '1px solid #ddd',
                                                fontSize: '0.85rem',
                                                cursor: 'pointer'
                                            }}
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
        </div>
    );
}
