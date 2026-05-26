/**
 * RYZE — 100 Product Seeder
 * Run: node scripts/seedProducts.js
 * Deletes existing seeded products and inserts 100 fresh ones.
 * All image URLs are from Unsplash (real, free, deletable).
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../server/.env') })
const mongoose = require('mongoose')
const Product = require('./models/Product')
const User = require('./models/User')

const UNSPLASH = {
  footwear: [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
    'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600',
    'https://images.unsplash.com/photo-1579338559194-a162d19bf842?w=600',
    'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600',
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600',
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600',
    'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600',
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600',
  ],
  apparel: [
    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600',
    'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=600',
    'https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?w=600',
    'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600',
    'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600',
    'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600',
    'https://images.unsplash.com/photo-1544441893-675973e31985?w=600',
  ],
  electronics: [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600',
    'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600',
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600',
    'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600',
    'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600',
  ],
  beauty: [
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600',
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600',
    'https://images.unsplash.com/photo-1614159102108-2436a5cf8c8b?w=600',
    'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600',
    'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600',
    'https://images.unsplash.com/photo-1631214524020-3c69f4358908?w=600',
  ],
  accessories: [
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600',
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600',
    'https://images.unsplash.com/photo-1614950340305-d4ceaf1b7e65?w=600',
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600',
    'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600',
    'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600',
  ],
  home: [
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600',
    'https://images.unsplash.com/photo-1493663284031-b7e3aaa4a99f?w=600',
    'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600',
  ]
}

const getRand = (arr) => arr[Math.floor(Math.random() * arr.length)]
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

const PRODUCTS = [
  // ── FOOTWEAR (20) ──────────────────────────────
  { retailHeading: 'AirMax Quantum Runner', category: 'Footwear', department: 'Running', regularPrice: 8999, discountPrice: 6499, sizes: ['7', '8', '9', '10', '11'], taxRate: 12, imgs: 'footwear' },
  { retailHeading: 'LuxeStep Leather Derby', category: 'Footwear', department: 'Formal', regularPrice: 12999, discountPrice: 9999, sizes: ['7', '8', '9', '10'], taxRate: 12, imgs: 'footwear' },
  { retailHeading: 'PhantomGrip Trail Shoe', category: 'Footwear', department: 'Outdoor', regularPrice: 7499, discountPrice: 5999, sizes: ['8', '9', '10', '11'], taxRate: 12, imgs: 'footwear' },
  { retailHeading: 'Velvet Sole Loafer', category: 'Footwear', department: 'Casual', regularPrice: 5999, discountPrice: 4299, sizes: ['7', '8', '9', '10', '11'], taxRate: 12, imgs: 'footwear' },
  { retailHeading: 'Carbon Sprint Spike', category: 'Footwear', department: 'Athletics', regularPrice: 15999, discountPrice: 12499, sizes: ['8', '9', '10'], taxRate: 12, imgs: 'footwear' },
  { retailHeading: 'UrbanGlide Sneaker Pro', category: 'Footwear', department: 'Streetwear', regularPrice: 6999, discountPrice: 5499, sizes: ['7', '8', '9', '10', '11'], taxRate: 12, imgs: 'footwear' },
  { retailHeading: 'Croc-Skin Chelsea Boot', category: 'Footwear', department: 'Luxury', regularPrice: 24999, discountPrice: 19999, sizes: ['7', '8', '9', '10'], taxRate: 18, imgs: 'footwear' },
  { retailHeading: 'Stealth All-Black Court', category: 'Footwear', department: 'Sports', regularPrice: 9499, discountPrice: 7299, sizes: ['8', '9', '10', '11'], taxRate: 12, imgs: 'footwear' },
  { retailHeading: 'ryze Foam Slide Pro', category: 'Footwear', department: 'Recovery', regularPrice: 3499, discountPrice: 2499, sizes: ['8', '9', '10', '11'], taxRate: 12, imgs: 'footwear' },
  { retailHeading: 'Monaco Canvas Low-Top', category: 'Footwear', department: 'Casual', regularPrice: 4999, discountPrice: 3799, sizes: ['7', '8', '9', '10'], taxRate: 12, imgs: 'footwear' },
  { retailHeading: 'Marathon Carbon V3', category: 'Footwear', department: 'Running', regularPrice: 18999, discountPrice: 14999, sizes: ['8', '9', '10', '11'], taxRate: 12, imgs: 'footwear' },
  { retailHeading: 'Heritage Wing-Tip Brogue', category: 'Footwear', department: 'Formal', regularPrice: 11999, discountPrice: 8999, sizes: ['7', '8', '9', '10'], taxRate: 12, imgs: 'footwear' },
  { retailHeading: 'HyperBounce Court V2', category: 'Footwear', department: 'Basketball', regularPrice: 13999, discountPrice: 10499, sizes: ['8', '9', '10', '11', '12'], taxRate: 12, imgs: 'footwear' },
  { retailHeading: 'Suede Drift Loafer', category: 'Footwear', department: 'Casual', regularPrice: 5499, discountPrice: 3999, sizes: ['7', '8', '9', '10'], taxRate: 12, imgs: 'footwear' },
  { retailHeading: 'Apex Gore-Tex Hiker', category: 'Footwear', department: 'Outdoor', regularPrice: 16999, discountPrice: 12999, sizes: ['8', '9', '10', '11'], taxRate: 12, imgs: 'footwear' },
  { retailHeading: 'Zero-G Flex Trainer', category: 'Footwear', department: 'Gym', regularPrice: 8499, discountPrice: 6499, sizes: ['8', '9', '10', '11'], taxRate: 12, imgs: 'footwear' },
  { retailHeading: 'Riviera Espadrille', category: 'Footwear', department: 'Resort', regularPrice: 4499, discountPrice: 3299, sizes: ['7', '8', '9', '10'], taxRate: 12, imgs: 'footwear' },
  { retailHeading: 'Storm Runner EV4', category: 'Footwear', department: 'Running', regularPrice: 11499, discountPrice: 8999, sizes: ['8', '9', '10', '11'], taxRate: 12, imgs: 'footwear' },
  { retailHeading: 'Classic Oxford Tan', category: 'Footwear', department: 'Formal', regularPrice: 9999, discountPrice: 7499, sizes: ['7', '8', '9', '10'], taxRate: 12, imgs: 'footwear' },
  { retailHeading: 'PowerStep Knit Racer', category: 'Footwear', department: 'Athletics', regularPrice: 7999, discountPrice: 5999, sizes: ['8', '9', '10', '11'], taxRate: 12, imgs: 'footwear' },

  // ── APPAREL (20) ──────────────────────────────
  { retailHeading: 'Obsidian Slim-Fit Tee', category: 'Apparel', department: 'Casual', regularPrice: 1999, discountPrice: 1399, sizes: ['XS', 'S', 'M', 'L', 'XL'], taxRate: 5, imgs: 'apparel' },
  { retailHeading: 'ryze Merino Crewneck', category: 'Apparel', department: 'Luxury', regularPrice: 8999, discountPrice: 6499, sizes: ['S', 'M', 'L', 'XL'], taxRate: 5, imgs: 'apparel' },
  { retailHeading: 'Carbon Jogger Set', category: 'Apparel', department: 'Activewear', regularPrice: 5999, discountPrice: 4299, sizes: ['XS', 'S', 'M', 'L', 'XL'], taxRate: 5, imgs: 'apparel' },
  { retailHeading: 'Phantom Biker Jacket', category: 'Apparel', department: 'Streetwear', regularPrice: 14999, discountPrice: 11499, sizes: ['S', 'M', 'L', 'XL'], taxRate: 12, imgs: 'apparel' },
  { retailHeading: 'Glacier Performance Hoodie', category: 'Apparel', department: 'Activewear', regularPrice: 4999, discountPrice: 3499, sizes: ['S', 'M', 'L', 'XL', 'XXL'], taxRate: 5, imgs: 'apparel' },
  { retailHeading: 'Onyx Linen Shirt', category: 'Apparel', department: 'Formal', regularPrice: 3999, discountPrice: 2799, sizes: ['S', 'M', 'L', 'XL'], taxRate: 5, imgs: 'apparel' },
  { retailHeading: 'Heritage Denim Selvedge', category: 'Apparel', department: 'Casual', regularPrice: 7999, discountPrice: 5999, sizes: ['30', '32', '34', '36'], taxRate: 12, imgs: 'apparel' },
  { retailHeading: 'Thermal Base Layer Set', category: 'Apparel', department: 'Activewear', regularPrice: 6499, discountPrice: 4999, sizes: ['XS', 'S', 'M', 'L', 'XL'], taxRate: 5, imgs: 'apparel' },
  { retailHeading: 'Satin Bomber Jacket', category: 'Apparel', department: 'Luxury', regularPrice: 19999, discountPrice: 14999, sizes: ['S', 'M', 'L', 'XL'], taxRate: 12, imgs: 'apparel' },
  { retailHeading: 'Washed Oversized Tee', category: 'Apparel', department: 'Streetwear', regularPrice: 2499, discountPrice: 1699, sizes: ['S', 'M', 'L', 'XL', 'XXL'], taxRate: 5, imgs: 'apparel' },
  { retailHeading: 'Compression Tights Pro', category: 'Apparel', department: 'Gym', regularPrice: 3499, discountPrice: 2499, sizes: ['XS', 'S', 'M', 'L', 'XL'], taxRate: 5, imgs: 'apparel' },
  { retailHeading: 'Monogram Polo Club', category: 'Apparel', department: 'Luxury', regularPrice: 5999, discountPrice: 4499, sizes: ['S', 'M', 'L', 'XL'], taxRate: 5, imgs: 'apparel' },
  { retailHeading: 'Arctic Puffer Coat', category: 'Apparel', department: 'Winter', regularPrice: 12999, discountPrice: 9499, sizes: ['S', 'M', 'L', 'XL'], taxRate: 12, imgs: 'apparel' },
  { retailHeading: 'Organic Cotton Kurta', category: 'Apparel', department: 'Ethnic', regularPrice: 3999, discountPrice: 2799, sizes: ['S', 'M', 'L', 'XL', 'XXL'], taxRate: 5, imgs: 'apparel' },
  { retailHeading: 'Reflective Track Jacket', category: 'Apparel', department: 'Activewear', regularPrice: 5499, discountPrice: 3999, sizes: ['S', 'M', 'L', 'XL'], taxRate: 5, imgs: 'apparel' },
  { retailHeading: 'Premium Chino Slim', category: 'Apparel', department: 'Casual', regularPrice: 3999, discountPrice: 2999, sizes: ['28', '30', '32', '34', '36'], taxRate: 12, imgs: 'apparel' },
  { retailHeading: 'Cashmere V-Neck Sweater', category: 'Apparel', department: 'Luxury', regularPrice: 22999, discountPrice: 17999, sizes: ['S', 'M', 'L', 'XL'], taxRate: 5, imgs: 'apparel' },
  { retailHeading: 'Graphic Drop-Shoulder Tee', category: 'Apparel', department: 'Streetwear', regularPrice: 2999, discountPrice: 1999, sizes: ['S', 'M', 'L', 'XL', 'XXL'], taxRate: 5, imgs: 'apparel' },
  { retailHeading: 'Linen Formal Blazer', category: 'Apparel', department: 'Formal', regularPrice: 9999, discountPrice: 7499, sizes: ['S', 'M', 'L', 'XL'], taxRate: 12, imgs: 'apparel' },
  { retailHeading: 'Neoprene Sport Shorts', category: 'Apparel', department: 'Gym', regularPrice: 2499, discountPrice: 1799, sizes: ['XS', 'S', 'M', 'L', 'XL'], taxRate: 5, imgs: 'apparel' },

  // ── ELECTRONICS (20) ──────────────────────────
  { retailHeading: 'BassX Pro Wireless ANC', category: 'Electronics', department: 'Audio', regularPrice: 24999, discountPrice: 19499, taxRate: 18, imgs: 'electronics' },
  { retailHeading: 'Crystal 4K Smartwatch', category: 'Electronics', department: 'Wearable', regularPrice: 18999, discountPrice: 14999, taxRate: 18, imgs: 'electronics' },
  { retailHeading: 'HoloPod Earbuds Ultra', category: 'Electronics', department: 'Audio', regularPrice: 12999, discountPrice: 9999, taxRate: 18, imgs: 'electronics' },
  { retailHeading: 'ProCharge 100W GaN Hub', category: 'Electronics', department: 'Accessories', regularPrice: 4999, discountPrice: 3499, taxRate: 18, imgs: 'electronics' },
  { retailHeading: 'ZeroLatency Gaming Mouse', category: 'Electronics', department: 'Gaming', regularPrice: 6999, discountPrice: 4999, taxRate: 18, imgs: 'electronics' },
  { retailHeading: 'AuraGlow LED Desk Setup', category: 'Electronics', department: 'Gaming', regularPrice: 8999, discountPrice: 6999, taxRate: 18, imgs: 'electronics' },
  { retailHeading: 'SpaceGrip Phone Stand', category: 'Electronics', department: 'Mobile', regularPrice: 1999, discountPrice: 1299, taxRate: 18, imgs: 'electronics' },
  { retailHeading: 'ryzeKey Pro Mechanical', category: 'Electronics', department: 'Computing', regularPrice: 9999, discountPrice: 7499, taxRate: 18, imgs: 'electronics' },
  { retailHeading: 'Nano Cam 4K Action', category: 'Electronics', department: 'Photography', regularPrice: 29999, discountPrice: 24499, taxRate: 18, imgs: 'electronics' },
  { retailHeading: 'SleepSync Smart Band', category: 'Electronics', department: 'Wearable', regularPrice: 7999, discountPrice: 5999, taxRate: 18, imgs: 'electronics' },
  { retailHeading: 'Titan 65W Fast Charger', category: 'Electronics', department: 'Mobile', regularPrice: 2499, discountPrice: 1799, taxRate: 18, imgs: 'electronics' },
  { retailHeading: 'ClearView 27" Monitor', category: 'Electronics', department: 'Computing', regularPrice: 34999, discountPrice: 27999, taxRate: 18, imgs: 'electronics' },
  { retailHeading: 'SoundBar Neo 2.1', category: 'Electronics', department: 'Audio', regularPrice: 14999, discountPrice: 11499, taxRate: 18, imgs: 'electronics' },
  { retailHeading: 'FlexTab Drawing Pad', category: 'Electronics', department: 'Productivity', regularPrice: 19999, discountPrice: 15999, taxRate: 18, imgs: 'electronics' },
  { retailHeading: 'Luna Smart Projector', category: 'Electronics', department: 'Entertainment', regularPrice: 44999, discountPrice: 36999, taxRate: 18, imgs: 'electronics' },
  { retailHeading: 'Compact Disc Recorder', category: 'Electronics', department: 'Audio', regularPrice: 5499, discountPrice: 3999, taxRate: 18, imgs: 'electronics' },
  { retailHeading: 'ThermalView Night Cam', category: 'Electronics', department: 'Security', regularPrice: 24999, discountPrice: 19999, taxRate: 18, imgs: 'electronics' },
  { retailHeading: 'UltraLink WiFi 6 Router', category: 'Electronics', department: 'Networking', regularPrice: 7999, discountPrice: 5999, taxRate: 18, imgs: 'electronics' },
  { retailHeading: 'VibePod Neck Speaker', category: 'Electronics', department: 'Audio', regularPrice: 8999, discountPrice: 6999, taxRate: 18, imgs: 'electronics' },
  { retailHeading: 'Charge Pad Trio Wireless', category: 'Electronics', department: 'Mobile', regularPrice: 3999, discountPrice: 2999, taxRate: 18, imgs: 'electronics' },

  // ── BEAUTY (20) ──────────────────────────────
  { retailHeading: 'Luxe Glow Serum 30ml', category: 'Beauty', department: 'Skincare', regularPrice: 3999, discountPrice: 2999, taxRate: 18, imgs: 'beauty' },
  { retailHeading: 'Onyx Velvet Matte Lipstick', category: 'Beauty', department: 'Makeup', regularPrice: 1499, discountPrice: 999, taxRate: 18, imgs: 'beauty' },
  { retailHeading: 'Crystal Clear Moisturiser', category: 'Beauty', department: 'Skincare', regularPrice: 2499, discountPrice: 1799, taxRate: 18, imgs: 'beauty' },
  { retailHeading: 'AromaSphere Eau De Parfum', category: 'Beauty', department: 'Fragrance', regularPrice: 6999, discountPrice: 4999, taxRate: 18, imgs: 'beauty' },
  { retailHeading: 'GoldLeaf Eye Cream', category: 'Beauty', department: 'Skincare', regularPrice: 4499, discountPrice: 3299, taxRate: 18, imgs: 'beauty' },
  { retailHeading: 'ProBrush Set 12pc Rose', category: 'Beauty', department: 'Makeup', regularPrice: 2999, discountPrice: 1999, taxRate: 18, imgs: 'beauty' },
  { retailHeading: 'Charcoal Detox Mask', category: 'Beauty', department: 'Skincare', regularPrice: 1499, discountPrice: 999, taxRate: 18, imgs: 'beauty' },
  { retailHeading: 'Ultra Glow Foundation', category: 'Beauty', department: 'Makeup', regularPrice: 1999, discountPrice: 1399, taxRate: 18, imgs: 'beauty' },
  { retailHeading: 'Royal Jelly Hair Oil', category: 'Beauty', department: 'Haircare', regularPrice: 1799, discountPrice: 1249, taxRate: 18, imgs: 'beauty' },
  { retailHeading: 'Vitamin C Brightening Kit', category: 'Beauty', department: 'Skincare', regularPrice: 3499, discountPrice: 2499, taxRate: 18, imgs: 'beauty' },
  { retailHeading: 'Midnight Rose Perfume', category: 'Beauty', department: 'Fragrance', regularPrice: 8999, discountPrice: 6499, taxRate: 18, imgs: 'beauty' },
  { retailHeading: 'SPF50 Sun Shield Cream', category: 'Beauty', department: 'Skincare', regularPrice: 1999, discountPrice: 1399, taxRate: 18, imgs: 'beauty' },
  { retailHeading: 'Keratin Smooth Shampoo', category: 'Beauty', department: 'Haircare', regularPrice: 1299, discountPrice: 899, taxRate: 18, imgs: 'beauty' },
  { retailHeading: 'Retinol Night Renewal', category: 'Beauty', department: 'Skincare', regularPrice: 4999, discountPrice: 3699, taxRate: 18, imgs: 'beauty' },
  { retailHeading: 'Balayage Glossing Toner', category: 'Beauty', department: 'Haircare', regularPrice: 2499, discountPrice: 1699, taxRate: 18, imgs: 'beauty' },
  { retailHeading: 'Glitter Liner Duo Set', category: 'Beauty', department: 'Makeup', regularPrice: 999, discountPrice: 699, taxRate: 18, imgs: 'beauty' },
  { retailHeading: 'Hydra Boost Toner Mist', category: 'Beauty', department: 'Skincare', regularPrice: 1799, discountPrice: 1249, taxRate: 18, imgs: 'beauty' },
  { retailHeading: 'Pro Contour Palette', category: 'Beauty', department: 'Makeup', regularPrice: 2499, discountPrice: 1799, taxRate: 18, imgs: 'beauty' },
  { retailHeading: 'AloeSoothe Body Lotion', category: 'Beauty', department: 'Skincare', regularPrice: 999, discountPrice: 699, taxRate: 18, imgs: 'beauty' },
  { retailHeading: 'ryzeLash Mascara Black', category: 'Beauty', department: 'Makeup', regularPrice: 1299, discountPrice: 899, taxRate: 18, imgs: 'beauty' },

  // ── ACCESSORIES (10) ──────────────────────────
  { retailHeading: 'Obsidian Leather Wallet', category: 'Accessories', department: 'Leather', regularPrice: 3499, discountPrice: 2499, taxRate: 12, imgs: 'accessories' },
  { retailHeading: 'ryze Carbon Belt', category: 'Accessories', department: 'Leather', regularPrice: 2999, discountPrice: 1999, taxRate: 12, imgs: 'accessories' },
  { retailHeading: 'Titanium Dog-Tag Chain', category: 'Accessories', department: 'Jewellery', regularPrice: 4999, discountPrice: 3499, taxRate: 3, imgs: 'accessories' },
  { retailHeading: 'Wristband Sport Band', category: 'Accessories', department: 'Sport', regularPrice: 1499, discountPrice: 999, taxRate: 12, imgs: 'accessories' },
  { retailHeading: 'Minimalist Card Holder', category: 'Accessories', department: 'Leather', regularPrice: 1999, discountPrice: 1299, taxRate: 12, imgs: 'accessories' },
  { retailHeading: 'Aviator Sunglasses ryze', category: 'Accessories', department: 'Eyewear', regularPrice: 5999, discountPrice: 3999, taxRate: 18, imgs: 'accessories' },
  { retailHeading: 'Satin Pocket Square Set', category: 'Accessories', department: 'Formal', regularPrice: 1299, discountPrice: 899, taxRate: 5, imgs: 'accessories' },
  { retailHeading: 'Gym Duffel Pro Carbon', category: 'Accessories', department: 'Bags', regularPrice: 4499, discountPrice: 3299, taxRate: 18, imgs: 'accessories' },
  { retailHeading: 'Wool Blend Cap Classic', category: 'Accessories', department: 'Headwear', regularPrice: 1999, discountPrice: 1399, taxRate: 12, imgs: 'accessories' },
  { retailHeading: 'Gold Steel Cufflinks', category: 'Accessories', department: 'Formal', regularPrice: 2999, discountPrice: 1999, taxRate: 3, imgs: 'accessories' },

  // ── HOME (10) ──────────────────────────────
  { retailHeading: 'Marble Desk Organiser', category: 'Home', department: 'Office', regularPrice: 3499, discountPrice: 2499, taxRate: 18, imgs: 'home' },
  { retailHeading: 'Bamboo Zen Storage Box', category: 'Home', department: 'Organisation', regularPrice: 2999, discountPrice: 1999, taxRate: 18, imgs: 'home' },
  { retailHeading: 'ryzeScent Diffuser Set', category: 'Home', department: 'Fragrance', regularPrice: 4999, discountPrice: 3499, taxRate: 18, imgs: 'home' },
  { retailHeading: 'Ceramic Pour-Over Set', category: 'Home', department: 'Kitchen', regularPrice: 3999, discountPrice: 2799, taxRate: 18, imgs: 'home' },
  { retailHeading: 'Linen Weighted Blanket', category: 'Home', department: 'Bedroom', regularPrice: 7999, discountPrice: 5999, taxRate: 18, imgs: 'home' },
  { retailHeading: 'Geometric Mirror Frame', category: 'Home', department: 'Decor', regularPrice: 6999, discountPrice: 4999, taxRate: 18, imgs: 'home' },
  { retailHeading: 'Acacia Wood Cheese Set', category: 'Home', department: 'Kitchen', regularPrice: 2499, discountPrice: 1799, taxRate: 18, imgs: 'home' },
  { retailHeading: 'Smart Aroma Humidifier', category: 'Home', department: 'Wellness', regularPrice: 5499, discountPrice: 3999, taxRate: 18, imgs: 'home' },
  { retailHeading: 'Terrazzo Coaster Set 4', category: 'Home', department: 'Kitchen', regularPrice: 1999, discountPrice: 1299, taxRate: 18, imgs: 'home' },
  { retailHeading: 'Frosted Glass Planter', category: 'Home', department: 'Decor', regularPrice: 3499, discountPrice: 2299, taxRate: 18, imgs: 'home' },
]

const DESCRIPTIONS = {
  Footwear: 'Crafted with precision-engineered materials for unmatched comfort and style. Designed to perform across every terrain and occasion.',
  Apparel: 'Premium fabric with an ryze cut — engineered for movement, comfort, and lasting style. A wardrobe essential reinvented.',
  Electronics: 'Next-generation technology meets premium design. Built for performance, precision, and a seamless user experience.',
  Beauty: 'Formulated with clinically-tested actives and luxury ingredients. Designed to deliver visible, lasting results.',
  Accessories: 'Handcrafted from premium materials with meticulous attention to detail. Elevate every outfit and every moment.',
  Home: 'Designed to transform your space — a perfect balance of function, beauty, and lasting quality.',
}

const seed = async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI
    if (!uri) throw new Error('MONGODB_URI not found in .env')

    await mongoose.connect(uri)
    console.log('✅ Connected to MongoDB')

    // Find the first admin user to set as createdBy
    const admin = await User.findOne({ role: { $in: ['admin', 'staff'] } })
    if (!admin) throw new Error('No admin/staff user found. Please create one first.')
    console.log(`📦 Seeding as: ${admin.email}`)

    // Remove previously seeded products (those with searchKeywords containing 'seeded')
    const removed = await Product.deleteMany({ searchKeywords: 'seeded' })
    console.log(`🗑  Removed ${removed.deletedCount} previously seeded products`)

    const docs = PRODUCTS.map(p => {
      const imgs = UNSPLASH[p.imgs]
      const image1 = getRand(imgs)
      const image2 = getRand(imgs.filter(i => i !== image1) || imgs)
      return {
        retailHeading: p.retailHeading,
        longDescription: DESCRIPTIONS[p.category],
        category: p.category,
        department: p.department || '',
        regularPrice: p.regularPrice,
        discountPrice: p.discountPrice,
        deliveryCharge: Math.random() < 0.6 ? 0 : 99,
        sizes: p.sizes || [],
        colors: [
          { name: 'Black', hex: '#111111' },
          { name: 'White', hex: '#f5f5f5' },
        ],
        images: [image1, image2],
        rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
        reviews: randInt(0, 120),
        ordersCount: randInt(0, 500),
        inStock: true,
        taxRate: p.taxRate,
        searchKeywords: ['seeded', p.category.toLowerCase(), (p.department || '').toLowerCase()],
        createdBy: admin._id,
      }
    })

    const inserted = await Product.insertMany(docs)
    console.log(`✅ Successfully seeded ${inserted.length} products!`)
    console.log('💡 To remove them, delete products with searchKeyword "seeded" from Admin → Inventory.')
  } catch (err) {
    console.error('❌ Seeder Error:', err.message)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected')
  }
}

seed()
