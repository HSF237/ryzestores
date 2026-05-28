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

const DROPSHIP_PRODUCTS = [
  {
    retailHeading: 'RGB LED Strip Lights — Smart App Control',
    longDescription: 'Transform your room instantly with vibrant RGB lighting. Supports 16 million colours, music sync mode, and app control via Bluetooth. Adhesive backing for easy wall mounting. Perfect for bedrooms, gaming setups, and study desks. Cut-to-length flexibility — works with any room size.',
    category: 'Electronics',
    department: 'Smart Home',
    regularPrice: 599,
    discountPrice: 449,
    deliveryCharge: 0,
    taxRate: 18,
    searchKeywords: ['led', 'rgb', 'room decor', 'smart lights', 'led strip', 'gaming room', 'neon'],
    images: ['https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'],
    supplierLink: 'https://deodap.in/products/13460_3m_led_strip_lights_n_remote',
  },
  {
    retailHeading: '360° Magnetic Car & Desk Phone Holder',
    longDescription: 'Universal magnetic mount with 360° rotation — works on car dashboards, desks, and bedside tables. Strong N52 magnet holds any phone securely without blocking ports. One-hand operation for easy attachment and removal. Sleek black design fits all interiors.',
    category: 'Accessories',
    department: 'Phone',
    regularPrice: 399,
    discountPrice: 299,
    deliveryCharge: 0,
    taxRate: 12,
    searchKeywords: ['phone holder', 'car mount', 'magnetic', 'mobile stand', 'phone stand', 'car accessories'],
    images: ['https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800', 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=800'],
  },
  {
    retailHeading: 'RYZE TWS Wireless Earbuds — 35Hr Battery',
    longDescription: 'True wireless earbuds with deep bass and crystal-clear highs. 8hr playtime + 27hr charging case = 35 total hours on a single charge. Bluetooth 5.0 for instant pairing. Touch controls for calls, music, and voice assistant. Ergonomic in-ear design fits all ear sizes with 3 tip options included. Compact charging case fits in any pocket.',
    category: 'Electronics',
    department: 'Audio',
    regularPrice: 1499,
    discountPrice: 999,
    deliveryCharge: 0,
    taxRate: 18,
    searchKeywords: ['earbuds', 'wireless', 'tws', 'bluetooth', 'earphones', 'airpods', 'touch control'],
    images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800', 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800'],
    supplierLink: 'https://www.meesho.com/tws-wireless-earbuds-touch-control-long-battery-backup/p/c7uhxs',
  },
  {
    retailHeading: 'Pop Socket Collapsible Grip & Stand — Pack of 2',
    longDescription: 'Get two for the price of one! Collapsible grip and stand for phones and tablets. Expand for a secure one-handed grip or prop it up as a landscape stand for hands-free watching. Strong sticky pad mount — attaches to most phone cases and backs. Collapses flat so it fits in any pocket. Great for gifting or keeping one as backup.',
    category: 'Accessories',
    department: 'Phone',
    regularPrice: 299,
    discountPrice: 199,
    deliveryCharge: 0,
    taxRate: 12,
    searchKeywords: ['popsocket', 'phone grip', 'pop socket', 'phone stand', 'mobile grip', 'phone holder'],
    images: ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800'],
    supplierLink: 'https://www.meesho.com/retrack-set-of-2pc-pop-socket-collapsible-grip-stand-for-phones-and-tablets/p/1k3u44',
  },
  {
    retailHeading: 'Adjustable Posture Corrector Support Belt',
    longDescription: 'Gently pulls your shoulders back to align your spine naturally. Lightweight, breathable mesh fabric — wear under any clothing. Fully adjustable straps fit chest sizes 28–44 inches. Reduces neck pain, back ache, and shoulder tension from long sitting. Recommended for students, office workers, and gamers.',
    category: 'Health',
    department: 'Wellness',
    regularPrice: 699,
    discountPrice: 499,
    deliveryCharge: 0,
    taxRate: 12,
    searchKeywords: ['posture corrector', 'back support', 'posture', 'back brace', 'spine', 'pain relief'],
    images: ['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'],
  },
  {
    retailHeading: 'Mini USB Desk Fan — Silent 3-Speed Portable',
    longDescription: 'Stay cool anywhere this summer. Powers via USB — works with laptop, power bank, or adapter. 3 speed settings including a whisper-quiet sleep mode. 360° adjustable neck for precise airflow direction. Compact enough for your desk, bedside, or study table. Perfect for Kerala\'s hot summer months.',
    category: 'Electronics',
    department: 'Home Appliances',
    regularPrice: 549,
    discountPrice: 399,
    deliveryCharge: 0,
    taxRate: 18,
    searchKeywords: ['fan', 'desk fan', 'usb fan', 'table fan', 'mini fan', 'summer', 'portable fan', 'cooling'],
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=800'],
  },
  {
    retailHeading: 'Fridge & Desk Organizer Set — 6 Piece Clear',
    longDescription: 'Crystal-clear storage bins that make your fridge, desk, or bathroom look like a Pinterest board. Set of 6 includes 3 sizes for fruits, vegetables, snacks, stationery, and cosmetics. Stackable design saves space. BPA-free food-safe material. Smooth handles for easy sliding in and out.',
    category: 'Home',
    department: 'Organisation',
    regularPrice: 499,
    discountPrice: 349,
    deliveryCharge: 0,
    taxRate: 18,
    searchKeywords: ['organizer', 'fridge organizer', 'storage box', 'desk organizer', 'kitchen storage', 'home organizer'],
    images: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'],
  },
  {
    retailHeading: '3-in-1 Fast Charging Cable — Type-C / Lightning / Micro',
    longDescription: 'One cable for every device in your house. Charges iPhones, Android phones, tablets, earbuds, and more at the same time. Supports 65W fast charging on compatible devices. Durable nylon braided jacket — tangle-free and rated for 10,000+ bends. 1.2m length — perfect for desk or bedside use.',
    category: 'Electronics',
    department: 'Charging',
    regularPrice: 399,
    discountPrice: 299,
    deliveryCharge: 0,
    taxRate: 18,
    searchKeywords: ['charging cable', 'type c', 'fast charge', '3 in 1', 'usb cable', 'charger', 'lightning'],
    images: ['https://images.unsplash.com/photo-1605648916361-9bc12ad6a569?w=800', 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800'],
  },
  {
    retailHeading: 'Aesthetic Room Wall Stickers — Pack of 50',
    longDescription: 'Instantly upgrade your room walls without paint or damage. Pack of 50 includes stars, moons, clouds, quotes, and abstract shapes in a neutral black/gold palette. Peel-and-stick application — removable and repositionable with zero wall damage. Perfect for hostel rooms, bedrooms, and study spaces.',
    category: 'Home',
    department: 'Decor',
    regularPrice: 349,
    discountPrice: 249,
    deliveryCharge: 0,
    taxRate: 18,
    searchKeywords: ['wall stickers', 'room decor', 'aesthetic', 'wall decal', 'stickers', 'bedroom decor', 'dorm room'],
    images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'],
  },
  {
    retailHeading: 'BT Jazz Neckband — 48Hr Battery, Type-C, Water Resistant',
    longDescription: 'Premium Bluetooth 5.1 neckband with ultra bass and HD stereo sound. Massive 48-hour (2-day) battery life so you never run out mid-day. Type-C fast charging. Water resistant — sweat and rain proof for gym and outdoor use. Unique call vibration alert so you never miss a call. Magnetic earbuds snap together. Durable braided wires. Comes with 1-year warranty.',
    category: 'Electronics',
    department: 'Audio',
    regularPrice: 999,
    discountPrice: 649,
    deliveryCharge: 0,
    taxRate: 18,
    searchKeywords: ['neckband', 'earphones', 'bluetooth', 'bass', 'bt jazz', 'wireless neckband', 'waterproof earphones', 'gym earphones', 'type c'],
    images: ['https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'],
    supplierLink: 'https://www.meesho.com/bt-jazz-neckband-with-vibration-neckband-bluetooth-wireless-neckband-high-bass-neckband-v51-hd-sound-quality-stereo-bass-with-vibration-grey-true-wireless-type-c-fast-charge-high-bass-clears-treble-long-battery-life-2-days-premium-neckband/p/637723435',
  },
]

export default function Seeder() {
  const [loading, setLoading] = useState(false)
  const [complete, setComplete] = useState(false)
  const [dropshipLoading, setDropshipLoading] = useState(false)
  const [dropshipComplete, setDropshipComplete] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleDropshipSeed = async () => {
    if (!user) { setError('You must be logged in.'); return }
    setDropshipLoading(true)
    setError('')
    try {
      const batch = writeBatch(db)
      DROPSHIP_PRODUCTS.forEach(p => {
        const docRef = doc(collection(db, 'products'))
        batch.set(docRef, {
          ...p,
          rating: 4.5,
          reviews: 0,
          ordersCount: 0,
          inStock: true,
          sizes: [],
          colors: [],
          customizable: false,
          customizationLabel: '',
          createdBy: user._id || 'system',
          createdAt: serverTimestamp()
        })
      })
      await batch.commit()
      setDropshipComplete(true)
    } catch (err) {
      setError(err?.message || 'Failed to add products.')
    } finally {
      setDropshipLoading(false)
    }
  }

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
        ) : dropshipComplete ? (
          <div className="text-center py-6 border border-green-500/20 rounded-2xl bg-green-500/5 mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
            <p className="text-white font-bold mb-1">10 Dropship Products Added!</p>
            <p className="text-white/40 text-xs">Go to Staff Dashboard → Inventory to add your images.</p>
            <button onClick={() => navigate('/staff/dashboard')} className="mt-4 bg-[#c9a962] text-black font-black px-6 py-2 rounded-xl text-sm uppercase">
              Open Inventory
            </button>
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
            {error && <p className="text-red-400 text-sm font-bold bg-red-500/10 rounded-xl p-4 mb-6">{error}</p>}

            {/* Dropship Products */}
            <div className="border border-[#c9a962]/20 rounded-2xl p-5 bg-[#c9a962]/5 mb-6">
              <p className="text-[#c9a962] font-black text-sm uppercase tracking-widest mb-1">Dropship Catalog</p>
              <p className="text-white/50 text-xs mb-4">Adds 10 real dropship products with full descriptions and pricing. Add your own images after via Staff Dashboard → Inventory.</p>
              <button
                onClick={handleDropshipSeed}
                disabled={dropshipLoading}
                className="w-full bg-[#c9a962] text-black font-black py-3 rounded-xl text-xs uppercase tracking-wide hover:bg-[#b09452] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {dropshipLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Adding Products...</> : 'Add 10 Dropship Products'}
              </button>
            </div>

            <p className="text-white/30 text-xs mb-4 text-center uppercase tracking-widest font-bold">— or —</p>

            <p className="text-white/60 text-sm mb-6">
              Inject <strong>200 dummy products</strong> for testing/demo purposes.
            </p>

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
