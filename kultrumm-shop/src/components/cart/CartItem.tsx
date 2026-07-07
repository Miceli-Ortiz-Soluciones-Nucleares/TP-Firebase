import { Minus, Plus, Trash2 } from 'lucide-react'
import type { CartItem as CartItemType } from '../../types'
import { useCart } from '../../hooks/useCart'

interface Props {
  item: CartItemType
}

const formatPrice = (n: number) => '$ ' + n.toLocaleString('es-AR')

export const CartItem = ({ item }: Props) => {
  const { updateQty, removeItem } = useCart()

  return (
    <div className="flex items-center gap-4 border-b border-neutral-800 py-4">
      {/* Imagen */}
      <img
        src={item.imagen}
        alt={item.nombre}
        className="h-16 w-16 flex-shrink-0 border border-neutral-800 object-cover"
      />

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 min-w-0">
        <p className="font-sans text-sm font-medium text-[#f3f3f3] truncate">
          {item.nombre}
        </p>
        <p className="font-mono text-xs text-[#8a8a8a]">
          {formatPrice(item.precio)} c/u
        </p>
      </div>

      {/* Controles de cantidad */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => updateQty(item.productoId, -1)}
          disabled={item.cantidad === 1}
          aria-label="Reducir cantidad"
          className="flex h-7 w-7 items-center justify-center border border-neutral-800 text-[#f3f3f3] hover:border-neutral-600 disabled:cursor-not-allowed disabled:text-neutral-700 transition-colors"
        >
          <Minus className="h-3 w-3" />
        </button>
        <span className="w-6 text-center font-mono text-sm text-[#f3f3f3]">
          {item.cantidad}
        </span>
        <button
          onClick={() => updateQty(item.productoId, 1)}
          aria-label="Aumentar cantidad"
          className="flex h-7 w-7 items-center justify-center border border-neutral-800 text-[#f3f3f3] hover:border-neutral-600 transition-colors"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>

      {/* Subtotal */}
      <p className="w-28 text-right font-mono text-sm font-bold text-[#f3f3f3]">
        {formatPrice(item.precio * item.cantidad)}
      </p>

      {/* Eliminar */}
      <button
        onClick={() => removeItem(item.productoId)}
        aria-label="Eliminar ítem"
        className="text-[#8a8a8a] hover:text-[#dd3b3b] transition-colors"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}
