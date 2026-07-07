import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useOrders } from '../../hooks/useOrders'
import { OrdersTable } from './OrdersTable'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { ErrorMessage } from '../ui/ErrorMessage'
import { EmptyState } from '../ui/EmptyState'

export const AdminOrdersPage = () => {
  const { orders, loading, error } = useOrders()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Cabecera */}
      <div className="mb-8 flex items-start justify-between border-b border-neutral-800 pb-6">
        <div>
          <p className="mb-1 font-mono text-xs uppercase tracking-widest text-[#8a8a8a]">
            Administración
          </p>
          <h1 className="font-sans text-2xl font-bold tracking-tight text-[#f3f3f3]">
            Compras
          </h1>
        </div>
        <button
          onClick={() => void navigate('/admin')}
          className="flex items-center gap-2 border border-neutral-800 px-4 py-2 font-sans text-sm text-[#8a8a8a] hover:border-neutral-600 hover:text-[#f3f3f3] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al catálogo
        </button>
      </div>

      {/* Contenido */}
      {loading && <LoadingSpinner />}
      {!loading && error && <ErrorMessage message={error} />}
      {!loading && !error && orders.length === 0 && (
        <EmptyState message="No hay órdenes registradas aún." />
      )}
      {!loading && !error && orders.length > 0 && (
        <OrdersTable orders={orders} page={page} onPage={setPage} />
      )}
    </div>
  )
}
