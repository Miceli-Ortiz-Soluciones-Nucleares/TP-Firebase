interface Props {
  fullscreen?: boolean
}

export const LoadingSpinner = ({ fullscreen = false }: Props) => {
  const wrapper = fullscreen
    ? 'fixed inset-0 flex items-center justify-center bg-[#121212] z-50'
    : 'flex items-center justify-center p-8'

  return (
    <div className={wrapper}>
      <svg
        className="animate-spin h-8 w-8 text-[#f3f3f3]"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-label="Cargando"
      >
        <circle
          className="opacity-25"
          cx="12" cy="12" r="10"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v8H4z"
        />
      </svg>
    </div>
  )
}
