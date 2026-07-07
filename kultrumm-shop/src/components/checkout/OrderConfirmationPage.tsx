import { useNavigate, useParams } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'

export const OrderConfirmationPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 px-4 py-16 text-center">
      {/* Ícono de éxito */}
      <CheckCircle className="h-12 w-12 text-[#ff9d00]" aria-hidden="true" />

      {/* Título */}
      <div className="flex flex-col gap-2">
        <h1 className="font-sans text-2xl font-bold tracking-tight text-[#f3f3f3]">
          Orden registrada
        </h1>
        <p className="font-sans text-sm text-[#8a8a8a]">
          Tu pedido fue procesado correctamente.
        </p>
      </div>

      {/* ID de transacción */}
      <div className="w-full border border-neutral-800 bg-[#1a1a1a] p-6">
        <p className="font-mono text-xs uppercase tracking-widest text-[#8a8a8a] mb-3">
          ID de Transacción
        </p>
        <p className="font-mono text-sm font-bold text-[#ff9d00] break-all">
          {id}
        </p>
      </div>

      {/* Acción */}
      <button
        onClick={() => void navigate('/')}
        className="border border-neutral-800 px-6 py-3 font-sans text-sm text-[#f3f3f3] hover:border-neutral-600 transition-colors"
      >
        Volver al catálogo
      </button>
    </div>
  )
}
