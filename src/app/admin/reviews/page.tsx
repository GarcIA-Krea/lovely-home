'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Testimonial {
    id: string;
    name: string;
    city: string;
    quote: string;
    avatar_url: string;
    created_at?: string;
}

export default function ReviewsAdminPage() {
    const [reviews, setReviews] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    
    const [formData, setFormData] = useState({ name: '', city: '', quote: '', avatar_url: '' });

    const fetchReviews = async () => {
        const { data, error } = await supabase
            .from('testimonials')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (data) setReviews(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/admin/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        const result = await res.json();
        
        if (!res.ok || result.error) {
            alert('Error al crear reseña: ' + (result.error || 'Desconocido'));
        } else {
            setFormData({ name: '', city: '', quote: '', avatar_url: '' });
            setShowForm(false);
            fetchReviews();
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este testimonio?')) return;
        
        const res = await fetch(`/api/admin/reviews?id=${id}`, { method: 'DELETE' });
        const result = await res.json();
        if (!res.ok || result.error) {
            alert('Error al eliminar: ' + (result.error || 'Desconocido'));
        } else {
            fetchReviews();
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', color: '#1a1a1a' }}>Testimonios</h1>
                    <p style={{ color: '#666' }}>Gestiona las reseñas que aparecen en la página principal.</p>
                </div>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    style={{
                        background: '#000', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '8px', 
                        border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem'
                    }}
                >
                    <span className="material-symbols-outlined">{showForm ? 'close' : 'add'}</span>
                    {showForm ? 'Cancelar' : 'Añadir Reseña'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleCreate} style={{ background: '#fff', padding: '2rem', borderRadius: '12px', border: '1px solid #eaeaea', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#1a1a1a' }}>Nueva Reseña</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Nombre del Huésped</label>
                            <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>País o Ciudad</label>
                            <input required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Cita / Reseña</label>
                        <textarea required value={formData.quote} onChange={e => setFormData({...formData, quote: e.target.value})} rows={3} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', resize: 'vertical' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                        <button type="submit" style={{ background: '#000', color: '#fff', padding: '0.75rem 2rem', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                            Publicar Testimonio
                        </button>
                    </div>
                </form>
            )}

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {loading ? (
                    <div style={{ color: '#666' }}>Cargando testimonios...</div>
                ) : reviews.length === 0 ? (
                    <div style={{ color: '#666', background: '#fff', padding: '2rem', borderRadius: '12px', textAlign: 'center', border: '1px solid #eaeaea' }}>
                        No hay testimonios registrados. Asegúrate de haber ejecutado el script SQL en Supabase.
                    </div>
                ) : (
                    reviews.map((rev) => (
                        <div key={rev.id} style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #eaeaea', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1a1a1a' }}>{rev.name}</h3>
                                    <span style={{ color: '#666', fontSize: '0.9rem' }}>• {rev.city}</span>
                                </div>
                                <p style={{ color: '#444', fontStyle: 'italic', margin: 0, lineHeight: 1.5 }}>"{rev.quote}"</p>
                            </div>
                            <button onClick={() => handleDelete(rev.id)} style={{ background: '#fff0f0', color: '#d32f2f', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span className="material-symbols-outlined">delete</span>
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
