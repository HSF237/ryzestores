import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Users, ShoppingBag, CreditCard, ArrowUpRight, ArrowDownRight, Package, Clock } from 'lucide-react'
import { analyticsService } from '../services/firebaseService'

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    analyticsService.getDashboardStats()
      .then(data => setStats(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white/5 rounded-3xl border border-white/5" />)}
    </div>
  )

  const cards = [
    { label: 'Net Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: <CreditCard />, color: 'text-green-400', trend: '+12.5%' },
    { label: 'Pending Settlement', value: `₹${stats.pendingRevenue.toLocaleString()}`, icon: <Clock />, color: 'text-yellow-400', trend: 'Processing' },
    { label: 'Total Mandates', value: stats.ordersCount, icon: <ShoppingBag />, color: 'text-blue-400', trend: '+5.2%' },
    { label: 'ryze Customers', value: stats.customerCount, icon: <Users />, color: 'text-[#c9a962]', trend: '+8.1%' },
  ]

  return (
    <div className="space-y-10">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[#111112] p-6 rounded-[2rem] border border-white/5 hover:border-[#c9a962]/30 transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${card.color} group-hover:scale-110 transition-transform`}>
                {card.icon}
              </div>
              <div className="flex items-center gap-1 text-[10px] font-black text-green-400 bg-green-400/10 px-2 py-1 rounded-lg">
                <ArrowUpRight className="w-3 h-3" /> {card.trend}
              </div>
            </div>
            <p className="text-[10px] font-black uppercase text-white/30 tracking-widest">{card.label}</p>
            <h3 className="text-2xl font-outfit font-black text-white mt-1">{card.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Mandates */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h4 className="text-xl font-outfit font-black uppercase tracking-tighter">Recent Mandates</h4>
            <button className="text-[10px] font-black uppercase tracking-widest text-[#c9a962] hover:underline">View All</button>
          </div>
          <div className="bg-[#111112] rounded-[2.5rem] border border-white/5 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/20">Customer</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/20">Value</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/20">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/20 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stats.recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-white group-hover:text-[#c9a962] transition-colors">{order.customer?.name}</p>
                      <p className="text-[10px] text-white/30 truncate max-w-[150px]">{order.customer?.email}</p>
                    </td>
                    <td className="px-8 py-5 font-bold text-[#c9a962]">₹{order.totalAmount.toLocaleString()}</td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border border-white/5 ${order.orderStatus === 'Delivered' ? 'text-green-400' : 'text-blue-400'}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 text-white/30">
                        <Clock className="w-3 h-3" />
                        <span className="text-[10px] font-bold">{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Categories / Insights */}
        <div className="space-y-6">
          <h4 className="text-xl font-outfit font-black uppercase tracking-tighter px-2">Asset Distribution</h4>
          <div className="bg-[#111112] p-8 rounded-[2.5rem] border border-white/5 space-y-6">
            {stats.categoryStats.map((cat, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-white/40">{cat._id || 'Uncategorized'}</span>
                  <span className="text-[#c9a962]">{cat.count} Units</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(cat.count / stats.productCount) * 100}%` }}
                    transition={{ delay: 0.5 + (i * 0.1), duration: 1 }}
                    className="h-full bg-gradient-to-r from-[#c9a962] to-[#b09452]"
                  />
                </div>
              </div>
            ))}

            <div className="pt-6 mt-6 border-t border-white/5">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#c9a962]/10 to-transparent border border-[#c9a962]/20">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#c9a962] mb-2 flex items-center gap-2">
                  <TrendingUp className="w-3 h-3" /> ryze Insight
                </p>
                <p className="text-xs text-white/50 leading-relaxed italic">
                  "Highest growth observed in **{stats.categoryStats[0]?._id}**. Recommend scaling inventory levels for Q2."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
