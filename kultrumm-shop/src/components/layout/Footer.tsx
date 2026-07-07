import { Link } from 'react-router-dom'

export const Footer = () => (
  <footer className="border-t border-neutral-800 bg-[#121212]">
    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6">
      <p className="font-mono text-xs text-[#8a8a8a]">KULTRUMM © 2026</p>
      <Link
        to="/login"
        className="font-mono text-xs text-[#2a2a2a] hover:text-[#8a8a8a] transition-colors"
        aria-label="Acceso administrador"
      >
        admin
      </Link>
    </div>
  </footer>
)
