import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Heart, ShoppingBag, Trash2, ArrowRight, Star } from 'lucide-react'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import OptimizedImage from '../components/OptimizedImage'

export default function Wishlist() {
  const navigate = useNavigate()
  const { wishlistItems, toggleWishlist } = useWishlist()
  const { addToCart } = useCart()

  const handleMoveToCart = (item) => {
    addToCart({
      ...item,
      id: item._id || item.id,
      title: item.retailHeading || item.name || item.title,
      price: item.discountPrice || item.regularPrice || item.price,
      size: item.sizes?.[0] || 'One Size',
      color: item.colors?.[0]?.name || 'Default',
      qty: 1,
      image: item.images?.[0] || item.image
    })
    toggleWishlist(item)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white pt-32 pb-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-[#c9a962]/10 flex items-center justify-center border border-[#c9a962]/20">
                <Heart className="w-5 h-5 text-[#c9a962]" />
              </div>
              <h1 className="font-outfit font-black text-4xl sm:text-5xl uppercase tracking-tighter">
                The <span className="text-[#c9a962]">Vault</span>
              </h1>
            </div>
            <p className="text-white/40 font-jakarta text-sm sm:text-base max-w-lg">
              Curate your ryze collection. Secure your favorites before they disappear from the marketplace.
            </p>
          </div>
          <div className="glass px-6 py-3 rounded-2xl border border-white/5 flex items-center gap-4">
            <span className="text-[10px] uppercase font-black tracking-widest text-[#c9a962]">{wishlistItems.length} Saved</span>
          </div>
        </header>

        <AnimatePresence mode="popLayout">
          {wishlistItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-32 text-center"
            >
              <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10 group animate-pulse">
                <ShoppingBag className="w-10 h-10 text-white/20 group-hover:text-[#c9a962] transition-colors" />
              </div>
              <h2 className="text-2xl font-outfit font-black mb-2 uppercase tracking-tight">Your Vault is Empty</h2>
              <p className="text-white/30 text-sm max-w-xs mx-auto mb-8">
                Explore the latest drops and build your exclusive collection today.
              </p>
              <button
                onClick={() => navigate('/shop')}
                className="bg-[#c9a962] text-black font-black px-10 py-4 rounded-2xl uppercase text-xs tracking-[0.2em] transform transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-[#c9a962]/30"
              >
                Enter Marketplace
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistItems.map((product) => {
                const price = product.discountPrice || product.regularPrice || product.price || 0
                return (
                  <motion.div
                    key={product._id || product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group relative bg-[#111113] rounded-[2.5rem] border border-white/5 overflow-hidden hover:border-[#c9a962]/30 transition-all flex flex-col h-full shadow-2xl"
                  >
                    {/* Action Hover Overlay */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-10 flex flex-col items-center justify-center gap-4 p-8 text-center translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <button
                        onClick={() => handleMoveToCart(product)}
                        className="w-full py-4 bg-[#c9a962] text-black font-black rounded-2xl text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
                      >
                        Shift to Bag
                      </button>
                      <button
                        onClick={() => toggleWishlist(product)}
                        className="w-full py-4 bg-white/5 text-red-500 border border-red-500/30 font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-red-500/10 transition-all"
                      >
                        Remove from Vault
                      </button>
                    </div>

                    <div className="aspect-[4/5] relative overflow-hidden bg-white/5">
                      <OptimizedImage
                        src={product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400'}
                        alt={product.retailHeading || product.name}
                        width={400}
                        quality={70}
                        wrapperClassName="w-full h-full"
                        className="group-hover:scale-110 transition-transform duration-700 opacity-80"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111113] via-transparent to-transparent" />
                    </div>

                    <div className="p-6 flex flex-col flex-1 relative z-20">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex text-[#c9a962]">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < 4 ? 'fill-current' : 'text-white/10'}`} />
                          ))}
                        </div>
                        <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">Premium Choice</span>
                      </div>

                      <h3 className="font-outfit font-bold text-lg text-white mb-2 leading-tight">
                        {product.retailHeading || product.name || product.title}
                      </h3>

                      <div className="mt-auto flex items-center justify-between">
                        <span className="text-xl font-outfit font-black text-[#c9a962]">
                          ₹{price.toLocaleString()}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-white/40 uppercase tracking-tighter cursor-pointer hover:text-white transition-colors">
                          View Details <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
