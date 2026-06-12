import type { ReactNode } from 'react'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

interface LayoutProps {
  children: ReactNode
  hideFooter?: boolean
}

export function Layout({ children, hideFooter = false }: LayoutProps) {
  return (
    <div className="min-h-[100dvh] bg-one-navy text-one-white">
      <Navbar />
      <main className="pt-[72px]">{children}</main>
      {!hideFooter && <Footer />}
    </div>
  )
}
