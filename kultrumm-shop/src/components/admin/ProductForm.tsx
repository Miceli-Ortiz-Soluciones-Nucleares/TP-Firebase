import { useState, useEffect, type FormEvent } from 'react'
import { Loader2, ImageOff } from 'lucide-react'
import type { Producto } from '../../types'
import { CATEGORIAS } from '../../types'

type ProductFormData = Omit<Producto, 'id' | 'creadoEn' | 'actualizadoEn'>

interface Props {
  initialData?: Producto
  onSubmit: (data: ProductFormData) => Promise<void>
  onCancel?: () => void
}

const parseSpecsText = (text: string): Record<string, string> =>
  Object.fromEntries(
    text
      .split('\n')
      .map(line => line.split(':').map(s => s.trim()))
      .filter(parts => parts.length === 2 && parts[0] && parts[1]) as [string, string][],
  )

const specsToText = (specs: Record<string, string>): string =>
  Object.entries(specs)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n')

const EMPTY: ProductFormData = {
  nombre: '',
  descripcionCorta: '',
  descripcionLarga: '',
  precio: 0,
  especificaciones: {},
  imagen: '',
  categoria: 'guitarra',
  stock: 1,
}

export const ProductForm = ({ initialData, onSubmit, onCancel }: Props) => {
  const [form, setForm]             = useState<ProductFormData>(EMPTY)
  const [specsText, setSpecsText]   = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [imgOk, setImgOk]           = useState(false)

  useEffect(() => {
    if (initialData) {
      setForm({
        nombre:           initialData.nombre,
        descripcionCorta: initialData.descripcionCorta,
        descripcionLarga: initialData.descripcionLarga,
        precio:           initialData.precio,
        especificaciones: initialData.especificaciones,
        imagen:           initialData.imagen,
        categoria:        initialData.categoria ?? 'guitarra',
        stock:            initialData.stock ?? 1,
      })
      setSpecsText(specsToText(initialData.especificaciones))
      setImgOk(true)
    } else {
      setForm(EMPTY)
      setSpecsText('')
      setImgOk(false)
    }
  }, [initialData])

  const set = (field: keyof ProductFormData, value: string | number) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (form.precio <= 0) {
      setError('El precio debe ser mayor a cero.')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({ ...form, especificaciones: parseSpecsText(specsText) })
      setForm(EMPTY)
      setSpecsText('')
      setImgOk(false)
    } catch {
      setError('Error al guardar el producto. Intentá de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  const isEditing = !!initialData

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 border border-neutral-800 bg-[#1a1a1a] p-6">
      <p className="font-mono text-xs uppercase tracking-widest text-[#8a8a8a]">
        {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
      </p>

      {/* Nombre */}
      <div className="flex flex-col gap-1">
        <label htmlFor="nombre" className="font-mono text-xs text-[#8a8a8a]">Nombre *</label>
        <input id="nombre" required value={form.nombre}
          onChange={e => set('nombre', e.target.value)}
          className="border border-neutral-800 bg-[#121212] px-3 py-2 font-sans text-sm text-[#f3f3f3] outline-none focus:border-neutral-600 transition-colors" />
      </div>

      {/* Descripción corta */}
      <div className="flex flex-col gap-1">
        <label htmlFor="descCorta" className="font-mono text-xs text-[#8a8a8a]">Descripción corta *</label>
        <input id="descCorta" required value={form.descripcionCorta}
          onChange={e => set('descripcionCorta', e.target.value)}
          className="border border-neutral-800 bg-[#121212] px-3 py-2 font-sans text-sm text-[#f3f3f3] outline-none focus:border-neutral-600 transition-colors" />
      </div>

      {/* Descripción larga */}
      <div className="flex flex-col gap-1">
        <label htmlFor="descLarga" className="font-mono text-xs text-[#8a8a8a]">Descripción larga *</label>
        <textarea id="descLarga" required rows={3} value={form.descripcionLarga}
          onChange={e => set('descripcionLarga', e.target.value)}
          className="border border-neutral-800 bg-[#121212] px-3 py-2 font-sans text-sm text-[#f3f3f3] outline-none focus:border-neutral-600 transition-colors resize-none" />
      </div>

      {/* Precio + Stock */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="precio" className="font-mono text-xs text-[#8a8a8a]">Precio ARS *</label>
          <input id="precio" type="number" required min={1} value={form.precio || ''}
            onChange={e => set('precio', Number(e.target.value))}
            className="border border-neutral-800 bg-[#121212] px-3 py-2 font-mono text-sm text-[#f3f3f3] outline-none focus:border-neutral-600 transition-colors" />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="stock" className="font-mono text-xs text-[#8a8a8a]">Stock *</label>
          <input id="stock" type="number" required min={0} value={form.stock ?? ''}
            onChange={e => set('stock', Number(e.target.value))}
            className="border border-neutral-800 bg-[#121212] px-3 py-2 font-mono text-sm text-[#f3f3f3] outline-none focus:border-neutral-600 transition-colors" />
        </div>
      </div>

      {/* Categoría */}
      <div className="flex flex-col gap-1">
        <label htmlFor="categoria" className="font-mono text-xs text-[#8a8a8a]">Categoría *</label>
        <select
          id="categoria"
          required
          value={form.categoria ?? 'guitarra'}
          onChange={e => set('categoria', e.target.value)}
          className="border border-neutral-800 bg-[#121212] px-3 py-2 font-sans text-sm text-[#f3f3f3] outline-none focus:border-neutral-600 transition-colors"
        >
          {CATEGORIAS.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Especificaciones */}
      <div className="flex flex-col gap-1">
        <label htmlFor="specs" className="font-mono text-xs text-[#8a8a8a]">
          Especificaciones (Clave: Valor, una por línea) *
        </label>
        <textarea id="specs" required rows={5} value={specsText}
          onChange={e => setSpecsText(e.target.value)}
          placeholder={"Cuerpo: Aliso\nMástil: Arce\nTrastes: 22\nCuerda: .010"}
          className="border border-neutral-800 bg-[#121212] px-3 py-2 font-mono text-xs text-[#f3f3f3] outline-none focus:border-neutral-600 transition-colors resize-none" />
      </div>

      {/* Imagen */}
      <div className="flex flex-col gap-2">
        <label htmlFor="imagen" className="font-mono text-xs text-[#8a8a8a]">
          URL de imagen *{' '}
          <span className="font-sans normal-case text-[#4a4a4a]">(imgur, postimg, etc.)</span>
        </label>
        <input
          id="imagen"
          type="url"
          required
          value={form.imagen}
          placeholder="https://i.imgur.com/..."
          onChange={e => { set('imagen', e.target.value); setImgOk(false) }}
          className="border border-neutral-800 bg-[#121212] px-3 py-2 font-sans text-sm text-[#f3f3f3] outline-none focus:border-neutral-600 transition-colors"
        />

        {/* Preview en vivo */}
        {form.imagen && (
          <div className="relative aspect-video w-full overflow-hidden border border-neutral-800 bg-[#0d0d0d]">
            {!imgOk && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[#4a4a4a]">
                <ImageOff className="h-6 w-6" />
                <span className="font-mono text-[10px]">Cargando preview…</span>
              </div>
            )}
            <img
              src={form.imagen}
              alt="Preview"
              onLoad={() => setImgOk(true)}
              onError={() => setImgOk(false)}
              className={`h-full w-full object-cover transition-opacity duration-300 ${imgOk ? 'opacity-100' : 'opacity-0'}`}
            />
          </div>
        )}
      </div>

      {error && <p className="font-mono text-xs text-[#dd3b3b]">{error}</p>}

      {/* Acciones */}
      <div className="flex gap-3 pt-1">
        <button type="submit" disabled={submitting}
          className="flex flex-1 items-center justify-center gap-2 bg-[#dd3b3b] py-2 font-sans text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {isEditing ? 'Actualizar Producto' : 'Guardar Producto'}
        </button>

        {isEditing && onCancel && (
          <button type="button" onClick={onCancel}
            className="border border-neutral-800 px-4 py-2 font-sans text-sm text-[#8a8a8a] hover:border-neutral-600 hover:text-[#f3f3f3] transition-colors">
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}
