import type { Producto } from '../../types'
import { ProductCard } from './ProductCard'

interface Props {
  products: Producto[]
  onSelectProduct: (p: Producto) => void
}

export const CatalogGrid = ({ products, onSelectProduct }: Props) => (
  <div className="grid grid-cols-1 gap-px bg-neutral-800 md:grid-cols-2 lg:grid-cols-3">
    {products.map(p => (
      <ProductCard
        key={p.id}
        producto={p}
        onClick={() => onSelectProduct(p)}
      />
    ))}
  </div>
)
