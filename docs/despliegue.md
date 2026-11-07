# Guía de despliegue de StayHub

Guía paso a paso para dejar StayHub funcionando en internet, pensada para alguien que nunca ha usado estas plataformas. Al final tendrás:

```
Navegador ──► Vercel (frontend) ──► Render (API) ──► MongoDB Atlas (base de datos)
```

Todo con planes gratuitos. Duración estimada: entre 1 y 2 horas la primera vez.

## Contenido

0. [Antes de empezar](#0-antes-de-empezar)
1. [Subir el código a GitHub](#1-subir-el-código-a-github)
2. [MongoDB Atlas](#2-mongodb-atlas)
3. [Conectar el proyecto local con Atlas](#3-conectar-el-proyecto-local-con-atlas)
4. [Render (backend)](#4-render-backend)
5. [Vercel (frontend)](#5-vercel-frontend)
6. [Cierre: CORS y pruebas en producción](#6-cierre-cors-y-pruebas-en-producción)
7. [Problemas comunes](#7-problemas-comunes)
8. [Capturas para la sección de evidencias](#8-capturas-para-la-sección-de-evidencias)
9. [Qué está verificado y qué no](#9-qué-está-verificado-y-qué-no)

---

## 0. Antes de empezar

### 0.1 Lo que necesitas

- Un computador con **Node.js 20.19 a 24** y **pnpm** funcionando (ver [README](../README.md#requisitos)). Comprueba con `node --version` y `pnpm --version`.
- **Git** instalado (`git --version`). Si no lo tienes: <https://git-scm.com/downloads>.
- Cuentas gratuitas en **GitHub**, **MongoDB Atlas**, **Render** y **Vercel**. Lo más cómodo es registrarse en Render y Vercel con el botón "Continue with GitHub", así ya quedan conectadas al repositorio.
- Un gestor de contraseñas, o al menos un archivo de texto **fuera del proyecto**, para anotar los datos de la tabla siguiente.

### 0.2 Datos que debes reemplazar

En toda la guía aparecen marcadores entre `< >`. **Nunca escribas los valores reales en archivos del repositorio**: solo en los `.env` locales (que Git ignora) y en los paneles de Render y Vercel.

| Marcador | Qué es | De dónde sale |
|---|---|---|
| `<usuario-github>` | Tu nombre de usuario de GitHub | Tu perfil de GitHub |
| `<repositorio>` | Nombre del repositorio | Lo eliges tú en el paso 1 (por ejemplo `stayhub`) |
| `<usuario>` | Usuario de base de datos de Atlas | Lo creas tú en el paso 2.4 |
| `<contraseña>` | Contraseña de ese usuario | La genera Atlas en el paso 2.4 |
| `<cluster>` | Parte del servidor de Atlas entre `@` y `.mongodb.net` (por ejemplo `stayhub.ab1cd`) | La cadena de conexión del paso 2.6 |
| `<servicio>` | Nombre del servicio en Render (queda en `https://<servicio>.onrender.com`) | Lo eliges en el paso 4.3; la URL real se ve arriba en la página del servicio |
| `<proyecto>` | Nombre del proyecto en Vercel (queda en `https://<proyecto>.vercel.app`) | Se ve en el panel de Vercel tras el primer despliegue |
| `<clave-jwt>` | Clave aleatoria para firmar sesiones | La generas en el paso 3.1 |
| `<correo-admin>` y `<contraseña-admin>` | Credenciales del administrador de la app desplegada | Las eliges tú (paso 3.1); si no, el seed usa las de demostración del README |

### 0.3 Aviso sobre los nombres de botones

Las plataformas cambian sus pantallas con frecuencia. Los nombres de esta guía salen de su documentación oficial y de la interfaz conocida; si un botón se llama distinto, busca el equivalente. El **valor** que hay que poner en cada campo es lo importante.

---

## 1. Subir el código a GitHub

Render y Vercel despliegan desde un repositorio de GitHub.

1. Entra a <https://github.com> e inicia sesión.
2. Arriba a la derecha pulsa **+** → **New repository**.
3. En **Repository name** escribe `<repositorio>` (por ejemplo `stayhub`).
4. Elige **Private** (recomendado) o **Public**. Render y Vercel pueden leer repositorios privados una vez los autorizas.
5. **No marques** "Add a README file", ni `.gitignore`, ni licencia: el repositorio debe quedar vacío.
6. Pulsa **Create repository**. GitHub muestra una página con comandos; usa los de abajo.
7. Abre una terminal **en la carpeta raíz del proyecto** (la que contiene `package.json` y `pnpm-workspace.yaml`). Si es la primera vez que usas Git en este computador, configura tu nombre y correo:

   ```bash
   git config --global user.name "<tu-nombre>"
   ```

   ```bash
   git config --global user.email "<tu-correo>"
   ```

8. Inicializa el repositorio y prepara los archivos:

   ```bash
   git init
   ```

   ```bash
   git add .
   ```

9. **Comprueba que no se vaya ningún secreto:**

   ```bash
   git status
   ```

   En la lista deben aparecer `pnpm-lock.yaml`, `package.json`, `backend/`, `frontend/`, etc. **No debe aparecer ningún archivo `.env`** (solo `.env.example`) ni `node_modules`. Si aparece un `.env`, detente y revisa el `.gitignore`.

10. Crea el primer commit y sube el código:

    ```bash
    git commit -m "StayHub"
    ```

    ```bash
    git branch -M main
    ```

    ```bash
    git remote add origin https://github.com/<usuario-github>/<repositorio>.git
    ```

    ```bash
    git push -u origin main
    ```

    Windows puede abrir una ventana del navegador para que inicies sesión en GitHub: es lo normal. Los avisos de "LF will be replaced by CRLF" no importan.

11. Recarga la página del repositorio en GitHub. Debes ver las carpetas `backend`, `frontend`, `docs` y los archivos `pnpm-lock.yaml`, `pnpm-workspace.yaml` y `README.md`. Entra a `backend/` y confirma que no hay un archivo `.env`.

**Captura:** el repositorio en GitHub mostrando las carpetas y el archivo `pnpm-lock.yaml`.

---

## 2. MongoDB Atlas

Atlas es la base de datos en la nube. Usaremos el plan gratuito (llamado **Free** o **M0**): 0,5 GB de almacenamiento y hasta 500 conexiones, de sobra para este proyecto.

### 2.1 Crear la cuenta

1. Entra a <https://www.mongodb.com/cloud/atlas/register>.
2. Regístrate con tu cuenta de Google o con correo y contraseña. Si usas correo, abre el mensaje de verificación y confirma.
3. Acepta los términos. Atlas puede mostrar un cuestionario de bienvenida: responde lo que quieras o sáltalo.

### 2.2 Crear el proyecto

1. Arriba a la izquierda, abre el menú **Projects** (o el nombre del proyecto actual) y pulsa **New Project**. Si Atlas ya creó uno llamado "Project 0", puedes usarlo y saltar al 2.3.
2. En **Project Name** escribe `stayhub`.
3. Pulsa **Next** y luego **Create Project** (no hace falta agregar miembros).

### 2.3 Crear el clúster gratuito

1. En **Project Overview**, pulsa el botón verde **Create** (o **+ Create**, o **Build a Database**).
2. Elige el plan **M0** (la opción **Free**). Si la pantalla muestra primero varias tarjetas de pago, busca la de **Free**.
3. En **Provider** elige **AWS**.
4. En **Region** elige **N. Virginia (us-east-1)**. Desde Colombia suele dar una latencia parecida o menor que São Paulo, y es la región de AWS que Render tiene más a mano (en Render elegirás **Virginia (US East)**). El selector solo muestra las regiones que admiten el plan gratuito: si no aparece, elige la más cercana que haya.
5. En **Name** escribe `stayhub` (solo letras ASCII, números y guiones; **no se puede cambiar después**).
6. Pulsa **Create** (o **Create Deployment**). Atlas tarda entre 1 y 3 minutos.
7. Si aparece el asistente **Security Quickstart** (usuario y acceso de red), puedes hacer los pasos 2.4 y 2.5 desde ahí. Si no aparece, usa el menú lateral como se explica abajo.

**Captura:** el clúster creado en **Project Overview**, con su nombre y estado.

### 2.4 Crear el usuario de base de datos

Es el usuario que usará la API, distinto de tu cuenta de Atlas.

1. En el menú lateral, sección **Security**, entra a **Database & Network Access** (en versiones anteriores son dos entradas: **Database Access** y **Network Access**). Abre la pestaña **Database Users**.
2. Pulsa **Add New Database User**.
3. **Authentication Method:** deja **Password**.
4. **Username:** escribe un nombre sin espacios ni tildes, por ejemplo `stayhub_app`. En esta guía se llama `<usuario>`.
5. **Password:** pulsa **Autogenerate Secure Password**, luego **Copy** y **guárdala ya** en tu gestor de contraseñas (Atlas no te la vuelve a mostrar). Esta es `<contraseña>`.
   - Si prefieres escribir la tuya: mínimo 16 caracteres, **solo letras y números**. Los símbolos obligan a codificarlos en la cadena de conexión (ver 2.6).
6. En **Database User Privileges** elige **Specific Privileges** y pulsa **Add Specific Privilege**. Como rol selecciona **readWrite** y como base de datos escribe `stayhub` (deja la colección vacía). Quita cualquier otro rol que Atlas haya puesto por defecto.
   - **Por qué `readWrite` sobre `stayhub`:** permite leer, insertar, modificar y borrar documentos, crear colecciones y crear o eliminar índices en esa base, que es todo lo que hacen la API y `pnpm seed`. No permite administrar usuarios ni tocar otras bases. La base `stayhub` aún no existe: se crea sola al guardar el primer dato.
   - Si no encuentras "Specific Privileges", elige el rol integrado **Read and write to any database**: también funciona y es aceptable para este proyecto, porque el clúster es solo tuyo.
7. Pulsa **Add User**.

**Captura:** la lista de **Database Users** con el usuario y su privilegio (la contraseña nunca se muestra).

### 2.5 Abrir el acceso de red

Atlas solo deja conectar a las direcciones IP de su lista de acceso (**IP Access List**). Hay que permitir dos cosas: tu computador (para probar en local) y Render (para producción).

1. En **Security**, abre **Network Access** (o la pestaña **IP Access List** dentro de **Database & Network Access**).
2. **Para probar desde tu computador:**
   1. Pulsa **Add IP Address**.
   2. Pulsa **Add Current IP Address** (en algunas versiones, "Add My Current IP Address").
   3. En **Comment** escribe `mi computador` y pulsa **Confirm**.
   - Si cambias de red (otra Wi-Fi, reinicias el router, la universidad), tu IP cambia y volverás a ver un error de conexión: repite este paso.
3. **Para Render:** el plan gratuito de Render **no tiene una IP de salida fija**. Según su documentación, los servicios salen por rangos de IP compartidos por todos los servicios de la región, y las IP fijas (*dedicated IPs*) exigen un plan Pro. Hay dos caminos:
   - **Camino simple (recomendado para este proyecto): permitir cualquier IP.** Pulsa **Add IP Address**, luego **Allow Access from Anywhere** (rellena `0.0.0.0/0`; si no ves el botón, escribe `0.0.0.0/0` en **Access List Entry**), pon el comentario `render` y pulsa **Confirm**.
   - **Camino estricto:** cuando tengas el servicio en Render (paso 4), abre **Connect → Outbound** y agrega cada rango CIDR que muestre. Esos rangos son compartidos y pueden cambiar, así que si un día la API deja de conectar, revísalos.
4. **Qué significa `0.0.0.0/0` y cuál es el riesgo.** Es "todas las direcciones IPv4 de internet". Con esa entrada, **cualquier persona en el mundo puede intentar conectarse** a tu clúster; lo único que se lo impide son el usuario y la contraseña (y la conexión va cifrada). Por eso:
   - usa una contraseña larga y aleatoria, y no la compartas ni la subas a Git;
   - el usuario solo tiene `readWrite` sobre `stayhub`, no es administrador;
   - los datos de StayHub son de prueba, no datos personales reales;
   - cuando entregues el proyecto o termine la evaluación, **borra esa entrada** de la lista (botón **Delete** en su fila) o pausa el clúster.
5. Espera a que el estado de cada entrada pase a **Active** (alrededor de un minuto).

**Captura:** la **IP Access List** con las entradas en estado **Active**.

### 2.6 Obtener la cadena de conexión

1. En el menú lateral, sección **Database**, entra a **Clusters** (o **Database**).
2. En la tarjeta de tu clúster pulsa **Connect**.
3. Elige **Drivers**. En **Driver** deja **Node.js** y la versión que sugiera Atlas.
4. Copia la cadena del paso 3. Se ve así (con marcadores):

   ```
   mongodb+srv://<db_username>:<db_password>@<cluster>.mongodb.net/?retryWrites=true&w=majority&appName=stayhub
   ```

5. Haz tres cambios en tu copia (en un editor de texto, no en el repositorio):
   1. Reemplaza `<db_username>` por tu `<usuario>` (sin los símbolos `<>`).
   2. Reemplaza `<db_password>` por tu `<contraseña>` (sin los símbolos `<>`).
   3. **Escribe el nombre de la base de datos entre `.mongodb.net/` y el `?`**. Es el dato que Atlas no pone: sin él, Mongoose usa la base `test` y tus datos terminan en otro lugar.

   Resultado final, con marcadores:

   ```
   mongodb+srv://<usuario>:<contraseña>@<cluster>.mongodb.net/stayhub?retryWrites=true&w=majority&appName=stayhub
   ```

6. **Si la contraseña tiene caracteres especiales**, deben escribirse codificados en la URL. Según la documentación de Atlas, hay que codificar estos (y el espacio) cuando están en el usuario o la contraseña:

   | Carácter | Se escribe | Carácter | Se escribe | Carácter | Se escribe |
   |---|---|---|---|---|---|
   | `:` | `%3A` | `/` | `%2F` | `?` | `%3F` |
   | `#` | `%23` | `[` | `%5B` | `]` | `%5D` |
   | `@` | `%40` | `!` | `%21` | `$` | `%24` |
   | `&` | `%26` | `'` | `%27` | `(` | `%28` |
   | `)` | `%29` | `*` | `%2A` | `,` | `%2C` |
   | `;` | `%3B` | `=` | `%3D` | `%` | `%25` |
   | espacio | `%20` | | | | |

   Ejemplo: la contraseña `p@ss:1` se escribe `p%40ss%3A1` en la cadena. La forma más fácil de evitar el problema es usar una contraseña solo con letras y números.
7. Guarda la cadena final en tu gestor de contraseñas. Es un secreto: quien la tenga puede entrar a tu base.

**Captura:** el diálogo **Connect → Drivers** **sin** la contraseña visible (o con la cadena tapada).

---

## 3. Conectar el proyecto local con Atlas

### 3.1 Archivos `.env`

1. En la raíz del proyecto, copia los ejemplos:

   ```bash
   cp backend/.env.example backend/.env
   ```

   ```bash
   cp frontend/.env.example frontend/.env
   ```

   (En PowerShell, `cp` también funciona.)
2. Genera una clave para firmar las sesiones y cópiala:

   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```

3. Abre `backend/.env` y déjalo así, con tus valores en lugar de los marcadores:

   ```
   PORT=4000
   MONGODB_URI=mongodb+srv://<usuario>:<contraseña>@<cluster>.mongodb.net/stayhub?retryWrites=true&w=majority&appName=stayhub
   JWT_SECRET=<clave-jwt>
   CORS_ORIGIN=http://localhost:5173
   ADMIN_EMAIL=<correo-admin>
   ADMIN_PASSWORD=<contraseña-admin>
   ```

   - Sin comillas ni espacios alrededor del `=`.
   - `ADMIN_EMAIL` y `ADMIN_PASSWORD` son opcionales: solo los lee `pnpm seed`. **Si vas a publicar la app en internet, defínelos con valores propios**; si los omites, el seed crea el administrador de demostración que figura en el README, y esas credenciales son públicas.
4. `frontend/.env` ya trae el valor correcto para trabajar en local:

   ```
   VITE_API_URL=http://localhost:4000/api
   ```

`backend/.env` y `frontend/.env` están en el `.gitignore`: Git no los sube.

### 3.2 Arrancar la API contra Atlas

```bash
pnpm dev:backend
```

Debes ver, en este orden:

```text
MongoDB conectado: stayhub
API de StayHub escuchando en el puerto 4000
```

Si en cambio aparece `No se pudo iniciar el servidor: ...`, mira el mensaje en la sección [Problemas comunes](#7-problemas-comunes).

### 3.3 Probar `/api/health`

Con la API en marcha, abre en el navegador <http://localhost:4000/api/health>. Debe responder:

```json
{"estado":"ok","baseDeDatos":"conectada"}
```

Si dice `"degradado"` (estado HTTP 503), la API no está conectada a Atlas.

**Captura:** la terminal con "MongoDB conectado: stayhub" y la pestaña del navegador con `/api/health`.

### 3.4 Cargar los datos de prueba (seed)

Deja la API encendida, abre **otra terminal** en la raíz del proyecto y ejecuta:

```bash
pnpm seed
```

**Atención:** el seed **borra y recrea** las 6 colecciones de la base indicada en `MONGODB_URI`. Úsalo solo sobre una base de prueba como esta.

Debe terminar con una línea como:

```text
Listo: 5 hoteles, 40 habitaciones, 50 huéspedes, 150 reservas, <N> reseñas y 1 usuario admin (<correo-admin>).
```

**Captura:** la terminal con esa línea final.

### 3.5 Verificar en Atlas (Browse Collections)

1. En Atlas, entra a **Clusters** y pulsa **Browse Collections** en tu clúster (en versiones nuevas, **Data Explorer** en el menú lateral, sección **Database**).
2. Abre la base **stayhub**. Deben existir 6 colecciones con estos documentos:

   | Colección | Documentos |
   |---|---|
   | `hoteles` | 5 |
   | `habitaciones` | 40 |
   | `huespedes` | 50 |
   | `reservas` | 150 |
   | `resenas` | `<N>` (el número del mensaje del seed) |
   | `usuarios` | 1 |

3. Entra a `reservas` y abre la pestaña **Indexes**: verás los índices (entre ellos uno único sobre `codigo`).
4. Si ves una base llamada `test` con las colecciones en lugar de `stayhub`, a tu `MONGODB_URI` le falta `/stayhub` antes del `?`.

**Captura:** **Browse Collections** con la base `stayhub` y las 6 colecciones con su conteo.

### 3.6 Probar un endpoint real

1. **Sin token** (los hoteles son públicos). En el navegador abre <http://localhost:4000/api/hoteles>. Debes ver `"total":5` y la lista de hoteles. Esos datos vienen de Atlas.
2. **Con token** (las reservas exigen sesión). En PowerShell, con tus credenciales de administrador:

   ```powershell
   $sesion = Invoke-RestMethod -Method Post -Uri http://localhost:4000/api/auth/login -ContentType 'application/json' -Body '{"email":"<correo-admin>","password":"<contraseña-admin>"}'
   ```

   ```powershell
   Invoke-RestMethod -Uri "http://localhost:4000/api/reservas?limit=1" -Headers @{ Authorization = "Bearer $($sesion.token)" }
   ```

   La segunda debe mostrar `total` igual a 150.
3. (Opcional) Prueba toda la app en local: `pnpm dev`, abre <http://localhost:5173> e ingresa con tu administrador.

Cuando termines, detén los procesos con `Ctrl + C` en cada terminal.

---

## 4. Render (backend)

Render ejecutará la API. El plan gratuito de **Web Services** alcanza.

### 4.1 Crear la cuenta

1. Entra a <https://render.com> y pulsa **Get Started** (o **Sign in**).
2. Elige **GitHub** para registrarte y autoriza la aplicación de Render.

### 4.2 Crear el Web Service

1. En el panel, arriba a la derecha, pulsa **+ New** → **Web Service**.
2. En **Source Code**, pestaña **Git Provider**, elige tu cuenta de GitHub. Si tu repositorio no aparece, pulsa **Configure account**, concede acceso a `<repositorio>` en GitHub y vuelve.
3. Selecciona `<repositorio>` y pulsa **Connect**.

### 4.3 Rellenar el formulario

| Campo | Valor |
|---|---|
| **Name** | `stayhub-api` (queda en `https://stayhub-api.onrender.com`; si el nombre está tomado, Render agrega un sufijo: la URL real se ve arriba en la página del servicio. Esa es tu `<servicio>`) |
| **Language** | `Node` |
| **Branch** | `main` |
| **Region** | `Virginia (US East)`, para quedar cerca de Atlas (N. Virginia). Si no aparece, elige la más cercana |
| **Root Directory** | **Déjalo vacío.** El `pnpm-lock.yaml` está en la raíz del repositorio y, según Render, los archivos fuera del Root Directory no están disponibles durante el build |
| **Build Command** | `corepack enable && pnpm install --frozen-lockfile --filter stayhub-backend...` |
| **Start Command** | `node backend/src/server.js` |
| **Instance Type** (plan) | `Free` |

Qué hace cada comando:

- `corepack enable` activa Corepack, que viene con Node y descarga **la versión exacta de pnpm** que fija el campo `packageManager` de `package.json` (12.18.0). Sin esto Render podría usar otra versión.
- `pnpm install --frozen-lockfile` instala exactamente lo que dice `pnpm-lock.yaml` y falla si el lockfile está desactualizado. `--filter stayhub-backend...` instala solo el backend y lo que necesita, sin bajar React ni Vite.
- `node backend/src/server.js` arranca la API directamente. Es equivalente a `pnpm start`, pero no depende de que pnpm exista en tiempo de ejecución.

**Versión de Node.** Render la toma, por este orden, de la variable `NODE_VERSION`, de un archivo `.node-version`, de `.nvmrc` o del campo `engines` del `package.json` de la raíz. El proyecto declara `>=20.19.0 <25`, así que Render usa una versión 24.x, que está probada. No tienes que hacer nada. Si quieres fijarla tú, agrega la variable `NODE_VERSION` con el valor `22.12.0`.

### 4.4 Variables de entorno

Más abajo, en **Environment Variables** (si está plegado, abre **Advanced**), pulsa **Add Environment Variable** por cada una:

| Key | Value |
|---|---|
| `MONGODB_URI` | La cadena completa del paso 2.6, con `/stayhub` |
| `JWT_SECRET` | `<clave-jwt>`, la misma de tu `backend/.env` (o genera otra con el comando del paso 3.1) |
| `CORS_ORIGIN` | `http://localhost:5173` por ahora; la cambiarás en el paso 6.1 |

- Pega los valores **sin comillas**.
- **No definas `PORT`**: Render lo asigna solo (10000 por defecto) y la API lo lee.
- `ADMIN_EMAIL` y `ADMIN_PASSWORD` no hacen falta aquí: el seed se ejecuta desde tu computador.

### 4.5 Health Check Path

En **Advanced** → **Health Check Path** escribe `/api/health`. Render consultará esa ruta: si responde con un código 2xx o 3xx el servicio está sano; si falla durante un despliegue nuevo, Render cancela ese despliegue y mantiene el anterior.

(Si lo olvidas, se configura después en **Settings → Health Checks → Edit**.)

### 4.6 Desplegar

1. Pulsa **Create Web Service** (en algunas pantallas el botón se llama **Deploy**).
2. Render abre la página del servicio y empieza a construir. Observa el texto que va saliendo; la primera vez tarda entre 2 y 5 minutos.
3. Arriba verás tu URL `https://<servicio>.onrender.com`. **Anótala.**
4. **Cómo leer los logs:**
   - Pestaña **Logs** (menú de la izquierda): muestra lo que imprime la API mientras corre.
   - Pestaña **Deploys**: abre un despliegue para ver el log de su construcción (la instalación de pnpm).
5. **Cómo saber que funcionó.** En **Logs** deben aparecer estas dos líneas:

   ```text
   MongoDB conectado: stayhub
   API de StayHub escuchando en el puerto 10000
   ```

   y el estado del despliegue pasa a **Live**.
6. Si el despliegue falla, el log termina con `No se pudo iniciar el servidor: ...` o con un error de pnpm: busca el mensaje en [Problemas comunes](#7-problemas-comunes).

### 4.7 Probar la API en la nube

En el navegador abre:

- `https://<servicio>.onrender.com/api/health` → `{"estado":"ok","baseDeDatos":"conectada"}`
- `https://<servicio>.onrender.com/api/hoteles` → los 5 hoteles de Atlas (datos sembrados en el paso 3.4)

### 4.8 El plan gratuito se duerme

Según la documentación de Render, un servicio gratuito **se apaga tras 15 minutos sin recibir tráfico** y **tarda cerca de un minuto en despertar** cuando llega una petición. Consecuencias:

- La primera petición tras una pausa (por ejemplo, el login) puede tardar un minuto; el frontend parece "colgado" pero responde.
- Antes de una demostración o de tomar las capturas, abre `/api/health` y espera la respuesta.
- Los servicios gratuitos tienen un tope de 750 horas de instancia al mes por cuenta; un servicio dormido no las consume.

**Capturas:** el formulario de creación (Root Directory vacío, comandos, plan Free), la pestaña **Environment** (sin mostrar los valores), **Logs** con "MongoDB conectado" y el estado **Live**, y `/api/health` en el navegador con la URL de `onrender.com`.

---

## 5. Vercel (frontend)

### 5.1 Crear la cuenta

1. Entra a <https://vercel.com/signup>.
2. Elige el plan **Hobby** (gratuito, uso personal) y **Continue with GitHub**. Autoriza.

### 5.2 Importar el repositorio

1. En el panel, pulsa **Add New…** → **Project**.
2. En **Import Git Repository** busca `<repositorio>` y pulsa **Import**. Si no aparece, pulsa **Adjust GitHub App Permissions** y concede acceso al repositorio.

### 5.3 Configurar el proyecto

En la pantalla **Configure Project**:

1. **Project Name:** `stayhub` (queda en `https://stayhub.vercel.app` si está libre; si no, Vercel asigna otro. La URL real aparecerá tras el despliegue: esa es tu `<proyecto>`).
2. **Root Directory:** pulsa **Edit**, elige la carpeta **`frontend`** y pulsa **Continue**. Es el paso más importante: sin él Vercel busca la app en la raíz.
3. **Framework Preset:** debe pasar a **Vite** al cambiar el Root Directory. Si no, selecciónalo.
4. **Build and Output Settings:** **no cambies nada**. Deja desactivado el interruptor **Override** de **Install Command**, y verifica que **Output Directory** sea `dist`. El **Build Command** que muestre Vercel para Vite sirve tal cual (`vite build` o `pnpm build` son equivalentes aquí).
   - **No sobrescribas el Install Command con `pnpm install`.** Según la documentación de Vercel, con un comando de instalación personalizado y sin Corepack, Vercel usa una versión muy antigua de pnpm (la 6) que no entiende nuestro lockfile.
5. **Environment Variables:** despliega la sección y agrega estas dos (en **Key** y **Value**, y pulsa **Add** tras cada una; deja marcados los tres entornos):

   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://<servicio>.onrender.com/api` (con `/api` al final y sin barra tras `api`) |
   | `ENABLE_EXPERIMENTAL_COREPACK` | `1` |

   - `VITE_API_URL` apunta al backend de Render. Vite la **incrusta en el código al compilar**: si la cambias después, hay que volver a desplegar.
   - `ENABLE_EXPERIMENTAL_COREPACK=1` hace que Vercel use la versión de pnpm de `packageManager` (12.18.0) en vez de adivinarla. Es necesario porque nuestro lockfile lo generó pnpm 12.
6. Verifica la opción **Include source files outside of the Root Directory in the Build Step**: debe estar **activada** (lo es por defecto en proyectos nuevos; se ve en **Settings → General → Root Directory**). Es la que permite a Vercel leer `pnpm-lock.yaml` y `pnpm-workspace.yaml`, que están en la raíz del repositorio.
7. Pulsa **Deploy**.

### 5.4 Revisar el despliegue

1. Vercel muestra el progreso de la construcción (**Building**). Tarda 1 o 2 minutos.
2. Si termina bien, aparece una pantalla de felicitación con una vista previa. Pulsa **Continue to Dashboard**.
3. En el panel del proyecto, copia la URL de producción de **Domains** (`https://<proyecto>.vercel.app`). **Anótala.**
4. Si algo falla, abre **Deployments**, entra al despliegue fallido y lee los **Build Logs**; busca el error en [Problemas comunes](#7-problemas-comunes).

### 5.5 Fijar la versión de Node (recomendado)

El frontend declara Node `>=22.12` o `20.19+` y menor que 25, y Vercel puede elegir por defecto una versión más nueva. Para que coincida con la de Render:

1. En el proyecto, **Settings** → **Build and Deployment**.
2. En **Node.js Version** elige **24.x** y pulsa **Save**.
3. Vuelve a desplegar: **Deployments** → menú **⋯** del último despliegue → **Redeploy** → **Redeploy**.

### 5.6 Las rutas de React Router y `vercel.json`

El archivo `frontend/vercel.json` **ya existe** en el repositorio:

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

Hace que cualquier ruta (como `/reservas`) devuelva `index.html` y deje a React Router resolverla; sin él, recargar la página daría 404. Funciona porque el Root Directory del proyecto es `frontend`, donde está este archivo. Es la configuración que la documentación de Vercel recomienda para aplicaciones de una sola página con Vite, y los archivos estáticos (JS, CSS) se siguen sirviendo con normalidad. No tienes que crearlo.

### 5.7 Probar

1. Abre `https://<proyecto>.vercel.app`. Debe cargar la pantalla de login (marca **StayHub** y el texto "Inicia sesión para administrar tus hoteles").
2. Pulsa `F5` en esa pantalla: debe recargar sin 404.
3. Si intentas ingresar ahora, **fallará por CORS**: es normal, falta el paso 6.1.

**Cambiar `VITE_API_URL` más adelante:** **Settings → Environment Variables**, edita el valor, guarda, y luego **Deployments → ⋯ → Redeploy** (si ves la opción de usar la caché de compilación existente, desmárcala). Los despliegues anteriores conservan el valor con el que se compilaron.

**Capturas:** **Configure Project** (Root Directory `frontend`, preset Vite, nombres de las variables), el despliegue en estado **Ready** y la pantalla de login en la URL de `vercel.app`.

---

## 6. Cierre: CORS y pruebas en producción

### 6.1 Actualizar `CORS_ORIGIN` en Render

El navegador solo deja que una web llame a la API si la API la autoriza. Hay que decirle a Render cuál es la URL real del frontend.

1. En Render, abre tu servicio y entra a **Environment** (menú de la izquierda).
2. Edita `CORS_ORIGIN` y pon la URL exacta de Vercel:

   ```
   https://<proyecto>.vercel.app
   ```

   - Con `https://`, **sin barra final** y **sin ruta** (ni `/login`).
   - Si necesitas varios orígenes, sepáralos con comas. Las URL de vista previa de Vercel cambian en cada despliegue, así que esas no funcionarán: prueba siempre en la URL de producción.
3. Pulsa **Save and deploy** (también sirve **Save, rebuild, and deploy**). Evita **Save only**, que guarda el valor pero no vuelve a desplegar el servicio con él.
4. Espera a que el despliegue vuelva a estar **Live** (1 a 3 minutos).

### 6.2 Lista de pruebas en producción

Con el servicio despierto (abre antes `/api/health`), marca cada punto:

- [ ] `https://<servicio>.onrender.com/api/health` responde `"estado":"ok"`.
- [ ] `https://<proyecto>.vercel.app` carga la pantalla de login, sin errores en rojo en la consola del navegador (`F12` → **Console**).
- [ ] **Login:** con `<correo-admin>` y `<contraseña-admin>` pulsa **Ingresar**; llegas a **Hoteles** y ves 5 hoteles. (Si no definiste credenciales propias en el seed, usa las de demostración del README.)
- [ ] En `F12` → **Network**, las peticiones van a `<servicio>.onrender.com` y devuelven `200`.
- [ ] **Habitaciones** y **Huéspedes** muestran sus listados.
- [ ] **Crear una reserva:** **Reservas** → **Nueva reserva** → elige fecha de entrada y de salida futuras, una **habitación disponible**, un **huésped** y el número de huéspedes → **Crear reserva**. Aparece en el listado con su código. Anótalo.
- [ ] **Verla en Atlas:** en **Browse Collections** → `stayhub` → `reservas`, el conteo ahora es 151. Filtra con `{ "codigo": "<código-de-la-reserva>" }` y aparece el documento.
- [ ] **Registrar un pago:** abre la reserva (clic en su código) y, en **Pagos**, usa **Registrar pago**. Con un pago de al menos el 30 % del total la reserva pasa a **confirmada**.
- [ ] **Regla de negocio:** intenta crear otra reserva de esa misma habitación en las mismas fechas: la app rechaza el cruce con un mensaje de error (409).
- [ ] **Reportes:** abre **Reportes**; cargan las tarjetas y gráficas (**Ingresos por mes**, **Ocupación**, etc.) con datos.
- [ ] **Recarga:** estando en `/reservas`, pulsa `F5`; la página vuelve a cargar sin 404.
- [ ] **Cerrar sesión** y volver a ingresar funciona.

### 6.3 Limpieza al terminar la evaluación

- Borra de Atlas la entrada `0.0.0.0/0` de **Network Access** (o pausa el clúster).
- Si publicaste el repositorio como **Public**, confirma que no contiene `.env` ni credenciales (`git status` y la vista del repositorio en GitHub).
- Si en algún momento una contraseña o la cadena de conexión quedó expuesta, cambia la contraseña del usuario en Atlas (**Database Users → Edit**) y actualiza `MONGODB_URI` en Render y en tu `backend/.env`.

---

## 7. Problemas comunes

### Atlas y conexión a la base de datos

| Síntoma | Causa y solución |
|---|---|
| `bad auth : authentication failed` o "Authentication failed" | Usuario o contraseña incorrectos. Revisa que no queden los símbolos `<` `>` de los marcadores, que la contraseña sea la del usuario (no la de tu cuenta de Atlas) y que los caracteres especiales estén codificados (paso 2.6). Si dudas, en **Database Users → Edit** genera una contraseña nueva y actualiza la cadena. |
| `Could not connect to any servers in your MongoDB Atlas cluster. One common reason is that you're trying to access the database from an IP that isn't whitelisted` (error `MongooseServerSelectionError`) | La IP desde donde conectas no está en la **IP Access List**. En local, agrega tu IP actual (paso 2.5.2). En Render, agrega `0.0.0.0/0` (paso 2.5.3). Espera a que la entrada esté **Active**. |
| `querySrv ENOTFOUND _mongodb._tcp...` o `querySrv ECONNREFUSED` | El texto entre `@` y `.mongodb.net` está mal escrito, o tu red bloquea las consultas DNS de tipo SRV (pasa en algunas redes de universidades). Copia de nuevo la cadena desde **Connect**; si persiste, prueba con otra red, como los datos del celular. |
| `not authorized on stayhub to execute command` | El usuario no tiene el privilegio `readWrite` sobre `stayhub`. Edítalo en **Database Users** y revisa el rol y el nombre de la base. |
| Los datos aparecen en una base `test` | A la cadena le falta `/stayhub` antes del `?`. El log dice `MongoDB conectado: test`. |
| `No se pudo iniciar el servidor: Falta la variable de entorno MONGODB_URI` | En local, `backend/.env` no existe o la variable está mal escrita. En Render, falta en **Environment** (revisa que el nombre sea exacto). |
| `/api/health` responde 503 `degradado` | La API arrancó pero perdió la conexión con Atlas. Revisa el clúster (¿pausado? Atlas pausa los clústeres gratuitos tras 30 días sin conexiones: pulsa **Resume**) y la lista de IP. |

### Render

| Síntoma | Causa y solución |
|---|---|
| El build falla con `corepack: command not found` o `pnpm: command not found` | Corepack no está disponible en esa imagen. Cambia el **Build Command** a `pnpm install --frozen-lockfile --filter stayhub-backend...` (si pnpm ya existe en Render, respeta por sí solo la versión de `packageManager`). Si tampoco hay pnpm, usa `npm install -g pnpm@12.18.0 && pnpm install --frozen-lockfile --filter stayhub-backend...`. |
| El build falla con `Cannot find matching keyid` (o similar) al descargar pnpm | Es un problema conocido de firmas de Corepack. Agrega la variable de entorno `COREPACK_INTEGRITY_KEYS` con el valor `0` y vuelve a desplegar. |
| `ERR_PNPM_OUTDATED_LOCKFILE` | El `pnpm-lock.yaml` no coincide con los `package.json`. En local ejecuta `pnpm install`, haz commit del `pnpm-lock.yaml` y haz `git push`. |
| "No open ports detected" / "Port scan timeout" | La API se cayó antes de empezar a escuchar. Abre **Logs**: casi siempre es un error de Atlas o una variable faltante. |
| El despliegue se cancela por el health check | `/api/health` no responde 2xx o 3xx en 5 segundos: normalmente es la conexión con Atlas. Revisa **Logs**. |
| Quedó la versión equivocada de Node | Define la variable `NODE_VERSION` (por ejemplo `22.12.0`) y vuelve a desplegar. |
| Cambié una variable y no pasa nada | Hay que guardar con **Save and deploy**; **Restart service** no aplica variables nuevas. |
| La primera petición tarda un minuto | El plan gratuito estaba dormido. Es normal (paso 4.8). |

### Vercel y navegador

| Síntoma | Causa y solución |
|---|---|
| En la consola: `blocked by CORS policy: No 'Access-Control-Allow-Origin' header` | `CORS_ORIGIN` en Render no coincide **exactamente** con el origen del frontend: revisa `https://`, el dominio, que no haya barra final ni ruta, y que el redeploy de Render ya haya terminado. No funciona desde URL de vista previa de Vercel. También ocurre si la API está dormida y aún no responde: reintenta tras un minuto. |
| El login responde 404 o HTML, o las peticiones van a `localhost` o al dominio de Vercel | `VITE_API_URL` no existía al compilar, o le falta `/api`. Corrígela en **Settings → Environment Variables** y haz **Redeploy**. |
| 404 al recargar una página como `/reservas` | El **Root Directory** del proyecto no es `frontend`, o `frontend/vercel.json` no está en el repositorio. Revisa ambos y haz **Redeploy**. |
| El build de Vercel falla con un error de lockfile o de pnpm (`ERR_PNPM_...`, "lockfile") | Falta la variable `ENABLE_EXPERIMENTAL_COREPACK=1`, o se sobrescribió el **Install Command**. Agrega la variable, quita la sobrescritura y haz **Redeploy**. |
| El build de Vercel falla con `Cannot find matching keyid` | Igual que en Render: agrega la variable `COREPACK_INTEGRITY_KEYS` con valor `0`. |
| El build falla por la versión de Node | Fija **Node.js Version** en `24.x` (paso 5.5) y vuelve a desplegar. |
| "Credenciales inválidas" al ingresar | No se ejecutó el seed contra esa base, o sembraste con otro `ADMIN_EMAIL` / `ADMIN_PASSWORD`. Ejecuta `pnpm seed` con el `.env` correcto. |
| "Tu sesión expiró" | El token dura 8 horas, o cambiaste `JWT_SECRET` en Render. Ingresa de nuevo. |

---

## 8. Capturas para la sección de evidencias

Guárdalas en `docs/evidencias/` con nombres ordenados (por ejemplo `01-atlas-cluster.png`). **Antes de guardar cada una, tapa contraseñas, cadenas de conexión y la clave JWT.** Es mejor capturar la ventana completa del navegador, con la URL visible.

| N.º | Qué capturar | Paso |
|---|---|---|
| 01 | Repositorio en GitHub con carpetas y `pnpm-lock.yaml` | 1 |
| 02 | Clúster `stayhub` creado en Atlas (nombre, versión, estado) | 2.3 |
| 03 | **Database Users** con el usuario y el privilegio `readWrite` sobre `stayhub` | 2.4 |
| 04 | **IP Access List** con entradas **Active** | 2.5 |
| 05 | **Connect → Drivers**, sin contraseña visible | 2.6 |
| 06 | Terminal con `MongoDB conectado: stayhub` | 3.2 |
| 07 | `http://localhost:4000/api/health` en el navegador | 3.3 |
| 08 | Terminal con el resultado de `pnpm seed` | 3.4 |
| 09 | **Browse Collections** con las 6 colecciones y su conteo | 3.5 |
| 10 | `/api/hoteles` o `/api/reservas` en local con datos de Atlas | 3.6 |
| 11 | Formulario de Render con Root Directory vacío, comandos y plan Free | 4.3 |
| 12 | Pestaña **Environment** de Render (solo las claves, valores tapados) | 4.4 |
| 13 | **Logs** de Render con "MongoDB conectado" y el estado **Live** | 4.6 |
| 14 | `https://<servicio>.onrender.com/api/health` en el navegador | 4.7 |
| 15 | **Configure Project** de Vercel (Root Directory, preset Vite, variables) | 5.3 |
| 16 | Despliegue de Vercel en **Ready** | 5.4 |
| 17 | Pantalla de login en `https://<proyecto>.vercel.app` | 5.7 |
| 18 | `CORS_ORIGIN` en Render con la URL de Vercel | 6.1 |
| 19 | Login exitoso, y en `F12 → Network` las peticiones a `onrender.com` con estado 200 | 6.2 |
| 20 | Reserva recién creada en la app | 6.2 |
| 21 | Esa misma reserva en Atlas (colección `reservas`, filtrada por código) | 6.2 |
| 22 | Página **Reportes** con datos | 6.2 |
| 23 | Recarga de `/reservas` sin 404 | 6.2 |

---

## 9. Qué está verificado y qué no

- **Verificado en local** (contra un MongoDB real en memoria, no contra Atlas): `pnpm install`, `pnpm seed`, `pnpm dev`, `pnpm build` y los logs de la API. Además, `node backend/src/server.js` ejecutado desde la raíz del repositorio (el Start Command de Render) resuelve sus dependencias y reproduce los mensajes `Falta la variable de entorno MONGODB_URI` y `querySrv ENOTFOUND`. El resto de mensajes de error de Atlas de la sección 7 (`bad auth`, IP no permitida) son los habituales de Mongoose y Atlas, no se reprodujeron aquí.
- **Contrastado con la documentación oficial (6 de noviembre de 2026):** Render (variable `PORT` 10000, orden de versión de Node, Root Directory, health check, suspensión a los 15 minutos, cerca de 1 minuto para despertar, IP de salida compartidas), Vercel (Root Directory, opción de archivos fuera del Root Directory, Corepack con `ENABLE_EXPERIMENTAL_COREPACK`, rewrites de Vite, variables de entorno y redeploy) y Atlas (pasos de creación del clúster y del usuario, lista de IP, cadena de conexión y caracteres a codificar, límites del plan gratuito).
- **No verificado en las plataformas reales:** esta guía no se ejecutó en cuentas reales de Atlas, Render ni Vercel. En concreto:
  - Render no documenta pnpm ni Corepack, así que el **Build Command con `corepack enable`** es la parte con más riesgo; las alternativas están en la sección 7.
  - Vercel no documenta en las páginas consultadas qué comandos de Build e Install propone para Vite ni cómo instala un workspace de pnpm con el Root Directory en `frontend`.
  - La documentación de Atlas consultada no lista como no soportados `$lookup`, `$dateDiff` ni los índices con collation, pero tampoco los confirma como soportados en el plan gratuito. El primer `pnpm seed` y los **Reportes** contra Atlas son la prueba real.
  - Los nombres exactos de menús y botones de Atlas (por ejemplo **Database & Network Access**, **Specific Privileges**, **Allow Access from Anywhere**, **Browse Collections**) y la región de Render más cercana a N. Virginia salen de la interfaz conocida y pueden haber cambiado.
