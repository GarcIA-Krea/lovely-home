'use client';

import React, { useState } from 'react';
import styles from './Settings.module.css';

export default function SettingsPage() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            setError('La nueva contraseña y la confirmación no coinciden.');
            return;
        }

        if (newPassword.length < 8) {
            setError('La nueva contraseña debe tener al menos 8 caracteres.');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/admin/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Ocurrió un error al cambiar la contraseña.');
            } else {
                setSuccess('¡Contraseña actualizada exitosamente!');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            }
        } catch (err: any) {
            setError('Ocurrió un error inesperado al conectar con el servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '1440px', margin: '0 auto', paddingBottom: '3rem' }}>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '2rem', color: '#1a1a1a', letterSpacing: '-0.02em' }}>
                Configuración <span style={{ color: '#c6e26a' }}>Administrador</span>
            </h1>

            <div className={styles.container}>
                <h2 className={styles.title}>Cambiar Contraseña</h2>
                <p className={styles.description}>
                    Actualiza la contraseña maestra que utilizas para acceder a este panel de administración.
                </p>

                {error && <div className={styles.error}>{error}</div>}
                {success && <div className={styles.success}>{success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Contraseña Actual</label>
                        <input
                            type="password"
                            className={styles.input}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Nueva Contraseña</label>
                        <input
                            type="password"
                            className={styles.input}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Confirmar Nueva Contraseña</label>
                        <input
                            type="password"
                            className={styles.input}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        className={styles.submitBtn}
                        disabled={loading}
                    >
                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </form>
            </div>
        </div>
    );
}
