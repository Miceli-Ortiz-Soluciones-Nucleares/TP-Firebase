import { Loader2 } from 'lucide-react'

interface Props {
  total: number
  onConfirm: () => void
  isSubmitting: boolean
  error: string | null
}

const formatPrice = (n: number) => '$ ' + n.toLocaleString('es-AR')

export const CartSummary = ({ total, onConfirm, isSubmitting, error }: Props) => (
  <div className="border border-neutral-800 bg-[#1a1a1a] p-6 flex flex-col gap-4">
    <p className="font-mono text-xs uppercase tracking-widest text-[#8a8a8a]">
      Resumen
    </p>

    <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
      <span className="font-sans text-sm text-[#8a8a8a]">Total</span>
      <span className="font-mono text-2xl font-bold text-[#f3f3f3]">
        {formatPrice(total)}
      </span>
    </div>

    {error && (
      <p className="font-mono text-xs text-[#dd3b3b]">{error}</p>
    )}

    <button
      onClick={onConfirm}
      disabled={isSubmitting}
      className="flex items-center justify-center gap-2 bg-[#dd3b3b] px-6 py-3 font-sans text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isSubmitting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Procesando…</span>
        </>
      ) : (
        'Confirmar Orden'
      )}
    </button>
  </div>
)
