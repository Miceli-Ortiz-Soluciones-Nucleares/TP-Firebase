import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ShoppingBag, TrendingUp, Package, DollarSign } from 'lucide-react'
import { useOrders } from '../../hooks/useOrders'
import { useProducts } from '../../hooks/useProducts'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { CATEGORIAS } from '../../types'

const formatPrice = (n: number) => '$ ' + n.toLocaleString('es-AR')

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string
}
const StatCard = ({ icon, label, value }: StatCardProps) => (
  <div className="flex flex-col gap-3 border border-neutral-800 bg-[#1a1a1a] p-5">
    <div className="flex items-center gap-2 text-[#8a8a8a]">
      {icon}
      <span className="font-mono text-xs uppercase tracking-widest">{label}</span>
    </div>
    <p className="font-mono text-2xl font-bold text-[#f3f3f3]">{value}</p>
  </div>
)

export const AdminDashboardPage = () => {
  const { orders, loading: loadingOrders }   = useOrders()
  const { products, loading: loadingProds }  = useProducts()
  const navigate = useNavigate()

  /* ── métricas ── */
  const stats = useMemo(() => {
    const totalRecaudado = orders.reduce((acc, o) => acc + o.total, 0)
    const totalOrdenes   = orders.length
    const totalProductos = products.length

    /* Productos más vendidos */
    const counter: Record<string, { nombre: string; cantidad: number }> = {}
    for (const orden of orders) {
      for (const item of orden.items) {
        if (!counter[item.productoId]) {
          counter[item.productoId] = { nombre: item.nombre, cantidad: 0 }
        }
        counter[item.productoId].cantidad += item.cantidad
      }
    }
    const topProductos = Object.values(counter)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5)

    /* Productos por categoría */
    const porCategoria = CATEGORIAS.map(cat => ({
      label: cat.label,
      count: products.filter(p => p.categoria === cat.value).length,
    }))

    return { totalRecaudado, totalOrdenes, totalProductos, topProductos, porCategoria }
  }, [orders, products])

  if (loadingOrders || loadingProds) return <LoadingSpinner />

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Cabecera */}
      <div className="mb-8 flex items-start justify-between border-b border-neutral-800 pb-6">
        <div>
          <p className="mb-1 font-mono text-xs uppercase tracking-widest text-[#8a8a8a]">
            Administración
          </p>
          <h1 className="font-sans text-2xl font-bold tracking-tight text-[#f3f3f3]">
            Dashboard
          </h1>
        </div>
        <button
          onClick={() => void navigate('/admin')}
          className="flex items-center gap-2 border border-neutral-800 px-4 py-2 font-sans text-sm text-[#8a8a8a] hover:border-neutral-600 hover:text-[#f3f3f3] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div className="mb-8 grid grid-cols-1 gap-px bg-neutral-800 sm:grid-cols-3">
        <StatCard
          icon={<DollarSign className="h-4 w-4" />}
          label="Total recaudado"
          value={formatPrice(stats.totalRecaudado)}
        />
        <StatCard
          icon={<ShoppingBag className="h-4 w-4" />}
          label="Órdenes"
          value={String(stats.totalOrdenes)}
        />
        <StatCard
          icon={<Package className="h-4 w-4" />}
          label="Productos"
          value={String(stats.totalProductos)}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* ── Productos más vendidos ── */}
        <div className="border border-neutral-800">
          <div className="flex items-center gap-2 border-b border-neutral-800 px-4 py-3">
            <TrendingUp className="h-4 w-4 text-[#8a8a8a]" />
            <p className="font-mono text-xs uppercase tracking-widest text-[#8a8a8a]">
              Más vendidos
            </p>
          </div>
          {stats.topProductos.length === 0 ? (
            <p className="px-4 py-6 font-sans text-sm text-[#4a4a4a]">Sin ventas aún.</p>
          ) : (
            <ul>
              {stats.topProductos.map((p, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between border-b border-neutral-800 px-4 py-3 last:border-b-0"
                >
                  <span className="font-sans text-sm text-[#f3f3f3]">{p.nombre}</span>
                  <span className="font-mono text-xs text-[#ff9d00]">× {p.cantidad}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Productos por categoría ── */}
        <div className="border border-neutral-800">
          <div className="flex items-center gap-2 border-b border-neutral-800 px-4 py-3">
            <Package className="h-4 w-4 text-[#8a8a8a]" />
            <p className="font-mono text-xs uppercase tracking-widest text-[#8a8a8a]">
              Por categoría
            </p>
          </div>
          <ul>
            {stats.porCategoria.map(cat => (
              <li
                key={cat.label}
                className="flex items-center justify-between border-b border-neutral-800 px-4 py-3 last:border-b-0"
              >
                <span className="font-sans text-sm text-[#f3f3f3]">{cat.label}</span>
                <span className="font-mono text-xs text-[#8a8a8a]">{cat.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
