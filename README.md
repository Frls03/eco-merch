# Nexlum Merch — Control de stock en tiempo real

Aplicación web para controlar la disponibilidad de merch (Hoodies por talla, Tote Bags
por color) durante el evento. La persona en bodega descuenta stock con un click al
entregar cada producto, y una pantalla pública en el stand (frente a la cafetería)
muestra la disponibilidad actualizándose sola, en tiempo real, sin recargar la página.

## Cómo está armado

- **Frontend:** React + TypeScript + Vite + Tailwind (diseño propio, ver `src/styles`).
- **Backend:** Supabase (Postgres + Auth + Realtime). No hay servidor propio que mantener.
- **Tiempo real:** Supabase Realtime escucha cambios en la tabla `variants` y empuja
  las actualizaciones a todos los navegadores conectados (bodega y stand) al instante.
- **Seguridad:** Row Level Security en Postgres. Los descuentos de stock pasan por una
  función `adjust_stock()` en el servidor que nunca deja el stock en negativo, y que
  registra quién hizo cada movimiento (`stock_movements`).

```
src/
  components/   Piezas de UI reutilizables (AppShell, Logo, StockLevel, ProtectedRoute)
  hooks/        useAuth (sesión + rol), useInventory (datos + realtime)
  lib/          Cliente de Supabase, tipos de la base de datos, mapeo de colores
  pages/        Login, Admin (+ subpáginas), Bodega, Stand
  styles/       Tema visual (Tailwind + clases propias)
supabase/
  migrations/   SQL para crear todo el esquema en tu proyecto de Supabase
```

## 1. Crear el proyecto en Supabase

1. Entra a [supabase.com](https://supabase.com) y crea un proyecto nuevo (región cercana
   al evento, por ejemplo `us-east-1` o la más cercana).
2. Ve a **SQL Editor** → pega y ejecuta el contenido de
   [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql). Esto crea
   las tablas, los roles, las políticas de seguridad (RLS) y activa Realtime.
3. (Opcional) Ejecuta también
   [`supabase/migrations/0002_seed_demo.sql`](supabase/migrations/0002_seed_demo.sql)
   si quieres ver la app con datos de ejemplo antes de cargar el stock real.
4. Ve a **Authentication → Providers → Email** y, como es una herramienta interna para
   el equipo del evento (no público), te recomiendo **desactivar "Confirm email"** para
   que las cuentas que crees para los vendedores puedan usarse de inmediato sin que
   revisen su correo.
5. Crea tu propio usuario admin: **Authentication → Users → Add user** (con email +
   contraseña). Luego en **SQL Editor** ejecuta, reemplazando el correo:

   ```sql
   update public.profiles set role = 'admin' where id = (
     select id from auth.users where email = 'tu-correo@nexlum.site'
   );
   ```

   Los siguientes usuarios (los 2 vendedores) puedes crearlos directamente desde el
   **panel de administrador de la app** (pestaña "Usuarios"), que ya quedan con rol
   `vendedor` por defecto.

## 2. Variables de entorno

Copia `.env.example` a `.env` y completa con los datos de tu proyecto
(**Project Settings → API** en Supabase):

```bash
cp .env.example .env
```

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-publica
```

⚠️ Usa siempre la **anon public key**, nunca la `service_role key` en el frontend —
esa clave se salta toda la seguridad de la base de datos.

## 3. Correr en local

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`. Te va a redirigir a `/login`.

## 4. Roles y rutas de la app

| Ruta        | Quién entra           | Qué hace |
|-------------|------------------------|----------|
| `/login`    | Todos                  | Inicio de sesión |
| `/admin`    | Solo `admin`           | Alta de productos, tallas/colores, stock inicial, correcciones, gestión de usuarios |
| `/bodega`   | `admin` y `vendedor`   | Botón de "− 1 Entregado" por talla/color |
| `/stand`    | Público (sin login)    | Pantalla de solo lectura para el stand, se actualiza sola en tiempo real |

La pantalla `/stand` es de solo lectura y no requiere sesión a propósito: así puedes
dejarla abierta en una tablet o TV en el stand sin preocuparte por sesiones que
expiren durante el evento.

## 5. Dominio: nexlum.site

Sugerencia de subdominios (usando el mismo build de la app, cambia solo la ruta con la
que abres cada pantalla):

- `merch.nexlum.site` → app completa (login, admin, bodega). Es la URL que usan admin
  y vendedores.
- `stand.nexlum.site` → configúralo para que redirija/abra directo en `merch.nexlum.site/stand`
  (pantalla pública del stand). Si tu hosting lo permite, puedes apuntar este
  subdominio al mismo despliegue con una regla de redirect a `/stand`.

Cómo desplegar (recomendado: [Vercel](https://vercel.com), tiene capa gratuita y es la
forma más simple de conectar un dominio propio):

1. Sube este repo a GitHub (ver sección 6).
2. En Vercel: **New Project** → importa el repo → Framework Preset: **Vite**.
3. Agrega las variables de entorno `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en
   **Project Settings → Environment Variables**.
4. Deploy.
5. En **Project Settings → Domains** agrega `merch.nexlum.site` y sigue las
   instrucciones para crear el registro `CNAME` en el proveedor DNS donde administras
   `nexlum.site`.
6. Para `stand.nexlum.site`, agrégalo como dominio adicional del mismo proyecto en
   Vercel, y crea en `vercel.json` una redirección a `/stand` (o simplemente comparte
   la URL `merch.nexlum.site/stand` directamente si prefieres no complicar el DNS).

## 6. Subir a GitHub

Desde esta misma carpeta:

```bash
git init
git add .
git commit -m "Initial commit: Nexlum Merch stock app"
```

Luego, en GitHub, crea un repositorio nuevo (vacío, sin README) y conéctalo:

```bash
git remote add origin https://github.com/<tu-usuario>/nexlum-merch.git
git branch -M main
git push -u origin main
```

`.env` está en `.gitignore` — nunca se sube. Solo se sube `.env.example`.

## 7. Uso diario en el evento

1. **Antes del evento (admin):** entra a `/admin`, crea los productos (Hoodie, Tot
   Bag), agrega cada talla/color con su stock inicial.
2. **Durante el evento (vendedores en bodega):** entran a `/bodega` desde su celular o
   tablet, y tocan "− 1 Entregado" cada vez que entregan una unidad.
3. **Pantalla del stand:** abre `/stand` en la tablet/TV del stand una sola vez al
   inicio del evento y déjala así — se actualiza sola.
4. **Corrección de errores:** si alguien se equivocó al descontar, el admin puede
   corregir el número exacto desde `/admin` (botón "corregir" junto a cada variante).

## Notas de seguridad

- RLS activo en todas las tablas: sin sesión válida no se puede escribir nada.
- Los descuentos de stock pasan por la función `adjust_stock()` (con `security
  definer`), que valida el rol del usuario y evita que el stock quede en negativo aunque
  dos personas aprieten el botón al mismo tiempo.
- Lectura de catálogo (`products`, `variants`) es pública a propósito, para que la
  pantalla del stand no necesite login. No expone nada sensible (ni correos, ni
  contraseñas, ni datos de usuarios).
- No se usa la `service_role key` en ningún lugar del frontend.
