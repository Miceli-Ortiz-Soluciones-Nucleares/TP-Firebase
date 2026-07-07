# plan-v2.md

Este documento detalla la planificación técnica, la arquitectura de directorios de React y la integración del pipeline de despliegue automatizado con GitHub Actions para el e-commerce de Kultrumm.

---

## 1. Estructura de Directorios (Repositorio Vacío a React + TS)

Al inicializar tu proyecto con Vite y TypeScript, estructuraremos las carpetas de acuerdo con el patrón de separación de responsabilidades (MVC adaptado a React):

```text
/
├── .github/
│   └── workflows/
│       └── firebase-deploy.yml # Pipeline de Deploy Automatizado (GitHub Actions)
├── public/
│   └── favicon.ico
├── src/
│   ├── assets/              # Elementos gráficos y placeholders Bauhaus (SVG o locales)
│   ├── components/          # LA VISTA (Views) - Componentes visuales puros con Tailwind CSS
│   │   ├── Navbar.tsx       # Cabecera de navegación estilo Bauhaus
│   │   ├── ProductCard.tsx  # Tarjeta visual de producto
│   │   ├── ProductDetail.tsx# Detalle/especificaciones del producto
│   │   ├── CartModal.tsx    # Modal visual del carrito
│   │   ├── AdminForm.tsx    # Formulario para el ABM (Alta/Baja/Modificación)
│   │   └── OrdersMonitor.tsx# Tabla para que el admin audite compras
│   ├── services/            # EL MODELO (Model) - Conexión directa con Firebase
│   │   ├── firebase.ts      # Inicialización y config de Firebase
│   │   ├── db.ts            # Funciones Firestore (CRUD productos, lectura de compras)
│   │   └── auth.ts          # Funciones Firebase Auth (Login Admin)
│   ├── hooks/               # EL CONTROLADOR (Controllers) - Custom Hooks de negocio
│   │   ├── useAuth.ts       # Controlador del estado de login del Administrador
│   │   ├── useProducts.ts   # Controlador de productos y seeding inicial simple
│   │   └── useCart.ts       # Controlador del carrito, cálculo de totales y localStorage
│   ├── types/               # Tipos e interfaces de TypeScript
│   │   └── index.ts         // Definidos en data-model-v2.md
│   ├── App.tsx              # Componente principal (enrutamiento de vistas)
│   ├── index.css            # Configuración global e importación de Tailwind CSS
│   └── main.tsx             # Punto de entrada de Vite
├── tailwind.config.js       # Configuración de colores Bauhaus y estilos de Tailwind
├── tsconfig.json            # Configuración del compilador TypeScript
├── vite.config.ts           # Configuración de compilación de Vite
├── firebase.json            # Archivo de configuración de Firebase Hosting y Firestore
├── firestore.rules          # Reglas físicas de base de datos
└── package.json             # Dependencias del proyecto
```

---

## 2. Flujo de Controladores (Custom Hooks) y Seeding

### Seeding automático simplificado (`useProducts.ts`)
Para evitar que el catálogo aparezca vacío y simplificar las pruebas del TP, el hook controlador de productos gestionará un seeding automático. Si al cargar la vista se detecta que Firestore tiene 0 documentos en la colección `productos`, insertará un único producto de prueba:

```typescript
// Lógica interna para useProducts.ts
import { useEffect, useState } from 'react';
import { getProducts, createProduct } from '../services/db';
import { Producto } from '../types';

export const useProducts = () => {
  const [products, setProducts] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndSeed = async () => {
      try {
        setLoading(true);
        const data = await getProducts();
        
        if (data.length === 0) {
          // Seeding automático de un único producto genérico (Iteración v2)
          const seedProduct: Omit<Producto, 'id'> = {
            nombre: "Compresor de Prueba Bauhaus v1",
            descripcion_corta: "Compresión clásica y analógica de prueba en rack.",
            descripcion_larga: "Este dispositivo de prueba emula el comportamiento de un compresor vintage. Diseñado geométricamente bajo las directrices Bauhaus para pruebas de desarrollo.",
            especificaciones: {
              tipo: "Compresor de Tubos",
              valvulas: "12AX7, 6AL5",
              frecuencia: "20Hz a 20kHz +/- 1dB"
            },
            precio: 1250,
            imagen: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=400&q=80"
          };
          await createProduct(seedProduct);
          const refreshedData = await getProducts();
          setProducts(refreshedData);
        } else {
          setProducts(data);
        }
      } catch (error) {
        console.error("Error al cargar productos o seedear catálogo:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndSeed();
  }, []);

  return { products, loading, setProducts };
};
```

---

## 3. GitHub Actions: Pipeline de Despliegue Automatizado

Para cumplir con el requerimiento del profesor y sumar puntos extras por automatización, utilizaremos **GitHub Actions**. Una vez configurado, cada vez que hagas un `push` o merge a la rama `main` (o `master`), un servidor de GitHub tomará tu código, lo compilará e implementará automáticamente en Firebase Hosting.

### Configuración del Workflow
Deberás crear un archivo `.github/workflows/firebase-deploy.yml` con el siguiente contenido:

```yaml
name: Deploy to Firebase Hosting on Push

on:
  push:
    branches:
      - main # Cambiar a master si usas esa rama

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout del Repositorio
        uses: actions/checkout@v4

      - name: Configurar Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Instalar Dependencias
        run: npm ci

      - name: Compilar Aplicación
        run: npm run build
        env:
          # Inyección de variables de entorno de Firebase para Vite en tiempo de build
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
          VITE_PAYPAL_CLIENT_ID: ${{ secrets.VITE_PAYPAL_CLIENT_ID }}

      - name: Desplegar a Firebase Hosting
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT_KULTRUMM_TP }}
          projectId: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          channelId: live
```

### Configuración de Secretos en GitHub (Paso a Paso)
Para que el pipeline funcione de forma segura y no expongas tus credenciales en texto plano dentro del repositorio, debés ingresar a tu repositorio de GitHub, ir a **Settings > Secrets and variables > Actions** y agregar los siguientes secretos de repositorio (`Repository Secrets`):
1. `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, etc. (Los valores de configuración de tu SDK de Firebase).
2. `VITE_PAYPAL_CLIENT_ID` (Tu Client ID de pruebas de PayPal Sandbox).
3. `FIREBASE_SERVICE_ACCOUNT_KULTRUMM_TP`: El token JSON de la cuenta de servicio de Firebase que permite a GitHub escribir en Firebase Hosting (este archivo se obtiene automáticamente al correr `firebase init hosting` en tu terminal local).
