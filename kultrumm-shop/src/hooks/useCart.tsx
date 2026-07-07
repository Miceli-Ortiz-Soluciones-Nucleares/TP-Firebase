import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { CartItem, Producto } from '../types'

const LS_KEY = 'kultrumm_cart'

interface CartContextValue {
  items: CartItem[]
  total: number
  addItem: (producto: Producto) => void
  updateQty: (productoId: string, delta: number) => void
  removeItem: (productoId: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue>({
  items: [],
  total: 0,
  addItem: () => {},
  updateQty: () => {},
  removeItem: () => {},
  clearCart: () => {},
})

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]') as CartItem[]
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(items))
  }, [items])

  const addItem = (producto: Producto) => {
    setItems(prev => {
      const exists = prev.find(i => i.productoId === producto.id)
      if (exists) {
        return prev.map(i =>
          i.productoId === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i,
        )
      }
      return [
        ...prev,
        {
          productoId: producto.id,
          nombre:     producto.nombre,
          precio:     producto.precio,
          imagen:     producto.imagen,
          cantidad:   1,
        },
      ]
    })
  }

  const updateQty = (productoId: string, delta: number) => {
    setItems(prev =>
      prev.map(i =>
        i.productoId === productoId
          ? { ...i, cantidad: Math.max(1, i.cantidad + delta) }
          : i,
      ),
    )
  }

  const removeItem = (productoId: string) => {
    setItems(prev => prev.filter(i => i.productoId !== productoId))
  }

  const clearCart = () => setItems([])

  const total = useMemo(
    () => items.reduce((acc, i) => acc + i.precio * i.cantidad, 0),
    [items],
  )

  return (
    <CartContext.Provider value={{ items, total, addItem, updateQty, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
