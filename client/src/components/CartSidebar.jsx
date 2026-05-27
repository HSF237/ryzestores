import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Plus, ShoppingBag } from 'lucide-react'
import { useCart } from '../context/CartContext'
import OptimizedImage from './OptimizedImage'

export default function CartSidebar() {
  const navigate = useNavigate()
  const { isOpen, closeCart, items, removeFromCart, updateQty, subtotal, tax, delivery, total } = useCart()

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
                      key={`${item.id}-${index}`}
                      layout
                      className="flex gap-4 pb-4 border-b border-white/10 last:border-0"
                    >
                      <div className="w-20 h-24 rounded-lg bg-white/5 flex-shrink-0 overflow-hidden group">
                        {(item.image || item.images?.[0] || item.productImage || item.imageUrl || item.product?.image) ? (
                          <OptimizedImage
                            src={item.image || item.images?.[0] || item.productImage || item.imageUrl || item.product?.image}
                            alt={item.title ?? item.retailHeading}
                            width={100}
                            quality={60}
                            wrapperClassName="w-full h-full group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-white/5 to-transparent text-white/20 text-[8px] font-black uppercase tracking-tighter">
                            <ShoppingBag className="w-4 h-4 mb-1 opacity-20" />
                            No Vision
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-outfit font-medium text-sm truncate">{item.title ?? item.retailHeading}</p>
                        <p className="text-white/60 text-xs mt-0.5">
                          {item.color && <span>{item.color} </span>}
                          {item.size && <span> · {item.size}</span>}
                        </p>
                        {item.customization && (
                          <p className="text-[#c9a962]/70 text-[10px] font-bold mt-0.5 truncate">✏ {item.customization}</p>
                        )}
                        <p className="text-[#c9a962] font-semibold mt-1">
                          ₹{((item.price ?? item.discountPrice ?? 0) * item.qty).toLocaleString()}
                        </p>
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
                <div className="flex justify-between font-outfit font-semibold text-lg pt-2">
                  <span>Total</span>
                  <span className="text-[#c9a962]">₹{total.toFixed(0)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => { closeCart(); navigate('/checkout') }}
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
