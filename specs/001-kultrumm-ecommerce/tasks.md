# Tasks: Kultrumm E-Commerce — Fase 1

**Input**: `plan.md` + `../../integrated-spec-v2.md` (v3.0)
**Sin tests automatizados en Fase 1** (no solicitados en el spec).
**Convención de IDs**: `T001`–`T999` | `[P]` = ejecutable en paralelo con otras tareas del mismo bloque | `[USxx]` = trazabilidad a User Story.

---

## Leyenda de dependencias

```
Fase 0 (Scaffolding)
  └── Fase 1 (Fundación MVC — BLOQUEANTE)
        └── Fases 2–6 (User Stories — pueden correr en paralelo entre sí una vez que Fase 1 esté completa)
              └── Fase 7 (Firebase config + Reglas)
                    └── Fase 8 (CI/CD)
```

---

## Fase 0 — Scaffolding del Proyecto

**Propósito**: Crear la estructura base del proyecto. Sin esto no puede iniciarse ninguna otra tarea.

- [x] **T001** Ejecutar `npm create vite@latest kultrumm-shop -- --template react-ts` en la raíz del repositorio. Verificar que se genere la carpeta `kultrumm-shop/` con `vite.config.ts` y `tsconfig.json`.

- [x] **T002** Instalar todas las dependencias de producción: `npm install firebase react-router-dom lucide-react`. Verificar que aparezcan en `kultrumm-shop/package.json > dependencies`.

- [x] **T003** `[P]` Instalar y configurar Tailwind CSS: `npm install -D tailwindcss postcss autoprefixer && npx tailwindcss init -p`. Editar `kultrumm-shop/tailwind.config.ts` para incluir el path `./src/**/*.{ts,tsx}`. Agregar las directivas `@tailwind` a `kultrumm-shop/src/index.css`.

- [x] **T004** `[P]` Configurar `kultrumm-shop/tsconfig.json` con `"strict": true`, `"baseUrl": "."` y `"paths": { "@/*": ["src/*"] }`.

- [x] **T005** `[P]` Editar `kultrumm-shop/index.html`: agregar `<title>Kultrumm</title>` y el `<link>` de Google Fonts para `Space Grotesk` (pesos 400, 500, 700) y `Space Mono` (peso 400, 700).

- [x] **T006** `[P]` Configurar `kultrumm-shop/tailwind.config.ts` para registrar las familias tipográficas: `fontFamily: { sans: ['Space Grotesk', 'sans-serif'], mono: ['Space Mono', 'monospace'] }` y el color de fondo por defecto `backgroundColor: { DEFAULT: '#121212' }`.

- [x] **T007** `[P]` Crear `kultrumm-shop/.env.example` con las 6 variables `VITE_FIREBASE_*` vacías. Verificar que `kultrumm-shop/.env` esté en `.gitignore`.

- [x] **T008** `[P]` Limpiar el boilerplate de Vite: vaciar `kultrumm-shop/src/App.tsx` (dejar solo el shell del componente), eliminar `kultrumm-shop/src/App.css` y el contenido de `kultrumm-shop/src/index.css` salvo las directivas de Tailwind.

**Checkpoint Fase 0**: `npm run dev` levanta la app en `localhost:5173` sin errores de consola y con fondo `#121212` visible.

---

## Fase 1 — Fundación MVC (BLOQUEANTE)

**Propósito**: Capas de Modelo, Controlador y estructura de rutas. **Ninguna User Story puede implementarse hasta completar esta fase.**

> ⚠️ Las tareas T009–T014 pueden ejecutarse en paralelo entre sí. T015–T019 dependen de que T009 esté completa.

### 1A — Tipos e interfaces

- [ ] **T009** `[P]` Crear `kultrumm-shop/src/types/index.ts` con las interfaces `Producto`, `CartItem`, `CompraItem`, `Compra` y `AuthState` exactamente como están definidas en `plan.md § Interfaces TypeScript`.

### 1B — Capa de Servicios (Modelo)

- [ ] **T010** `[P]` Crear `kultrumm-shop/src/services/firebase.ts`: llamar a `initializeApp(firebaseConfig)`, exportar las instancias `auth` (`getAuth`) y `db` (`getFirestore`). Leer configuración desde `import.meta.env.VITE_FIREBASE_*`.

