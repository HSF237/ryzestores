import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, ShoppingCart, BarChart3, Settings, LogOut, Bell, Search, Truck, ShoppingBag } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import InventoryManager from '../components/InventoryManager'
import CustomerManager from '../components/CustomerManager'
import OrderManager from '../components/OrderManager'
import AnalyticsDashboard from '../components/AnalyticsDashboard'

export default function StaffDashboard() {
   const navigate = useNavigate()
   const [activeTab, setActiveTab] = useState('inventory')
   const { user, loading, logout } = useAuth()

   // Real auth check
   useEffect(() => {
      if (!loading && (!user || (user.role !== 'staff' && user.role !== 'admin'))) {
         navigate('/staff-gateway')
      }
   }, [user, loading, navigate])

   const handleLogout = () => {
      logout()
      navigate('/staff-gateway')
   }

   return (
      <div className="min-h-screen bg-[#0a0a0b] text-white flex font-jakarta">
         {/* Sidebar */}
         <aside className="w-64 border-r border-white/5 bg-[#111112]/50 backdrop-blur-2xl flex flex-col shrink-0">
            <div className="p-8">
               <a href="/" className="font-outfit font-bold text-2xl tracking-tighter text-white">
                  ryze <span className="text-[#c9a962]">STAFF</span>
               </a>
            </div>

            <nav className="flex-1 px-4 space-y-1">
               <SidebarLink
                  icon={<LayoutDashboard className="w-5 h-5" />}
                  label="Overview"
                  active={activeTab === 'overview'}
                  onClick={() => setActiveTab('overview')}
               />
               <SidebarLink
                  icon={<ShoppingCart className="w-5 h-5" />}
                  label="Inventory"
                  active={activeTab === 'inventory'}
                  onClick={() => setActiveTab('inventory')}
               />
               <SidebarLink
                  icon={<Users className="w-5 h-5" />}
                  label="Customers"
                  active={activeTab === 'customers'}
                  onClick={() => setActiveTab('customers')}
               />
               <SidebarLink
                  icon={<Truck className="w-5 h-5" />}
                  label="Orders"
                  active={activeTab === 'orders'}
                  onClick={() => setActiveTab('orders')}
               />
               <SidebarLink
                  icon={<BarChart3 className="w-5 h-5" />}
                  label="Sales Analytics"
                  active={activeTab === 'sales'}
                  onClick={() => setActiveTab('sales')}
               />
            </nav>

            <div className="p-4 mt-auto space-y-1">
               <SidebarLink
                  icon={<Settings className="w-5 h-5" />}
                  label="System Settings"
                  active={activeTab === 'settings'}
                  onClick={() => setActiveTab('settings')}
               />
               <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-all font-bold text-sm"
               >
                  <LogOut className="w-5 h-5" /> Logout Session
               </button>
            </div>
         </aside>

         {/* Main Content */}
         <main className="flex-1 flex flex-col h-screen overflow-hidden">
            {/* Top Head */}
            <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#111112]/20 backdrop-blur-md shrink-0">
               <div className="flex items-center gap-4 flex-1">
                  {/* Global Search space reserved for future implementation */}
               </div>

               <div className="flex items-center gap-6">
                  <div className="relative cursor-pointer hover:bg-white/5 p-2 rounded-full transition-colors">
                     <Bell className="w-5 h-5 text-white/50" />
                     <span className="absolute top-1 right-1 w-2 h-2 bg-[#c9a962] rounded-full" />
                  </div>
                  <div className="h-8 w-px bg-white/5" />
                  <div className="flex items-center gap-3">
                     <div className="text-right">
                        <p className="text-sm font-bold text-white">{user?.name || 'Staff Member'}</p>
                        <p className="text-[10px] font-black text-[#c9a962] uppercase tracking-tighter">{user?.role || 'Authorized Personnel'}</p>
                     </div>
                     <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c9a962] to-[#b09452] p-0.5">
                        <div className="w-full h-full rounded-full bg-[#0a0a0b] flex items-center justify-center font-outfit font-black text-xs">
                           MH
                        </div>
                     </div>
                  </div>
               </div>
            </header>

            {/* Scrollable View Area */}
            <div className="flex-1 overflow-y-auto p-8 no-scrollbar bg-gradient-to-b from-white/[0.02] to-transparent">
               {(activeTab === 'overview' || activeTab === 'sales') && <AnalyticsDashboard />}
               {activeTab === 'inventory' && <InventoryManager />}
               {activeTab === 'customers' && <CustomerManager />}
               {activeTab === 'orders' && <OrderManager />}
               {activeTab === 'settings' && (
                  <div className="h-full flex flex-col items-center justify-center opacity-50">
                     <h3 className="text-4xl font-outfit font-black mb-2 uppercase tracking-tighter">System Settings</h3>
                     <p className="text-xs font-black text-[#c9a962] uppercase tracking-widest">Configuration module encrypted.</p>
                  </div>
               )}
            </div>
         </main>
      </div>
   )
}

function SidebarLink({ icon, label, active, onClick }) {
   return (
      <button
         onClick={onClick}
         className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${active
               ? 'bg-[#c9a962] text-black shadow-lg shadow-[#c9a962]/20'
               : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
      >
         {icon} {label}
      </button>
   )
}
