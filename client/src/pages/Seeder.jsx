import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Loader2, Database } from 'lucide-react'
import { db } from '../config/firebase'
import { writeBatch, collection, doc, serverTimestamp, getDocs } from 'firebase/firestore'
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
  Footwear: 'Comfortable, durable everyday footwear designed to look good and feel good across daily wear.',
  Apparel: 'Comfortable, well-made fabric with a clean fit — an easy everyday wardrobe staple.',
  Electronics: 'Practical, modern tech built for reliable everyday performance and a simple user experience.',
  Beauty: 'A simple, everyday care formula. Please patch-test before first use and check the ingredients if you have sensitive skin.',
  Accessories: 'A well-made everyday accessory with a clean design to complement any outfit.',
  Home: 'A practical, good-looking piece designed to be useful and tidy in your space.',
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
  // ─── BATCH 3: RESEARCHED WINNERS (July 2026) ───
  // Staff notes below record the SUPPLIER's Meesho rating/price — for your sourcing
  // reference only. Customer-facing ratings stay 0 until real buyers review.
  {
    // SUPPLIER NOTE: Meesho ₹156 · 4.0★ · 1,972 reviews — excellent, proven seller
    retailHeading: 'Universal Stylus Pen — For Phone & Tablet',
    longDescription: 'Universal stylus pen that works on any touchscreen phone or tablet — no Bluetooth pairing or app needed. Fine-point disc tip lets you see exactly where you write, with a lightweight metal body and magnetic cap. Great for notes, drawing, and everyday tapping.',
    category: 'Accessories', department: 'Mobile', regularPrice: 899, discountPrice: 499, deliveryCharge: 0, taxRate: 18,
    searchKeywords: ['stylus', 'stylus pen', 'tablet pen', 'touch pen', 'drawing', 'notes', 'ipad pen'],
    images: ['https://images.meesho.com/images/products/778864502/xa079_512.webp'],
    supplierLink: 'https://www.meesho.com/stylus-pen-for-android-tablet-ios-all-touchscreen-devices-capacitive-universal-smart-pen-pencil-with-fine-point-disc-tip-lightweight-metal-body-and-magnetic-cover-for-mobile-phone-ipad-tab-black/p/cvprp2',
  },
  {
    // SUPPLIER NOTE: Meesho ₹183 · 3.8★ — viral content potential (cats chasing it)
    retailHeading: 'Self-Rolling LED Cat Toy Ball — Auto 360°',
    longDescription: 'Interactive cat toy ball that rolls and changes direction on its own, with colour LED lights to catch your cat\'s attention. USB rechargeable, so it keeps your cat playing hands-free while you relax. (Supervise your pet during play and switch it off when unattended.)',
    category: 'Home', department: 'Pet Supplies', regularPrice: 999, discountPrice: 599, deliveryCharge: 0, taxRate: 18,
    searchKeywords: ['cat toy', 'pet toy', 'laser toy', 'cat ball', 'interactive toy', 'kitten', 'pets'],
    images: ['https://images.meesho.com/images/products/947651962/h7k6a_512.webp'],
    supplierLink: 'https://www.meesho.com/mishtin-creationpack-of-1-smart-led-360-automatic-rotating-cat-toy-ball-with-multicolor-rgb-lights-usb-rechargeable-self-rolling-interactive-teaser-ball-intelligent-obstacle-avoidance-hands-free-exercise-toy-multicolor/p/fo7gxm',
  },
  {
    // SUPPLIER NOTE: Meesho ₹1,230 · 4.4★ · 19 reviews — highest-ticket item, ~₹1,200 profit
    retailHeading: 'Wall-Mounted Grain Dispenser — 6 Grid Kitchen Storage',
    longDescription: 'Wall-mounted 6-grid dry food dispenser for rice, dal, cereals, and snacks. Press the knob to pour out a measured amount — keeps grains sealed, fresh, and away from pests. Transparent compartments so you can see when it\'s time to refill. Mounts on a wall or stands on the counter.',
    category: 'Home', department: 'Kitchen', regularPrice: 3999, discountPrice: 2499, deliveryCharge: 0, taxRate: 18,
    searchKeywords: ['rice dispenser', 'grain storage', 'cereal dispenser', 'kitchen storage', 'organizer', 'food container'],
    images: ['https://images.meesho.com/images/products/933077075/xmyyz_512.webp'],
    supplierLink: 'https://www.meesho.com/wall-mounted-dry-food-dispenser-6-grid-cereal-dispensers-kitchen-food-storage-container-grain-for-kitchen-home-plastic-transparent/p/ffj2vn',
  },
  // ─── END BATCH 3 ───
  // ─── BATCH 2: 15 GADGET PICKS (real Meesho images + supplier links) ───
  {
    retailHeading: 'Mini Bluetooth Speaker — Pocket Size, Deep Bass',
    longDescription: 'Compact wireless Bluetooth speaker with surprisingly punchy bass for its size. Pairs in seconds and fits in your palm or pocket — great for desk, travel, and outdoors. (Sound and battery life vary by use.)',
    category: 'Electronics', department: 'Audio', regularPrice: 999, discountPrice: 699, deliveryCharge: 0, taxRate: 18,
    searchKeywords: ['bluetooth speaker', 'mini speaker', 'wireless speaker', 'portable speaker', 'bass'],
    images: ['https://images.meesho.com/images/products/651354127/uow2p_512.webp'],
    supplierLink: 'https://www.meesho.com/mini-bluetooth-speaker-best-bluetooth-speaker-mini-bluetooth-speaker-base-bluetooth-speaker/p/arss27',
  },
  {
    retailHeading: 'Smart Watch — Bluetooth Calling & Fitness Tracking',
    longDescription: 'Smart watch with a large HD touch display, Bluetooth calling, and fitness tracking (steps, heart rate, sleep). Works with Android and iOS, with multiple watch faces. A budget-friendly everyday smartwatch — not a medical device.',
    category: 'Electronics', department: 'Wearable', regularPrice: 2499, discountPrice: 1499, deliveryCharge: 0, taxRate: 18,
    searchKeywords: ['smart watch', 'smartwatch', 'fitness band', 'bluetooth calling', 'fitness tracker', 't800'],
    images: ['https://images.meesho.com/images/products/706268873/mfoad_512.webp'],
    supplierLink: 'https://www.meesho.com/pink-smart-t800-ultra-smart-watch-199-series-8-hd-display-campatible-for-ios-android-bluetooth-call-fitness-tracker-voice-assistanceorange1t800-ultra-smart-watch-199-series-8-hd-display-campatible-for-ios-android-bluetooth-call-fitness-tracker-voice-assistance/p/bohsjt',
  },
  {
    retailHeading: 'Portable Car Vacuum Cleaner — Cordless Handheld',
    longDescription: 'Cordless handheld vacuum for cars, desks, and small spaces. Rechargeable and lightweight, with a HEPA filter and nozzle attachments for tight corners. Great for crumbs, dust, and pet hair.',
    category: 'Electronics', department: 'Home Appliances', regularPrice: 1499, discountPrice: 899, deliveryCharge: 0, taxRate: 18,
    searchKeywords: ['car vacuum', 'vacuum cleaner', 'handheld vacuum', 'cordless vacuum', 'car cleaning'],
    images: ['https://images.meesho.com/images/products/962207552/i6tpb_512.webp'],
    supplierLink: 'https://www.meesho.com/portable-cordless-mini-vacuum-cleaner-for-car-home-rechargeable-handheld-dust-cleaner-with-hepa-filter-multi-nozzle-attachments/p/fwvg3k',
  },
  {
    retailHeading: 'Foldable Laptop Stand — Adjustable Aluminium',
    longDescription: 'Adjustable aluminium laptop stand that folds flat to carry anywhere. Raises your screen to eye level for better posture and airflow, with multiple height angles. Anti-slip pads keep your laptop secure.',
    category: 'Electronics', department: 'Accessories', regularPrice: 1199, discountPrice: 699, deliveryCharge: 0, taxRate: 18,
    searchKeywords: ['laptop stand', 'foldable stand', 'laptop holder', 'desk setup', 'ergonomic'],
    images: ['https://images.meesho.com/images/products/394251281/jhnco_512.webp'],
    supplierLink: 'https://www.meesho.com/aluminum-alloy-adjustable-portable-foldable-ergonomic-tablet-laptop-silver/p/6iq68h',
  },
  {
    retailHeading: 'Magnetic Wireless Charging Pad — Slim Fast Charge',
    longDescription: 'Slim magnetic wireless charging pad — just place your phone on top to charge, no cable fiddling. Minimalist design for desk or bedside. (Works with Qi-enabled phones; charging speed depends on your device.)',
    category: 'Accessories', department: 'Charging', regularPrice: 1199, discountPrice: 699, deliveryCharge: 0, taxRate: 18,
    searchKeywords: ['wireless charger', 'charging pad', 'magnetic charger', 'qi charger', 'fast charge'],
    images: ['https://images.meesho.com/images/products/907183321/zd1ub_512.webp'],
    supplierLink: 'https://www.meesho.com/sleek-magnetic-wireless-charging-pad-with-usb-connector-minimalist-fast-charging-solution-by-vortel-technology/p/f0434p',
  },
  {
    retailHeading: 'LED Ring Light — 10 Inch with 7ft Tripod',
    longDescription: '10-inch LED ring light with a 7-foot adjustable tripod stand. 3 colour modes and 10 brightness levels for soft, even light — perfect for reels, makeup, video calls, and photos. Phone holder included.',
    category: 'Electronics', department: 'Photography', regularPrice: 1999, discountPrice: 1299, deliveryCharge: 0, taxRate: 18,
    searchKeywords: ['ring light', 'led light', 'tripod', 'content creation', 'reels', 'youtube'],
    images: ['https://images.meesho.com/images/products/524460165/dktpz_512.webp'],
    supplierLink: 'https://www.meesho.com/10-inch-led-ring-light-with-7-feet-adjustable-tripod-stand-dimmable-lighting-with-3-color-modes-and-10-brightness-levels-ideal-for-makeup-photography-youtube-videos-tiktok-vlogging-live-streaming-and-online-meetings/p/8o901x',
  },
  {
    retailHeading: 'Power Bank 10000mAh — Fast Charge, Dual Output',
    longDescription: 'Compact 10,000mAh power bank with fast charging and dual output to charge two devices at once. Slim enough for your pocket or bag — keeps your phone going all day.',
    category: 'Electronics', department: 'Charging', regularPrice: 1699, discountPrice: 999, deliveryCharge: 0, taxRate: 18,
    searchKeywords: ['power bank', '10000mah', 'fast charging', 'portable charger', 'battery'],
    images: ['https://images.meesho.com/images/products/911473908/xvtza_512.webp'],
    supplierLink: 'https://www.meesho.com/signature-sigbank-17-power-bank-fast-charging-high-capacity-dual-output-compact-portable/p/f2o1ro',
  },
  {
    retailHeading: 'Mini Cool-Mist Humidifier — Colour LED Light',
    longDescription: 'Mini cool-mist humidifier with a soft colour-changing LED light. Quiet ultrasonic mist for bedrooms, desks, and small rooms. USB powered — add a few drops of your favourite aroma oil. (Decorative mist humidifier.)',
    category: 'Home', department: 'Appliances', regularPrice: 1199, discountPrice: 699, deliveryCharge: 0, taxRate: 18,
    searchKeywords: ['humidifier', 'diffuser', 'cool mist', 'aroma', 'led', 'room decor'],
    images: ['https://images.meesho.com/images/products/641988951/ldzax_512.webp'],
    supplierLink: 'https://www.meesho.com/h2o-diffuser-with-colorful-led-lights-for-home-office-small-rooms-portable-cool-mist-small-quiet-air-humidifier-for-aroma-therapy-ultrasonic-essential-oil-diffuser-for-moisture-add-your-aroma-flavour-drops-random/p/am81uf',
  },
  {
    retailHeading: 'RGB Music Bulb — Colour LED with Bluetooth Speaker',
    longDescription: 'Colour-changing LED bulb with a built-in Bluetooth speaker and remote. Set the mood with multiple colours and play music straight from the bulb. Fun for bedrooms, parties, and gaming setups. Standard B22 fitting.',
    category: 'Electronics', department: 'Smart Home', regularPrice: 1299, discountPrice: 799, deliveryCharge: 0, taxRate: 18,
    searchKeywords: ['smart bulb', 'led bulb', 'music bulb', 'rgb', 'bluetooth bulb', 'color changing'],
    images: ['https://images.meesho.com/images/products/943770703/3ztab_512.webp'],
    supplierLink: 'https://www.meesho.com/rgb-music-bulb-with-bluetooth-speaker-led-light-remote-control-color-changing-lamp-pack-of-1/p/flwa4v',
  },
  {
    retailHeading: 'Mobile Gaming Trigger Set — with Finger Sleeves',
    longDescription: 'Mobile gaming trigger set with finger sleeves — sensitive shoulder buttons for faster aim-and-shoot in games like BGMI and Free Fire. Clips onto most phones. Includes anti-sweat finger sleeves.',
    category: 'Accessories', department: 'Gaming', regularPrice: 699, discountPrice: 399, deliveryCharge: 0, taxRate: 18,
    searchKeywords: ['gaming trigger', 'mobile gaming', 'pubg trigger', 'finger sleeves', 'game controller'],
    images: ['https://images.meesho.com/images/products/941935038/obsxv_512.webp'],
    supplierLink: 'https://www.meesho.com/gaming-trigger-red-pack-of-1-finger-sleeves-pack-of-5/p/fksxq6',
  },
  {
    retailHeading: 'Insulated Steel Water Bottle — Hot & Cold 500ml',
    longDescription: 'Double-wall vacuum insulated stainless steel bottle — keeps drinks hot or cold for hours. Leak-proof and BPA-free 304 food-grade steel. Great for school, gym, office, and travel.',
    category: 'Home', department: 'Kitchen', regularPrice: 1199, discountPrice: 699, deliveryCharge: 0, taxRate: 18,
    searchKeywords: ['water bottle', 'steel bottle', 'insulated', 'flask', 'hot cold', 'vacuum bottle'],
    images: ['https://images.meesho.com/images/products/599955564/m4rqw_512.webp'],
    supplierLink: 'https://www.meesho.com/sparnux-stainless-steel-vacuum-flask-500ml-24-hr-hot-cold-water-bottle-double-wall-insulated-leak-proof-bpa-free-304-food-grade-steel-travel-office-sports-home-use/p/9x74oc',
  },
  {
    retailHeading: 'Selfie Stick Tripod — with Remote & Light',
    longDescription: 'Extendable selfie stick that doubles as a tripod, with a wireless remote and a small selfie light. Lightweight and foldable — perfect for reels, vlogs, and group photos. Fits most phones.',
    category: 'Accessories', department: 'Photography', regularPrice: 1299, discountPrice: 799, deliveryCharge: 0, taxRate: 18,
    searchKeywords: ['selfie stick', 'tripod', 'phone stand', 'reels', 'vlogging', 'remote'],
    images: ['https://images.meesho.com/images/products/603881975/t3o9u_512.webp'],
    supplierLink: 'https://www.meesho.com/56-ft-170-cm-long-selfie-stick-r1s-l-large-with-wireless-remote-and-selfie-light-tripod-stand-portable-lightweight-compatible-with-all-mobiles/p/9zjabb',
  },
  {
    retailHeading: 'Foldable Storage Organizer Box — Multipurpose',
    longDescription: 'Foldable fabric storage box for clothes, toys, books, and seasonal items. Sturdy when open and folds flat when not in use. Keeps wardrobes, shelves, and drawers tidy.',
    category: 'Home', department: 'Organisation', regularPrice: 899, discountPrice: 499, deliveryCharge: 0, taxRate: 18,
    searchKeywords: ['storage box', 'organizer', 'foldable', 'wardrobe', 'cloth organizer', 'storage'],
    images: ['https://images.meesho.com/images/products/557483911/xzfn1_512.webp'],
    supplierLink: 'https://www.meesho.com/stow-craft-multipurposes-rectangular-foldable-storage-box-drawer-storage-and-cloth-organizer-storage-box-for-toys-storage-box-clothes-pack-of-1/p/97wtc7',
  },
  {
    retailHeading: 'Handheld Garment Steamer — Portable Wrinkle Remover',
    longDescription: 'Portable handheld garment steamer that smooths wrinkles from clothes in minutes — no ironing board needed. Lightweight and quick to heat; great for home, office, and travel. (Use on suitable fabrics and follow the manual.)',
    category: 'Home', department: 'Appliances', regularPrice: 1699, discountPrice: 999, deliveryCharge: 0, taxRate: 18,
    searchKeywords: ['garment steamer', 'steamer', 'wrinkle remover', 'portable iron', 'clothes steamer'],
    images: ['https://images.meesho.com/images/products/645040666/mgcft_512.webp'],
    supplierLink: 'https://www.meesho.com/portable-micro-steam-green-handheld-garment-steamer-dry-and-wet-wrinkles-removing-lightweight-steamer-for-home-office/p/ao1gka',
  },
  {
    retailHeading: 'Dish Cleaning Brush — Built-in Soap Dispenser',
    longDescription: 'Dish cleaning brush with a built-in soap dispenser in the handle — press to release liquid as you scrub. Keeps hands out of greasy water, with a replaceable scrubber head. Handy for dishes, pans, and sinks.',
    category: 'Home', department: 'Kitchen', regularPrice: 799, discountPrice: 449, deliveryCharge: 0, taxRate: 18,
    searchKeywords: ['dish brush', 'cleaning brush', 'soap dispenser', 'kitchen', 'scrubber', 'dishwashing'],
    images: ['https://images.meesho.com/images/products/790988798/wjs4m_512.webp'],
    supplierLink: 'https://www.meesho.com/tar-brush-dish-cleaning-brush-with-built-in-liquid-dispenser-palm-scrubber-with-soap-dispenser/p/d2xmv2',
  },
  // ─── END BATCH 2 ───
  // ─── NEW LAUNCH PICKS (2026) ───
  // TODO before publishing each: order a sample, replace `images` with your REAL product photos,
  // and add the `supplierLink` to the exact listing you ordered from.
  {
    retailHeading: 'Sunset Projection Lamp — Aesthetic Room Glow',
    longDescription: 'A small LED lamp that projects a warm sunset glow onto your walls and ceiling. Adjustable angle to aim the light where you want, USB powered. Great for photos, video backdrops, and a cosy room mood. Note: this is a decorative mood light, not a main room light.',
    category: 'Home',
    department: 'Lighting',
    regularPrice: 1499,
    discountPrice: 899,
    deliveryCharge: 0,
    taxRate: 18,
    searchKeywords: ['sunset lamp', 'projection light', 'room decor', 'aesthetic', 'mood light', 'led lamp', 'rainbow lamp'],
    images: [
      'https://images.meesho.com/images/products/947152174/2zlf7_512.webp',
      'https://images.meesho.com/images/products/947152174/sdl6m_512.webp',
      'https://images.meesho.com/images/products/947152174/tboil_512.webp',
      'https://images.meesho.com/images/products/947152174/1skvg_512.webp',
    ],
    supplierLink: 'https://www.meesho.com/sunset-lamp-projector-16-color-led-light-desk-lamp-rainbow-night-light-360-rotation-romantic-sunlight-for-bedroom-party-photography-with-remote-sunset-lamp/p/fnwram',
  },
  {
    retailHeading: 'Electric Scalp & Head Massager — Handheld Vibrating',
    longDescription: 'Handheld battery-operated scalp and head massager with soft nodes and gentle vibration. Simple one-button operation. A relaxing self-care tool to unwind after study or work. (Relaxation aid only — results vary from person to person.)',
    category: 'Beauty',
    department: 'Wellness',
    regularPrice: 1299,
    discountPrice: 799,
    deliveryCharge: 0,
    taxRate: 18,
    searchKeywords: ['scalp massager', 'head massager', 'hair', 'relax', 'self care', 'massage', 'asmr'],
    images: [
      'https://images.meesho.com/images/products/929380952/qi4ba_512.webp',
      'https://images.meesho.com/images/products/929380952/oomaj_512.webp',
    ],
    supplierLink: 'https://www.meesho.com/scalp-massage-electric-massager-multicolour-head-massager-hair-massager-for-hair-growth-scalp-massager-head-massager-vibrating-machine-body-massager/p/fdbuxk',
  },
  {
    retailHeading: 'Mini Galaxy Star Projector — Ceiling Night Light',
    longDescription: 'Projects stars and a soft nebula glow across your ceiling and walls. Multiple colour modes and adjustable brightness, USB powered with a timer option. Popular for bedrooms, study corners, and relaxing in the evening.',
    category: 'Electronics',
    department: 'Smart Home',
    regularPrice: 3499,
    discountPrice: 2199,
    deliveryCharge: 0,
    taxRate: 18,
    searchKeywords: ['galaxy projector', 'star projector', 'night light', 'room decor', 'led projector', 'ceiling light', 'nebula'],
    images: [
      'https://images.meesho.com/images/products/447360387/75yop_512.webp',
      'https://images.meesho.com/images/products/447360387/aerfu_512.webp',
      'https://images.meesho.com/images/products/447360387/mpnnm_512.webp',
      'https://images.meesho.com/images/products/447360387/gg23z_512.webp',
    ],
    supplierLink: 'https://www.meesho.com/astronaut-galaxy-star-projector-night-light-with-timer-star-projector-360rotation-magnetic-head-decorating-bedroom-home-theater-kids-room-study-and-playroom-night-light-astronaut-led-projection-lamp-with-remote-control-with-usb-cable/p/7echhf',
  },
  {
    retailHeading: 'Heatless Curling Rope Set — No-Heat Overnight Curls',
    longDescription: 'A soft heatless curling set — wrap slightly damp hair around the rope, leave it in (overnight works well), then unwrap for waves with no heat damage. Reusable and travel-friendly. Results vary with hair type and how long you leave it in.',
    category: 'Beauty',
    department: 'Hair',
    regularPrice: 999,
    discountPrice: 599,
    deliveryCharge: 0,
    taxRate: 18,
    searchKeywords: ['heatless curls', 'curling rope', 'hair curler', 'no heat', 'beauty', 'hair styling', 'curl set'],
    images: [
      'https://images.meesho.com/images/products/608377386/dzxm9_512.webp',
      'https://images.meesho.com/images/products/608377386/3qoun_512.webp',
    ],
    supplierLink: 'https://www.meesho.com/shopkite-heatless-hair-curler-set-pack-of-3-satin-flexible-curling-rods-with-hook-for-overnight-no-heat-curls-soft-rollers-for-all-hair-types-brown/p/a27mzu',
  },
  {
    retailHeading: 'Acupressure Neck Relaxer — Tech-Neck Tension Relief',
    longDescription: 'A simple neck cradle you lie back on for around 10 minutes to help ease neck and shoulder tension from long phone or desk use. Lightweight and easy to store. This is a relaxation aid, not a medical device — stop use if you feel pain, and see a doctor for ongoing issues.',
    category: 'Beauty',
    department: 'Wellness',
    regularPrice: 1199,
    discountPrice: 699,
    deliveryCharge: 0,
    taxRate: 18,
    searchKeywords: ['neck relaxer', 'cervical traction', 'neck massager', 'tech neck', 'shoulder relief', 'wellness', 'posture'],
    images: [
      'https://images.meesho.com/images/products/600754228/uqtro_512.webp',
    ],
    supplierLink: 'https://www.meesho.com/ukarus-neck-stretcher-for-neck-relief-neck-and-shoulder-relaxer-cervical-spine-traction-device-to-relieve-neck-and-shoulder-fatigue-and-pain-chiropractic-pillow-relief-tmj-muscle-pain-blue/p/9xo8xg',
  },
  // ─── END NEW LAUNCH PICKS ───
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
    images: [
      'https://images.meesho.com/images/products/660475347/g4hqt_512.webp',
      'https://images.meesho.com/images/products/660475347/ri0ny_512.webp',
      'https://images.meesho.com/images/products/660475347/sl0jr_512.webp',
      'https://images.meesho.com/images/products/660475347/uymgj_512.webp',
    ],
    supplierLink: 'https://www.meesho.com/5-meter-smart-rgb-led-strip-lights-with-app-remote-music-sync-light-for-room-gaming-party-diwali-home-decoration/p/ax8a1f',
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
    images: [
      'https://images.meesho.com/images/products/640427710/nzrru_512.webp',
      'https://images.meesho.com/images/products/640427710/3oo8u_512.webp',
      'https://images.meesho.com/images/products/640427710/kj3fz_512.webp',
      'https://images.meesho.com/images/products/640427710/vldho_512.webp',
    ],
    supplierLink: 'https://www.meesho.com/decent-hub-f16-magnetic-phone-mountholder-for-car-super-strong-magnet-universal-car-mount-dashboard-360-rotation-for-car-desk-office-home-kitchen-for-all-smartphones/p/alal6m',
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
    images: [
      'https://images.meesho.com/images/products/738774352/348uy_512.webp',
      'https://images.meesho.com/images/products/738774352/j9edv_512.webp',
      'https://images.meesho.com/images/products/738774352/zhmg9_512.webp',
      'https://images.meesho.com/images/products/738774352/tppsm_512.webp',
    ],
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
    images: [
      'https://images.meesho.com/images/products/94237492/lurat_512.webp',
      'https://images.meesho.com/images/products/94237492/aoryb_512.webp',
      'https://images.meesho.com/images/products/94237492/nvg3d_512.webp',
      'https://images.meesho.com/images/products/94237492/vvphm_512.webp',
    ],
    supplierLink: 'https://www.meesho.com/retrack-set-of-2pc-pop-socket-collapsible-grip-stand-for-phones-and-tablets/p/1k3u44',
  },
  {
    retailHeading: 'SmartViz Posture Corrector — Lycra Back & Shoulder Support',
    longDescription: 'Fix your posture in weeks, not months. Premium Lycra fabric — soft, breathable, and stretchy unlike cheap neoprene belts. Gently pulls your shoulders back to align your spine naturally. Universal free size fits all body types — men and women. Wear under any clothing at college, office, or home. Helps with back pain, shoulder pain, and poor posture from long sitting. Cash on delivery available. Delivered in 5–7 days.',
    category: 'Health',
    department: 'Wellness',
    regularPrice: 699,
    discountPrice: 499,
    deliveryCharge: 0,
    taxRate: 12,
    searchKeywords: ['posture corrector', 'back support', 'posture belt', 'back brace', 'spine support', 'shoulder support', 'pain relief', 'smartviz', 'lycra'],
    images: [
      'https://images.meesho.com/images/products/869103287/tgonh_512.webp',
    ],
    supplierLink: 'https://www.meesho.com/smartviz-relieves-back-pain-posture-corrector-for-men-and-women-back-support-belt-for-pain-relief-improved-posture-and-shoulder-support-lycra-fabric-shoulder-support-belt-for-men-universal-size/p/edfwdz',
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
    images: [
      'https://images.meesho.com/images/products/895273562/rtpfc_512.webp',
      'https://images.meesho.com/images/products/895273562/uzfeo_512.webp',
      'https://images.meesho.com/images/products/895273562/kuh0t_512.webp',
      'https://images.meesho.com/images/products/895273562/uhsce_512.webp',
    ],
    supplierLink: 'https://www.meesho.com/mini-portable-rechargeable-handheld-personal-small-desk-fan-with-base-cute-design-fan-for-travelofficedesktop-kids-girls-indoor-outdoor-use-1pc-color-may-vary/p/et0ti2',
  },
  {
    retailHeading: 'Kitchen Storage Containers Set — 6 Pc Airtight, 1200ml Each',
    longDescription: 'Keep your kitchen organised with this 6-piece multipurpose airtight container set. Each jar holds around 1000ml — great for rice, dal, sugar, snacks, cereals, and dry fruits. Secure airtight lids lock in freshness and keep pests out. Stackable design saves shelf and fridge space. Food-safe plastic, easy to clean. Great for kitchen counters, fridge shelves, and pantry storage. Delivered in 5–6 days.',
    category: 'Home',
    department: 'Organisation',
    regularPrice: 499,
    discountPrice: 349,
    deliveryCharge: 0,
    taxRate: 18,
    searchKeywords: ['organizer', 'fridge organizer', 'storage container', 'kitchen storage', 'airtight container', 'food container', '6 piece'],
    images: [
      'https://images.meesho.com/images/products/345879298/l2ewr_512.webp',
      'https://images.meesho.com/images/products/345879298/puocg_512.webp',
      'https://images.meesho.com/images/products/345879298/fp5l3_512.webp',
      'https://images.meesho.com/images/products/345879298/znmld_512.webp',
    ],
    supplierLink: 'https://www.meesho.com/jolter-jar-pack-of-6-1000ml-section-plastic-storage-jar-and-container-square-home-utensils-masala-food-storage-kitchen-utility-airtight-boxes-box-items-kitchen-tools-rice-grocery-set-popula-dabba-spices-basket-fridge-organizer-dibba-barni-dani-fridge-for-vegetables-spice-rack-dryfruits/p/5pxe6a',
  },
  {
    retailHeading: '3-in-1 Fast Charging Cable — Type-C / Lightning / Micro',
    longDescription: 'One cable for every device — charges through Type-C, Lightning, and Micro-USB connectors. Supports fast charging on compatible devices. Durable braided, tangle-free design. (Charging speed depends on your device and adapter.)',
    category: 'Electronics',
    department: 'Charging',
    regularPrice: 399,
    discountPrice: 299,
    deliveryCharge: 0,
    taxRate: 18,
    searchKeywords: ['charging cable', 'type c', 'fast charge', '3 in 1', 'usb cable', 'charger', 'lightning'],
    images: [
      'https://images.meesho.com/images/products/793854859/qwjrs_512.webp',
      'https://images.meesho.com/images/products/793854859/nptao_512.webp',
      'https://images.meesho.com/images/products/793854859/kzkgj_512.webp',
      'https://images.meesho.com/images/products/793854859/wvk50_512.webp',
    ],
    supplierLink: 'https://www.meesho.com/3-in-1-120w-fast-charging-cable-6a-6ft-multi-connector-charging-cable/p/d4n2bv',
  },
  {
    retailHeading: 'Aesthetic Sticker Pack — 50 Pcs (Choose Your Style)',
    longDescription: 'Pack of 50 premium peel-and-stick stickers — waterproof, repositionable, zero sticky residue. Choose your style: Danish Pastel (soft pastels, Matisse art, room aesthetic wall collage) or JDM Cars (racing cars, anime car culture). Perfect for room walls, laptops, water bottles, journals, and phone cases. Delivered in 5–7 days. Free delivery. Available in 2 styles.',
    category: 'Home',
    department: 'Decor',
    regularPrice: 349,
    discountPrice: 249,
    deliveryCharge: 0,
    taxRate: 18,
    searchKeywords: ['wall stickers', 'room decor', 'aesthetic stickers', 'vinyl stickers', 'laptop stickers', 'jdm stickers', 'danish pastel', 'collage kit', 'pack of 50'],
    images: [
      'https://images.meesho.com/images/products/295794332/dp1tw_512.webp',
      'https://images.meesho.com/images/products/295794332/rlvle_512.webp',
      'https://images.meesho.com/images/products/295794332/nhqza_512.webp',
    ],
    colors: [
      { name: 'Danish Pastel', hex: '#86efac', images: ['', '', '', ''], supplierLink: 'https://www.meesho.com/peel-n-stick-photo-wall-collage-kit-50-pcs-danish-pastel-room-decor-aesthetic-matisse-wall-art-for-teen-girl-room-decor-small-posters-for-room-decoration-green/p/4w3wd8' },
      { name: 'JDM Cars', hex: '#ef4444', images: ['', '', '', ''], supplierLink: 'https://www.meesho.com/printsheds-pack-of-50-aesthetic-vinyl-stickers-of-racing-carsmultipurpose-stickers-for-decorating-laptopjournalguitarmobile-coverwater-bottlebike-helmetgaming-console/p/7t3e2g' },
    ],
    supplierLink: '',
  },
  {
    retailHeading: 'Wireless Bluetooth Neckband — 20Hr Playtime, Type-C',
    longDescription: 'Wireless Bluetooth 5.0 neckband with 10mm drivers for rich bass and clear sound. Up to 20+ hours of playtime on a full charge, with Type-C fast charging. ENC support for clearer voice calls. Magnetic earbuds that snap together, and a lightweight around-the-neck design for gym, commute, and everyday use.',
    category: 'Electronics',
    department: 'Audio',
    regularPrice: 999,
    discountPrice: 649,
    deliveryCharge: 0,
    taxRate: 18,
    searchKeywords: ['neckband', 'earphones', 'bluetooth', 'bass', 'wireless neckband', 'gym earphones', 'type c'],
    images: [
      'https://images.meesho.com/images/products/652211041/3mhcu_512.webp',
      'https://images.meesho.com/images/products/652211041/7fcui_512.webp',
      'https://images.meesho.com/images/products/652211041/qrwyy_512.webp',
      'https://images.meesho.com/images/products/652211041/qyj00_512.webp',
    ],
    supplierLink: 'https://www.meesho.com/onbiz-wireless-neckband-with-20-hrs-playtime-bluetooth-v50-enx-clear-voice-calls-and-10mm-clarity-drivers/p/asb59d',
  },
]

