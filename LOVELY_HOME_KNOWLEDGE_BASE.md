# Lovely Home - Base de Conocimiento (Knowledge Base) 🧠

Este documento almacena todo el contexto técnico, lógico y arquitectónico del proyecto "Lovely Home" construido hasta la fecha. Sirve como una "memoria cognitiva" para futuras sesiones de inteligencia artificial o para nuevos desarrolladores.

## 1. Stack Tecnológico (La Fundación)
- **Frontend & Backend (App Router):** Next.js 16.1.6
- **Base de Datos & Auth & Storage:** Supabase (PostgreSQL)
- **Pasarela de Pagos:** Wompi (Integración vía API Rest)
- **Estilos:** CSS Modules puristas (vanguardista, minimalista, modo oscuro/claro).
- **Despliegue (Hosting):** Vercel
- **Dominio:** lovelyhome.com.co (Registro en Sittios, DNS apuntando a Vercel).

## 2. Decisiones Arquitectónicas Críticas

### 2.1. Seguridad y Row Level Security (RLS) en Supabase
Para proteger la información (ej. detalles de los huéspedes en las reservas), los permisos públicos en Supabase están bloqueados para edición (`INSERT`, `UPDATE`, `DELETE`). 
**Solución adoptada:** Todo el Panel Administrativo (`/admin`) se comunica con el servidor a través de rutas API privadas (`/api/admin/...`). En estas rutas, utilizamos la `SUPABASE_SERVICE_ROLE_KEY` (Llave Maestra) que salta las reglas de RLS y permite a la administradora guardar precios, editar reservas y gestionar fotos de forma segura.

### 2.2. Prevención de Suspensión (El "Hack" del Free Tier)
Supabase pausa las bases de datos gratuitas tras 7 días de inactividad. 
**Solución:** Se creó un **Cron Job** nativo en Vercel (`vercel.json`) que ejecuta una consulta (ping) a `/api/cron/keepalive` todos los días a las 10:00 AM, evitando la suspensión del servicio para siempre sin pagar el plan Pro.

## 3. Funcionamiento de Módulos Core

### El Dashboard Administrativo (`/admin`)
Es la "Biblia" u "Hoja de Ruta" de la administradora. Contiene 3 pilares:
1. **Propiedades:** 
   - Se puede modificar el precio por noche (impactando el cálculo automático de la web).
   - Contiene el botón **Gestionar Fotos**, que levanta un modal con integración a **Supabase Storage**. Las fotos se suben al bucket `property-photos` y se relacionan en la tabla `property_images`.
2. **Reservas (El Motor):**
   - Muestra las reservas entrantes.
   - **Reserva Manual:** Autocalcula el precio multiplicando las noches por el valor de la propiedad. Genera boton de "Confirmación Manual" o un botón directo de "Pago con Wompi" para cobrar en el sitio.
   - **Limpieza Automática:** El botón "Limpiar Vencidas" ejecuta un `DELETE` físico en la base de datos para borrar carritos abandonados (reservas en estado pending por más de 15 minutos).
3. **Testimonios (Reseñas):**
   - Un CRUD completo para subir y borrar reseñas (nombre, ciudad, cita) que interactúa con la BD y se refleja en el cliente final (`/Testimonials`).

### Flujo de Pagos (Wompi)
El usuario cotiza en la página de la propiedad, se recogen sus fechas y se contacta a `/api/checkout`. Esto interactúa con la API de Wompi para generar una sesión de pago redireccionada. Si la transacción es exitosa, el Webhook de Wompi actualiza el estado de la reserva en Supabase de `pending` a `confirmed`.

## 4. Roadmap Pendiente (Futuro)
- **Channel Manager:** Integrar **Smoobu** (Recomendado) o **Stays**. Consiste en usar sus APIs/Webhooks para sincronizar la disponibilidad de los calendarios y evitar el overbooking, inyectando estos bloqueos directamente al dashboard interno de Lovely Home.
- (El documento `channel_manager_requirements.md` contiene la lista de credenciales a solicitar a la clienta).

---
*Nota para el Agente IA futuro: Al leer este documento, asumes automáticamente todo el contexto del flujo lógico de Lovely Home. Prioriza mantener la estética minimalista y el uso del Service Role Key para operaciones de administración backend.*
