import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, ClipboardList, BarChart2 } from 'lucide-react'
import { useProducts } from '../../hooks/useProducts'
import { ProductForm } from './ProductForm'
import { ProductTable } from './ProductTable'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { ErrorMessage } from '../ui/ErrorMessage'
import { EmptyState } from '../ui/EmptyState'
import { signOut } from '../../services/auth.service'
import type { Producto } from '../../types'

export const AdminProductsPage = () => {
  const { products, loading, error, refetch, createProduct, updateProduct, deleteProduct } = useProducts()
  const navigate = useNavigate()
  const [editing, setEditing] = useState<Producto | null>(null)

  const handleSubmit = async (data: Omit<Producto, 'id' | 'creadoEn' | 'actualizadoEn'>) => {
    if (editing) {
      await updateProduct(editing.id, data)
      setEditing(null)
    } else {
      await createProduct(data)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    void navigate('/login')
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Cabecera */}
      <div className="mb-8 flex items-start justify-between border-b border-neutral-800 pb-6">
        <div>
          <p className="font-mono text-xs text-[#8a8a8a] uppercase tracking-widest mb-1">
            Administración
          </p>
          <h1 className="font-sans text-2xl font-bold tracking-tight text-[#f3f3f3]">
            Catálogo
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
              onClick={() => void navigate('/admin/dashboard')}
              className="flex items-center gap-2 border border-neutral-800 px-4 py-2 font-sans text-sm text-[#8a8a8a] hover:border-neutral-600 hover:text-[#f3f3f3] transition-colors"
            >
              <BarChart2 className="h-4 w-4" />
              Dashboard
            </button>
          <button
            onClick={() => void navigate('/admin/compras')}
            className="flex items-center gap-2 border border-neutral-800 px-4 py-2 font-sans text-sm text-[#8a8a8a] hover:border-neutral-600 hover:text-[#f3f3f3] transition-colors"
          >
            <ClipboardList className="h-4 w-4" />
            Ver compras
          </button>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 border border-neutral-800 px-4 py-2 font-sans text-sm text-[#8a8a8a] hover:border-neutral-600 hover:text-[#dd3b3b] transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Layout: formulario + tabla */}
      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-5">
        {/* Formulario — 2 cols */}
        <div className="lg:col-span-2">
          <ProductForm
            initialData={editing ?? undefined}
            onSubmit={handleSubmit}
            onCancel={() => setEditing(null)}
          />
        </div>

        {/* Tabla — 3 cols */}
        <div className="lg:col-span-3">
          {loading && <LoadingSpinner />}
          {!loading && error && <ErrorMessage message={error} onRetry={refetch} />}
          {!loading && !error && products.length === 0 && (
            <EmptyState message="No hay productos en el catálogo. Creá el primero." />
          )}
          {!loading && !error && products.length > 0 && (
            <ProductTable
              products={products}
              onEdit={p => setEditing(p)}
              onDelete={deleteProduct}
            />
          )}
        </div>
      </div>
    </div>
  )
}
