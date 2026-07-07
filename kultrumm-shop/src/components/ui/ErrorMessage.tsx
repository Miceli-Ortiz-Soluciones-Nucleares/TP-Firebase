import { AlertCircle } from 'lucide-react'

interface Props {
  message: string
  onRetry?: () => void
}

export const ErrorMessage = ({ message, onRetry }: Props) => (
  <div className="flex flex-col items-center gap-4 py-12 text-center">
    <AlertCircle className="h-8 w-8 text-[#dd3b3b]" aria-hidden="true" />
    <p className="text-[#dd3b3b] font-mono text-sm">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="border border-neutral-800 px-4 py-2 text-sm font-mono text-[#f3f3f3] hover:border-neutral-600 transition-colors"
      >
        Reintentar
      </button>
    )}
  </div>
)
