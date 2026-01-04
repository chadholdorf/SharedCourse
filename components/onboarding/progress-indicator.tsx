interface ProgressIndicatorProps {
  current: number
  total: number
}

export function ProgressIndicator({ current, total }: ProgressIndicatorProps) {
  return (
    <div className="text-sm text-gray-500 font-medium">
      {current}/{total}
    </div>
  )
}
