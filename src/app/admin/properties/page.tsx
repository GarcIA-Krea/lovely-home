'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Property {
    id: string;
    name: any;
    price_per_night: number;
    airbnb_url: string;
    booking_url: string;
}

export default function PropertiesAdminPage() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState<string | null>(null);

    const fetchProperties = async () => {
        const { data, error } = await supabase
            .from('properties')
            .select('id, name, price_per_night, airbnb_url, booking_url')
            .order('name');
            
        if (data) {
            setProperties(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchProperties();
    }, []);

    const handleUpdate = (id: string, field: keyof Property, value: any) => {
        setProperties(props => props.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    const handleSave = async (property: Property) => {
        setSavingId(property.id);
        const { error } = await supabase
            .from('properties')
            .update({
                price_per_night: property.price_per_night,
                airbnb_url: property.airbnb_url,
                booking_url: property.booking_url
            })
            .eq('id', property.id);
            
        if (error) {
            alert('Error al guardar: ' + error.message);
        } else {
            alert('¡Propiedad actualizada exitosamente!');
        }
        setSavingId(null);
    };

    const getPropName = (nameObj: any) => {
        if (!nameObj) return 'Desconocida';
        let parsed = typeof nameObj === 'string' ? JSON.parse(nameObj) : nameObj;
        return parsed?.es || 'Desconocida';
    };

    return (
        <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', color: '#1a1a1a' }}>Propiedades</h1>
            <p style={{ color: '#666', marginBottom: '2rem' }}>Actualiza los precios por noche y los enlaces oficiales de las plataformas.</p>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {loading ? (
                    <div style={{ color: '#666' }}>Cargando propiedades...</div>
                ) : (
                    properties.map((prop) => (
                        <div key={prop.id} style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #eaeaea', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#1a1a1a' }}>{getPropName(prop.name)}</h2>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#333' }}>Precio por Noche (COP)</label>
                                    <input 
                                        type="number" 
                                        value={prop.price_per_night || ''}
                                        onChange={(e) => handleUpdate(prop.id, 'price_per_night', Number(e.target.value))}
                                        style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#333' }}>Enlace Airbnb</label>
                                    <input 
                                        type="url" 
                                        placeholder="https://airbnb.com/h/ejemplo"
                                        value={prop.airbnb_url || ''}
                                        onChange={(e) => handleUpdate(prop.id, 'airbnb_url', e.target.value)}
                                        style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#333' }}>Enlace Booking.com</label>
                                    <input 
                                        type="url" 
                                        placeholder="https://booking.com/hotel/..."
                                        value={prop.booking_url || ''}
                                        onChange={(e) => handleUpdate(prop.id, 'booking_url', e.target.value)}
                                        style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                                    />
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                                <button 
                                    onClick={() => handleSave(prop)}
                                    disabled={savingId === prop.id}
                                    style={{
                                        background: '#000', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '8px', 
                                        border: 'none', fontWeight: 600, cursor: savingId === prop.id ? 'not-allowed' : 'pointer',
                                    }}
                                >
                                    {savingId === prop.id ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
