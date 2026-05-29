'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin')

  return (
    <>
      {!isAdmin && <Header />}
      <main className={`flex-1 ${isAdmin ? '' : 'pt-20'}`}>{children}</main>
      {!isAdmin && <Footer />}
    </>
  )
}