- [ ] **T011** `[P]` Crear `kultrumm-shop/src/services/auth.service.ts`: exportar las funciones `signIn(email, password)` (usa `signInWithEmailAndPassword`), `signOut()` (usa `signOut` de Firebase) y `onAuthChange(callback)` (usa `onAuthStateChanged`). Sin estado interno.

- [ ] **T012** `[P]` Crear `kultrumm-shop/src/services/products.service.ts`: exportar `getProducts()` (getDocs `/productos`, ordenado por `creadoEn` asc), `createProduct(data)` (addDoc + `serverTimestamp()`), `updateProduct(id, data)` (updateDoc + `serverTimestamp()`), `deleteProduct(id)` (deleteDoc). Importar tipos desde `@/types`.

- [ ] **T013** `[P]` Crear `kultrumm-shop/src/services/orders.service.ts`: exportar `createOrder(payload)` (addDoc en `/compras` con `serverTimestamp()`) y `subscribeToOrders(callback)` (onSnapshot `/compras` orderBy `creadoEn` desc — devuelve la función unsubscribe). Importar tipos desde `@/types`.

### 1C — Capa de Hooks (Controladores)

- [ ] **T014** Crear `kultrumm-shop/src/hooks/useAuth.ts` y el `AuthContext` global:
  - Contexto con valor `AuthState` (`user`, `isAdmin`, `loading`).
  - `useEffect` que llama a `auth.service.onAuthChange`: al resolver, llama a `user.getIdTokenResult()` y setea `isAdmin = claims.admin === true`.
  - `loading = true` hasta que Firebase emita el primer evento de `onAuthStateChanged`.
  - Exportar `AuthProvider` (envuelve la app en `main.tsx`) y `useAuth` hook de consumo.

- [ ] **T015** Crear `kultrumm-shop/src/hooks/useProducts.ts` (depende de T009, T012):
  - Estado: `products: Producto[]`, `loading: boolean`, `error: string | null`.
  - `useEffect` que llama a `products.service.getProducts()` al montar.
  - Exponer también `createProduct`, `updateProduct`, `deleteProduct` que llaman al servicio y refrescan el estado local.

- [ ] **T016** Crear `kultrumm-shop/src/hooks/useCart.ts` (depende de T009):
  - Inicializar estado desde `localStorage.getItem('kultrumm_cart')`.
  - `useEffect([items])` para sincronizar con `localStorage` en cada cambio.
  - Exponer: `items`, `total` (useMemo), `addItem(producto)`, `updateQty(productoId, delta)` (mínimo 1), `removeItem(productoId)`, `clearCart()`.
  - Exportar también `CartContext` y `CartProvider`.

- [ ] **T017** Crear `kultrumm-shop/src/hooks/useOrders.ts` (depende de T009, T013):
  - Estado: `orders: Compra[]`, `loading: boolean`, `error: string | null`.
  - `useEffect` que llama a `orders.service.subscribeToOrders()` y limpia el listener al desmontar.

### 1D — Componentes UI base

- [ ] **T018** `[P]` Crear `kultrumm-shop/src/components/ui/LoadingSpinner.tsx`: spinner SVG animado centrado, color `#f3f3f3`. Acepta prop `fullscreen?: boolean` para ocupar todo el viewport.

- [ ] **T019** `[P]` Crear `kultrumm-shop/src/components/ui/ErrorMessage.tsx`: muestra mensaje en `text-[#dd3b3b]` con ícono `AlertCircle` de lucide-react. Acepta props `message: string` y `onRetry?: () => void` (muestra botón "Reintentar" si se provee).

- [ ] **T020** `[P]` Crear `kultrumm-shop/src/components/ui/EmptyState.tsx`: mensaje centrado en `text-[#8a8a8a]` con ícono opcional. Acepta props `message: string`, `icon?: ReactNode` y `action?: { label: string; onClick: () => void }`.

### 1E — Layout y Router

- [ ] **T021** Crear `kultrumm-shop/src/components/layout/Header.tsx` (depende de T016):
  - Logo "KULTRUMM" en `font-mono tracking-tight`.
  - Navegación con links a `/` y `/carrito`.
  - Badge de cantidad total del carrito sobre el ícono `ShoppingCart` de lucide-react; color `bg-[#dd3b3b]`; se oculta si cantidad es 0.
  - Borde inferior `border-b border-neutral-800`.

