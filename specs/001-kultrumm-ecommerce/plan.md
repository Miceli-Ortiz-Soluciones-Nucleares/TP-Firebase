# Implementation Plan: Kultrumm E-Commerce

**Branch**: `main` | **Date**: 2026-07-07 | **Spec**: `../../integrated-spec-v2.md`

**Input**: `integrated-spec-v2.md` §§1–9 (Constitution + Functional Spec v3.0)

---

## Summary

E-commerce de equipamiento de audio analógico con estética Bauhaus. Stack: React 18 + TypeScript 5 + Vite 5 + Firebase 10 (Auth + Firestore) + Tailwind CSS 3. Arquitectura MVC estricta. Autenticación por JWT Custom Claims. Checkout simulado en Fase 1. CI/CD con GitHub Actions → Firebase Hosting.

---

## Technical Context

| Campo | Valor |
|-------|-------|
| **Language/Version** | TypeScript 5.x |
| **Framework** | React 18.x + Vite 5.x |
| **Estilos** | Tailwind CSS 3.x + Google Fonts (Space Grotesk + Space Mono) |
| **Routing** | React Router DOM 6.x |
| **BaaS** | Firebase SDK 10.x (Auth + Firestore) |
| **Íconos** | lucide-react (latest) |
| **Target Platform** | Web SPA — Firebase Hosting |
| **Storage** | Firestore (colecciones: `/productos`, `/compras`) |
| **Testing** | Sin pruebas automatizadas en Fase 1 |
| **Project Type** | Web application (SPA frontend-only) |
| **Performance Goals** | First Contentful Paint < 1.5s en conexión 4G |
| **Constraints** | Sin Firebase Functions; sin SSR; sin Firebase Storage |
| **Scale/Scope** | Catálogo pequeño (<100 productos), 1 admin, clientes anónimos |

---

## Constitution Check

> GATE: Verificado contra `constitution.md` y `integrated-spec-v2.md §1`.

| Principio | Estado | Observación |
|-----------|--------|-------------|
| I. Spec-First | ✅ | Todo lo planificado aquí existe en el spec |
| II. MVC en React | ✅ | Layers `components/` / `hooks/` / `services/` sin cruce |
| III. JWT Custom Claims | ✅ | `useAuth` lee `getIdTokenResult()`; Firestore valida el claim |
| IV. Sin Firebase Functions | ✅ | Toda la lógica en cliente + reglas de Firestore |
| V. Bauhaus Design System | ✅ | Paleta, tipografías y grilla especificadas en cada componente |
| VI. Phase-Gated Delivery | ✅ | PayPal aislado en §9 del spec; no entra en Fase 1 |

**Violations**: Ninguna.

---

## Project Structure

### Documentación de esta feature

```
specs/001-kultrumm-ecommerce/
├── plan.md          ← este archivo
└── tasks.md         ← siguiente paso (speckit.tasks)
```

### Estructura de directorios del código fuente

