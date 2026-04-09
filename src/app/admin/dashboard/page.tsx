import React from 'react';
import BookingGrid from '@/components/Admin/BookingGrid';

export default function DashboardPage() {
    return (
        <div style={{ maxWidth: '1440px', margin: '0 auto', paddingBottom: '3rem' }}>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '2rem', color: '#1a1a1a', letterSpacing: '-0.02em' }}>
                Dashboard <span style={{ color: '#c6e26a' }}>Administrador</span>
            </h1>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #eaeaea', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
                    <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ocupación Total</p>
                    <p style={{ fontSize: '2.25rem', fontWeight: 800, color: '#000' }}>--%</p>
                </div>
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #eaeaea', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
                    <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ingresos Mes</p>
                    <p style={{ fontSize: '2.25rem', fontWeight: 800, color: '#000' }}>-- COP</p>
                </div>
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #eaeaea', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
                    <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Huéspedes Activos</p>
                    <p style={{ fontSize: '2.25rem', fontWeight: 800, color: '#000' }}>--</p>
                </div>
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.25rem', color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="material-symbols-outlined" style={{ color: '#c6e26a' }}>calendar_month</span>
                Calendario Maestro de Disponibilidad
            </h2>
            
            <BookingGrid />
        </div>
    );
}
