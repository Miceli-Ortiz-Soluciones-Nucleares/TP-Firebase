# integrated-spec-v2.md — v3.0

> **Historial de versiones**
> - v1.0: Borrador inicial.
> - v2.0: Integración de constitución + spec funcional.
> - v3.0 (2026-07-07): Reescritura mayor — PayPal diferido a Fase 2; autenticación por JWT Custom Claims formalizada; schemas de datos definidos; stack tecnológico declarado; variables de entorno especificadas; tabla de rutas completa; reglas de Firestore explícitas; ambigüedades de US-02 y US-04 resueltas; estados de carga y error incorporados.

---

## Sección 1: Constitución del Proyecto

> Las reglas de esta sección son **inmutables e innegociables**. Ningún cambio de implementación puede contradirlas. Todo PR que las viole debe ser rechazado.

### Principios Fundamentales

1. **Spec-First (La especificación manda)**: No se programa ninguna funcionalidad, botón, ruta ni flujo que no esté explícitamente definido en este documento. El código es la ejecución del plan, nunca al revés.

2. **Arquitectura MVC Adaptada a React**:
   - **Vista (`src/components/`)**: Componentes React puros. Solo estructuran JSX y aplican estilos con Tailwind CSS. **Prohibido** acceder a Firebase directamente o contener lógica de negocio.
   - **Controlador (`src/hooks/`)**: Custom Hooks que encapsulan estado, llaman a los servicios y exponen solo lo necesario a las vistas.
   - **Modelo (`src/services/`)**: Módulos JS/TS independientes que interactúan exclusivamente con Firebase Auth y Firestore. Sin estado interno.

3. **Sin Firebase Functions en Fase 1**: Toda la lógica se resuelve en el cliente usando reglas de seguridad de Firestore y JWT. Garantiza que el proyecto sea testeable localmente sin infraestructura adicional.

4. **Autenticación por JWT con Custom Claims**: El rol de administrador se transporta en el token JWT emitido por Firebase Auth. El frontend lo lee del token decodificado; Firestore lo valida en sus reglas. **No se usa UID hardcodeado en ningún lugar del código.**

5. **Despliegue Automatizado (Fase final)**: El pipeline de CI/CD con GitHub Actions se configura una vez que el sistema sea 100% funcional en local. El pipeline debe ejecutar `npm run build` y `firebase deploy --only hosting`.

---

### Guía de Diseño: Estética Bauhaus

> *"La forma sigue a la función."* — Bauhaus, 1919.

- **Estructura Geométrica**: Grillas ortogonales, alineaciones asimétricas balanceadas, bordes divisorios de 1 px (`border-neutral-800`). **Prohibido**: sombras pesadas (`shadow-lg` o mayor), degradados complejos y adornos decorativos.

- **Paleta de Colores**:

  | Rol | Valor | Clase Tailwind |
  |-----|-------|----------------|
  | Fondo base | `#121212` | `bg-[#121212]` |
  | Texto principal | `#f3f3f3` | `text-[#f3f3f3]` |
  | Texto secundario | `#8a8a8a` | `text-[#8a8a8a]` |
  | Acento rojo (acción) | `#dd3b3b` | `text-[#dd3b3b]` / `bg-[#dd3b3b]` |
  | Acento ámbar (aviso) | `#ff9d00` | `text-[#ff9d00]` |
  | Borde sutil | `#2a2a2a` | `border-neutral-800` |

  Los colores de acento se usan **únicamente** para: botón de confirmar orden, contador del carrito (badge), estados de error de validación y estados de éxito de la operación.

- **Tipografía** (Google Fonts — cargar en `index.html`):
  - **Sans-serif principal**: `Space Grotesk` — para títulos, nombres de productos, labels de formulario y navegación. Clase: `font-sans tracking-tight`.
  - **Monoespaciada**: `Space Mono` — obligatoria para precios, IDs de transacción, especificaciones técnicas y cualquier dato numérico de hardware. Clase: `font-mono`.

---

## Sección 2: Stack Tecnológico y Entorno

