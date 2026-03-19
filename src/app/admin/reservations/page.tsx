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

export default function ReservationsPage() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchReservations = async () => {
        const { data, error } = await supabase
            .from('reservations')
            .select(`
                id, guest_name, guest_email, check_in, check_out, 
                total_price, currency, status, created_at,
                properties (name)
            `)
            .order('created_at', { ascending: false });

        if (data) {
            setReservations(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchReservations();
    }, []);

    const updateStatus = async (id: string, newStatus: string) => {
        const { error } = await supabase
            .from('reservations')
            .update({ status: newStatus })
            .eq('id', id);
        
        if (!error) {
            fetchReservations();
        } else {
            alert('Error al actualizar el estado: ' + error.message);
        }
    };

    const getPropName = (nameObj: any) => {
        if (!nameObj) return 'Desconocida';
        let parsed = typeof nameObj === 'string' ? JSON.parse(nameObj) : nameObj;
        return parsed?.es || 'Desconocida';
    };

    return (
        <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1.5rem', color: '#1a1a1a' }}>Reservas</h1>

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
                                            background: res.status === 'confirmed' ? '#e6f4ea' : res.status === 'cancelled' ? '#fdecea' : '#fff3e0',
                                            color: res.status === 'confirmed' ? '#2e7d32' : res.status === 'cancelled' ? '#c62828' : '#e65100',
                                        }}>
                                            {res.status.toUpperCase()}
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
