import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Loader2, Database } from 'lucide-react'
import { db } from '../config/firebase'
import { writeBatch, collection, doc, serverTimestamp } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'

const UNSPLASH = {
  footwear: [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
    'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600',
    'https://images.unsplash.com/photo-1579338559194-a162d19bf842?w=600',
    'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600',
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600',
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600',
    'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600',
  ],
  apparel: [
    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600',
    'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=600',
    'https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?w=600',
    'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600',
    'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600',
  ],
  electronics: [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600',
    'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600',
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
  ],
  beauty: [
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600',
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600',
    'https://images.unsplash.com/photo-1614159102108-2436a5cf8c8b?w=600',
    'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600',
  ],
  accessories: [
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600',
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600',
    'https://images.unsplash.com/photo-1614950340305-d4ceaf1b7e65?w=600',
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600',
  ],
  home: [
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600',
    'https://images.unsplash.com/photo-1493663284031-b7e3aaa4a99f?w=600',
    'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600',
  ]
}

const DESCRIPTIONS = {
  Footwear: 'Crafted with precision-engineered materials for unmatched comfort and style. Designed to perform across every terrain and occasion.',
  Apparel: 'Premium fabric with an ryze cut — engineered for movement, comfort, and lasting style. A wardrobe essential reinvented.',
  Electronics: 'Next-generation technology meets premium design. Built for performance, precision, and a seamless user experience.',
  Beauty: 'Formulated with clinically-tested actives and luxury ingredients. Designed to deliver visible, lasting results.',
  Accessories: 'Handcrafted from premium materials with meticulous attention to detail. Elevate every outfit and every moment.',
  Home: 'Designed to transform your space — a perfect balance of function, beauty, and lasting quality.',
}

const BASE_PRODUCTS = [
  // Footwear
  { retailHeading: 'AirMax Quantum Runner', category: 'Footwear', department: 'Running', regularPrice: 8999, discountPrice: 6499, sizes: ['7', '8', '9', '10', '11'], taxRate: 12, imgs: 'footwear' },
  { retailHeading: 'LuxeStep Leather Derby', category: 'Footwear', department: 'Formal', regularPrice: 12999, discountPrice: 9999, sizes: ['7', '8', '9', '10'], taxRate: 12, imgs: 'footwear' },
  { retailHeading: 'PhantomGrip Trail Shoe', category: 'Footwear', department: 'Outdoor', regularPrice: 7499, discountPrice: 5999, sizes: ['8', '9', '10', '11'], taxRate: 12, imgs: 'footwear' },
  { retailHeading: 'Velvet Sole Loafer', category: 'Footwear', department: 'Casual', regularPrice: 5999, discountPrice: 4299, sizes: ['7', '8', '9', '10', '11'], taxRate: 12, imgs: 'footwear' },

  // Apparel
  { retailHeading: 'Obsidian Slim-Fit Tee', category: 'Apparel', department: 'Casual', regularPrice: 1999, discountPrice: 1399, sizes: ['XS', 'S', 'M', 'L', 'XL'], taxRate: 5, imgs: 'apparel' },
  { retailHeading: 'ryze Merino Crewneck', category: 'Apparel', department: 'Luxury', regularPrice: 8999, discountPrice: 6499, sizes: ['S', 'M', 'L', 'XL'], taxRate: 5, imgs: 'apparel' },
  { retailHeading: 'Carbon Jogger Set', category: 'Apparel', department: 'Activewear', regularPrice: 5999, discountPrice: 4299, sizes: ['XS', 'S', 'M', 'L', 'XL'], taxRate: 5, imgs: 'apparel' },

  // Electronics
  { retailHeading: 'BassX Pro Wireless ANC', category: 'Electronics', department: 'Audio', regularPrice: 24999, discountPrice: 19499, taxRate: 18, imgs: 'electronics' },
  { retailHeading: 'Crystal 4K Smartwatch', category: 'Electronics', department: 'Wearable', regularPrice: 18999, discountPrice: 14999, taxRate: 18, imgs: 'electronics' },
  { retailHeading: 'HoloPod Earbuds Ultra', category: 'Electronics', department: 'Audio', regularPrice: 12999, discountPrice: 9999, taxRate: 18, imgs: 'electronics' },

  // Beauty
  { retailHeading: 'Luxe Glow Serum 30ml', category: 'Beauty', department: 'Skincare', regularPrice: 3999, discountPrice: 2999, taxRate: 18, imgs: 'beauty' },
  { retailHeading: 'Onyx Velvet Matte Lipstick', category: 'Beauty', department: 'Makeup', regularPrice: 1499, discountPrice: 999, taxRate: 18, imgs: 'beauty' },

  // Accessories
  { retailHeading: 'Obsidian Leather Wallet', category: 'Accessories', department: 'Leather', regularPrice: 3499, discountPrice: 2499, taxRate: 12, imgs: 'accessories' },
  { retailHeading: 'ryze Carbon Belt', category: 'Accessories', department: 'Leather', regularPrice: 2999, discountPrice: 1999, taxRate: 12, imgs: 'accessories' },

  // Home
  { retailHeading: 'Marble Desk Organiser', category: 'Home', department: 'Office', regularPrice: 3499, discountPrice: 2499, taxRate: 18, imgs: 'home' },
  { retailHeading: 'Bamboo Zen Storage Box', category: 'Home', department: 'Organisation', regularPrice: 2999, discountPrice: 1999, taxRate: 18, imgs: 'home' },
]