- [ ] **T022** `[P]` Crear `kultrumm-shop/src/components/layout/Footer.tsx`: texto "KULTRUMM © 2026" en `font-mono text-[#8a8a8a]`. Borde superior `border-t border-neutral-800`.

- [ ] **T023** Crear `kultrumm-shop/src/components/layout/ProtectedRoute.tsx` (depende de T014):
  - Si `loading === true` → renderizar `<LoadingSpinner fullscreen />`.
  - Si `isAdmin === false` → `<Navigate replace to="/login" />`.
  - Si `isAdmin === true` → `<Outlet />`.

- [ ] **T024** Crear `kultrumm-shop/src/router/index.tsx` (depende de T023): definir el `createBrowserRouter` con la tabla de rutas completa del `plan.md § Tabla de Rutas`. Los componentes de página se importan con `React.lazy` para code splitting. Exportar `<RouterProvider>`.

- [ ] **T025** Editar `kultrumm-shop/src/main.tsx`: envolver la app en `<AuthProvider>` y `<CartProvider>`. Renderizar `<RouterProvider>`. Agregar `<React.StrictMode>`.

- [ ] **T026** `[P]` Crear `kultrumm-shop/src/components/catalog/CatalogPage.tsx` vacío (shell), `kultrumm-shop/src/components/cart/CartPage.tsx` vacío, `kultrumm-shop/src/components/checkout/OrderConfirmationPage.tsx` vacío, `kultrumm-shop/src/components/admin/LoginPage.tsx` vacío, `kultrumm-shop/src/components/admin/AdminProductsPage.tsx` vacío, `kultrumm-shop/src/components/admin/AdminOrdersPage.tsx` vacío, `kultrumm-shop/src/components/ui/NotFoundPage.tsx` vacío. Solo retornan un `<div>` con el nombre de la página para que el router compile sin errores.

**Checkpoint Fase 1**: La app navega entre todas las rutas sin errores de TypeScript. `/admin` redirige a `/login` cuando no hay sesión. `useAuth` resuelve `loading=false` al iniciar.

---

## Fase 2 — US-01: Visualización del Catálogo Bauhaus

**User Story**: US-01 | **Prioridad**: P1 — MVP
**Goal**: Cliente puede ver la grilla de productos con skeleton loader, estado vacío y estado de error.
**Test manual**: Abrir `/`, ver 6 skeletons, luego la grilla de productos. Desconectar red y ver ErrorMessage.

- [ ] **T027** `[US-01]` Implementar `kultrumm-shop/src/components/catalog/ProductCard.tsx` (depende de T009):
  - Props: `producto: Producto`, `onClick: () => void`.
  - Layout: imagen arriba (aspect-ratio 16/9, `object-cover`), nombre en `font-sans font-medium`, descripción corta en `text-[#8a8a8a] text-sm`, precio en `font-mono` con formato `$ X.XXX` (separador de miles con punto).
  - Borde `border border-neutral-800`, fondo `bg-[#1a1a1a]`, hover `border-neutral-600` con transición.

