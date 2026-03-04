import Link from 'next/link';
import styles from './cancel.module.css';

export default function BookingCancel() {
    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.iconContainer}>
                    <span className="material-symbols-outlined">cancel</span>
                </div>
                <h1>Pago Cancelado</h1>
                <p>No se ha realizado ningún cargo. Puedes volver atrás e intentarlo de nuevo si lo deseas.</p>
                <div className={styles.actions}>
                    <Link href="/" className={styles.btnPrimary}>
                        Volver a Intentar
                    </Link>
                </div>
            </div>
        </div>
    );
}