### 2.1 Dependencias del Proyecto

| Capa | Tecnología | Versión mínima |
|------|-----------|----------------|
| Framework UI | React | 18.x |
| Lenguaje | TypeScript | 5.x |
| Build tool | Vite | 5.x |
| Estilos | Tailwind CSS | 3.x |
| Routing | React Router DOM | 6.x |
| Backend-as-a-Service | Firebase SDK | 10.x |
| Íconos | lucide-react | latest |

### 2.2 Variables de Entorno

El archivo `.env` en la raíz del proyecto debe contener exactamente las siguientes claves. **Nunca commitear este archivo** (debe estar en `.gitignore`). El archivo `.env.example` con las claves vacías sí se commitea.

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

> **Nota de seguridad**: Todas las variables `VITE_*` son públicas por construcción (quedan expuestas en el bundle del navegador). Esto es seguro porque Firebase Auth y las reglas de Firestore protegen los recursos. Nunca agregar `VITE_FIREBASE_ADMIN_SDK_*` ni ninguna credencial de servidor a este archivo.

### 2.3 Estructura de Directorios

```
src/
├── components/        # Vistas (React puro + Tailwind)
│   ├── layout/        # Header, Footer, ProtectedRoute
│   ├── catalog/       # ProductCard, ProductModal, CatalogGrid
│   ├── cart/          # CartItem, CartSummary, CartPage
│   ├── checkout/      # OrderConfirmation
│   ├── admin/         # ProductForm, ProductTable, OrdersTable
│   └── ui/            # LoadingSpinner, ErrorMessage, EmptyState
├── hooks/             # Controladores
│   ├── useProducts.ts
│   ├── useCart.ts
│   ├── useAuth.ts
│   └── useOrders.ts
├── services/          # Modelo (Firebase)
│   ├── firebase.ts    # Inicialización del SDK
│   ├── auth.service.ts
│   ├── products.service.ts
│   └── orders.service.ts
├── types/             # Interfaces TypeScript globales
│   └── index.ts
├── router/            # Definición de rutas
│   └── index.tsx
└── main.tsx
```

---

## Sección 3: Autenticación con JWT y Roles

### 3.1 Mecanismo de Custom Claims

Firebase Auth emite tokens JWT estándar. El rol de administrador se implementa mediante un **Custom Claim** `{ "admin": true }` incrustado en el payload del JWT.

**Flujo de configuración (único, manual, previo al despliegue)**:

1. Crear el usuario administrador en la consola de Firebase > Authentication > Add User.
2. Obtener el `UID` del usuario creado.
3. Ejecutar el siguiente script de Node.js **una sola vez** desde la máquina local (requiere Service Account JSON descargado de Firebase Console):

```typescript
// scripts/set-admin-claim.ts
import * as admin from 'firebase-admin';
import serviceAccount from './serviceAccountKey.json';

admin.initializeApp({ credential: admin.credential.cert(serviceAccount as admin.ServiceAccount) });

const uid = 'REEMPLAZAR_CON_UID_DEL_ADMIN';
admin.auth().setCustomUserClaims(uid, { admin: true })
  .then(() => console.log(`✅ Custom claim { admin: true } asignado a UID: ${uid}`));
```

> **Importante**: El archivo `serviceAccountKey.json` y el script nunca se commitean al repositorio. Agregarlos a `.gitignore`.

### 3.2 Lectura del Claim en el Frontend

El hook `useAuth` verifica el claim después del login:

```typescript
// Lógica interna de useAuth.ts
const tokenResult = await user.getIdTokenResult();
const isAdmin = tokenResult.claims['admin'] === true;
```

El hook expone `{ user, isAdmin, loading }`. **Nunca** se usa el UID hardcodeado en el código de la aplicación para determinar el rol.

### 3.3 Componente `ProtectedRoute`

Componente de React ubicado en `src/components/layout/ProtectedRoute.tsx` que envuelve todas las rutas de `/admin`. Si `loading` es `true` muestra un spinner. Si `isAdmin` es `false`, redirige a `/login` usando `<Navigate replace to="/login" />`.

