import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, MapPin, Loader2, CheckCircle2, ChevronRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { orderService } from '../services/firebaseService'
import OptimizedImage from '../components/OptimizedImage'

export default function Orders() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    const fetchOrders = async () => {
      try {
        const data = await orderService.getMyOrders()
        setOrders(data)
      } catch (err) {
        console.error('Failed to fetch orders', err)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [user, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#c9a962] animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white pt-32 pb-24 font-jakarta">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-[#c9a962] rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(201,169,98,0.3)]">
              <Package className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-5xl font-outfit font-black uppercase tracking-tighter">Your Orders</h1>
              <p className="text-[10px] sm:text-xs text-[#c9a962] font-black tracking-[0.4em] uppercase mt-1">Global Delivery Array</p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-6">
          {orders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-[#111113] py-32 rounded-[3rem] border border-white/5 flex flex-col items-center justify-center text-center"
            >
              <Package className="w-20 h-20 text-white/5 mb-6" />
              <h3 className="text-xl font-outfit font-black uppercase tracking-widest text-white/40 mb-2">No Mandates Found</h3>
              <p className="text-xs text-white/20 font-medium">Your ryze order history will appear here.</p>
              <button
                onClick={() => navigate('/shop')}
                className="mt-8 px-8 py-4 bg-white/5 hover:bg-[#c9a962] text-white hover:text-black rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
              >
                Explore Catalogue
              </button>
            </motion.div>
          ) : (
            orders.map((order, idx) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <OrderCard order={order} />
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

const OrderCard = ({ order }) => {
  const [isOpen, setIsOpen] = useState(false)
  const statusSteps = ['Pending', 'Processing', 'Shipped', 'Delivered']
  const currentStep = statusSteps.indexOf(order.orderStatus)

  return (
    <div className="bg-[#111113] rounded-[2rem] border border-white/5 overflow-hidden transition-all hover:border-[#c9a962]/20">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 cursor-pointer group"
      >
        <div className="flex items-center gap-6 w-full md:w-auto">
          <div className="w-24 h-24 rounded-2xl bg-white/5 p-1 relative overflow-hidden shrink-0 hidden sm:block">
            <OptimizedImage src={order.items[0]?.image} alt={order.items[0]?.name} width={100} quality={50} wrapperClassName="w-full h-full" />
            {order.items.length > 1 && (
              <div className="absolute inset-x-0 bottom-0 bg-black/80 py-1 text-center backdrop-blur-sm">
                <span className="text-[8px] font-black text-[#c9a962]">+{order.items.length - 1} MORE</span>
              </div>
            )}
          </div>
          <div>
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5 flex items-center gap-2">
              Order #{order.orderCode || order._id.slice(-8)}
              <span className="w-1 h-1 rounded-full bg-white/20" />
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
            <h4 className="font-bold text-white text-lg group-hover:text-[#c9a962] transition-colors line-clamp-1">{order.items[0]?.name} {order.items.length > 1 ? `and ${order.items.length - 1} more` : ''}</h4>
            <p className="text-sm font-black text-[#c9a962] mt-2">₹{order.totalAmount.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <div className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest ${order.orderStatus === 'Delivered' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-[#c9a962]/10 text-[#c9a962] border border-[#c9a962]/20'
            }`}>
            {order.orderStatus}
          </div>
          <div className="w-10 h-10 rounded-full bg-white/5 group-hover:bg-[#c9a962] flex items-center justify-center transition-colors">
            <ChevronRight className={`w-5 h-5 text-white/40 group-hover:text-black transition-transform ${isOpen ? 'rotate-90' : ''}`} />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden bg-black/20"
          >
            <div className="p-6 md:p-10 border-t border-white/5">
              {/* Timeline Stepper */}
              <div className="mb-12 hidden sm:block">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c9a962] mb-8 text-center">Mandate Genesis Timeline</p>
                <div className="flex items-center justify-between relative max-w-2xl mx-auto">
                  {/* Track line */}
                  <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -translate-y-1/2" />
                  <div
                    className="absolute top-1/2 left-0 h-0.5 bg-[#c9a962] -translate-y-1/2 transition-all duration-1000"
                    style={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%` }}
                  />

                  {statusSteps.map((step, i) => (
                    <div key={step} className="relative z-10 flex flex-col items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 border-2 ${i <= currentStep ? 'bg-[#c9a962] border-[#c9a962] text-black shadow-lg shadow-[#c9a962]/20' : 'bg-[#1a1a1c] border-white/5 text-white/20'
                        }`}>
                        {i === 0 && <Package className="w-5 h-5" />}
                        {i === 1 && <Loader2 className={`w-5 h-5 ${i === currentStep ? 'animate-spin' : ''}`} />}
                        {i === 2 && <MapPin className="w-5 h-5" />}
                        {i === 3 && <CheckCircle2 className="w-5 h-5" />}
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-tighter ${i <= currentStep ? 'text-white' : 'text-white/20'}`}>
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* GPS Tracking Nodes */}
              {order.trackingHistory && order.trackingHistory.length > 0 && (
                <div className="mb-12 p-6 md:p-8 rounded-3xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center justify-between mb-8">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-[#c9a962] flex items-center gap-2"><MapPin className="w-4 h-4" /> Live Logistics Feed</h5>
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">GPS Sync Active</span>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                    </div>
                  </div>
                  <div className="ml-4 space-y-6 border-l-2 border-[#c9a962]/20 relative">
                    {[...order.trackingHistory].reverse().map((node, idx) => (
                      <div key={idx} className="relative pl-8">
                        <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-4 border-[#0a0a0b] shadow-[0_0_10px_rgba(201,169,98,0.5)] ${idx === 0 ? 'bg-[#c9a962]' : 'bg-white/20'}`} />
                        <div className="bg-gradient-to-r from-white/5 to-transparent p-5 rounded-2xl border border-white/5 hover:border-[#c9a962]/30 transition-all font-outfit">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                            <h6 className={`text-sm sm:text-base font-black uppercase tracking-tight ${idx === 0 ? 'text-white' : 'text-white/60'}`}>{node.status}</h6>
                            <span className="text-[9px] font-black text-[#c9a962] uppercase tracking-widest">{new Date(node.date).toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-white/40 font-bold flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#c9a962]" /> {node.location}</p>
                          {node.description && <p className="text-xs text-white/50 mt-3 py-2 px-3 bg-black/40 rounded-xl border border-white/5 font-medium">{node.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-[#c9a962] mb-4">ryze Logistics Output</h5>
                  <div className="glass p-5 rounded-2xl border border-white/5 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-white/30 uppercase">Destination</span>
                      <span className="text-[10px] font-black text-white text-right max-w-[150px] truncate">{order.shippingAddress?.city}, {order.shippingAddress?.state}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-white/30 uppercase">ETA</span>
                      <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">{order.deliveryTime || 'Calibrating...'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-white/30 uppercase">Settlement Mechanism</span>
                      <span className="text-[10px] font-black text-[#c9a962] uppercase tracking-widest">{order.paymentMethod} • {order.paymentStatus}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-[#c9a962] mb-4">Secured Assets Manifest</h5>
                  <div className="space-y-3">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5">
                        <OptimizedImage src={item.image} alt={item.name} width={40} quality={40} wrapperClassName="w-12 h-12 rounded-lg overflow-hidden shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white/80 truncate">{item.name}</p>
                          <p className="text-[9px] font-black text-[#c9a962] uppercase mt-1">Qty: {item.qty} | Size: {item.size}</p>
                        </div>
                        <span className="text-xs font-black text-white px-2">₹{(item.price || 0).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
