import type { Compra } from '../../types'
import type { Timestamp } from 'firebase/firestore'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const PAGE_SIZE = 10

interface Props {
  orders: Compra[]
  page: number
  onPage: (p: number) => void
}

const formatPrice = (n: number) => '$ ' + n.toLocaleString('es-AR')

const formatDate = (ts: Timestamp | undefined): string => {
  if (!ts) return '—'
  const d = ts.toDate()
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

export { PAGE_SIZE }

export const OrdersTable = ({ orders, page, onPage }: Props) => {
  const totalPages = Math.ceil(orders.length / PAGE_SIZE)
  const slice = orders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto border border-neutral-800">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-neutral-800 bg-[#1a1a1a]">
              <th className="px-4 py-3 font-mono text-xs uppercase tracking-widest text-[#8a8a8a]">ID Transacción</th>
              <th className="px-4 py-3 font-mono text-xs uppercase tracking-widest text-[#8a8a8a]">Fecha</th>
              <th className="px-4 py-3 font-mono text-xs uppercase tracking-widest text-[#8a8a8a]">Ítems</th>
              <th className="px-4 py-3 font-mono text-xs uppercase tracking-widest text-[#8a8a8a]">Total</th>
            </tr>
          </thead>
          <tbody>
            {slice.map((o, i) => (
              <tr
                key={o.id}
                className={`border-b border-neutral-800 align-top ${i % 2 === 0 ? 'bg-[#121212]' : 'bg-[#1a1a1a]'}`}
              >
                <td className="max-w-[180px] break-all px-4 py-3 font-mono text-xs text-[#ff9d00]">
                  {o.transaccionId}
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-[#8a8a8a]">
                  {formatDate(o.creadoEn)}
                </td>
                <td className="px-4 py-3">
                  <ul className="flex flex-col gap-1">
                    {o.items.map((item, j) => (
                      <li key={j} className="font-sans text-xs text-[#f3f3f3]">
                        {item.nombre} <span className="text-[#8a8a8a]">× {item.cantidad}</span>
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-sm font-bold text-[#f3f3f3]">
                  {formatPrice(o.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs text-[#8a8a8a]">
            Página {page} de {totalPages} · {orders.length} órdenes
          </p>
          <div className="flex gap-1">
            <button
              disabled={page === 1}
              onClick={() => onPage(page - 1)}
              className="flex h-8 w-8 items-center justify-center border border-neutral-800 text-[#8a8a8a] hover:border-neutral-600 hover:text-[#f3f3f3] disabled:cursor-not-allowed disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                onClick={() => onPage(n)}
                className={`flex h-8 w-8 items-center justify-center border font-mono text-xs transition-colors ${
                  n === page
                    ? 'border-[#f3f3f3] bg-[#f3f3f3] text-[#121212]'
                    : 'border-neutral-800 text-[#8a8a8a] hover:border-neutral-600 hover:text-[#f3f3f3]'
                }`}
              >
                {n}
              </button>
            ))}
            <button
              disabled={page === totalPages}
              onClick={() => onPage(page + 1)}
              className="flex h-8 w-8 items-center justify-center border border-neutral-800 text-[#8a8a8a] hover:border-neutral-600 hover:text-[#f3f3f3] disabled:cursor-not-allowed disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