---

## Sección 4: Tabla de Rutas

| Ruta | Componente de Página | Acceso | Descripción |
|------|---------------------|--------|-------------|
| `/` | `CatalogPage` | Público | Grilla de productos |
| `/carrito` | `CartPage` | Público | Vista del carrito y botón de confirmar orden |
| `/orden/:id` | `OrderConfirmationPage` | Público | Confirmación post-checkout con ID de transacción |
| `/login` | `LoginPage` | Solo no autenticados (redirige a `/admin` si ya hay sesión) | Formulario de login del admin |
| `/admin` | `AdminProductsPage` | Solo admin (JWT) | ABM de catálogo |
| `/admin/compras` | `AdminOrdersPage` | Solo admin (JWT) | Monitor de órdenes |
| `*` | `NotFoundPage` | Público | Página 404 Bauhaus |

---

## Sección 5: Modelos de Datos (Firestore)

### 5.1 Colección `/productos`

```typescript
interface Producto {
  id: string;                          // Auto-generado por Firestore
  nombre: string;                      // Ej: "Compresor Válvulas Fairchild 670"
  descripcionCorta: string;            // Máx. 120 caracteres — para la tarjeta
  descripcionLarga: string;            // Sin límite — para el modal de detalle
  precio: number;                      // Entero positivo, en ARS
  especificaciones: Record<string, string>; // Mapa clave-valor, Ej: { "Válvulas": "2x EL34", "Respuesta": "20Hz-20kHz" }
  imagen: string;                      // URL absoluta (placeholder geométrico SVG/PNG)
  creadoEn: Timestamp;                 // serverTimestamp() al crear
  actualizadoEn: Timestamp;            // serverTimestamp() al crear y actualizar
}
```

**Producto de prueba inicial** (cargado manualmente una sola vez desde Firebase Console o via `products.service.ts` en un script de seeding separado — **nunca automáticamente desde el cliente**):

```json
{
  "nombre": "Compresor de Prueba Bauhaus v1",
  "descripcionCorta": "Compresor estéreo de tubos. Respuesta trasiente precisa.",
  "descripcionLarga": "Unidad de prueba para validar el flujo completo del catálogo. Replica el comportamiento de un compresor de válvulas de alta fidelidad con controles de ataque y release escalonados.",
  "precio": 450000,
  "especificaciones": {
    "Tipo": "VCA / Válvulas",
    "Válvulas": "2× ECC83",
    "Ratio": "2:1 — 20:1",
    "Ataque": "0.1ms — 300ms",
    "Release": "50ms — 2s",
    "Impedancia entrada": "10 kΩ",
    "Respuesta en frecuencia": "20Hz — 20kHz ±0.5dB",
    "Alimentación": "110/220V AC"
  },
  "imagen": "https://placehold.co/600x400/1a1a1a/f3f3f3?text=BAUHAUS+COMP+v1"
}
```

### 5.2 Colección `/compras`

```typescript
interface Compra {
  id: string;               // Auto-generado por Firestore
  transaccionId: string;    // Fase 1: "SIM-" + Date.now() + random 4 chars (Ej: "SIM-1720390000000-A3F7")
  items: Array<{
    productoId: string;     // Referencia al ID del documento en /productos
    nombre: string;         // Snapshot del nombre al momento de comprar
    precio: number;         // Snapshot del precio al momento de comprar
    cantidad: number;
    subtotal: number;       // precio * cantidad
  }>;
  total: number;            // Suma de todos los subtotales
  estado: 'simulado';       // Fase 1: siempre "simulado" | Fase 2: 'pagado' (PayPal)
  creadoEn: Timestamp;      // serverTimestamp()
}
```

> **Nota de snapshot**: Los campos `nombre` y `precio` dentro de `items` son copias del estado del producto al momento de la compra. Esto garantiza que el historial de órdenes sea inmutable aunque el admin edite el producto después.

---

## Sección 6: Reglas de Seguridad de Firestore

