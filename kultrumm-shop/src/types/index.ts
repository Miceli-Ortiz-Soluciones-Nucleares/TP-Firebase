import type { Timestamp } from 'firebase/firestore'

// ── Categorías ────────────────────────────────────────────────────────────────
export type CategoriaProducto = 'guitarra' | 'bajo' | 'amplificador' | 'accesorio'

export const CATEGORIAS: { value: CategoriaProducto; label: string }[] = [
  { value: 'guitarra',     label: 'Guitarras'     },
  { value: 'bajo',         label: 'Bajos'         },
  { value: 'amplificador', label: 'Amplificadores'},
  { value: 'accesorio',    label: 'Accesorios'    },
]

// ── Producto ──────────────────────────────────────────────────────────────────
export interface Producto {
  id: string
  nombre: string
  descripcionCorta: string
  descripcionLarga: string
  precio: number                           // entero positivo, ARS
  especificaciones: Record<string, string>
  imagen: string                           // URL absoluta (imgur, postimg, etc.)
  categoria?: CategoriaProducto            // opcional para compatibilidad con docs viejos
  stock?: number                           // undefined = sin información de stock
  creadoEn: Timestamp
  actualizadoEn: Timestamp
}

// ── Carrito ───────────────────────────────────────────────────────────────────
export interface CartItem {
  productoId: string
  nombre: string
  precio: number
  imagen: string
  cantidad: number
}

// ── Compras ───────────────────────────────────────────────────────────────────
export interface CompraItem {
  productoId: string
  nombre: string    // snapshot al momento de comprar
  precio: number   // snapshot al momento de comprar
  cantidad: number
  subtotal: number  // precio * cantidad
}

export interface Compra {
  id: string
  transaccionId: string   // "SIM-{timestamp}-{random}" en Fase 1
  items: CompraItem[]
  total: number
  estado: 'simulado'      // Fase 2 agrega 'pagado'
  creadoEn: Timestamp
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export interface AuthState {
  user: import('firebase/auth').User | null
  isAdmin: boolean
  loading: boolean
}
