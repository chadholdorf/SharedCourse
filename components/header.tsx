import Link from 'next/link'
import { OverflowMenu } from './overflow-menu'

export function Header() {
  return (
    <header className="border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-lg font-semibold text-gray-900 tracking-tight">
            BASC
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden sm:flex items-center gap-6">
            <Link
              href="/request"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Compendium
            </Link>
            <Link
              href="/membership"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-gray-900 border border-transparent rounded-md hover:bg-gray-800 transition-colors"
            >
              Become a Member
            </Link>
            <OverflowMenu />
          </nav>

          {/* Mobile Nav */}
          <div className="sm:hidden flex items-center gap-3">
            <Link
              href="/membership"
              className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-white bg-gray-900 border border-transparent rounded-md"
            >
              Join
            </Link>
            <OverflowMenu />
          </div>
        </div>
      </div>
    </header>
  )
}
