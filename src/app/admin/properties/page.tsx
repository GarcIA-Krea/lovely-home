'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface PropertyImage {
    id: string;
    image_url: string;
}

interface Property {
    id: string;
    name: any;
    price_per_night: number;
    airbnb_url: string;
    booking_url: string;
    airbnb_ical_url: string;
    booking_ical_url: string;
    property_images?: PropertyImage[];
}

export default function PropertiesAdminPage() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [photoModalProperty, setPhotoModalProperty] = useState<Property | null>(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    const fetchProperties = async () => {
        const { data, error } = await supabase
            .from('properties')
            .select(`
                id, name, price_per_night, airbnb_url, booking_url, airbnb_ical_url, booking_ical_url,
                property_images (id, image_url)
            `)
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
        
        try {
            const res = await fetch('/api/admin/properties', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: property.id,
                    price_per_night: property.price_per_night,
                    airbnb_url: property.airbnb_url,
                    booking_url: property.booking_url,
                    airbnb_ical_url: property.airbnb_ical_url,
                    booking_ical_url: property.booking_ical_url
                })
            });
            const result = await res.json();
            
            if (!res.ok || result.error) {
                alert('Error al guardar: ' + (result.error || 'Error interno del servidor'));
            } else {
                alert('¡Propiedad actualizada exitosamente en la base de datos!');
            }
        } catch (error: any) {
            alert('Error de red al intentar guardar: ' + error.message);
        }
        
        setSavingId(null);
    };

    const getPropName = (nameObj: any) => {
        if (!nameObj) return 'Desconocida';
        let parsed = typeof nameObj === 'string' ? JSON.parse(nameObj) : nameObj;
        return parsed?.es || 'Desconocida';
    };

    const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0] || !photoModalProperty) return;
        
        setUploadingPhoto(true);
        const formData = new FormData();
        formData.append('file', e.target.files[0]);
        formData.append('propertyId', photoModalProperty.id);
        
        try {
            const res = await fetch('/api/admin/properties/photos', { method: 'POST', body: formData });
            const result = await res.json();
            
            if (res.ok && result.success && result.data) {
                fetchProperties();
                setPhotoModalProperty(prev => prev ? { 
                    ...prev, 
                    property_images: [...(prev.property_images || []), result.data[0]] 
                } : null);
            } else {
                alert('Error al subir la foto: ' + (result.error || 'Desconocido'));
            }
        } catch(error: any) {
            alert('Error subiendo foto: ' + error.message);
        }
        setUploadingPhoto(false);
        e.target.value = '';
    };

    const handleDeletePhoto = async (id: string, url: string) => {
        if (!confirm('¿Estás seguro de eliminar esta foto?')) return;
        
        try {
            const res = await fetch(`/api/admin/properties/photos?id=${id}&url=${encodeURIComponent(url)}`, { method: 'DELETE' });
            const result = await res.json();
            
            if (res.ok && result.success) {
                fetchProperties();
                setPhotoModalProperty(prev => prev ? { 
                    ...prev, 
                    property_images: prev.property_images?.filter(img => img.id !== id) 
                } : null);
            } else {
                alert('Error al eliminar: ' + (result.error || 'Desconocido'));
            }
        } catch(error: any) {
            alert('Error eliminando foto: ' + error.message);
        }
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
                                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FF5A5F' }}>Link de Exportación Airbnb (iCal)</label>
                                    <input 
                                        type="url" 
                                        placeholder="https://www.airbnb.com.co/calendar/ical/..."
                                        value={prop.airbnb_ical_url || ''}
                                        onChange={(e) => handleUpdate(prop.id, 'airbnb_ical_url', e.target.value)}
                                        style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#003580' }}>Link de Exportación Booking (iCal)</label>
                                    <input 
                                        type="url" 
                                        placeholder="https://ical.booking.com/v1/export?..."
                                        value={prop.booking_ical_url || ''}
                                        onChange={(e) => handleUpdate(prop.id, 'booking_ical_url', e.target.value)}
                                        style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#666' }}>URL Pública Airbnb</label>
                                    <input 
                                        type="url" 
                                        placeholder="https://airbnb.com/h/ejemplo"
                                        value={prop.airbnb_url || ''}
                                        onChange={(e) => handleUpdate(prop.id, 'airbnb_url', e.target.value)}
                                        style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#666' }}>URL Pública Booking.com</label>
                                    <input 
                                        type="url" 
                                        placeholder="https://booking.com/hotel/..."
                                        value={prop.booking_url || ''}
                                        onChange={(e) => handleUpdate(prop.id, 'booking_url', e.target.value)}
                                        style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                                    />
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem', gap: '1rem' }}>
                                <button 
                                    onClick={() => setPhotoModalProperty(prop)}
                                    style={{
                                        background: '#f8f8f8', color: '#1a1a1a', padding: '0.75rem 1.5rem', borderRadius: '8px', 
                                        border: '1px solid #ddd', fontWeight: 600, cursor: 'pointer',
                                    }}
                                >
                                    Gestionar Fotos
                                </button>
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

            {photoModalProperty && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Fotos - {getPropName(photoModalProperty.name)}</h2>
                            <button onClick={() => setPhotoModalProperty(null)} style={{ background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', color: '#666' }}>&times;</button>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                            {photoModalProperty.property_images?.map(img => (
                                <div key={img.id} style={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' }}>
                                    <img src={img.image_url} alt="Propiedad" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <button 
                                        onClick={() => handleDeletePhoto(img.id, img.image_url)}
                                        style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: '#d32f2f', color: '#fff', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}
                                    >
                                        &times;
                                    </button>
                                </div>
                            ))}
                            {(!photoModalProperty.property_images || photoModalProperty.property_images.length === 0) && (
                                <p style={{ color: '#666', gridColumn: '1 / -1' }}>No hay fotos cargadas por ahora.</p>
                            )}
                        </div>
                        
                        <div style={{ background: '#f8f8f8', padding: '1.5rem', borderRadius: '8px', border: '1px dashed #ccc', textAlign: 'center' }}>
                            <p style={{ margin: '0 0 1rem 0', fontWeight: 600 }}>{uploadingPhoto ? 'Subiendo archivo...' : 'Añadir nueva foto'}</p>
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleUploadPhoto}
                                disabled={uploadingPhoto}
                                style={{
                                    padding: '0.5rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    background: '#fff',
                                    cursor: uploadingPhoto ? 'not-allowed' : 'pointer'
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
