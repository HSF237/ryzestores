/**
 * Firebase Service Layer — replaces all Express/MongoDB API calls
 * This module provides the same data contracts the React components expect
 */
import { auth, db } from '../config/firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile as fbUpdateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'
import {
  collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc,
  deleteDoc, query, where, orderBy, limit, serverTimestamp,
  increment as firestoreIncrement, writeBatch
} from 'firebase/firestore'

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH SERVICE
// ═══════════════════════════════════════════════════════════════════════════════

export const authService = {
  /** Sign up — creates Firebase Auth user + Firestore profile doc */
  async signup(name, email, password) {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await fbUpdateProfile(cred.user, { displayName: name })

    const userData = {
      name,
      email,
      role: 'customer',
      avatar: '',
      phone: '',
      age: null,
      dob: '',
      wishlist: [],
      cart: [],
      addresses: [],
      createdAt: serverTimestamp()
    }
    await setDoc(doc(db, 'users', cred.user.uid), userData)

    return {
      token: await cred.user.getIdToken(),
      user: { _id: cred.user.uid, ...userData }
    }
  },

  /** Login — returns user profile from Firestore */
  async login(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    const snap = await getDoc(doc(db, 'users', cred.user.uid))
    const userData = snap.exists() ? snap.data() : { name: cred.user.displayName, email, role: 'customer' }

    return {
      token: await cred.user.getIdToken(),
      user: { _id: cred.user.uid, ...userData }
    }
  },

  /** Get current user profile */
  async getMe() {
    const u = auth.currentUser
    if (!u) throw new Error('Not authenticated')
    const snap = await getDoc(doc(db, 'users', u.uid))
    if (!snap.exists()) throw new Error('User profile not found')
    return { user: { _id: u.uid, ...snap.data() } }
  },

  /** Logout */
  async logout() {
    await signOut(auth)
  },

  /** Auth state listener */
  onAuthChanged(callback) {
    return onAuthStateChanged(auth, callback)
  },

  /** Google Sign-In — works for both customers and staff */
  async googleSignIn() {
    const provider = new GoogleAuthProvider()
    const cred = await signInWithPopup(auth, provider)
    const userRef = doc(db, 'users', cred.user.uid)
    const snap = await getDoc(userRef)

    if (!snap.exists()) {
      // First time — create Firestore profile
      const userData = {
        name: cred.user.displayName || '',
        email: cred.user.email || '',
        role: 'customer',
        avatar: cred.user.photoURL || '',
        phone: '',
        age: null,
        dob: '',
        wishlist: [],
        cart: [],
        addresses: [],
        createdAt: serverTimestamp()
      }
      await setDoc(userRef, userData)
      return { token: await cred.user.getIdToken(), user: { _id: cred.user.uid, ...userData } }
    }

    // Existing user — fetch Firestore profile (may be staff/admin)
    return {
      token: await cred.user.getIdToken(),
      user: { _id: cred.user.uid, ...snap.data() }
    }
  },

  /** Get current Firebase user */
  getCurrentUser() {
    return auth.currentUser
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// USER SERVICE (profile, cart, wishlist, addresses)
// ═══════════════════════════════════════════════════════════════════════════════

export const userService = {
  /** Get sync data (cart + wishlist) — returns populated product data */
  async getSyncData() {
    const u = auth.currentUser
    if (!u) throw new Error('Not authenticated')
    const userSnap = await getDoc(doc(db, 'users', u.uid))
    if (!userSnap.exists()) return { cart: [], wishlist: [] }

    const userData = userSnap.data()

    // Populate cart products
    const cart = []
    for (const item of (userData.cart || [])) {
      const prodSnap = await getDoc(doc(db, 'products', item.product))
      if (prodSnap.exists()) {
        cart.push({
          product: { _id: prodSnap.id, ...prodSnap.data() },
          qty: item.qty,
          size: item.size,
          color: item.color
        })
      }
    }

    // Populate wishlist products
    const wishlist = []
    for (const productId of (userData.wishlist || [])) {
      const prodSnap = await getDoc(doc(db, 'products', productId))
      if (prodSnap.exists()) {
        wishlist.push({ _id: prodSnap.id, ...prodSnap.data() })
      }
    }

    return { cart, wishlist }
  },

  /** Update cart */
  async updateCart(cartData) {
    const u = auth.currentUser
    if (!u) throw new Error('Not authenticated')
    await updateDoc(doc(db, 'users', u.uid), { cart: cartData })
    return { cart: cartData }
  },

  /** Update wishlist */
  async updateWishlist(wishlistData) {
    const u = auth.currentUser
    if (!u) throw new Error('Not authenticated')
    await updateDoc(doc(db, 'users', u.uid), { wishlist: wishlistData })
    return { wishlist: wishlistData }
  },

  /** Get profile */
  async getProfile() {
    const u = auth.currentUser
    if (!u) throw new Error('Not authenticated')
    const snap = await getDoc(doc(db, 'users', u.uid))
    if (!snap.exists()) throw new Error('User not found')
    return { _id: u.uid, ...snap.data() }
  },

  /** Update profile */
  async updateProfile(data) {
    const u = auth.currentUser
    if (!u) throw new Error('Not authenticated')
    const { name, phone, age, dob, avatar } = data
    const updates = {}
    if (name !== undefined) updates.name = name
    if (phone !== undefined) updates.phone = phone
    if (age !== undefined) updates.age = age
    if (dob !== undefined) updates.dob = dob
    if (avatar !== undefined) updates.avatar = avatar
    await updateDoc(doc(db, 'users', u.uid), updates)
    const snap = await getDoc(doc(db, 'users', u.uid))
    return { _id: u.uid, ...snap.data() }
  },

  /** Get addresses */
  async getAddresses() {
    const u = auth.currentUser
    if (!u) throw new Error('Not authenticated')
    const snap = await getDoc(doc(db, 'users', u.uid))
    return snap.exists() ? (snap.data().addresses || []) : []
  },

  /** Add address */
  async addAddress(address) {
    const u = auth.currentUser
    if (!u) throw new Error('Not authenticated')
    const snap = await getDoc(doc(db, 'users', u.uid))
    const userData = snap.data()
    const addresses = userData.addresses || []

    // Generate a unique ID for the address
    const newAddr = { ...address, _id: crypto.randomUUID() }

    // If setting as default, unset others
    if (address.isDefault) {
      addresses.forEach(a => { a.isDefault = false })
    }

    addresses.push(newAddr)
    await updateDoc(doc(db, 'users', u.uid), { addresses })
    return addresses
  },

  /** Remove address */
  async removeAddress(addressId) {
    const u = auth.currentUser
    if (!u) throw new Error('Not authenticated')
    const snap = await getDoc(doc(db, 'users', u.uid))
    const userData = snap.data()
    const addresses = (userData.addresses || []).filter(a => a._id !== addressId)
    await updateDoc(doc(db, 'users', u.uid), { addresses })
    return addresses
  },

  /** Get all users (staff only) */
  async getAllUsers() {
    const snaps = await getDocs(collection(db, 'users'))
    return snaps.docs.map(d => ({
      _id: d.id,
      name: d.data().name,
      email: d.data().email,
      role: d.data().role,
      createdAt: d.data().createdAt
    }))
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCT SERVICE
// ═══════════════════════════════════════════════════════════════════════════════

export const productService = {
  /** Get all products */
  async getProducts(params = {}) {
    let q = query(collection(db, 'products'), where('inStock', '==', true))

    // We apply sorting & filtering client-side for flexibility
    const snaps = await getDocs(q)
    let products = snaps.docs.map(d => ({ _id: d.id, ...d.data() }))

    // Filter by category
    if (params.category && params.category !== 'All') {
      const cat = params.category.toLowerCase()
      products = products.filter(p =>
        p.category?.toLowerCase() === cat || p.department?.toLowerCase() === cat
      )
    }

    // Sort
    if (params.sort === 'price_asc') products.sort((a, b) => (a.discountPrice || 0) - (b.discountPrice || 0))
    else if (params.sort === 'price_desc') products.sort((a, b) => (b.discountPrice || 0) - (a.discountPrice || 0))
    else if (params.sort === 'rating') products.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    else products.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0)
      const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0)
      return dateB - dateA
    })

    // Limit
    if (params.limit) products = products.slice(0, Number(params.limit))

    return { products }
  },

  /** Get single product */
  async getProductById(id) {
    const snap = await getDoc(doc(db, 'products', id))
    if (!snap.exists()) throw new Error('Product not found.')
    return { product: { _id: snap.id, ...snap.data() } }
  },

  /** Create product (staff) */
  async createProduct(formDataOrObject) {
    const u = auth.currentUser
    if (!u) throw new Error('Not authenticated')

    let data = formDataOrObject
    let images = []

    // Handle FormData (file uploads)
    if (formDataOrObject instanceof FormData) {
      data = {}
      for (const [key, value] of formDataOrObject.entries()) {
        if (key === 'images') {
          // It's a File — upload to Firebase Storage
          if (value instanceof File) {
            const storageRef = ref(storage, `products/${Date.now()}_${value.name}`)
            const uploadResult = await uploadBytes(storageRef, value)
            const url = await getDownloadURL(uploadResult.ref)
            images.push(url)
          } else if (typeof value === 'string' && value.startsWith('http')) {
            images.push(value)
          }
        } else {
          data[key] = value
        }
      }
    }

    // Parse JSON fields
    const sizes = typeof data.sizes === 'string' ? JSON.parse(data.sizes) : data.sizes || []
    const colors = typeof data.colors === 'string' ? JSON.parse(data.colors) : data.colors || []
    const searchKeywords = typeof data.searchKeywords === 'string'
      ? data.searchKeywords.split(',').map(s => s.trim()).filter(Boolean)
      : data.searchKeywords || []

    // If images were passed as URL strings in the data object
    if (images.length === 0 && data.images) {
      images = Array.isArray(data.images) ? data.images : [data.images]
      images = images.filter(Boolean)
    }

    const product = {
      retailHeading: data.retailHeading || '',
      longDescription: data.longDescription || '',
      category: data.category || 'Accessories',
      regularPrice: Number(data.regularPrice) || 0,
      discountPrice: data.discountPrice ? Number(data.discountPrice) : null,
      deliveryCharge: Number(data.deliveryCharge) || 0,
      sizes,
      colors,
      images,
      department: data.department || data.category || '',
      taxRate: Number(data.taxRate) || 12,
      productVoucher: data.productVoucher || null,
      productVoucherDiscount: Number(data.productVoucherDiscount) || 0,
      searchKeywords,
      customizable: data.customizable === true || data.customizable === 'true' || false,
      customizationLabel: data.customizationLabel || '',
      rating: 4.5,
      reviews: 0,
      inStock: true,
      ordersCount: 0,
      createdBy: u.uid,
      createdAt: serverTimestamp()
    }

    const docRef = await addDoc(collection(db, 'products'), product)
    return { product: { _id: docRef.id, ...product } }
  },

  /** Update product (staff) */
  async updateProduct(id, formDataOrObject) {
    let data = formDataOrObject
    let images = []

    if (formDataOrObject instanceof FormData) {
      data = {}
      for (const [key, value] of formDataOrObject.entries()) {
        if (key === 'images') {
          if (value instanceof File) {
            const storageRef = ref(storage, `products/${Date.now()}_${value.name}`)
            const uploadResult = await uploadBytes(storageRef, value)
            const url = await getDownloadURL(uploadResult.ref)
            images.push(url)
          } else if (typeof value === 'string' && value.startsWith('http')) {
            images.push(value)
          }
        } else {
          data[key] = value
        }
      }
    }

    const updates = { ...data }

    if (images.length > 0) {
      updates.images = images
    } else if (data.images) {
      updates.images = Array.isArray(data.images) ? data.images : [data.images]
      updates.images = updates.images.filter(Boolean)
    }

    // Parse numeric fields
    if (updates.regularPrice) updates.regularPrice = Number(updates.regularPrice)
    if (updates.discountPrice) updates.discountPrice = Number(updates.discountPrice)
    if (updates.deliveryCharge) updates.deliveryCharge = Number(updates.deliveryCharge)
    if (updates.taxRate) updates.taxRate = Number(updates.taxRate)
    if (updates.productVoucherDiscount) updates.productVoucherDiscount = Number(updates.productVoucherDiscount)

    if (updates.sizes) updates.sizes = typeof updates.sizes === 'string' ? JSON.parse(updates.sizes) : updates.sizes
    if (updates.colors) updates.colors = typeof updates.colors === 'string' ? JSON.parse(updates.colors) : updates.colors
    if (updates.searchKeywords) {
      updates.searchKeywords = typeof updates.searchKeywords === 'string'
        ? updates.searchKeywords.split(',').map(s => s.trim()).filter(Boolean)
        : updates.searchKeywords
    }

    // Remove undefined / non-serializable fields
    delete updates.createdAt
    delete updates._id

    await updateDoc(doc(db, 'products', id), updates)
    const snap = await getDoc(doc(db, 'products', id))
    return { product: { _id: snap.id, ...snap.data() } }
  },

  /** Delete product (staff) */
  async deleteProduct(id) {
    await deleteDoc(doc(db, 'products', id))
    return { message: 'Product deleted.' }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ORDER SERVICE
// ═══════════════════════════════════════════════════════════════════════════════

export const orderService = {
  /** Create order */
  async createOrder(orderData) {
    const u = auth.currentUser
    if (!u) throw new Error('Not authenticated')

    const orderCode = 'RYZ-' + Math.random().toString(36).toUpperCase().substring(2, 10)

    const order = {
      customer: u.uid,
      customerName: u.displayName || '',
      customerEmail: u.email || '',
      items: orderData.items,
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod || 'COD',
      totalAmount: orderData.totalAmount,
      promoCode: orderData.promoCode || null,
      discountAmount: orderData.discountAmount || 0,
      razorpayOrderId: orderData.razorpayOrderId || null,
      razorpayPaymentId: orderData.razorpayPaymentId || null,
      razorpaySignature: orderData.razorpaySignature || null,
      paymentStatus: orderData.paymentMethod === 'COD' ? 'Pending' : 'Completed',
      orderStatus: 'Pending',
      deliveryTime: 'Assigning soon',
      orderCode,
      trackingHistory: [{
        status: 'Order Placed',
        location: 'RYZE System',
        description: 'Your mandate has been successfully logged.',
        date: new Date().toISOString()
      }],
      createdAt: serverTimestamp()
    }

    // Strip any lingering undefined values just in case
    Object.keys(order).forEach(key => {
      if (order[key] === undefined) order[key] = null;
    });

    const docRef = await addDoc(collection(db, 'orders'), order)

    // Clear user's cart
    await updateDoc(doc(db, 'users', u.uid), { cart: [] })

    // Increment ordersCount for products
    const productIds = [...new Set(orderData.items.map(i => i.product).filter(Boolean))]
    for (const pid of productIds) {
      try {
        await updateDoc(doc(db, 'products', pid), {
          ordersCount: firestoreIncrement(1)
        })
      } catch (e) {
        console.warn('Could not increment ordersCount for', pid, e)
      }
    }

    return { _id: docRef.id, ...order, createdAt: new Date().toISOString() }
  },

  /** Get my orders */
  async getMyOrders() {
    const u = auth.currentUser
    if (!u) throw new Error('Not authenticated')
    const q = query(
      collection(db, 'orders'),
      where('customer', '==', u.uid),
      orderBy('createdAt', 'desc')
    )
    const snaps = await getDocs(q)
    return snaps.docs.map(d => {
      const data = d.data()
      return {
        _id: d.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString?.() || data.createdAt
      }
    })
  },

  /** Get all orders (staff) */
  async getAllOrders() {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
    const snaps = await getDocs(q)
    return snaps.docs.map(d => {
      const data = d.data()
      return {
        _id: d.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString?.() || data.createdAt
      }
    })
  },

  /** Update order (staff) */
  async updateOrder(id, updates) {
    const snap = await getDoc(doc(db, 'orders', id))
    if (!snap.exists()) throw new Error('Order not found')

    const order = snap.data()
    const updatePayload = {}

    if (updates.orderStatus) updatePayload.orderStatus = updates.orderStatus
    if (updates.deliveryTime) updatePayload.deliveryTime = updates.deliveryTime
    if (updates.paymentStatus) updatePayload.paymentStatus = updates.paymentStatus

    if (updates.trackingUpdate && updates.trackingUpdate.status && updates.trackingUpdate.location) {
      const history = order.trackingHistory || []
      history.push({
        status: updates.trackingUpdate.status,
        location: updates.trackingUpdate.location,
        description: updates.trackingUpdate.description || '',
        date: new Date().toISOString()
      })
      updatePayload.trackingHistory = history
    }

    await updateDoc(doc(db, 'orders', id), updatePayload)
    const updated = await getDoc(doc(db, 'orders', id))
    const data = updated.data()
    return {
      _id: updated.id,
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString?.() || data.createdAt
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// REVIEW SERVICE
// ═══════════════════════════════════════════════════════════════════════════════

export const reviewService = {
  /** Create review */
  async createReview({ productId, rating, comment }) {
    const u = auth.currentUser
    if (!u) throw new Error('Not authenticated')

    // Check if user has purchased this product
    const ordersQuery = query(
      collection(db, 'orders'),
      where('customer', '==', u.uid)
    )
    const orderSnaps = await getDocs(ordersQuery)
    const hasPurchased = orderSnaps.docs.some(d => {
      const items = d.data().items || []
      const status = d.data().orderStatus
      return status !== 'Cancelled' && items.some(i => i.product === productId)
    })

    if (!hasPurchased) {
      throw new Error('Only verified purchasers can leave reviews.')
    }

    // Check for existing review
    const existingQuery = query(
      collection(db, 'reviews'),
      where('user', '==', u.uid),
      where('product', '==', productId)
    )
    const existingSnaps = await getDocs(existingQuery)
    if (!existingSnaps.empty) {
      throw new Error('You have already reviewed this product.')
    }

    const userSnap = await getDoc(doc(db, 'users', u.uid))
    const userName = userSnap.exists() ? userSnap.data().name : u.displayName || 'Anonymous'

    const review = {
      user: u.uid,
      userName,
      product: productId,
      rating: Number(rating),
      comment,
      createdAt: serverTimestamp()
    }

    const docRef = await addDoc(collection(db, 'reviews'), review)

    // Update product rating
    const allReviewsQuery = query(collection(db, 'reviews'), where('product', '==', productId))
    const allReviews = await getDocs(allReviewsQuery)
    const ratings = allReviews.docs.map(d => d.data().rating)
    const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length

    await updateDoc(doc(db, 'products', productId), {
      rating: parseFloat(avgRating.toFixed(1)),
      reviews: ratings.length
    })

    return {
      _id: docRef.id,
      ...review,
      user: { _id: u.uid, name: userName }
    }
  },

  /** Get product reviews */
  async getProductReviews(productId) {
    const q = query(
      collection(db, 'reviews'),
      where('product', '==', productId),
      orderBy('createdAt', 'desc')
    )
    const snaps = await getDocs(q)
    return snaps.docs.map(d => {
      const data = d.data()
      return {
        _id: d.id,
        ...data,
        user: { _id: data.user, name: data.userName || 'User' },
        createdAt: data.createdAt?.toDate?.()?.toISOString?.() || data.createdAt
      }
    })
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYTICS SERVICE
// ═══════════════════════════════════════════════════════════════════════════════

export const analyticsService = {
  async getDashboardStats() {
    // Orders
    const orderSnaps = await getDocs(collection(db, 'orders'))
    const orders = orderSnaps.docs.map(d => ({ _id: d.id, ...d.data() }))

    const totalOrders = orders.length
    const completedRevenue = orders
      .filter(o => o.paymentStatus === 'Completed')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0)
    const pendingRevenue = orders
      .filter(o => o.paymentStatus === 'Pending')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0)

    // Recent orders
    const recentOrders = orders
      .sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0)
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0)
        return dateB - dateA
      })
      .slice(0, 5)
      .map(o => ({
        ...o,
        customer: { name: o.customerName || 'Unknown', email: o.customerEmail || '' },
        createdAt: o.createdAt?.toDate?.()?.toISOString?.() || o.createdAt
      }))

    // Users
    const userSnaps = await getDocs(query(collection(db, 'users'), where('role', '==', 'customer')))
    const customerCount = userSnaps.size

    // Products
    const productSnaps = await getDocs(collection(db, 'products'))
    const products = productSnaps.docs.map(d => d.data())
    const productCount = products.length

    // Category stats
    const categoryMap = {}
    products.forEach(p => {
      const cat = p.category || 'Other'
      categoryMap[cat] = (categoryMap[cat] || 0) + 1
    })
    const categoryStats = Object.entries(categoryMap).map(([_id, count]) => ({ _id, count }))

    return {
      revenue: completedRevenue,
      pendingRevenue,
      ordersCount: totalOrders,
      customerCount,
      productCount,
      recentOrders,
      categoryStats
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAYMENT SERVICE (Razorpay stays server-side in future; for now COD-only)
// ═══════════════════════════════════════════════════════════════════════════════

export const paymentService = {
  /**
   * NOTE: Razorpay order creation requires a server-side secret key.
   * For now, this is a placeholder. You can either:
   * 1. Use Firebase Cloud Functions to handle Razorpay
   * 2. Use only COD for now
   * 3. Use Razorpay client-side test keys
   */
  async createRazorpayOrder({ amount }) {
    // This would need a Firebase Cloud Function in production
    // For now, return a mock order for test mode
    console.warn('Razorpay server-side order creation requires Cloud Functions. Using test mode.')
    return {
      id: 'order_' + Date.now(),
      amount: Math.round(amount * 100),
      currency: 'INR'
    }
  },

  async verifyPayment() {
    // Verification should happen server-side via Cloud Functions
    return { message: 'Payment verified (client-side)', verified: true }
  }
}
