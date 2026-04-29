'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import styles from './AdminLayout.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Auto-close sidebar on route change (mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname]);

    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    const menu = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: 'dashboard' },
        { name: 'Reservas', path: '/admin/reservations', icon: 'calendar_month' },
        { name: 'Tarifas Dinámicas', path: '/admin/pricing', icon: 'payments' },
        { name: 'Propiedades', path: '/admin/properties', icon: 'apartment' },
        { name: 'Testimonios', path: '/admin/reviews', icon: 'star' },
        { name: 'Configuración', path: '/admin/settings', icon: 'settings' }
    ];

    const handleLogout = async () => {
        await fetch('/api/admin/logout', { method: 'POST' });
        router.push('/admin/login');
        router.refresh();
    };

    const activePage = menu.find(m => m.path === pathname)?.name || 'Admin';

    return (
        <div className={styles.adminContainer} translate="no">
            {/* Mobile Header */}
            <header className={styles.mobileHeader}>
                <button 
                    className={styles.hamburger} 
                    onClick={() => setSidebarOpen(true)}
                    aria-label="Abrir menú"
                >
                    <span className="material-symbols-outlined">menu</span>
                </button>
                <div className={styles.mobileTitle}>{activePage}</div>
                <div style={{ width: '40px' }} /> {/* Spacer for centering title */}
            </header>

            {/* Sidebar Overlay (Mobile) */}
            <div 
                className={`${styles.sidebarOverlay} ${sidebarOpen ? styles.overlayOpen : ''}`}
                onClick={() => setSidebarOpen(false)}
            />

            <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.brand}>Lovely <span>Admin</span></div>
                    <button 
                        className={styles.closeSidebar} 
                        onClick={() => setSidebarOpen(false)}
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <nav className={styles.nav}>
                    {menu.map((item) => (
                        <Link 
                            key={item.path} 
                            href={item.path}
                            className={`${styles.navItem} ${pathname === item.path ? styles.active : ''}`}
                        >
                            <span className="material-symbols-outlined">{item.icon}</span>
                            {item.name}
                        </Link>
                    ))}
                </nav>
                <div className={styles.sidebarFooter}>
                    <button onClick={handleLogout} className={styles.logoutBtn}>
                        <span className="material-symbols-outlined">logout</span>
                        Cerrar Sesión
                    </button>
                    <Link href="/" target="_blank" className={styles.siteLink}>
                        <span className="material-symbols-outlined">open_in_new</span>
                        Ver Sitio Web
                    </Link>
                </div>
            </aside>

            <main className={styles.mainContent}>
                {children}
            </main>
        </div>
    );
}
