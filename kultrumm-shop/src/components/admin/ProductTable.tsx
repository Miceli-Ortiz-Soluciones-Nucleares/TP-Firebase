import { Pencil, Trash2 } from 'lucide-react'
import type { Producto } from '../../types'

interface Props {
  products: Producto[]
  onEdit: (p: Producto) => void
  onDelete: (id: string) => void
}

const formatPrice = (n: number) => '$ ' + n.toLocaleString('es-AR')

export const ProductTable = ({ products, onEdit, onDelete }: Props) => {
  const handleDelete = (p: Producto) => {
    if (window.confirm(`¿Eliminar "${p.nombre}"? Esta acción no se puede deshacer.`)) {
      onDelete(p.id)
    }
  }

  return (
    <div className="border border-neutral-800 overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-neutral-800 bg-[#1a1a1a]">
            <th className="px-4 py-3 font-mono text-xs uppercase tracking-widest text-[#8a8a8a]">Imagen</th>
            <th className="px-4 py-3 font-mono text-xs uppercase tracking-widest text-[#8a8a8a]">Nombre</th>
            <th className="px-4 py-3 font-mono text-xs uppercase tracking-widest text-[#8a8a8a]">Precio</th>
            <th className="px-4 py-3 font-mono text-xs uppercase tracking-widest text-[#8a8a8a]">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p, i) => (
            <tr
              key={p.id}
              className={`border-b border-neutral-800 ${i % 2 === 0 ? 'bg-[#121212]' : 'bg-[#1a1a1a]'}`}
            >
              <td className="px-4 py-3">
                <img
                  src={p.imagen}
                  alt={p.nombre}
                  className="h-10 w-10 border border-neutral-800 object-cover"
                />
              </td>
              <td className="px-4 py-3 font-sans text-sm text-[#f3f3f3]">
                {p.nombre}
              </td>
              <td className="px-4 py-3 font-mono text-sm text-[#f3f3f3]">
                {formatPrice(p.precio)}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onEdit(p)}
                    aria-label={`Editar ${p.nombre}`}
                    className="text-[#8a8a8a] hover:text-[#f3f3f3] transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(p)}
                    aria-label={`Eliminar ${p.nombre}`}
                    className="text-[#8a8a8a] hover:text-[#dd3b3b] transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