```
kultrumm-shop/                        ← raíz del proyecto Vite
├── .env                              ← variables locales (no commitear)
├── .env.example                      ← plantilla pública (commitear)
├── .gitignore
├── index.html                        ← carga Space Grotesk + Space Mono via Google Fonts
├── vite.config.ts
├── tsconfig.json                     ← strict: true
├── tailwind.config.ts
├── postcss.config.js
├── firestore.rules                   ← reglas de seguridad (deployar junto al hosting)
├── firebase.json                     ← configuración de Firebase Hosting
├── .firebaserc
├── scripts/
│   └── set-admin-claim.ts            ← script ONE-TIME para asignar Custom Claim
├── public/
│   └── favicon.svg
└── src/
    ├── main.tsx                      ← ReactDOM.createRoot + PayPalScriptProvider (deshabilitado Fase 1)
    ├── App.tsx                       ← RouterProvider
    ├── router/
    │   └── index.tsx                 ← definición completa de rutas
    ├── types/
    │   └── index.ts                  ← interfaces Producto, Compra, CartItem, AuthState
    ├── services/
    │   ├── firebase.ts               ← initializeApp, getAuth, getFirestore
    │   ├── auth.service.ts           ← signIn, signOut, onAuthStateChanged
    │   ├── products.service.ts       ← getProducts, getProductById, createProduct, updateProduct, deleteProduct
    │   └── orders.service.ts         ← createOrder, subscribeToOrders
    ├── hooks/
    │   ├── useAuth.ts                ← { user, isAdmin, loading }
    │   ├── useProducts.ts            ← { products, loading, error, createProduct, updateProduct, deleteProduct }
    │   ├── useCart.ts                ← { items, total, addItem, removeItem, updateQty, clearCart }
    │   └── useOrders.ts             ← { orders, loading, error }
    └── components/
        ├── layout/
        │   ├── Header.tsx            ← nav + badge carrito
        │   ├── Footer.tsx
        │   └── ProtectedRoute.tsx    ← guard JWT para rutas /admin
        ├── ui/
        │   ├── LoadingSpinner.tsx
        │   ├── ErrorMessage.tsx
        │   └── EmptyState.tsx
        ├── catalog/
        │   ├── CatalogPage.tsx       ← página /
        │   ├── CatalogGrid.tsx       ← grilla responsive
        │   ├── ProductCard.tsx       ← tarjeta individual
        │   └── ProductModal.tsx      ← modal de ficha técnica (overlay)
        ├── cart/
        │   ├── CartPage.tsx          ← página /carrito
        │   ├── CartItem.tsx
        │   └── CartSummary.tsx       ← total + botón "Confirmar Orden"
        ├── checkout/
        │   └── OrderConfirmationPage.tsx  ← página /orden/:id
        └── admin/
            ├── LoginPage.tsx         ← página /login
            ├── AdminProductsPage.tsx ← página /admin
            ├── ProductForm.tsx       ← formulario crear/editar
            ├── ProductTable.tsx      ← tabla de productos existentes
            ├── AdminOrdersPage.tsx   ← página /admin/compras
            └── OrdersTable.tsx       ← tabla con onSnapshot
```

---

## Interfaces TypeScript (`src/types/index.ts`)

```typescript
import { Timestamp } from 'firebase/firestore';

export interface Producto {
  id: string;
  nombre: string;
  descripcionCorta: string;
  descripcionLarga: string;
  precio: number;                          // entero, ARS
  especificaciones: Record<string, string>;
  imagen: string;
  creadoEn: Timestamp;
  actualizadoEn: Timestamp;
}

export interface CartItem {
  productoId: string;
  nombre: string;
  precio: number;
  imagen: string;
  cantidad: number;
}

export interface CompraItem {
  productoId: string;
  nombre: string;
  precio: number;
  cantidad: number;
  subtotal: number;
}

export interface Compra {
  id: string;
  transaccionId: string;           // "SIM-{timestamp}-{random}" en Fase 1
  items: CompraItem[];
  total: number;
  estado: 'simulado';              // Fase 2 agrega 'pagado'
  creadoEn: Timestamp;
}

export interface AuthState {
  user: import('firebase/auth').User | null;
  isAdmin: boolean;
  loading: boolean;
}
```

---

## Flujos Lógicos

### FL-01: Carga del catálogo

```
CatalogPage
  └── useProducts()
        └── products.service.ts → Firestore.getDocs('/productos')
              ├── loading=true  → <CatalogGrid skeleton (6 cards animate-pulse)>
              ├── error         → <ErrorMessage + botón reintentar>
              └── success       → <CatalogGrid> con array de <ProductCard>
```

### FL-02: Modal de ficha técnica

```
ProductCard [onClick]
  └── CatalogPage.setSelectedProduct(producto)
        └── ProductModal (portal/overlay bg-black/80)
              ├── Muestra: imagen, nombre, descripcionLarga, tabla especificaciones
              ├── Botón "Agregar al carrito" → useCart.addItem(producto)
              └── Botón "Cerrar" / clic fuera / Escape → setSelectedProduct(null)
```

### FL-03: Gestión del carrito

```
useCart (estado React + sincronización localStorage)
  ├── init: useState(() => JSON.parse(localStorage.getItem('kultrumm_cart') ?? '[]'))
  ├── useEffect([items]): localStorage.setItem('kultrumm_cart', JSON.stringify(items))
  ├── addItem(producto): si existe → cantidad+1, si no → push nuevo CartItem
  ├── updateQty(productoId, delta): cantidad mínima = 1
  ├── removeItem(productoId): filter out
  ├── clearCart(): setItems([])
  └── total: useMemo → items.reduce((acc, i) => acc + i.precio * i.cantidad, 0)
```

### FL-04: Checkout simulado

