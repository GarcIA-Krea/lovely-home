import Link from 'next/link';
import styles from './success.module.css';

export default function BookingSuccess() {
    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.iconContainer}>
                    <span className="material-symbols-outlined">check_circle</span>
                </div>
                <h1>¡Reserva Confirmada!</h1>
                <p>Tu pago ha sido procesado con éxito. Hemos enviado los detalles a tu correo electrónico.</p>
                <div className={styles.actions}>
                    <Link href="/" className={styles.btnPrimary}>
                        Volver al Inicio
                    </Link>
                    <button className={styles.btnSecondary} onClick={() => window.print()}>
                        Imprimir Recibo
                    </button>
                </div>
            </div>
        </div>
    );
}
