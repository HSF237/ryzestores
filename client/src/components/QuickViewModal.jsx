import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart, ShoppingBag, Star, Truck, ShieldCheck, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { reviewService } from '../services/firebaseService'
import { addToRecentlyViewed } from '../utils/recentViewed'
import OptimizedImage from './OptimizedImage'

export default function QuickViewModal({ product, onClose }) {
  const { addToCart } = useCart()
  const { isLiked, toggleWishlist } = useWishlist()
  const [selectedSize, setSelectedSize] = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)
  const [imgIndex, setImgIndex] = useState(0)
  const [added, setAdded] = useState(false)
  const [customizationText, setCustomizationText] = useState('')

  useEffect(() => {
    if (product) {
      addToRecentlyViewed(product)
    }
  }, [product])

  if (!product) return null

  const price = product.discountPrice ?? product.regularPrice ?? product.price ?? 0
  const liked = isLiked(product._id || product.id)
  const images = product.images?.length ? product.images
    : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800']
  const discount = product.regularPrice && product.discountPrice
    ? Math.round(((product.regularPrice - product.discountPrice) / product.regularPrice) * 100)
    : 0

  const handleAddToCart = () => {
    if (product.customizable && !customizationText.trim()) return
    addToCart({
      ...product,
      id: product._id || product.id,
      title: product.retailHeading ?? product.name,
      price,
      image: images[0],
      size: selectedSize ?? product.sizes?.[0] ?? 'One Size',
      color: selectedColor?.name ?? product.colors?.[0]?.name ?? 'Default',
      customization: customizationText.trim() || null,
      supplierLink: product.supplierLink || null,
    })
    setAdded(true)
    setTimeout(() => { setAdded(false); onClose() }, 1000)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/85 backdrop-blur-xl z-[200] flex items-center justify-center p-2 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-[#111112] border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col md:flex-row shadow-2xl shadow-black/50 overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Mobile Top Header (Image + Name + Price) */}
          <div className="flex shrink-0 p-4 sm:p-8 gap-4 border-b border-white/5 md:hidden">
            <div className="w-1/3 aspect-[4/5] rounded-2xl overflow-hidden bg-black/40 border border-white/5 relative">
              <OptimizedImage
                src={images[imgIndex]}
                alt={product.retailHeading ?? product.name}
                width={300}
                quality={70}
                wrapperClassName="w-full h-full"
              />
              {discount > 0 && (
                <div className="absolute top-2 left-0 bg-[#c9a962] text-black text-[7px] font-black px-1.5 py-0.5 uppercase tracking-tight rounded-r-lg">
                  -{discount}%
                </div>
              )}
            </div>
            <div className="flex-1 flex flex-col justify-center min-w-0">
              <div>
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#c9a962]">{product.department}</span>
                <h2 className="font-outfit font-black text-base text-white mt-0.5 leading-tight truncate">
                  {product.retailHeading ?? product.name}
                </h2>
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex gap-0.5">
                  <Star className="w-2.5 h-2.5 fill-[#c9a962] text-[#c9a962]" />
                </div>
                <span className="text-[10px] font-bold text-white">{product.rating ?? '4.6'}</span>
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-base font-outfit font-black text-white">₹{price.toLocaleString()}</span>
                {product.regularPrice && product.discountPrice && (
                  <span className="text-[10px] text-white/30 line-through">₹{product.regularPrice.toLocaleString()}</span>
                )}
              </div>
              <button onClick={onClose} className="absolute top-4 right-4 w-7 h-7 rounded-full bg-black/40 flex items-center justify-center">
                <X className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>

          {/* ── Desktop Left: Image Gallery (Hidden on Mobile Top, visible on Desktop) ── */}
          <div className="hidden md:flex md:w-[48%] shrink-0 relative flex-col bg-black/20">
            {/* Main Image */}
            <div className="relative aspect-[4/5] md:flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                <OptimizedImage
                  key={imgIndex}
                  src={images[imgIndex]}
                  alt={product.retailHeading ?? product.name}
                  width={800}
                  quality={80}
                  wrapperClassName="w-full h-full"
                  className="object-cover"
                />
              </AnimatePresence>

              {/* Discount Badge */}
              {discount > 0 && (
                <div className="absolute top-4 left-0 bg-[#c9a962] text-black text-[9px] font-black px-3 py-1 uppercase tracking-widest rounded-r-full">
                  -{discount}% OFF
                </div>
              )}

              {/* Image Prev/Next */}
              {images.length > 1 && (
                <>
                  <button onClick={() => setImgIndex(i => (i - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-[#c9a962] hover:text-black transition-all">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => setImgIndex(i => (i + 1) % images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-[#c9a962] hover:text-black transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Close Button */}
              <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 flex items-center justify-center hover:bg-white/20 transition-all z-10">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-1.5 p-2 bg-black/20 overflow-x-auto no-scrollbar">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setImgIndex(i)} className={`w-12 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${i === imgIndex ? 'border-[#c9a962]' : 'border-white/10 hover:border-white/30'}`}>
                    <OptimizedImage src={img} width={60} quality={50} wrapperClassName="w-full h-full" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Scrollable Content Area ── */}
          <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar p-6 sm:p-8 gap-6 md:w-[52%]">

            {/* Desktop Only Header Details */}
            <div className="hidden md:block">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#c9a962]">{product.department}</span>
              <h2 className="font-outfit font-black text-2xl text-white mt-1 leading-tight">
                {product.retailHeading ?? product.name}
              </h2>
              <div className="flex items-center gap-3 mt-4">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => {
                    const r = product.rating || 0
                    return <Star key={i} className={`w-4 h-4 ${i < Math.floor(r) ? 'fill-[#c9a962] text-[#c9a962]' : i < r ? 'fill-[#c9a962] text-[#c9a962] opacity-50' : 'text-white/10'}`} />
                  })}
                </div>
                <span className="text-sm font-bold text-white">{product.rating ? Number(product.rating).toFixed(1) : '—'}</span>
                <span className="text-xs text-white/30 font-medium">({product.reviews ?? 0} reviews)</span>
                {product.ordersCount > 0 && (
                  <span className="text-xs text-[#c9a962] font-black ml-auto">{product.ordersCount.toLocaleString()} bought</span>
                )}
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mt-6">
                <div className="flex items-end gap-3">
                  <span className="text-2xl font-outfit font-black text-white">₹{price.toLocaleString()}</span>
                  {product.regularPrice && product.discountPrice && (
                    <span className="text-base text-white/30 line-through font-medium">₹{product.regularPrice.toLocaleString()}</span>
                  )}
                  {discount > 0 && (
                    <span className="text-sm font-black text-green-400 ml-auto">{discount}% off</span>
                  )}
                </div>
              </div>
            </div>

            {/* Color Selector */}
            {product.colors?.length > 0 && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40 mb-3">
                  Colour <span className="text-white ml-2">{selectedColor?.name ?? ''}</span>
                </p>
                <div className="flex gap-3 flex-wrap">
                  {product.colors.map(c => (
                    <button
                      key={c.hex ?? c.name}
                      onClick={() => { setSelectedColor(c); setImgIndex(0) }}
                      title={c.name}
                      className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full border-2 transition-all ${selectedColor?.name === c.name ? 'border-[#c9a962] scale-105 shadow-lg' : 'border-white/20 hover:border-white/50'}`}
                      style={{ backgroundColor: c.hex ?? '#888' }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {product.sizes?.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40">
                    Select Size <span className="text-white ml-2">{selectedSize ?? ''}</span>
                  </p>
                  <button className="text-[9px] font-black uppercase tracking-widest text-[#c9a962] underline">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(s => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`min-w-[40px] sm:min-w-[48px] px-3 h-10 sm:h-12 rounded-xl border text-[10px] sm:text-xs font-black transition-all ${selectedSize === s ? 'border-[#c9a962] bg-[#c9a962] text-black shadow-lg shadow-[#c9a962]/20' : 'border-white/10 bg-white/5 text-white/60 hover:border-[#c9a962]/50 hover:text-white'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}


            {/* Customization Input */}
            {product.customizable && (
              <div className="space-y-2 bg-[#c9a962]/5 border border-[#c9a962]/20 rounded-2xl p-4">
                <p className="text-[10px] font-black text-[#c9a962] uppercase tracking-widest">
                  {product.customizationLabel || 'Enter Customization Details'}
                </p>
                <input
                  type="text"
                  placeholder="e.g. Ankit & Shivani"
                  value={customizationText}
                  onChange={e => setCustomizationText(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:border-[#c9a962]/50 focus:outline-none transition-all"
                />
                {!customizationText.trim() && (
                  <p className="text-[9px] text-red-400/70 font-bold">Required before adding to bag</p>
                )}
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex gap-3 sticky bottom-0 bg-[#111112]/95 backdrop-blur-md pt-4 pb-2 mt-auto md:relative md:bg-transparent md:pt-0">
              <motion.button
                onClick={handleAddToCart}
                disabled={product.customizable && !customizationText.trim()}
                className={`flex-1 h-14 sm:h-16 rounded-2xl font-outfit font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${added ? 'bg-green-500 text-white' : 'bg-[#c9a962] text-black hover:bg-[#b09452]'} shadow-[#c9a962]/20 disabled:opacity-40 disabled:cursor-not-allowed`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <ShoppingBag className="w-5 h-5" />
                {added ? 'Added to Bag! ✓' : 'Add to Bag'}
              </motion.button>

              <motion.button
                onClick={() => toggleWishlist(product)}
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border flex items-center justify-center transition-all ${liked ? 'border-red-500 bg-red-500/10' : 'border-white/10 hover:border-red-400 hover:bg-red-400/10'}`}
                whileTap={{ scale: 0.88 }}
              >
                <Heart className={`w-5 h-5 ${liked ? 'fill-red-500 text-red-500' : 'text-white/60'}`} />
              </motion.button>
            </div>

            {/* Description */}
            {product.longDescription && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40 mb-3">Product Description</p>
                <p className="text-xs sm:text-sm text-white/50 leading-relaxed font-medium">{product.longDescription}</p>
              </div>
            )}

            {/* Delivery Info (Mobile Style) */}
            <div className="space-y-3 bg-white/[0.02] border border-white/5 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <Truck className="w-4 h-4 text-[#c9a962]" />
                <p className="text-[10px] font-black text-white uppercase tracking-tight">
                  {product.deliveryCharge === 0 ? 'FREE ryze Delivery by Tomorrow' : `+ ₹${product.deliveryCharge} Shipping Fee`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-[#c9a962]" />
                <p className="text-[10px] font-black text-white/60 uppercase tracking-tight">100% Genuine Luxury Asset</p>
              </div>
            </div>

            {/* ── Reviews ── */}
            <ReviewsSection productId={product._id || product.id} />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function ReviewsSection({ productId }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    reviewService.getProductReviews(productId)
      .then(data => setReviews(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [productId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const data = await reviewService.createReview({ productId, ...newReview })
      setReviews([data, ...reviews])
      setShowForm(false)
      setNewReview({ rating: 5, comment: '' })
    } catch (err) {
      setError(err?.message || 'Failed to submit review. Verified purchase required.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-8 border-t border-white/5 pt-8">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#c9a962]">Verified Feedback</h4>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors"
        >
          {showForm ? 'Cancel' : 'Leave Review'}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleSubmit}
            className="mb-8 p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4 overflow-hidden"
          >
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map(r => (
                <button
                  key={r} type="button"
                  onClick={() => setNewReview({ ...newReview, rating: r })}
                  className="p-1 focus:outline-none"
                >
                  <Star className={`w-5 h-5 ${r <= newReview.rating ? 'fill-[#c9a962] text-[#c9a962]' : 'text-white/10'}`} />
                </button>
              ))}
            </div>
            <textarea
              required
              placeholder="Share your ryze experience..."
              className="w-full bg-black border border-white/10 rounded-2xl p-4 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#c9a962]/40 min-h-[100px] resize-none"
              value={newReview.comment}
              onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
            />
            {error && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">{error}</p>}
            <button
              disabled={submitting}
              className="w-full py-3 bg-white text-black rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-[#c9a962] disabled:opacity-50 transition-all"
            >
              {submitting ? 'Dispatching...' : 'Secure Feedback'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2].map(i => <div key={i} className="h-20 bg-white/5 rounded-2xl" />)}
          </div>
        ) : reviews.length > 0 ? (
          reviews.map((r, i) => (
            <div key={i} className="group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-[#c9a962]">
                    {r.user?.name?.[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white/80">{r.user?.name}</p>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, idx) => (
                        <Star key={idx} className={`w-2 h-2 ${idx < r.rating ? 'fill-[#c9a962] text-[#c9a962]' : 'text-white/10'}`} />
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-[9px] font-black text-white/20 uppercase">{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-white/40 leading-relaxed italic ml-9">"{r.comment}"</p>
            </div>
          ))
        ) : (
          <p className="text-xs text-center text-white/20 font-medium py-4">No reviews yet. Be the first to verify this asset.</p>
        )}
      </div>
    </div>
  )
}
