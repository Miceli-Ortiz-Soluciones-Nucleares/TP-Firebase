import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '../../hooks/useCart'
import { CartItem } from './CartItem'
import { CartSummary } from './CartSummary'
import { EmptyState } from '../ui/EmptyState'
import { createOrder } from '../../services/orders.service'

const genTransaccionId = () =>
  'SIM-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase()

export const CartPage = () => {
  const { items, total, clearCart } = useCart()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleConfirm = async () => {
    setSubmitting(true)
    setSubmitError(null)

    const transaccionId = genTransaccionId()
    const orderItems = items.map(i => ({
      productoId: i.productoId,
      nombre:     i.nombre,
      precio:     i.precio,
      cantidad:   i.cantidad,
      subtotal:   i.precio * i.cantidad,
    }))

    try {
      await createOrder({ transaccionId, items: orderItems, total, estado: 'simulado' })
      clearCart()
      void navigate('/orden/' + transaccionId)
    } catch {
      setSubmitError('No se pudo registrar la orden. Intentá de nuevo.')
      setSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <EmptyState
          icon={<ShoppingCart className="h-10 w-10" />}
          message="Tu carrito está vacío."
          action={{ label: 'Ver catálogo', onClick: () => void navigate('/') }}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Encabezado */}
      <div className="mb-8 border-b border-neutral-800 pb-6">
        <p className="font-mono text-xs text-[#8a8a8a] uppercase tracking-widest mb-1">
          Mi Selección
        </p>
        <h1 className="font-sans text-2xl font-bold tracking-tight text-[#f3f3f3]">
          Carrito
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Lista de ítems */}
        <div className="lg:col-span-2">
          {items.map(item => (
            <CartItem key={item.productoId} item={item} />
          ))}
        </div>

        {/* Resumen y checkout */}
        <div className="lg:col-span-1">
          <CartSummary
            total={total}
            onConfirm={handleConfirm}
            isSubmitting={submitting}
            error={submitError}
          />
        </div>
      </div>
    </div>
  )
}
