/**
 * notifications.ts — Motor Central de Notificaciones para Lovely Home
 *
 * Maneja dos canales:
 *  1. Email (Resend) → Notificación detallada con HTML bonito
 *  2. WhatsApp (CallMeBot) → Mensaje rápido al instante
 *
 * Se dispara desde:
 *  - /api/checkout          → Nueva reserva creada (estado: pending)
 *  - /api/webhooks/wompi    → Pago confirmado (estado: confirmed)
 *  - /api/admin/reservations → Reserva manual creada por la admin
 */

import { Resend } from 'resend';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

export type NotificationType = 'new_reservation' | 'confirmed_reservation' | 'manual_reservation' | 'cancelled_reservation';

export interface ReservationNotificationData {
  reservationId: string;
  guestName: string;
  guestEmail: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  totalPrice: number;
  currency: string;
  platform?: string;
}

// ─────────────────────────────────────────────
// Helper: Formatear precio
// ─────────────────────────────────────────────

function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: currency === 'COP' ? 'COP' : 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ─────────────────────────────────────────────
// Helper: Formatear fecha
// ─────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00'); // evitar problemas de timezone
  return date.toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// ─────────────────────────────────────────────
// Templates de Email
// ─────────────────────────────────────────────

function buildEmailTemplate(type: NotificationType, data: ReservationNotificationData): { subject: string; html: string } {
  const priceFormatted = formatPrice(data.totalPrice, data.currency);
  const checkInFormatted = formatDate(data.checkIn);
  const checkOutFormatted = formatDate(data.checkOut);

  const statusConfig: Record<NotificationType, { emoji: string; label: string; color: string; message: string }> = {
    new_reservation: {
      emoji: '🔔',
      label: 'Nueva Reserva Pendiente',
      color: '#F59E0B',
      message: 'Se ha registrado una nueva solicitud de reserva. El pago está en proceso.',
    },
    confirmed_reservation: {
      emoji: '✅',
      label: '¡Reserva Confirmada!',
      color: '#10B981',
      message: 'El pago fue aprobado exitosamente. La reserva está confirmada.',
    },
    manual_reservation: {
      emoji: '📝',
      label: 'Reserva Manual Creada',
      color: '#6366F1',
      message: 'Se ha creado una reserva manual desde el panel de administración.',
    },
    cancelled_reservation: {
      emoji: '❌',
      label: 'Reserva Cancelada',
      color: '#EF4444',
      message: 'El pago fue rechazado o cancelado. La reserva ha sido marcada como cancelada.',
    },
  };

  const config = statusConfig[type];

  const subject = `${config.emoji} Lovely Home — ${config.label} | ${data.propertyName}`;

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#0f0f0f;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f0f;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:580px;background-color:#1a1a1a;border-radius:16px;overflow:hidden;border:1px solid #2a2a2a;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a1a1a 0%,#2a2a2a 100%);padding:36px 40px;text-align:center;border-bottom:1px solid #2a2a2a;">
              <p style="margin:0 0 8px 0;font-size:11px;letter-spacing:4px;color:#888;text-transform:uppercase;">Panel de Administración</p>
              <h1 style="margin:0;font-size:28px;font-weight:300;color:#f5f0e8;letter-spacing:2px;">Lovely Home</h1>
              <p style="margin:12px 0 0 0;font-size:12px;color:#666;">lovelyhome.com.co</p>
            </td>
          </tr>

          <!-- Status Badge -->
          <tr>
            <td style="padding:32px 40px 0 40px;text-align:center;">
              <div style="display:inline-block;background-color:${config.color}22;border:1px solid ${config.color}66;border-radius:24px;padding:10px 24px;">
                <span style="font-size:20px;">${config.emoji}</span>
                <span style="margin-left:8px;font-size:14px;font-weight:600;color:${config.color};letter-spacing:1px;">${config.label}</span>
              </div>
              <p style="margin:16px 0 0 0;font-size:14px;color:#999;line-height:1.6;">${config.message}</p>
            </td>
          </tr>

          <!-- Property Name -->
          <tr>
            <td style="padding:28px 40px 0 40px;text-align:center;">
              <p style="margin:0;font-size:11px;letter-spacing:3px;color:#666;text-transform:uppercase;">Propiedad</p>
              <h2 style="margin:6px 0 0 0;font-size:22px;font-weight:400;color:#f5f0e8;">${data.propertyName}</h2>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:24px 40px;">
              <div style="height:1px;background:linear-gradient(to right,transparent,#333,transparent);"></div>
            </td>
          </tr>

          <!-- Details Grid -->
          <tr>
            <td style="padding:0 40px 32px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <!-- Guest Info -->
                  <td width="50%" style="padding-right:12px;vertical-align:top;">
                    <div style="background:#111;border:1px solid #222;border-radius:12px;padding:20px;">
                      <p style="margin:0 0 4px 0;font-size:10px;letter-spacing:2px;color:#666;text-transform:uppercase;">Huésped</p>
                      <p style="margin:0 0 6px 0;font-size:16px;color:#f0ebe0;font-weight:500;">${data.guestName}</p>
                      <p style="margin:0;font-size:12px;color:#888;">${data.guestEmail}</p>
                    </div>
                  </td>
                  <!-- Price -->
                  <td width="50%" style="padding-left:12px;vertical-align:top;">
                    <div style="background:#111;border:1px solid #222;border-radius:12px;padding:20px;">
                      <p style="margin:0 0 4px 0;font-size:10px;letter-spacing:2px;color:#666;text-transform:uppercase;">Total</p>
                      <p style="margin:0 0 6px 0;font-size:20px;color:#c8a96e;font-weight:600;">${priceFormatted}</p>
                      <p style="margin:0;font-size:12px;color:#888;">${data.nights} noche${data.nights !== 1 ? 's' : ''} · ${data.currency}</p>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-top:12px;">
                    <div style="background:#111;border:1px solid #222;border-radius:12px;padding:20px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td width="50%">
                            <p style="margin:0 0 4px 0;font-size:10px;letter-spacing:2px;color:#666;text-transform:uppercase;">Check-in</p>
                            <p style="margin:0;font-size:13px;color:#f0ebe0;">${checkInFormatted}</p>
                          </td>
                          <td width="50%" style="padding-left:16px;border-left:1px solid #222;">
                            <p style="margin:0 0 4px 0;font-size:10px;letter-spacing:2px;color:#666;text-transform:uppercase;">Check-out</p>
                            <p style="margin:0;font-size:13px;color:#f0ebe0;">${checkOutFormatted}</p>
                          </td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ID Reference -->
          <tr>
            <td style="padding:0 40px 16px 40px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#555;">ID de Reserva: <span style="font-family:monospace;color:#777;">${data.reservationId}</span></p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding:0 40px 32px 40px;text-align:center;">
              <a href="https://lovelyhome.com.co/admin/reservations"
                 style="display:inline-block;background:linear-gradient(135deg,#c8a96e,#b8956a);color:#1a1a1a;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:13px;font-weight:600;letter-spacing:1px;">
                Ver en el Panel Admin →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#111;padding:24px 40px;text-align:center;border-top:1px solid #222;">
              <p style="margin:0;font-size:11px;color:#555;">Este es un mensaje automático de <strong style="color:#888;">lovelyhome.com.co</strong></p>
              <p style="margin:6px 0 0 0;font-size:11px;color:#444;">Medellín, Colombia · El Poblado</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  return { subject, html };
}

