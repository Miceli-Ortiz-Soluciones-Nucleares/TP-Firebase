import { useEffect } from 'react'
import ReactDOM from 'react-dom'
import { X, ShoppingCart } from 'lucide-react'
import type { Producto } from '../../types'
import { useCart } from '../../hooks/useCart'

interface Props {
  producto: Producto
  onClose: () => void
}

const formatPrice = (price: number) => '$ ' + price.toLocaleString('es-AR')

export const ProductModal = ({ producto, onClose }: Props) => {
  const { addItem } = useCart()

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const handleAddToCart = () => {
    addItem(producto)
    onClose()
  }

  return ReactDOM.createPortal(
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      {/* Panel — clic dentro no cierra */}
      <div
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-y-auto border border-neutral-800 bg-[#1a1a1a]"
        onClick={e => e.stopPropagation()}
      >
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-4 top-4 z-10 text-[#8a8a8a] hover:text-[#f3f3f3] transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Imagen */}
        <div className="aspect-video w-full overflow-hidden border-b border-neutral-800">
          <img
            src={producto.imagen}
            alt={producto.nombre}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Contenido */}
        <div className="flex flex-col gap-6 p-6">
          {/* Nombre y precio */}
          <div className="flex flex-col gap-1 border-b border-neutral-800 pb-4">
            <h2 className="font-sans text-lg font-bold tracking-tight text-[#f3f3f3]">
              {producto.nombre}
            </h2>
            <p className="font-mono text-xl font-bold text-[#f3f3f3]">
              {formatPrice(producto.precio)}
            </p>
          </div>

          {/* Descripción larga */}
          <p className="font-sans text-sm leading-relaxed text-[#8a8a8a]">
            {producto.descripcionLarga}
          </p>

          {/* Especificaciones técnicas */}
          {Object.keys(producto.especificaciones).length > 0 && (
            <div className="flex flex-col border border-neutral-800">
              <div className="border-b border-neutral-800 px-4 py-2">
                <p className="font-mono text-xs uppercase tracking-widest text-[#8a8a8a]">
                  Especificaciones Técnicas
                </p>
              </div>
              {Object.entries(producto.especificaciones).map(([key, val]) => (
                <div
                  key={key}
                  className="flex border-b border-neutral-800 last:border-b-0"
                >
                  <span className="w-1/2 border-r border-neutral-800 px-4 py-2 font-mono text-xs text-[#8a8a8a]">
                    {key}
                  </span>
                  <span className="w-1/2 px-4 py-2 font-mono text-xs text-[#f3f3f3]">
                    {val}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Acción */}
          <button
            onClick={handleAddToCart}
            className="flex items-center justify-center gap-2 bg-[#dd3b3b] px-6 py-3 font-sans text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <ShoppingCart className="h-4 w-4" />
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
