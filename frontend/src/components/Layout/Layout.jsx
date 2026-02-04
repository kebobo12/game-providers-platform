import { Header } from './Header'
import { Footer } from './Footer'

export function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <Header />
      <main className="flex-1">
        <div className="max-w-[1400px] mx-auto px-4 py-6">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  )
}
