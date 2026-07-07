import type { Producto } from '../../types'
import { CATEGORIAS } from '../../types'

interface Props {
  producto: Producto
  onClick: () => void
}

const formatPrice = (price: number) =>
  '$ ' + price.toLocaleString('es-AR')

const StockBadge = ({ stock }: { stock?: number }) => {
  if (stock === undefined) return null
  if (stock === 0)
    return <span className="font-mono text-[9px] uppercase text-[#dd3b3b]">Sin stock</span>
  if (stock <= 3)
    return <span className="font-mono text-[9px] uppercase text-[#ff9d00]">Últimas {stock}</span>
  return <span className="font-mono text-[9px] uppercase text-[#4caf7d]">En stock</span>
}

export const ProductCard = ({ producto, onClick }: Props) => {
  const catLabel = CATEGORIAS.find(c => c.value === producto.categoria)?.label

  return (
    <article
      onClick={onClick}
      className="group flex cursor-pointer flex-col border border-neutral-800 bg-[#1a1a1a] transition-colors hover:border-neutral-600"
    >
      {/* Imagen */}
      <div className="relative aspect-video w-full overflow-hidden border-b border-neutral-800">
        <img
          src={producto.imagen}
          alt={producto.nombre}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Badge categoría */}
        {catLabel && (
          <span className="absolute left-2 top-2 border border-neutral-700 bg-[#121212]/90 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-[#8a8a8a]">
            {catLabel}
          </span>
        )}
      </div>

      {/* Contenido */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h2 className="font-sans text-sm font-medium tracking-tight text-[#f3f3f3]">
          {producto.nombre}
        </h2>
        <p className="flex-1 font-sans text-xs leading-relaxed text-[#8a8a8a]">
          {producto.descripcionCorta}
        </p>
        <div className="flex items-center justify-between">
          <p className="font-mono text-sm font-bold text-[#f3f3f3]">
            {formatPrice(producto.precio)}
          </p>
          <StockBadge stock={producto.stock} />
        </div>
      </div>
    </article>
  )
}