```
CartPage → CartSummary
  └── Botón "Confirmar Orden" [onClick]
        ├── setSubmitting(true) → botón disabled + spinner
        ├── transaccionId = "SIM-" + Date.now() + "-" + Math.random().toString(36).slice(2,6).toUpperCase()
        ├── orders.service.createOrder({ transaccionId, items, total, estado: 'simulado' })
        │     └── Firestore.addDoc('/compras', { ...payload, creadoEn: serverTimestamp() })
        ├── onSuccess:
        │     ├── useCart.clearCart()
        │     └── navigate('/orden/' + transaccionId)
        └── onError:
              ├── setSubmitting(false)
              └── setError("No se pudo registrar la orden. Intentá de nuevo.")
```

### FL-05: Autenticación JWT

```
LoginPage
  └── auth.service.signIn(email, password)
        └── Firebase signInWithEmailAndPassword()
              ├── onError (auth/invalid-credential)
              │     └── setError("Email o contraseña incorrectos.")
              └── onSuccess
                    └── user.getIdTokenResult()
                          ├── claims.admin !== true
                          │     ├── auth.service.signOut()
                          │     └── setError("Acceso denegado: no tiene permisos de administrador.")
                          └── claims.admin === true
                                └── navigate('/admin')

useAuth (contexto global)
  ├── onAuthStateChanged listener (en mount, cleanup en unmount)
  ├── loading=true hasta que Firebase resuelve la sesión persistida
  ├── Al resolver: getIdTokenResult() → isAdmin = claims.admin === true
  └── Expone: { user, isAdmin, loading }

ProtectedRoute
  ├── loading=true → <LoadingSpinner fullscreen>
  ├── !isAdmin     → <Navigate replace to="/login">
  └── isAdmin      → <Outlet> (renderiza la ruta hija)
```

### FL-06: ABM de productos (admin)

```
AdminProductsPage
  ├── useProducts() → { products, loading, error, createProduct, updateProduct, deleteProduct }
  ├── ProductForm (modo create | modo edit)
  │     ├── Campo "especificaciones": textarea con formato "Clave: Valor\n..."
  │     │     └── Al guardar: parseSpecsText(text) → Record<string,string>
  │     ├── Botón "Guardar/Actualizar" → disabled durante submit
  │     └── onSuccess → resetForm() | onError → mostrar error inline sin limpiar
  └── ProductTable
        ├── Ícono editar → AdminProductsPage.setEditingProduct(producto) → precarga ProductForm
        └── Ícono eliminar → window.confirm("¿Eliminar?") → deleteProduct(id)
```

### FL-07: Monitor de órdenes (admin)

```
AdminOrdersPage
  └── useOrders()
        └── orders.service.subscribeToOrders()
              └── Firestore.onSnapshot('/compras', orderBy('creadoEn', 'desc'))
                    ├── loading=true hasta primer snapshot
                    ├── empty → <EmptyState "No hay órdenes registradas aún.">
                    └── success → <OrdersTable rows=orders>
```

---

## Tabla de Rutas (`src/router/index.tsx`)

| Ruta | Componente de Página | Guard | Redirección si falla guard |
|------|---------------------|-------|---------------------------|
| `/` | `CatalogPage` | — | — |
| `/carrito` | `CartPage` | — | — |
| `/orden/:id` | `OrderConfirmationPage` | — | — |
| `/login` | `LoginPage` | Solo no-autenticados | `/admin` si ya hay sesión |
| `/admin` | `AdminProductsPage` | `ProtectedRoute` (isAdmin) | `/login` |
| `/admin/compras` | `AdminOrdersPage` | `ProtectedRoute` (isAdmin) | `/login` |
| `*` | `NotFoundPage` | — | — |

**Implementación del router:**

```tsx
// src/router/index.tsx
<RouterProvider router={createBrowserRouter([
  {
    path: '/',
    element: <Header />,          // layout raíz con Outlet
    children: [
      { index: true,              element: <CatalogPage /> },
      { path: 'carrito',          element: <CartPage /> },
      { path: 'orden/:id',        element: <OrderConfirmationPage /> },
      { path: 'login',            element: <LoginPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'admin',          element: <AdminProductsPage /> },
          { path: 'admin/compras',  element: <AdminOrdersPage /> },
        ]
      },
      { path: '*',                element: <NotFoundPage /> },
    ]
  }
])} />
```

---

