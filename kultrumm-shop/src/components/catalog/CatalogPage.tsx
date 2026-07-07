import { useState, useMemo } from 'react'
import { ShoppingBag, Search, X } from 'lucide-react'
import { useProducts } from '../../hooks/useProducts'
import { CatalogGrid } from './CatalogGrid'
import { ProductCardSkeleton } from './ProductCardSkeleton'
import { ProductModal } from './ProductModal'
import { ErrorMessage } from '../ui/ErrorMessage'
import { EmptyState } from '../ui/EmptyState'
import type { Producto, CategoriaProducto } from '../../types'
import { CATEGORIAS } from '../../types'

const SKELETON_COUNT = 6

export const CatalogPage = () => {
  const { products, loading, error, refetch } = useProducts()
  const [selected,  setSelected]  = useState<Producto | null>(null)
  const [search,    setSearch]    = useState('')
  const [categoria, setCategoria] = useState<CategoriaProducto | 'todas'>('todas')

  const filtered = useMemo(() => {
    let result = products
    if (categoria !== 'todas')
      result = result.filter(p => p.categoria === categoria)
    if (search.trim())
      result = result.filter(p =>
        p.nombre.toLowerCase().includes(search.trim().toLowerCase()),
      )
    return result
  }, [products, categoria, search])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Encabezado */}
      <div className="mb-6 border-b border-neutral-800 pb-6">
        <p className="mb-1 font-mono text-xs uppercase tracking-widest text-[#8a8a8a]">
          Equipamiento Analógico
        </p>
        <h1 className="font-sans text-2xl font-bold tracking-tight text-[#f3f3f3]">
          Catálogo
        </h1>
      </div>

      {/* ── Controles de filtro ── */}
      {!loading && !error && products.length > 0 && (
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          {/* Buscador */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a8a8a]" />
            <input
              type="text"
              placeholder="Buscar producto…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full border border-neutral-800 bg-[#1a1a1a] py-2 pl-9 pr-8 font-sans text-sm text-[#f3f3f3] outline-none placeholder:text-[#4a4a4a] focus:border-neutral-600 transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a8a8a] hover:text-[#f3f3f3]">
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Filtro por categoría */}
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setCategoria('todas')}
              className={`border px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors ${
                categoria === 'todas'
                  ? 'border-[#f3f3f3] bg-[#f3f3f3] text-[#121212]'
                  : 'border-neutral-800 text-[#8a8a8a] hover:border-neutral-600 hover:text-[#f3f3f3]'
              }`}
            >
              Todas
            </button>
            {CATEGORIAS.map(cat => (
              <button
                key={cat.value}
                onClick={() => setCategoria(cat.value)}
                className={`border px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors ${
                  categoria === cat.value
                    ? 'border-[#f3f3f3] bg-[#f3f3f3] text-[#121212]'
                    : 'border-neutral-800 text-[#8a8a8a] hover:border-neutral-600 hover:text-[#f3f3f3]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Estado: cargando */}
      {loading && (
        <div className="grid grid-cols-1 gap-px bg-neutral-800 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Estado: error */}
      {!loading && error && (
        <ErrorMessage message={error} onRetry={refetch} />
      )}

      {/* Estado: catálogo vacío (sin productos en Firestore) */}
      {!loading && !error && products.length === 0 && (
        <EmptyState
          icon={<ShoppingBag className="h-10 w-10" />}
          message="El catálogo está vacío. El administrador aún no cargó equipos."
        />
      )}

      {/* Estado: sin resultados de búsqueda */}
      {!loading && !error && products.length > 0 && filtered.length === 0 && (
        <EmptyState
          icon={<Search className="h-10 w-10" />}
          message={`Sin resultados para "${search || categoria}".`}
        />
      )}

      {/* Estado: productos */}
      {!loading && !error && filtered.length > 0 && (
        <>
          <p className="mb-3 font-mono text-xs text-[#4a4a4a]">
            {filtered.length} {filtered.length === 1 ? 'producto' : 'productos'}
          </p>
          <CatalogGrid products={filtered} onSelectProduct={setSelected} />
        </>
      )}

      {selected && (
        <ProductModal producto={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
