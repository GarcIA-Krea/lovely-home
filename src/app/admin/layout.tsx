'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './AdminLayout.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    const menu = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: 'dashboard' },
        { name: 'Reservas', path: '/admin/reservations', icon: 'calendar_month' },
        { name: 'Propiedades', path: '/admin/properties', icon: 'apartment' },
        { name: 'Testimonios', path: '/admin/reviews', icon: 'star' },
        { name: 'Configuración', path: '/admin/settings', icon: 'settings' }
    ];

    const handleLogout = async () => {
        await fetch('/api/admin/logout', { method: 'POST' });
        router.push('/admin/login');
        router.refresh();
    };

    return (
        <div className={styles.adminContainer} translate="no">
            <aside className={styles.sidebar}>
                <div className={styles.brand}>Lovely <span>Admin</span></div>
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
