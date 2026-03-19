'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Login.module.css';

export default function AdminLogin() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });

            if (res.ok) {
                router.push('/admin/dashboard');
                router.refresh();
            } else {
                const data = await res.json();
                setError(data.error || 'Autenticación fallida');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Lovely Home Admin</h1>
                    <p className={styles.subtitle}>Panel de Administración</p>
                </div>
                
                <form onSubmit={handleLogin} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="password">Contraseña de Acceso</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoFocus
                        />
                    </div>
                    
                    {error && <p className={styles.error}>{error}</p>}
                    
                    <button type="submit" disabled={loading || !password} className={styles.submitBtn}>
                        {loading ? 'Verificando...' : 'Ingresar'}
                    </button>
                </form>
            </div>
        </div>
    );
}
