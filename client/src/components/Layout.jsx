import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import CartSidebar from './CartSidebar'
import Footer from './Footer'

export default function Layout() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16 sm:pt-20 pb-20">
        <Outlet />
      </main>
      <Footer />
      <CartSidebar />
    </>
  )
}
