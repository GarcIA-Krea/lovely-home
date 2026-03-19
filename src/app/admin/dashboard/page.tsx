import React from 'react';

export default function DashboardPage() {
    return (
        <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1.5rem', color: '#1a1a1a' }}>Vista General</h1>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #eaeaea' }}>
                    <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 500 }}>Reservas Este Mes</p>
                    <p style={{ fontSize: '2rem', fontWeight: 700, color: '#000' }}>--</p>
                </div>
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #eaeaea' }}>
                    <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 500 }}>Ingresos Estimados</p>
                    <p style={{ fontSize: '2rem', fontWeight: 700, color: '#000' }}>-- COP</p>
                </div>
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #eaeaea' }}>
                    <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 500 }}>Propiedades Activas</p>
                    <p style={{ fontSize: '2rem', fontWeight: 700, color: '#000' }}>5</p>
                </div>
            </div>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#1a1a1a' }}>Próximas Llegadas</h2>
            <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', border: '1px solid #eaeaea', textAlign: 'center', color: '#666' }}>
                Ve a la pestaña de Reservas para gestionar a los huéspedes.
            </div>
        </div>
    );
}
