interface TileCardProps {
  label: string
  selected: boolean
  onClick: () => void
  multiSelect?: boolean
}

export function TileCard({ label, selected, onClick, multiSelect = false }: TileCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full px-6 py-4 text-left border-2 rounded-lg transition-all
        ${
          selected
            ? 'border-gray-900 bg-gray-50'
            : 'border-gray-200 bg-white hover:border-gray-300'
        }
      `}
    >
      <div className="flex items-center justify-between">
        <span className="text-base font-medium text-gray-900">{label}</span>
        {multiSelect && (
          <div
            className={`
            w-5 h-5 border-2 rounded flex items-center justify-center
            ${selected ? 'border-gray-900 bg-gray-900' : 'border-gray-300'}
          `}
          >
            {selected && (
              <svg
                className="w-3 h-3 text-white"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7"></path>
              </svg>
            )}
          </div>
        )}
      </div>
    </button>
  )
}
