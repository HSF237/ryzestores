import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Plus, ShoppingBag } from 'lucide-react'
import { useCart } from '../context/CartContext'
import OptimizedImage from './OptimizedImage'

export default function CartSidebar() {
  const navigate = useNavigate()
  const { isOpen, closeCart, items, removeFromCart, updateQty, subtotal, tax, delivery, total } = useCart()
  const [promoInput, setPromoInput] = useState('')
  const [discount, setDiscount] = useState(0)
  const [promoMsg, setPromoMsg] = useState('')

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase()
    if (code === 'WELCOME10') {
      const d = Math.round(subtotal * 0.10)
      setDiscount(d)
      setPromoMsg('✓ 10% Welcome Discount Applied!')
    } else if (code === 'RYZE50') {
      setDiscount(50)
      setPromoMsg('✓ ₹50 Flat Discount Applied!')
    } else if (code === 'FIRSTBUY') {
      setDiscount(100)
      setPromoMsg('✓ ₹100 First Buy Bonus Applied!')
    } else {
      setDiscount(0)
      setPromoMsg('✕ Invalid code. Try WELCOME10 or RYZE50')
    }
  }

  const finalTotal = Math.max(0, total - discount)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={closeCart}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md glass-strong shadow-2xl z-[101] flex flex-col"
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="font-outfit font-semibold text-lg">Your Bag</h2>
              <button
                type="button"
                onClick={closeCart}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-white/50 font-jakarta">
                  <ShoppingBag className="w-12 h-12 mb-3 opacity-50" />
                  <p>Your bag is empty</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map((item, index) => (
                    <motion.li
                      key={`${item._id || item.id || index}-${item.size}-${item.color}`}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex gap-4 p-3 rounded-lg bg-white/5 border border-white/5"
                    >
                      <OptimizedImage
                        src={item.image || (item.images && item.images[0]) || ''}
                        alt={item.retailHeading || item.title}
                        width={80}
                        height={80}
                        quality={70}
                        wrapperClassName="w-20 h-20 shrink-0"
                        className="rounded-lg object-cover"
                      />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-outfit font-semibold text-sm line-clamp-1">{item.retailHeading || item.title}</h4>
                          <p className="text-xs text-[#c9a962]">₹{(item.discountPrice || item.regularPrice || item.price || 0).toLocaleString()}</p>
                          <p className="text-[10px] text-white/40">Size: {item.size || 'Standard'} • Color: {item.color || 'Default'}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => updateQty(index, item.qty - 1)}
                            className="w-7 h-7 rounded border border-white/20 flex items-center justify-center hover:bg-white/10"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-sm font-jakarta">{item.qty}</span>
                          <button
                            type="button"
                            onClick={() => updateQty(index, item.qty + 1)}
                            className="w-7 h-7 rounded border border-white/20 flex items-center justify-center hover:bg-white/10"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFromCart(index)}
                            className="ml-2 text-xs text-white/50 hover:text-red-400"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>
            {items.length > 0 && (
              <div className="p-6 border-t border-white/10 space-y-2">
                {/* Coupon Voucher Input */}
                <div className="pb-2 border-b border-white/5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="PROMO CODE (e.g. WELCOME10)"
                      value={promoInput}
                      onChange={e => setPromoInput(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder:text-white/30 uppercase outline-none focus:border-[#c9a962]"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className="px-3 py-2 bg-white/10 hover:bg-[#c9a962] hover:text-black text-white text-xs font-black uppercase rounded-lg transition-all"
                    >
                      Apply
                    </button>
                  </div>
                  {promoMsg && (
                    <p className={`text-[10px] font-bold mt-1 ${discount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {promoMsg}
                    </p>
                  )}
                </div>

                <div className="flex justify-between text-sm text-white/70">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-white/70">
                  <span>Tax (Included)</span>
                  <span>₹{tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-white/70">
                  <span>Delivery</span>
                  <span>₹{delivery}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-400 font-bold">
                    <span>Discount</span>
                    <span>-₹{discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-outfit font-semibold text-lg pt-2 border-t border-white/5">
                  <span>Total</span>
                  <span className="text-[#c9a962]">₹{finalTotal.toFixed(0)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => { closeCart(); navigate('/checkout', { state: { promoCode: promoInput, discount } }) }}
                  className="w-full mt-4 py-3 rounded-lg bg-[#c9a962] text-black font-outfit font-semibold hover:bg-[#d4b872] transition-colors"
                >
                  Checkout
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
