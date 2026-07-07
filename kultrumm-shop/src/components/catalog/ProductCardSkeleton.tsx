export const ProductCardSkeleton = () => (
  <div className="flex flex-col border border-neutral-800 bg-[#1a1a1a] animate-pulse">
    {/* Imagen skeleton */}
    <div className="aspect-video w-full bg-neutral-800 border-b border-neutral-800" />

    {/* Contenido skeleton */}
    <div className="flex flex-col gap-3 p-4">
      <div className="h-3 w-3/4 rounded-sm bg-neutral-800" />
      <div className="h-2 w-full rounded-sm bg-neutral-800" />
      <div className="h-2 w-2/3 rounded-sm bg-neutral-800" />
      <div className="mt-1 h-3 w-1/3 rounded-sm bg-neutral-800" />
    </div>
  </div>
)
