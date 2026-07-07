import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, LayoutDashboard, Menu, X } from 'lucide-react'
import { useCart } from '../../hooks/useCart'
import { useAuth } from '../../hooks/useAuth'

export const Header = () => {
  const { items } = useCart()
  const { isAdmin } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const totalUnits = items.reduce((acc, i) => acc + i.cantidad, 0)
  const close = () => setMenuOpen(false)

  return (
    <header className="border-b border-neutral-800 bg-[#121212]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link to="/" onClick={close} className="font-mono text-lg font-bold tracking-tight text-[#f3f3f3]">
          KULTRUMM
        </Link>

        {/* ── Desktop nav ── */}
        <nav className="hidden items-center gap-6 sm:flex">
          <Link to="/" className="font-sans text-sm text-[#8a8a8a] hover:text-[#f3f3f3] transition-colors">
            Catálogo
          </Link>
          {isAdmin && (
            <Link to="/admin" aria-label="Panel de administración"
              className="flex items-center gap-1 font-sans text-sm text-[#ff9d00] hover:opacity-80 transition-opacity">
              <LayoutDashboard className="h-4 w-4" />
              Panel
            </Link>
          )}
          <Link to="/carrito" className="relative" aria-label="Carrito">
            <ShoppingCart className="h-5 w-5 text-[#f3f3f3]" />
            {totalUnits > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#dd3b3b] font-mono text-[10px] text-white">
                {totalUnits}
              </span>
            )}
          </Link>
        </nav>

        {/* ── Mobile: carrito + hamburguesa ── */}
        <div className="flex items-center gap-4 sm:hidden">
          <Link to="/carrito" className="relative" aria-label="Carrito" onClick={close}>
            <ShoppingCart className="h-5 w-5 text-[#f3f3f3]" />
            {totalUnits > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#dd3b3b] font-mono text-[10px] text-white">
                {totalUnits}
              </span>
            )}
          </Link>
          <button onClick={() => setMenuOpen(v => !v)} aria-label="Menú" className="text-[#f3f3f3]">
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile dropdown ── */}
      {menuOpen && (
        <nav className="border-t border-neutral-800 bg-[#121212] px-4 pb-4 sm:hidden">
          <Link to="/" onClick={close}
            className="block py-3 font-sans text-sm text-[#8a8a8a] hover:text-[#f3f3f3] transition-colors">
            Catálogo
          </Link>
          {isAdmin && (
            <Link to="/admin" onClick={close}
              className="flex items-center gap-2 py-3 font-sans text-sm text-[#ff9d00] hover:opacity-80 transition-opacity">
              <LayoutDashboard className="h-4 w-4" />
              Panel admin
            </Link>
          )}
        </nav>
      )}
    </header>
  )
}
