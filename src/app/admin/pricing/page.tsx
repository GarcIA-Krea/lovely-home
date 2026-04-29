'use client';

import React, { useState, useEffect } from 'react';
import styles from './pricing.module.css';

type Tab = 'seasons' | 'events' | 'dow' | 'limits';

export default function PricingAdminPage() {
    const [activeTab, setActiveTab] = useState<Tab>('seasons');
    const [properties, setProperties] = useState<any[]>([]);
    const [selectedPropertyId, setSelectedPropertyId] = useState<string>('all');
    
    const [seasons, setSeasons] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [dowRules, setDowRules] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);

    // Form states
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        fetchData();
    }, [activeTab, selectedPropertyId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (properties.length === 0) {
                const res = await fetch('/api/admin/pricing/properties');
                const data = await res.json();
                setProperties(data || []);
            }

            if (activeTab === 'seasons') {
                const res = await fetch('/api/admin/pricing/seasons');
                setSeasons(await res.json());
            } else if (activeTab === 'events') {
                const res = await fetch('/api/admin/pricing/events');
                setEvents(await res.json());
            } else if (activeTab === 'dow' && selectedPropertyId !== 'all') {
                const res = await fetch(`/api/admin/pricing/dow?property_id=${selectedPropertyId}`);
                setDowRules(await res.json());
            }
        } catch (error) {
            console.error('Error fetching pricing data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (type: string, id: string) => {
        if (!confirm('¿Seguro que deseas eliminar este registro?')) return;
        
        await fetch(`/api/admin/pricing/${type}?id=${id}`, { method: 'DELETE' });
        fetchData();
    };

    const handleSaveForm = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = { ...formData };
        if (payload.multiplier) payload.multiplier = Number(payload.multiplier);
        
        await fetch(`/api/admin/pricing/${activeTab}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        setShowForm(false);
        setFormData({});
        fetchData();
    };

    const handleSaveLimits = async (property: any) => {
        await fetch(`/api/admin/pricing/properties`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: property.id,
                price_min: Number(property.price_min),
                price_max: Number(property.price_max),
                last_minute_discount: Number(property.last_minute_discount)
            })
        });
        alert('Límites guardados');
    };

    const handleDowChange = async (dayOfWeek: number, multiplier: number) => {
        if (selectedPropertyId === 'all') return;
        await fetch(`/api/admin/pricing/dow`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                property_id: selectedPropertyId,
                day_of_week: dayOfWeek,
                multiplier: multiplier
            })
        });
        fetchData();
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>💰 Tarifas Dinámicas</h1>
                <p>Configura las reglas matemáticas para maximizar la ocupación y los ingresos.</p>
            </div>

            <div className={styles.tabs}>
                <button className={`${styles.tab} ${activeTab === 'seasons' ? styles.activeTab : ''}`} onClick={() => setActiveTab('seasons')}>
                    Temporadas
                </button>
                <button className={`${styles.tab} ${activeTab === 'events' ? styles.activeTab : ''}`} onClick={() => setActiveTab('events')}>
                    Eventos de Ciudad
                </button>
                <button className={`${styles.tab} ${activeTab === 'dow' ? styles.activeTab : ''}`} onClick={() => setActiveTab('dow')}>
                    Días de la Semana
                </button>
                <button className={`${styles.tab} ${activeTab === 'limits' ? styles.activeTab : ''}`} onClick={() => setActiveTab('limits')}>
                    Límites x Propiedad
                </button>
            </div>

            <div className={styles.panel}>
                {loading && <p>Cargando datos...</p>}

                {/* TEMPORADAS & EVENTOS */}
                {(!loading && (activeTab === 'seasons' || activeTab === 'events')) && (
                    <>
                        <div className={styles.sectionTitle}>
                            <span>{activeTab === 'seasons' ? 'Temporadas Altas/Bajas' : 'Eventos Especiales'}</span>
                            <button className={styles.primaryBtn} onClick={() => setShowForm(!showForm)}>
                                <span className="material-symbols-outlined">{showForm ? 'close' : 'add'}</span>
                                Nuevo {activeTab === 'seasons' ? 'Temporada' : 'Evento'}
                            </button>
                        </div>

                        {showForm && (
                            <form onSubmit={handleSaveForm} style={{ background: 'var(--background)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
                                <div className={styles.formGrid}>
                                    <div className={styles.inputGroup}>
                                        <label>Nombre</label>
                                        <input type="text" required onChange={e => setFormData({...formData, name: e.target.value})} />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Fecha Inicio</label>
                                        <input type="date" required onChange={e => setFormData({...formData, start_date: e.target.value})} />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Fecha Fin</label>
                                        <input type="date" required onChange={e => setFormData({...formData, end_date: e.target.value})} />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Multiplicador (Ej: 1.5 para +50%)</label>
                                        <input type="number" step="0.01" required onChange={e => setFormData({...formData, multiplier: e.target.value})} />
                                    </div>
                                </div>
                                <button type="submit" className={styles.saveBtn}>Guardar Regla</button>
                            </form>
                        )}

                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Fechas</th>
                                    <th>Ajuste Precio</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(activeTab === 'seasons' ? seasons : events).map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.name}</td>
                                        <td>{item.start_date} al {item.end_date}</td>
                                        <td>
                                            {item.multiplier > 1 
                                                ? <span style={{color: '#10B981'}}>+{Math.round((item.multiplier - 1) * 100)}%</span>
                                                : <span style={{color: '#ef4444'}}>-{Math.round((1 - item.multiplier) * 100)}%</span>
                                            }
                                        </td>
                                        <td>
                                            <button className={styles.deleteBtn} onClick={() => handleDelete(activeTab, item.id)}>Borrar</button>
                                        </td>
                                    </tr>
                                ))}
                                {(activeTab === 'seasons' ? seasons : events).length === 0 && (
                                    <tr><td colSpan={4} style={{textAlign: 'center', padding: '2rem'}}>No hay reglas creadas</td></tr>
                                )}
                            </tbody>
                        </table>
                    </>
                )}

                {/* DÍAS DE LA SEMANA */}
                {(!loading && activeTab === 'dow') && (
                    <>
                        <div className={styles.propertySelector}>
                            <strong>Seleccionar Propiedad:</strong>
                            <select value={selectedPropertyId} onChange={(e) => setSelectedPropertyId(e.target.value)}>
                                <option value="all" disabled>Elige una propiedad...</option>
                                {properties.map(p => (
                                    <option key={p.id} value={p.id}>{p.name?.es || p.name || 'Sin nombre'}</option>
                                ))}
                            </select>
                        </div>

                        {selectedPropertyId !== 'all' && (
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Día de la Semana</th>
                                        <th>Multiplicador Actual</th>
                                        <th>Nuevo Ajuste</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map((day, index) => {
                                        const rule = dowRules.find(r => r.day_of_week === index);
                                        const mult = rule ? rule.multiplier : 1;
                                        return (
                                            <tr key={index}>
                                                <td>{day}</td>
                                                <td>{mult}x</td>
                                                <td>
                                                    <select 
                                                        value={mult} 
                                                        onChange={(e) => handleDowChange(index, Number(e.target.value))}
                                                    >
                                                        <option value={0.8}>-20% (Promoción)</option>
                                                        <option value={0.9}>-10%</option>
                                                        <option value={1.0}>Normal (Sin cambio)</option>
                                                        <option value={1.1}>+10% (Alta demanda)</option>
                                                        <option value={1.2}>+20%</option>
                                                        <option value={1.3}>+30%</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </>
                )}

                {/* LÍMITES X PROPIEDAD */}
                {(!loading && activeTab === 'limits') && (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Propiedad</th>
                                <th>Precio Base</th>
                                <th>Piso Mínimo</th>
                                <th>Techo Máximo</th>
                                <th>% Último Minuto</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {properties.map((p, index) => (
                                <tr key={p.id}>
                                    <td>{p.name?.es || p.name || 'Sin nombre'}</td>
                                    <td>${p.price_per_night?.toLocaleString()}</td>
                                    <td>
                                        <input type="number" value={p.price_min || ''} placeholder="Ej. 150000" onChange={(e) => {
                                            const newProps = [...properties];
                                            newProps[index].price_min = e.target.value;
                                            setProperties(newProps);
                                        }} style={{width: '100px', padding: '4px'}}/>
                                    </td>
                                    <td>
                                        <input type="number" value={p.price_max || ''} placeholder="Ej. 500000" onChange={(e) => {
                                            const newProps = [...properties];
                                            newProps[index].price_max = e.target.value;
                                            setProperties(newProps);
                                        }} style={{width: '100px', padding: '4px'}}/>
                                    </td>
                                    <td>
                                        <input type="number" step="0.01" value={p.last_minute_discount || 0.15} onChange={(e) => {
                                            const newProps = [...properties];
                                            newProps[index].last_minute_discount = e.target.value;
                                            setProperties(newProps);
                                        }} style={{width: '60px', padding: '4px'}}/>
                                    </td>
                                    <td>
                                        <button className={styles.primaryBtn} onClick={() => handleSaveLimits(p)}>Guardar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