El archivo `firestore.rules` en la raíz del proyecto debe contener exactamente lo siguiente:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // PRODUCTOS: lectura pública, escritura solo para admin (JWT claim verificado)
    match /productos/{productoId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null
                                    && request.auth.token.admin == true;
    }

    // COMPRAS: cualquier cliente puede crear una orden (checkout anónimo)
    //          solo el admin puede leer, actualizar o eliminar
    match /compras/{compraId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null
                                  && request.auth.token.admin == true;
    }

    // Denegar todo lo demás por defecto
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## Sección 7: Especificación Funcional

### Actores del Sistema
- **Cliente**: Usuario anónimo que navega el catálogo, gestiona su carrito y confirma órdenes simuladas.
- **Administrador**: Usuario autenticado vía Firebase Auth con JWT Custom Claim `{ admin: true }`, que gestiona el catálogo (CRUD) y audita el historial de órdenes.

---

### Grupo A: Flujo del Cliente

#### US-01: Visualización del Catálogo Bauhaus
- **Como** Cliente, **quiero** ver los equipos disponibles en una grilla limpia, **para** explorar el catálogo.
- **Criterios de Aceptación**:
  - Grilla responsive: 1 columna en mobile, 2 en tablet (`md:`), 3 en desktop (`lg:`).
  - Cada tarjeta muestra: imagen, nombre (`font-sans`), descripción corta, y precio en ARS con formato `$ 450.000` (`font-mono`).
  - **Estado de carga**: Mientras Firestore responde, se muestran 6 skeleton cards con animación `animate-pulse`.
  - **Estado vacío**: Si no hay productos, se muestra un `EmptyState` con mensaje *"El catálogo está vacío. El administrador aún no cargó equipos."*.
  - **Estado de error**: Si Firestore falla, se muestra un `ErrorMessage` con botón de reintentar.
  - El producto de prueba inicial se carga **manualmente** mediante el script de seeding (`npm run seed`). El cliente nunca dispara escrituras en Firestore.

#### US-02: Ficha Técnica Detallada (Modal)
- **Como** Cliente, **quiero** ver las especificaciones completas de un equipo, **para** evaluar el hardware antes de comprar.
- **Criterios de Aceptación**:
  - Al hacer clic en una tarjeta, se abre un **modal overlay** (`ProductModal`) centrado con fondo semitransparente (`bg-black/80`). **No se cambia la URL**. Esta decisión evita la complejidad de rutas dinámicas y mantiene el scope del proyecto.
  - El modal muestra: imagen grande, nombre, descripción larga, y la tabla de especificaciones técnicas (clave-valor, `font-mono`, separadas por bordes de 1px).
  - El modal incluye un botón *"Agregar al carrito"* y un botón *"Cerrar"* (ícono `×`).
  - El modal se cierra también al hacer clic fuera del área del contenido o al presionar `Escape`.

#### US-03: Carrito de Compras Persistente
- **Como** Cliente, **quiero** gestionar mi carrito y ver el total, **para** preparar mi orden.
- **Criterios de Aceptación**:
  - Vista `/carrito` con lista de ítems, controles de cantidad (` − ` / ` + `), botón de eliminar ítem y subtotal por línea.
  - El botón `−` no puede llevar la cantidad por debajo de 1; para eliminar el ítem se usa el botón de eliminar explícito.
  - El total se recalcula de forma reactiva (sin botón de actualizar).
  - El carrito persiste en `localStorage` bajo la clave `kultrumm_cart`. Al montar `useCart`, se inicializa desde `localStorage`. Cada cambio de estado sincroniza `localStorage` via `useEffect`.
  - Si el carrito está vacío, se muestra un `EmptyState` con mensaje *"Tu carrito está vacío"* y un botón *"Ver catálogo"* que navega a `/`.
  - El Header muestra un badge con la cantidad total de unidades en el carrito (suma de `cantidad` de todos los ítems), con color de acento rojo `bg-[#dd3b3b]`.

