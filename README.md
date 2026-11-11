# StayHub

Aplicación web de reservas para una red de hoteles pequeños. Proyecto final de Bases de Datos II.

- **Backend** (`backend/`): API REST con Node.js, Express y Mongoose sobre MongoDB Atlas. Se despliega en Render. Las fotos de hoteles y habitaciones se guardan en Cloudinary; en Mongo solo queda un arreglo de URLs.
- **Frontend** (`frontend/`): interfaz con React, Vite, React Router y Axios. Se despliega en Vercel.
- **Evidencias** (`docs/evidencias/`): carpeta para las capturas del proyecto.

El frontend nunca toca la base de datos: todo pasa por la API bajo `/api`.

```
Navegador ──► Frontend (Vercel) ──► API REST /api (Render) ──► MongoDB Atlas
                React + Vite         Express + Mongoose
```

## Contenido

1. [Estructura del proyecto](#estructura-del-proyecto)
2. [Requisitos](#requisitos)
3. [Ejecución local](#ejecución-local)
4. [Variables de entorno](#variables-de-entorno)
5. [Usuario administrador](#usuario-administrador)
6. [La API en resumen](#la-api-en-resumen)
7. [Reglas de negocio](#reglas-de-negocio)
8. [Calendario de ocupación](#calendario-de-ocupación)
9. [Reportes](#reportes)
10. [Modelo de datos](#modelo-de-datos)
11. [Despliegue](#despliegue)
12. [Problemas frecuentes](#problemas-frecuentes)
13. [Seguridad](#seguridad)

## Estructura del proyecto

```
stayhub/
├── README.md
├── package.json                 Scripts del workspace y versión de pnpm (packageManager)
├── pnpm-workspace.yaml          Declara backend y frontend como proyectos del workspace
├── pnpm-lock.yaml               Lockfile único de todo el monorepo
├── docs/
│   ├── despliegue.md            Guía paso a paso: Atlas, Render, Vercel y Cloudinary
│   ├── formato-factura.html     Diseño de referencia de la factura en PDF
│   ├── calendario-mockup.html   Diseño de referencia del calendario de ocupación
│   └── evidencias/              Capturas del proyecto
├── backend/
│   ├── requests.http            Peticiones de prueba (extensión REST Client de VS Code)
│   ├── .env.example
│   ├── assets/fonts/            Inter y Cormorant Garamond (licencia OFL) que usa el PDF de la factura
│   └── src/
│       ├── server.js, app.js    Arranque y configuración de Express
│       ├── config/              Variables de entorno y conexión a MongoDB
│       ├── models/              Esquemas de Mongoose e índices
│       ├── routes/              URL y middlewares de cada recurso
│       ├── controllers/         Leen la petición y responden
│       ├── services/            Reglas de negocio y reportes
│       ├── schemas/             Validación de entradas (zod)
│       ├── middlewares/         auth (JWT), validate y errorHandler
│       ├── pdf/                 Dibujo de la factura en PDF (pdfkit)
│       ├── utils/               Fechas, paginación, errores y otras ayudas
│       └── seed/                Datos de prueba
└── frontend/
    ├── vercel.json              Reescritura para las rutas de React Router
    ├── .env.example
    ├── public/login.jpg         Foto fija del lado izquierdo del login (si falta, se ve un placeholder)
    └── src/
        ├── api/                 Cliente HTTP y recursos de la API
        ├── context/             Sesión y avisos
        ├── hooks/               Listados, formularios, opciones, cifras de cabecera y fotos
        ├── components/          Botón, campos, chips, tarjetas, tabla, modal, fotos, formularios y gráficas
        ├── pages/               Login, Hoteles, Habitaciones, Huéspedes, Reservas, Calendario y Reportes
        ├── utils/               Formato, catálogos, validaciones y URLs de fotos
        └── styles/              theme.css (colores, fuentes, radios, sombras), componentes.css y paginas.css
```

El backend sigue las capas **routes → controllers → services → models**. Las reglas de negocio viven solo en `services/`.

## Requisitos

- **Node.js 20.19 o superior, hasta la serie 24** (también sirve 22.12 o superior; se recomienda una LTS reciente). Mongoose 9 y Vite 8 no funcionan con versiones anteriores a 20.19, y el proyecto declara `<25` para que Render no elija una versión más nueva que las probadas.
- **pnpm 12**. El proyecto es un workspace de pnpm y fija la versión exacta en el campo `packageManager` de `package.json`: si ya tienes pnpm, descarga y usa esa versión por sí mismo. Si no lo tienes, instálalo con Corepack (`corepack enable`, viene con Node) o con el instalador oficial: <https://pnpm.io/installation>.
- Una base de datos MongoDB. La guía usa MongoDB Atlas (gratis); para desarrollo también sirve cualquier cadena de conexión de MongoDB.
- Para subir fotos, una cuenta gratuita de Cloudinary. Es opcional: sin ella todo lo demás funciona. Cómo crearla y dónde copiar las credenciales: [docs/despliegue.md](docs/despliegue.md#8-cloudinary-fotos-de-hoteles-y-habitaciones).

## Ejecución local

Todos los comandos se ejecutan desde la raíz del proyecto.

1. **Instala las dependencias** (una sola vez, para backend y frontend):

   ```bash
   pnpm install
   ```

2. **Configura el backend.** Copia el ejemplo y completa los valores (ver [variables de entorno](#variables-de-entorno)):

   ```bash
   cp backend/.env.example backend/.env
   ```

   Edita `backend/.env`: pon tu `MONGODB_URI` de Atlas (ver [paso 1 del despliegue](#1-mongodb-atlas)) y un `JWT_SECRET`. Para generar uno:

   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```

3. **Carga los datos de prueba.** Borra y recrea las 6 colecciones (5 hoteles, 40 habitaciones, 50 huéspedes, 150 reservas, reseñas y el usuario administrador):

   ```bash
   pnpm seed
   ```

4. **Configura el frontend:**

   ```bash
   cp frontend/.env.example frontend/.env
   ```

5. **Arranca todo** (API en el puerto 4000 y frontend en el 5173, a la vez):

   ```bash
   pnpm dev
   ```

   Comprueba que la API responde: <http://localhost:4000/api/health> debe mostrar `"estado":"ok"` y `"baseDeDatos":"conectada"`. Después abre <http://localhost:5173> e inicia sesión con el [usuario administrador](#usuario-administrador).

Comandos del workspace (definidos en el `package.json` de la raíz):

| Comando | Qué hace |
|---|---|
| `pnpm dev` | Levanta backend y frontend a la vez |
| `pnpm dev:backend` | Levanta solo la API, con recarga automática |
| `pnpm dev:frontend` | Levanta solo el frontend |
| `pnpm seed` | Borra y recrea los datos de prueba |
| `pnpm build` | Genera el frontend de producción en `frontend/dist` |
| `pnpm start` | Arranca la API sin recarga automática (Render usa su equivalente, `node backend/src/server.js`) |
| `pnpm --filter stayhub-frontend preview` | Sirve localmente la carpeta `dist` |
| `pnpm add <paquete> --filter stayhub-backend` | Agrega una dependencia al backend (usa `stayhub-frontend` para el frontend) |

### Probar la API sin el frontend

Abre `backend/requests.http` en VS Code con la extensión **REST Client** (`humao.rest-client`) y pulsa "Send Request" en cada petición, en orden. La primera hace el login y guarda el token para las demás. Hay una petición para provocar cada regla de negocio y una por reporte.

## Variables de entorno

Los secretos viven solo en archivos `.env` (que están en `.gitignore`) o en los paneles de Render y Vercel. Nunca se suben al repositorio; los `.env.example` solo traen marcadores.

### Backend (`backend/.env`, o el panel de Render)

| Variable | Obligatoria | Descripción |
|---|---|---|
| `MONGODB_URI` | Sí | Cadena de conexión de Atlas, con el nombre de la base (`/stayhub`). |
| `JWT_SECRET` | Sí | Clave para firmar los tokens. Larga y aleatoria. Si la cambias, las sesiones abiertas dejan de valer. |
| `CORS_ORIGIN` | Sí | Origen(es) del frontend que pueden llamar a la API, sin barra final. Varios, separados por comas. |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Solo para fotos | Credenciales de tu cuenta de Cloudinary. Sin ellas la API arranca igual y todo lo demás funciona, pero subir fotos responde 503. |
| `PORT` | No | Puerto de la API. Por defecto 4000. Render lo define solo. |
| `ADMIN_EMAIL` | No | Solo para `pnpm seed`: correo del administrador. |
| `ADMIN_PASSWORD` | No | Solo para `pnpm seed`: contraseña del administrador. |

### Frontend (`frontend/.env`, o el panel de Vercel)

| Variable | Obligatoria | Descripción |
|---|---|---|
| `VITE_API_URL` | Sí | URL base de la API, terminada en `/api`. Local: `http://localhost:4000/api`. Producción: `https://<tu-servicio>.onrender.com/api`. |

Vite incrusta `VITE_API_URL` **al compilar**, no al ejecutar. Si la cambias en Vercel, hay que volver a desplegar.

## Usuario administrador

`pnpm seed` crea un usuario con estas credenciales de demostración:

- Correo: `admin@stayhub.com`
- Contraseña: `Admin123!`

Estas credenciales son públicas, porque están en este archivo. Si vas a desplegar la app en internet, siembra con las tuyas definiendo `ADMIN_EMAIL` y `ADMIN_PASSWORD` en tu `backend/.env` antes de ejecutar el seed (ver [Seguridad](#seguridad)).

## La API en resumen

URL base: `/api`. Las lecturas de hoteles, habitaciones y reseñas son públicas; todo lo demás exige `Authorization: Bearer <token>` (el token se obtiene en `POST /api/auth/login` y dura 8 horas).

| Recurso | Rutas | Notas |
|---|---|---|
| Salud | `GET /health` | 200 si la base responde, 503 si no. |
| Login | `POST /auth/login` | Devuelve `{ token, usuario }`. |
| Hoteles | `GET`, `POST /hoteles` · `GET`, `PUT`, `PATCH`, `DELETE /hoteles/:id` | Filtros: `ciudad`, `estrellas`, `q`, `activo`. |
| Habitaciones | `GET`, `POST /habitaciones` · `GET`, `PUT`, `PATCH`, `DELETE /habitaciones/:id` | Filtros: `hotelId`, `tipo`, `estado`, `activo`, `q`. |
| Disponibles | `GET /habitaciones/disponibles` | Filtros: `hotelId`, `tipo`, `entrada`, `salida`, `precioMin`, `precioMax`. |
| Huéspedes | `GET`, `POST /huespedes` · `GET`, `PUT`, `PATCH`, `DELETE /huespedes/:id` | Todo con token. Filtros: `q`, `ciudad`, `activo`. |
| Reservas | `GET`, `POST /reservas` · `GET`, `PUT`, `DELETE /reservas/:id` · `PATCH /reservas/:id/estado` · `POST /reservas/:id/pagos` | Todo con token. Filtros: `estado`, `hotelId`, `desde`, `hasta`, `huesped`. |
| Factura | `GET /reservas/:id/factura` | Con token. Responde el PDF (`application/pdf`, `attachment; filename="FAC-000124.pdf"`) de una reserva finalizada; 409 si no lo está. |
| Calendario | `GET /calendario` | Con token. Query: `hotelId` (obligatorio), `desde`, `dias` (7, 14 o 30) y `tipo`. Ver [Calendario de ocupación](#calendario-de-ocupación). |
| Reseñas | `GET /resenas`, `GET /resenas/:id` · `POST /resenas`, `DELETE /resenas/:id` | Filtros: `hotelId`, `huespedId`, `reservaId`. |
| Reportes | `GET /reportes/<nombre>` | Todo con token. Ver [Reportes](#reportes). |

Convenciones:

- **Listados:** aceptan `?page=&limit=` (por defecto 1 y 10, máximo 100) y responden `{ data, total, page }`. Muestran nombres legibles (por ejemplo `hotel.nombre`), no solo ids.
- **Errores:** siempre `{ error, detalle }`. `400` datos inválidos (en ese caso `detalle` es una lista `[{ campo, mensaje }]`), `401` sin token o token inválido, `404` no encontrado y `409` conflicto de negocio.
- **Fechas** de reserva: `AAAA-MM-DD`. Se guardan a medianoche UTC y "hoy" se calcula en hora de Bogotá.
- **Escrituras:** `PUT` exige el recurso completo; `PATCH` acepta cualquier subconjunto de campos (por ejemplo `{ "activo": false }` para desactivar).

## Reglas de negocio

Todas están en `backend/src/services/`.

| # | Regla | Respuesta | Archivo |
|---|---|---|---|
| 1 | Sin traslape: una habitación no tiene dos reservas no canceladas que se crucen. | 409 | `disponibilidad.service.js` |
| 2 | La salida es posterior a la entrada y la entrada no es anterior a hoy. | 400 | `reglasReserva.service.js` |
| 3 | `numHuespedes` no supera la capacidad de la habitación. | 400 | `reglasReserva.service.js` |
| 4 | No se reserva una habitación en mantenimiento ni de un hotel inactivo (tampoco una habitación o un huésped inactivos). | 409 | `reglasReserva.service.js` |
| 5 | El servidor calcula `total = noches × precioNoche` y guarda una copia de la habitación que congela el precio pactado. | — | `reservas.service.js` |
| 6 | Los pagos no superan el total. Con pagos de al menos el 30 % la reserva pasa a confirmada. | 409 | `reservas.service.js` |
| 7 | Transiciones: pendiente → confirmada → en curso → finalizada; desde pendiente o confirmada se puede cancelar. Finalizar exige saldo 0. | 409 | `reservas.service.js` |
| 8 | Solo se reseña una reserva finalizada, una vez. Cada cambio recalcula `calificacionPromedio` del hotel. | 409 | `resenas.service.js` |
| 9 | No se elimina un hotel, habitación o huésped que tenga reservas (activas o históricas): se desactiva con `PATCH { "activo": false }`. | 409 | `integridad.service.js` |
| 10 | Email, documento y número de habitación por hotel son únicos (el error E11000 de Mongo se traduce). | 409 | `errorHandler.js` |
| 11 | Solo se factura una reserva finalizada (siempre con saldo 0). La primera vez se emite: número consecutivo `FAC-000001`, `FAC-000002`… y fecha. Las siguientes regeneran el PDF con los datos guardados, sin otro número. | 409 | `facturas.service.js` |

Además:

- **Factura:** el PDF se dibuja con pdfkit siguiendo `docs/formato-factura.html` (sin IVA: el total es el de la reserva). Al emitir se guarda en la reserva el subdocumento `factura { numero, fechaEmision, emisor, cliente }`, una copia de los datos del hotel y del huésped de ese momento: si ellos cambian después, la factura reimpresa sale igual. El número sale de la colección `contadores` con `findOneAndUpdate` + `$inc` + `upsert`; el update que guarda la factura exige que la reserva aún no tenga una, y `factura.numero` tiene índice único. Dos clics simultáneos no emiten dos facturas; si otra instancia ganara la carrera, el número que este proceso había tomado queda sin usar (el consecutivo nunca se repite, pero podría saltarse uno).
- Cancelar una reserva conserva sus pagos (no hay reembolso automático).
- `DELETE /reservas/:id` solo borra reservas pendientes o canceladas que no tengan pagos.
- La detección de traslapes se ejecuta de una en una por habitación dentro del proceso, y la creación verifica de nuevo al guardar. Así, solicitudes simultáneas por la misma habitación no producen doble reserva.

## Calendario de ocupación

`GET /api/calendario?hotelId=<id>&desde=AAAA-MM-DD&dias=14&tipo=doble` devuelve las habitaciones del hotel, las reservas que tocan el rango y la ocupación noche por noche. `hotelId` es obligatorio; `desde` es por defecto el lunes de la semana actual en hora de Bogotá; `dias` solo admite 7, 14 o 30 (por defecto 14); `tipo` (`sencilla`, `doble` o `suite`) filtra las habitaciones y, con ellas, la ocupación y el resumen. Responde 404 si el hotel no existe y 400 si algún parámetro es inválido. La lógica está en `calendario.service.js`:

- **En servicio:** las habitaciones activas y no en mantenimiento. Solo ellas cuentan en la ocupación; las demás aparecen en el tablero con su franja rayada.
- **Noches:** una reserva ocupa desde la noche de entrada hasta el día anterior a la salida; la noche de salida queda libre.
- **Reservas del rango:** usan la misma condición de traslape de la regla 1 (`filtroDeTraslape`, exportada de `disponibilidad.service.js`): no canceladas, entrada anterior al fin del rango y salida posterior a su inicio. Así una celda se ve libre exactamente cuando crear una reserva en ella no daría 409.
- **Ocupación:** noches ocupadas ÷ (habitaciones en servicio × noches), en %, por noche y para todo el periodo. Junto con el resumen (`libresEstaNoche`, `llegadasHoy`: pendientes o confirmadas con entrada hoy, y `salidasHoy`: no canceladas con salida hoy) sale de un solo aggregation pipeline; el resumen siempre habla de hoy, aunque el rango esté en otro mes.

En el frontend, `/calendario` guarda `hotelId`, `desde`, `dias` y `tipo` en la URL, de modo que recargar o compartir el enlace muestra lo mismo. Las celdas libres de hoy en adelante abren el formulario de nueva reserva con el hotel, la habitación y las fechas ya puestas.

## Reportes

Todos son aggregation pipelines en `backend/src/services/reportes.service.js`, con una línea de comentario sobre cada uno. Aceptan `?desde=&hasta=&ciudad=` (`AAAA-MM-DD`; la ciudad ignora mayúsculas y tildes) y responden `{ filtros, data }`.

| Reporte | Responde | `desde` y `hasta` filtran por |
|---|---|---|
| `ingresos-por-mes` | Dinero cobrado por hotel y mes | fecha del pago |
| `reservas-por-ciudad` | Reservas no canceladas por ciudad (`ciudad` no aplica) | fecha de entrada |
| `top-hoteles` | Hoteles mejor calificados: promedio de reseñas, mínimo 3, máximo 5 | fecha de la reseña |
| `tipos-habitacion` | Ventas y precio medio por noche según `habitacion.tipo` | fecha de entrada |
| `cancelaciones` | Porcentaje de reservas canceladas por hotel | fecha de entrada |
| `top-huespedes` | Los 10 huéspedes que más han pagado | fecha del pago |
| `pagos-por-metodo` | Monto y participación de cada método de pago | fecha del pago |
| `ocupacion` | Noches vendidas frente a noches disponibles por hotel y total | el rango mismo |

"Ingresos" y "gasto" se miden como **dinero cobrado**: la suma de los pagos registrados, también los de reservas canceladas. `ocupacion` mide los últimos 30 días si no se indican fechas (máximo 366 días); las noches disponibles son las habitaciones en servicio hoy por los días del rango.

## Modelo de datos

Siete colecciones (`contadores` aparece con la primera factura; `pnpm seed` carga las otras seis y deja el contador en cero). Los nombres de colección están fijados en cada modelo.

| Colección | Embebido | Referencias | Índices |
|---|---|---|---|
| `hoteles` | `direccion`, `contacto`, `servicios` | — | `{direccion.ciudad, estrellas}` |
| `habitaciones` | `amenidades` | `hotelId` | único `{hotelId, numero}` · `{hotelId, tipo, precioNoche}` |
| `huespedes` | `documento {tipo, numero}` | — | único `email` · único `documento.numero` · `ciudadOrigen` |
| `reservas` | `habitacion {numero, tipo, precioNoche}` (copia) · `pagos[]` · `factura {numero, fechaEmision, emisor, cliente}` (copia, solo si ya se emitió) | `huespedId`, `hotelId`, `habitacionId` | único `codigo` · único parcial `factura.numero` · `{habitacionId, fechaEntrada, fechaSalida}` · `{hotelId, estado, fechaEntrada}` · `{huespedId, estado}` |
| `resenas` | — | `reservaId`, `hotelId`, `huespedId` | único `reservaId` · `{hotelId, fecha}` |
| `usuarios` | — | — | único `email` |
| `contadores` | `_id` = nombre de la secuencia (`factura`) y `valor` | — | el `_id` |

`passwordHash` (bcrypt) no se devuelve en las consultas: el login lo pide explícitamente.

## Despliegue

La guía paso a paso (qué botón pulsar, qué valor escribir, capturas para las evidencias y solución de problemas) está en **[docs/despliegue.md](docs/despliegue.md)**. Esta sección es solo el resumen.

Orden recomendado: **Atlas → repositorio en GitHub → Render → sembrar Atlas → Vercel → ajustar `CORS_ORIGIN` en Render.** (En la guía, el seed se ejecuta antes de crear el servicio en Render, para que la primera prueba de la API ya muestre datos.) Los nombres de botones y menús de cada plataforma pueden cambiar con el tiempo; las ideas se mantienen.

### 1. MongoDB Atlas

1. Crea una cuenta en <https://www.mongodb.com/cloud/atlas> y un proyecto.
2. Crea un clúster **gratuito** (Free, antes llamado M0). Elige una región cercana a la que usarás en Render. Atlas puede pedir datos de facturación aunque el clúster sea gratis.
3. **Database Access:** crea un usuario de base de datos con contraseña y el privilegio `readWrite` sobre la base `stayhub` (o el rol "Read and write to any database"). Si la contraseña tiene caracteres especiales, codifícalos en la URL (o usa una sin ellos).
4. **Network Access → IP Access List:** Render gratis no tiene una IP de salida fija, así que lo más simple es permitir `0.0.0.0/0` (acceso desde cualquier IP). Atlas advierte que eso expone el clúster a quien tenga las credenciales, por eso importa usar una contraseña fuerte. La alternativa es permitir los rangos de salida de tu región de Render (en el servicio, **Connect → Outbound**), que son compartidos y pueden cambiar.
5. **Connect → Drivers:** copia la cadena `mongodb+srv://...`, reemplaza `<db_username>` y `<db_password>` por los de tu usuario y agrega el nombre de la base antes del `?`:

   ```
   mongodb+srv://<usuario>:<contraseña>@<cluster>.mongodb.net/stayhub?retryWrites=true&w=majority
   ```

6. Guarda esa cadena como `MONGODB_URI` en `backend/.env` y comprueba la conexión con `pnpm dev:backend` y `/api/health`.

Notas del clúster gratuito: 0,5 GB de almacenamiento, hasta 500 conexiones y pausa automática tras 30 días sin conexiones. El proyecto usa `$lookup`, `$dateDiff` y collation; la documentación de Atlas no los lista como no soportados, pero no los probé en Atlas.

### 2. Repositorio en GitHub

Render y Vercel despliegan desde un repositorio. Desde la raíz del proyecto:

```bash
git init
git add .
git commit -m "StayHub"
```

Crea un repositorio vacío en GitHub y sigue sus instrucciones para `git remote add origin ...` y `git push`. Antes de subir, comprueba con `git status` que no aparezca ningún `.env` (el `.gitignore` ya los excluye). En Windows, Git puede avisar de que convertirá saltos de línea (LF a CRLF): es normal y no afecta al proyecto.

### 3. Render (backend)

1. En <https://render.com>: **New → Web Service** y conecta el repositorio.
2. Configura:

   | Campo | Valor |
   |---|---|
   | Language | Node |
   | Root Directory | (vacío: la raíz del repositorio, donde está `pnpm-lock.yaml`) |
   | Build Command | `corepack enable && pnpm install --frozen-lockfile --filter stayhub-backend...` |
   | Start Command | `node backend/src/server.js` |
   | Instance Type | Free |

3. **Environment Variables:**
   - `MONGODB_URI`: la cadena de Atlas.
   - `JWT_SECRET`: una cadena larga y aleatoria (genérala con el comando del paso 2 de la ejecución local).
   - `CORS_ORIGIN`: por ahora `http://localhost:5173`; la corregirás en el paso 6.
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET`: para las fotos (ver la guía de despliegue, sección 8).
   - No definas `PORT`: Render usa 10000 y la API lo lee.
4. **Settings → Health Checks → Health Check Path:** `/api/health`.
5. Despliega. Cuando termine, abre `https://<tu-servicio>.onrender.com/api/health`: debe mostrar `"estado":"ok"`.

`corepack enable` hace que se use la versión exacta de pnpm fijada en `packageManager`. El Start Command es el equivalente de `pnpm start` y no depende de que pnpm exista al ejecutar. Versión de Node: Render la toma de la variable `NODE_VERSION` si existe y, si no, del campo `engines.node` del `package.json` de la raíz (`>=20.19.0 <25`). Render no documenta pnpm ni Corepack: si el build falla por eso, la guía de despliegue trae las alternativas.

Un servicio gratuito se duerme tras 15 minutos sin tráfico y tarda cerca de un minuto en despertar: la primera petición después de una pausa (por ejemplo, el login) puede tardar.

### 4. Sembrar Atlas

Desde tu computador, con `MONGODB_URI` de Atlas en `backend/.env` (no hace falta que el seed corra en Render):

```bash
pnpm seed
```

Para un despliegue público, define antes `ADMIN_EMAIL` y `ADMIN_PASSWORD` en `backend/.env` con valores propios. El seed **borra y recrea** las 6 colecciones: no lo ejecutes sobre una base con datos reales.

### 5. Vercel (frontend)

1. En <https://vercel.com>: **Add New → Project** e importa el repositorio.
2. Configura:

   | Campo | Valor |
   |---|---|
   | Root Directory | `frontend` |
   | Framework Preset | Vite (se detecta solo) |
   | Install Command | sin cambiar (no lo sobrescribas con `pnpm install`) |
   | Build Command | el que sugiera Vercel (`vite build` o `pnpm build`) |
   | Output Directory | `dist` |

3. **Environment Variables:**
   - `VITE_API_URL` = `https://<servicio>.onrender.com/api` (con `/api` al final).
   - `ENABLE_EXPERIMENTAL_COREPACK` = `1`, para que Vercel use la versión de pnpm de `packageManager`. Sin esto, o con un Install Command propio, Vercel puede usar una versión antigua de pnpm que no entiende el lockfile.
4. Despliega. Vercel te da una URL como `https://<proyecto>.vercel.app`.

El archivo `frontend/vercel.json` reescribe cualquier ruta a `index.html`, para que recargar la página en `/reservas/123` no dé 404.

### 6. Volver a Render: CORS

En el servicio de Render, cambia `CORS_ORIGIN` por la URL exacta de Vercel, sin barra final ni ruta:

```
CORS_ORIGIN=https://<tu-proyecto>.vercel.app
```

Si usas varios dominios (por ejemplo, uno de vista previa), sepáralos con comas. Render vuelve a desplegar al guardar.

### 7. Comprobación final

1. Abre la URL de Vercel e inicia sesión con tu usuario administrador.
2. Revisa Hoteles, crea una reserva de prueba, registra un pago y abre Reportes.
3. En las herramientas del navegador, pestaña Red, las peticiones deben ir a `onrender.com`.

## Problemas frecuentes

| Síntoma | Causa probable y solución |
|---|---|
| `/api/health` responde 503 `degradado` o la API no arranca | La API no conecta con Atlas: revisa `MONGODB_URI` (usuario, contraseña codificada, nombre de la base) y el IP Access List de Atlas. |
| Error de CORS en la consola del navegador | `CORS_ORIGIN` no coincide exactamente con el origen del frontend (esquema, dominio, sin barra final). |
| El frontend llama a su propio dominio o a `localhost` | `VITE_API_URL` no estaba definida al compilar. Defínela y vuelve a desplegar. |
| 404 al recargar una página del frontend | Falta `frontend/vercel.json` en el despliegue, o el Root Directory de Vercel no es `frontend`. |
| "Credenciales inválidas" al entrar | No se ejecutó el seed contra esa base, o sembraste con `ADMIN_EMAIL` y `ADMIN_PASSWORD` distintos a los del README. |
| Te devuelve al login con "Tu sesión expiró" | El token venció (dura 8 horas) o cambiaste `JWT_SECRET`. Inicia sesión de nuevo. |
| Primera petición muy lenta en Render | El servicio gratuito estaba dormido; despierta en cerca de un minuto. |
| `EADDRINUSE` al arrancar en local | El puerto 4000 o 5173 ya está ocupado. Cierra el otro proceso o cambia `PORT`. |
| `pnpm install` falla o avisa por versiones | Revisa que tu Node sea 20.19 o superior (`node --version`). |
| `pnpm: command not found` (o no se reconoce el comando) | Falta instalar pnpm: `corepack enable` o el instalador de <https://pnpm.io/installation>. |
| Al subir fotos: "El servicio de imágenes no está configurado" (503) | Faltan `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` o `CLOUDINARY_API_SECRET` en `backend/.env` o en Render. Reinicia la API después de agregarlas. |
| Al subir fotos: "No se pudo subir la imagen" (502) | Cloudinary rechazó las credenciales. Revisa que las tres coincidan con **Settings → API Keys** de tu cuenta; el motivo exacto queda en el log de la API. |

## Seguridad

- Los secretos (`MONGODB_URI`, `JWT_SECRET`, contraseñas) viven solo en `.env` o en los paneles de Render y Vercel. Los `.env.example` no tienen valores reales.
- Las credenciales del administrador de demostración están en este README. En un despliegue público siembra con `ADMIN_EMAIL` y `ADMIN_PASSWORD` propios.
- Permitir `0.0.0.0/0` en Atlas deja la base abierta a quien tenga usuario y contraseña. Usa una contraseña fuerte y, si puedes, restringe las IP.
- Las contraseñas se guardan con bcrypt. Los tokens se guardan en el `localStorage` del navegador y vencen a las 8 horas.
- Los datos personales de los huéspedes y los reportes con dinero exigen token; las reservas también.
