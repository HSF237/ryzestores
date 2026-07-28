import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingBag, User, MapPin, CreditCard,
  Calendar, Clock, CheckCircle, Package,
  Truck, Search, Filter, X, ChevronRight,
  MoreVertical, ExternalLink, RotateCcw
} from 'lucide-react'
import { orderService } from '../services/firebaseService'

export default function OrderManager() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Order update data
  const [updateData, setUpdateData] = useState({
    orderStatus: '',
    deliveryTime: '',
    paymentStatus: ''
  })

  // Tracking update data
  const [trackingData, setTrackingData] = useState({
    status: '',
    location: '',
    description: ''
  })

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const data = await orderService.getAllOrders()
      console.log('ryze ORDER SYNC:', data) // Diagnostic Log
      setOrders(data)
    } catch (err) {
      console.error('Failed to fetch orders', err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (order) => {
    setSelectedOrder(order)
    setUpdateData({
      orderStatus: order.orderStatus,
      deliveryTime: order.deliveryTime,
      paymentStatus: order.paymentStatus
    })
    setTrackingData({ status: '', location: '', description: '' })
    setIsModalOpen(true)
  }

  const handleUpdate = async () => {
    try {
      const payload = { ...updateData }
      if (trackingData.status && trackingData.location) {
        payload.trackingUpdate = trackingData
      }

      await orderService.updateOrder(selectedOrder._id, payload)
      setIsModalOpen(false)
      fetchOrders()
    } catch (err) {
      console.error('Update failed', err)
      alert('Failed to update order')
    }
  }

  const handleRefresh = () => {
    setLoading(true)
    fetchOrders()
  }

  const filteredOrders = orders.filter(o => {
    const code = o.orderCode || ''
    const name = o.customer?.name || 'ryze Customer'
    const q = search.toLowerCase()
    return code.toLowerCase().includes(q) || name.toLowerCase().includes(q)
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'text-green-400 bg-green-400/10'
      case 'Cancelled': return 'text-red-400 bg-red-400/10'
      case 'Shipped': return 'text-blue-400 bg-blue-400/10'
      case 'Processing': return 'text-yellow-400 bg-yellow-400/10'
      default: return 'text-white/40 bg-white/5'
    }
  }

  if (loading) return (
    <div className="h-96 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#c9a962] border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-outfit font-black uppercase tracking-tighter mb-2">Order Vault</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-2 py-0.5 rounded-md bg-green-500/10 border border-green-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">DB SYNC ACTIVE</span>
            </div>
            <p className="text-white/40 text-xs font-medium">Control and fulfill ryze customer mandates.</p>
            <span className="bg-[#c9a962]/10 text-[#c9a962] text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">{orders.length} TOTAL</span>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input
              type="text"
              placeholder="Search Order ID or Customer..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm outline-none focus:border-[#c9a962]/50 transition-all font-medium"
            />
          </div>
          <button
            onClick={handleRefresh}
            className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white/40 hover:text-[#c9a962] hover:bg-[#c9a962]/10 transition-all group"
            title="Sync Vault"
          >
            <RotateCcw className={`w-5 h-5 ${loading ? 'animate-spin text-[#c9a962]' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredOrders.length > 0 ? filteredOrders.map((order, idx) => (
          <motion.div
            key={order._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => handleOpenModal(order)}
            className="group bg-[#111113] p-6 rounded-[2rem] border border-white/5 hover:border-[#c9a962]/30 transition-all cursor-pointer flex flex-col md:flex-row items-center gap-6"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 shrink-0">
              <Package className="w-8 h-8 group-hover:text-[#c9a962] group-hover:scale-110 transition-all" />
            </div>

            <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center gap-6 md:gap-12">
              <div>
                <p className="text-[10px] font-black uppercase text-white/20 tracking-widest mb-1">ryze Mandate</p>
                <h4 className="font-bold text-white tracking-tight">#{order.orderCode}</h4>
              </div>

              <div className="flex-1">
                <p className="text-[10px] font-black uppercase text-white/20 tracking-widest mb-1">Customer & Origin</p>
                <div className="flex items-center gap-2">
                  <User className="w-3 h-3 text-[#c9a962]" />
                  <h4 className="font-bold text-white/80 line-clamp-1">{order.customer?.name} / {order.shippingAddress?.city}</h4>
                </div>
              </div>

              <div className="hidden lg:block shrink-0">
                <p className="text-[10px] font-black uppercase text-white/20 tracking-widest mb-1">Primary Asset</p>
                <h4 className="text-xs font-bold text-white/40 line-clamp-1">{order.items[0]?.name} {order.items.length > 1 ? `+${order.items.length - 1}` : ''}</h4>
              </div>

              <div className="ml-auto flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase text-white/20 tracking-widest mb-1">Value</p>
                  <h4 className="font-bold text-[#c9a962]">₹{order.totalAmount.toLocaleString()}</h4>
                </div>
                {order.items?.some(i => i.supplierLink) && (
                  <div className="px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20 hidden sm:block">
                    Supplier Link
                  </div>
                )}
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/5 ${getStatusColor(order.orderStatus)}`}>
                  {order.orderStatus}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-10 w-[1px] bg-white/5 hidden md:block" />
              <button className="p-3 bg-white/5 rounded-xl hover:bg-[#c9a962] hover:text-black transition-all">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )) : (
          <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
            <Search className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-sm font-bold text-white/20 uppercase tracking-widest">No matching mandates found.</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {isModalOpen && selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-[100]"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: '-50%', y: '-40%' }}
              animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
              exit={{ opacity: 0, scale: 0.9, x: '-50%', y: '-40%' }}
              className="fixed left-1/2 top-1/2 w-[95%] max-w-4xl bg-[#0a0a0b] p-8 md:p-12 rounded-[3.5rem] border border-white/10 z-[110] shadow-3xl overflow-y-auto max-h-[90vh] no-scrollbar"
            >
              <div className="flex flex-col md:flex-row gap-12">
                {/* Modal Left: Order Details */}
                <div className="flex-1 space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-4xl font-outfit font-black uppercase tracking-tighter">Mandate Scan</h3>
                      <p className="text-xs text-[#c9a962] font-black uppercase tracking-[0.3em] mt-1">ID: #{selectedOrder.orderCode}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${getStatusColor(selectedOrder.orderStatus)}`}>
                      {selectedOrder.orderStatus}
                    </div>
                  </div>

                  {/* 1-Click Supplier Action Bar */}
                  {selectedOrder.items?.some(i => i.supplierLink) && (
                    <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <ExternalLink className="w-4 h-4 text-blue-400" />
                        <span className="text-xs font-bold text-blue-300">Supplier Order Automation</span>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => {
                            const addr = `${selectedOrder.shippingAddress?.street}, ${selectedOrder.shippingAddress?.city}, ${selectedOrder.shippingAddress?.state} - ${selectedOrder.shippingAddress?.zip} (Tel: ${selectedOrder.shippingAddress?.phone || ''})`
                            navigator.clipboard.writeText(addr)
                            alert('Copied delivery address to clipboard!\n\n' + addr)
                          }}
                          className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                        >
                          📋 Copy Address
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            selectedOrder.items.forEach(item => {
                              if (item.supplierLink) window.open(item.supplierLink, '_blank')
                            })
                          }}
                          className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center gap-1.5"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Open Supplier Links
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-2 mb-3">
                        <User className="w-4 h-4 text-[#c9a962]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#c9a962]">Mandator</span>
                      </div>
                      <p className="text-sm font-bold">{selectedOrder.customer?.name}</p>
                      <p className="text-xs text-white/40 font-medium italic mb-1">{selectedOrder.customer?.email}</p>
                      <p className="text-xs text-[#c9a962] font-black uppercase tracking-tighter">Tel: {selectedOrder.shippingAddress?.phone || 'Not Provided'}</p>
                      <p className="text-[10px] text-white/40 font-bold uppercase mt-1">Age: {selectedOrder.shippingAddress?.age} | DOB: {selectedOrder.shippingAddress?.dob}</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-2 mb-3">
                        <CreditCard className="w-4 h-4 text-[#c9a962]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#c9a962]">Settlement</span>
                      </div>
                      <p className="text-sm font-bold">{selectedOrder.paymentMethod}</p>
                      <p className="text-xs text-green-400/60 font-medium uppercase tracking-tighter">{selectedOrder.paymentStatus}</p>
                    </div>
                  </div>

                  <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="w-4 h-4 text-[#c9a962]" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#c9a962]">Target Destination</span>
                    </div>
                    <p className="text-sm font-bold mb-1">{selectedOrder.shippingAddress?.street}</p>
                    <p className="text-xs text-white/40 font-medium italic">{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.zip}</p>
                  </div>

                  <div className="space-y-4">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4">Items Secured</h5>
                    {selectedOrder.items.map((item, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-white/[0.02] space-y-3">
                        <div className="flex items-center gap-4">
                          <img src={item.image} alt="" className="w-12 h-12 rounded-xl object-cover" />
                          <div className="flex-1">
                            <h6 className="text-sm font-bold">{item.name}</h6>
                            <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">
                              Qty: {item.qty} • Size: {item.size}
                              {item.customization && <span className="text-[#c9a962]"> • ✏ {item.customization}</span>}
                            </p>
                          </div>
                          <span className="text-sm font-black text-[#c9a962]">₹{item.price.toLocaleString()}</span>
                        </div>
                        {item.supplierLink && (
                          <a
                            href={item.supplierLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 w-full py-2 px-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest hover:bg-blue-500/20 transition-all"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Order from Supplier — {item.qty}x
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Modal Right: Staff Controls */}
                <div className="w-full md:w-80 space-y-8">
                  <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-[#c9a962]/10 to-transparent border border-[#c9a962]/20">
                    <h4 className="text-xl font-outfit font-black uppercase tracking-tighter mb-6">Staff Control</h4>

                    <div className="space-y-6">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3">Order Status</p>
                        <select
                          value={updateData.orderStatus}
                          onChange={e => setUpdateData({ ...updateData, orderStatus: e.target.value })}
                          className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-[#c9a962]"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>

                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3">Est. Delivery Time</p>
                        <input
                          type="datetime-local"
                          value={updateData.deliveryTime}
                          onChange={e => setUpdateData({ ...updateData, deliveryTime: e.target.value })}
                          className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none focus:border-[#c9a962] style-color-scheme-dark"
                        />
                      </div>

                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3">Payment status</p>
                        <select
                          value={updateData.paymentStatus}
                          onChange={e => setUpdateData({ ...updateData, paymentStatus: e.target.value })}
                          className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-[#c9a962]"
                        >
                          <option value="Pending">Payment Pending</option>
                          <option value="Completed">Payment Settled</option>
                          <option value="Failed">Settlement Failed</option>
                        </select>
                      </div>

                      <button
                        onClick={handleUpdate}
                        className="w-full py-4 bg-[#c9a962] text-black rounded-xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-xl shadow-[#c9a962]/20"
                      >
                        Apply Updates
                      </button>

                      {selectedOrder.shippingAddress?.phone && (
                        <a
                          href={`https://wa.me/${selectedOrder.shippingAddress.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${selectedOrder.customer?.name || 'Customer'}! Your RYZE order #${selectedOrder.orderCode} status is now: ${selectedOrder.orderStatus}. Thank you for shopping with RYZE!`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-green-500/20 transition-all flex items-center justify-center gap-1.5"
                        >
                          📲 Text Customer Status on WhatsApp
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Add Logistics Node */}
                  <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5">
                    <h4 className="text-sm font-outfit font-black uppercase tracking-tighter mb-4">Add Logistics Node</h4>
                    <div className="space-y-4">
                      <input
                        type="text" placeholder="Status (e.g. Out for Delivery)"
                        value={trackingData.status} onChange={e => setTrackingData({ ...trackingData, status: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs outline-none focus:border-[#c9a962]"
                      />
                      <input
                        type="text" placeholder="Location Hub"
                        value={trackingData.location} onChange={e => setTrackingData({ ...trackingData, location: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs outline-none focus:border-[#c9a962]"
                      />
                      <input
                        type="text" placeholder="Optional Note"
                        value={trackingData.description} onChange={e => setTrackingData({ ...trackingData, description: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs outline-none focus:border-[#c9a962]"
                      />
                      <button
                        onClick={handleUpdate}
                        disabled={!trackingData.status || !trackingData.location}
                        className="w-full py-3 border border-[#c9a962]/50 text-[#c9a962] rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-[#c9a962]/10 transition-all disabled:opacity-50"
                      >
                        Push Location Sync
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="w-full py-4 border border-white/10 rounded-xl text-white/40 font-black uppercase tracking-widest text-[10px] hover:text-white transition-all"
                  >
                    Close Portal
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
