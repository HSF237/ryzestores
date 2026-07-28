import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Menu, Search, Heart, User, ChevronLeft, MapPin, LogOut, X } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'

const NAV_LINKS = [
  { label: 'Shop All', href: '/shop', isRoute: true },
  { label: "Today's Deals", href: '/shop?filter=deals', isRoute: true },
  { label: 'Footwear', href: '/shop?category=Footwear', isRoute: true },
  { label: 'Apparel', href: '/shop?category=Apparel', isRoute: true },
  { label: 'Electronics', href: '/shop?category=Electronics', isRoute: true },
  { label: 'Beauty', href: '/shop?category=Beauty', isRoute: true },
]

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === '/'
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { openCart, count } = useCart()
  const { count: wishlistCount } = useWishlist()
  const { user, logout } = useAuth()
  
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-[#0a0a0b]/95 backdrop-blur-2xl px-4 ${
        scrolled ? 'border-b border-white/10' : 'border-transparent'
      }`}
    >
      <div className="max-w-[1440px] mx-auto">
        {/* Main Navigation Row */}
        <div className="flex items-center gap-6 h-14 sm:h-16">
          {/* Back Button Strategy */}
          {!isHome && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => navigate(-1)}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all group shrink-0"
            >
              <ChevronLeft className="w-5 h-5 text-[#c9a962] group-hover:-translate-x-0.5 transition-transform" />
            </motion.button>
          )}

          {/* Section 1: Brand & Identity */}
          <div className="flex items-center gap-4 shrink-0">
             <Link to="/" className="font-outfit font-black text-xl sm:text-2xl tracking-tighter text-white flex items-center gap-2.5 group" aria-label="RYZE home">
               {/* Brand mark — RYZE R monogram (transparent PNG) */}
               <img
                 src="/mylogo.png"
                 alt=""
                 aria-hidden="true"
                 className="w-9 h-9 sm:w-11 sm:h-11 object-contain shrink-0 group-hover:scale-105 transition-transform"
               />
               <span className="hidden lg:inline">RY<span className="text-[#c9a962]">ZE</span></span>
             </Link>

             {/* Location Pulse (Desktop Only) */}
             <div className="hidden lg:flex items-center gap-2 text-white/50 hover:text-white cursor-pointer transition-all px-3 py-1.5 rounded-xl border border-white/5 bg-white/5 group">
                <MapPin className="w-4 h-4 group-hover:text-[#c9a962] transition-colors" />
                <div className="flex flex-col">
                   <span className="text-[8px] uppercase tracking-widest font-black leading-none opacity-50">Pulse</span>
                   <span className="text-xs font-bold leading-none mt-1">India</span>
                </div>
             </div>
          </div>

          {/* Section 2: Smart Search Architecture */}
          <div className="flex flex-1 justify-center max-w-2xl px-1 sm:px-2">
             <form 
                onSubmit={(e) => {
                  e.preventDefault()
                  if (searchQuery.trim()) navigate(`/shop?q=${encodeURIComponent(searchQuery)}`)
                }}
                className="w-full flex rounded-xl overflow-hidden glass border border-white/10 focus-within:ring-2 focus-within:ring-[#c9a962]/30 transition-all h-9 sm:h-10 group"
             >
                <div className="hidden xs:flex items-center pl-3 sm:pl-4 pr-1 text-white/20 group-focus-within:text-[#c9a962]">
                   <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <input 
                  type="text" 
                  placeholder="Search RYZE..."
                  className="flex-1 bg-transparent px-3 text-xs font-medium text-white focus:outline-none placeholder:text-white/30 min-w-0"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="bg-[#c9a962] px-3 sm:px-5 flex items-center justify-center hover:bg-[#b59858] transition-colors shrink-0">
                   <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" />
                </button>
             </form>
          </div>

          {/* Section 3: User Commands & Bag */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto sm:ml-0">
             <Link to="/wishlist" className="relative p-2.5 hover:bg-white/5 rounded-xl transition-all group">
               <Heart className={`w-5 h-5 ${wishlistCount > 0 ? 'fill-red-500 text-red-500' : 'text-white/40 group-hover:text-red-400'}`} />
               {wishlistCount > 0 && <span className="absolute top-2 right-2 min-w-[14px] h-[14px] rounded-full bg-red-500 text-[8px] font-black flex items-center justify-center">{wishlistCount}</span>}
             </Link>
             
             <button onClick={openCart} className="relative p-2.5 hover:bg-white/5 rounded-xl transition-all group">
               <ShoppingBag className="w-5 h-5 text-white/40 group-hover:text-[#c9a962]" />
               {count > 0 && <span className="absolute top-2 right-2 min-w-[14px] h-[14px] rounded-full bg-[#c9a962] text-[8px] font-black text-black flex items-center justify-center">{count}</span>}
             </button>

             <div className="h-6 w-px bg-white/5 mx-1 hidden sm:block" />

             {user && (
                <Link to="/orders" className="hidden md:flex flex-col items-start px-3 py-1 hover:bg-white/5 rounded-xl transition-all group border border-transparent hover:border-white/10">
                   <span className="text-[9px] font-black text-white/40 uppercase leading-none">Returns</span>
                   <span className="text-xs font-bold text-white group-hover:text-[#c9a962] transition-colors leading-none mt-1">& Orders</span>
                </Link>
             )}

             {user ? (
               <Link to="/profile" className="flex items-center gap-2 group p-1 sm:p-1.5 rounded-xl hover:bg-white/5 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-[#c9a962] flex items-center justify-center font-black text-xs text-black uppercase shadow-lg shadow-[#c9a962]/10">{user.name?.[0]}</div>
                  <div className="hidden md:flex flex-col items-start pr-2">
                     <span className="text-[10px] font-black text-white/40 uppercase leading-none italic">{user.role === 'admin' ? 'Architect' : 'Member'}</span>
                     <span className="text-xs font-bold text-white leading-none mt-1">{user.name?.split(' ')[0]}</span>
                  </div>
               </Link>
             ) : (
               <Link to="/login" className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all group">
                 <User className="w-4 h-4 text-white/40 group-hover:text-[#c9a962]" />
                 <span className="hidden md:inline text-[10px] font-black text-white uppercase tracking-widest">Entry</span>
               </Link>
             )}

          </div>
        </div>
      </div>
    </motion.header>
  )
}
