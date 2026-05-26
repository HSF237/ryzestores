import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  MapPin, CreditCard, ChevronRight, CheckCircle2,
  Home, Briefcase, Plus, X, Loader2, ExternalLink
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { userService, orderService, paymentService } from '../services/firebaseService'
import OptimizedImage from '../components/OptimizedImage'

export default function Checkout() {
  const navigate = useNavigate()
  const cartContext = useCart() || {}
  const authContext = useAuth() || {}

  const { items = [], total = 0, subtotal = 0, tax = 0, delivery = 0 } = cartContext
  const { user = null } = authContext

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [isSettingPrimary, setIsSettingPrimary] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [promoCode, setPromoCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [promoError, setPromoError] = useState('')
  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    street: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    deliveryTime: '',
    instructions: ''
  })
  const [showSelfHeal, setShowSelfHeal] = useState(false)
  const [forceRender, setForceRender] = useState(false)

  // Diagnostic Logs
  useEffect(() => {
    console.log("ryze Checkout Pulse:", {
      hasUser: !!user,
      itemCount: items?.length,
      cartContextStatus: !!cartContext,
      authContextStatus: !!authContext
    })
  }, [user, items, cartContext, authContext])

  useEffect(() => {
    // Sync Lag Protection: Show override after 4 seconds
    const lagTimer = setTimeout(() => { if (!forceRender) setShowSelfHeal(true) }, 4000)

    if (!user) {
      console.warn("No user found, redirecting to login...")
      navigate('/login')
      return
    }

    if (items && items.length === 0 && !loading) {
      console.warn("No items in bag, redirecting to shop...")
      navigate('/shop')
      return
    }

    const fetchCheckoutData = async () => {
      try {
        const data = await userService.getAddresses()
        setAddresses(data)
        const def = data.find(a => a.isDefault) || data[0] || null
        if (def) setSelectedAddress(def)

        const profileData = await userService.getProfile()
        if (profileData) {
          setNewAddress(prev => ({ ...prev, phone: profileData.phone || '' }))
        }
      } catch (err) {
        console.error('Data sync failed', err)
      }
    }

    fetchCheckoutData()
    return () => clearTimeout(lagTimer)
  }, [user, items, navigate, forceRender])

  const applyPromo = () => {
    setPromoError('')
    const code = promoCode.trim().toUpperCase()
    if (code === 'ryze10') {
      setDiscount(subtotal * 0.1)
      return
    }
    let foundDiscount = 0
    items.forEach(item => {
      if (item.productVoucher?.trim().toUpperCase() === code) {
        const itemPrice = (item.discountPrice || item.regularPrice || item.price || 0) * item.qty
        foundDiscount += (itemPrice * (item.productVoucherDiscount / 100))
      }
    })
    if (foundDiscount > 0) setDiscount(foundDiscount)
    else { setPromoError('INVALID VOUCHER CODE'); setDiscount(0); }
  }

  const handleRazorpay = async () => {
    if (!selectedAddress) { alert('Please select a target placement first.'); setStep(1); return; }
    setLoading(true)

    try {
      const amount = (total - discount)
      const rzpOrder = await paymentService.createRazorpayOrder({ amount })

      const options = {
        key: 'rzp_test_ryze_2024_id', // Should be in env but visible for SDK
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: 'RYZE',
        description: 'RYZE Order Payment',
        image: '/favicon.svg',
        order_id: rzpOrder.id,
        handler: async (response) => {
          try {
            const orderData = {
              items: items.map(i => ({
                product: i._id || i.id || null,
                name: i.retailHeading || i.title || 'ryze Product',
                price: Number(i.discountPrice || i.regularPrice || i.price || 0),
                qty: Number(i.qty || 1),
                size: i.size || 'Standard',
                color: i.color || 'Default',
                image: i.image || (i.images && i.images[0]) || ''
              })),
              shippingAddress: {
                street: selectedAddress.street || '',
                city: selectedAddress.city || '',
                state: selectedAddress.state || '',
                zip: selectedAddress.zip || '',
                country: selectedAddress.country || 'India',
                phone: selectedAddress.phone || user?.phone || '',
                deliveryTime: selectedAddress.deliveryTime || '',
                instructions: selectedAddress.instructions || ''
              },
              paymentMethod: 'RAZORPAY',
              totalAmount: (total - discount),
              promoCode: discount > 0 ? promoCode : null,
              discountAmount: discount,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            }
            const data = await orderService.createOrder(orderData)
            navigate('/order-success', { state: { order: data } })
          } catch (err) {
            alert(err?.message || 'Order sync failed after payment. Please contact support.')
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: selectedAddress.phone || user?.phone || ''
        },
        theme: { color: '#c9a962' }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response) {
        alert("Payment Protocol Terminated: " + response.error.description);
      });
      rzp1.open();
    } catch (err) {
      alert('Payment initialization failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateOrder = async () => {
    if (paymentMethod === 'RAZORPAY') {
      await handleRazorpay()
      return
    }

    if (!selectedAddress) { alert('Please select a target placement first.'); setStep(1); return; }
    const corruptItems = items.filter(i => !i._id && !i.id)
    if (corruptItems.length > 0) {
      alert(`ryze DATA MISMATCH: Please CLEAR YOUR BAG and re-add items.`);
      return
    }
    setLoading(true)
    try {
      const orderData = {
        items: items.map(i => ({
          product: i._id || i.id || null,
          name: i.retailHeading || i.title || 'ryze Product',
          price: Number(i.discountPrice || i.regularPrice || i.price || 0),
          qty: Number(i.qty || 1),
          size: i.size || 'Standard',
          color: i.color || 'Default',
          image: i.image || (i.images && i.images[0]) || ''
        })),
        shippingAddress: {
          street: selectedAddress.street || '',
          city: selectedAddress.city || '',
          state: selectedAddress.state || '',
          zip: selectedAddress.zip || '',
          country: selectedAddress.country || 'India',
          phone: selectedAddress.phone || user?.phone || '',
          deliveryTime: selectedAddress.deliveryTime || '',
          instructions: selectedAddress.instructions || ''
        },
        paymentMethod, totalAmount: (total - discount),
        promoCode: discount > 0 ? promoCode : null,
        discountAmount: discount
      }
      const data = await orderService.createOrder(orderData)
      navigate('/order-success', { state: { order: data } })
    } catch (err) {
      alert(err?.message || 'Order settlement failed.')
    } finally { setLoading(false) }
  }

  const handleAddAddress = async (e) => {
    e.preventDefault()
    try {
      const data = await userService.addAddress({ ...newAddress, isDefault: isSettingPrimary })
      setAddresses(data)
      const added = data.find(a => a.street === newAddress.street) || data[data.length - 1]
      setSelectedAddress(added)
      setShowAddForm(false)
      alert('Destination successfully registered.')
    } catch (err) {
      alert('Failed to register placement.')
    }
  }

  const finalTotal = total - discount

  // Sentinel Guard (Unified with Self-Heal)
  if ((!user || !items || (items && items.length === 0)) && !forceRender) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-6">
        <div className="w-16 h-16 border-4 border-[#c9a962]/20 border-t-[#c9a962] rounded-full animate-spin mb-8" />
        <h2 className="text-xl font-outfit font-black text-white uppercase tracking-widest">ryze Sync Protocol...</h2>
        <p className="text-white/30 text-[10px] mt-2 uppercase font-black tracking-[0.4em]">Authorizing Data Handshake</p>

        <AnimatePresence>
          {showSelfHeal && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-12 bg-white/5 p-8 rounded-[2.5rem] border border-white/10 max-w-sm backdrop-blur-xl">
              <p className="text-[10px] text-[#c9a962] font-black uppercase mb-4 tracking-widest">Protocol Timeout Detected</p>
              <div className="space-y-3">
                <button
                  onClick={() => setForceRender(true)}
                  className="w-full py-4 bg-[#c9a962] text-black font-black uppercase tracking-widest text-[10px] rounded-2xl hover:scale-[1.02] transition-transform shadow-xl shadow-[#c9a962]/20"
                >
                  Manual Security Override
                </button>
                <button
                  onClick={() => { localStorage.clear(); window.location.href = '/'; }}
                  className="w-full py-4 border border-red-500/20 text-red-500 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-red-500/10 transition-all"
                >
                  Emergency Cache Purge
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12">

        {/* Progress Tracker */}
        <div className="lg:col-span-12 flex items-center justify-between mb-8 overflow-x-auto no-scrollbar py-2 border-b border-white/5 pb-6">
          {[
            { n: 1, l: 'Placement' },
            { n: 2, l: 'Settlement' },
            { n: 3, l: 'Verification' }
          ].map(s => (
            <div key={s.n} className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs border-2 transition-all ${step === s.n ? 'bg-[#c9a962] border-[#c9a962] text-black shadow-lg shadow-[#c9a962]/20' :
                  step > s.n ? 'bg-green-500 border-green-500 text-white' : 'border-white/10 text-white/20'
                }`}>
                {step > s.n ? <CheckCircle2 className="w-5 h-5" /> : s.n}
              </div>
              <span className={`text-[10px] uppercase font-black tracking-[0.2em] ${step === s.n ? 'text-white' : 'text-white/20'}`}>
                {s.l}
              </span>
              {s.n < 3 && <div className={`w-16 h-px mx-4 ${step > s.n ? 'bg-green-500' : 'bg-white/5'}`} />}
            </div>
          ))}
        </div>

        {/* Left Section */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div>
                    <h2 className="text-2xl sm:text-4xl font-outfit font-black uppercase tracking-tighter">Target Placement</h2>
                    <p className="text-[9px] sm:text-[10px] text-[#c9a962] font-black tracking-[0.3em] sm:tracking-[0.4em] uppercase mt-1 sm:mt-2">Where should we deliver the excellence?</p>
                  </div>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all sm:py-3"
                  >
                    <Plus className="w-4 h-4" /> Add Destination
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {addresses.map(addr => (
                    <div
                      key={addr._id}
                      onClick={() => setSelectedAddress(addr)}
                      className={`relative p-8 rounded-[2.5rem] border-2 cursor-pointer transition-all group ${selectedAddress?._id === addr._id ? 'border-[#c9a962] bg-[#c9a962]/5 shadow-2xl shadow-[#c9a962]/10' : 'border-white/5 bg-white/[0.02] hover:border-white/20'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#c9a962]">
                            {addr.label === 'Home' ? <Home className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-[0.2em]">{addr.label}</span>
                        </div>
                        {selectedAddress?._id === addr._id && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                            <CheckCircle2 className="w-6 h-6 text-[#c9a962]" />
                          </motion.div>
                        )}
                      </div>
                      <p className="text-base font-bold text-white mb-2 leading-tight">{addr.street}</p>
                      <p className="text-xs text-white/40 font-medium leading-relaxed mb-1">{addr.city}, {addr.state} - {addr.zip}</p>
                      <p className="text-[10px] font-black uppercase text-[#c9a962] tracking-widest">{addr.phone || 'No Mobile'}</p>
                      <div className="mt-6 pt-6 border-t border-white/5 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[8px] font-black uppercase tracking-widest text-[#c9a962]">Select for Dispatch</span>
                      </div>
                    </div>
                  ))}
                </div>

                {addresses.length === 0 && !showAddForm && (
                  <div className="py-24 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
                    <MapPin className="w-16 h-16 text-white/10 mb-6" />
                    <p className="text-sm font-black uppercase tracking-widest text-white/20">Your placement list is currently empty.</p>
                  </div>
                )}

                <button
                  disabled={!selectedAddress}
                  onClick={() => setStep(2)}
                  className="w-full h-20 bg-white text-black rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs hover:bg-[#c9a962] transition-all disabled:opacity-20 disabled:cursor-not-allowed mt-12 flex items-center justify-center gap-3"
                >
                  Proceed to Settlement <ChevronRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-2xl sm:text-4xl font-outfit font-black uppercase tracking-tighter">Settlement Portal</h2>
                  <p className="text-[9px] sm:text-[10px] text-[#c9a962] font-black tracking-[0.3em] sm:tracking-[0.4em] uppercase mt-1 sm:mt-2">Select your preferred transaction protocol</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {[
                    { id: 'RAZORPAY', name: 'Digital UPI / GPay / Cards', desc: 'Secure payment via Razorpay Infrastructure', icon: '💎', color: 'from-blue-500/20' },
                    { id: 'COD', name: 'ryze Cash on Delivery', desc: 'Settle upon successful arrival', icon: '📦', color: 'from-[#c9a962]/20' }
                  ].map(method => (
                    <div
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`p-8 rounded-[2.5rem] border-2 cursor-pointer transition-all flex items-center justify-between group overflow-hidden relative ${paymentMethod === method.id ? 'border-[#c9a962] bg-[#c9a962]/5' : 'border-white/5 bg-white/[0.02] hover:border-white/10'
                        }`}
                    >
                      <div className={`absolute inset-y-0 left-0 w-32 bg-gradient-to-r ${method.color} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
                      <div className="flex items-center gap-6 relative z-10">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                          {method.icon}
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-white tracking-tight uppercase">{method.name}</h4>
                          <p className="text-xs text-white/30 font-bold tracking-wide mt-1">{method.desc}</p>
                        </div>
                      </div>
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center relative z-10 transition-all ${paymentMethod === method.id ? 'border-[#c9a962] bg-[#c9a962]/10' : 'border-white/10'
                        }`}>
                        {paymentMethod === method.id && <div className="w-4 h-4 rounded-full bg-[#c9a962]" />}
                      </div>
                    </div>
                  ))}
                </div>

                {paymentMethod === 'RAZORPAY' && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-[2rem] bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 mt-6 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Razorpay Infrastructure Active: UPI, GPay, PhonePe & Cards Supported</p>
                  </motion.div>
                )}

                <div className="flex gap-6 mt-12">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 h-20 border border-white/10 rounded-[2rem] text-white/40 font-black uppercase tracking-widest text-[10px] hover:text-white hover:bg-white/5 transition-all"
                  >
                    Adjust Placement
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="flex-[2] h-20 bg-white text-black rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs hover:bg-[#c9a962] transition-all flex items-center justify-center gap-3"
                  >
                    Review Manifest <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-2xl sm:text-4xl font-outfit font-black uppercase tracking-tighter">ryze Manifest</h2>
                  <p className="text-[9px] sm:text-[10px] text-[#c9a962] font-black tracking-[0.3em] sm:tracking-[0.4em] uppercase mt-1 sm:mt-2">Final verification of your premium request</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div whileHover={{ y: -5 }} className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 group">
                    <div className="flex items-center gap-3 mb-6">
                      <MapPin className="w-5 h-5 text-[#c9a962]" />
                      <span className="text-[10px] font-black uppercase text-[#c9a962] tracking-[0.3em]">Destination Info</span>
                    </div>
                    <p className="text-lg font-bold mb-2 group-hover:text-white transition-colors">{selectedAddress?.street}</p>
                    <p className="text-sm text-white/40 font-medium italic">{selectedAddress?.city}, {selectedAddress?.state} - {selectedAddress?.zip}</p>
                    <div className="mt-6 flex flex-col gap-1">
                      <span className="text-[8px] font-black uppercase text-white/20 tracking-widest">Verified Contact</span>
                      <p className="text-xs font-black text-[#c9a962] tracking-widest">{selectedAddress?.phone || user?.phone}</p>
                    </div>
                  </motion.div>

                  <motion.div whileHover={{ y: -5 }} className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 group">
                    <div className="flex items-center gap-3 mb-6">
                      <CreditCard className="w-5 h-5 text-[#c9a962]" />
                      <span className="text-[10px] font-black uppercase text-[#c9a962] tracking-[0.3em]">Settlement Method</span>
                    </div>
                    <p className="text-lg font-bold mb-2 group-hover:text-white transition-colors uppercase">{paymentMethod}</p>
                    <p className="text-sm text-white/40 font-medium italic">Verified secure transaction channel</p>
                  </motion.div>
                </div>

                <div className="p-10 rounded-[3.5rem] bg-gradient-to-br from-[#c9a962]/20 to-transparent border border-[#c9a962]/20 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#c9a962]/5 blur-[100px] -mr-32 -mt-32" />
                  <div className="text-center md:text-left relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#c9a962] mb-3">Total Manifest Value</p>
                    <h3 className="text-6xl font-outfit font-black tracking-tighter">₹{finalTotal.toLocaleString()}</h3>
                  </div>
                  <button
                    onClick={handleCreateOrder}
                    disabled={loading}
                    className="w-full md:w-auto px-16 h-20 bg-white text-black rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs hover:bg-[#c9a962] hover:scale-105 transition-all flex items-center justify-center gap-3 shadow-[0_20px_50px_rgba(201,169,98,0.2)] relative z-10"
                  >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Confirm Placement'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Summary */}
        <div className="lg:col-span-4 lg:sticky lg:top-40 self-start">
          <div className="bg-[#111113] p-6 sm:p-10 rounded-[2rem] sm:rounded-[3.5rem] border border-white/5 shadow-3xl">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
              <h3 className="font-outfit font-black text-2xl uppercase tracking-tighter">Shopping Bag</h3>
              <span className="bg-[#c9a962]/10 text-[#c9a962] text-[10px] font-black px-3 py-1 rounded-lg">{items.length} Items</span>
            </div>

            <div className="space-y-6 mb-10 max-h-[40vh] overflow-y-auto pr-4 no-scrollbar">
              {items.map(item => (
                <div key={`${item.id}-${item.size}`} className="flex gap-5 group">
                  <div className="w-20 h-20 rounded-2xl bg-white/5 p-1 shrink-0 overflow-hidden border border-white/5 group-hover:border-[#c9a962]/30 transition-colors">
                    <OptimizedImage
                      src={item.image || item.images?.[0] || item.productImage || item.imageUrl || item.product?.image}
                      alt={item.title || item.retailHeading}
                      width={100}
                      quality={60}
                      wrapperClassName="w-full h-full"
                    />
                  </div>
                  <div className="min-w-0 flex flex-col justify-center">
                    <h5 className="text-sm font-bold text-white/90 truncate pr-2 group-hover:text-white transition-colors">{item.title}</h5>
                    <p className="text-[9px] text-[#c9a962] font-black uppercase tracking-widest mt-1.5 flex items-center gap-2">
                      <span>{item.size}</span>
                      <span className="w-1 h-1 rounded-full bg-white/20" />
                      <span>Qty: {item.qty}</span>
                    </p>
                    <p className="text-sm font-black text-white mt-2">₹{(item.discountPrice || item.regularPrice || item.price || 0).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Promo Section */}
            <div className="border-t border-white/5 pt-8 mb-8">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4 ml-2">Secure Voucher</p>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="e.g. ryze10"
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-xs outline-none focus:border-[#c9a962]/40 transition-all uppercase placeholder:text-white/10"
                  value={promoCode}
                  onChange={e => setPromoCode(e.target.value)}
                />
                <button
                  onClick={applyPromo}
                  className="px-6 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-[#c9a962] hover:text-black transition-all"
                >
                  Apply
                </button>
              </div>
              {promoError && <p className="text-[9px] font-bold text-red-500 mt-2 ml-2 uppercase tracking-tighter">{promoError}</p>}
              {discount > 0 && <p className="text-[9px] font-bold text-green-500 mt-2 ml-2 uppercase tracking-tighter">Voucher applied: -₹{discount.toLocaleString()}</p>}
            </div>

            <div className="space-y-5 border-t border-white/5 pt-8 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
              <div className="flex justify-between hover:text-white transition-colors">
                <span>ryze Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between hover:text-white transition-colors">
                <span>Taxation (Included)</span>
                <span>₹{tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between hover:text-[#c9a962] transition-colors">
                <span>Priority Shipping</span>
                <span className="text-green-500">{delivery > 0 ? `₹${delivery}` : 'FREE'}</span>
              </div>
              <div className="flex justify-between text-2xl text-white border-white/5 pt-6 border-t font-outfit">
                <span className="tracking-tighter">Total Due</span>
                <span className="font-black text-[#c9a962]">₹{finalTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Add Placement Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[150] flex items-center justify-center p-4 sm:p-6 overflow-y-auto no-scrollbar"
            onClick={() => setShowAddForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-xl bg-[#0d0d0e] p-8 md:p-12 rounded-[2.5rem] border border-white/10 shadow-3xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-outfit font-black uppercase tracking-tighter">Define Placement</h3>
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.3em] mt-2 italic">Register a new target destination</p>
                </div>
                <button onClick={() => setShowAddForm(false)} className="p-3 glass rounded-full hover:bg-red-500/10 hover:text-red-500 transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddAddress} className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {['Home', 'Office', 'Other'].map(l => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setNewAddress({ ...newAddress, label: l })}
                      className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] border transition-all ${newAddress.label === l ? 'bg-[#c9a962] border-[#c9a962] text-black shadow-lg shadow-[#c9a962]/20' : 'border-white/10 text-white/20 hover:border-white/40'
                        }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#c9a962]">Target Placement</span>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${newAddress.street} ${newAddress.city} ${newAddress.state} ${newAddress.zip}`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-[9px] font-black uppercase text-white/40 hover:text-[#c9a962] transition-colors"
                    >
                      Locate <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <input
                    required placeholder="Street Address / Building"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-6 py-4 text-xs outline-none focus:border-[#c9a962] transition-all"
                    value={newAddress.street}
                    onChange={e => setNewAddress({ ...newAddress, street: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      required placeholder="City Domain"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-6 py-4 text-xs outline-none focus:border-[#c9a962] transition-all"
                      value={newAddress.city}
                      onChange={e => setNewAddress({ ...newAddress, city: e.target.value })}
                    />
                    <input
                      required placeholder="State Territory"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-6 py-4 text-xs outline-none focus:border-[#c9a962] transition-all"
                      value={newAddress.state}
                      onChange={e => setNewAddress({ ...newAddress, state: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      required placeholder="Postal / ZIP Code"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-6 py-4 text-xs outline-none focus:border-[#c9a962] transition-all"
                      value={newAddress.zip}
                      onChange={e => setNewAddress({ ...newAddress, zip: e.target.value })}
                    />
                    <input
                      required type="tel" placeholder="Mobile Number"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-6 py-4 text-xs outline-none focus:border-[#c9a962] transition-all"
                      value={newAddress.phone}
                      onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <input
                        required
                        list="time-suggestions"
                        placeholder="Preferred Time (e.g. 10 AM)"
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-6 py-4 text-xs outline-none focus:border-[#c9a962] transition-all"
                        value={newAddress.deliveryTime}
                        onChange={e => setNewAddress({ ...newAddress, deliveryTime: e.target.value })}
                      />
                      <datalist id="time-suggestions">
                        <option value="08:00 - 12:00 (Morning)" />
                        <option value="12:00 - 16:00 (Afternoon)" />
                        <option value="16:00 - 20:00 (Evening)" />
                      </datalist>
                    </div>
                    <input
                      required placeholder="Handling Notes"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-6 py-4 text-xs outline-none focus:border-[#c9a962] transition-all"
                      value={newAddress.instructions}
                      onChange={e => setNewAddress({ ...newAddress, instructions: e.target.value })}
                    />
                  </div>
                </div>

                {/* Set as Primary Toggle */}
                <div
                  onClick={() => setIsSettingPrimary(!isSettingPrimary)}
                  className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/10 cursor-pointer group hover:border-[#c9a962]/30 transition-all"
                >
                  <div>
                    <p className="text-[10px] font-black uppercase text-white tracking-widest">Mark as Primary Placement</p>
                    <p className="text-[8px] text-white/30 font-bold uppercase mt-1">Automatically selected for future dispatch</p>
                  </div>
                  <div className={`w-10 h-5 rounded-full relative transition-all ${isSettingPrimary ? 'bg-[#c9a962]' : 'bg-white/10'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-lg ${isSettingPrimary ? 'right-0.5' : 'left-0.5'}`} />
                  </div>
                </div>

                <button className="w-full h-16 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] mt-4 hover:bg-[#c9a962] transition-all shadow-2xl">
                  Secure Placement
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
