'use client'

import { useFormStatus } from 'react-dom'

interface SubmitButtonProps {
  children: React.ReactNode
  loadingText?: string
  className?: string
}

export function SubmitButton({
  children,
  loadingText = 'Submitting...',
  className = ''
}: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className={`
        px-6 py-3 rounded-lg font-semibold
        bg-indigo-600 text-white
        hover:bg-indigo-700
        disabled:bg-gray-400 disabled:cursor-not-allowed
        transition-colors
        ${className}
      `.trim()}
    >
      {pending ? loadingText : children}
    </button>
  )
}
