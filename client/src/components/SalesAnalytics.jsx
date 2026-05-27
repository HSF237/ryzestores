import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { analyticsService } from '../services/firebaseService'

const BAR_COLORS = ['#c9a962', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#f59e0b', '#06b6d4']

export default function SalesAnalytics() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    analyticsService.getDashboardStats()
      .then(data => setStats(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      {[1, 2, 3].map(i => <div key={i} className="h-48 bg-white/5 rounded-3xl" />)}
    </div>
  )

  const totalRevenue = stats.revenue + stats.pendingRevenue
  const completedPct = totalRevenue > 0 ? (stats.revenue / totalRevenue) * 100 : 0
  const pendingPct = 100 - completedPct
  const avgOrderValue = stats.ordersCount > 0 ? Math.round(stats.revenue / stats.ordersCount) : 0

  // Donut via conic-gradient
  const donut = {
    background: `conic-gradient(#c9a962 0% ${completedPct}%, #3b82f6 ${completedPct}% 100%)`
  }

  const sortedCats = [...stats.categoryStats].sort((a, b) => b.count - a.count)
  const maxCat = sortedCats[0]?.count || 1

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="font-outfit font-black text-2xl uppercase tracking-tighter text-white">Sales Analytics</h2>
        <p className="text-white/30 text-[10px] uppercase tracking-[0.2em] mt-1">Live performance data from Firestore</p>
      </div>

      {/* Top KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Net Revenue', value: `₹${stats.revenue.toLocaleString()}`, sub: `${completedPct.toFixed(0)}% collected`, color: 'text-[#c9a962]', trend: 'up' },
          { label: 'Avg Order Value', value: `₹${avgOrderValue.toLocaleString()}`, sub: `across ${stats.ordersCount} orders`, color: 'text-green-400', trend: 'up' },
          { label: 'Pending Revenue', value: `₹${stats.pendingRevenue.toLocaleString()}`, sub: 'awaiting settlement', color: 'text-blue-400', trend: 'neutral' },
          { label: 'Total Customers', value: stats.customerCount, sub: 'registered accounts', color: 'text-purple-400', trend: 'up' },
        ].map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-[#111112] rounded-2xl border border-white/5 p-5 hover:border-[#c9a962]/20 transition-all"
          >
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mb-3">{kpi.label}</p>
            <p className={`font-outfit font-black text-2xl ${kpi.color}`}>{kpi.value}</p>
            <div className="flex items-center gap-1 mt-2">
              {kpi.trend === 'up' && <TrendingUp className="w-3 h-3 text-green-400" />}
              {kpi.trend === 'down' && <TrendingDown className="w-3 h-3 text-red-400" />}
              {kpi.trend === 'neutral' && <Minus className="w-3 h-3 text-blue-400" />}
              <span className="text-[9px] text-white/30 font-bold">{kpi.sub}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut Chart — Revenue Split */}
        <div className="bg-[#111112] rounded-[2rem] border border-white/5 p-8">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-8">Revenue Split</h3>
          <div className="flex items-center gap-10">
            {/* Donut */}
            <div className="relative shrink-0 w-36 h-36">
              <div style={donut} className="w-full h-full rounded-full" />
              <div className="absolute inset-[14px] rounded-full bg-[#111112] flex flex-col items-center justify-center">
                <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Total</span>
                <span className="font-outfit font-black text-base text-white leading-tight">
                  ₹{totalRevenue > 999 ? (totalRevenue / 1000).toFixed(1) + 'K' : totalRevenue}
                </span>
              </div>
            </div>
            {/* Legend */}
            <div className="space-y-5 flex-1">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#c9a962]" />
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Completed</span>
                </div>
                <p className="font-outfit font-black text-2xl text-white">₹{stats.revenue.toLocaleString()}</p>
                <div className="mt-1 h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${completedPct}%` }} transition={{ delay: 0.4, duration: 1 }}
                    className="h-full bg-[#c9a962] rounded-full" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Pending</span>
                </div>
                <p className="font-outfit font-black text-2xl text-white">₹{stats.pendingRevenue.toLocaleString()}</p>
                <div className="mt-1 h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pendingPct}%` }} transition={{ delay: 0.6, duration: 1 }}
                    className="h-full bg-blue-400 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal Bar Chart — Category Distribution */}
        <div className="bg-[#111112] rounded-[2rem] border border-white/5 p-8">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-8">Products by Category</h3>
          <div className="space-y-5">
            {sortedCats.slice(0, 6).map((cat, i) => {
              const pct = (cat.count / maxCat) * 100
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-black text-white uppercase tracking-wide">{cat._id || 'Other'}</span>
                    <span className="text-[10px] font-black" style={{ color: BAR_COLORS[i % BAR_COLORS.length] }}>
                      {cat.count} items
                    </span>
                  </div>
                  <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.2 + i * 0.1, duration: 0.9, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: BAR_COLORS[i % BAR_COLORS.length] }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Vertical Bar Chart — Recent Order Values */}
      <div className="bg-[#111112] rounded-[2rem] border border-white/5 p-8">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-8">Recent Order Values</h3>
        {stats.recentOrders.length === 0 ? (
          <div className="h-40 flex items-center justify-center">
            <p className="text-white/20 text-sm font-black uppercase tracking-widest">No orders yet — start selling!</p>
          </div>
        ) : (
          <div className="flex items-end gap-3 h-48">
            {stats.recentOrders.map((order, i) => {
              const maxAmt = Math.max(...stats.recentOrders.map(o => o.totalAmount || 0))
              const heightPct = maxAmt > 0 ? ((order.totalAmount || 0) / maxAmt) * 100 : 0
              const color = order.orderStatus === 'Delivered' ? '#10b981'
                : order.orderStatus === 'Cancelled' ? '#ef4444' : '#c9a962'
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[9px] font-black text-white/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    ₹{order.totalAmount?.toLocaleString()}
                  </span>
                  <div className="w-full flex items-end" style={{ height: '160px' }}>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(heightPct, 4)}%` }}
                      transition={{ delay: 0.2 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
                      className="w-full rounded-t-xl cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ background: color, minHeight: '6px' }}
                      title={`₹${order.totalAmount?.toLocaleString()} — ${order.orderStatus}`}
                    />
                  </div>
                  <span className="text-[8px] font-black text-white/30 uppercase tracking-wider text-center truncate w-full">
                    {order.customer?.name?.split(' ')[0] || 'Order'}
                  </span>
                  <span className={`text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase`} style={{ color, background: color + '20' }}>
                    {order.orderStatus}
                  </span>
                </div>
              )
            })}
          </div>
        )}
        <div className="flex items-center gap-4 mt-6 pt-4 border-t border-white/5">
          {[['#10b981', 'Delivered'], ['#c9a962', 'Pending/Processing'], ['#ef4444', 'Cancelled']].map(([color, label]) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
              <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