export default function Seeder() {
  const [loading, setLoading] = useState(false)
  const [complete, setComplete] = useState(false)
  const [dropshipLoading, setDropshipLoading] = useState(false)
  const [dropshipComplete, setDropshipComplete] = useState(false)
  const [dropshipAdded, setDropshipAdded] = useState(0)
  const [refreshLoading, setRefreshLoading] = useState(false)
  const [refreshDone, setRefreshDone] = useState(false)
  const [error, setError] = useState('')
  const { user, isStaff, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  // Restrict this tool to staff/admin only — it writes directly to the live product database.
  if (!authLoading && !isStaff) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-6 text-center font-jakarta">
        <div className="max-w-sm">
          <h1 className="text-white font-black text-xl mb-2">Staff access only</h1>
          <p className="text-white/50 text-sm mb-6">This page manages the product database and is restricted to staff accounts.</p>
          <button onClick={() => navigate('/')} className="px-6 py-3 rounded-xl bg-[#c9a962] text-black font-black text-xs uppercase tracking-widest">Back to Store</button>
        </div>
      </div>
    )
  }

  const handleDropshipSeed = async () => {
    if (!user) { setError('You must be logged in.'); return }
    setDropshipLoading(true)
    setError('')
    try {
      // Read what's already in the store so we never create duplicates.
      const existingSnap = await getDocs(collection(db, 'products'))
      const existingNames = new Set(
        existingSnap.docs.map(d => (d.data().retailHeading || '').trim().toLowerCase())
      )

      // Only add products whose name isn't already in the store.
      const toAdd = DROPSHIP_PRODUCTS.filter(
        p => !existingNames.has((p.retailHeading || '').trim().toLowerCase())
      )

      if (toAdd.length === 0) {
        setError('All of these products are already in your store — nothing new to add.')
        setDropshipLoading(false)
        return
      }

      const batch = writeBatch(db)
      toAdd.forEach(p => {
        const docRef = doc(collection(db, 'products'))
        batch.set(docRef, {
          ...p,
          rating: 0,
          reviews: 0,
          ordersCount: 0,
          inStock: true,
          sizes: p.sizes || [],
          colors: p.colors || [],
          sizeVariants: p.sizeVariants || [],
          customizable: p.customizable || false,
          customizationLabel: '',
          createdBy: user._id || 'system',
          createdAt: serverTimestamp()
        })
      })
      await batch.commit()
      setDropshipAdded(toAdd.length)
      setDropshipComplete(true)
    } catch (err) {
      setError(err?.message || 'Failed to add products.')
    } finally {
      setDropshipLoading(false)
    }
  }

  // Clears ALL existing products, then reloads the fresh catalog from code
  // (real images, honest names, 0 reviews). Orders & customers are untouched.
  const handleRefreshProducts = async () => {
    if (!user) { setError('You must be logged in.'); return }
    if (!window.confirm('This will DELETE all current products and reload the fresh catalog from code (real images + honest names). Your orders and customers are NOT affected. Continue?')) return
    setRefreshLoading(true)
    setError('')
    try {
      // 1. Delete every existing product (batched, Firestore limit ~500 per batch).
      const snap = await getDocs(collection(db, 'products'))
      let delBatch = writeBatch(db)
      let n = 0
      for (const d of snap.docs) {
        delBatch.delete(d.ref)
        n++
        if (n % 400 === 0) { await delBatch.commit(); delBatch = writeBatch(db) }
      }
      await delBatch.commit()

      // 2. Re-add the full catalog fresh from code.
      const addBatch = writeBatch(db)
      DROPSHIP_PRODUCTS.forEach(p => {
        const docRef = doc(collection(db, 'products'))
        addBatch.set(docRef, {
          ...p,
          rating: 0,
          reviews: 0,
          ordersCount: 0,
          inStock: true,
          sizes: p.sizes || [],
          colors: p.colors || [],
          sizeVariants: p.sizeVariants || [],
          customizable: p.customizable || false,
          customizationLabel: '',
          createdBy: user._id || 'system',
          createdAt: serverTimestamp()
        })
      })
      await addBatch.commit()
      setDropshipAdded(DROPSHIP_PRODUCTS.length)
      setRefreshDone(true)
    } catch (err) {
      setError(err?.message || 'Failed to refresh products.')
    } finally {
      setRefreshLoading(false)
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
          rating: 0,
          reviews: 0,
          ordersCount: 0,
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
            <p className="text-white font-bold mb-1">{dropshipAdded} New Product{dropshipAdded === 1 ? '' : 's'} Added!</p>
            <p className="text-white/40 text-xs">Duplicates already in your store were skipped. Go to Staff Dashboard → Inventory to add your images.</p>
            <button onClick={() => navigate('/staff/dashboard')} className="mt-4 bg-[#c9a962] text-black font-black px-6 py-2 rounded-xl text-sm uppercase">
              Open Inventory
            </button>
          </div>
        ) : refreshDone ? (
          <div className="text-center py-6 border border-green-500/20 rounded-2xl bg-green-500/5 mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
            <p className="text-white font-bold mb-1">Catalog Refreshed — {dropshipAdded} Products Loaded!</p>
            <p className="text-white/40 text-xs">Every product now has its real images and honest name. Open the store to see them.</p>
            <button onClick={() => navigate('/shop')} className="mt-4 bg-[#c9a962] text-black font-black px-6 py-2 rounded-xl text-sm uppercase">
              View Store
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

            {/* Refresh / reload products from code */}
            <div className="border border-green-500/30 rounded-2xl p-5 bg-green-500/5 mb-6">
              <p className="text-green-400 font-black text-sm uppercase tracking-widest mb-1">Refresh Products</p>
              <p className="text-white/50 text-xs mb-4">Replaces all current products with the latest catalog from code — real images, honest names, fresh start. Clears old / duplicate / stock-image products. (Your orders &amp; customers are not affected.)</p>
              <button
                onClick={handleRefreshProducts}
                disabled={refreshLoading}
                className="w-full bg-green-500 text-black font-black py-3 rounded-xl text-xs uppercase tracking-wide hover:bg-green-400 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {refreshLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Refreshing…</> : '↻ Refresh All Products (Real Images)'}
              </button>
            </div>

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
