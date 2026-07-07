import type { ReactNode } from 'react'

interface Props {
  message: string
  icon?: ReactNode
  action?: { label: string; onClick: () => void }
}

export const EmptyState = ({ message, icon, action }: Props) => (
  <div className="flex flex-col items-center gap-4 py-16 text-center">
    {icon && <div className="text-[#8a8a8a]">{icon}</div>}
    <p className="text-[#8a8a8a] font-mono text-sm">{message}</p>
    {action && (
      <button
        onClick={action.onClick}
        className="border border-neutral-800 px-4 py-2 text-sm font-mono text-[#f3f3f3] hover:border-neutral-600 transition-colors"
      >
        {action.label}
      </button>
    )}
  </div>
)
