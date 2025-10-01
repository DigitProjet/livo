import { ReactNode } from 'react'
import { Header } from './Header/Header'
import { Footer } from './Footer/Footer'

interface AppLayoutProps {
  children: ReactNode
  showHeader?: boolean
  showFooter?: boolean
}

export const AppLayout = ({ 
  children, 
  showHeader = true, 
  showFooter = true 
}: AppLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      {showHeader && <Header />}
      <main className="flex-grow">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  )
}