#### US-04: Checkout Simulado (Fase 1)
- **Como** Cliente, **quiero** confirmar mi orden para registrarla en el sistema, **para** completar mi compra.
- **Criterios de Aceptación**:
  - En la vista `/carrito`, si hay al menos 1 ítem, se muestra el botón *"Confirmar Orden"* con color `bg-[#dd3b3b]`.
  - Al hacer clic en *"Confirmar Orden"*:
    1. El botón se deshabilita y muestra un spinner de carga para evitar doble envío.
    2. Se genera un `transaccionId` único en el cliente: `"SIM-" + Date.now() + "-" + Math.random().toString(36).slice(2,6).toUpperCase()`.
    3. Se escribe el documento de compra en `/compras` de Firestore con el schema definido en §5.2.
    4. Si la escritura en Firestore tiene éxito:
       - Se vacía el carrito (estado y `localStorage`).
       - Se redirige a `/orden/:transaccionId`.
    5. Si la escritura falla, se muestra un `ErrorMessage` inline sin redirigir, y el botón vuelve a habilitarse.
  - La página `/orden/:transaccionId` muestra el mensaje *"Orden registrada"* con el `transaccionId` en `font-mono`, y un botón *"Volver al catálogo"*.

---

### Grupo B: Flujo del Administrador

#### US-05: Autenticación de Administrador con JWT
- **Como** Administrador, **quiero** loguearme con email y contraseña, **para** acceder al panel de gestión.
- **Criterios de Aceptación**:
  - Ruta `/login` con formulario de email y contraseña. Diseño Bauhaus: fondo `#121212`, inputs con borde `border-neutral-800`, botón *"Ingresar"* en `bg-[#dd3b3b]`.
  - El login usa `signInWithEmailAndPassword` de Firebase Auth.
  - Tras el login exitoso, se llama a `user.getIdTokenResult()` para leer el claim `admin`. Si `claims.admin !== true`, se cierra la sesión inmediatamente y se muestra el error *"Acceso denegado: no tiene permisos de administrador."*
  - Si el claim es válido, se redirige a `/admin`.
  - Si las credenciales son incorrectas (error `auth/invalid-credential`), se muestra *"Email o contraseña incorrectos."* en color `text-[#dd3b3b]`.
  - **Estado de carga inicial**: `useAuth` expone `loading: boolean`. Mientras Firebase resuelve la sesión persistida, toda la app muestra un spinner global centrado. Esto previene el flash de redirección al recargar la página.
  - Si el usuario ya tiene sesión activa y visita `/login`, es redirigido a `/admin`.
  - Si el usuario no está autenticado e intenta acceder a `/admin` o `/admin/compras`, `ProtectedRoute` lo redirige a `/login`.

#### US-06: ABM de Catálogo Vintage
- **Como** Administrador, **quiero** crear, editar y eliminar productos, **para** mantener el catálogo actualizado.
- **Criterios de Aceptación**:
  - La vista `/admin` tiene dos secciones: un formulario de creación/edición a la izquierda y la tabla de productos existentes a la derecha (en desktop). En mobile, el formulario está encima de la tabla.
  - **Creación**: El formulario tiene los campos: Nombre, Descripción Corta, Descripción Larga, Precio (número, validado > 0), Especificaciones (campo de texto libre con formato `Clave: Valor`, uno por línea — el servicio lo convierte a `Record<string, string>` al guardar), e Imagen (URL). Todos los campos son obligatorios.
  - El botón *"Guardar Producto"* se deshabilita durante el envío. Si la operación tiene éxito, el formulario se limpia. Si falla, se muestra el error sin limpiar el formulario.
  - **Edición**: Al hacer clic en el ícono de edición de una fila, el formulario se pre-rellena con los datos del producto. El botón cambia a *"Actualizar Producto"*. Hay un botón *"Cancelar"* para volver al modo de creación.
  - **Eliminación**: Al hacer clic en el ícono de eliminar de una fila, se muestra un diálogo de confirmación nativo (`window.confirm("¿Eliminar este producto? Esta acción no se puede deshacer.")`) antes de proceder. Si se confirma, se elimina el documento de Firestore y se actualiza la tabla reactivamente.

