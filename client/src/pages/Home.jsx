import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { Heart, ChevronLeft, ChevronRight } from 'lucide-react'
import { productService } from '../services/firebaseService'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'
import QuickViewModal from '../components/QuickViewModal'
import OptimizedImage from '../components/OptimizedImage'
import { HERO_SLIDES, CATEGORIES, ryze_DROPS } from '../data/mockProducts'
import { getRecentlyViewed } from '../utils/recentViewed'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
}

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
}

const MARQUEE_CATEGORIES = [...CATEGORIES, ...CATEGORIES]

export default function Home() {
  const navigate = useNavigate()
  const [heroIndex, setHeroIndex] = useState(0)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [quickViewProduct, setQuickViewProduct] = useState(null)
  const { addToCart } = useCart()
  const { isLiked, toggleWishlist } = useWishlist()
  const { user } = useAuth()

  // Fetch live products for store displays
  useEffect(() => {
    productService.getProducts()
      .then(res => {
        setProducts(res.products?.length > 0 ? res.products : ryze_DROPS)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch products:', err)
        setProducts(ryze_DROPS)
        setLoading(false)
      })
  }, [])

  // Hero auto-play
  useEffect(() => {
    const t = setInterval(() => {
      setHeroIndex((i) => (i + 1) % HERO_SLIDES.length)
    }, 5000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0b] overflow-x-hidden pt-0">
      {/* Premium Notification Bar */}
      <div className="bg-gradient-to-r from-[#c9a962] to-[#b09452] text-black py-1.5 px-4 overflow-hidden hidden sm:block mb-2">
        <motion.div
          animate={{ x: [-1000, 1000] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="whitespace-nowrap flex gap-12 font-black text-[10px] uppercase tracking-[0.3em]"
        >
          <span>✨ Selected items on sale — real prices shown on every product</span>
          <span>🚀 Free shipping on eligible orders</span>
          <span>💎 Create a free account for faster checkout</span>
          <span>⚡ New arrivals added regularly</span>
        </motion.div>
      </div>

      {/* ——— Continuous Auto-Sliding Category Icon Strip ——— */}
      <section className="py-3 bg-[#0d0d0f]/90 border-y border-white/5 relative z-40 overflow-hidden mb-4 sm:mb-6">
        <div className="flex overflow-hidden">
          <motion.div
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
            className="flex items-center gap-8 sm:gap-14 min-w-max px-4"
          >
            {MARQUEE_CATEGORIES.map((cat, idx) => (
              <motion.div
                key={`${cat.id}-${idx}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center gap-2 group cursor-pointer shrink-0"
                onClick={() => navigate(`/shop?category=${cat.slug}`)}
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0.5 bg-gradient-to-tr from-[#c9a962]/50 to-transparent group-hover:from-[#c9a962] transition-all duration-300 shadow-xl">
                  <div className="w-full h-full rounded-full overflow-hidden border-2 border-[#111113] bg-[#1a1a1c]">
                    <OptimizedImage
                      src={cat.image}
                      alt={cat.label}
                      width={120}
                      quality={70}
                      wrapperClassName="w-full h-full"
                      className="group-hover:scale-110 transition-transform duration-500 object-cover"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=120&q=70' }}
                    />
                  </div>
                </div>
                <span className="text-[9px] sm:text-[10px] font-black text-white/50 group-hover:text-[#c9a962] uppercase tracking-[0.15em] transition-colors">
                  {cat.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ——— Compact Amazon/Flipkart Promo Hero Banner ——— */}
      <section className="max-w-7xl mx-auto px-4 mb-6 sm:mb-8">
        <div className="relative h-48 sm:h-64 md:h-80 rounded-2xl sm:rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-[#111113]">
          <AnimatePresence mode="wait">
            {HERO_SLIDES.map((slide, i) =>
              i === heroIndex ? (
                <motion.div
                  key={slide.id}
                  initial={{ opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.01 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 flex items-center"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent z-10" />
                  <OptimizedImage
                    src={slide.image}
                    alt={slide.title}
                    priority={true}
                    width={1400}
                    quality={70}
                    wrapperClassName="w-full h-full absolute inset-0"
                  />
                  <div className="relative z-20 px-6 sm:px-12 max-w-2xl text-left">
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="font-jakarta text-[#c9a962] text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] mb-1 sm:mb-2"
                    >
                      {slide.subtitle}
                    </motion.p>
                    <motion.h1
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                      className="font-outfit font-black text-xl sm:text-3xl md:text-5xl text-white leading-tight uppercase tracking-tight mb-4"
                    >
                      {slide.title}
                    </motion.h1>
                    <button
                      onClick={() => navigate('/shop')}
                      className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-7 sm:py-3 rounded-xl sm:rounded-2xl bg-[#c9a962] hover:bg-[#b09452] text-black font-outfit font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-[#c9a962]/20 hover:scale-105"
                    >
                      {slide.cta} <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ) : null
            )}
          </AnimatePresence>

          {/* Navigation Controls */}
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => setHeroIndex((i) => (i - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/80 backdrop-blur-md flex items-center justify-center text-white transition-all border border-white/10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => setHeroIndex((i) => (i + 1) % HERO_SLIDES.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/80 backdrop-blur-md flex items-center justify-center text-white transition-all border border-white/10"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 right-6 z-30 flex gap-1.5">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setHeroIndex(i)}
                className={`h-1.5 rounded-full transition-all ${i === heroIndex ? 'bg-[#c9a962] w-5' : 'bg-white/30 hover:bg-white/50 w-1.5'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ——— Specialized Grid Cards (Amazon style: 2x2 on mobile, 4-col on desktop) ——— */}
      <section className="py-4 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {/* Card 1: Today's Deals / Under 999 */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#1a1a1c] p-3.5 sm:p-6 rounded-2xl sm:rounded-[2.5rem] border border-white/5 flex flex-col justify-between group cursor-pointer hover:border-[#c9a962]/30 transition-all shadow-xl relative overflow-hidden"
            onClick={() => navigate('/shop?filter=deals')}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#c9a962]/10 blur-2xl -mr-12 -mt-12" />
            <div>
              <h3 className="font-outfit font-black text-xs sm:text-lg mb-0.5 text-white uppercase tracking-tighter line-clamp-1">Today's Deals</h3>
              <p className="text-[7px] sm:text-[9px] text-[#c9a962] mb-2 sm:mb-3 font-black uppercase tracking-wider">Under ₹999 Essentials</p>
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2.5">
                {(products.length > 0 ? products : ryze_DROPS).slice(0, 4).map((p, i) => (
                  <div
                    key={p._id || p.id || i}
                    className="aspect-square rounded-lg sm:rounded-xl overflow-hidden bg-[#111113] border border-white/5 relative group/thumb"
                    onClick={(e) => { e.stopPropagation(); setQuickViewProduct(p); }}
                  >
                    <OptimizedImage
                      src={p.images?.[0] || p.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff'}
                      alt={p.retailHeading || p.name}
                      width={200}
                      quality={70}
                      wrapperClassName="w-full h-full"
                      className="group-hover/thumb:scale-110 transition-transform duration-500 object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-3 sm:mt-4 flex items-center justify-between">
              <span className="text-[8px] sm:text-[10px] font-black text-[#c9a962] uppercase tracking-wider">Shop All</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#c9a962] group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>

          {/* Card 2: Home Revamp / Smart Interior */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-[#1a1a1c] p-3.5 sm:p-6 rounded-2xl sm:rounded-[2.5rem] border border-white/5 flex flex-col justify-between group cursor-pointer hover:border-[#c9a962]/30 transition-all shadow-xl"
            onClick={() => navigate('/shop?category=Home')}
          >
            <div>
              <h3 className="font-outfit font-black text-xs sm:text-lg mb-0.5 text-white uppercase tracking-tighter line-clamp-1">ryze Spaces</h3>
              <p className="text-[7px] sm:text-[9px] text-[#c9a962] mb-2 sm:mb-3 font-black uppercase tracking-wider">Smart Interior</p>
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2.5">
                {(() => {
                  const all = products.length > 0 ? products : ryze_DROPS
                  const homeP = all.filter(p => p.category?.toLowerCase() === 'home' || p.department?.toLowerCase() === 'home')
                  const list = (homeP.length >= 4 ? homeP : [...homeP, ...all]).slice(0, 4)
                  return list.map((p, i) => (
                    <div
                      key={p._id || p.id || i}
                      className="aspect-square rounded-lg sm:rounded-xl overflow-hidden bg-[#111113] border border-white/5 relative group/thumb"
                      onClick={(e) => { e.stopPropagation(); setQuickViewProduct(p); }}
                    >
                      <OptimizedImage
                        src={p.images?.[0] || p.image || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38'}
                        alt={p.retailHeading || p.name}
                        width={200}
                        quality={70}
                        wrapperClassName="w-full h-full"
                        className="group-hover/thumb:scale-110 transition-transform duration-500 object-cover"
                      />
                    </div>
                  ))
                })()}
              </div>
            </div>
            <div className="mt-3 sm:mt-4 flex items-center justify-between">
              <span className="text-[8px] sm:text-[10px] font-black text-[#c9a962] uppercase tracking-wider">Designs</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#c9a962] group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>

          {/* Card 3: Top Deals */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-[#1a1a1c] p-3.5 sm:p-6 rounded-2xl sm:rounded-[2.5rem] border border-white/10 flex flex-col justify-between group cursor-pointer hover:border-[#c9a962]/30 transition-all shadow-xl relative overflow-hidden"
            onClick={() => navigate('/shop?filter=deals')}
          >
            <div className="absolute top-2 right-2 z-10">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            </div>
            <div>
              <h3 className="font-outfit font-black text-xs sm:text-lg mb-0.5 text-white uppercase tracking-tighter line-clamp-1">Top Deals</h3>
              <p className="text-[7px] sm:text-[9px] mb-2 sm:mb-3 font-black uppercase tracking-wider text-[#c9a962]">Best Prices</p>
              {(() => {
                const p = (products.length > 0 ? products : ryze_DROPS)[0]
                return (
                  <div
                    className="relative aspect-video rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 group/thumb"
                    onClick={(e) => { e.stopPropagation(); setQuickViewProduct(p); }}
                  >
                    <OptimizedImage
                      src={p.images?.[0] || p.image || 'https://images.unsplash.com/photo-1549439602-43ebca2327af'}
                      alt={p.retailHeading || p.name}
                      width={400}
                      quality={70}
                      wrapperClassName="w-full h-full"
                      className="group-hover/thumb:scale-110 transition-transform duration-700 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-white font-black text-[8px] sm:text-[10px] uppercase tracking-widest bg-[#c9a962]/40 backdrop-blur-md px-2.5 py-1 rounded-full">On Sale</span>
                    </div>
                  </div>
                )
              })()}
            </div>
            <div className="mt-3 sm:mt-4 flex items-center justify-between">
              <span className="text-[8px] sm:text-[10px] font-black text-[#c9a962] uppercase tracking-wider">Unlock Deals</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#c9a962] group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>

          {/* Card 4: Sign in / Personalization */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-[#c9a962] to-[#b09452] p-3.5 sm:p-6 rounded-2xl sm:rounded-[2.5rem] flex flex-col justify-between"
          >
            {user ? (
              <>
                <div>
                  <span className="text-[7px] sm:text-[9px] text-black/60 font-black uppercase tracking-[0.2em]">Signed In</span>
                  <h3 className="font-outfit font-black text-xs sm:text-lg text-black leading-tight mt-0.5 mb-0.5 uppercase tracking-tighter line-clamp-1">
                    {user.name || 'Architect'}
                  </h3>
                  <p className="text-[8px] sm:text-[9px] text-black/70 font-bold uppercase tracking-wide truncate">{user.email}</p>
                </div>
                <div className="space-y-2 mt-3 sm:mt-4">
                  <button
                    onClick={() => navigate('/orders')}
                    className="w-full bg-black text-white py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-xs uppercase tracking-wider hover:scale-105 transition-all shadow-lg shadow-black/20 flex items-center justify-center gap-1"
                  >
                    View Orders
                  </button>
                  <button
                    onClick={() => navigate('/profile')}
                    className="w-full bg-white/20 backdrop-blur-md text-black border border-black/10 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-xs uppercase tracking-wider hover:bg-white/30 transition-all"
                  >
                    Settings
                  </button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h3 className="font-outfit font-black text-xs sm:text-lg text-black leading-none mb-1 uppercase tracking-tighter line-clamp-1">ryze Profile</h3>
                  <p className="text-[7px] sm:text-[9px] text-black/70 font-bold uppercase tracking-wide">Sign in for exclusive drops.</p>
                </div>
                <div className="space-y-2 mt-3 sm:mt-4">
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full bg-black text-white py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-xs uppercase tracking-wider hover:scale-105 transition-all shadow-lg shadow-black/20"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate('/signup')}
                    className="w-full bg-white/20 backdrop-blur-md text-black border border-black/10 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-xs uppercase tracking-wider hover:bg-white/30 transition-all"
                  >
                    New Account
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </section>

      {/* ——— Big Value Banner ——— */}
      <section className="py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto rounded-3xl overflow-hidden relative group">
          <OptimizedImage src="https://images.unsplash.com/photo-1441986300917-64674bd600d8" width={1600} quality={75} wrapperClassName="w-full h-[250px] sm:h-[300px]" className="group-hover:scale-105 transition-transform duration-1000" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 sm:via-black/50 to-transparent flex flex-col justify-center px-6 sm:px-16">
            <span className="text-[#c9a962] font-black tracking-[0.2em] sm:tracking-[0.3em] text-[10px] sm:text-sm uppercase mb-3 sm:mb-4">Featured</span>
            <h2 className="text-3xl sm:text-6xl font-outfit font-black text-white max-w-lg leading-tight sm:leading-none mb-6">EXPLORE THE COLLECTION</h2>
            <button
              onClick={() => navigate('/shop')}
              className="bg-white text-black font-black px-8 py-3 sm:px-10 sm:py-4 rounded-full text-[10px] sm:text-xs uppercase tracking-widest hover:bg-[#c9a962] transition-colors self-start shadow-2xl"
            >
              Grab The Offer
            </button>
          </div>
        </div>
      </section>

      {/* ——— ryze Drops Product Grid ——— */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <h2 className="font-outfit font-black text-xl sm:text-2xl text-white uppercase tracking-tighter">ryze Drops</h2>
              <p className="text-[8px] sm:text-[9px] text-[#c9a962] font-black tracking-[0.2em] sm:tracking-[0.4em] uppercase mt-1">Newest arrivals</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="aspect-[4/5] rounded-[2.5rem] bg-white/5 animate-pulse" />
              ))
            ) : (
              products.map((product) => (
                <motion.div
                  key={product._id}
                  layoutId={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="group cursor-pointer"
                  onClick={() => setQuickViewProduct(product)}
                >
                  <div className="bg-white/[0.02] rounded-2xl overflow-hidden border border-white/5 group-hover:border-[#c9a962]/30 transition-all flex flex-col h-full shadow-lg relative">
                    <div className="aspect-square relative overflow-hidden">
                      <OptimizedImage
                        src={product.images?.[0] || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400'}
                        alt={product.retailHeading}
                        width={400}
                        quality={70}
                        wrapperClassName="w-full h-full"
                        className="group-hover:scale-110 transition-transform duration-700"
                      />
                      {/* Wishlist Heart */}
                      <button
                        onClick={e => { e.stopPropagation(); toggleWishlist(product) }}
                        className="absolute top-2 right-2 w-8 h-8 rounded-lg glass flex items-center justify-center hover:bg-[#c9a962] hover:text-black transition-all z-20"
                      >
                        <Heart className={`w-4 h-4 ${isLiked(product._id || product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setQuickViewProduct(product);
                        }}
                        className="absolute bottom-1 right-1 w-7 h-7 bg-[#c9a962] hover:bg-[#b09452] text-black rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 shadow-black/50 z-20"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                      </button>
                    </div>

                    <div className="p-2.5 sm:p-4 flex flex-col flex-1">
                      <h4 className="text-white font-bold text-xs sm:text-sm leading-tight line-clamp-2 mb-1 group-hover:text-[#c9a962] transition-colors">{product.retailHeading}</h4>
                      <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">{product.category}</p>

                      <div className="mt-auto flex items-baseline gap-2">
                        {product.regularPrice > product.discountPrice && (
                          <span className="bg-[#cc0c39] text-white font-bold text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded shadow-sm">
                            -{Math.round(((product.regularPrice - product.discountPrice) / product.regularPrice) * 100)}%
                          </span>
                        )}
                        <span className="text-sm sm:text-xl font-outfit font-black text-white tracking-tighter">
                          <span className="text-[10px] sm:text-xs mr-0.5">₹</span>{product.discountPrice?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={() => navigate('/shop')}
              className="group relative px-8 py-3 bg-[#c9a962] rounded-xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-[#c9a962]/20"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <span className="relative font-outfit font-black text-black text-[10px] sm:text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                Explore Marketplace <ChevronRight className="w-4 h-4" />
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* ——— Recently Viewed Section ——— */}
      {getRecentlyViewed().length > 0 && (
        <section className="py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-outfit font-black text-xl text-white uppercase tracking-tighter">Recently Viewed</h2>
                <p className="text-[8px] text-[#c9a962] font-black tracking-[0.4em] uppercase mt-1">Pick up right where you left off</p>
              </div>
              <button
                onClick={() => localStorage.removeItem('ryze_recently_viewed')}
                className="text-[10px] font-black uppercase text-white/20 hover:text-red-500 transition-colors"
              >
                Clear History
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-6">
              {getRecentlyViewed().map((product, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="group cursor-pointer"
                  onClick={() => setQuickViewProduct(product)}
                >
                  <div className="bg-white/[0.02] rounded-2xl overflow-hidden border border-white/5 group-hover:border-[#c9a962]/30 transition-all shadow-lg flex flex-col h-full">
                    <div className="aspect-square relative overflow-hidden">
                      <OptimizedImage src={product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400'} width={400} quality={70} wrapperClassName="w-full h-full" className="group-hover:scale-110 transition-transform duration-700" />
                      <button
                        onClick={e => { e.stopPropagation(); setQuickViewProduct(product); }}
                        className="absolute bottom-2 right-2 w-8 h-8 sm:w-10 sm:h-10 bg-white/10 hover:bg-[#c9a962] text-white hover:text-black rounded-full flex items-center justify-center shadow-lg transition-all z-20 backdrop-blur-md"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                      </button>
                    </div>
                    <div className="p-2.5 sm:p-4 flex-1 flex flex-col">
                      <h4 className="text-white font-bold leading-tight line-clamp-2 text-[11px] sm:text-sm mb-1 group-hover:text-[#c9a962] transition-colors">{product.name || product.title}</h4>
                      <div className="mt-auto">
                        <p className="text-[#c9a962] font-black text-[9px] uppercase tracking-[0.2em] mt-2">Recently Viewed</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ——— Promotional Shop All Call-to-Action ——— */}
      <section className="py-12 px-4 text-center border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-[#c9a962]/50 to-transparent" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="font-outfit font-black text-2xl sm:text-3xl text-white mb-3 uppercase tracking-tighter">Ready to Upgrade?</h2>
          <p className="text-white/40 mb-6 text-[10px] sm:text-xs max-w-sm mx-auto font-medium">Browse our full collection of everyday lifestyle essentials.</p>
          <button
            onClick={() => navigate('/shop')}
            className="group px-8 py-3 bg-[#c9a962] rounded-xl text-black font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl"
          >
            Explore Now
          </button>
        </motion.div>
      </section>

      {/* ——— ryze Trust Section ——— */}
      <section className="py-12 px-4 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Chosen With Care', desc: 'Products selected with care, at fair and honest prices.', icon: '💎' },
            { title: 'Secure Checkout', desc: 'Your account and details are protected with trusted sign-in.', icon: '🛡️' },
            { title: 'Worldwide Shipping', desc: 'Reliable delivery with tracking on every order.', icon: '🚀' },
          ].map((trust, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center text-center"
            >
              <div className="text-2xl mb-2">{trust.icon}</div>
              <h4 className="font-outfit font-bold text-sm text-white mb-1">{trust.title}</h4>
              <p className="text-[10px] text-white/40 leading-relaxed font-medium">{trust.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ——— Quick View Modal ——— */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  )
}
