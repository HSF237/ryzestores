import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, MapPin, Package, Settings, LogOut, ChevronRight, Plus, Loader2, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { userService } from '../services/firebaseService'
import OptimizedImage from '../components/OptimizedImage'

export default function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [activeTab, setActiveTab] = useState(() => {
    const hash = window.location.hash.replace('#', '')
    return ['profile', 'orders', 'addresses'].includes(hash) ? hash : 'profile'
  })

  const [profileData, setProfileData] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    const fetchData = async () => {
      try {
        const [profileDataResult, addressesData] = await Promise.all([
          userService.getProfile(),
          userService.getAddresses()
        ])
        setProfileData(profileDataResult)
        setAddresses(addressesData)
      } catch (err) {
        console.error('Failed to fetch profile data', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, navigate])

  useEffect(() => {
    const hash = location.hash.replace('#', '')
    if (['profile', 'addresses'].includes(hash)) {
      setActiveTab(hash)
    }
  }, [location.hash])

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setIsUpdating(true)
    try {
      const data = await userService.updateProfile(profileData)
      setProfileData(data)
      alert('Profile updated successfully!')
    } catch (err) {
      console.error('Update failed', err)
    } finally {
      setIsUpdating(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-[#c9a962] animate-spin" />
    </div>
  )

  const TABS = [
    { id: 'profile', label: 'Identity', icon: <User className="w-4 h-4" /> },
    { id: 'addresses', label: 'Places', icon: <MapPin className="w-4 h-4" /> },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white pb-20 pt-28 sm:pt-36">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Identity & Protocol Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 glass p-8 rounded-[3rem] border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#c9a962]/5 blur-3xl rounded-full" />

          <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10 w-full md:w-auto">
            <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-[#c9a962] to-[#b09452] p-0.5 shadow-2xl shadow-[#c9a962]/20 group-hover:rotate-6 transition-transform">
              <div className="w-full h-full rounded-[2.4rem] bg-[#1a1a1c] flex items-center justify-center overflow-hidden">
                {profileData?.avatar ? (
                  <OptimizedImage src={profileData.avatar} alt={profileData?.name} width={100} quality={70} wrapperClassName="w-full h-full" />
                ) : (
                  <span className="text-4xl font-black text-[#c9a962]">{profileData?.name?.[0]}</span>
                )}
              </div>
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl font-outfit font-black uppercase tracking-tighter leading-none">{profileData?.name}</h1>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                <span className="px-2 py-0.5 rounded-lg bg-[#c9a962]/10 text-[#c9a962] font-black text-[9px] uppercase tracking-widest border border-[#c9a962]/20">{profileData?.role || 'CUSTOMER'}</span>
                <span className="text-white/20 font-bold uppercase text-[9px] tracking-widest">• ryze MEMBER</span>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/20 transition-all font-black text-[10px] uppercase tracking-widest w-full md:w-auto justify-center"
          >
            <LogOut className="w-4 h-4" /> End Session
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Sidebar Navigation */}
          <div className="lg:col-span-3 space-y-2">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${activeTab === tab.id ? 'bg-[#c9a962] text-black shadow-xl shadow-[#c9a962]/20' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                  }`}
              >
                <div className="flex items-center gap-3">
                  {tab.icon}
                  <span className="text-xs font-black uppercase tracking-widest">{tab.label}</span>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === tab.id ? '' : 'group-hover:translate-x-1'}`} />
              </button>
            ))}
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-[#111113] rounded-[2.5rem] border border-white/5 p-8 sm:p-12 shadow-2xl"
                >
                  <h3 className="text-2xl font-outfit font-black uppercase tracking-tighter mb-8">Personal Details</h3>
                  <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Display Name</label>
                      <input
                        className="w-full bg-white/2 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-[#c9a962]/50 outline-none transition-all"
                        value={profileData?.name || ''}
                        onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Email Identity</label>
                      <input
                        disabled
                        className="w-full bg-white/1 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white/20 cursor-not-allowed"
                        value={profileData?.email || ''}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Phone Primary</label>
                      <input
                        className="w-full bg-white/2 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-[#c9a962]/50 outline-none transition-all"
                        value={profileData?.phone || ''}
                        onChange={e => setProfileData({ ...profileData, phone: e.target.value })}
                      />
                    </div>

                    <div className="sm:col-span-2 pt-6">
                      <button
                        type="submit"
                        disabled={isUpdating}
                        className="w-full h-16 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#c9a962] transition-all flex items-center justify-center gap-2"
                      >
                        {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Modifications'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {activeTab === 'addresses' && (
                <motion.div
                  key="addresses"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-outfit font-black uppercase tracking-tighter">Saved Places</h3>
                    <button
                      onClick={() => navigate('/checkout')} // Temporary logic to use checkout form
                      className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#c9a962] text-black text-[10px] font-black uppercase tracking-widest"
                    >
                      <Plus className="w-4 h-4" /> Add Placement
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {addresses.map(addr => (
                      <div key={addr._id} className={`p-8 rounded-[2rem] bg-[#111113] border transition-all ${addr.isDefault ? 'border-[#c9a962]/40 bg-[#c9a962]/5' : 'border-white/5 hover:border-[#c9a962]/30'}`}>
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-[#c9a962]" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/80">{addr.label}</span>
                          </div>
                          {addr.isDefault && <CheckCircle2 className="w-5 h-5 text-[#c9a962]" />}
                        </div>
                        <p className="text-sm font-bold text-white mb-2">{addr.street}</p>
                        <p className="text-xs text-white/40 leading-relaxed">{addr.city}, {addr.state} - {addr.zip}</p>
                        <div className="mt-8 pt-6 border-t border-white/5 flex gap-4">
                          <button className="text-[10px] font-black uppercase tracking-widest text-[#c9a962] hover:text-white transition-colors">Edit</button>
                          <button className="text-[10px] font-black uppercase tracking-widest text-red-500/50 hover:text-red-500 transition-colors">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {addresses.length === 0 && (
                    <div className="bg-[#111113] py-24 rounded-[3rem] border-2 border-dashed border-white/5 flex flex-col items-center justify-center opacity-50">
                      <MapPin className="w-16 h-16 mb-4" />
                      <p className="font-black text-xs uppercase tracking-widest">Your placement list is empty</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