export default function Seeder() {
  const [loading, setLoading] = useState(false)
  const [complete, setComplete] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleSeed = async () => {
    if (!user) {
      setError('You must be logged in to seed the database.')
      return
    }

    setLoading(true)
    setError('')

    try {
      // 1. Initialize a super-fast batch write
      const batch = writeBatch(db)
      const targetCount = 200

      for (let i = 0; i < targetCount; i++) {
        // Pick a random base template
        const base = BASE_PRODUCTS[Math.floor(Math.random() * BASE_PRODUCTS.length)]

        // Pick 3-4 random unique images for "multiple photos" requirement
        const imgPool = UNSPLASH[base.imgs] || UNSPLASH.apparel
        const shuffledImgs = [...imgPool].sort(() => 0.5 - Math.random())
        const productImages = shuffledImgs.slice(0, Math.floor(Math.random() * 2) + 3) // 3 to 4 images

        // Give it a unique variation name occasionally to simulate a massive catalog
        const variation = i % 5 === 0 ? ` V${Math.floor(Math.random() * 10) + 2}` : ''

        const docRef = doc(collection(db, 'products'))
        batch.set(docRef, {
          retailHeading: `${base.retailHeading}${variation}`,
          longDescription: DESCRIPTIONS[base.category],
          category: base.category,
          department: base.department || '',
          regularPrice: base.regularPrice,
          discountPrice: base.discountPrice - (i % 3 === 0 ? 500 : 0), // Slight price variation
          deliveryCharge: Math.random() < 0.6 ? 0 : 99,
          sizes: base.sizes || [],
          colors: [
            { name: 'Black', hex: '#111111' },
            { name: 'White', hex: '#f5f5f5' },
          ],
          images: productImages, // Multiple images per product
          rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
          reviews: Math.floor(Math.random() * 120),
          ordersCount: Math.floor(Math.random() * 500),
          inStock: true,
          taxRate: base.taxRate,
          searchKeywords: ['seeded', base.category.toLowerCase(), (base.department || '').toLowerCase()],
          createdBy: user._id || 'system',
          createdAt: serverTimestamp()
        })
      }

      // 2. Commit all 200 items instantly with zero lag
      await batch.commit()
      setComplete(true)
    } catch (err) {
      setError(err?.message || 'Failed to seed database.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#111113] rounded-3xl border border-white/10 p-8 shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#c9a962]/10 flex items-center justify-center">
            <Database className="w-6 h-6 text-[#c9a962]" />
          </div>
          <div>
            <h1 className="font-outfit font-black text-2xl text-white">Database Seeder</h1>
            <p className="text-white/40 text-sm">Ultra-fast 200 Product Injector</p>
          </div>
        </div>

        {!user ? (
          <div className="text-center py-6">
            <p className="text-red-400 mb-4 font-bold text-sm">Authentication Required</p>
            <button onClick={() => navigate('/login')} className="bg-white/10 px-6 py-2 rounded-xl font-bold">Login</button>
          </div>
        ) : complete ? (
          <div className="text-center py-6">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Injection Complete</h2>
            <p className="text-white/40 text-sm mb-6">Successfully generated 200 unique products with multiple HD images instantly.</p>
            <button onClick={() => navigate('/shop')} className="w-full bg-[#c9a962] text-black font-black py-4 rounded-2xl uppercase tracking-widest text-sm">
              Enter The Store
            </button>
          </div>
        ) : (
          <div>
            <p className="text-white/60 text-sm mb-8">
              This will instantly inject <strong>200 products</strong> into your Firebase database. Each product will have multiple unique photos automatically assigned, with zero lag or slowdown.
            </p>

            {error && <p className="text-red-400 text-sm font-bold bg-red-500/10 rounded-xl p-4 mb-6">{error}</p>}

            <button
              onClick={handleSeed}
              disabled={loading}
              className="w-full bg-[#c9a962] text-black font-black py-4 rounded-2xl text-sm uppercase tracking-wide hover:bg-[#b09452] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating 200 Products...
                </>
              ) : 'Inject 200 Products Instantly'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