## Reglas de Firestore (`firestore.rules`)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /productos/{productoId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null
                                    && request.auth.token.admin == true;
    }

    match /compras/{compraId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null
                                  && request.auth.token.admin == true;
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## Variables de Entorno

**`.env.example`** (commitear):
```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

**`.env`** (NO commitear — agregar a `.gitignore`): mismo formato con valores reales.

---

## Estrategia de CI/CD (`​.github/workflows/deploy.yml`)

**Trigger**: `push` a rama `main`.
**Condición previa**: todos los secrets de Firebase cargados en GitHub Settings → Secrets.

```yaml
name: Build & Deploy to Firebase Hosting
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: kultrumm-shop

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: kultrumm-shop/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}

      - name: Deploy to Firebase Hosting
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          channelId: live
          projectId: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          entryPoint: kultrumm-shop
```

**Secrets requeridos en GitHub**:

| Secret | Origen |
|--------|--------|
| `VITE_FIREBASE_API_KEY` | Firebase Console → Configuración del proyecto |
| `VITE_FIREBASE_AUTH_DOMAIN` | ídem |
| `VITE_FIREBASE_PROJECT_ID` | ídem |
| `VITE_FIREBASE_STORAGE_BUCKET` | ídem |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | ídem |
| `VITE_FIREBASE_APP_ID` | ídem |
| `FIREBASE_SERVICE_ACCOUNT` | Firebase Console → Service Accounts → Generate key (JSON completo) |

---

## Orden de Implementación (Fases)

Las tareas atómicas se generan en `tasks.md` (paso siguiente). El orden lógico es:

```
FASE 0 — Scaffolding
  0.1  npm create vite kultrumm-shop -- --template react-ts
  0.2  Instalar dependencias (firebase, react-router-dom, lucide-react, tailwindcss)
  0.3  Configurar tailwind.config.ts + index.html (Google Fonts)
  0.4  Crear .env y .env.example
  0.5  Crear src/types/index.ts

FASE 1 — Capa de Servicios (Modelo)
  1.1  src/services/firebase.ts
  1.2  src/services/auth.service.ts
  1.3  src/services/products.service.ts
  1.4  src/services/orders.service.ts

FASE 2 — Hooks (Controladores)
  2.1  src/hooks/useAuth.ts + AuthContext
  2.2  src/hooks/useProducts.ts
  2.3  src/hooks/useCart.ts (con localStorage)
  2.4  src/hooks/useOrders.ts

FASE 3 — Componentes UI base + Layout
  3.1  LoadingSpinner, ErrorMessage, EmptyState
  3.2  Header (con badge carrito), Footer
  3.3  ProtectedRoute
  3.4  src/router/index.tsx

FASE 4 — Flujo del Cliente
  4.1  ProductCard + CatalogGrid + CatalogPage (US-01)
  4.2  ProductModal (US-02)
  4.3  CartItem + CartSummary + CartPage (US-03)
  4.4  OrderConfirmationPage + lógica checkout simulado (US-04)

FASE 5 — Flujo del Administrador
  5.1  LoginPage (US-05)
  5.2  ProductForm + ProductTable + AdminProductsPage (US-06)
  5.3  OrdersTable + AdminOrdersPage (US-07)

FASE 6 — Configuración Firebase + Reglas
  6.1  firestore.rules
  6.2  firebase.json + .firebaserc
  6.3  scripts/set-admin-claim.ts

FASE 7 — CI/CD
  7.1  .github/workflows/deploy.yml
  7.2  Cargar Secrets en GitHub
  7.3  Push y verificación del pipeline
```

---

## Complexity Tracking

> Sin violaciones de constitución. No aplica.

---

## Trazabilidad

| Plan Item | User Story | Sección del Spec |
|-----------|-----------|-----------------|
| FL-01 Catálogo | US-01 | §7 Grupo A |
| FL-02 Modal | US-02 | §7 Grupo A |
| FL-03 Carrito | US-03 | §7 Grupo A |
| FL-04 Checkout simulado | US-04 | §7 Grupo A |
| FL-05 Auth JWT | US-05 | §7 Grupo B |
| FL-06 ABM Productos | US-06 | §7 Grupo B |
| FL-07 Monitor Órdenes | US-07 | §7 Grupo B |
| Reglas Firestore | NFR-02, NFR-03 | §6 + §7 NFR |
| CI/CD pipeline | Principio 5 | §1 + §8 |
| TypeScript strict | NFR-06 | §7 NFR |