- [ ] **T028** `[P]` `[US-01]` Implementar `kultrumm-shop/src/components/catalog/CatalogGrid.tsx`:
  - Props: `products: Producto[]`, `onSelectProduct: (p: Producto) => void`.
  - Grilla: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-neutral-800` (efecto grilla Bauhaus con gap como borde).
  - Renderiza un `<ProductCard>` por cada producto.

- [ ] **T029** `[P]` `[US-01]` Crear componente de skeleton `kultrumm-shop/src/components/catalog/ProductCardSkeleton.tsx`: mismas dimensiones que `ProductCard` pero con `div`s en `bg-neutral-800 animate-pulse`. Renderizar 6 en la grilla mientras `loading=true`.

- [ ] **T030** `[US-01]` Implementar la página `kultrumm-shop/src/components/catalog/CatalogPage.tsx` (depende de T015, T027, T028, T029):
  - Consume `useProducts()`.
  - Si `loading` → `<CatalogGrid>` con 6 `<ProductCardSkeleton>`.
  - Si `error` → `<ErrorMessage message={error} onRetry={refetch}>`.
  - Si `products.length === 0` → `<EmptyState message="El catálogo está vacío...">`.
  - Si hay productos → `<CatalogGrid products={products} onSelectProduct={setSelected}>`.
  - Estado local `selectedProduct: Producto | null` para controlar el modal (implementado en Fase 3).

**Checkpoint US-01**: La grilla muestra productos reales de Firestore. Los skeletons aparecen mientras carga. El estado vacío se muestra si no hay documentos.

---

## Fase 3 — US-02: Ficha Técnica Detallada (Modal)

**User Story**: US-02 | **Prioridad**: P1
**Goal**: Al hacer clic en una tarjeta, se abre un modal con la ficha técnica completa.
**Test manual**: Hacer clic en un producto → modal aparece → tabla de especificaciones visible → cerrar con ×, clic fuera y tecla Escape.

- [ ] **T031** `[US-02]` Implementar `kultrumm-shop/src/components/catalog/ProductModal.tsx` (depende de T009, T016):
  - Props: `producto: Producto`, `onClose: () => void`.
  - Overlay `fixed inset-0 bg-black/80 z-50 flex items-center justify-center`.
  - Contenido: panel `max-w-2xl w-full bg-[#1a1a1a] border border-neutral-800`.
  - Imagen, nombre (`font-sans`), descripción larga, tabla de especificaciones (iterar `Object.entries(especificaciones)` → filas `clave | valor` con `font-mono`, separadas por `border-b border-neutral-800`).
  - Botón "Agregar al carrito" (`bg-[#dd3b3b]`) → llama a `useCart().addItem(producto)` y luego `onClose()`.
  - Botón "Cerrar" (ícono `X` de lucide-react) y listener `keydown` para `Escape`.
  - Clic en el overlay (fuera del panel) también dispara `onClose`.
  - Usar `ReactDOM.createPortal` para renderizar fuera del árbol DOM principal.

- [ ] **T032** `[US-02]` Conectar `ProductModal` en `CatalogPage.tsx`: renderizar `{selectedProduct && <ProductModal producto={selectedProduct} onClose={() => setSelected(null)} />}`.

**Checkpoint US-02**: Clic en tarjeta → modal con todos los campos. "Agregar al carrito" suma el ítem y cierra el modal. Badge del header se actualiza.

---

## Fase 4 — US-03: Carrito de Compras Persistente

**User Story**: US-03 | **Prioridad**: P1 — MVP
**Goal**: El cliente gestiona cantidades, ve el total y el carrito persiste tras recargar.
**Test manual**: Agregar producto → ir a `/carrito` → cambiar cantidad → recargar página → ítem sigue ahí → eliminar ítem.

- [ ] **T033** `[US-03]` Implementar `kultrumm-shop/src/components/cart/CartItem.tsx` (depende de T009, T016):
  - Props: `item: CartItem`.
  - Muestra: imagen pequeña, nombre, precio unitario (`font-mono`), controles `−` y `+` que llaman a `useCart().updateQty`, subtotal (`font-mono`), botón eliminar (ícono `Trash2` lucide).
  - El botón `−` está deshabilitado si `cantidad === 1`.

- [ ] **T034** `[P]` `[US-03]` Implementar `kultrumm-shop/src/components/cart/CartSummary.tsx` (depende de T016):
  - Muestra el total en `font-mono` grande.
  - Botón "Confirmar Orden" `bg-[#dd3b3b]`: recibe `onConfirm: () => void`, `isSubmitting: boolean`. Si `isSubmitting` → muestra `<LoadingSpinner>` inline y `disabled`.

- [ ] **T035** `[US-03]` Implementar la página `kultrumm-shop/src/components/cart/CartPage.tsx` (depende de T033, T034, T016, T017):
  - Consume `useCart()`.
  - Si `items.length === 0` → `<EmptyState message="Tu carrito está vacío" action={{ label: "Ver catálogo", onClick: () => navigate('/') }}>`.
  - Si hay ítems → lista de `<CartItem>` + `<CartSummary>`.
  - Estado local `submitting` y `submitError`. La lógica del checkout simulado se conecta en Fase 5.

**Checkpoint US-03**: El carrito muestra ítems, permite modificar cantidades, calcula el total reactivamente. Al recargar la página los datos persisten.

---

## Fase 5 — US-04: Checkout Simulado

**User Story**: US-04 | **Prioridad**: P1 — MVP
**Goal**: "Confirmar Orden" escribe en Firestore, vacía el carrito y redirige a la confirmación.
**Test manual**: Carrito con ítems → "Confirmar Orden" → aparece spinner → se redirige a `/orden/SIM-...` → documento creado en Firestore `/compras`.

- [ ] **T036** `[US-04]` Conectar la lógica de checkout en `CartPage.tsx` (depende de T034, T035, T013, T016):
  - Función `handleConfirm`:
    1. `setSubmitting(true)`.
    2. Generar `transaccionId = "SIM-" + Date.now() + "-" + Math.random().toString(36).slice(2,6).toUpperCase()`.
    3. Construir payload `Compra` (mapear `items` a `CompraItem[]` con subtotales, calcular `total`).
    4. Llamar a `orders.service.createOrder(payload)`.
    5. `onSuccess`: `clearCart()` → `navigate('/orden/' + transaccionId)`.
    6. `onError`: `setSubmitting(false)` → `setSubmitError("No se pudo registrar la orden. Intentá de nuevo.")`.
  - Pasar `handleConfirm` y `submitting` a `<CartSummary>`.

- [ ] **T037** `[US-04]` Implementar `kultrumm-shop/src/components/checkout/OrderConfirmationPage.tsx`:
  - Leer `transaccionId` desde `useParams()`.
  - Mostrar mensaje "Orden registrada" con el `transaccionId` en `font-mono text-[#ff9d00]`.
  - Botón "Volver al catálogo" → `navigate('/')`.
  - Diseño Bauhaus: borde `border border-neutral-800`, panel centrado.

**Checkpoint US-04**: Flujo completo funciona de punta a punta. El documento aparece en la consola de Firestore.

---

## Fase 6 — Flujo del Administrador

> Las tareas T038–T049 dependen de que Fase 1 esté completa. US-05, US-06 y US-07 pueden implementarse en paralelo entre sí una vez que T038 esté lista.

### US-05: Autenticación JWT (prerequisito de US-06 y US-07)

**User Story**: US-05 | **Prioridad**: P1
**Test manual**: Login con credenciales correctas → redirige a `/admin`. Login con cuenta sin claim → mensaje "Acceso denegado". Recargar `/admin` → sigue autenticado sin redirigir.

- [ ] **T038** `[US-05]` Implementar `kultrumm-shop/src/components/admin/LoginPage.tsx` (depende de T011, T014):
  - Formulario con inputs `email` y `password` (label asociado, `border-neutral-800`).
  - Estado local: `loading`, `error`.
  - `handleSubmit`:
    1. `signIn(email, password)`.
    2. Si `auth/invalid-credential` → `setError("Email o contraseña incorrectos.")`.
    3. Si login exitoso → `getIdTokenResult()`.
    4. Si `claims.admin !== true` → `signOut()` + `setError("Acceso denegado: no tiene permisos de administrador.")`.
    5. Si `claims.admin === true` → `navigate('/admin')`.
  - Si el usuario ya tiene sesión (`isAdmin=true`), redirigir a `/admin` con `<Navigate>`.
  - Error mostrado en `text-[#dd3b3b]`.

- [ ] **T039** `[P]` `[US-05]` Crear `kultrumm-shop/scripts/set-admin-claim.ts`: script Node.js con `firebase-admin` que asigna `{ admin: true }` al UID recibido como argumento. Documentado con instrucciones de uso en comentarios. Agregar al `.gitignore`: `scripts/serviceAccountKey.json`.

### US-06: ABM de Catálogo

**User Story**: US-06 | **Prioridad**: P2
**Test manual**: Crear producto → aparece en la tabla. Editar → formulario pre-rellena. Eliminar → `window.confirm` → desaparece. Intentar guardar con precio 0 → error de validación.

- [ ] **T040** `[US-06]` Implementar `kultrumm-shop/src/components/admin/ProductForm.tsx` (depende de T009):
  - Props: `initialData?: Producto`, `onSubmit: (data: Omit<Producto, 'id'|'creadoEn'|'actualizadoEn'>) => Promise<void>`, `onCancel?: () => void`.
  - Campos: Nombre, Descripción Corta, Descripción Larga, Precio (type="number", validar > 0), Especificaciones (textarea, formato `Clave: Valor` por línea), Imagen (URL).
  - Función `parseSpecsText(text: string): Record<string, string>` (split `\n`, split `: `, construir objeto).
  - Botón "Guardar/Actualizar" con estado `submitting` (disabled + spinner). Si error → mostrarlo inline sin limpiar el formulario.
  - Si `initialData` provisto → modo edición, botón "Cancelar" visible.

- [ ] **T041** `[P]` `[US-06]` Implementar `kultrumm-shop/src/components/admin/ProductTable.tsx` (depende de T009):
  - Props: `products: Producto[]`, `onEdit: (p: Producto) => void`, `onDelete: (id: string) => void`.
  - Tabla con columnas: Nombre, Precio (`font-mono`), Imagen (thumbnail 40×40), Acciones (íconos `Pencil` y `Trash2` de lucide-react).
  - Filas con fondo alternado `bg-[#1a1a1a]` / `bg-[#121212]`.
  - `onDelete` llama a `window.confirm("¿Eliminar este producto? Esta acción no se puede deshacer.")` antes de propagar.

- [ ] **T042** `[US-06]` Implementar la página `kultrumm-shop/src/components/admin/AdminProductsPage.tsx` (depende de T015, T040, T041):
  - Consume `useProducts()`.
  - Estado local `editingProduct: Producto | null`.
  - Layout desktop: `grid grid-cols-5` — formulario ocupa 2 columnas, tabla ocupa 3. En mobile: `flex flex-col` (formulario arriba).
  - `onEdit(producto)` → `setEditingProduct(producto)`.
  - `onDelete(id)` → llama a `useProducts().deleteProduct(id)`.
  - `onSubmit` del formulario: si `editingProduct` → `updateProduct`, si no → `createProduct`. Al completar: `setEditingProduct(null)`.
  - Header de admin con botón "Ver compras" → `navigate('/admin/compras')` y botón "Cerrar sesión" → `auth.service.signOut()`.

### US-07: Monitor de Órdenes

**User Story**: US-07 | **Prioridad**: P2
**Test manual**: Ir a `/admin/compras` → ver órdenes ordenadas. Crear una orden nueva desde el cliente en otra pestaña → aparece automáticamente (tiempo real).

- [ ] **T043** `[US-07]` Implementar `kultrumm-shop/src/components/admin/OrdersTable.tsx` (depende de T009):
  - Props: `orders: Compra[]`.
  - Tabla con columnas: ID de Transacción (`font-mono text-sm`), Fecha/Hora (formato `DD/MM/YYYY HH:mm`), Ítems (lista `nombre × cantidad`), Total (`font-mono`).
  - Filas con fondo alternado. Borde `border border-neutral-800`.

- [ ] **T044** `[US-07]` Implementar la página `kultrumm-shop/src/components/admin/AdminOrdersPage.tsx` (depende de T017, T043):
  - Consume `useOrders()`.
  - Si `loading` → `<LoadingSpinner>`.
  - Si `error` → `<ErrorMessage>`.
  - Si `orders.length === 0` → `<EmptyState message="No hay órdenes registradas aún.">`.
  - Si hay órdenes → `<OrdersTable orders={orders}>`.
  - Botón "← Volver al catálogo de productos" → `navigate('/admin')`.

**Checkpoint Fase 6**: Admin puede loguearse, gestionar productos y ver órdenes en tiempo real. Un usuario sin claim `admin: true` no puede acceder a ninguna ruta `/admin`.

---

## Fase 7 — Configuración Firebase y Reglas

**Propósito**: Conectar la app con el proyecto real de Firebase y asegurar la base de datos.

> ⚠️ Estas tareas requieren acceso a la consola web de Firebase.

- [ ] **T045** Crear el proyecto en Firebase Console (si no existe). Habilitar **Firestore** en modo producción y **Authentication** con proveedor Email/Password.

- [ ] **T046** Copiar las credenciales del proyecto de Firebase a `kultrumm-shop/.env` completando las 6 variables `VITE_FIREBASE_*`.

- [ ] **T047** `[P]` Crear `kultrumm-shop/firestore.rules` con el contenido exacto definido en `plan.md § Reglas de Firestore`. Deployar con `firebase deploy --only firestore:rules` y verificar en la consola Firebase → Rules Playground que:
  - Lectura anónima de `/productos` → **allow**.
  - Escritura anónima en `/productos` → **deny**.
  - Creación anónima en `/compras` → **allow**.
  - Lectura anónima de `/compras` → **deny**.
  - Lectura/escritura con token admin en `/productos` y `/compras` → **allow**.

- [ ] **T048** `[P]` Crear `kultrumm-shop/firebase.json` con la configuración de Hosting apuntando a `dist/` y rewrite `{ "source": "**", "destination": "/index.html" }` (SPA fallback). Crear `kultrumm-shop/.firebaserc` con el `project` ID.

- [ ] **T049** Ejecutar el script `scripts/set-admin-claim.ts` (T039) para asignar el Custom Claim `{ admin: true }` al UID del usuario administrador creado en Firebase Console. Verificar que el login en `/login` funciona y redirige a `/admin`.

- [ ] **T050** `[P]` Cargar el producto de prueba inicial en Firestore manualmente desde Firebase Console (o con un script de seeding separado) usando los datos definidos en `integrated-spec-v2.md §5.1`.

**Checkpoint Fase 7**: La app conectada al proyecto real de Firebase funciona de punta a punta: catálogo carga desde Firestore, checkout escribe en Firestore, admin autenticado gestiona productos.

---

## Fase 8 — CI/CD con GitHub Actions

**Propósito**: Automatizar build y deploy a Firebase Hosting en cada push a `main`.

- [ ] **T051** Crear el archivo `kultrumm-shop/firebase.json` con la sección `hosting` si no fue creado en T048. Asegurarse de que `"public": "dist"` y el rewrite SPA estén correctos.

- [ ] **T052** Cargar los 7 secrets en GitHub → Settings → Secrets and variables → Actions:
  `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`, `FIREBASE_SERVICE_ACCOUNT` (JSON completo descargado de Firebase Console → Service Accounts).

- [ ] **T053** Crear `.github/workflows/deploy.yml` con el contenido exacto definido en `plan.md § Estrategia de CI/CD`. Verificar que `working-directory` apunta a `kultrumm-shop/`.

- [ ] **T054** Hacer `git push` a `main` y verificar en GitHub → Actions que el workflow pasa. Verificar que la URL de Firebase Hosting sirve la app correctamente.

**Checkpoint Fase 8 = Checkpoint Final Fase 1**: La app está desplegada, el pipeline es verde y todas las US del spec están implementadas y funcionando en producción.

---

## Dependencias y Orden de Ejecución

### Grafo de dependencias críticas

```
T001–T008 (Scaffolding)
  └── T009 (Types)
        ├── T010–T013 (Servicios — paralelo)
        │     └── T014 (useAuth)
        │           ├── T015 (useProducts)
        │           ├── T016 (useCart)
        │           └── T017 (useOrders)
        ├── T018–T020 (UI base — paralelo)
        └── T021–T026 (Layout + Router — secuencial)
              └── [Fases 2–6 en paralelo entre sí]
                    └── T045–T050 (Firebase config)
                          └── T051–T054 (CI/CD)
```

### Tareas marcadas [P] — ejecutables en paralelo dentro de su bloque

**Fase 0**: T003, T004, T005, T006, T007, T008
**Fase 1B**: T010, T011, T012, T013
**Fase 1D**: T018, T019, T020
**Fase 2**: T028, T029
**Fase 4**: T034
**Fase 6-US05**: T039
**Fase 6-US06**: T041
**Fase 7**: T047, T048, T050

### Orden mínimo para demo MVP (solo US-01, US-03, US-04)

```
Fase 0 → Fase 1 → T027–T030 (US-01) → T033–T035 (US-03) → T036–T037 (US-04) → T045–T050 (Firebase)
```

---

## Resumen de conteo

| Fase | Tareas | [P] disponibles |
|------|--------|----------------|
| 0 — Scaffolding | T001–T008 | 6 |
| 1 — Fundación MVC | T009–T026 | 8 |
| 2 — US-01 Catálogo | T027–T030 | 2 |
| 3 — US-02 Modal | T031–T032 | 0 |
| 4 — US-03 Carrito | T033–T035 | 1 |
| 5 — US-04 Checkout | T036–T037 | 0 |
| 6 — Admin (US-05/06/07) | T038–T044 | 3 |
| 7 — Firebase config | T045–T050 | 3 |
| 8 — CI/CD | T051–T054 | 0 |
| **Total** | **54 tareas** | **23 paralelas** |
