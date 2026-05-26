import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { CheckCircle, ShoppingBag, ArrowRight, Package, Truck, Sparkles } from 'lucide-react'
import confetti from 'canvas-confetti'

export default function OrderSuccess() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const order = state?.order

  useEffect(() => {
    if (!order) {
      navigate('/shop')
      return
    }

    // Celebratory Confetti
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    const randomInRange = (min, max) => Math.random() * (max - min) + min

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now()
      if (timeLeft <= 0) return clearInterval(interval)

      const particleCount = 50 * (timeLeft / duration)
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } })
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } })
    }, 250)

    return () => clearInterval(interval)
  }, [order, navigate])

  if (!order) return null

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center px-6 pt-20">

      <div className="relative mb-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 12, stiffness: 200 }}
          className="w-32 h-32 rounded-full bg-green-500 flex items-center justify-center shadow-[0_0_50px_rgba(34,197,94,0.3)] relative z-10"
        >
          <CheckCircle className="w-16 h-16 text-white" />
        </motion.div>
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0, 0.5]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-full bg-green-500/20"
        />
        <div className="absolute -top-4 -right-4">
          <Sparkles className="w-8 h-8 text-[#c9a962] animate-bounce" />
        </div>
      </div>

      <div className="text-center max-w-xl">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-[#c9a962] font-black uppercase tracking-[0.4em] text-xs mb-4"
        >
          Transaction Successful
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-5xl sm:text-7xl font-outfit font-black text-white uppercase tracking-tighter mb-6"
        >
          ORDER PLACED
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-white/40 font-medium text-sm mb-12 px-8"
        >
          Your order <span className="text-white font-bold">#{order.orderCode}</span> has been confirmed.
          Our ryze team is now preparing your items for a premium delivery experience.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mb-12">
        {[
          { icon: <Package />, label: 'Confirmed', val: 'Order ID: #' + (order.orderCode || order._id).slice(-8) },
          { icon: <Truck />, label: 'Delivery', val: 'Processing' },
          { icon: <ShoppingBag />, label: 'Items', val: order.items.length + ' Premium Goods' }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + (i * 0.1) }}
            className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col items-center text-center group hover:border-[#c9a962]/20 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#c9a962] mb-3 group-hover:scale-110 transition-transform">
              {stat.icon}
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">{stat.label}</p>
            <p className="text-xs font-bold text-white">{stat.val}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <Link
          to="/shop"
          className="flex-1 h-16 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-[#c9a962] transition-all"
        >
          <ShoppingBag className="w-4 h-4" /> Continue Shopping
        </Link>
        <button
          onClick={() => navigate('/profile', { state: { tab: 'orders' } })}
          className="flex-1 h-16 border border-white/10 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-white/5 transition-all"
        >
          Track My Order <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  )
}
