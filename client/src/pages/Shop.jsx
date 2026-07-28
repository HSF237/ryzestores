import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, ChevronDown, Star, Heart, ShoppingBag, X, Search, SlidersHorizontal, Check, Plus } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { productService } from '../services/firebaseService'
import { ryze_DROPS } from '../data/mockProducts'
import QuickViewModal from '../components/QuickViewModal'
import OptimizedImage from '../components/OptimizedImage'

const BRANDS = ['ryze Collection', 'Aura Luxury', 'Phantom Tech', 'Luxe Wear', 'Precision']
const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', '8', '9', '10', '11']
const ALL_CATEGORIES = ['All', 'Electronics', 'Accessories', 'Footwear', 'Home']
const SORT_OPTIONS = [
  { label: 'Featured', value: 'featured' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Top Rated', value: 'rating' },
  { label: 'Newest First', value: 'newest' },
]

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-white/5 pb-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full mb-4 group"
      >
        <h4 className="text-xs font-black text-[#c9a962] uppercase tracking-[0.2em]">{title}</h4>
        <ChevronDown className={`w-4 h-4 text-white/30 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const [quickViewProduct, setQuickViewProduct] = useState(null)
  const [sortBy, setSortBy] = useState('featured')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters state
  const [priceMax, setPriceMax] = useState(100000)
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All')
  const [selectedBrands, setSelectedBrands] = useState([])
  const [selectedSizes, setSelectedSizes] = useState([])
  const [minRating, setMinRating] = useState(0)
  const [freeDelivery, setFreeDelivery] = useState(false)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')

  const [isDealsOnly, setIsDealsOnly] = useState(searchParams.get('filter') === 'deals')

  const { addToCart } = useCart()
  const { isLiked, toggleWishlist } = useWishlist()

  // Sync with URL params
  useEffect(() => {
    const q = searchParams.get('q') || ''
    const cat = searchParams.get('category') || 'All'
    const deals = searchParams.get('filter') === 'deals'

    setSearchQuery(q)
    setSelectedCategory(cat)
    setIsDealsOnly(deals)
  }, [searchParams])

  // Fetch live products
  useEffect(() => {
    productService.getProducts({ limit: 100 })
      .then(res => {
        setProducts(res.products?.length > 0 ? res.products : ryze_DROPS)
        setLoading(false)
      })
      .catch(err => {
        console.error('Fetch error:', err)
        setLoading(false)
      })
  }, [])

  const toggleBrand = (b) => setSelectedBrands(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b])
  const toggleSize = (s) => setSelectedSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  const resetAllFilters = () => {
    setPriceMax(100000); setSelectedCategory('All'); setSelectedBrands([])
    setSelectedSizes([]); setMinRating(0); setFreeDelivery(false); setSearchQuery('')
  }

  const filtered = useMemo(() => {
    let result = [...products]
    const price = (p) => p.discountPrice ?? p.regularPrice ?? 0

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(p =>
        p.retailHeading?.toLowerCase().includes(q) ||
        p.searchKeywords?.some(k => k.toLowerCase().includes(q))
      )
    }
    if (selectedCategory !== 'All') {
      result = result.filter(p =>
        p.category?.toLowerCase() === selectedCategory.toLowerCase() ||
        p.department?.toLowerCase() === selectedCategory.toLowerCase()
      )
    }

    if (isDealsOnly) {
      result = result.filter(p => p.regularPrice > p.discountPrice)
    }

    result = result.filter(p => price(p) <= priceMax)
    if (freeDelivery) result = result.filter(p => p.deliveryCharge === 0)
    if (selectedSizes.length) result = result.filter(p => p.sizes?.some(s => selectedSizes.includes(s)))
    if (minRating > 0) result = result.filter(p => (p.rating ?? 0) >= minRating)

    switch (sortBy) {
      case 'price_asc': result.sort((a, b) => price(a) - price(b)); break
      case 'price_desc': result.sort((a, b) => price(b) - price(a)); break
      case 'rating': result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)); break
      case 'newest': result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break
      default: break
    }
    return result
  }, [products, searchQuery, selectedCategory, isDealsOnly, priceMax, freeDelivery, selectedSizes, minRating, sortBy])

  const activeFiltersCount = [
    selectedCategory !== 'All',
    selectedBrands.length > 0,
    selectedSizes.length > 0,
    minRating > 0,
    freeDelivery,
    priceMax < 100000,
  ].filter(Boolean).length

  const FilterPanel = () => (
    <aside className="space-y-6 text-white">
      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center justify-between glass p-3 rounded-xl border border-[#c9a962]/20">
          <span className="text-xs font-black text-[#c9a962]">{activeFiltersCount} Filter{activeFiltersCount > 1 ? 's' : ''} Active</span>
          <button onClick={resetAllFilters} className="text-[10px] font-black uppercase text-white/40 hover:text-red-400 transition-colors">
            Clear All ×
          </button>
        </div>
      )}

      {/* ryze Fast Delivery Toggle */}
      <FilterSection title="Free Shipping">
        <label className="flex items-center justify-between cursor-pointer group">
          <div>
            <p className="text-sm font-bold text-white/80">Free Delivery</p>
            <p className="text-[9px] text-white/30 font-bold uppercase tracking-wider">Show free-delivery items</p>
          </div>
          <div
            onClick={() => setFreeDelivery(!freeDelivery)}
            className={`w-10 h-[22px] rounded-full relative transition-all ${freeDelivery ? 'bg-[#c9a962]' : 'bg-white/10'}`}
          >
            <div className={`absolute top-[3px] w-4 h-4 bg-white rounded-full shadow-md transition-all ${freeDelivery ? 'right-[3px]' : 'left-[3px]'}`} />
          </div>
        </label>
      </FilterSection>

      {/* Categories */}
      <FilterSection title="Department">
        <ul className="space-y-1">
          {ALL_CATEGORIES.map(cat => (
            <li key={cat}>
              <button
                onClick={() => setSelectedCategory(cat)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between group ${selectedCategory === cat ? 'bg-[#c9a962]/10 text-[#c9a962] font-bold' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
              >
                {cat}
                {selectedCategory === cat && <Check className="w-3 h-3" />}
              </button>
            </li>
          ))}
        </ul>
      </FilterSection>

      {/* Price Slider */}
      <FilterSection title="Price Range">
        <input
          type="range"
          min="1000"
          max="100000"
          step="1000"
          value={priceMax}
          onChange={e => setPriceMax(Number(e.target.value))}
          className="w-full accent-[#c9a962] cursor-pointer"
        />
        <div className="flex justify-between items-center mt-3">
          <div className="glass px-3 py-1.5 rounded-lg border-white/10 text-xs font-bold">₹1,000</div>
          <div className="glass px-3 py-1.5 rounded-lg text-xs font-bold text-[#c9a962]">
            ₹{priceMax.toLocaleString()}
          </div>
        </div>
        <div className="mt-4 space-y-1.5">
          {[['Under ₹5,000', 5000], ['₹5k–₹15k', 15000], ['₹15k–₹30k', 30000], ['₹30k+', 100000]].map(([label, val]) => (
            <button key={label} onClick={() => setPriceMax(val)} className={`w-full text-left text-sm px-2 py-1 rounded transition-colors ${priceMax === val ? 'text-[#c9a962] font-bold' : 'text-white/40 hover:text-white'}`}>
              {label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Customer Ratings */}
      <FilterSection title="Customer Ratings">
        <div className="space-y-2">
          {[4, 3, 2, 1].map(rate => (
            <button
              key={rate}
              onClick={() => setMinRating(minRating === rate ? 0 : rate)}
              className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-lg transition-all ${minRating === rate ? 'bg-[#c9a962]/10' : 'hover:bg-white/5'}`}
            >
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i < rate ? 'fill-[#c9a962] text-[#c9a962]' : 'text-white/10'}`} />
                ))}
              </div>
              <span className={`text-xs font-bold ${minRating === rate ? 'text-[#c9a962]' : 'text-white/40'}`}>& Up</span>
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Sizes */}
      <FilterSection title="Standard Sizes">
        <div className="flex flex-wrap gap-2">
          {ALL_SIZES.map(s => (
            <button
              key={s}
              onClick={() => toggleSize(s)}
              className={`px-3 py-2 rounded-xl text-[10px] font-black border transition-all ${selectedSizes.includes(s) ? 'bg-[#c9a962] text-black border-[#c9a962]' : 'border-white/10 text-white/40 hover:border-[#c9a962]/40 hover:text-white'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Brands */}
      <FilterSection title="Brands" defaultOpen={false}>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30" />
          <input type="text" placeholder="Search brands…" className="w-full bg-white/5 border border-white/10 rounded-lg text-xs pl-8 pr-3 py-2 focus:outline-none focus:border-[#c9a962]/40" />
        </div>
        <div className="space-y-2">
          {BRANDS.map(b => (
            <label key={b} className="flex items-center gap-3 cursor-pointer group">
              <div
                onClick={() => toggleBrand(b)}
                className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${selectedBrands.includes(b) ? 'bg-[#c9a962] border-[#c9a962]' : 'border-white/20 group-hover:border-white/50'}`}
              >
                {selectedBrands.includes(b) && <Check className="w-2.5 h-2.5 text-black" />}
              </div>
              <span className={`text-sm transition-colors ${selectedBrands.includes(b) ? 'text-white font-bold' : 'text-white/50 group-hover:text-white'}`}>{b}</span>
            </label>
          ))}
        </div>
      </FilterSection>
    </aside>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0b] pb-24">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/5">
          <div>
            <h1 className="font-outfit font-black text-3xl sm:text-4xl text-white uppercase tracking-tighter">
              ryze <span className="text-[#c9a962]">Marketplace</span>
            </h1>
            <p className="text-sm text-white/30 font-medium mt-1">
              <span className="text-[#c9a962] font-bold">{filtered.length}</span> results from ryze Collection
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Desktop Search */}
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search products…"
                className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#c9a962]/40 w-56"
              />
            </div>

            {/* Sort */}
            <div className="glass border border-white/10 rounded-xl px-3 py-2 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-white/40" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="bg-transparent text-xs font-bold text-white/70 outline-none cursor-pointer"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value} className="bg-[#111]">{o.label}</option>
                ))}
              </select>
            </div>

            {/* Mobile filter toggle */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 bg-[#c9a962] text-black px-4 py-2 rounded-xl font-black text-xs uppercase tracking-tight"
            >
              <Filter className="w-4 h-4" />
              Filters {activeFiltersCount > 0 && <span className="bg-black/30 text-[9px] px-1.5 py-0.5 rounded-full">{activeFiltersCount}</span>}
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* ── Desktop Sidebar ── */}
          <div className="hidden lg:block w-60 xl:w-64 shrink-0 sticky top-32 self-start max-h-[calc(100vh-150px)] overflow-y-auto no-scrollbar pr-2 space-y-6">
            <FilterPanel />
          </div>

          {/* ── Product Grid ── */}
          <main className="flex-1 min-w-0">
            {/* Quick Horizontal Filters (Amazon mobile style) */}
            <div className="flex lg:hidden items-center gap-2 overflow-x-auto no-scrollbar pb-4 mb-4 border-b border-white/5 whitespace-nowrap">
              <button
                onClick={() => setFreeDelivery(!freeDelivery)}
                className={`flex-shrink-0 px-3 py-1.5 border rounded-full text-[10px] font-bold transition-all ${freeDelivery ? 'bg-white/10 text-white border-white/40' : 'bg-transparent text-white/50 border-white/10'}`}
              >
                ✓ Free Shipping
              </button>
              {ALL_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(selectedCategory === cat ? 'All' : cat)}
                  className={`flex-shrink-0 px-3 py-1.5 border rounded-full text-[10px] font-bold transition-all ${selectedCategory === cat ? 'bg-white/10 text-[#c9a962] border-[#c9a962]/40' : 'bg-transparent text-white/60 border-white/10'}`}
                >
                  {cat}
                </button>
              ))}
              <div className="w-px h-6 bg-white/10 mx-2 flex-shrink-0" />
              <button onClick={() => setPriceMax(15000)} className="flex-shrink-0 px-4 py-2 border rounded-full bg-transparent border-white/10 text-xs font-bold text-white/60">
                Under ₹15k
              </button>
              <button onClick={() => setMinRating(4)} className="flex-shrink-0 px-4 py-2 border rounded-full bg-transparent border-white/10 text-xs font-bold text-white/60">
                4★ & Up
              </button>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-[#111113] rounded-3xl h-[450px]" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <div className="text-6xl mb-4">🫙</div>
                <h3 className="font-outfit font-black text-2xl text-white mb-2">No Products Found</h3>
                <p className="text-white/40 text-sm mb-6">Try adjusting your filters or search query.</p>
                <button onClick={resetAllFilters} className="bg-[#c9a962] text-black font-black px-6 py-3 rounded-xl text-sm uppercase tracking-wide hover:bg-[#b09452] transition-all">
                  Reset Filters
                </button>
              </div>
            ) : (
              <motion.div
                layout
                className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-1.5 sm:gap-4"
              >
                <AnimatePresence mode="popLayout">
                  {filtered.map(product => {
                    const price = product.discountPrice ?? product.regularPrice ?? 0
                    const discount = product.regularPrice && product.discountPrice
                      ? Math.round(((product.regularPrice - product.discountPrice) / product.regularPrice) * 100)
                      : 0
                    const liked = isLiked(product._id || product.id)

                    return (
                      <motion.article
                        key={product._id || product.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        whileHover={{ y: -6 }}
                        transition={{ duration: 0.3 }}
                        className="group bg-[#111113] rounded-2xl overflow-hidden border border-white/5 hover:border-[#c9a962]/20 transition-all flex flex-col shadow-xl shadow-black/30"
                      >
                        {/* Image */}
                        <div
                          className="relative aspect-square overflow-hidden cursor-pointer"
                          onClick={() => setQuickViewProduct(product)}
                        >
                          <OptimizedImage
                            src={product.images?.[0] || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400'}
                            alt={product.retailHeading}
                            width={400}
                            quality={70}
                            wrapperClassName="w-full h-full"
                            className="group-hover:scale-110 transition-transform duration-700"
                          />

                          {/* Badges */}
                          {product.inStock === false ? (
                            <div className="absolute top-4 left-0 bg-red-600/90 text-white text-[9px] font-black px-3 py-1 uppercase tracking-widest rounded-r-full shadow-lg z-20 backdrop-blur-md">
                              Out of Stock
                            </div>
                          ) : (
                            discount >= 20 && (
                              <div className="absolute top-4 left-0 bg-[#c9a962] text-black text-[9px] font-black px-3 py-1 uppercase tracking-widest rounded-r-full shadow-lg z-20">
                                ryze Deal -{discount}%
                              </div>
                            )
                          )}
                          {product.deliveryCharge === 0 && product.inStock !== false && (
                            <div className="absolute top-4 right-4 bg-green-500/80 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase backdrop-blur-md z-20">
                              Free Ship
                            </div>
                          )}

                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                          {/* Quick Add Button (Amazon style) */}
                          {product.inStock !== false && (
                            <div className="absolute bottom-2 right-2 flex items-center justify-center z-10 hidden sm:flex">
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  addToCart({
                                    ...product,
                                    id: product._id || product.id,
                                    title: product.retailHeading,
                                    price: product.discountPrice ?? product.regularPrice,
                                    size: product.sizes?.[0] || 'One Size',
                                    color: product.colors?.[0]?.name || 'Default',
                                    qty: 1,
                                    image: product.images?.[0] || product.image
                                  });
                                }}
                                className="absolute bottom-1.5 right-1.5 w-7 h-7 sm:w-8 sm:h-8 bg-[#c9a962] hover:bg-[#b09452] text-black rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 shadow-black/50 z-20"
                              >
                                <Plus className="w-4 h-4 font-black" />
                              </button>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 -translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                            <button
                              onClick={e => { e.stopPropagation(); toggleWishlist(product) }}
                              className="w-10 h-10 rounded-xl glass flex items-center justify-center hover:bg-[#c9a962] hover:text-black transition-all"
                            >
                              <Heart className={`w-5 h-5 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
                            </button>
                          </div>

                          {/* Size Quick Select */}
                          <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                            <p className="text-[9px] font-black uppercase text-[#c9a962] mb-2 text-center tracking-[0.2em]">Quick Size</p>
                            <div className="flex flex-wrap justify-center gap-1.5">
                              {product.sizes?.slice(0, 5).map(s => (
                                <button key={s} onClick={e => e.stopPropagation()} className="w-8 h-8 rounded-lg border border-white/20 flex items-center justify-center text-[9px] font-black hover:bg-[#c9a962] hover:text-black transition-all">
                                  {s}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="p-2 sm:p-3 flex-1 flex flex-col bg-white/[0.02]">
                          <div className="flex flex-col gap-0.5 mb-1">
                            <h3
                              className="font-outfit font-bold text-white text-[10px] sm:text-xs leading-snug group-hover:text-[#c9a962] transition-colors cursor-pointer line-clamp-2"
                              onClick={() => setQuickViewProduct(product)}
                            >
                              {product.retailHeading}
                            </h3>
                            <div className="flex items-center gap-1 my-1">
                              <div className="flex text-[#c9a962]">
                                {[...Array(5)].map((_, i) => {
                                  const r = product.rating || 0
                                  return <Star key={i} className={`w-3 h-3 ${i < Math.floor(r) ? 'fill-current' : i < r ? 'fill-current opacity-50' : 'text-white/20'}`} />
                                })}
                              </div>
                              <span className="text-white/60 text-[9px] font-bold">{product.rating ? Number(product.rating).toFixed(1) : '—'}</span>
                              {product.reviews > 0 && <span className="text-white/30 text-[9px] font-bold">({product.reviews})</span>}
                              {product.ordersCount > 0 && <span className="text-white/30 text-[9px] font-bold ml-1">· {product.ordersCount.toLocaleString()} bought</span>}
                            </div>
                          </div>

                          <div className="mt-auto pt-1 flex items-baseline gap-1 flex-wrap">
                            {discount > 0 && (
                              <span className="bg-[#cc0c39] text-white font-bold text-[8px] sm:text-[9px] px-1 py-0.5 rounded shadow-sm">
                                -{discount}%
                              </span>
                            )}
                            <span className="text-base sm:text-lg font-outfit font-black text-white tracking-tighter shadow-sm flex items-baseline">
                              <span className="text-[9px] sm:text-xs mr-0.5 leading-none">₹</span>{price.toLocaleString()}
                            </span>
                            {product.regularPrice > product.discountPrice && (
                              <span className="text-[9px] sm:text-[10px] text-white/40 font-bold line-through ml-1 leading-none">₹{product.regularPrice.toLocaleString()}</span>
                            )}
                          </div>
                          {product.deliveryCharge === 0 && (
                            <p className="text-[#c9a962] text-[9px] font-bold flex items-center mt-1">✓ Free Shipping · 5–7 days</p>
                          )}
                        </div>
                      </motion.article>
                    )
                  })}
                </AnimatePresence>
              </motion.div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[90]"
              onClick={() => setMobileFilterOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed top-0 left-0 bottom-0 w-[88%] max-w-xs bg-[#0d0d0e] z-[100] shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
                <h3 className="font-outfit font-black text-lg text-white uppercase tracking-tight">Filters</h3>
                <button onClick={() => setMobileFilterOpen(false)} className="p-2 glass rounded-xl">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar p-6">
                <FilterPanel />
              </div>
              <div className="p-4 border-t border-white/5">
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full bg-[#c9a962] text-black font-black py-4 rounded-2xl uppercase tracking-wide text-sm"
                >
                  Show {filtered.length} Result{filtered.length !== 1 ? 's' : ''}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </div>
  )
}