// ─────────────────────────────────────────────
// Canal 1: Email via Resend
// ─────────────────────────────────────────────

async function sendEmailNotification(type: NotificationType, data: ReservationNotificationData): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;

  if (!apiKey || !adminEmail) {
    console.warn('[Notifications] RESEND_API_KEY o ADMIN_NOTIFICATION_EMAIL no configurados. Email omitido.');
    return;
  }

  const resend = new Resend(apiKey);
  const { subject, html } = buildEmailTemplate(type, data);

  const { error } = await resend.emails.send({
    from: 'Lovely Home <notificaciones@lovelyhome.com.co>',
    to: adminEmail.split(',').map((e) => e.trim()), // soporta múltiples emails separados por coma
    subject,
    html,
  });

  if (error) {
    console.error('[Notifications] Error enviando email via Resend:', error);
  } else {
    console.log('[Notifications] ✅ Email enviado a:', adminEmail);
  }
}

// ─────────────────────────────────────────────
// Canal 2: WhatsApp via CallMeBot
// ─────────────────────────────────────────────

async function sendWhatsAppNotification(type: NotificationType, data: ReservationNotificationData): Promise<void> {
  const phone = process.env.ADMIN_WHATSAPP_PHONE;     // Ej: 573001234567 (sin + ni espacios)
  const apiKey = process.env.CALLMEBOT_API_KEY;       // Se obtiene siguiendo el proceso de activación de CallMeBot

  if (!phone || !apiKey) {
    console.warn('[Notifications] ADMIN_WHATSAPP_PHONE o CALLMEBOT_API_KEY no configurados. WhatsApp omitido.');
    return;
  }

  const priceFormatted = formatPrice(data.totalPrice, data.currency);

  const messages: Record<NotificationType, string> = {
    new_reservation: `🔔 *NUEVA RESERVA* — Lovely Home\n\n🏠 *${data.propertyName}*\n👤 ${data.guestName}\n📅 ${data.checkIn} → ${data.checkOut} (${data.nights} noches)\n💰 ${priceFormatted}\n\n⏳ Estado: _Pago en proceso_\n\nVer panel: lovelyhome.com.co/admin`,
    confirmed_reservation: `✅ *RESERVA CONFIRMADA* — Lovely Home\n\n🏠 *${data.propertyName}*\n👤 ${data.guestName}\n📅 ${data.checkIn} → ${data.checkOut} (${data.nights} noches)\n💰 *${priceFormatted} PAGADO*\n\nVer panel: lovelyhome.com.co/admin`,
    manual_reservation: `📝 *RESERVA MANUAL* — Lovely Home\n\n🏠 *${data.propertyName}*\n👤 ${data.guestName}\n📅 ${data.checkIn} → ${data.checkOut} (${data.nights} noches)\n💰 ${priceFormatted}\n\nCreada desde el panel admin.`,
    cancelled_reservation: `❌ *RESERVA CANCELADA* — Lovely Home\n\n🏠 *${data.propertyName}*\n👤 ${data.guestName}\n📅 ${data.checkIn} → ${data.checkOut}\n\nEl pago fue rechazado.`,
  };

  const message = encodeURIComponent(messages[type]);
  const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${message}&apikey=${apiKey}`;

  try {
    const response = await fetch(url);
    if (response.ok) {
      console.log('[Notifications] ✅ WhatsApp enviado a:', phone);
    } else {
      console.error('[Notifications] Error en CallMeBot:', response.status, await response.text());
    }
  } catch (err) {
    console.error('[Notifications] Error de red enviando WhatsApp:', err);
  }
}

// ─────────────────────────────────────────────
// Función Principal — Exportar y usar desde las rutas
// ─────────────────────────────────────────────

/**
 * Envía notificaciones por email Y WhatsApp simultáneamente.
 * Los errores se manejan internamente — nunca rompen el flujo principal.
 */
export async function sendReservationNotification(
  type: NotificationType,
  data: ReservationNotificationData
): Promise<void> {
  try {
    // Disparar ambos canales en paralelo (si uno falla no afecta al otro)
    await Promise.allSettled([
      sendEmailNotification(type, data),
      sendWhatsAppNotification(type, data),
    ]);
  } catch (err) {
    // Las notificaciones NUNCA deben romper el flujo principal de reserva
    console.error('[Notifications] Error inesperado en el sistema de notificaciones:', err);
  }
}
