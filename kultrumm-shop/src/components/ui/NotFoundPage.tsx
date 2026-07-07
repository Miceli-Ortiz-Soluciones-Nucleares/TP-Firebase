import { Link } from 'react-router-dom'

export const NotFoundPage = () => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
    <p className="font-mono text-6xl font-bold text-[#2a2a2a]">404</p>
    <p className="font-mono text-sm text-[#8a8a8a]">Página no encontrada.</p>
    <Link
      to="/"
      className="border border-neutral-800 px-4 py-2 font-mono text-sm text-[#f3f3f3] hover:border-neutral-600 transition-colors"
    >
      Volver al catálogo
    </Link>
  </div>
)