#### US-07: Monitor de Órdenes
- **Como** Administrador, **quiero** ver el historial de órdenes registradas, **para** preparar los envíos.
- **Criterios de Aceptación**:
  - Vista `/admin/compras` con tabla Bauhaus (bordes de 1px, fondo alternado `bg-[#1a1a1a]` / `bg-[#121212]`).
  - Las órdenes se cargan usando `onSnapshot()` de Firestore para actualización en tiempo real, ordenadas por `creadoEn` descendente.
  - Por cada orden se muestra: ID de transacción (`font-mono`), fecha y hora formateadas (ej: `07/07/2026 14:32`), resumen de ítems (nombre × cantidad), y total en ARS (`font-mono`).
  - **Estado de carga**: Spinner mientras carga el primer batch.
  - **Estado vacío**: Mensaje *"No hay órdenes registradas aún."*

---

### Requisitos No Funcionales

| ID | Requisito | Detalle |
|----|-----------|---------|
| NFR-01 | Responsividad | Mobile-first con Tailwind. Sin scroll horizontal en ningún breakpoint. |
| NFR-02 | Seguridad Firestore | Reglas explicitadas en §6. Validadas con Firebase Rules Playground antes del deploy. |
| NFR-03 | Seguridad JWT | El rol de admin siempre se verifica desde el token JWT (`getIdTokenResult()`), nunca desde estado local sin validar. |
| NFR-04 | Feedback de UI | Todo botón de acción asíncrona muestra estado de carga (spinner/disabled) y estado de error (mensaje inline). Nunca un formulario queda en estado indeterminado. |
| NFR-05 | Accesibilidad mínima | Todos los inputs tienen `<label>` asociado. Los íconos de acción tienen `aria-label`. Contraste de texto mínimo WCAG AA. |
| NFR-06 | TypeScript estricto | `tsconfig.json` con `"strict": true`. Sin uso de `any` explícito. Todas las interfaces de datos en `src/types/index.ts`. |

---

## Sección 8: CI/CD con GitHub Actions

El archivo `.github/workflows/deploy.yml` se crea en la fase final con la siguiente lógica:

```yaml
name: Build & Deploy to Firebase Hosting
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          channelId: live
```

Todos los valores de `VITE_*` se cargan como **Secrets del repositorio** en GitHub Settings > Secrets. El archivo `.env` local **nunca** llega al pipeline.

---

## Sección 9: Fase 2 — Integraciones Diferidas

> Las siguientes historias están **fuera del scope de Fase 1**. Se implementan únicamente después de que todo lo de §7 esté completo, probado y desplegado.

### F2-US-04: Checkout con PayPal Sandbox

**Reemplaza a US-04 (Checkout Simulado)** cuando se active.

- **Criterios de Aceptación**:
  - Integración exclusiva con el paquete oficial `@paypal/react-paypal-js` en modo Sandbox.
  - El `clientId` de PayPal Sandbox se agrega al `.env` como `VITE_PAYPAL_CLIENT_ID` (es público por naturaleza; el `clientSecret` **nunca** va al frontend).
  - El componente `PayPalButtons` se renderiza en la vista `/carrito`.
  - En `createOrder`: se construye el payload con el total del carrito en USD (convertir desde ARS usando tasa definida en config).
  - En `onApprove`: se llama obligatoriamente a `actions.order.capture()` y se verifica que `captureResult.status === 'COMPLETED'` antes de escribir en Firestore. Si el status no es `COMPLETED`, se muestra error y no se registra la orden.
  - Si el usuario cancela el pop-up de PayPal, no ocurre ninguna acción en Firestore.
  - Al completarse exitosamente: el `transaccionId` en Firestore pasa a ser el ID de la transacción de PayPal (formato `PAYPAL-XXXXXXXX`), el campo `estado` del documento pasa a `'pagado'`, y el flujo continúa igual que en US-04 (vaciar carrito, redirigir a `/orden/:id`).

### F2-NFR: Variables de Entorno adicionales para Fase 2

```env
VITE_PAYPAL_CLIENT_ID=
```
